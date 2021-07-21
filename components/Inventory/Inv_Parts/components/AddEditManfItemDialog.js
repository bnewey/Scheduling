import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { AddCircleOutlineOutlined } from '@material-ui/icons';

import Inventory from '../../../../js/Inventory';
import Util from '../../../../js/Util';
import cogoToast from 'cogo-toast';
import FormBuilder from '../../../UI/FormComponents/FormBuilder';
import AddEditManfDialog from '../../Inv_Admin/MainPanels/components/AddEditManfDialog';
import clsx from 'clsx';


const AddEditManfItemDialog = (props) => {
 
    //PROPS
    const { user, activePart, manfItemId, setManfItemId, addNewManDialogOpen,setAddNewManDialogOpen, editDialogMode, setEditDialogMode, refreshFunction } = props;
    const textFieldRef = React.useRef();

    //STATE
    const [ manfItem,setManfItem] = useState(null);
    const [manufacturers, setManufacturers] = useState(null);
    const [addNewManDialog,setAddNewManDialog] = useState(false);
    const [resetForm, setResetForm] = useState(false);
    const saveRef = React.createRef();
    //CSS
    const classes = useStyles();

    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'mf_part_number', label: 'Part #', type: 'text', updateBy: 'ref', required: true},
        {field: 'default_qty', label: 'Default Qty', type: 'number', updateBy: 'ref', required: true},
        {field: 'manufacturer', label: 'Manufacturer', type: 'select-manufacturer', updateBy: 'state', required: true,
            addOn: ()=> {
                return(<div><AddEditManfDialog user={user} manf={{}} refreshFunction={()=> setManufacturers(null)}
                        addNewManDialog={addNewManDialog} setAddNewManDialog={setAddNewManDialog}/>
                        <div className={classes.newTypeButton} onClick={(event)=> handleOpenManDialog(event)}>
                        <AddCircleOutlineOutlined className={classes.addIcon} /><span>Add New</span>
                        </div>
                    </div>)
            }},
        {field: 'notes', label: 'Notes', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'url', label: 'URL', type: 'text', updateBy: 'ref'},
        {field: 'default_man', label: 'Default', type: 'check', updateBy: 'ref'},
    ];
    
    //FUNCTIONS

    const handleOpenManDialog = (event)=>{
        setAddNewManDialog(true);
    }
    useEffect(()=>{
        if(editDialogMode == "add"){
            setManfItem({})
        }

    },[editDialogMode])

    useEffect(()=>{

        if( resetForm && saveRef?.current ){
            //resets the form when you change something by state
            saveRef.current.handleResetFormToDefault()
            setResetForm(false);
        }
    },[resetForm, saveRef])

    useEffect(()=>{
        console.log("data",manfItemId)
        
        if(manfItemId){
            
            Inventory.getPartManItemById(manfItemId)
            .then((data)=>{
                setManfItem({...data[0]})
                setResetForm(true);
            })
            .catch((error)=>{
                console.error("Failed to get part manf item by id", error);
                cogoToast.error("Internal Server Error");
            })
        }
    },[manfItemId]);

    const handleDialogClose = () => {
        setAddNewManDialogOpen(false);
        setManfItem(null);
        setManfItemId(null);
        setManufacturers(null);
    };

    useEffect(()=>{
        if(manufacturers == null){
            Inventory.getManufactures()
            .then( data => { 
                setManufacturers(data);
            })
            .catch( error => {
                console.error(error);
                cogoToast.error(`Internal Server Error`, {hideAfter: 4});
            })
        }
    },[manufacturers])


    const handleSave = (og_manf_item, updateManufacturer, addOrEdit, add_and_continue)=>{
        return new Promise((resolve, reject)=>{
            if(!updateManufacturer){
                console.error("Bad item");
                reject("Bad item");
            }
            console.log("updateManufacturer item", updateManufacturer)
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                if(!og_manf_item){
                    console.error("Bad og_manf_item in edit")
                    reject("Bad og_manf_item");
                }

                updateManufacturer["id"] = og_manf_item.id;
                console.log("updateManufacturer",updateManufacturer);
                resolve();
                Inventory.updatePartManItem(updateManufacturer, user)
                .then((data)=>{
                    cogoToast.success("Updated ");

                    if(refreshFunction){
                        refreshFunction();
                    }
                    handleDialogClose();
                    resolve(data)
                })
                .catch((error)=> {
                    cogoToast.error("Failed to Update ");
                    console.error("Failed to update inv_qty", error);
                    if(refreshFunction){
                        refreshFunction();
                    }
                    handleDialogClose();
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                updateManufacturer["rainey_id"] = activePart.rainey_id

                Inventory.addNewPartManItem(updateManufacturer, user)
                .then((data)=>{
                    cogoToast.success("Added New ");

                    if(refreshFunction){
                        refreshFunction();
                    }
                    handleDialogClose();
                    resolve(data)
                })
                .catch((error)=> {
                    cogoToast.error("Failed to ADD ");
                    console.error("Failed to Add manufacturer item", error);
                    if(refreshFunction){
                        refreshFunction();
                    }
                    handleDialogClose();
                    reject(error)
                })
                }
        })
    }


    
    return(
        <React.Fragment>          
            <Dialog PaperProps={{className: classes.dialog}} open={addNewManDialogOpen} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{manfItem?.id ? `Edit ${manfItem.manufacture_name} Item` : 'Add New Manufacturer Item'}</DialogTitle>
                <DialogContent className={classes.content}>

                    <div className={classes.formGrid}>
                        <Grid container >  
                                <Grid item xs={12} className={classes.paperScroll}>
                                    <FormBuilder 
                                        ref={saveRef}
                                        fields={fields} 
                                        mode={editDialogMode} 
                                         classes={classes}
                                        formObject={manfItem} 
                                        setFormObject={setManfItem}
                                        handleClose={handleDialogClose} 
                                        handleSave={handleSave}
                                        manufacturers={manufacturers}/>
                                </Grid>
                            </Grid>
                    </div>

                    <DialogActions>
                        <Button onMouseUp={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={ () => {  saveRef.current.handleSaveParent(manfItem) }}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >{manfItem?.id ? "Update" : "Add"}
                            </Button>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default AddEditManfItemDialog;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        minWidth: '500px',
        minHeight: '280px',
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '15px 25px',
        padding: '5px',
    },
    content:{
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
        margin: '5px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
            width: '250px',
        
        
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
    newTypeButton:{
        fontFamily: 'arial',
        fontWeight: '500',
        fontSize: '.8em',
        background: 'linear-gradient( whitesmoke, #dbdbdb)',
        boxShadow: '1px 1px 2px 0px #5d7093',
        padding: '2px 5px',
        margin: '0px 10px',
        cursor: 'pointer',
        color: '#668',
        '&:hover':{
            color: '#555',
            background: 'linear-gradient( whitesmoke, #d4d4d4)',
            boxShadow: '1px 1px 2px 0px #666 ',
        },
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      addIcon:{
        width: '.8em',
        height: '.8em',
        margin: '0px 3px',
      }
    
  }));
