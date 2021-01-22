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
import Inventory from  '../../../../js/Inventory';
import { ListContext } from '../InvPartsContainer';
import { DetailContext } from '../InvPartsContainer';



const PartsDetail = function(props) {
  const {user} = props;

  const { parts, setParts, setPartsRefetch,currentView, setCurrentView, views,columnState, setColumnState,
    editPartModalMode,setEditPartModalMode, activePart, setActivePart, editPartModalOpen,setEditPartModalOpen} = useContext(ListContext);
  const classes = useStyles();

  //const {} = useContext(DetailContext);

  const detail_table = [{ value: 'rainey_id', displayName: 'Rainey PartNumber', 
                          format: (value)=> <span onClick={()=>handleShowDetailView(value)} className={classes.clickablePartnumber}>{value}</span> }, 
                        { value: 'description', displayName: 'Description' }, 
                        { value: 'inv_qty', displayName: 'In Stock',   },
                        { value: 'cost_each', displayName: 'Cost Each',
                          format: (value)=> `$ ${value.toFixed(6)}`   },
                        { value: 'type', displayName: 'Part Type', },
                        { value: 'storage_location', displayName: 'Storage Location',   },
                        { value: 'notes', displayName: 'Notes'}, 
                        { value: 'reel_width', displayName: 'Reel Width',   },
                        { value: 'date_entered', displayName: 'Date Entered', 
                            format: (value)=> moment(value).format("MM-DD-YYYY") },
                        { value: 'obsolete', displayName: 'Obsolete',   },
                      ]
   

   return ( 
    <div className={classes.root}>
        {activePart ?
        <div className={classes.container}>
            
            <div className={classes.grid_container}>
                  
                  <div className={classes.detailInfoDiv}>
                    {activePart && detail_table.map((item,i)=> {
                      return(
                        
                      <div className={classes.detailDiv} key={i}>
                        <span className={classes.detailLabel}>{item.displayName}:</span>
                        <span className={classes.detailValue}>
                          {activePart[item.value] ? (item.format ? item.format(activePart[item.value], item) :  activePart[item.value]) : ""}
                          </span>
                      </div>
                      )
                    })}
                    </div>
            </div>
            
          
        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default PartsDetail



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
    width: 'fit-content',
    minWidth: 695,
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
    flexBasis: '20%',
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