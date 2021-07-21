import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton,Accordion, AccordionSummary, AccordionDetails,
  Select, MenuItem, TableFooter,} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import EditIcon from '@material-ui/icons/Edit';
import LinkIcon from '@material-ui/icons/Link';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import cogoToast from 'cogo-toast';

import Util from  '../../../../../js/Util';
import InventoryKits from  '../../../../../js/InventoryKits';
import clsx from 'clsx';

import { DetailContext, ListContext } from '../../InvKitsContainer';
import AddEditKitItemDialog from '../../components/AddEditKitItemDialog.js';

//import AddEditWOIModal from '../../../../AddEditWOI/AddEditWOIModal';

const KitsItemization = function(props) {
  const {user, type = "full"} = props;

  const { activeKit, setActiveKit, resetWOIForm, setResetWOIForm,editOrderOutModalOpen,
    setEditOrderOutModalOpen, currentView,  ordersOut, setOrdersOut, setOrdersOutRefetch, views,editOrderOutModalMode,setEditOrderOutModalMode, 
       } = useContext(ListContext);

  const {editKitItemDialogMode, setEditKitItemDialogMode, editKitItemModalOpen, setEditKitItemModalOpen, activeKitItemItem, setActiveKitItemItem} = useContext(DetailContext)

  const classes = useStyles(type);

  const [kitItems, setKitItems] = React.useState(null);
  
  const [refetchKitItem, setRefetchKitItem] = React.useState(false);

  //WOI
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if((kitItems == null || refetchKitItem) && activeKit) {
      if(refetchKitItem){
        setRefetchKitItem(false);
      }
      console.log("activeKit", activeKit);
      InventoryKits.getKitItems(activeKit.rainey_id)
      .then( async (data) => {
        console.log("data",data); 
        let promises = data.map(async(item)=>{
          if(item.item_type === "part"){
            return item;
          }
          if(item.item_type === "kit"){
            item.cost_each = await InventoryKits.getKitItemsCostData(item.rainey_id)
            console.log("item.cost_each ", item.cost_each );
            return item;
          }
          
          throw "No item type";
        })

        Promise.all(promises).then((results)=>{
          console.log("kitData",results);
          setKitItems(results); 
        })
        
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting oois`, {hideAfter: 4});
      })
    }
    
  
  },[kitItems, activeKit, refetchKitItem]);

  useEffect(()=>{
    if(currentView && currentView.value == "kitItems"){
      setRefetchKitItem(true);
    }
  },[currentView]);

  
  const handleShowKitItemView = (id)=>{
    if(id == null){
      cogoToast.error("Failed to get order out item");
      console.error("Bad id");
      return;
    }
    
    var tmp = kitItems.find((v)=> v.id == id) || -1;
    if(tmp){
      setActiveKitItemItem(tmp);
      //setResetWOIForm(true)
      setEditKitItemDialogMode("edit");
      setEditKitItemModalOpen(true)
    }else{
      cogoToast.error("Failed to open ooi");
      console.error("Failed to open ooi", error);
    }
  }

  

  
  const columns =  type == 'full' ? [
      {id: 'id', label: 'ID', minWidth: 80, align: 'center',
      format: (value, row)=>  <span onClick={()=>handleShowKitItemView(value)} className={classes.clickableWOnumber}>{value}</span>},
    { id: 'rainey_id', label: 'Rainey ID', minWidth: 80, align: 'center', editable: 'never' ,
    render: (value, rowData) => <div className={classes.urlSpan} onClick={event => handleGoToPart(event,rowData.rainey_id)}>{rowData.rainey_id}</div>    },
    { id: 'description', label: 'Description', minWidth: 80, align: 'center', editable: 'never' ,
    render: (value, rowData) => <div className={classes.notesSpan}>{rowData.description}</div>,     },
    { id: 'type_name', label: 'Type', minWidth: 100,type: 'text', align: 'center', },
    { id: 'inv_qty', label: 'In Stock', type: 'number', minWidth: 40, align: 'center',},
    { id: 'cost_each', label: 'Est Cost Each', type: 'number', minWidth: 100, align: 'right',
       format: (value, rowData)=> `$ ${value.toFixed ? value?.toFixed(6) : value}` },
      { id: 'total_cost', label: 'Cost', type: 'number', minWidth: 100, align: 'right',
         format: (value,rowData)=> `$ ${(rowData?.cost_each * rowData?.qty_in_kit)?.toFixed(3)}` },
    { id: 'qty_in_kit', label: 'Qty In Kit', minWidth: 25, align: 'center', editable: 'onUpdate',
      render: (value, rowData) => rowData.qty_in_kit },
      { id: 'notes', label: 'Notes', minWidth: 200,type: 'text', align: 'left',
     format: (value) => <div className={classes.descSpan}>{value}</div>,  }, 
    { id: 'date_updated', label: 'Part Updated', minWidth: 80, align: 'center', editable: 'never'   },
  ] : 
   [
    { id: 'id', label: 'ID', minWidth: 20, align: 'center',
    format: (value, row)=>  <span onClick={()=>handleShowKitItemView(value)} className={classes.clickableWOnumber}>{value}</span>  },
    { id: 'rainey_id', label: 'Rainey ID', minWidth: 20, align: 'center',
      format: (value, row)=>  <div className={classes.urlSpan} onClick={event => handleGoToPart(event,value)}>{value}</div>  },
    { id: 'description', label: 'Description', type: 'text', minWidth: 250, align: 'left',
    format: (value) => <div className={classes.descSpan}>{value}</div>,  }, 
    { id: 'qty_in_kit', label: "Qty In Order", type: 'number', minWidth:40, align: 'center'},
    { id: 'man_name', label: 'Manf', minWidth: 80, align: 'center'     },  
    { id: 'cost_each', label: 'Est Cost Each', type: 'number', minWidth: 100, align: 'right',
       format: (value, rowData)=> `$ ${value.toFixed ? value?.toFixed(6) : value}` },
      { id: 'total_cost', label: 'Cost', type: 'number', minWidth: 100, align: 'right',
         format: (value,rowData)=> `$ ${(rowData?.cost_each * rowData?.qty_in_kit)?.toFixed(3)}` },
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
        {activeKit ?
        <div className={classes.container}>

            <Grid  container direction={'column'}>
                  <Grid item xs={ type == "full" ? 12 : 12}>
                    <div className={classes.woiDiv}>
                    { kitItems && kitItems.length > 0 ?
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
                          { kitItems.map((row) => {
                            return (
                              <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id} >
                                {columns.map((column,i) => {
                                  const value = row[column.id];
                                  const item_type = row.item_type;
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
                        <TableFooter  className={classes.stickyFooter}>
                          {/* total row */}
                          <StyledTableRow hover role="checkbox" tabIndex={-1} key={`total_row`} className={classes.stickyFooter} >
                                {columns.map((column,i) => {
                                  const value = column.id == 'total_cost' ?  
                                      kitItems.reduce((total, item)=>  (total + item.qty_in_kit * item.cost_each), 0)
                                    : null;
                                  console.log("value", value)
                                  return (
                                    <TableCell className={clsx({[classes.tableCellTotal]:true , [classes.stickyFooter]:true})}
                                               key={`total_row` + i} align={column.align}
                                               style={{ minWidth: column.minWidth }}>
                                      {column.id == 'total_cost'  ? `$ ${value?.toFixed(3)}` :  column.id == 'cost_each' ? 'TOTAL' : ''}
                                    </TableCell>
                                  );
                                })}
                              </StyledTableRow>
                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={`total_row`} className={classes.stickyFooter} >
                                {columns.map((column,i) => {
                                  const value = column.id == 'total_cost' ?  
                                      (kitItems.reduce((total, item)=>  (total + item.qty_in_kit * item.cost_each), 0) * activeKit.num_in_kit)
                                    : null;
                                  console.log("value", value)
                                  return (
                                    <TableCell className={clsx({[classes.tableCellTotal]:true , [classes.stickyFooter]:true})}
                                               key={`total_row` + i} align={column.align}
                                               style={{ minWidth: column.minWidth }}>
                                      {column.id == 'total_cost'  ? `$ ${value?.toFixed(3)}` :  column.id == 'cost_each' ? `SET TOTAL(x${activeKit.num_in_kit})` : ''}
                                    </TableCell>
                                  );
                                })}
                              </StyledTableRow>
                            {/* total row */}
                        </TableFooter>
                      </Table>
                    </TableContainer>
                    : <span className={classes.infoSpan}>No Kit Items</span>}


                    </div>
                  </Grid>
                  
                    {/* <div className={classes.addWoiDiv}><AddEditWOIModal  /></div> */}
                        <AddEditKitItemDialog editKitItemDialogMode={editKitItemDialogMode} setEditKitItemDialogMode={setEditKitItemDialogMode} editKitItemModalOpen={editKitItemModalOpen}
                        setEditKitItemModalOpen={setEditKitItemModalOpen} setKitItems={setKitItems}
                        activeKitItemItem={activeKitItemItem} setActiveKitItemItem={setActiveKitItemItem} /> 
                  
            </Grid>

        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default KitsItemization



const useStyles = makeStyles(({type}) => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: `${type == 'full' ? '730px' : 'none' }`,
  },
  container: {
    maxHeight: `${type == 'full' ? '700px' : '400px' }`,
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
  stickyFooter:{
    left: 0,
    bottom: 0, // <-- KEY
    zIndex: 0,
    position: 'sticky'
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
  tableCellTotal:{
    // borderRight: '1px solid #c7c7c7' ,
    // '&:last-child' :{
    //   borderRight: 'none' ,
    // },
    background: '#ddf9ff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '150px',
    textOverflow: 'ellipsis',
    padding: "6px 6px",
    fontWeight:'600',
    fontSize: '1.5em',
    color: '#000',
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