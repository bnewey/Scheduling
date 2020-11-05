import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import cogoToast from 'cogo-toast';

import AddEditFPOrder from '../AddEditFPOrder/AddEditFPOrder'
import WorkOrderDetail from '../../../js/WorkOrderDetail';
import Util from  '../../../js/Util';
import { ListContext } from '../POContainer';
import Router from 'next/router'
import moment from 'moment';


const POrdersList = function(props) {
  const {user} = props;

  const { purchaseOrders, setPurchaseOrders, rowDateRange, setDateRowRange, activeFPOrder, setActiveFPOrder,
    currentView, setCurrentView, views, detailWOid,setDetailWOid, fpOrderModalMode, setFPOrderModalMode,fpOrderModalOpen, setFPOrderModalOpen,
    } = useContext(ListContext);
  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(null);


  useEffect(()=>{
    setPage(0);
  },[purchaseOrders])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  //Save and/or Fetch rowsPerPage to local storage
  useEffect(() => {
    if(rowsPerPage == null){
      var tmp = window.localStorage.getItem('rowsPerPage');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(!isNaN(tmpParsed) && tmpParsed != null){
        setRowsPerPage(tmpParsed);
      }else{
        setRowsPerPage(25);
      }
    }
    if(!isNaN(rowsPerPage) && rowsPerPage != null){
      window.localStorage.setItem('rowsPerPage', JSON.stringify(rowsPerPage));
    }
    
  }, [rowsPerPage]);

  //Set active worker to a tmp value for add otherwise activeworker will be set to edit
  useEffect(()=>{
    if(fpOrderModalOpen && fpOrderModalMode == "add"){
        setActiveFPOrder({order_date: moment(new Date()).format('MM/DD/YYYY') });
    }
   
  },[fpOrderModalMode, fpOrderModalOpen])

  // const handleShowDetailView = (wo_id) =>{
  //   if(!wo_id){
  //     cogoToast.error("Failed to get work order");
  //     console.error("Bad id");
  //     return;
  //   }
  //   //setCurrentView(views && views.filter((view, i)=> view.value == "woDetail")[0]);
  //   //setDetailWOid(wo_id);

  // }

  const handleOpenFPAddEditModal = (fpo_id, row) =>{
    if(!fpo_id){
      cogoToast.error("Failed to get fp order");
      console.error("Bad id");
      return;
    }

    WorkOrderDetail.getFPOrderById(fpo_id)
    .then((data)=>{
      setFPOrderModalMode("edit");
      setFPOrderModalOpen(true);
      console.log("data[0]", data[0])
      setActiveFPOrder(data[0]);
    })
    .catch((error)=>{
      console.error("Failed to get FP Order", error);
      cogoToast.error("Failed to get FP Order");
    })
   
  }

  const handleGoToWorkOrderId = (wo_id, row) =>{
    console.log("woi", wo_id);
    
    //set detailWOIid in local data
    window.localStorage.setItem('detailWOid', JSON.stringify(wo_id));
    
    //set detail view in local data
    window.localStorage.setItem('currentView', JSON.stringify("woFPOrder"));

    Router.push('/scheduling/work_orders')
  }


  const handleUpdateFPI = (value, fpi, table_to_update)=>{
    console.log("Value in update", value);
    console.log("FPI", fpi)
    if(!value || !fpi){
        cogoToast.error("Bad value");
        console.error("Bad value in handleUpdateFPI");
        return;
    }
    var updateFPI = {...fpi};
    updateFPI[table_to_update] = Util.convertISODateToMySqlDate(value);
    console.log("Update", updateFPI);
    WorkOrderDetail.updateFPOrderItem(updateFPI)
    .then((data)=>{
        if(data){
            setPurchaseOrders(null);
        }
    })
    .catch((error)=>{
        cogoToast.error("Failed to update est arrival date");
        console.error("Failed to update est arrival date", error)
    })
  }   
  
  const columns = [
    { id: 'record_id', label: 'ID#', minWidth: 20, align: 'center'},
    { id: 'fairplay_order', label: 'FP Order', minWidth: 20, align: 'center',
      format: (value, row)=> <span onClick={()=>handleOpenFPAddEditModal(value, row)} className={classes.clickableWOnumber}>{value}</span> },
    { id: 'sales_order_id', label: 'Sales ID#', minWidth: 80, align: 'center' },
    {
      id: 'model',
      label: 'Model',
      minWidth: 250,
      align: 'left',
    },
    {
      id: 'color',
      label: 'Color',
      minWidth: 150,
      align: 'left',
    },
    {
      id: 'job_name',
      label: 'Job Name',
      minWidth: 150,
      align: 'left',
    },
    {
      id: 'work_order',
      label: 'Work Order',
      minWidth: 50,
      align: 'center',
      format: (value, row)=> <span onClick={()=>handleGoToWorkOrderId(value, row)} className={classes.clickableWOnumber}>{value}</span>
    },
    { id: 'city', label: 'City', minWidth: 45, align: 'center' },
    { id: 'state', label: 'State', minWidth: 35, align: 'center' },
    {id: 'order_date', label: 'Order Date', type: 'date', align: 'center' ,
                        format: (value,row)=> Util.convertISODateToMySqlDate(value)},
    {id: 'arrival_estimate', label: 'Est Arrival', type: 'date',align: 'center' ,
              format: (value,row)=> {return(
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker     format="MM/dd/yyyy"
                                  inputVariant="outlined"
                                  variant="inline" 
                                  maxDate={new Date('01-01-2100')}
                                  minDate={new Date('01-01-1970')}
                                  className={classes.datePicker}
                                  value={value} 
                                  onChange={value => handleUpdateFPI(value, row, "arrival_estimate")} />
              </MuiPickersUtilsProvider>
    )}},
    {id: 'arrival_date', label: 'Arrival', type: 'date',align: 'center' ,
              format: (value,row)=> (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker     format="MM/dd/yyyy"
                                  inputVariant="outlined"
                                  variant="inline" 
                                  maxDate={new Date('01-01-2100')}
                                  minDate={new Date('01-01-1970')}
                                  className={classes.datePicker}
                                  value={value} 
                                  onChange={value => handleUpdateFPI(value, row, "arrival_date")} />
              </MuiPickersUtilsProvider>)},
  ];

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

  

  return (
    <div className={classes.root}>
      {fpOrderModalOpen && activeFPOrder ? <>

        <AddEditFPOrder  />
        </> : <></>}
        <TableContainer className={classes.container}>
        <Table stickyHeader  size="small" aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                className={classes.tableCellHead}
                classes={{stickyHeader: classes.stickyHeader}}
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders && purchaseOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code} >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell className={classes.tableCell} 
                                key={column.id}
                                 align={column.align}
                                 style={{ minWidth: column.minWidth }}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={purchaseOrders ? purchaseOrders.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
     
    </div>
  );
}

export default POrdersList



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    maxHeight: 650,
  },
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
    padding: "4px 6px",
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
  datePicker:{
    '& input':{
        textAlign: 'center',
        cursor: 'pointer',
        padding: '4px 0px',
        backgroundColor: '#f5fdff',
    }
  } 
}));