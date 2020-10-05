import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };

import MaterialTable from "material-table";

import cogoToast from 'cogo-toast';

import Util from  '../../../../js/Util';
import WorkOrderDetail from  '../../../../js/WorkOrderDetail';
import { WOContext } from '../../WOContainer';


const WOPackingSlip = function(props) {
  const {user} = props;

  const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
    currentView, setCurrentView, views, activeWorkOrder, setEditWOModalOpen, raineyUsers} = useContext(WOContext);
  const classes = useStyles();

  const [packingSlips, setPackingSlips] = React.useState(null)
  
  //WOI
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(packingSlips == null && activeWorkOrder) {
      console.log(activeWorkOrder);
      WorkOrderDetail.getPackingSlipsById(activeWorkOrder.wo_record_id)
      .then( data => { console.log("getWorkOrderItems",data);setPackingSlips(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting wois`, {hideAfter: 4});
      })
    }
  },[packingSlips, activeWorkOrder]);

  const columns = [
    { field: 'record_id', title: 'ID', minWidth: 20, align: 'center', editable: 'never', 
      format: (value, row)=> <span className={classes.clickableWOnumber}>{value}</span> },
    { field: 'ship_date', title: 'Ship Date', minWidth: 80, align: 'center', editable: 'onUpdate',
      format: (value,row)=> Util.convertISODateToMySqlDate(value) },
    
    { field: 'shipped', title: 'Shipped', minWidth: 45, align: 'left', editable: 'onUpdate' },
    { field: 'address_name', title: 'Ship To', minWidth: 45, align: 'left',editable: 'never'},
    /* actions column? */
  ];

  useEffect(()=>{
      if(packingSlips == null && activeWorkOrder){
          WorkOrderDetail.getPackingSlipsById(activeWorkOrder.wo_record_id)
          .then((data)=> {
            var a = JSON.stringify(data);
          })
          .catch((error)=>{
              cogoToast.error("Error getting ")
          })
      }
  },[packingSlips, activeWorkOrder])

//   const StyledTableRow = withStyles((theme) => ({
//     root: {
//       '&:nth-of-type(odd)': {
//         backgroundColor: "#e8e8e8",
//         '&:hover':{
//           backgroundColor: "#dcdcdc",
//         }
//       },
//       '&:nth-of-type(even)': {
//         backgroundColor: '#f7f7f7',
//         '&:hover':{
//           backgroundColor: "#dcdcdc",
//         }
//       },
//       border: '1px solid #111 !important',
//       '&:first-child':{
//         border: '2px solid #992222',
//       }
//     },
//   }))(TableRow);

    const handleUpdatePackingSlip = (newData, oldData) => {
        return new Promise((resolve)=>{
            console.log("update", newData);
            console.log("updatefrom", oldData);
            resolve();
        })
    } 
    

   return ( 
    <div className={classes.root}>
        {activeWorkOrder ?
        <div className={classes.container}>

          <Grid container>
                  <Grid item xs={12}>
                    <div className={classes.woiDiv}>
                    { packingSlips && packingSlips.length > 0 ?
                        <MaterialTable 
                            columns={columns}
                            data={packingSlips}
                            title={"Packing Slips"}
                            editable={{
                                onRowUpdate: (newData, oldData) => handleUpdatePackingSlip(newData, oldData)
                            }}
                            icons={tableIcons}
                            options={{
                                filtering: false,
                                paging: false,
                                search: false,
                                draggable: false,
                            }}
                            
                            
                        />
                    : <span className={classes.infoSpan}>No Work Order Items</span>}

                    </div>
                  </Grid>
            </Grid>
           

        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default WOPackingSlip



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