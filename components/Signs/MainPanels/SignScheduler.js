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

// import AddEditFPOrder from '../AddEditFPOrder/AddEditFPOrder'
// import WorkOrderDetail from '../../../js/WorkOrderDetail';
import Util from  '../../../js/Util';
import { ListContext } from '../SignContainer';
import Router from 'next/router'
import moment from 'moment';


const SignSchedulerList = function(props) {
  const {user} = props;

  const { signs, setSigns, currentView, setCurrentView, views    } = useContext(ListContext);
  const classes = useStyles();


  //Set active worker to a tmp value for add otherwise activeworker will be set to edit
  // useEffect(()=>{
  //   if(fpOrderModalOpen && fpOrderModalMode == "add"){
  //       setActiveFPOrder({order_date: moment(new Date()).format('MM/DD/YYYY') });
  //   }
   
  // },[fpOrderModalMode, fpOrderModalOpen])

  // const handleShowDetailView = (wo_id) =>{
  //   if(!wo_id){
  //     cogoToast.error("Failed to get work order");
  //     console.error("Bad id");
  //     return;
  //   }
  //   //setCurrentView(views && views.filter((view, i)=> view.value == "woDetail")[0]);
  //   //setDetailWOid(wo_id);

  // }

  const handleGoToWorkOrderId = (wo_id, row) =>{
    console.log("woi", wo_id);
    
    //set detailWOIid in local data
    window.localStorage.setItem('detailWOid', JSON.stringify(wo_id));
    
    //set detail view in local data
    window.localStorage.setItem('currentView', JSON.stringify("woFPOrder"));

    Router.push('/scheduling/work_orders')
  }


  const handleUpdateFPI = (value, fpi, table_to_update)=>{
    // console.log("Value in update", value);
    // console.log("FPI", fpi)
    // if(!value || !fpi){
    //     cogoToast.error("Bad value");
    //     console.error("Bad value in handleUpdateFPI");
    //     return;
    // }
    // var updateFPI = {...fpi};
    // updateFPI[table_to_update] = Util.convertISODateToMySqlDate(value);
    // console.log("Update", updateFPI);
    // WorkOrderDetail.updateFPOrderItem(updateFPI)
    // .then((data)=>{
    //     if(data){
    //         setSigns(null);
    //     }
    // })
    // .catch((error)=>{
    //     cogoToast.error("Failed to update est arrival date");
    //     console.error("Failed to update est arrival date", error)
    // })
  }   
  
  const columns = [
    {id: 'install_date', label: 'Install Date', type: 'date',align: 'center' },
    {id: 'type', label: 'WO Type', type: 'text',align: 'center' },
    { id: 'state', label: 'Ship Group', minWidth: 35, align: 'center' },
    {
      id: 'work_order',
      label: 'WO#',
      minWidth: 50,
      align: 'center',
      format: (value, row)=> <span onClick={()=>handleGoToWorkOrderId(value, row)} className={classes.clickableWOnumber}>{value}</span>
    },
    { id: 'product_to', label: 'Product Goes To', minWidth: 200, align: 'left'},
    { id: 'description', label: 'Description', minWidth: 300, align: 'left'},
    
    // {id: 'arrival_estimate', label: 'Est Arrival', type: 'date',align: 'center' ,
    //           format: (value,row)=> {return(
    //             <MuiPickersUtilsProvider utils={DateFnsUtils}>
    //               <DatePicker     format="MM/dd/yyyy" showTodayButton
    //                               clearable
    //                               inputVariant="outlined"
    //                               variant="inline" 
    //                               maxDate={new Date('01-01-2100')}
    //                               minDate={new Date('01-01-1970')}
    //                               className={classes.datePicker}
    //                               value={value} 
    //                               onChange={value => handleUpdateFPI(value, row, "arrival_estimate")} />
    //           </MuiPickersUtilsProvider>
    // )}},
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
                {signs?.map((row) => {
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
          {/* <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={signs ? signs.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          /> */}
    </div>
  );
}

export default SignSchedulerList



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    maxHeight: 730,
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
    padding: "1px 6px",
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
        padding: '1px 0px 0px 0px',
        backgroundColor: '#f5fdff',
    }
  } 
}));