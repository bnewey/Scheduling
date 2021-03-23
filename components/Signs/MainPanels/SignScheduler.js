import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton, Checkbox} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import {debounce} from 'lodash';


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
import Work_Orders from '../../../js/Work_Orders';
import { ListContext } from '../SignContainer';
import Router from 'next/router'
import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';


const SignSchedulerList = function(props) {
  const {user, keyState, setKeyState, columnState, setColumnState} = props;

  const { signs, setSigns, setSignRefetch, currentView, setCurrentView, views , columns,setColumns, signSearchRefetch, setSignSearchRefetch   } = useContext(ListContext);
  const classes = useStyles();

  const [pendingDateChangesSaved,setPendingDateChangesSaved] = React.useState(true);
  const textRef = React.useRef([]);

  const handleChangeSignSchedulerView = (view)=>{
    if(!view){
        return(null);
    }
    var viewArray =[];
    switch(view){
        case "Description":
              viewArray = [
                { id: 'description', label: 'Description', minWidth: 300, align: 'left', hideRepeats: true},
                {id: 'install_date', label: 'Install Date',minWidth: 35, type: 'date',align: 'center', hideRepeats: true,
                    format: (value,row)=>{  
                      if(value == null){
                        return("****");
                      }
                      // if(row.list_name === "Holds"){
                      //   return("On Hold")
                      // }
                      // if(row.list_name === "Completed Tasks"){
                      //   return("Completed")
                      // }
                      return value;
                    } },
                { id: 'type', label: 'WO Type',minWidth: 35, type: 'text',align: 'center', hideRepeats: true },
                { id: 'state', label: 'Ship Group', minWidth: 35, align: 'center' , hideRepeats: true},
                { id: 'work_order', label: 'WO#', minWidth: 50, align: 'center', hideRepeats: true,
                  format: (value, row)=> <span onClick={()=>handleGoToWorkOrderId(value, row)} className={classes.clickableWOnumber}>{value}</span> },
                { id: 'product_to', label: 'Product Goes To', minWidth: 150, align: 'left', hideRepeats: true},
                { id: 'sign_built', label: 'Built', minWidth: 50,  align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,
                  format: (value,row)=> {return(
                    <Checkbox
                          className={classes.checkbox}
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          name="check_sign_popped_and_boxed"
                          checked={value != null}
                          onChange={(event)=> handleDebounceUpdateDate(event, row, "sign_built" )}
                      /> )}},
                { id: 'sign_popped_and_boxed', label: 'Finished', minWidth: 50, align: 'center',  type: 'date',pdfType: 'checkbox',  hideRepeats: false,
                  format: (value,row)=> {return(
                      <Checkbox
                      className={classes.checkbox}
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          name="check_sign_popped_and_boxed"
                          checked={value != null}
                          onChange={(event)=> handleDebounceUpdateDate(event, row, "sign_popped_and_boxed")}
                      />)}},
                { id: 'quantity', label: 'Qty', minWidth: 30, align: 'center', hideRepeats: false},
              ];
              break;
              case "Signs + Artwork":
                viewArray =[
                  {id: 'install_date', label: 'Install Date', minWidth: 35,type: 'date',align: 'center', hideRepeats: true,
                       format: (value,row)=>{  
                        if(value == null){
                          return("****");
                        }
                        // if(row.list_name === "Holds"){
                        //   return("On Hold")
                        // }
                        // if(row.list_name === "Completed Tasks"){
                        //   return("Completed")
                        // }
                        return value;
                       } },
                  {id: 'type', label: 'WO Type',minWidth: 35, type: 'text',align: 'center', hideRepeats: true },
                  { id: 'state', label: 'Ship Group', minWidth: 25, align: 'center' , hideRepeats: true},
                  { id: 'work_order', label: 'WO#', minWidth: 40, align: 'center', hideRepeats: true,
                    format: (value, row)=> <span onClick={()=>handleGoToWorkOrderId(value, row)} className={classes.clickableWOnumber}>{value}</span>},
                  { id: 'product_to', label: 'Product Goes To', minWidth: 150, align: 'left', hideRepeats: true},
                  { id: 'description', label: 'Description', minWidth: 200, align: 'left', hideRepeats: false},
                  { id: 'sign_built', label: 'Built', minWidth: 30, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,
                    format: (value,row)=> {return(
                      <Checkbox
                            className={classes.checkbox}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            name="check_sign_popped_and_boxed"
                            checked={value != null}
                            onChange={(event)=> handleDebounceUpdateDate(event, row, "sign_built")}
                        />)}},
                  { id: 'copy_received', label: 'Copy Rcvd', minWidth: 30, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,dontShowInPdf: true,
                    format: (value,row)=> {return(
                      <Checkbox
                            className={classes.checkbox}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            name="check_copy_receieved"
                            checked={value != null}
                            onChange={(event)=> handleDebounceUpdateDate(event, row, "copy_received")}
                        />)}},
                  { id: 'sent_for_approval', label: 'Sent For Appv', minWidth: 30, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,dontShowInPdf: true,
                    format: (value,row)=> {return(
                      <Checkbox
                            className={classes.checkbox}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            name="check_sent_for_approval"
                            checked={value != null}
                            onChange={(event)=> handleDebounceUpdateDate(event, row, "sent_for_approval")}
                        />)}},
                  { id: 'final_copy_approved', label: 'Final Copy Aprv', minWidth: 30, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,
                    format: (value,row)=> {return(
                      <Checkbox
                            className={classes.checkbox}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            name="check_final_copy_approved"
                            checked={value != null}
                            onChange={(event)=> handleDebounceUpdateDate(event, row, "final_copy_approved")}
                        />)}},
                  { id: 'artwork_completed', label: 'Art Complete', minWidth: 30, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,
                    format: (value,row)=> {return(
                      <Checkbox
                            className={classes.checkbox}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            name="check_artwork_completed"
                            checked={value != null}
                            onChange={(event)=> handleDebounceUpdateDate(event, row, "artwork_completed")}
                        />)}},
                  { id: 'sign_popped_and_boxed',label: 'Finished', minWidth: 30, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,
                    format: (value,row)=> {return(
                        <Checkbox
                        className={classes.checkbox}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            name="check_sign_popped_and_boxed"
                            checked={value != null}
                            onChange={(event)=> handleDebounceUpdateDate(event, row, "sign_popped_and_boxed")}
                        />)}},
                  { id: 'quantity', label: 'Qty', minWidth: 30, align: 'center', hideRepeats: false},
                ];
                break;
        case "Install Date":
        case 'default':
        default:
            viewArray =[
              {id: 'install_date', label: 'Install Date', minWidth: 35,type: 'date',align: 'center', hideRepeats: true,
                   format: (value,row)=>{  
                    if(value == null){
                      return("****");
                    }
                    // if(row.list_name === "Holds"){
                    //   return("On Hold")
                    // }
                    // if(row.list_name === "Completed Tasks"){
                    //   return("Completed")
                    // }
                    return value;
                   } },
              {id: 'type', label: 'WO Type',minWidth: 35, type: 'text',align: 'center', hideRepeats: true },
              { id: 'state', label: 'Ship Group', minWidth: 35, align: 'center' , hideRepeats: true},
              { id: 'work_order', label: 'WO#', minWidth: 50, align: 'center', hideRepeats: true,
                format: (value, row)=> <span onClick={()=>handleGoToWorkOrderId(value, row)} className={classes.clickableWOnumber}>{value}</span>},
              { id: 'product_to', label: 'Product Goes To', minWidth: 150, align: 'left', hideRepeats: true},
              { id: 'description', label: 'Description', minWidth: 300, align: 'left', hideRepeats: false},
              { id: 'sign_built', label: 'Built', minWidth: 50, align: 'center', type: 'date', pdfType: 'checkbox', hideRepeats: false,
                format: (value,row)=> {return(
                  <Checkbox
                        className={classes.checkbox}
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        name="check_sign_popped_and_boxed"
                        checked={value != null}
                        onChange={(event)=> handleDebounceUpdateDate(event, row, "sign_built")}
                    />)}},
              { id: 'sign_popped_and_boxed',label: 'Finished', minWidth: 50, align: 'center', type: 'date',pdfType: 'checkbox', hideRepeats: false,
                format: (value,row)=> {return(
                    <Checkbox
                    className={classes.checkbox}
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        name="check_sign_popped_and_boxed"
                        checked={value != null}
                        onChange={(event)=> handleDebounceUpdateDate(event, row, "sign_popped_and_boxed")}
                    />)}},
              { id: 'quantity', label: 'Qty', minWidth: 30, align: 'center', hideRepeats: false},
            ];
            break;
        
    }

    return(viewArray)
  }
  
   //Save and/or Fetch columns to local storage
  useEffect(() => {
    if(columnState == null){
      var tmp = window.localStorage.getItem('signColumns');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setColumnState(tmpParsed);
      }else{
        setColumnState("default");
      }
    }
    if(columnState){
      window.localStorage.setItem('signColumns', JSON.stringify(columnState));
    }
  }, [columnState]);

  useEffect(()=>{
    if(columnState){
      setColumns(handleChangeSignSchedulerView(columnState))
    }
  },[columnState])



  const handleGoToWorkOrderId = (wo_id, row) =>{
    console.log("woi", wo_id);
    
    //set detailWOIid in local data
    window.localStorage.setItem('detailWOid', JSON.stringify(wo_id));
    
    //set detail view in local data
    window.localStorage.setItem('currentView', JSON.stringify("woDetail"));

    Router.push('/scheduling/work_orders')
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

  const checkAllLastColumns = (columns, lastRow, row, columnIndex) =>{
    return (columns.slice(0, columnIndex+1).every((column)=> {
      return  (lastRow && column && lastRow[column.id] == row[column.id])
    }))

  }



  const handleUpdateDate = React.useCallback(

    debounce((updateRows) => Work_Orders.updateMultipleWorkOrderItemDates(updateRows)
    .then((data)=>{
      cogoToast.success("Updated ");

      if(currentView.value === "signScheduler"){
        setSignRefetch(true);
      }
      if(currentView.value === "searchSigns"){
        setSignSearchRefetch(true);
      }
      textRef.current = [];
      setPendingDateChangesSaved(true);
      
    })
    .catch((error)=>{
      console.error("failed to update ", error)
      cogoToast.error("Failed to update ");
      textRef.current =[];
    }), 4000)
    
    
  ,[])


  const handleDebounceUpdateDate = (event, row, field,text) =>{
    if(!row || !field){
      console.error("Bad row/field in handleUpdateDate")
      return;
    }
    var updateValue;

    if(event && event.target.checked ){
      updateValue= moment().format(); //today
    }else{
      updateValue = null;
    }

    var updateRow = {...row};
    updateRow[field] = updateValue;

    if(!textRef?.current){
      console.error("Bad ref for textRef");
      return;
    }
    
    var updatedInArray = false;
    //updates the array if its already in our textRef
    var updateArray =  [...textRef.current]?.map((item,i)=> {
      if(item.record_id === updateRow.record_id){
        let tmp = item;
        tmp[field] = updateValue;
        updatedInArray = true;
        return tmp;
      }else{
        return item;
      }
    }) ;

    if(!updatedInArray){
      //If not updated in array above, then we add the item to array
      updateArray = updateArray.length ? [...textRef.current, updateRow] : [updateRow];
    }
    
    //adds values to this ref so that it will update multiple if multiple are clicked and debounced
    textRef.current = updateArray;
    setPendingDateChangesSaved(false);
    handleUpdateDate(updateArray);

  }


  return ( 
    <div className={classes.root}>
        <div className={classes.progressBar}>
           { !pendingDateChangesSaved && <LinearProgress />}
        </div>
          <TableContainer className={classes.container}>
            <Table stickyHeader  size="small" aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {Array.isArray(columns) && columns.map((column) => (
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
                {signs?.map((row,i) => {
                  const lastRow = i > 0 ? signs[i-1] : null;
                  var topBorder = lastRow && columns && row[columns[0].id] != lastRow[columns[0].id];
                  return (
                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code} >
                      {columns && columns.map((column,colI) => {
                        var value;
                        //This hides repeat values in table for easier viewing
                        if(column.hideRepeats && checkAllLastColumns(columns, lastRow, row, colI)){
                          value = null;
                        }else{
                          value = column.format ? column.format(row[column.id], row) : row[column.id];
                        }
                        return (
                          <TableCell className={classes.tableCell} 
                                    key={column.id}
                                    align={column.align}
                                    style={ topBorder ? { minWidth: column.minWidth, borderTop: '1px solid #888',  borderTopStyle: 'solid' } 
                                                    : {minWidth: column.minWidth}}>
                            {value}
                          </TableCell>
                        );
                      })}
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
  },
  checkbox:{
    padding: 0,
    color: '#6a6a6a !important',
  },
  progressBar: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
    position: 'fixed',
    top: 0,
    left: 0,
  },
}));