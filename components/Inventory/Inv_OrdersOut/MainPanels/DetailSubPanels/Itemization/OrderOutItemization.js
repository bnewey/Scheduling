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

import Util from  '../../../../../../js/Util';
import InventoryOrdersOut from  '../../../../../../js/InventoryOrdersOut';
import clsx from 'clsx';

import { DetailContext, ListContext } from '../../../InvOrdersOutContainer';
import AddEditOrdersOutItemDialog from '../../../components/AddEditOrdersOutItemDialog';

//import AddEditWOIModal from '../../../../AddEditWOI/AddEditWOIModal';

const OrderOutItemization = function(props) {
  const {user} = props;

  const { activeOrderOut, setActiveOrderOut, resetWOIForm, setResetWOIForm,editOrderOutModalOpen,
    setEditOrderOutModalOpen, currentView,  ordersOut, setOrdersOut, setOrdersOutRefetch, views,editOrderOutModalMode,setEditOrderOutModalMode, 
       } = useContext(ListContext);

  const {editOOIDialogMode, setEditOOIDialogMode, editOOIModalOpen, setEditOOIModalOpen, activeOOItem, setActiveOOItem} = useContext(DetailContext)

  const classes = useStyles();

  const [orderOutItems, setOrderOutItems] = React.useState(null);
  
  const [refetchOOI, setRefetchOOI] = React.useState(false);

  //WOI
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if((orderOutItems == null || refetchOOI) && activeOrderOut) {
      if(refetchOOI){
        setRefetchOOI(false);
      }

      InventoryOrdersOut.getOrderOutItems(activeOrderOut.id)
      .then( data => { setOrderOutItems(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting oois`, {hideAfter: 4});
      })
    }
  
  },[orderOutItems, activeOrderOut, refetchOOI]);

  useEffect(()=>{
    if(currentView && currentView.value == "orderOutItems"){
      setRefetchOOI(true);
    }
  },[currentView]);

  
  const handleShowOOIView = (id)=>{
    if(id == null){
      cogoToast.error("Failed to get order out item");
      console.error("Bad id");
      return;
    }
    
    var tmp = orderOutItems.find((v)=> v.id == id) || -1;
    if(tmp){
      setActiveOOItem(tmp);
      //setResetWOIForm(true)
      setEditOOIDialogMode("edit");
      setEditOOIModalOpen(true)
    }else{
      cogoToast.error("Failed to open ooi");
      console.error("Failed to open ooi", error);
    }
  }

  
  const columns = [
    { id: 'id', label: 'ID', minWidth: 20, align: 'center',
      format: (value, row)=>  <span onClick={()=>handleShowOOIView(value)} className={classes.clickableWOnumber}>{value}</span>  },
    { id: 'rainey_id', label: 'Rainey ID', minWidth: 20, align: 'center',
      format: (value, row)=>  <div className={classes.urlSpan} onClick={event => handleGoToPart(event,value)}>{value}</div>  },
    { id: 'description', label: 'Description', type: 'text', minWidth: 250, align: 'left',
    format: (value) => <div className={classes.descSpan}>{value}</div>,  }, 
    { id: 'qty_in_order', label: "Qty In Order", type: 'number', minWidth:40, align: 'center'},
    { id: 'inv_qty', label: 'In Stock', type: 'number', minWidth: 40, align: 'center',},
    { id: 'man_name', label: 'Manf', minWidth: 80, align: 'center'     },
    { id: 'mf_part_number', label: 'Manf #', minWidth: 150, align: 'center',
        format: (value) => <div className={classes.notesSpan}>{value}</div>,     },
    { id: 'est_cost_each', label: 'Est Cost Each', type: 'number', minWidth: 100, align: 'right',
      format: (value, rowData)=> `$ ${value?.toFixed(6)}` },
    { id: 'actual_cost_each', label: 'Cost Each', type: 'number', minWidth: 100, align: 'right',
      format: (value,rowData)=> `$ ${value?.toFixed(6)}` },
    { id: 'type', label: 'Type', minWidth: 150,type: 'text', align: 'center', },
    { id: 'notes', label: 'Notes', minWidth: 200,type: 'text', align: 'left',
    format: (value) => <div className={classes.descSpan}>{value}</div>,  }, 
    { id: 'reel_minWidth', label: 'Reel Width', type: 'text',minWidth: 50, align: 'center' },
    { id: 'obsolete', label: 'Obsolete',type: 'number', minWidth: 40, align: 'center' },
  ];

  const handleGoToPart = (event, rainey_id)=>{
        //ordersOut detailWOIid in local data
     window.localStorage.setItem('detailPartId', JSON.stringify(rainey_id));
     
     //set detail view in local data
     window.localStorage.setItem('currentInvPartsView', JSON.stringify("partsDetail"));
     window.localStorage.setItem('currentInventoryView', JSON.stringify("invParts"));
     
     window.open('/scheduling/inventory', "_blank");

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

  return ( 
    <div className={classes.root}>
        {activeOrderOut ?
        <div className={classes.container}>

            <Grid  container direction={'column'}>
                  <Grid item xs={ editOrderOutModalOpen ? 12 : 12}>
                    <div className={classes.woiDiv}>
                    { orderOutItems && orderOutItems.length > 0 ?
                    <TableContainer className={ clsx( { [classes.container_small]: editOrderOutModalOpen,
                                                        [classes.container]: !editOrderOutModalOpen
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
                          { orderOutItems.map((row) => {
                            return (
                              <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id} >
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
                    : <span className={classes.infoSpan}>No Order Out Items</span>}


                    </div>
                  </Grid>
                  
                    {/* <div className={classes.addWoiDiv}><AddEditWOIModal  /></div> */}
                        <AddEditOrdersOutItemDialog editOOIDialogMode={editOOIDialogMode} setEditOOIDialogMode={setEditOOIDialogMode} editOOIModalOpen={editOOIModalOpen}
                        setEditOOIModalOpen={setEditOOIModalOpen} setOrderOutItems={setOrderOutItems}
                        activeOOItem={activeOOItem} setActiveOOItem={setActiveOOItem} />
                  
            </Grid>

        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default OrderOutItemization



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
  } ,
  urlSpan:{
        cursor: 'pointer',
        textDecoration: 'underline',
        color: '#0055ff',
    },
  notesSpan:{
        maxWidth: '150px',
        whiteSpace: 'pre-wrap',
        fontSize: '10px',
        maxHeight: '50px',
        overflowY: 'scroll',
        overflowX: 'hidden',
    },
    descSpan:{
      maxWidth: '250px',
      whiteSpace: 'pre-wrap',
      fontSize: '10px',
      maxHeight: '50px',
      overflowY: 'scroll',
      overflowX: 'hidden',
  },
}));