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
import Search from '../../Inv_Parts/Toolbar/Components/Search';


const AddEditKitItemDialog = (props) => {
 
    //PROPS
    const { kit, addEditKitItemOpen,setEditKitItemOpen,setKitItems } = props;
    const { setKitsRefetch, setKitsSearchRefetch, currentView, setCurrentView,setActiveKit, views} = useContext(ListContext);

    //STATE
    const [partId, setPartId] = useState(null)
    const [partsList,setPartsList] = useState(null);
    const [partsListRefetch, setPartsListRefetch] = useState(false);
    const [partsListSearchRefetch,setPartsListSearchRefetch] = useState(false)
    const [activeStep, setActiveStep] = React.useState(0);
    const [selectedPart, setSelectedPart] = React.useState(null);
    const [partManItems,setPartManItems] = useState([]);
    const [selectedManItem, setSelectedManItem] = React.useState(null);

    const [validationErrors , setValidationErrors] = useState([]);
    const [editDialogMode, setEditDialogMode] = useState("add")
    const [setItemToSave, setKitItemToSave] = useState(null)
    const saveRef = React.createRef();
    //CSS
    const classes = useStyles();

    //FUNCTIONS
    useEffect(()=>{
        if(editDialogMode == "add"){
            setKitItemToSave({})
        }

    },[editDialogMode])


    const handleDialogClose = () => {
        setEditKitItemOpen(false);
        setPartId(0);
        setValidationErrors([]);
        setActiveStep(0)
        setSelectedPart(null);
        setSelectedManItem(null);
        setPartsList(null);
        setPartManItems([]);
        setKitItemToSave(null);
    };

    //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is kit to null
    if(((partsList == null || partsListRefetch == true)) ) {
      if(partsListRefetch == true){
        setPartsListRefetch(false);
      }

      Inventory.getAllParts()
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

   //Sign Rows
   useEffect( () =>{
    //Gets data only on initial component mount or when rows is kit to null
    if((selectedPart) ) {
      

      Inventory.getPartManItems(selectedPart.rainey_id)
      .then( data => { 
        var tmpData = [...data];

        setPartManItems(tmpData);
        tmpData.forEach((item)=> {
            console.log('item',item);
            if(item.default_man){
                setSelectedManItem(item)
                console.log("Kit default item");
            }
        })
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting partsList`, {hideAfter: 4});
      })
    }
  },[selectedPart]);


    const handleUpdateKitInv = (event, addSub) =>{

        let updateKit = {...kit};

        updateKit.old_inv_qty = updateKit["inv_qty"];
        updateKit.inv_qty = handleGetSumFromRef(partId, kit.inv_qty, addSub  )


        //Validate
        var validationArray = [];
        if(updateKit.inv_qty  < 0){
            validationArray.push("Negative Inventory not allowed")
        }
        setValidationErrors( validationArray )

        if(validationArray.length){
            cogoToast.warn("Validation errors");
            return;
        }
        //End Validation

        if(partId === 0 || partId === "" || partId === null || partId === undefined){
            cogoToast.info("No Changes");
            handleDialogClose();
            return;
        }
       
        // //UpdateKitInv only updates inv_qty and tracks inventory change
        // InventoryKits.updateKitInv(updateKit)
        // .then((data)=>{
        //     cogoToast.success("Updated ");

        //     if(currentView.value === "kitsList"){
        //         setKitsRefetch(true);
        //     }
        //     if(currentView.value === "kitsSearch"){
        //         setKitsSearchRefetch(true);
        //     }
        //     if(currentView.value === "kitsDetail"){
        //         setActiveKit(null);
        //     }
        //     handleDialogClose();
        // })
        // .catch((error)=> {
        //     cogoToast.error("Failed to Update ");
        //     console.error("Failed to update inv_qty", error);
        // })
    };

    const handleOpenEditInvModal = (event)=>{
        setEditKitItemOpen(true)
    }
    const handleGoToPart = (event)=>{
         //kit detailWOIid in local data
      window.localStorage.setItem('detailPartId', JSON.stringify(selectedPart?.rainey_id));
      
      //kit detail view in local data
      window.localStorage.setItem('currentInvPartsView', JSON.stringify("partsDetail"));
      window.localStorage.setItem('currentInventoryView', JSON.stringify("invParts"));
      
      window.open('/scheduling/inventory', "_blank");

    }

    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'qty_in_kit', label: 'Qty in Kit', type: 'number', updateBy: 'ref'},
    ];

    const handleSave = (og_set_item, setItem, addOrEdit)=>{
        return new Promise((resolve, reject)=>{
            if(!og_set_item){
                console.error("Bad item")
                reject("Bad item");
            }
    
            setItem["rainey_id"] = selectedPart.rainey_id;
            setItem["part_mf_id"] = selectedManItem.id;
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                setItem["id"] = og_set_item.id;

                InventoryKits.updateKitItem( setItem )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Kit Item ${og_set_item.id} has been updated!`, {hideAfter: 4});
                    setKitItems(null)
                    handleDialogClose()
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating kit item. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                setItem["set_rainey_id"] = kit.rainey_id;

                InventoryKits.addNewKitItem( setItem , user)
                .then( (data) => {
                    //Get id of new workorder and kit view to detail
                    cogoToast.success(`Kit item has been added!`, {hideAfter: 4});
                    setKitItems(null)
                    handleDialogClose()
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding kit item. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    }
    
    return(
        <React.Fragment>     
            
            <Dialog PaperProps={{className: classes.dialog}} open={addEditKitItemOpen} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{`Add Part to Kit`}</DialogTitle>
                <DialogContent className={classes.content}>
                    
                    {activeStep === 0 && 
                     <div className={classes.formGrid}>
                        <Search searchOpenPermanent parts={partsList} setParts={setPartsList} partsSearchRefetch={partsListSearchRefetch}
             setPartsListSearchRefetch={setPartsListSearchRefetch} currentView={currentView} setCurrentView={setCurrentView} views={views} />
                        <div className={classes.inputDivs}>
                            <VirtualizedPartTable  parts={partsList} setParts={setPartsList} partsSearchRefetch={partsListSearchRefetch}
                setPartsListSearchRefetch={setPartsListSearchRefetch} currentView={currentView} setCurrentView={setCurrentView} views={views}
                selectedPart={selectedPart} setSelectedPart={setSelectedPart}/>
                        </div>
                       
                    </div>
                    }
                    {activeStep === 1 && 
                        <div className={classes.formGrid}>
                            <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>Selecting Manufacturer Item for Part:</span></div>
                            <div className={classes.subTitleValueDiv}>
                                <span className={classes.subTitleValueIdSpan}><div className={classes.urlSpan} ><span onClick={handleGoToPart} >{selectedPart?.rainey_id}</span></div></span>
                                <span className={classes.subTitleValueDescSpan}>{selectedPart?.description}</span>
                            </div>
                             <div className={classes.inputDivs}>
                            <VirtualizedManItemTable partManItems={partManItems} selectedManItem={selectedManItem} setSelectedManItem={setSelectedManItem}
                             currentView={currentView} setCurrentView={setCurrentView} views={views}/>
                             </div>
                        </div>
                    }
                    {activeStep === 2 && 
                        <div className={classes.formGrid}>
                            <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>Kit Info</span></div>
                            <Grid container >  
                                <Grid item xs={12} className={classes.paperScroll}>
                                    <FormBuilder 
                                        ref={saveRef}
                                        fields={fields} 
                                        mode={editDialogMode} 
                                         classes={classes}
                                        formObject={setItemToSave} 
                                        setFormObject={setKitItemToSave}
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
                            onMouseUp={event => handleUpdateKitInv(event, addSub)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >{addSub === "add" ? "ADD" : "SUBTRACT"}
                            </Button> */}
                            <HorizontalLinearStepper activeStep={activeStep} setActiveStep={setActiveStep} setItemToSave={setItemToSave} 
                            setKitItemToSave={setKitItemToSave}
                             selectedPart={selectedPart} selectedManItem={selectedManItem} editDialogMode={editDialogMode} saveRef={saveRef}/>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default AddEditKitItemDialog;

const PickPartList = (props) =>{

    const {user, dimensions = {height: 300, width: 700}, rowHeight = 22, headerHeight = 30, parts, setParts, setPartsRefetch,
         currentView, setCurrentView, views,setPartsSearchRefetch,selectedPart,setSelectedPart} = props;

    

    const classes = useStyles();

    const columns = [
        { dataKey: 'rainey_id', label: 'Rainey PN', type: 'number', width: 90, align: 'center' }, 
        { dataKey: 'description', label: 'Description', type: 'text', width: 350, align: 'left' }, 
        { dataKey: 'cost_each', label: 'Cost Each', type: 'number', width: 100, align: 'right',
          format: (value)=> `$ ${value.toFixed(6)}` },
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
          style={{ minWidth: column.width,height: headerHeight  }}
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

const ManItemList = (props) =>{

    const {user, dimensions = {height: 300, width: 700}, rowHeight = 42, headerHeight = 30, partManItems, 
     currentView, setCurrentView, views,setPartsSearchRefetch,selectedManItem,setSelectedManItem} = props;

    

    const classes = useStyles();

    const columns = [
        { dataKey: 'id', label: 'ID', type: 'number', width: 40, align: 'center' }, 
        {dataKey: 'manufacture_name', label: "Manf", width: 100, align: 'center'},
        { dataKey: 'mf_part_number', label: 'Manf #', type: 'text', width: 140, align: 'left' }, 
        { dataKey: 'url', label: 'URL', type: 'text', width: 100, align: 'right',
          format: (value)=> value ? <div className={classes.urlSpan} ><a href={value}  target="_blank"><LinkIcon/></a></div> : <></> },
        { dataKey: 'notes', label: 'Notes', width: 120,type: 'text', align: 'left' }, 
        { dataKey: 'default_man', label: 'Default',type: 'number', width: 60, align: 'center' },
      ];
    
      const getRowClassName = ({ index }) => {
        const { classes, onRowClick } = props;
    
        return clsx(classes.tableRow, classes.flexContainer, {
          [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
      };
    
      const cellRenderer = ({ cellData, columnIndex, rowData}) => {
        const column = columns[columnIndex];
        //const selected = selectedManItem?.id === rowData.id;

        return(
            <TableCell className={clsx({ [classes.tableCell]:true})} 
                        component="div"
                        align={column.align}
                        variant="body"
                        style={{ minWidth: column.width, height: rowHeight, fontSize: '1em' }}>
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
          style={{ minWidth: column.width,height: headerHeight  }}
          > 
          <span>
            <div>{label}</div>
          </span>
        </TableCell>)
      };

      const handleSelectPartManItem = (event) => {
        
        setSelectedManItem({...event.rowData, index: event.index});
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
                rowCount={partManItems ? partManItems.length : 0 }
                rowGetter={({ index }) => partManItems ? partManItems[index] : null }
                rowClassName={getRowClassName}
                onRowClick={(event)=>handleSelectPartManItem(event)}
                rowStyle={(index)=> partManItems && selectedManItem && partManItems[index.index]?.id === selectedManItem?.id ? {background: '#b7dbff', border: '1px solid #2222ff'} : {} }
                scrollToIndex={selectedManItem?.index || 0}
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

    
const VirtualizedManItemTable = withStyles(styles)(ManItemList);

function getSteps() {
    return ['Part', 'Manufacturer', 'Kit Info'];
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
    const {activeStep, setActiveStep, selectedPart,selectedManItem,editDialogMode, saveRef, setItemToSave, setKitItemToSave} = props;
    const steps = getSteps();
  

  
    const handleNext = () => {
        if(activeStep == 0 &&  !selectedPart){
            cogoToast.warn("No part selected!");
            return;
        }
        if(activeStep === steps.length -1){
            saveRef.current.handleSaveParent(setItemToSave)
        }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
                  onClick={handleNext}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1 ? editDialogMode == 'add' ? 'Add': 'Update' : 'Next'}
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
    inputRoot:{
        margin: '10px 5px',
        
            padding: '10px 7px',
            fontSize: '1.5em',
            height: '1.8em',
            width: '150px',
        
        
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
    }
    /*end of formbuilder*/
   
    
  }));