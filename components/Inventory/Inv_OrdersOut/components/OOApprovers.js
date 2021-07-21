import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails, Select} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';
import cogoToast from 'cogo-toast';
import moment from 'moment';

import Util from  '../../../../js/Util';
import Settings from '../../../../js/Settings'
import InventoryOrdersOut from  '../../../../js/InventoryOrdersOut';
import { ListContext } from '../InvOrdersOutContainer';
import { DetailContext } from '../InvOrdersOutContainer';

import clsx from 'clsx';
import DeleteIcon from '@material-ui/icons/Delete';
import _ from 'lodash';
import { InventoryContext } from '../../InventoryContainer';
//import OrdersOutItemList from '../components/OrdersOutItemList';



const OOApprovers = function(props) {
    const { orderApprovers, setOrderApprovers} = props;

    const { ordersOut, setOrdersOut, setOrdersOutRefetch,currentView, setCurrentView, views,columnState, setColumnState,detailOrderOutId,
        editOrderOutModalMode,setEditOrderOutModalMode, activeOrderOut, setActiveOrderOut, editOrderOutModalOpen,setEditOrderOutModalOpen} = useContext(ListContext);

    const { user,currentView: invCurrentView } = useContext(InventoryContext);

    const [approvalUserToAdd, setApprovalUserToAdd] = useState(0)
    const [approvalTierToAdd, setApprovalTierToAdd] = useState(0)
    const [raineyUsers, setRaineyUsers] = useState(null)

    const classes = useStyles();

    const fields = [
        {field: 'delete', label: '', width: '10%',
            format: (value, row)=> <DeleteIcon className={classes.icon} onClick={(event)=>handleDeleteApprover(row)}/> },
        {field: 'displayName', label: 'Name', width: '25%'},
        {field: 'tier', label: 'Tier', width: '15%'},
        {field: 'status', label: 'Status', width: '35%',
            format: (value, row)=> handleGetApproverStatus(row)},
        {field: 'date_entered', label: 'Added', width: '15%',
            format: (value,row)=> moment(value).format('MM/DD/YYYY')}
    ]

    useEffect(()=>{
        if(raineyUsers == null){
          Settings.getGoogleUsers()
          .then((data)=>{
            setRaineyUsers(data);
          })
          .catch((error)=>{
            cogoToast.error("Failed to get rainey users");
            console.error("failed to get rainey users", error)
          })
        }
    },[raineyUsers])

    const handleGetOrderStatus = (activeOrderOut) =>{
        return "Awaiting Approval"
    }

    const handleUpdateApproveItem = (event, value, row) =>{
        if(value === row.status){
            console.log("No change in status");
            return;
        }
        let updateItem = {...row, status: value}
        let nav_item = {page: '/inventory', current_view: invCurrentView.value , sub_current_view: currentView.value ,
                 detail_id: detailOrderOutId, type: 'orderOutApprover'}

        InventoryOrdersOut.updateOrderOutApprover(updateItem, nav_item, user)
        .then((data)=>{
            console.log("Update data", data);
            cogoToast.success("Updated Approve Item")
            setOrderApprovers(null);
        })
        .catch((error)=>{
            console.error(" Update data Failed to either update approve item or notification failed", error);
            cogoToast.error("Internal Server Error");
            setOrderApprovers(null);
        })
    }

    const handleGetApproverStatus = (row) =>{
        if(row.googleId === user.googleId){
            //show buttons instead
            return(
                <div className={classes.approveButtonsDiv}>
                    {row.status != 1 ? <div className={clsx({[classes.approveApproverButton]: true})} 
                         onClick={(event)=>handleUpdateApproveItem(event, 1, row)}>
                            <span>Approve</span>
                    </div> : <div><span className={classes.approvedSpan}>Approved</span></div>}
                    {row.status != 2 ?<div className={clsx({[classes.rejectApproverButton]: true})} 
                         onClick={(event)=>handleUpdateApproveItem(event, 2, row)}>
                             <span>Reject</span>
                    </div>: <div><span className={classes.rejectedSpan}>Rejected</span></div>}
                </div>
            )
        }else{
            if(row.status == 1){
                return "Approved";
            }
            if(row.status == 2){
                return "Rejected";
            }
            let approvers = orderApprovers.sort((a, b) => a.tier-b.tier);
            let test = approvers.filter((item)=>{
                if(item.tier < row.tier && item.id != row.id){
                    if(item.status === 1){
                        return false;
                    }
                    if(item.status ===2){
                        //console.log("Return true for rejected")
                        return true;
                    }
                    //console.log("Return true for waiting")
                    return true;
                }
                return false;
            })
    
            if(test?.length > 0){
                return "Waiting..."
            }else{
                return "Pending...(resend)"
            }
        }
        

        return "Error"
    }

    const handleChangeUserToAdd  = (value) =>{
        setApprovalUserToAdd(value);
    }
    const handleChangeTierToAdd = (value)=>{
        setApprovalTierToAdd(value);
    }

    const handleDeleteApprover = (row) =>{
        if(!row){
            cogoToast.error("Bad approver to delete");
            return;
        }
    
        const deleteSlip = ()=>{
        InventoryOrdersOut.deleteOrderOutApprover(row.id, user)
        .then((data)=>{
            setOrderApprovers(null);
        })
        .catch((error)=>{
            cogoToast.error("Failed to delete Approver");
            console.error("Failed to delete Approver", error);
        })
        }

        confirmAlert({
        customUI: ({onClose}) => {
            return(
                <ConfirmYesNo onYes={deleteSlip} onClose={onClose} customMessage={"Remove approver?"}/>
            );
        }
        })
    }

    const handleAddApprover = () =>{
        if(approvalTierToAdd == 0 ){
            cogoToast.error("Please select a tier")
            return;
        }
        if(approvalUserToAdd == 0 ){
            cogoToast.error("Please select a user")
            return;
        }
        
        let approval = {order_id: detailOrderOutId, googleId: approvalUserToAdd, tier: approvalTierToAdd }
        let nav_item = {page: '/inventory', current_view: invCurrentView.value , sub_current_view: currentView.value , detail_id: detailOrderOutId, type: 'orderOutApprover'}

        InventoryOrdersOut.addNewOrderOutApprover(approval, nav_item)
        .then((data)=>{
            setOrderApprovers(null);
            setApprovalTierToAdd(0);
            setApprovalUserToAdd(0);
        })
        .catch((error)=>{
            cogoToast.error("Failed to add new Approver");
            console.error("Failed to add new Approver", error);
        })
    }

    

    return ( <>
        {/* <div className={classes.statusDiv}>
         <span className={classes.subLabelSpan}>STATUS</span>
         <span className={classes.statusSpan}>{handleGetOrderStatus(activeOrderOut)}</span>  
        </div> */}
        <div className={classes.approverContainer}>
            <div className={classes.approverTitleDiv}><span className={classes.subLabelSpan}>Approvers</span></div>
            <div className={classes.approversDiv}>
            {/*head item*/}
            <div className={classes.approverHeadItemDiv}>
                    {fields.map((field)=>{
                        return(
                            <span key={`head_${field.field}`} style={{flexBasis: `${field.width}`, textAlign: 'center'}}>{field.label }</span>
                        )
                    })}
            </div>
            {/*end of head item*/}
            { orderApprovers?.length > 0 ? orderApprovers.map((item)=>{
                return (
                <div key={`item_${item.id}`} className={classes.approverItemDiv}>
                    {fields.map((field)=>{
                        return(
                            <span key={`item_${field.field}`} style={{flexBasis: `${field.width}`, textAlign: 'center'}}>{field.format ? field.format(item[field.field], item) : item[field.field]}</span>
                        )
                    })}
                </div>
                )
            }) : <>No approvers yet</>}
            </div>
            <div className={classes.addApproverDiv}>
                <div className={classes.inputValueSelect}>
                <Select
                    id={'approval_user_select'}
                    value={approvalUserToAdd}
                    className={classes.inputSelect}
                    onChange={(event) => handleChangeUserToAdd(event.target.value)}
                    native
                >
                    <option value={0}>
                        User
                    </option>
                    {raineyUsers && raineyUsers.map((item)=>{
                        return (
                            <option key={item.user_id} value={item.user_id}>
                                {item.name}
                            </option>
                        )
                    })}
                </Select></div>
                <div className={classes.inputValueSelect}>
                <Select
                    id={'approval_tier_select'}
                    value={approvalTierToAdd}
                    className={classes.inputSelect}
                    onChange={(event) => handleChangeTierToAdd(event.target.value)}
                    native
                >
                    <option value={0}>
                        Tier
                    </option>
                    {(()=>{
                        let allTiers = _.uniqBy(orderApprovers, 'tier').map((item)=>item.tier).sort((a, b) => a-b)
                        if(allTiers?.length > 0 ){
                            allTiers.push(allTiers[allTiers.length-1]+1)  ;
                        } else{
                            allTiers = [1];
                        }
                        return allTiers.map((item)=> 
                            <option key={item} value={item}>
                                {item}
                            </option>
                        )
                    })()}
                </Select></div>
                <div className={classes.inputValueSelect}>
                    <div className={classes.addApproverButton} onClick={handleAddApprover}><span>Add</span></div>
                </div>
            </div>
        </div>                    
    </>);
    }

export default OOApprovers



const useStyles = makeStyles(theme => ({

    statusDiv:{
        padding: '10px 15px',
        borderBottom: '1px solid #ddd',
    },
    subLabelSpan:{

        fontFamily: 'arial',
        fontSize: '1.6em',
        fontWeight: '600',
        color: '#444',
        margin: '-5px 10px 10px 10px',
    },
    statusSpan:{
        fontFamily: 'sans-serif',
        fontSize: '1.6em',
        fontWeight: '500',
        color: '#444',
        margin: '-5px 10px 10px 10px',
    },
    approverContainer:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '5px 5px',
        padding: '5px',

    },
    approverTitleDiv:{
        padding: '5px',
        margin: '5px',
    },
    approversDiv:{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5px 5px 5px 5px',
        boxShadow: 'inset 0px 0px 3px 0px #777',
        background: '#eee',
        minWidth: 500,
        minHeight: 60,
        borderRadius: 3,
        padding: '7px'
        
    },
    approverItemDiv:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2px 0px',
        margin: '1px 0px',
        cursor: 'default',
        background: '#fff',

    },
    approverHeadItemDiv:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2px 0px',
        margin: '1px 0px',
        color: '#fff',
        fontWeight: '600',
        fontFamily: 'arial',
        background: '#26486c',
    },
    approverItemDivSelected:{
        background: '#0022dd',
    },
    icon:{
        width: '.8em',
        height: '.8em',
        cursor: 'pointer',
        color: '#555',
        '&:hover':{
            color: '#222',
        }
    },
    addApproverDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
        marginTop: 18
    },
    inputValueSelect:{
        margin: '5px 10px',
    },
    addApproverButton:{
        padding: '3px 6px',
        margin: '0px 5px',
        borderRadius: '3px',
        background: '#eee',
        border: '1px solid #9f9f9f',
        cursor: 'pointer',
        '&:hover':{
        border: '1px solid #777',
        },
        fontSize: '1em',
        fontFamily: 'arial',
        fontWeight: '600',
        color: '#444'
    },
    approveButtonsDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveApproverButton:{
        padding: '3px 6px',
        margin: '0px 5px',
        borderRadius: '3px',
        color: '#fff',
        border: '1px solid #9f9f9f',
        cursor: 'pointer',
        '&:hover':{
        border: '1px solid #777',
        },
        fontSize: '1em',
        fontFamily: 'arial',
        fontWeight: '600',
        background: '#0d8d02'
    },
    rejectApproverButton:{
        padding: '3px 6px',
        margin: '0px 5px',
        borderRadius: '3px',
        color: '#fff',
        border: '1px solid #9f9f9f',
        cursor: 'pointer',
        '&:hover':{
        border: '1px solid #777',
        },
        fontSize: '1em',
        fontFamily: 'arial',
        fontWeight: '600',
        background: '#bb3333',
    },
    approvedSpan:{
        fontSize: '1em',
        fontFamily: 'arial',
        fontWeight: '600',
        color: '#116e04',
        cursor: 'default',
        padding: '3px 6px',
        margin: '0px 5px',
    },
    rejectedSpan:{
        fontSize: '1em',
        fontFamily: 'arial',
        fontWeight: '600',
        color: '#992211',
        cursor: 'default',
        padding: '3px 6px',
        margin: '0px 5px',
    },
    inputSelect:{
        fontFamily: 'arial',
        fontWeight: '500',
        color:'#555',
    }
//End Table Stuff
}));