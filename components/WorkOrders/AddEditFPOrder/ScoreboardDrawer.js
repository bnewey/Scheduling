import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, List, ListItem, ListItemText, CircularProgress, Checkbox, InputBase, IconButton, Button} from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import cogoToast from 'cogo-toast';
import { FixedSizeList } from 'react-window';

import dynamic from 'next/dynamic'
const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

import Util from '../../../js/Util.js';
import WorkOrderDetail from  '../../../js/WorkOrderDetail';

import Settings from  '../../../js/Settings';
import { ListContext } from '../WOContainer';
import { DetailContext } from '../WOContainer';



const ScoreboardDrawer = function(props) {
    const {user, scbdDrawerOpen, setScbdDrawerOpen, handleInputOnChange, fpScbdFields, getInputByType, activeFPOrderItem, setActiveFPOrderItem,
        fpOrderItems, setFPOrderItems, scbdMode, setScbdMode} = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const {fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder, workOrderItems, setWorkOrderItems,fpOrderModalOpen,
        setFPOrderModalOpen, vendorTypes, shipToOptionsWOI, setShipToOptionsWOI} = useContext(DetailContext)

    const classes = useStyles();

    const [errorFields,setErrorFields] = useState([]);

    //Building an object of refs to update text input values instead of having them tied to state and updating every character
    const buildRefObject = arr => Object.assign({}, ...Array.from(arr, (k) => { return ({[k]: useRef(null)}) }));
    
    const [ref_object, setRef_Object] = React.useState(buildRefObject(fpScbdFields.map((v)=> v.field)));
     
    const handleSave = fpoItem => {
        console.log("Trying to save");
        if(!fpoItem){
            console.error("Bad work order item")
            return;
        }
       
        
 
        
        var updateFPOItem = {...fpoItem};

        //Create Object with our text input values using ref_object
        const objectMap = (obj, fn) =>
            Object.fromEntries(      Object.entries(obj).map( ([k, v], i) => [k, fn(v, k, i)]  )        );
        var textValueObject = objectMap(ref_object, v => v.current ? v.current.value ? v.current.value : null : null );

        console.log("ref",textValueObject);
        console.log("Fields", fpScbdFields);

        //Get only values we need to updateTask()
        fpScbdFields.forEach((field, i)=>{
            const type = field.type;
            switch(type){
                case 'text':
                    //Get updated values with textValueObject bc text values use ref
                    if(textValueObject[field.field])
                        updateFPOItem[field.field] = textValueObject[field.field];
                    break;
                case 'number':
                        //Get updated values with textValueObject bc number values use ref
                        if(textValueObject[field.field])
                        updateFPOItem[field.field] = parseInt(textValueObject[field.field]);
                    break;
                case 'date':
                    if(textValueObject[field.field])
                        updateFPOItem[field.field] = Util.convertISODateToMySqlDate(textValueObject[field.field]);
                    break;
                default:
                    //Others are updated with fpoItem (activeFPOrderItem) state variable
                    if(fpoItem[field.field])
                        updateFPOItem[field.field] = fpoItem[field.field];
                    break;
            }
        })

        console.log("UPDATE", updateFPOItem);
        

        //Validate Required Fields
        var empty_required_fields = fpScbdFields.
                filter((v,i)=> v.required && !(v.hidden && v.hidden(activeFPOrderItem) )).
                filter((item)=> updateFPOItem[item.field] == null || updateFPOItem[item.field] == undefined);;
        if(empty_required_fields.length > 0){
            cogoToast.error("Required fields are blank");
            setErrorFields(empty_required_fields);
            console.error("Required fields are blank", empty_required_fields)
            return;
        }
        
        //Add Id to this new object
        if(scbdMode == "edit"){
            updateFPOItem["record_id"] = fpoItem.record_id;
            //edit and refetch
            if(fpOrderModalMode =="edit"){
                WorkOrderDetail.updateFPOrderItem(updateFPOItem)
                .then((data)=>{
                    if(data){
                        //refetch
                        setFPOrderItems(null);
                        handleCloseScbdDrawer();
                    }
                })
                .catch((error)=>{
                    cogoToast.error("Failed to update existing item");
                    console.error("Failed to update existing item", error)
                })
            }
            //set items to state and we will add items with FP order later
            if(fpOrderModalMode == "add"){
                var index;
                var items = fpOrderItems ? [...fpOrderItems] : [];
                var itemToUpdate = items.find((item,i)=> { 
                    if(item.record_id == activeFPOrderItem.record_id){
                        index = i;
                        return true;
                    }else{
                        return false;
                    }
                    
                })

                if(itemToUpdate){
                    items.splice(index, 1, itemToUpdate);
                }

                console.log("Items to update to ", items)
                //set items and we will save these on FP order save
                setFPOrderItems(items);
                handleCloseScbdDrawer();
            }
            
            
        }
        if(scbdMode == "add"){
            updateFPOItem["fairplay_order"] = activeFPOrder.record_id;

            if(fpOrderModalMode =="edit"){
                //record_id exists so we can add item immediately
                WorkOrderDetail.addNewFPOrderItem(updateFPOItem)
                .then((data)=>{
                    if(data){
                        //refetch
                        setFPOrderItems(null);
                        handleCloseScbdDrawer();
                    }
                })
                .catch((error)=>{
                    cogoToast.error("Failed to add item");
                    console.error("Failed to add item", error)
                })

            }
            if(fpOrderModalMode =="add"){
                //add later
                var index;
                var items = fpOrderItems ? [...fpOrderItems] : [];
                var itemToUpdate = items.find((item,i)=> { 
                    if(item.record_id == activeFPOrderItem.record_id){
                        index = i;
                        return true;
                    }else{
                        return false;
                    }
                    
                })

                if(itemToUpdate){
                    items.splice(index, 1, itemToUpdate);
                }

                console.log("Items to update to ", items)
                //set items and we will save these on FP order save
                setFPOrderItems(items);
                handleCloseScbdDrawer();

            }
            var items = fpOrderItems ? [...fpOrderItems, updateFPOItem] : [updateFPOItem];
            setFPOrderItems(items);
            handleCloseScbdDrawer();

        }
        
    };

    const handleDeleteItem = (item)=>{
        if(!item ||  !item.record_id){
            console.error("Bad id or item to delete");
            return;
        }

        WorkOrderDetail.deleteFPOrderItem(item.record_id)
        .then((data)=>{
            if(data){
                setWorkOrderItems(null)
                handleCloseScbdDrawer();
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to delete item");
            console.error("Failed to delete item", error)
        })
    }
    
    const handleCloseScbdDrawer = () =>{
        setScbdDrawerOpen(false);
        setActiveFPOrder({});
        setErrorFields([]);
    }

    
  


    return(
        <div className={classes.root}>
            <div className={classes.absCloseButton}>
                <IconButton type="submit"  aria-label="clear-search" onClick={event=> handleCloseScbdDrawer()}>
              <ClearIcon />
            </IconButton></div>
            <div className={classes.titleDiv}>
                <span className={classes.titleSpan}>Add Scoreboard</span>
            </div>

            <div className={classes.listDiv}>
                <>
                {fpScbdFields.map((field, i)=>{
                                if(field?.hidden && field.hidden(activeFPOrderItem)){
                                    return (<></>);
                                }
                                return(
                                <div className={classes.inputDiv}>  
                                    <span className={classes.inputLabel}>{field.label}</span>
                                    {getInputByType(field, ref_object)}
                                </div>)
                            })}  
                </>
            </div>
            <div className={classes.buttonDiv}>
                <Button variant="outlined" onClick={event => handleCloseScbdDrawer()}>Cancel</Button>
                { scbdMode == "edit" && <Button variant="outlined" onClick={event => handleDeleteItem(activeFPOrderItem)}>Delete</Button>}
                <Button variant="outlined" onClick={event => handleSave(activeFPOrderItem)}>Save</Button>
                
            </div>
        </div>
    )
}

export default ScoreboardDrawer

const useStyles = makeStyles(theme => ({
    root:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignContent: 'center',

    },
    titleDiv:{
        padding: '5px 10px',
        marginBottom: '3px',
        borderBottom: '1px solid #aaa'
    },
    titleSpan:{
        color: '#888',
        fontSize: 15,
        textTransform: 'uppercase',
        fontFamily: 'sans-serif',
    },
    entityListItem:{
        borderBottom: '1px solid #ddd',
        padding: '5px 9px',
        background: '#fcfcfc'
    },
    entityHeadItem:{
        
        padding: '2px 4px',
        '& span':{
            fontWeight: '600',
        },
        margin: '0px 0px', 
    },
    entityDiv:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    entityNameSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '50%',
        textOverflow: 'ellipsis',
        fontWeight: '500',
    },
    entityCheckSpan:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignContent: 'center',
        flexBasis: '20%',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
    },
    entityIdSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '10%',
        textOverflow: 'ellipsis',
    },
    entityCountyOrParishSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '20%',
        textOverflow: 'ellipsis',
    },
    searchDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    searchInput:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        border:'1px solid #ccc',
        padding: '1% 2%',
        margin:'1% 2% 0% 2%',
        borderRadius: '20px',
    },
    searchLabel:{
        fontSize: 11,
        fontWeight: 600,
        color: '#666',
        marginRight: 7,
        
    },
    iconButton:{
        padding: '5px'
    },
    absCloseButton:{
        position: 'absolute',
        top:'10px',
        left: '10px',
    },
    inputDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        minHeight: '25px',
    //   padding: '4px 0px 4px 0px',
        borderBottom: '1px solid #eee'
    },
    inputLabel:{
        flexBasis: '30%',
        textAlign: 'right',
        marginRight: '35px',
        fontSize: '15px',
        color: '#787878',
    },
}));
