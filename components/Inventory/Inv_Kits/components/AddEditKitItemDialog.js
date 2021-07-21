import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,withStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField, Stepper, Step, StepLabel} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import LinkIcon from '@material-ui/icons/Link'

import InventoryKits from '../../../../js/InventoryKits';
import Inventory from '../../../../js/Inventory';
import Util from '../../../../js/Util';
import cogoToast from 'cogo-toast';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

  import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { AutoSizer, Column, Table } from 'react-virtualized';
import FormBuilder from '../../../UI/FormComponents/FormBuilder';

import { ListContext } from '../../Inv_Kits/InvKitsContainer';
import clsx from 'clsx';
import PartsAndKitsSearch from '../../Inv_OrdersOut/components/PartsAndKitsSearch';
import _ from 'lodash';


const AddEditOrdersOutItemDialog = (props) => {
 
    //PROPS
    const { editKitItemModalOpen, setEditKitItemModalOpen,setKitItems, editKitItemDialogMode, setEditKitItemDialogMode,
       activeKitItemItem, setActiveKitItemItem } = props;
    const { user, currentView, setCurrentView, activeKit,setActiveKit, views} = useContext(ListContext);

    //STATE
    const [partId, setPartId] = useState(null)
    const [partsList,setPartsList] = useState(null);
    const [partsListRefetch, setPartsListRefetch] = useState(false);
    const [partsListSearchRefetch,setPartsListSearchRefetch] = useState(false)
    const [activeStep, setActiveStep] = React.useState(0);
    const [selectedPart, setSelectedPart] = React.useState(null);
    const [shouldUpdate, setShouldUpdate]= React.useState(false);

    const [validationErrors , setValidationErrors] = useState([]);
    
    //const [activeKitItemItem, setActiveKitItemItem] = useState(null)
    const saveRef = React.createRef();
    //CSS
    const classes = useStyles();

    //FUNCTIONS
    useEffect(()=>{
        if(editKitItemDialogMode == "add"){
            setActiveKitItemItem({})
        }

    },[editKitItemDialogMode])



    useEffect(()=>{      
      //selects item in list on edit
      if( editKitItemModalOpen == true && editKitItemDialogMode == "edit" && activeKitItemItem && partsList && selectedPart == null ){
 
        let editSP;
        partsList.forEach((item, index)=> {
          if(item.rainey_id === activeKitItemItem?.rainey_id){
            editSP = {...item, index};
          }
        })
        if(editSP){
          setSelectedPart(editSP)
        }else{
          console.warn("Couldnt find part in partlist");
        
        
      }
    }

    },[editKitItemModalOpen, activeKitItemItem, editKitItemDialogMode, partsList, selectedPart])

    const handleDialogClose = () => {
        setEditKitItemModalOpen(false);
        setPartId(0);
        setValidationErrors([]);
        setActiveStep(0)
        setSelectedPart(null);
        setPartsList(null);
        setActiveKitItemItem({});
        setShouldUpdate(false);
    };

    //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(((partsList == null || partsListRefetch == true)) ) {
      if(partsListRefetch == true){
        setPartsListRefetch(false);
      }

      InventoryKits.getAllPartsAndKits()
      .then( data => { 
        var tmpData = [...data];

        setPartsList(tmpData);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting partsList`, {hideAfter: 4});
      })
    }
  },[partsList, partsListRefetch]);


  
    const handleGoToPart = (event)=>{
         //set detailWOIid in local data
      window.localStorage.setItem('detailPartId', JSON.stringify(selectedPart?.rainey_id));
      
      //set detail view in local data
      window.localStorage.setItem('currentInvPartsView', JSON.stringify("partsDetail"));
      window.localStorage.setItem('currentInventoryView', JSON.stringify("invParts"));
      
      window.open('/scheduling/inventory', "_blank");

    }

    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'qty_in_kit', label: 'Qty in Order', type: 'number', updateBy: 'ref', required: true},
    ];

    const handleSave = (og_kit_item, updateKitItem, addOrEdit, add_and_continue)=>{
        return new Promise((resolve, reject)=>{
            if(!updateKitItem){
                console.error("Bad item");
                reject("Bad item");
            }
            console.log("updateKitItem item", updateKitItem)
            console.log("og_kit_item item", og_kit_item)
    
            if(selectedPart.item_type === "part" ){

                  updateKitItem["rainey_id"] = selectedPart.rainey_id;
                  //updateKitItem["item_type"] = selectedPart.item_type;
                  //Add Id to this new object
                  if(addOrEdit == "edit"){
                      if(!og_kit_item){
                          console.error("Bad og_kit_item in edit")
                          reject("Bad og_kit_item");
                      }

                      updateKitItem["id"] = og_kit_item.id;
                      
                      InventoryKits.updateKitPart( updateKitItem, user )
                      .then( (data) => {
                          //Refetch our data on save
                          cogoToast.success(`Kit Item ${og_kit_item.id} has been updated!`, {hideAfter: 4});
                          setKitItems(null);
                          handleDialogClose();
                          resolve(data)
                      })
                      .catch( error => {
                          console.warn(error);
                          cogoToast.error(`Error updating activeKit item. ` , {hideAfter: 4});
                          reject(error)
                      })
                  }
                  if(addOrEdit == "add"){
                      updateKitItem["kit_rainey_id"] = activeKit.rainey_id;

                      InventoryKits.addNewKitPart( updateKitItem, user )
                      .then( (data) => {
                          //Get id of new workorder and activeKit view to detail
                          cogoToast.success(`Kit item has been added!`, {hideAfter: 4});
                          //setPartsRefetch(true);
                          setActiveStep(0);
                          handleDialogClose()
                          if(add_and_continue){
                            console.log('add_and_continue',add_and_continue);
                              setActiveKitItemItem({});
                              setEditKitItemModalOpen(true);
                          }else{
                            
                          }
                          setKitItems(null)
                          
                          resolve(data)
                      })
                      .catch( error => {
                          console.warn(error);
                          cogoToast.error(`Error adding activeKit item. ` , {hideAfter: 4});
                          reject(error)
                      })
                  }
            }
            if(selectedPart.item_type === "kit"){
                    
                    updateKitItem["rainey_id"] = selectedPart.rainey_id;
                    //updateKitItem["item_type"] = selectedPart.item_type;
                    
                    //Add Id to this new object
                    if(addOrEdit == "edit"){
                        if(!og_kit_item){
                            console.error("Bad og_kit_item in edit")
                            reject("Bad og_kit_item");
                        }

                        updateKitItem["id"] = og_kit_item.id;

                        InventoryKits.updateKitKit( updateKitItem , user)
                        .then( (data) => {
                            if(data.error){
                              throw data.error;
                            }
                            //Refetch our data on save
                            cogoToast.success(`Kit ${og_kit_item.id} has been updated!`, {hideAfter: 4});
                            setKitItems(null)
                            handleDialogClose()
                            resolve(data)
                        })
                        .catch( error => {
                            console.warn(error);
                            cogoToast.error(`Error: ${error}` , {hideAfter: 6});
                            reject(error)
                        })
                    }
                    if(addOrEdit == "add"){
                        //Filter out unselected Parts
                        //updateKitItem["kit_items"] = updateKitItem["kit_items"].filter((item)=> item.selected);
                        updateKitItem["kit_rainey_id"] = activeKit.rainey_id;

                        InventoryKits.addNewKitKit( updateKitItem, user  )
                        .then( (data) => {
                            if(data.error){
                              throw data.error;
                            }
                            //Get id of new workorder and activeKit view to detail
                            cogoToast.success(`Kit items has been added!`, {hideAfter: 4});
                            //setPartsRefetch(true);
                            setActiveStep(0);
                            handleDialogClose()
                            if(add_and_continue){
                                setActiveKitItemItem({});
                                setEditKitItemModalOpen(true);
                            }else{
                              
                            }
                            setKitItems(null)
                            
                            resolve(data)
                        })
                        .catch( error => {
                            console.warn(error);
                            cogoToast.error(`Error: ${error}` , {hideAfter: 6});
                            reject(error)
                        })
                    }
            }
            
        })
    }

    const handleDelete = (item) =>{
      //check if item is kit or part
      if(item && item.item_type == "kit"){
          if( !item.id){
            console.error("Bad kit in delete kit from kit");
            return;
          } 

          const deleteEnt = () =>{
              InventoryKits.deleteKitKit(item.id, user)
              .then((data)=>{
                  setKitItems(null);
                  handleDialogClose();
                  cogoToast.success("Deleted kit from kit: " + item.id);
              })
              .catch((error)=>{
                  cogoToast.error("Failed to Delete kit from kit")
                  console.error("Failed to delete kit from kit", error);
              })
          }

          confirmAlert({
              customUI: ({onClose}) => {
                  return(
                      <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete Part permanently?"}/>
                  );
              }
          })
      }
      if( item  && item.item_type == "part"){
          if( !item.id){
              console.error("Bad part in delete Part");
              return;
          }

          const deleteEnt = () =>{
              InventoryKits.deleteKitPart(item.id, user)
              .then((data)=>{
                  setKitItems(null);
                  handleDialogClose();
                  cogoToast.success("Deleted Part from kit: " + item.id);
              })
              .catch((error)=>{
                  cogoToast.error("Failed to Delete part from kit")
                  console.error("Failed to delete part from kit", error);
              })
          }

          confirmAlert({
              customUI: ({onClose}) => {
                  return(
                      <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete Part permanently?"}/>
                  );
              }
          })
      }


    }
    
    return(
        <React.Fragment>     
            
            <Dialog PaperProps={{className: classes.dialog}} open={editKitItemModalOpen } onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{`${editKitItemDialogMode == "add" ? 'Add' : 'Edit'} Part/Kit for Kit`}</DialogTitle>
                <DialogContent className={classes.content}>
                    
                    {activeStep === 0 && 
                     <div className={classes.formGrid}>
                        <PartsAndKitsSearch searchOpenPermanent parts={partsList} setParts={setPartsList} partsSearchRefetch={partsListSearchRefetch}
             setPartsListSearchRefetch={setPartsListSearchRefetch} currentView={currentView} setCurrentView={setCurrentView} views={views} />
                        <div className={classes.inputDivs}>
                            <VirtualizedPartTable user={user} setShouldUpdate={setShouldUpdate} parts={partsList} setParts={setPartsList} partsSearchRefetch={partsListSearchRefetch}
                setPartsListSearchRefetch={setPartsListSearchRefetch} currentView={currentView} setCurrentView={setCurrentView} views={views}
                selectedPart={selectedPart} setSelectedPart={setSelectedPart}/>
                        </div>
                       
                    </div>
                    }
                    {activeStep === 1 && 
                        <div className={classes.formGrid}>
                          { selectedPart.item_type === "part" ? <>
                            <div className={classes.orderInfoPartContainer}>
                              <div className={classes.orderInfoPartDiv}  style={{flexBasis: '100%'}}>
                                <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>Part Selected:</span></div>
                                <div className={classes.subTitleValueDiv}>
                                    <span className={classes.subTitleValueIdSpan}><div className={classes.urlSpan} ><span onClick={handleGoToPart} >{selectedPart?.rainey_id}</span></div></span>
                                    <span className={classes.subTitleValueDescSpan}>{selectedPart?.description}</span>
                                </div>
                                <div className={classes.subPartCostDiv}>
                                    <span >Avg Cost: </span><span>{selectedPart.cost_each}</span>
                                </div>
                              </div>
                            </div> </>
                            : <></>}
                            <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>Kit Info</span></div>
                            <Grid container >  
                                <Grid item xs={12} className={classes.paperScroll}>
                                    <FormBuilder 
                                        ref={saveRef}
                                        fields={fields} 
                                        mode={editKitItemDialogMode} 
                                         classes={classes}
                                        formObject={activeKitItemItem} 
                                        setFormObject={setActiveKitItemItem}
                                        handleClose={handleDialogClose} 
                                        handleSave={handleSave}/>
                                </Grid>
                            </Grid>
                        </div>
                    }
                    {validationErrors.length > 0 ? <div className={classes.validationDiv}>
                        {validationErrors.map((error)=>
                        <span className={classes.errorSpan}>{error}</span>)}
                    </div> : <></>}
                    <DialogActions className={classes.dialogActions}>
                            <HorizontalLinearStepper activeStep={activeStep} setActiveStep={setActiveStep} activeKitItemItem={activeKitItemItem} 
                            setActiveKitItemItem={setActiveKitItemItem}
                             selectedPart={selectedPart} editKitItemDialogMode={editKitItemDialogMode} 
                             shouldUpdate={shouldUpdate} saveRef={saveRef} handleDelete={handleDelete}/>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default AddEditOrdersOutItemDialog;

const PickPartList = (props) =>{

    const {user, dimensions = {height: 300, width: 700}, rowHeight = 22, headerHeight = 30, parts, setParts, setPartsRefetch,
         currentView, setCurrentView, views,setPartsSearchRefetch,selectedPart,setSelectedPart, setShouldUpdate} = props;

    

    const classes = useStyles();

    const columns = [
        { dataKey: 'rainey_id', label: 'Rainey PN', type: 'number', width: 90, align: 'center' }, 
        { dataKey: 'description', label: 'Description', type: 'text', width: 350, align: 'left' }, 
        { dataKey: 'cost_each', label: 'Cost Each', type: 'number', width: 100, align: 'right',
          format: (value)=> `$ ${value.toFixed ? value.toFixed(6) : " "}` },
        { dataKey: 'type', label: 'Type', width: 150,type: 'text', align: 'center', },
        { dataKey: 'notes', label: 'Notes', width: 200,type: 'text', align: 'left' }, 
        { dataKey: 'obsolete', label: 'Obsolete',type: 'number', width: 40, align: 'center' },
      ];
    
      const getRowClassName = ({ index }) => {
        const { classes, onRowClick } = props;
    
        return clsx(classes.tableRow, classes.flexContainer, {
          [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
      };
    
      const cellRenderer = ({ cellData, columnIndex, rowData}) => {
        const column = columns[columnIndex];
        const selected = selectedPart?.rainey_id === rowData.rainey_id;

        return(
            <TableCell className={clsx({ [classes.tableCell]:true, [classes.tableCellSelected]: selected })} 
                        component="div"
                        align={column.align}
                        variant="body"
                        style={{ minWidth: column.width, height: rowHeight, fontSize: '.8em' }}>
                  {column.format  ? column.format(cellData, rowData) : cellData}
            </TableCell>
        )
      };
    
      const headerRenderer = ({ label, columnIndex }) => {
        const column = columns[columnIndex];
        
        return(
        <TableCell
          component="div"
          variant="body"
          className={clsx({ [classes.tableCellHead]: true })}
          classes={{stickyHeader: classes.stickyHeader}}
          align={column.align}
          style={{ minWidth: column.width,height: headerHeight,color: '#000', fontWeight: '600'  }}
          > 
          <span>
            <div>{label}</div>
          </span>
        </TableCell>)
      };

      const handleSelectPart = (event) => {
        if(event.index === -1){
            return;
        }
        setShouldUpdate(true)
        setSelectedPart({...event.rowData, index: event.index});
      }

      
      return (
        <div className={classes.root}>
            <TableContainer className={classes.container}>
            <Table stickyHeader
                height={dimensions?.height - 20}
                width={dimensions?.width}
                rowHeight={rowHeight}
                gridStyle={{
                  direction: 'inherit',
                }}
                headerHeight={headerHeight}
                className={classes.table}
                rowCount={parts ? parts.length : 0 }
                rowGetter={({ index }) => parts ? parts[index] : null }
                rowClassName={getRowClassName}
                onRowClick={(event)=>handleSelectPart(event)}
                scrollToIndex={selectedPart?.index || 0}
              >
                {columns.map(({ dataKey, ...other }, index) => {
                  return (
                    <Column
                      key={dataKey}
                      headerRenderer={(headerProps) =>
                        headerRenderer({
                          ...headerProps,
                          columnIndex: index,
                        })
                      }
                      className={classes.flexContainer}
                      cellRenderer={cellRenderer}
                      dataKey={dataKey}
                      {...other}
                    />
                  );
                })}
              </Table>
          </TableContainer>
        </div>
      );
    }
    
    const styles = (theme) => ({
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
      });
    
const VirtualizedPartTable = withStyles(styles)(PickPartList);


function getSteps() {
    return ['Part/Kit', 'Kit Info'];
}


function HorizontalLinearStepper(props) {
    const classes = useStyles();
    const {activeStep, setActiveStep, selectedPart,editKitItemDialogMode, saveRef, shouldUpdate, activeKitItemItem, setActiveKitItemItem, handleDelete} = props;
    const steps = getSteps();
    
    const handleNext = (add_and_continue = false) => {
        if(activeStep == 0 &&  !selectedPart){
            cogoToast.warn("No part/kit selected!");
            return;
        }
        // if(activeStep == 0 && selectedPart?.item_type === "kit"){
        //   //skip manufacturer
        //   setActiveStep(steps.length -1)
        //   return;
        // }
        if(activeStep === steps.length -1){
          //this should update to true only
          if(shouldUpdate){
            saveRef.current.handleShouldUpdate(shouldUpdate)
            .then((data)=>{
              console.log("handleNext add_and_continue", add_and_continue)
              saveRef.current.handleSaveParent(activeKitItemItem, null, add_and_continue)
            })
            .catch((error)=>{
              cogoToast.error("Failed to save");
              console.error("Failed to save; Couldnt update shouldUpdate", error)
              return;
            }) 
          } else{
            saveRef.current.handleSaveParent(activeKitItemItem, null,add_and_continue)
          }          
        }else{
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
      
    };
  
    const handleBack = () => {
      
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
  
  
    const handleReset = () => {
      setActiveStep(0);
    };

  
    return (
      <div className={classes.stepperRoot}>
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};

    
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <div>
              <Button onClick={handleReset} className={classes.button}>
                Reset
              </Button>
            </div>
          ) : (
            <div>
              {/* <span className={classes.instructions}>{getStepContent(activeStep)}</span> */}
              <div>
                <Button onClick={event => handleDelete(activeKitItemItem)}  className={classes.deleteButton}>
                  Delete
                </Button> 
                <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
                  Back
                </Button>
  
                <Button
                  variant="contained"
                  color="primary"
                  onClick={event => handleNext(false)}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1 ? editKitItemDialogMode == 'add' ? activeKitItemItem?.rainey_id  ? "Save" : "Add" : 'Update' : 'Next'}
                </Button>
                { ! activeKitItemItem?.rainey_id && activeStep === steps.length - 1 &&
                  <Button
                  variant="contained"
                  color="primary"
                  onClick={event=> handleNext(true)}
                  className={classes.button}
                >
                  { "Add +" }
                </Button>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    );
                }

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        maxWidth:'800px',
        minWidth: 700,
    },
    dialogActions:{
        paddingBottom: 0,
        background: '#ddd',
        boxShadow: 'inset 0px 2px 5px 0px #5f5f5f'
    },
    editDiv:{
        textAlign: 'center',
        cursor: 'pointer',
        padding: '1px 0px 0px 0px',
        backgroundColor: '#f5fdff',
        padding: '0px 5px',
        width: '100%',
        boxShadow: ' inset 0px 0px 3px 0px #0e0e0e',
        '&:hover':{
            backgroundColor: '#d5ddff',
        }
    },
    title:{
      '&& .MuiTypography-root':{
          fontSize: '15px',
          color: '#fff',
      },
      padding: '5px 13px',
      backgroundColor: '#16233b',

    },
    formGrid:{

        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'center',
        margin: '5px 5px',
        padding: '5px',
    },
    content:{
        padding: 0,
        minHeight: '180',
        minWidth: '400px',
    },
    lightButton:{
        backgroundColor: '#b7c3cd',
        fontWeight: '600',
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }
    },
    openButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        margin: '0px 30px',
        fontWeight: '700',
        fontSize: '13px',
        padding: '0px 16px',
        '&:hover':{
            border: '',
            backgroundColor: '#ffedc4',
            color: '#d87b04'
        }
    },
    paperScroll:{
      padding: '5px',
      margin: '10px 15px',
    },
    inputField: {
        '&:active':{
            backgroundColor: '#dde8eb',
        },
        '&:hover':{
            backgroundColor: '#dde8eb',
        },
        margin: '10px 17px ',
        padding: '9px 5px',
        backgroundColor: '#dbdbdb85',
        borderRadius: '3px',
        display: 'block',
    },
    textField:{
        display: 'block',
        minWidth: '220px',
    },
    darkButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid rgb(255, 237, 196)',
        fontSize: '9px',
        padding:'1%',
      '&:hover':{
        border: '',
        backgroundColor: '#ffedc4',
        color: '#d87b04'
      },
    },
    icon_small:{
        verticalAlign: 'text-bottom'
    },
    checkedType:{
        backgroundColor: '#ead78f',
        marginLeft: '0px',
        marginRight: '0px'
    },
    uncheckedType:{

    },
    inputDivs:{
        margin: '15px 25px',
        padding: '5px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0px 0px 3px 0px #282828'
    },
    addSubButtonDiv:{
        display: 'flex',
        flexDirection: 'row',
    },
    deleteButton:{
      backgroundColor: '#c4492e',
      '&:hover':{
          backgroundColor: '#f81010',
      },
      marginRight: '40px',
    },
    add_sub_button:{
        margin: '2px',
        padding: '2px',
        color: '#777',
        height: '1.2em',
        width: '1.2em',
        background: 'linear-gradient(   0deg , #cfcfcf, #f4f4f4, #cfcfcf)',
        boxShadow: '0px 0px 3px 0px #0e0e0e',
        cursor: 'pointer',
        '&:hover':{
            boxShadow: '0px 0px 4px 0px #0b0b0b',
        }
    },
    add_sub_button_active:{
        boxShadow: 'inset 0px 0px 4px 0px #5a9d97',
        '&:hover':{
            boxShadow: 'inset 0px 0px 4px 0px #5a9d97',
        },
        background: '#defffa',
    },
    add_button:{
        color: '#00760e',
    },
    sub_button:{
        color: '#dd0000',
    },
    stockDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    stockLabel:{
        fontSize: '1.2em',
        color: '#444',
    },
    stockValue:{
        margin: '0px 3px',
        fontSize: '1.2em',
        color: '#0022ff',
        fontWeight: '600',
    },
    validationDiv:{
        padding: '5px 5px',
        backgroundColor: '#ffc6c6',
        border: '1px solid #ff5555',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

    },
    errorSpan:{
        color: '#030000',
        fontSize: '.8em',
    },
    stepperRoot:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexBasis: '100%',
    },
    stepper:{
        padding: '15px 20px',
        background: '#ddd',
    },
    tableCellSelected:{
        background: '#5e90ff'
    },
    urlSpan:{
        cursor: 'pointer',
        textDecoration: 'underline',
        color: '#0055ff',
    },
    manSpan:{
      fontFamily: 'arial',
      color: '#333',
      fontWeight: '600',
    },
    manErrorSpan:{
      color: '#c50000',
      fontWeight: 500,
    },
    subTitleDiv:{

    },
    subTitleSpan:{
        fontFamily: "arial",

    },
    subTitleValueDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2em',
        color: '#000',
        background: '#eee',
        padding: '2px 5px',
        marginBottom: '10px',
    },
    subTitleValueIdSpan:{
        fontWeight: '600',
        margin: '2px 10px',
    },
    subTitleValueDescSpan:{
      whiteSpace: 'pre-wrap',
      maxHeight: '35px',
      overflowY: 'scroll',
      overflowX: 'hidden',
    },
    stickyHeader:{
        // background: 'linear-gradient(0deg, #a4dbe6, #cbf1f9)',
        fontWeight: '600',
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#1b1b1b',
        backgroundColor: '#fff',
        zIndex: '1',
        
      },
    /*formbuilder */
    inputDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%',
        minHeight: '25px',
    //   padding: '4px 0px 4px 0px',
        borderBottom: '1px solid #eee'
    },
    inputStyle:{
        padding: '5px 7px',
        width: '100%',
        
    },
    inputStyleDate:{
        padding: '5px 7px',
        width: '55%',
        
    },
    inputRoot: {
        padding: '5px 7px',
        width: '100%',
        '&& .MuiOutlinedInput-multiline': {
            padding: '0px'
        },
    },
    setInputRoot: {
      width: '100%',
      '&& .MuiOutlinedInput-multiline': {
          padding: '0px'
      },
    },
    inputLabel:{
        flexBasis: '30%',
        textAlign: 'right',
        marginRight: '35px',
        fontSize: '15px',
        color: '#787878',
    },
    inputValue:{
        flexBasis: '70%',
        textAlign: 'left',
    },
    inputValueSelect:{
        flexBasis: '70%',
        textAlign: 'left',
        padding: '5px 7px',
    },
    inputValueKitSelect:{
      flexBasis: '100%',
      textAlign: 'left',
      
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: "center",
    },
    inputFieldMatUi: {
        margin: '10px 17px 7px 17px',
        padding: '0px',
        '&& input':{
            padding: '12px 0px 12px 15px',
        },
        '&& .MuiSelect-select':{
            padding: '12px 40px 12px 15px',
            minWidth: '120px',
        },
        '&& .MuiOutlinedInput-multiline': {
            padding: '8.5px 12px'
        },
        '&& label':{
            backgroundColor: '#fff',
        },
        inputSelect:{
            width: '100%',
        },
    },
    errorSpan:{
        color: '#bb4444',
    },
    /*end of formbuilder*/
   
    orderInfoPartContainer:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '80%',
      margin: '5px 0px 15px 0px',
      fontSize: '.85em',
    },
    orderInfoPartDiv:{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0px 1px 4px 0px #9b9b9b',
      padding: '5px',
      minHeight: '80px',
    },
    selectedManItemContainer:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    linkIcon:{
      width: '.85em',
      height: '.85em'
    },
    manItemLink:{
      color: '#001166',
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    aLink:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputSelect:{
      width: '100%',
      whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '250px',
    textOverflow: 'ellipsis',
    },
    headListItemDiv:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: '600',
      color: '#435483',
      background: 'linear-gradient(    360deg  , #dcdcdc, #eeeeee)',
      fontFamily: 'arial',
      padding:'2px 0px'
    },
    listItemDiv:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'arial',
    },
    headListManfDiv:{
      flexBasis: '38%',
    },
    headListNameDiv:{
      flexBasis: '35%',
    },
    headListQtyDiv:{
      flexBasis: '13%',
    },
    headListPriceDiv:{
      flexBasis: '13%',
    },
    setDescSpan:{
      fontWeight: '600',
      fontFamily: 'arial',
      color: '#333',
    },
    disabledSpan:{
      color: '#999',
    }

    
  }));
