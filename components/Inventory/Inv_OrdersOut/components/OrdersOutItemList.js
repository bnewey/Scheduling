import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails,Checkbox,
     TextField,Select, IconButton} from '@material-ui/core';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import PDFIcon from '@material-ui/icons/PictureAsPdf';
import LinkIcon from '@material-ui/icons/Link';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
    ViewPDF: forwardRef((props, ref) => <PDFIcon {...props} ref={ref} />),
};

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import MaterialTable, {MTableBodyRow, MTableCell} from "material-table";

import cogoToast from 'cogo-toast';
import moment from 'moment';

import Util from  '../../../../js/Util';
import InventoryOrdersOuts from  '../../../../js/InventoryOrdersOut';
import AddEditOrdersOutItemDialog from './AddEditOrdersOutItemDialog';
import { ListContext } from '../InvOrdersOutContainer';
import { Add } from '@material-ui/icons';
//import { DetailContext } from '../InvOrdersOutsContainer';

const OrdersOutItemList = function(props) {
    const {user, ordersOut, resetFunction} = props;

    const {currentView} = useContext(ListContext);
    const classes = useStyles();
    const [ordersOutItems, setOrdersOutItems] = React.useState(null);
    const [addEditOrdersOutItemOpen, setEditOrdersOutItemOpen] =React.useState(false);

    const columns = [
        // { field: 'id', title: 'ID', minWidth: 20, align: 'center', editable: 'never' },
        { field: 'rainey_id', title: 'Rainey ID', minWidth: 80, align: 'center', editable: 'never' ,
        render: rowData => <div className={classes.urlSpan} onClick={event => handleGoToPart(event,rowData.rainey_id)}>{rowData.rainey_id}</div>    },
        { field: 'description', title: 'Description', minWidth: 80, align: 'center', editable: 'never' ,
        render: rowData => <div className={classes.notesSpan}>{rowData.description}</div>,     },
        { field: 'man_name', title: 'Manf', minWidth: 80, align: 'center', editable: 'never'      },
        { field: 'mf_part_number', title: 'Manf #', minWidth: 80, align: 'center', editable: 'never' ,
        render: rowData => <div className={classes.notesSpan}>{rowData.mf_part_number}</div>,     },
        { field: 'qty_in_set', title: 'Qty In OrdersOut', minWidth: 25, align: 'center', editable: 'onUpdate',
          render: rowData => rowData.qty_in_set,
          editComponent: props => (
            <TextField id={`qty_input`} 
                type="number"
                variant="standard"
                value={props && props.value}
                classes={{root: classes.inputRoot}}
                onChange={(event) => props.onChange(event.target.value)}  />
          )},
        { field: 'date_updated', title: 'Date Updated', minWidth: 80, align: 'center', editable: 'never'   },
        { field: 'url', title: 'Url', minWidth: 80, align: 'center', editable: 'never',
          render: rowData => rowData.url ? <div className={classes.urlSpan} ><a href={rowData.url}  target="_blank"><LinkIcon/></a></div> : <></>,
        }
      ];

    //OrdersOut manufacturing Data
    useEffect( () =>{
        if(ordersOutItems == null && ordersOut) {
            
            InventoryOrdersOuts.getOrdersOutItems(ordersOut.rainey_id)
            .then( data => { setOrdersOutItems(data); })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error getting wois`, {hideAfter: 4});
                setOrdersOutItems([]);
            })
        }
    },[ordersOutItems, ordersOut]);

    const handleUpdateOrdersOutItem = (newData, oldData) => {
        return new Promise((resolve, reject)=>{
            Inventory.updateOrdersOutItem(newData)
            .then((data)=>{
                cogoToast.success("Updated OrdersOut  Item");
                if(resetFunction){
                    resetFunction();
                }
                setOrdersOutItems(null);
                resolve();
            })
            .catch((error)=>{
                console.error("Failed to update OrdersOut  Item", error);
                cogoToast.error("Failed to update OrdersOut  Item");
                if(resetFunction){
                    resetFunction();
                }
                setOrdersOutItems(null);
                reject();
            })
        })
    }   

    const handleDeleteItem = (row)=>{
        if(!row.id){
          cogoToast.error("Bad row in delete ordersOut item");
          console.error("Failed to delete ordersOut item");
          return;
        }
        const deleteItem = ()=>{
          InventoryOrdersOuts.deleteOrdersOutItem(row.id)
          .then((data)=>{
            if(data){
                if(resetFunction){
                    resetFunction();
                }
                setOrdersOutItems(null);
              cogoToast.success("Deleted ordersOut item");
            }
          })
          .catch((error)=>{
              
            cogoToast.error("Failed to delete ordersOut item")
            console.error("Failed to delete ordersOut item", error);
            if(resetFunction){
                resetFunction();
            }
            setOrdersOutItems(null);
          })
        }

        confirmAlert({
          customUI: ({onClose}) => {
              return(
                  <ConfirmYesNo onYes={deleteItem} onClose={onClose} customMessage={"Remove manufacturing item?"}/>
              );
          }
        })
  
    }
    
    const handleAddNewItem = (event,)=>{
        if( !ordersOut){
            console.error("Bad rowData or ordersOut in handleAddNewItem")
            return;
        }

        setEditOrdersOutItemOpen(true);
    }

    const handleGoToPart = (event, rainey_id)=>{
        //ordersOut detailWOIid in local data
     window.localStorage.setItem('detailPartId', JSON.stringify(rainey_id));
     
     //set detail view in local data
     window.localStorage.setItem('currentInvPartsView', JSON.stringify("partsDetail"));
     window.localStorage.setItem('currentInventoryView', JSON.stringify("invParts"));
     
     window.open('/scheduling/inventory', "_blank");

   }

    return ( 
        <>

        {ordersOut ?
            <div className={classes.container}>
                
            <Grid container>
                    <Grid item xs={12}>
                        <div className={classes.tableDiv}>
                        { ordersOutItems &&
                            <MaterialTable 
                                columns={columns}
                                style={{ width: "inherit"}}
                                data={ordersOutItems}
                                title={"OrdersOut List"}
                                editable={{
                                    onRowUpdate: (newData, oldData) => handleUpdateOrdersOutItem(newData, oldData)
                                }}
                                icons={tableIcons}
                                options={{
                                    filtering: false,
                                    paging: false,
                                    search: false,
                                    draggable: false,
                                    toolbar: false,
                                    showTitle: false,
                                    headerStyle:{
                                    fontSize: '14px',
                                    fontFamily: 'sans-serif',
                                    borderRight: '1px solid #c7c7c7' ,
                                    '&:lastChild' :{
                                        borderRight: 'none' ,
                                    },
                                    background: 'linear-gradient(0deg, #cecece, #ededed)',
                                    fontWeight: 600,
                                    color: '#444',
                                    padding: '5px',
                                    zIndex: 0,
                                    },
                                    // actionsColumnIndex: -1,
                                    cellStyle: {
                                        fontSize: '13px',
                                        fontFamily: 'sans-serif',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        borderLeft: '1px solid #c7c7c7' ,
                                        padding: "5px",
                                    },
                                        actionsCellStyle:{
                                        background: '#ffefdd'
                                    },
                                }} 
                                actions={[
                                {
                                    icon: tableIcons.Delete,
                                    tooltip: 'Delete OrdersOut Item',
                                    onClick: (event, rowData) => handleDeleteItem(rowData)
                                },
                                ]}
                                
                            />
                            }

                        </div>
                    </Grid>
                    <div className={classes.bottomDiv}><IconButton className={classes.iconButton}
                onClick={(event) => handleAddNewItem(event)} ><Add 
                />Add New </IconButton></div>
                </Grid>
                <AddEditOrdersOutItemDialog ordersOut={ordersOut} addEditOrdersOutItemOpen={addEditOrdersOutItemOpen} setEditOrdersOutItemOpen={setEditOrdersOutItemOpen} setOrdersOutItems={setOrdersOutItems} />
            </div>
        :<><CircularProgress/></>}

        </>
    );
}

export default OrdersOutItemList


const useStyles = makeStyles(theme => ({
    root:{

    },
    tableDiv:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxHeight: '400px',
        flexWrap: 'wrap',
        width: '-webkit-fill-available',
    },
    notesSpan:{
        maxWidth: '150px',
        whiteSpace: 'pre-wrap',
        fontSize: '10px',
        maxHeight: '50px',
        overflowY: 'scroll',
        overflowX: 'hidden',
    },
    urlSpan:{
        cursor: 'pointer',
        textDecoration: 'underline',
        color: '#0055ff',
    },
    iconButton:{
        padding: '5px 10px',
        '& svg':{
            height: '1.4em',
            width: '1.4em'
        },
        background: '#dbdbdb',
        border: '1px solid #a5a5a5',
        borderRadius: '2px',
        '&:hover':{
            background: '#d4e9f3',
        }
    },
    bottomDiv:{
        width: '100%',
        textAlign: 'right',
        marginTop: '2%',
        marginRight: '2%'
    }

}));