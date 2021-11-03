import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,withStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField, Stepper, Step, StepLabel, ButtonGroup} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import cogoToast from 'cogo-toast';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import { AutoSizer, Column, Table } from 'react-virtualized';
import FormBuilder from '../../UI/FormComponents/FormBuilder'
import Settings from '../../../js/Settings'

import { AdminContext } from '../AdminContainer';
import clsx from 'clsx';
import _ from 'lodash';


const EditUserSettings = (props) => {
 
    //PROPS
    const {dialogOpen, setDialogOpen, userToEdit, setUserToEdit} = props;
    const {  currentView,previousView, handleSetView, views , user } = useContext(AdminContext);

    //STATE
    const [userObject, setUserObject] = useState(null);
    const [shouldUpdate, setShouldUpdate]= React.useState(false);
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);
    const saveRef = React.createRef();

    //CSS
    const classes = useStyles();

    useEffect(()=>{
        if(dialogOpen == false){
            setUserObject(null);
            setSaveButtonDisabled(false);
            setUserToEdit(null);
        }
    },[dialogOpen])

    useEffect(()=>{
        if(userObject == null && userToEdit){
            Settings.getGoogleUserById(userToEdit?.id)
            .then((data)=>{
                if(data?.user_error || data?.error){
                    throw data
                }
                var tmp = convertToFormDataObject(data[0]?.perm_string)
                console.log("tmp",tmp);
                setUserObject(tmp);
            })
            .catch((error)=>{
                console.error("Failed to get user", error);
                if(error?.user_error){
                    cogoToast.error(error.user_error);
                }else{
                    cogoToast.error("Internal Server Error");
                }
            })
        }
    }, [userObject, userToEdit])
    

    const handleDialogClose = () => {
        setDialogOpen(false);
        setShouldUpdate(false);
        setSaveButtonDisabled(false);
    };

    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'work_orders', label: 'Work Orders', type: 'check', updateBy: 'state'},
        {field: 'signs', label: 'Signs', type: 'check', updateBy: 'state'},
        {field: 'crew', label: 'Crew', type: 'check', updateBy: 'state'},
        {field: 'drill', label: 'Drill', type: 'check', updateBy: 'state'},
        {field: 'inventory', label: 'Inventory', type: 'check', updateBy: 'state'},
        {field: 'entities', label: 'Entities', type: 'check', updateBy: 'state'},
        
    ];

    const convertToFormDataObject = (perm_string) => {
        if(!perm_string){
            return ;
        }
        return _.reduce(perm_string.split(',') , function(obj,param) {
            obj[param] = true
            return obj;
           }, {});
    }

    const convertToObjectToString = (objectToConvert) => {
        if(!objectToConvert){
            return "";
        }
        return _.chain(objectToConvert).pickBy((v, k)=> v == true).keysIn().join(',').value();
    }

    const handleSave = (og_user_settings, updateSettings, addOrEdit, add_and_continue)=>{
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            

            if(!updateSettings){
                console.error("Bad item");
                reject("Bad item");
            }
    
            if(!og_user_settings){
              console.error("Bad og_user_settings in edit")
              reject("Bad og_user_settings");
            }

            Settings.updateUserPermissions(convertToObjectToString(updateSettings), userToEdit.id, user)
            .then((data)=>{
                cogoToast.success("Updated Permissions")
                setDialogOpen(false);
                setUserObject(null);
                
            })
            .catch((error)=>{
                console.error("failed to update user perm string" , error);
                if(error?.user_error){
                    cogoToast.error(error.user_error);
                }else{
                    cogoToast.error("Internal Server Error");
                }
            })
            
        })
    }

    return(
        <React.Fragment>     
            
            <Dialog PaperProps={{className: classes.dialog}} open={dialogOpen } onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{'User Settings'}</DialogTitle>
                <DialogContent className={classes.content}>
                        <div className={classes.formGrid}>
                            <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>User Settings</span></div>
                            <Grid container >  
                                <Grid item xs={12} className={classes.paperScroll}>
                                    <FormBuilder 
                                        ref={saveRef}
                                        fields={fields} 
                                        mode={ 'edit'} 
                                         classes={classes}
                                        formObject={userObject} 
                                        setFormObject={setUserObject}
                                        handleClose={handleDialogClose} 
                                        handleSave={handleSave}/>
                                </Grid>
                            </Grid>
                        </div>
                    
                    {/* {validationErrors.length > 0 ? <div className={classes.validationDiv}>
                        {validationErrors.map((error)=>
                        <span className={classes.errorSpan}>{error}</span>)}
                    </div> : <></>} */}
                    <DialogActions className={classes.dialogActions}>
                        <Grid item xs={12} className={classes.paper_footer}>
                             {/* <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                        //onClick={() => handleDeleteWO(activeWorkOrder)}
                                        variant="contained"
                                        size="large"
                                        className={classes.deleteButton}
                                    >
                                        <DeleteIcon />Delete
                            </Button></ButtonGroup>  */}
                            <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                        onClick={() => handleDialogClose()}
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        className={classes.saveButton}
                                    >
                                        Close
                                    </Button></ButtonGroup>
                                <ButtonGroup className={classes.buttonGroup}>
                                    <Button
                                        disabled={saveButtonDisabled}
                                        onClick={ () => { saveRef.current.handleSaveParent(userObject) }}
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        className={classes.saveButton}
                                    >
                                        <SaveIcon />Save
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default EditUserSettings;



const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        maxWidth:'1150px',
        minWidth: 1000,
    },
    dialogActions:{
        paddingBottom: 0,
        background: '#ddd',
        boxShadow: 'inset 0px 2px 5px 0px #5f5f5f'
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

        minHeight: '300px',
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
    },
    saveButton:{
        backgroundColor: '#414d5a'
    },
    deleteButton:{
        backgroundColor: '#c4492e',
        '&:hover':{
            backgroundColor: '#f81010',
        }
    },
    buttonGroup: {
        marginLeft: '1%',
        '& .MuiButton-label':{
            color: '#fff',
        },
        '&:hover':{
            '& .MuiButton-label':{
                color: '#52c7ff',
                
            },
        }
    },
    paper_footer: {
        backgroundColor: '#ececec',
        padding: '1% !important',
        display: 'flex',
        justifyContent:'flex-end',
    },

    
  }));
