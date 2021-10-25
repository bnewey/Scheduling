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
import { ListContext } from '../EntitiesContainer';
import { DetailContext } from '../EntitiesContainer';

//import AddEditWOIModal from '../AddEditWOI/AddEditWOIModal';


const EntityDetail = function(props) {
  const {user} = props;

  const {entities, setEntities,
    currentView, previousView, handleSetView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
    editEntModalOpen, setEditEntModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, setRecentEntities, entitiesRefetch, setEntitiesRefetch} = useContext(ListContext);
  const classes = useStyles();

  const {vendorTypes, setVendorTypes,
    shipToContactOptionsWOI, setShipToContactOptionsWOI, fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder,
    fpOrderModalOpen, setFPOrderModalOpen, fpOrders, setFPOrders} = useContext(DetailContext);
  

  

  const detail_table = [
    {value: 'name', displayName: 'Name', type: 'text'},
    {value: 'county_or_parish', displayName: 'County or Parish', type: 'text'},
    {value: 'entities_types', displayName: 'Entity Type', type: 'number'},
    {value: 'class', displayName: 'Class', type: 'text'},
    {value: 'other_organization', displayName: 'Other Organization', type: 'text'},
    {value: 'phone', displayName: 'Phone', type: 'text'},
    {value: 'fax', displayName: 'Fax', type: 'text'},
    {value: 'website', displayName: 'Website', type: 'text'},
    {value: 'other_organization', displayName: 'fax', type: 'text'},
    {value: 'shipping_name', displayName: 'Default Shipping Contact', type: 'text'},
    {value: 'billing_name', displayName: 'Default Billing Contact', type: 'text'},
    {value: 'mailing_name', displayName: 'Default Mailing Contact', type: 'text'},
    {value: 'account_number', displayName: 'Account Number', type: 'text'},
    {value: 'purchase_order_required', displayName: 'Purchase Order Required', type: 'text', format: (value,row)=> value ? "Yes" : "No"},
    {value: 'prepayment_required', displayName: 'Prepayment Required', type: 'text', format: (value,row)=> value  ? "Yes" : "No"},
    {value: 'notes', displayName: 'Notes', type: 'text'},
    {value: 'on_hold', displayName: 'On Hold', type: 'text', format: (value,row)=> value  ? "Yes" : "No"},
  ];

   
   return ( 
    <div className={classes.root}>
        {activeEntity ?
        <div className={classes.container}>
            
            <Grid item xs={12} md={6} className={classes.grid_container}>
                  
                  <div className={classes.detailInfoDiv}>
                    {activeEntity && detail_table.map((item,i)=> {
                      return(
                        
                      <div className={classes.detailDiv} key={i}>
                        <span className={classes.detailLabel}>{item.displayName}:</span>
                        <span className={classes.detailValue}>
                          {activeEntity[item.value] ? (item.format ? item.format(activeEntity[item.value], item) :  activeEntity[item.value]) : ""}
                          </span>
                      </div>
                      )
                    })}
                    </div>
            </Grid>
            
          
        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default EntityDetail



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    maxHeight: 650,
  },
  grid_container:{
    boxShadow: '0 0 2px black',
    borderRadius: 8,
    padding: '23px 0px',
    //width: 'fit-content',
    //minWidth: 695,
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
  woiDiv:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: '400px',
    flexWrap: 'wrap',
    width: 'auto',
  },
  detailDiv:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottom: '1px solid #f1f1f1',
    width: '100%',
    justifyContent: 'space-between',
    padding: 5,
  },
  detailLabel:{
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#777',
    padding: '2px 13px',
    textTransform: 'uppercase',
    fontSize: '10px',
    textAlign: 'right',
    flexBasis: '43%',
    whiteSpace: 'nowrap',
  },
  detailValue:{
    fontFamily: 'monospace',
    color: '#112',
    padding: '2px 3px',
    fontSize: '11px',
    fontWeight: '600',
    textAlign: 'left',
    width: '100%',
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