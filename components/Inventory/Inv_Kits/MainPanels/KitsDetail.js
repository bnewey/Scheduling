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
import InventoryKits from  '../../../../js/InventoryKits';
import { ListContext } from '../InvKitsContainer';
import { DetailContext } from '../InvKitsContainer';
import EditKitInvDialog from '../components/EditKitInvDialog';
import clsx from 'clsx';
import KitItemList from '../components/KitItemList';
import { Warning } from '@material-ui/icons';
import KitsItemization from './DetailSubPanels/KitsItemization';



const KitsDetail = function(props) {
  const {user} = props;

  const { kits, setKits, setKitsRefetch,currentView, setCurrentView, views,columnState, setColumnState,
    editKitModalMode,setEditKitModalMode, activeKit, setActiveKit, editKitModalOpen,setEditKitModalOpen} = useContext(ListContext);
  const classes = useStyles();

  //const {} = useContext(DetailContext);

  const main_detail_table = [
                        { value: 'rainey_id', displayName: 'Rainey ID' }, 
                        { value: 'description', displayName: 'Description' }, 
                        { value: 'inv_qty', displayName: 'In Stock', 
                          format: (value,row ) => <EditKitInvDialog kit={row}/> },
                          { value: 'min_inv', displayName: 'Minimum in Inv',
                          format: (value,row ) => <div className={classes.minInvDiv}>{row.min_inv >= row.inv_qty ? <Warning className={classes.warnIcon}/> : <></>}{value}</div>   },
                        { value: 'num_in_kit', displayName: '# in Kit'   },
                    ]

  const second_detail_table = [
                        { value: 'storage_location', displayName: 'Storage Location',   },
                        { value: 'notes', displayName: 'Notes'}, 
                        { value: 'date_entered', displayName: 'Date Entered', 
                            format: (value)=> moment(value).format("MM-DD-YYYY") },
                        { value: 'date_updated', displayName: 'Date Updated', 
                            format: (value)=> moment(value).format("MM-DD-YYYY HH:mm:ss") },
                        { value: 'obsolete', displayName: 'Obsolete',   },
                    ]   

   return ( 
    <div className={classes.root}>
        {activeKit ?
        <div className={classes.container}>

          {/* MAIN DETAIL */}
          <div className={classes.main_grid_container}>
                  <div className={classes.descriptionDiv}>
                    <span className={classes.descriptionSpan}>{activeKit.description}</span>
                  </div>
                  <div className={classes.mainDetailInfoDiv}>
                    {activeKit && main_detail_table.map((item,i)=> {
                      return(
                      <div className={classes.mainDetailDiv} key={i}>
                        <span className={classes.mainDetailLabel}>{item.displayName}:</span>
                        <span className={classes.mainDetailValue}>
                          {activeKit[item.value] != null ? (item.format ? item.format(activeKit[item.value], activeKit) :  activeKit[item.value]) : ""}
                        </span>
                      </div>
                      )
                    })}

                    </div>
            </div>
            {/* END MAIN DETAIL */}
          
          <div className={classes.secondRow}>
            {/* SECOND DETAIL */}
            <div className={ clsx({[classes.grid_container]: true, [classes.moreInfoContainer]: true})}>
                  <div className={classes.moreInfoDiv}>More Info</div>
                  <div className={classes.detailInfoDiv}>

                    {activeKit && second_detail_table.map((item,i)=> {
                      return(
                        
                      <div className={classes.detailDiv} key={i}>
                        <span className={classes.detailLabel}>{item.displayName}:</span>
                        <span className={classes.detailValue}>
                          {activeKit[item.value] != null ? (item.format ? item.format(activeKit[item.value], item) :  activeKit[item.value]) : ""}
                          </span>
                      </div>
                      )
                    })}
                    </div>
            </div>
            {/* END SECOND  DETAIL */}

            {/* MANUFACTURE DETAIL */}
            <div className={ clsx({[classes.grid_container]: true, [classes.manuListContainer]: true})}>
                  <div className={classes.moreInfoDiv}>Kit Item List</div>
                  <div className={classes.detailInfoDiv}>
                      <KitsItemization type="half"/>
                    </div>
            </div>
            {/* END MANUFACTURE  DETAIL */}
          </div>
        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default KitsDetail



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
    flexBasis: '39%'
  },
  manuListContainer:{
    flexBasis: '59%',
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
  //End Table Stuff
  warnIcon:{
    height: '1em',
    width: '1em',
    color: '#ff0d0d',
    margin: '0px 5px',
  },
  minInvDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
}));