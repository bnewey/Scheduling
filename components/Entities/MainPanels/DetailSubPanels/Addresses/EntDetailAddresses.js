import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails, Checkbox} from '@material-ui/core';
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
import Entities from  '../../../../../js/Entities';
import { DetailContext, ListContext } from '../../../EntitiesContainer';
import AddEditEntityAddress from './AddEditEntityAddress/AddEditModal';


const EntAddresses = function(props) {

  const { entities, setEntities,
    currentView, previousView, handleSetView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
    editEntModalOpen, setEditEntModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, 
    setRecentEntities, entitiesRefetch, setEntitiesRefetch, user} = useContext(ListContext);

  const {detailEntAddressId,setDetailEntAddressId, activeAddress, setActiveAddress,editAddressModalOpen, setEditAddressModalOpen,
      editAddressModalMode, setEditAddressModalMode} = useContext(DetailContext);
  const classes = useStyles();

  const [addresses, setAddresses] = React.useState(null);

  

  //Entities address Data
  useEffect( () =>{
    if(addresses == null && activeEntity) {
      
      Entities.getEntAddresses(activeEntity.record_id)
      .then( data => { setAddresses(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting wois`, {hideAfter: 4});
      })
    }
  },[addresses, activeEntity]);


  const columns = [

    { field: 'name', title: 'Name', minWidth: 45, align: 'center',editable: 'never'},
    { field: 'record_id', title: 'ID', minWidth: 20, align: 'center', editable: 'never' },    
    { field: 'main', title: 'Main', minWidth: 20, align: 'center', editable: 'onUpdate',
      render: rowData => <div className={classes.checkboxDiv}>
      <Checkbox
          icon={<CheckBoxOutlineBlankIcon  />}
          checkedIcon={<CheckBoxIcon className={classes.checkboxIcon}  />}
          name="checkedMain"
          checked={rowData.main == 1? true : false}
          onChange={(event)=> { handleUpdateAddress('main', event.target.checked ? 1 : 0, rowData) }}
      /></div> 
      },
    { field: 'shipping', title: 'Shipping', minWidth: 20, align: 'center', editable: 'onUpdate',
    render: rowData => <div className={classes.checkboxDiv}>
    <Checkbox
        icon={<CheckBoxOutlineBlankIcon  />}
        checkedIcon={<CheckBoxIcon className={classes.checkboxIcon}  />}
        name="checkedshipping"
        checked={rowData.shipping == 1 ? true : false}
        onChange={(event)=> { handleUpdateAddress('shipping', event.target.checked ? 1 : 0, rowData) }}
    /></div> ,
    },
    { field: 'billing', title: 'Billing', minWidth: 20, align: 'center', editable: 'onUpdate',
    render: rowData => <div className={classes.checkboxDiv}>
    <Checkbox
        icon={<CheckBoxOutlineBlankIcon  />}
        checkedIcon={<CheckBoxIcon className={classes.checkboxIcon}  />}
        name="checkedbilling"
        checked={rowData.billing== 1 ? true : false}
        onChange={(event)=> { handleUpdateAddress('billing', event.target.checked ? 1 : 0, rowData) }}
    /></div> ,
    },
    { field: 'mailing', title: 'Mailing', minWidth: 20, align: 'center', editable: 'onUpdate',
    render: rowData => <div className={classes.checkboxDiv}>
    <Checkbox
        icon={<CheckBoxOutlineBlankIcon  />}
        checkedIcon={<CheckBoxIcon className={classes.checkboxIcon}  />}
        name="checkedmailing"
        checked={rowData.mailing == 1 ? true : false}
        onChange={(event)=> { handleUpdateAddress('mailing', event.target.checked ? 1 : 0, rowData) }}
    /></div> ,
    },
    
    /* actions column? */
  ];

  const handleUpdateAddress = async(field, value, rowData) => {
    if(!field || !rowData){
      console.error("Bad field or rowData in handleUpdateAddress");
      return;
    }

    var updateRow = {...rowData};
    updateRow[field] = value;
    
    await handleUpdateEntityAddress(updateRow);
  }


    const handleUpdateEntityAddress = (newData, oldData) => {
        return new Promise((resolve, reject)=>{
            Entities.updateEntityAddress(newData, user)
            .then((data)=>{
              cogoToast.success("Updated Entity Address");
              setAddresses(null);
              resolve();
            })
            .catch((error)=>{
              console.error("Failed to update Entity Address", error);
              if(error?.user_error){
                  cogoToast.error(error.user_error);
              }else{
                  cogoToast.error("Internal Server Error");
              }
              setAddresses(null);
              reject();
            })
            
        })
    }   

    const handleDeleteEntityAddress = (row)=>{
      if(!row.record_id){
        cogoToast.error("Bad row in delete entity address");
        console.error("Failed to delete entity address");
        return;
      }
      const deleteSlip = ()=>{
        Entities.deleteEntityAddress(row.record_id, user)
        .then((data)=>{
          if(data){
            setAddresses(null);
            cogoToast.success("Deleted entity address");
          }
        })
        .catch((error)=>{
            cogoToast.error("Failed to delete entity address")
            if(error?.user_error){
                    cogoToast.error(error.user_error);
            }else{
                cogoToast.error("Internal Server Error");
            }
        })
      }

      confirmAlert({
        customUI: ({onClose}) => {
            return(
                <ConfirmYesNo onYes={deleteSlip} onClose={onClose} customMessage={"Remove entity address?"}/>
            );
        }
      })

    }

  const handleOpenEditModal = (rowData)=>{
    if(!rowData?.record_id){
      console.error("Bad id to edit")
      cogoToast.error("Internal Server Error");
    }
    setEditAddressModalOpen(true);
    setEditAddressModalMode("edit");
    setDetailEntAddressId(rowData.record_id);
  }

   return ( 
    <div className={classes.root}>
        {activeEntity ?
        <div className={classes.container}>
          {editAddressModalOpen && <AddEditEntityAddress setAddresses={setAddresses} activeAddress={activeAddress} setActiveAddress={setActiveAddress} editAddressModalOpen={editAddressModalOpen} 
          setEditAddressModalOpen={setEditAddressModalOpen} editAddressModalMode={editAddressModalMode} setEditAddressModalMode={setEditAddressModalMode}
          detailEntAddressId={detailEntAddressId} setDetailEntAddressId={setDetailEntAddressId}/>}
          <Grid container>
                  <Grid item xs={12} md={8}>
                    <div className={classes.woiDiv}>
                    { addresses && addresses.length > 0 ?
                        <MaterialTable 
                            columns={columns}
                            style={{boxShadow: '0px 0px 8px 2px #909090', width: "inherit"}}
                            data={addresses}
                            title={"Addresses"}
                            editable={{
                                /* open edit modal here */
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
                                  zIndex: '0',
                                },
                                // actionsColumnIndex: -1,
                                cellStyle: {
                                  fontSize: '13px',
                                  fontFamily: 'sans-serif',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  borderLeft: '1px solid #c7c7c7' ,
                                  padding: 0,
                                },
                                actionsCellStyle:{
                                  background: '#ffefdd',
                                  
                                },
                            }} 
                            actions={[
                              {
                                icon: tableIcons.Delete,
                                tooltip: 'Delete Entity Address',
                                onClick: (event, rowData) => handleDeleteEntityAddress(rowData)
                              },
                              {
                                icon: tableIcons.Edit,
                                tooltip: 'Edit Entity Address',
                                onClick: (event, rowData) => handleOpenEditModal(rowData)
                              },
                            ]}
                            
                          
                            
                        />
                    : <span className={classes.infoSpan}>No Entity Addresses</span>}

                    </div>
                  </Grid>
            </Grid>
           

        </div>
        :<><CircularProgress/></>}
    </div>
  );
}

export default EntAddresses


const useStyles = makeStyles(theme => ({
  root:{
    padding: '3%',
    minHeight: 730,
  },
  container: {
    maxHeight: 650,
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
    
  },
  checkboxDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  checkboxIcon:{
    color: '#00bd42',
  }
}));