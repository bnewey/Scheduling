import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,withStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField, Stepper, Step, StepLabel} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import LinkIcon from '@material-ui/icons/Link'

import InventoryOrdersOut from '../../../../js/InventoryOrdersOut';
import Inventory from '../../../../js/Inventory';
import InventoryKits from '../../../../js/InventoryKits';
import Util from '../../../../js/Util';
import cogoToast from 'cogo-toast';


  import { CSVReader } from 'react-papaparse'

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
import PartManufactureList from '../../components/PartManufactureList';
import _ from 'lodash';


const ImportKitDialog = (props) => {
 
    //PROPS
    //const { } = props;
    const {user, currentView, setCurrentView, views,
      importKitModalOpen,setImportKitModalOpen, activeImportItem, setActiveImportItem, setKitsRefetch} = useContext(ListContext);

    //STATE
    const [activeStep, setActiveStep] = React.useState(0);
    const [shouldUpdate, setShouldUpdate]= React.useState(false);

    const [validationErrors , setValidationErrors] = useState([]);
    const [checkItems, setCheckItems] = useState(false);
    

    const saveRef = React.createRef();
    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleDialogClose = () => {
      setKitsRefetch(true);
        setImportKitModalOpen(false);
        setValidationErrors([]);
        setActiveStep(0)
        setActiveImportItem({});
        setShouldUpdate(false);
    };

    useEffect(()=>{
      //check if rainey_ids are in DB
      if(activeImportItem && activeImportItem.items?.length > 0 && importKitModalOpen && checkItems == true){
        setCheckItems(false);

        var promises = activeImportItem.items.map(async(item)=>{
          let response = await Inventory.checkPartExists(item.rainey_id);
          return response
        })

        var updateItems = [...activeImportItem.items];

        Promise.all(promises).then((results)=>{
          console.log("id check array",results);

           //update item array
           updateItems = updateItems.map((item)=>{
             results.forEach((result)=> {
               if(item.rainey_id == result.rainey_id){
                item.exists = result.exists;
               }
             })
             return item;
           })

          
           setActiveImportItem((old)=> {
            old.items = updateItems;
            return old;
           } )
           if(activeStep == 0){
              setActiveStep(1);
           }
        })
        .catch((error)=>{
          console.error("Failed to get all promises from id check", error);
        })
      }
    },[activeImportItem, checkItems])


    // useEffect(()=>{

    //   if( kitsPartsManItemsRefetch && saveRef?.current ){
    //       //resets the form when you change something by state
    //       saveRef.current.handleResetFormToDefault()
    //       setKitsPartsManItemsRefetch(false);
    //   }
    // },[kitsPartsManItemsRefetch, saveRef])
  
    const handleGoToPart = (event)=>{
         //set detailWOIid in local data
      window.localStorage.setItem('detailPartId', JSON.stringify(selectedPart?.rainey_id));
      
      //set detail view in local data
      window.localStorage.setItem('currentInvPartsView', JSON.stringify("partsDetail"));
      window.localStorage.setItem('currentInventoryView', JSON.stringify("invParts"));
      
      window.open('/scheduling/inventory', "_blank");

    }

    const kitFields = [
        //type: select must be hyphenated ex select-type
        {field: 'rainey_id', label: 'Rainey ID', type: 'number', updateBy: 'ref', required: true},
        {field: 'description', label: 'Description', type: 'text', updateBy: 'ref', required: true},
        {field: 'num_in_kit', label: 'Number in Set', type: 'number', updateBy: 'ref', required: true, defaultValue: 1},
        {field: 'import_kit_select', label: '', type: "import_kit_select", updateBy: 'state'},
    ];


    const handleSave = (og_kit_item, updateKitItem, addOrEdit, add_and_continue)=>{
      return new Promise((resolve, reject)=>{
          if(!updateKitItem){
              console.error("Bad item");
              reject("Bad item");
          }
          console.log("updateKitItem item", updateKitItem)

          //ADD NEW KIT AND GET ID HERE
          InventoryKits.importKitObject(updateKitItem, user)
          .then((data)=>{
            handleDialogClose();
            resolve(data);
            cogoToast.success("Imported Kit "+ updateKitItem.rainey_id);
          })
          .catch((error)=>{
            handleDialogClose();
            reject(error);
            cogoToast.error('Failed to Import Kit');
            console.error("Failed to import kit", error);
          })
          
          
      })
    }  


//rainey_id, description, num_in_kit, notes, date_entered, date_updated, obsolete, inv_qty, min_inv, storage_location, part_type

    const handleOnDrop = (data) => {
      console.log(data);

      //fill activeImportItem using data
      let updateObject = {};
      let id 
      try {
        updateObject.description = data[0].data[0]?.split(" Revised")[0];
        id = data[1].data[0]?.split("          ")[0];
        console.log("id", id);
        id = id?.length > 0 ? id.replace(/^0/, "2") : id || null ;
        id = id?.replace("-", "") || null;
      } catch (error) {
        console.error("Failed to pull kit data", error)
      }
      
     
      
      updateObject.rainey_id = id;
      let objectItems = [];
      let items = data.slice(14, data.length);

      try {
        items.forEach((item)=>{
          let r_id = item.data[3]?.split("_")[0] || null;
          let missing_nums = 8 - r_id.length ;
          if(missing_nums > 0){
            //works only for parts right now
            let beginning = "1";
            let i= 0;
            while(i < missing_nums -1){
              beginning += "0";
              i++;
            }
            r_id = beginning + r_id;
          }
          objectItems.push({rainey_id: r_id, qty_in_kit: item.data[1], description: item.data[4], selected: true });
  
        })
      } catch (error) {
        console.error("Failed to parse data", error)
      }
      

      updateObject.items = [...objectItems];

      console.log("updateObject", updateObject);
      setActiveImportItem(updateObject)
      setCheckItems(true);
      setShouldUpdate(true);
    }
  
    const handleOnError = (err, file, inputElem, reason) => {
      console.error(err, reason)
      cogoToast.error("Failed to Import");
    }
  
    const handleOnRemoveFile = (data) => {
      console.log('remove',data)
    }
    
    return(
        <React.Fragment>     
            
            <Dialog PaperProps={{className: classes.dialog}} open={importKitModalOpen } onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{`Import Kit`}</DialogTitle>
                <DialogContent className={classes.content}>
                    
                    {activeStep === 0 && 
                    <div className={classes.csvReaderDiv}>
                      <div className={classes.CSVReader}>
                          <CSVReader
                          onDrop={handleOnDrop}
                          onError={handleOnError}
                          addRemoveButton
                          removeButtonColor='#659cef'
                          onRemoveFile={handleOnRemoveFile}
                          className={classes.CSVReader}
                          >
                            <span className={classes.csvSpan}>Drop CSV file here or click to upload.</span>
                          </CSVReader>
                    </div>
                   </div>
                    }
                    {activeStep === 1 && 
                        <div className={classes.formGrid}>
                            <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>Kit Info</span></div>
                            <Grid container >  
                                <Grid item xs={12} className={classes.paperScroll}>
                                    <FormBuilder 
                                        ref={saveRef}
                                        fields={kitFields} 
                                        mode={'add'} 
                                         classes={classes}
                                        formObject={activeImportItem} 
                                        setFormObject={setActiveImportItem}
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
                        {/* <Button onMouseUp={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onMouseUp={event => handleUpdateOrderOutInv(event, addSub)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >{addSub === "add" ? "ADD" : "SUBTRACT"}
                            </Button> */}
                            <HorizontalLinearStepper activeStep={activeStep} setActiveStep={setActiveStep} activeImportItem={activeImportItem} 
                            setActiveImportItem={setActiveImportItem}
                             shouldUpdate={shouldUpdate} saveRef={saveRef}/>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default ImportKitDialog;



function getSteps() {
    return ['Import CSV', 'Kit Info'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return 'Select Part';
    case 1:
      return 'Select Part\'s Manufacturer';
    case 2: 
      return 'Kit Info'
    default:
      return 'Unknown step';
  }
}

function HorizontalLinearStepper(props) {
    const classes = useStyles();
    const {activeStep, setActiveStep, saveRef, shouldUpdate, activeImportItem, setActiveImportItem} = props;
    const steps = getSteps();
    
    const handleNext = (add_and_continue = false) => {
        if(activeStep == 0 &&  !activeImportItem.items){
            cogoToast.warn("No file imported!");
            return;
        }

        if(activeStep === steps.length -1){
          //this should update to true only
          if(shouldUpdate){
            saveRef.current.handleShouldUpdate(shouldUpdate)
            .then((data)=>{
              console.log("handleNext add_and_continue", add_and_continue)
              saveRef.current.handleSaveParent(activeImportItem, null, add_and_continue)
            })
            .catch((error)=>{
              cogoToast.error("Failed to save");
              console.error("Failed to save; Couldnt update shouldUpdate", error)
              return;
            }) 
          } else{
            saveRef.current.handleSaveParent(activeImportItem, null,add_and_continue)
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
                <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
                  Back
                </Button>
  
                <Button
                  variant="contained"
                  color="primary"
                  onClick={event => handleNext(false)}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1 ?  'Import' : 'Next'}
                </Button>
                
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
    csvReaderDiv:{
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    CSVReader:{
      flexBasis: '40%',
      margin: '20px',
       width: '60%',
    },
    csvSpan:{
      fontWeight: '600',
      color: '#888',
      fontFamily: 'arial',
      
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
        color: '#330000',
        fontSize: '.8em',
        fontWeight: '600',
    },
    errorDiv:{
      textAlign: "center",
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
    headListIDDiv:{
      flexBasis: '23%',
      textAlign: 'center',
    },
    headListNameDiv:{
      flexBasis: '45%',
      textAlign: 'center',
    },
    listNameDiv:{
      flexBasis: '45%',
    },
    headListQtyDiv:{
      flexBasis: '22%',
      textAlign: 'center',
    },
    setDescSpan:{
      fontWeight: '600',
      fontFamily: 'arial',
      color: '#333',
    },
    disabledSpan:{
      color: '#999',
    },
    existsSpan:{
      color: '#5f3',
    },
    doesntExistSpan:{
      color: '#f53',
    },
    rainey_id_div:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center'
    }

    
  }));
