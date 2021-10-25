import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton,Accordion, AccordionSummary, AccordionDetails,
  Select, MenuItem,} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import EditIcon from '@material-ui/icons/Edit';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import cogoToast from 'cogo-toast';

import Util from  '../../../../../js/Util';
import Work_Orders from  '../../../../../js/Work_Orders';
import WorkOrderDetail from  '../../../../../js/WorkOrderDetail';
import clsx from 'clsx';

import { ListContext } from '../../../WOContainer';
import { DetailContext } from '../../../WOContainer';

import AddEditWOIModal from '../../../AddEditWOI/AddEditWOIModal';

const WOItemization = function(props) {

  const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
    currentView, previousView, handleSetView, views, activeWorkOrder, setEditWOModalOpen, raineyUsers, user} = useContext(ListContext);

  const {editWOIModalMode,setEditWOIModalMode, activeWOI, setActiveWOI, resetWOIForm, setResetWOIForm, workOrderItems, setWorkOrderItems,editWOIModalOpen,
        setEditWOIModalOpen, vendorTypes, shipToContactOptionsWOI} = useContext(DetailContext)

  const classes = useStyles();

  const [packingSlips, setPackingSlips] = React.useState(null);
  const [refetchWOI, setRefetchWOI] = React.useState(false);

  //WOI
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if((workOrderItems == null || refetchWOI) && activeWorkOrder) {
      if(refetchWOI){
        setRefetchWOI(false);
      }

      Work_Orders.getAllWorkOrderSignArtItems(activeWorkOrder.wo_record_id)
      .then( data => { setWorkOrderItems(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting wois`, {hideAfter: 4});
      })
    }
    // return(()=>{
    //   if(workOrderItems){
    //     setWorkOrderItems(null);
    //   }
    // })
  },[workOrderItems, activeWorkOrder, refetchWOI]);

  useEffect(()=>{
    if(currentView && currentView.value == "woItems"){
      setRefetchWOI(true);
    }
  },[currentView])

  //Packing SLips Data
  useEffect( () =>{
    if(packingSlips == null && activeWorkOrder) {
      
      WorkOrderDetail.getPackingSlipsById(activeWorkOrder.wo_record_id)
      .then( data => { setPackingSlips(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting packing slips`, {hideAfter: 4});
      })
    }
  },[packingSlips, activeWorkOrder]);

  

  const handleShowWOIView = (woi_id)=>{
    if(!woi_id){
      cogoToast.error("Failed to get work order item");
      console.error("Bad id");
      return;
    }
    
    var tmp = workOrderItems.find((v)=> v.record_id == woi_id) || -1;
    if(tmp){
      setActiveWOI(tmp);
      setResetWOIForm(true)
      console.log("WOI to edit", tmp);
      setEditWOIModalMode("edit");
      setEditWOIModalOpen(true)
    }else{
      cogoToast.error("Failed to open woi");
      console.error("Failed to open woi", error);
    }
    //(woi_id);
  }

  const handleRemovePackingSlip = (slip_id, woi_id)=>{
    //remove packing slip from woi
    if(!slip_id){
      console.error("Bad slip id");
      return;
    }

    WorkOrderDetail.removePackingSlipFromWOI(slip_id, woi_id, user)
    .then((data)=>{
      setWorkOrderItems(null);

    })
    .catch((error)=>{
      console.error("Failed to remove packing slip", error);
      cogoToast.error("Failed to remove packing slip");
    })

    
  }

  
  const columns = [
    {id: 'reorder', label: "", minWidth: 20, align: 'center',
      format: (value, row)=> {
          return(<>
            <IconButton   className={classes.reorderButton}  size="medium" aria-label="close_search" 
                    onClick={event=> reorder("up", row)}>
                  <ArrowDropUpIcon className={classes.reorderIcon} />
            </IconButton>
            <IconButton   className={classes.reorderButton}  size="medium" aria-label="close_search" 
                   onClick={event=> reorder("down", row)} >
                  <ArrowDropDownIcon className={classes.reorderIcon} />
            </IconButton>
            </>
          )
      }},
    { id: 'record_id', label: 'ID', minWidth: 20, align: 'center',
      format: (value, row)=> 
      <span onClick={()=>handleShowWOIView(value)} className={classes.clickableWOnumber}>{value}</span> 
    },
    { id: 'date_entered', label: 'Date Entered', minWidth: 80, align: 'center',
      format: (value,row)=> Util.convertISODateToMySqlDate(value) },
    {
      id: 'item_type',
      label: 'Item Type',
      minWidth: 50,
      align: 'left',
      //format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      minWidth: 50,
      align: 'left',
    },
    { id: 'part_number', label: 'Part Number', minWidth: 45, align: 'left' },
    { id: 'description', label: 'Description', minWidth: 350, align: 'left' },
    { id: 'price', label: 'Unit Price', minWidth: 50, align: 'left' },
    { id: 'price', label: 'Total Price', minWidth: 50, align: 'left',
        format: (value,row)=>  value*row.quantity},
    { id: 'customer_contact_name', label: 'Ship To - Contact', minWidth: 150, align: 'left'},
    { id: 'customer_address_name', label: 'Ship To - Address', minWidth: 150, align: 'left'},
    { id: 'packing_slip', label: 'Packing Slip', minWidth: 150, align: 'left', 
    format: (value, row)=> {
        if(!value){
          return (<div className={classes.inputValueSelect}>
            {packingSlips?.length ?  <Select
                id={'selectpacking'+row.record_id}
                value={value}
                inputProps={{className: classes.selectInput}}
                onChange={event => handleAddPackingSlip(event.target.value, row.record_id)}
                
            >
                {/* <MenuItem value={null}>
                    Add To Packing Slip
                </MenuItem> */}
                {packingSlips  && packingSlips.map((item)=>{
                    return (
                        <MenuItem value={item.record_id}>
                            {item.record_id}
                        </MenuItem>
                    )
                })}
            </Select> : <span>No Slips Available</span>}</div>)
        }else{
          return (<span onClick={(event)=>handleRemovePackingSlip(value, row.record_id)} className={classes.clickableWOnumber}>Remove From {value}</span>);
        }
    }}
  ];

  const handleAddPackingSlip = (value, woi_id) =>{

    WorkOrderDetail.addWOIToPackingSlip(value, woi_id, user)
    .then((data)=>{
      setWorkOrderItems(null);
    })
    .catch((error)=>{
      cogoToast.error("Failed to add woi to packing slip")
      console.error("Failed to add woi to packing slip", error);
    })
  }

  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: "#e8e8e8",
        '&:hover':{
          backgroundColor: "#dcdcdc",
        }
      },
      '&:nth-of-type(even)': {
        backgroundColor: '#f7f7f7',
        '&:hover':{
          backgroundColor: "#dcdcdc",
        }
      },
      border: '1px solid #111 !important',
      '&:first-child':{
        border: '2px solid #992222',
      }
    },
  }))(TableRow);

  const reorder = (direction, rowData) =>{
    var woiReorder = [...workOrderItems];
    var index = -1;
    
    //Find Index
    woiReorder.forEach((item,i)=>{
      if(item.record_id === rowData.record_id){
        index = i;
      } 
    })


    if(index == -1){
      return;
    }else{

      if(direction == "up" && index > 0){   
        woiReorder.splice(index-1, 0, woiReorder.splice(index, 1)[0]);
      }
      if(direction == "down" && index != woiReorder.length-1){
        woiReorder.splice(index+1, 0, woiReorder.splice(index, 1)[0]);
      }
    }

    //Get updatable object for db
    var updatedWOI = woiReorder.map((item,i)=>{
      return (
        { record_id: item.record_id, ordernum: (i+1) }
      )
    })
    
    Work_Orders.reorderWOI(updatedWOI, rowData.work_order, user)
    .then((data)=>{
      setWorkOrderItems(woiReorder);
    })
    .catch((error)=>{
      cogoToast.error("Failed to reorder WOI")
      console.error("Failed to reorder WOI", error);
    })

    
  }


   return ( 
    <div className={classes.root}>
        {activeWorkOrder && packingSlips ?
        <div className={classes.container}>

            <Grid  container direction={'column'}>
                  
                  <Grid item xs={ editWOIModalOpen ? 12 : 12}>
                    <div className={classes.woiDiv}>
                    { workOrderItems && workOrderItems.length > 0 ?
                    <TableContainer className={ clsx( { [classes.container_small]: editWOIModalOpen,
                                                        [classes.container]: !editWOIModalOpen
                                                      }) }>
                      <Table stickyHeader  size="small" aria-label="sticky table">
                        <TableHead>
                          <TableRow>
                            {columns.map((column, i) => (
                              <TableCell
                              className={classes.tableCellHead}
                              classes={{stickyHeader: classes.stickyHeader}}
                                key={'header' +column.id + i}
                                align={column.align}
                                style={{ minWidth: column.minWidth }}
                              >
                                {column.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          { workOrderItems.map((row) => {
                            return (
                              <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code} >
                                {columns.map((column,i) => {
                                  const value = row[column.id];
                                  return (
                                    <TableCell className={classes.tableCell}
                                               key={column.id + i} align={column.align}
                                               style={{ minWidth: column.minWidth }}>
                                      {column.format  ? column.format(value, row) : value}
                                    </TableCell>
                                  );
                                })}
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    : <span className={classes.infoSpan}>No Work Order Items</span>}


                    </div>
                  </Grid>
                  <Grid item xs={ editWOIModalOpen ? 12 : 0}>
                    <div className={classes.addWoiDiv}><AddEditWOIModal  /></div>
                  </Grid>
            </Grid>

        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default WOItemization



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    maxHeight: 700,
  },
  container_small:{
    maxHeight: 300
  },
  detailInfoDiv:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: '400px',
    flexWrap: 'wrap',
    width: '-webkit-fill-available',
    maxHeight: '200px',
  },
  addWoiDiv:{
    margin: '2%',
  },
  woiDiv:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '-webkit-fill-available',
  },
  detailDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    width: '40%',
    margin: '0px 7% 1%',
    borderBottom: '1px solid #f1f1f1',
  },
  detailLabel:{
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#777',
    width: '60%',
    padding: '2px 13px',
    textTransform: 'uppercase',
    fontSize: '10px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  detailValue:{
    fontFamily: 'monospace',
    color: '#112',
    width: '100%',
    padding: '2px 3px',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '-5px',
    marginBottom: '2px',
  },
  detailsContainer:{
    background: 'linear-gradient(45deg, rgb(255, 255, 255), rgba(255, 255, 255, 0.36))',
    borderRadius:' 0px 0px 17px 17px',
    boxShadow: '0px 1px 2px #969696',
    margin: '0px 1% 0 1%',
  },
  accordion:{
    boxShadow: 'none',
  },
  accordionHeader:{
    color: '#555',
    boxShadow: '0px 1px 2px #666666',
    background: 'linear-gradient(0deg, #d7d7d7, #e8e8e8)',
    borderRadius: '14px',
    '&:hover':{
      textDecoration: 'underline',

    },
    minHeight: '15px !important',
    display:'flex',
    flexDirection: 'row-reverse',

  },
  headercontent:{
    margin: '0px !important',
    
  },
  heading:{
    fontSize: '19px',
    fontWeight: '600',
    fontFamily: 'sans-serif',
  },
  //Table Stuff
  stickyHeader:{
    // background: 'linear-gradient(0deg, #a4dbe6, #cbf1f9)',
    fontWeight: '600',
    fontFamily: 'sans-serif',
    fontSize: '15px',
    color: '#1b1b1b',
    backgroundColor: '#fff',
    zIndex: '1',
  },
  tableCell:{
    borderRight: '1px solid #c7c7c7' ,
    '&:last-child' :{
      borderRight: 'none' ,
    },
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '150px',
    textOverflow: 'ellipsis',
    padding: "2px 6px"
  },
  tableCellHead:{
    
  },
  clickableWOnumber:{
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
  infoSpan:{
    fontSize: '20px'
  },
  reorderButton:{
    padding:'0px',
  },
  reorderIcon:{
    padding: '0px',
  },
  //End Table Stuff
  inputValueSelect:{
    flexBasis: '70%',
    textAlign: 'left',
    padding: '0px',
  },
  selectInput:{
    fontSize: 10,
    padding: '3px 22px',
    minWidth: '80px',
  }  
}));