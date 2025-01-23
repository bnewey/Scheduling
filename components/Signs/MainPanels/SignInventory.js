import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';
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

import {debounce, groupBy} from 'lodash';
import AddEditSignModal from './addEdit/AddEditSign';

import clsx from 'clsx';

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
import { DetailContext, ListContext } from '../SignContainer';
import Router from 'next/router'
import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';


// function Autosave({data, handleSave}) {
//   const debouncedSave = useCallback(
//     debounce(async (newExperimentData) => {
//       await saveExperimentDataToDb(newExperimentData);
//     }, 1000),
//     [],
//   );

//   useEffect(()=>{
//     if(data){
//       debouncedSave(data);
//     }
//   }, [data,debouncedSave])

//   return null;
// }

const SignInventory = function(props) {
  const { keyState, setKeyState, columnState, setColumnState} = props;

  const { signs, setSigns, setSignRefetch, currentView, previousView, handleSetView, views , columns,setColumns, signSearchRefetch, setSignSearchRefetch, user   } = useContext(ListContext);
  const classes = useStyles();

  const {editSignModalOpen} = useContext(DetailContext)

  const [pendingDateChangesSaved,setPendingDateChangesSaved] = React.useState(true);
  const textRef = React.useRef([]);
  //const [columns, setColumns] = useState(null);

  //useEffect(()=>{

  //},[columnState,columns]);

 

 const viewArray = [
    { id: 'size', label: 'Size', minWidth: 40, align: 'left'},
    { id: 'description', label: 'Description', minWidth: 300, align: 'left', hideRepeats: true},
    //{ id: 'type', label: 'WO Type',minWidth: 35, type: 'text',align: 'center', hideRepeats: true },
    { id: 'work_order', label: 'WO#', minWidth: 50, align: 'center', hideRepeats: true,
      format: (value, row)=> <span onClick={()=>handleGoToWorkOrderId(value, row)} className={classes.clickableWOnumber}>{value}</span> },
    { id: 'art_stage', label: 'Art Stage', minWidth: 100, align: 'center', hideRepeats: false,
      format: (value, row) => determineArtStage(row)},
    { id: 'build_stage', label: "Build Stage", minwidth: 100, align: 'center', hideRepeats: false,
      format: (value, row) => determineBuildStage(row)},
    { id: 'quantity', label: 'Qty', minWidth: 30, align: 'center', hideRepeats: false},
  ];

  //useEffect(() => {
    // Filter the data to get only the items where built is true
    //const filterBuiltItems = (data) => {
    //    return data.filter(item => item.sign_built !== null);
    //};
  
    //if (signs && signs.some(item => item.sign_built === null)) {
        // Set the filtered items to the state
        //const filteredSigns = filterBuiltItems(signs);
        //setSigns(filteredSigns);
    //}
  //}, [signs, setSigns]);


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
      setColumns(viewArray)
    }
  },[columnState])


  const determineArtStage = (sign) => {
    if (!sign.copy_received) {
      return 'Not Started';
    } else if (!sign.sent_for_approval) {
      return 'Copy Received';
    } else if (!sign.final_copy_approved) {
      return 'Sent for Approval';
    } else if (!sign.artwork_completed) {
      return 'Final Copy Approved';
    } else {
      return 'Artwork Completed';
    }
  };

  const determineBuildStage = (sign) => {
    if (!sign.sign_built) {
      return 'Not Started';
    } else if (!sign.sign_popped_and_boxed) {
      return "Built";
    } else {
      return "Finished";
    }
  };


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

    debounce((updateRows) => Work_Orders.updateMultipleWorkOrderItemDates(updateRows, user)
    .then((data)=>{
      cogoToast.success("Updated ");

      if(currentView.value === "signScheduler"){
        console.log("SignScheduler refetch")
        setSignRefetch(true);
      }
      if(currentView.value === "searchSigns"){
        console.log("searchSigns refetch")
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
    });

    if(!updatedInArray){
      //If not updated in array above, then we add the item to array
      updateArray = updateArray.length ? [...textRef.current, updateRow] : [updateRow];
    }
    
    //adds values to this ref so that it will update multiple if multiple are clicked and debounced
    textRef.current = updateArray;
    setPendingDateChangesSaved(false);
    handleUpdateDate(updateArray);

  }

  console.log(signs);


  return ( 
    <div className={classes.root}>
        <div className={classes.progressBar}>
           { !pendingDateChangesSaved && <LinearProgress />}
        </div>

        <Grid  container direction={'column'}>

        <Grid item xs={ editSignModalOpen ? 12 : 12}>
          <TableContainer className={clsx({ [classes.container_small]: editSignModalOpen,
                                            [classes.container]: !editSignModalOpen}) }>
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
          </Grid>
        <Grid item xs={ editSignModalOpen ? 12 : 0}>
            <div className={classes.addSignDiv}><AddEditSignModal  /></div>
        </Grid>

        </Grid>
    </div> 
  );
}

export default SignInventory



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
    maxHeight: 400,
    marginBottom: '2%',
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
