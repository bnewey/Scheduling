import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import Inventory from '../../../../../js/Inventory';
import Settings from '../../../../../js/Settings';
import Util from '../../../../../js/Util';
import cogoToast from 'cogo-toast';

import clsx from 'clsx';
import FormBuilder from '../../../../UI/FormComponents/FormBuilder';
import { InventoryContext } from '../../../InventoryContainer';


const UpdateNotificationSettingDialog = (props) => {
 
    //PROPS
    const { settingToEdit,setSettingToEdit, updateSettingDialogOpen,setUpdateSettingDialogOpen, refreshFunction } = props;
    const saveRef = React.createRef();
    const [editSetModalMode, setEditSetModalMode] = useState('add');

    //STATE
    const [newName, setNewName] = useState("")
    //const [editInvModalOpen,setEditInvModalOpen] = useState(false);
    const [validationErrors , setValidationErrors] = useState([]);
    const { user} = useContext(InventoryContext);
    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const fields = [
        //type: select must be hyphenated ex select-type
        { field: 'push', label: 'Push Notification',   type: 'check',updateBy: 'ref', },
        { field: 'notify', label: 'Basic Notification',   type: 'check',updateBy: 'ref', },
        { field: 'email', label: 'Email',   type: 'check',updateBy: 'ref', },
    ];

   

    useEffect(()=>{
        if(settingToEdit && settingToEdit.id){
            setEditSetModalMode("edit");
        }else{
            setEditSetModalMode("add");
            //setSettingToEdit({});
        }
    },[settingToEdit])

    const handleDialogClose = () => {
        setUpdateSettingDialogOpen(false);
        setNewName("");
        setValidationErrors([]);
    };




    const handleSave = (setting, updateSetting ,addOrEdit) => {
        return new Promise((resolve, reject)=>{
            if(!setting){
                console.error("Bad setting object")
                reject("Bad setting object");
            }

            updateSetting["setting"] = setting.setting_id
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateSetting["id"] = setting.id;

                Settings.updateNotificationSetting(updateSetting)
                .then((result) => {
                    if(refreshFunction){
                        refreshFunction();
                    }
                    cogoToast.success('Saved Setting');
                    
                    handleDialogClose();  
                }).catch((err) => {
                    cogoToast.error('Failed to save setting');
                    console.log('Failed to edit setting ', err);
                    
                    
                });
                
                
            }
            if(addOrEdit == "add"){
                updateSetting["googleId"] = user.googleId;

                Settings.addNotificationSetting(updateSetting)
                .then((result) => {
                    if(refreshFunction){
                        refreshFunction();
                    }
                    cogoToast.success('Saved Setting');
                    
                    handleDialogClose();  
                }).catch((err) => {
                    cogoToast.error('Failed to save setting');
                    console.log('Failed to add setting ', err);
                    
                    
                });
            }
        })
    };
 


    
    return(
        <React.Fragment>          
            <Dialog PaperProps={{className: classes.dialog}} open={updateSettingDialogOpen} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{settingToEdit?.id ? `Edit ${settingToEdit.type}` : 'Add Setting'}</DialogTitle>
                <DialogContent className={classes.content}>

                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            <FormBuilder 
                            ref={saveRef}
                            fields={fields} 
                            mode={editSetModalMode} 
                            classes={classes} 
                            formObject={settingToEdit} 
                            setFormObject={setSettingToEdit}
                            handleClose={handleDialogClose} 
                            handleSave={handleSave}/>
                        </Grid>
                   </Grid>

                    {validationErrors.length > 0 ? <div className={classes.validationDiv}>
                        {validationErrors.map((error)=>
                        <span className={classes.errorSpan}>{error}</span>)}
                        
                    </div> : <></>}
                    <DialogActions> 
                        <Button onMouseUp={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={ () => { saveRef.current.handleSaveParent(settingToEdit) }}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >{settingToEdit?.id ? "Update" : "Add"}
                            </Button>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 
export default UpdateNotificationSettingDialog;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        
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
        margin: '5px 5px',
        padding: '5px',
    },
    content:{
        minHeight: '250px',
        minWidth: '500px',
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
    inputDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        minHeight: '25px',
        borderBottom: '1px solid #eee'
    },
    inputStyle:{
        padding: '5px 7px',
        width: '100%',
    },
    inputStyleDate:{
        padding: '5px 7px',
        width: '44%',
        
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
    },
    paperScroll: {
        backgroundColor: theme.palette.background.paper,
        padding: '3% !important',
        position: 'relative',
        overflowY: 'auto',
        maxHeight: '650px',

        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },
   
    
  }));
