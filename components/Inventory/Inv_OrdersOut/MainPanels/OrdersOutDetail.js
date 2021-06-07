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
import moment from 'moment';

import Util from  '../../../../js/Util';
import InventoryOrdersOut from  '../../../../js/InventoryOrdersOut';
import { ListContext } from '../InvOrdersOutContainer';
import { DetailContext } from '../InvOrdersOutContainer';

import clsx from 'clsx';
import OOApprovers from '../components/OOApprovers';
//import OrdersOutItemList from '../components/OrdersOutItemList';



const OrdersOutDetail = function(props) {
  const {user} = props;

  const { ordersOut, setOrdersOut, setOrdersOutRefetch,currentView, setCurrentView, views,columnState, setColumnState,detailOrderOutId,
    editOrderOutModalMode,setEditOrderOutModalMode, activeOrderOut, setActiveOrderOut, editOrderOutModalOpen,setEditOrderOutModalOpen} = useContext(ListContext);
  const classes = useStyles();
  const [orderItems, setOrderItems] = useState(null);
  const [orderApprovers, setOrderApprovers] = useState(null)

  useEffect(()=>{
    if(orderItems == null && detailOrderOutId){
      InventoryOrdersOut.getOrderOutItems(detailOrderOutId)
      .then((data)=>{
        setOrderItems(data);
      })
      .catch((error)=>{
        cogoToast.error("Failed to get order items");
        console.error("failed to get order items", error)
      })
    }
},[orderItems, detailOrderOutId])

useEffect(()=>{
  if(orderApprovers == null && detailOrderOutId){
    InventoryOrdersOut.getOrderOutApprovers(detailOrderOutId)
    .then((data)=>{
      setOrderApprovers(data);
    })
    .catch((error)=>{
      cogoToast.error("Failed to get order approvers");
      console.error("failed to get order approvers", error)
    })
  }
},[orderApprovers, detailOrderOutId])

//const {} = useContext(DetailContext);

const main_detail_table = [
                  { value: 'id', displayName: 'ID' }, 
                  { value: 'description', displayName: 'Description', format: (value)=> <div className={classes.descSpan}>{value}</div> }, 
                  { value: 'notes', displayName: 'Notes', format: (value)=> <div className={classes.notesSpan}>{value}</div>}, 
                  { value: 'date_entered', displayName: 'Date Entered', 
                      format: (value)=> moment(value).format("MM-DD-YYYY") },
                  { value: 'date_updated', displayName: 'Date Updated', 
                      format: (value)=> moment(value).format("MM-DD-YYYY HH:mm:ss") },
                  { value: 'made_by_name', displayName: 'Made By',   },
                  { value: 'requested_by_name', displayName: 'Requested By',   },
              ]


const handleGetStatus = (activeOrderOut) =>{
  return "Status placeholder"
}

  return ( 
    <div className={classes.root}>
        {activeOrderOut ?
        <div className={classes.container}>
          {/* MAIN DETAIL */}
          <div className={classes.main_grid_container}>
                  <div className={classes.descriptionDiv}>
                    <span className={classes.descriptionSpan}>{activeOrderOut.description}</span>
                  </div>
                  <div className={classes.mainDetailInfoDiv}>
                    {activeOrderOut && main_detail_table.map((item,i)=> {
                      return(
                      <div className={classes.mainDetailDiv} key={i}>
                        <span className={classes.mainDetailLabel}>{item.displayName}:</span>
                        <span className={classes.mainDetailValue}>
                          {activeOrderOut[item.value] != null ? (item.format ? item.format(activeOrderOut[item.value], activeOrderOut) :  activeOrderOut[item.value]) : ""}
                        </span>
                      </div>
                      )
                    })}
                  </div>
            </div>
            {/* END MAIN DETAIL */}
          
          <div className={classes.secondRow}>
            {/* SECOND DETAIL */}
            {/* <div className={ clsx({[classes.grid_container]: true, [classes.moreInfoContainer]: true})}>
                  <div className={classes.moreInfoDiv}>More Info</div>
                  <div className={classes.detailInfoDiv}>

                    {activeOrderOut && second_detail_table.map((item,i)=> {
                      return(
                        
                      <div className={classes.detailDiv} key={i}>
                        <span className={classes.detailLabel}>{item.displayName}:</span>
                        <span className={classes.detailValue}>
                          {activeOrderOut[item.value] != null ? (item.format ? item.format(activeOrderOut[item.value], item) :  activeOrderOut[item.value]) : ""}
                          </span>
                      </div>
                      )
                    })}
                    </div>
            </div> */}
            {/* END SECOND  DETAIL */}

            {/* OrderOut Items DETAIL */}
            <div className={ clsx({[classes.grid_container]: true, [classes.moreInfoContainer]: true})}>
                  <div className={classes.moreInfoDiv}>OrderOut Status</div>
                  <div className={classes.detailInfoDiv}>
                    <OOApprovers orderApprovers={orderApprovers} setOrderApprovers={setOrderApprovers}/>     
                  </div>
            </div>
            {/* END OrderOut Items  DETAIL */}

            {/* OrderOut Items DETAIL */}
            <div className={ clsx({[classes.grid_container]: true, [classes.manuListContainer]: true})}>
                  <div className={classes.moreInfoDiv}>OrderOut Item List</div>
                  <div className={classes.detailInfoDiv}>
                    {/* <OrdersOutItemList ordersOut={activeOrdersOut} resetFunction={()=> setOrdersOutRefetch(true)}/> */}
                      {orderItems?.length > 0 ? orderItems.map((item)=>{
                        return (
                          <div>{item.rainey_id}{item.description}</div>
                        );
                      }) : <span>No Items added yet</span>}
                    </div>
            </div>
            {/* END OrderOut Items  DETAIL */}
          </div>
        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default OrdersOutDetail



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
    boxShadow: 'inset 0px 2px 4px 0px #a7a7a7',
    backgroundColor: '#e7eff8'
  },
  container: {
    maxHeight: 650,
  },
  main_grid_container:{
    boxShadow: '0 0 2px black',
    borderRadius: 8,
    padding: '3px 0px',
    marginBottom: '15px',
    width: '100%',
    minWidth: 695,
    background: '#fff',
  },
  grid_container:{
    boxShadow: '0 0 2px black',
    borderRadius: 8,
    padding: '23px 0px',
    margin: '0px 0px',
    width: 'fit-content',
    //minWidth: 695,
    background: '#fff',
  },
  moreInfoContainer:{
    flexBasis: '49%'
  },
  manuListContainer:{
    flexBasis: '49%',
  },
  secondRow:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  descriptionDiv:{
    background: 'linear-gradient(0deg, #d1d1d1, #e0e0e0)',
    borderRadius: 8,
    padding: '12px 15px',
    margin: '0px 3px',
  },
  descriptionSpan:{
    fontFamily: 'arial',
    fontSize: '1.7em',
    fontWeight: '600',
    color: '#3b3b3b',
  },
  mainDetailInfoDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'flex-start',
    width: 'auto',
    margin: '2px 20px',
  },
  moreInfoDiv:{
    fontFamily: 'arial',
    fontSize: '1.5em',
    fontWeight: '600',
    color: '#666',
    margin: '-5px 0px 10px 26px',
  },
  detailInfoDiv:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: 'auto',
    margin: '2px 20px',
  },
  mainDetailDiv:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    //width: '100%',
    justifyContent: 'start',
    padding: 5,
    marginRight: '5%',
  },
  detailDiv:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f1f1f1',
    width: '100%',
    justifyContent: 'space-between',
    padding: 5,
  },
  mainDetailLabel:{
    fontFamily: 'arial',
    fontWeight: '500',
    color: '#777',
    padding: '2px 3px',
    textTransform: 'uppercase',
    fontSize: '11px',
    textAlign: 'left',
  },
  mainDetailValue:{
    fontFamily: 'Roboto, Helvetica,Arial,',
    color: '#112',
    padding: '2px 3px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
    whiteSpace: 'nowrap'
  },
  detailLabel:{
    fontFamily: 'arial',
    fontWeight: '500',
    color: '#777',
    padding: '2px 13px',
    textTransform: 'uppercase',
    fontSize: '10px',
    textAlign: 'right',
    flexBasis: '20%',
    whiteSpace: 'nowrap',
  },
  detailValue:{
    fontFamily: 'Roboto, Helvetica,Arial,',
    color: '#112',
    padding: '2px 3px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },
  detailsContainer:{
    background: 'linear-gradient(45deg, rgb(255, 255, 255), rgba(255, 255, 255, 0.36))',
    borderRadius:' 0px 0px 17px 17px',
    boxShadow: '0px 1px 2px #595959',
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
  },
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approverItemDiv:{

  },
  notesSpan:{
    maxWidth: '200px',
    whiteSpace: 'pre-wrap',
    fontSize: '10px',
    maxHeight: '50px',
    overflowY: 'scroll',
    overflowX: 'hidden',
},
  descSpan:{
    maxWidth: '150px',
    whiteSpace: 'pre-wrap',
    fontSize: '10px',
    maxHeight: '50px',
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  //End Table Stuff
}));