import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails, Checkbox, Select} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';


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
import PDFIcon from '@material-ui/icons/PictureAsPdf';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../../UI/ConfirmYesNo';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    KeyboardDatePicker,
    TimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';


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
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
    ViewPDF: forwardRef((props, ref) => <PDFIcon {...props} ref={ref} />),
  };

import MaterialTable, {MTableBodyRow, MTableCell} from "material-table";

import cogoToast from 'cogo-toast';

import Util from  '../../../../../js/Util';
import Pdf from  '../../../../../js/Pdf';
import WorkOrderDetail from  '../../../../../js/WorkOrderDetail';
import Work_Orders from  '../../../../../js/Work_Orders';
import { DetailContext, ListContext } from '../../../WOContainer';


const WOPackingSlip = function(props) {
  

  const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
    currentView, previousView, handleSetView, views, activeWorkOrder, setEditWOModalOpen, raineyUsers, user} = useContext(ListContext);

  const {shipToContactOptionsWOI, shipToAddressOptionsWOI} = useContext(DetailContext);
  const classes = useStyles();

  const [packingSlips, setPackingSlips] = React.useState(null)
  const [workOrderItems, setWorkOrderItems] = React.useState(null)


  //This will reset our state in case the view is reset
  useEffect(()=>{
    if(currentView){
      setPackingSlips(null);
    }
  },[currentView])

  
  //Packing SLips Data
  useEffect( () =>{
    if(packingSlips == null && activeWorkOrder) {
      
      WorkOrderDetail.getPackingSlipsById(activeWorkOrder.wo_record_id)
      .then( data => { setPackingSlips(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting wois`, {hideAfter: 4});
      })
    }
  },[packingSlips, activeWorkOrder]);

  //WOI Data
  useEffect( () =>{
    if(workOrderItems == null && activeWorkOrder) {
      
      Work_Orders.getAllWorkOrderSignArtItems(activeWorkOrder.wo_record_id)
      .then( data => { setWorkOrderItems(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting wois`, {hideAfter: 4});
      })
    }
  },[workOrderItems, activeWorkOrder]);

  const columns = [
    { field: 'record_id', title: 'ID', minWidth: 20, align: 'center', editable: 'never' },
    { field: 'ship_date', title: 'Ship Date', minWidth: 80, align: 'center', editable: 'onUpdate',
      render: rowData => rowData.ship_date,
      editComponent: props => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker className={classes.inputStyleDate} 
                                    clearable
                                    showTodayButton
                                    inputVariant="outlined"  
                                    onChange={(value, value2)=> props.onChange( value)}
                                    value={Util.convertISODateTimeToMySqlDateTime(props.value) }
                                    inputProps={{className: classes.inputRoot}} 
                                    format={'M/dd/yyyy'}
                                    />
        </MuiPickersUtilsProvider>
      ) },
    
    { field: 'shipped', title: 'Shipped', minWidth: 45, align: 'center', editable: 'onUpdate',
      render: rowData => rowData.shipped ? 'Yes' : 'No',
      editComponent: props => (
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            name="checkedI"
            checked={props.value ? true : false}
            onChange={(event)=> props.onChange(event.target.checked ? 1 : 0)}
        />
      )},
      { field: 'diff_ship_to', title: 'Different Ship To?', minWidth: 25, align: 'center', editable: 'onUpdate',
      render: rowData => rowData.diff_ship_to ? 'Yes' : 'No',
      editComponent: props => (
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            name="checkedI"
            checked={props.value ? true : false}
            onChange={(event)=> props.onChange(event.target.checked ? 1 : 0)}
        />
      )},
      { field: 'ship_to_contact', title: 'Contact', minWidth: 25, align: 'center', editable: 'onUpdate',
      render: rowData => rowData.contact_name ? rowData.contact_name : 'N/A',
      editComponent: props => { return(
                    props.rowData?.diff_ship_to ?
                    <Select
                        id={'ship_to_contact_select'}
                        value={props && props.value ? props.value : 0}
                        inputProps={{classes:  classes.inputSelect}}
                        onChange={(event) => props.onChange(event.target.value)}
                        native
                    >
                        <option value={0}>
                            Select
                        </option>
                        {shipToContactOptionsWOI && shipToContactOptionsWOI.map((item)=>{
                            return (
                                <option value={item.ec_record_id}>
                                    {item.ec_name}
                                </option>
                            )
                        })}
                    </Select>
                    : <span>{props.rowData?.contact_name}</span> 
      )}},
      { field: 'ship_to_address', title: 'Address', minWidth: 25, align: 'center', editable: 'onUpdate',
      render: rowData => rowData.address_name ? rowData.address_name : 'N/A',
      editComponent: props => { return(
                    props.rowData?.diff_ship_to ?
                    <Select
                        id={'ship_to_address_select'}
                        value={props && props.value ? props.value : 0}
                        inputProps={{classes:  classes.inputSelect}}
                        onChange={(event) => props.onChange(event.target.value)}
                        native
                    >
                        <option value={0}>
                            Select
                        </option>
                        {shipToAddressOptionsWOI && shipToAddressOptionsWOI.map((item)=>{
                            return (
                                <option value={item.ea_record_id}>
                                    {item.ea_name}
                                </option>
                            )
                        })}
                    </Select>
                    : <span>{props.rowData?.address_name}</span> 
      )}},
    // { field: 'address_name', title: 'Ship To', minWidth: 45, align: 'left',editable: 'never',
    //     render: rowData => {
    //       var tmp = "";
    //       if(rowData && rowData.shipping_entity_id){
    //         tmp = rowData.contact_name + ", " + rowData.entity_name + ", " + rowData.address + ", " +  rowData.city + ", " + rowData.state + ", " + rowData.zip;
    //       }
    //       return tmp;
    //     }}
    /* actions column? */
  ];


    const handleUpdatePackingSlip = (newData, oldData) => {
        return new Promise((resolve, reject)=>{
            WorkOrderDetail.updatePackingSlip(newData, user)
            .then((data)=>{
              cogoToast.success("Updated Packing Slip");
              setPackingSlips(null);
              resolve();
            })
            .catch((error)=>{
              console.error("Failed to update Packing Slip", error);
              cogoToast.error("Failed to update Packing Slip");
              setPackingSlips(null);
              reject();
            })
            
        })
    }   

    const handleCreateAndOpenPDF = (rowData) =>{

      var packingWOI = workOrderItems.filter((item,i)=> item.packing_slip == rowData.record_id);
      

      Pdf.createPackingSlipPdf(rowData, packingWOI)
      .then((data)=>{
        var fileURL = URL.createObjectURL(data);
        window.open(fileURL);
      })
      .catch((error)=>{
        console.error("Failed to create and open pdf");
      })
    }

    const handleDeletePackingSlip = (row)=>{
      if(!row.record_id){
        cogoToast.error("Bad row in delete packing slip");
        console.error("Failed to delete packing slip");
        return;
      }
      const deleteSlip = ()=>{
        WorkOrderDetail.deletePackingSlip(row.record_id, user)
        .then((data)=>{
          if(data){
            setPackingSlips(null);
            cogoToast.success("Deleted packing slip");
          }
        })
        .catch((error)=>{
            cogoToast.error("Failed to delete packing slip")
            console.error("Failed to delete packing slip", error);
        })
      }

      confirmAlert({
        customUI: ({onClose}) => {
            return(
                <ConfirmYesNo onYes={deleteSlip} onClose={onClose} customMessage={"Remove packing slip?"}/>
            );
        }
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
                            style={{boxShadow: '0px 0px 8px 2px #909090', width: "inherit"}}
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
                                toolbar: false,
                                showTitle: false,
                                headerStyle:{
                                  fontSize: '14px',
                                  fontFamily: 'sans-serif',
                                  borderRight: '1px solid #c7c7c7' ,
                                  '&:lastChild' :{
                                    borderRight: 'none' ,
                                  },
                                  background: 'linear-gradient(0deg, #cecece, #ededed)',
                                  fontWeight: 600,
                                  color: '#444',
                                  padding: '5px',
                                },
                                // actionsColumnIndex: -1,
                                cellStyle: {
                                  fontSize: '13px',
                                  fontFamily: 'sans-serif',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  borderLeft: '1px solid #c7c7c7' ,
                                },
                                actionsCellStyle:{
                                  background: '#ffefdd'
                                },
                            }} 
                            actions={[
                              {
                                icon: tableIcons.ViewPDF,
                                tooltip: 'View PDF',
                                onClick: (event, rowData) => handleCreateAndOpenPDF(rowData)
                              },
                              {
                                icon: tableIcons.Delete,
                                tooltip: 'Delete Packing Slip',
                                onClick: (event, rowData) => handleDeletePackingSlip(rowData)
                              },
                            ]}
                            
                        />
                    : <span className={classes.infoSpan}>No Packing Slips</span>}

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
    padding: '3%',
    minHeight: 730,
    // background: '#d0d0d0',
  },
  container: {
    maxHeight: 650,
    // backgroundColor: '#8a8a8a',
    padding: '2%',
    borderRadius: 3,
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
    '&:lastChild' :{
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
  inputStyleDate:{
    padding: '5px 7px',
    
  },
  inputRoot: {
      padding: '5px 7px',
      width: '100%'
  },
  tableStyle:{
    
  }
}));