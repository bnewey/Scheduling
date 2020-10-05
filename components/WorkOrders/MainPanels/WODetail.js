import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';
import Work_Orders from  '../../../js/Work_Orders';
import { WOContext } from '../WOContainer';


const WODetail = function(props) {
  const {user} = props;

  const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
    currentView, setCurrentView, views, activeWorkOrder, setEditWOModalOpen, raineyUsers} = useContext(WOContext);
  const classes = useStyles();

  const [workOrderItems, setWorkOrderItems] = React.useState(null)
  const [expanded, setExpanded ] = React.useState(["detail", "woi"])
  
  //WOI
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(workOrderItems == null && activeWorkOrder) {
      console.log(activeWorkOrder);
      Work_Orders.getAllWorkOrderSignArtItems(activeWorkOrder.wo_record_id)
      .then( data => { console.log("getWorkOrderItems",data);setWorkOrderItems(data); })
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
  },[workOrderItems, activeWorkOrder]);

  const detail_table = [{value: 'c_name', displayName: 'Product To', type: 'text'},
                        {value: 'a_name', displayName: 'Bill To', type: 'text'},
                        {value: 'date', displayName: 'Date Entered', type: 'date',
                        format: (value,row)=> Util.convertISODateToMySqlDate(value)},
                        {value: 'requestor', displayName: 'Requestor', type: 'number',
                          format: (value,row)=> raineyUsers ? raineyUsers.filter((v)=> v.user_id == value)[0].name : value },
                        {value: 'maker', displayName: 'maker', type: 'number',
                          format: (value,row)=> raineyUsers ? raineyUsers.filter((v)=> v.user_id == value)[0].name : value },
                        {value: 'type', displayName: 'Type', type: 'text'},
                        {value: 'job_reference', displayName: 'Job Reference', type: 'text'},
                        {value: 'description', displayName: 'Description', type: 'text'},
                        {value: 'notes', displayName: 'Notes', type: 'text'},
                        {value: 'po_number', displayName: 'Purchase Order', type: 'number'},
                        {value: 'requested_arrival_date', displayName: 'Date Desired', type: 'date',
                        format: (value,row)=> Util.convertISODateToMySqlDate(value)}];

  const handleUpdateExpanded = (value)=>{
    var existing =  expanded && expanded.indexOf(value)
    console.log('existing', existing);
    if( !isNaN(existing) && existing >= 0){
      setExpanded(expanded.filter((item, i )=> { 
        console.log("item",item);
        console.log("Value", value);
        return item != value
      }));
    }else{
      setExpanded([...expanded, value])
    }
  }

  const handleShowWOIView = ()=>{

  }

  const handleOpenPackingSlip = ()=>{
    //go to packing slip page
  }

  
  const columns = [
    { id: 'record_id', label: 'ID', minWidth: 20, align: 'center',
      format: (value, row)=> <span onClick={()=>handleShowWOIView(value)} className={classes.clickableWOnumber}>{value}</span> },
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
    { id: 'description', label: 'Description', minWidth: 250, align: 'left' },
    { id: 'price', label: 'Unit Price', minWidth: 50, align: 'left' },
    { id: 'price', label: 'Total Price', minWidth: 50, align: 'left',
        format: (value,row)=>  value*row.quantity},
    { id: 'ship_to', label: 'Ship To', minWidth: 100, align: 'left', format: (value,row)=>  activeWorkOrder.c_name},
    { id: 'packing_slip', label: 'Packing Slip', minWidth: 50, align: 'left', 
    format: (value)=> {
        if(value == 0){
          return (" ")
        }else{
          return (<span onClick={()=>handleOpenPackingSlip(value)} className={classes.clickableWOnumber}>{value}</span>);
        }
    }}
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
        {activeWorkOrder ?
        <div className={classes.container}>
          <Accordion className={classes.accordion} expanded={expanded.indexOf('detail') >= 0} onChange={()=>handleUpdateExpanded('detail')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            className={classes.accordionHeader}
            classes={{content: classes.headercontent}}
          >
            <div>
              <span className={classes.heading}>Details</span>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.detailsContainer}>
            <Grid container>
                  <Grid item xs={7}>
                  <div className={classes.detailInfoDiv}>
                    {activeWorkOrder && detail_table.map((item,i)=> {
                      return(
                        
                      <div className={classes.detailDiv} key={i}>
                        <span className={classes.detailLabel}>{item.displayName}:</span>
                        <span className={classes.detailValue}>
                          {activeWorkOrder[item.value] ? (item.format ? item.format(activeWorkOrder[item.value], item) :  activeWorkOrder[item.value]) : ""}
                          </span>
                      </div>
                      )
                    })}
                    </div>
                  </Grid>
                  <Grid item xs={5}>
                    
                  </Grid>
            </Grid>
            
          </AccordionDetails>
          </Accordion>

          <Accordion className={classes.accordion} expanded={expanded.indexOf('woi') >= 0} onChange={()=>handleUpdateExpanded('woi')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            className={classes.accordionHeader}
            classes={{content: classes.headercontent}}
          >
            <span className={classes.heading}>Work Order Items</span>
          </AccordionSummary>
          <AccordionDetails className={classes.detailsContainer}>
            <Grid container>
                  <Grid item xs={12}>
                    <div className={classes.woiDiv}>
                    { workOrderItems && workOrderItems.length > 0 ?
                    <TableContainer className={classes.container}>
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
            </Grid>
            
          </AccordionDetails>
          </Accordion>

        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default WODetail



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    maxHeight: 650,
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
  woiDiv:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: '400px',
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
  }
  //End Table Stuff
}));