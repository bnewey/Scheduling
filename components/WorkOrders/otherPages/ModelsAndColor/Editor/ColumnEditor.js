import React, {useRef, useState, useEffect, createContext} from 'react';

import {makeStyles,withStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField, Stepper, Step, StepLabel, ButtonGroup} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import cogoToast from 'cogo-toast';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../../UI/ConfirmYesNo';

import { AutoSizer, Column, Table } from 'react-virtualized';
import FormBuilder from '../../../../UI/FormComponents/FormBuilder'
import Settings from '../../../../../js/Settings'

import { ParamContext } from '../ModelContainer';
import { ListContext } from '../../../WOContainer';


import clsx from 'clsx';
import _ from 'lodash';


const EditScoreboardParams = (props) => {
    const { masterUpdater, setColors, setDesc, setModels } = React.useContext(ParamContext);

 
    //PROPS
    const {dialogOpen, setDialogOpen, itemProperty, setItemProperty, itemColumn, setItemColumn } = props;

    //FORM
    const [stringFormObject, setStringFormObject] = React.useState({
        stringField: ''
    });

    //STATE
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);
    const saveRef = React.createRef();

    //CSS
    const classes = useStyles();

    const updateStringField = (newValue) => {
        setStringFormObject(prevState => ({
            ...prevState,
            stringField: newValue,
        }));
    };

    useEffect(() => {
        if (itemProperty !== null && itemProperty !== '') {
            updateStringField(itemProperty);
        }
    }, [itemProperty]);
    

   useEffect(()=>{
        if(dialogOpen == false){
            setItemColumn(null);
            setSaveButtonDisabled(false);
            setItemProperty(null);
        }
    },[dialogOpen])


    useEffect(() => {
        if (stringFormObject && saveRef.current) {
            saveRef.current.forceUpdateFields();
        }
    }, [stringFormObject]);

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSaveButtonDisabled(false);
    };

    const fields = [
        {field: 'stringField', label: `Scoreboard Paramater`, type: 'text', updateBy: 'ref', required: true},
    ];

    //const handleDeleteScoreboardParam = (internal_user) => {
    //    if(!internal_user || !internal_user.user_id){
    //        console.error("Bad user in delete internal user");
    //        return;
    //    }

    //    handleDialogClose();

    //    const deleteIU = () =>{
    //        Settings.deleteRaineyUser(internal_user.user_id, user)
    //        .then((data)=>{
    //            setDialogOpen(false);
    //            setShouldUpdate(false);
    //            setSaveButtonDisabled(false);
    //            setRaineyUserToEdit(null);
    //        })
    //        .catch((error)=>{
    //            cogoToast.error("Failed to Delete internal user")
    //            console.error("Failed to delete internal user", error);
    //        })
    //    }

    //    confirmAlert({
    //        customUI: ({onClose}) => {
    //            return(
    //                <ConfirmYesNo onYes={deleteIU} onClose={onClose} customMessage={"Delete this Internal User permanently?"}/>
    //            );
    //        }
    //    })
    //}

    const handleSave = (og_itemProperties, updateItemProperty, addOrEdit, add_and_continue)=>{
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            

            if(!updateItemProperty){
                console.error("Bad item");
                reject("Bad item");
            }
    
            if(!og_itemProperties){
              console.error("Bad og_itemProperties in edit")
              reject("Bad og_itemProperties");
            }

            Settings.updatePastScoreboardParams( og_itemProperties, updateItemProperty, itemColumn )
            .then((data)=>{
                cogoToast.success("Updated " + updateItemProperty.stringField + ' in ' + itemColumn + 's');
                Settings.getPastScoreboardParams(itemColumn)
                .then(data => {
                    masterUpdater(data, itemColumn);
                })
                .catch(error => {
                    console.error("Error updating param table:", error);
                });
                setDialogOpen(false);
                setItemProperty(null);
            })
            .catch((error)=>{
                console.error("failed to update Scrbrd Param." , error);
                if(error?.user_error){
                    cogoToast.error(error.user_error);
                }else{
                    cogoToast.error("Internal Server Error");
                    setDialogOpen(false);
                    setItemProperty(null);
                }
            })
            
        })
    }

    return(
        <React.Fragment>     
            
            <Dialog PaperProps={{className: classes.dialog}} open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{'Update Scoreboard Params Settings'}</DialogTitle>
                <DialogContent className={classes.content}>
                        <div className={classes.formGrid}>
                            <div className={classes.subTitleDiv}><span className={classes.subTitleSpan}>Scoreboard Paramaters</span></div>
                            <Grid container >  
                                <Grid item xs={12} className={classes.paperScroll}>
                                    <FormBuilder 
                                        ref={saveRef}
                                        fields={fields} 
                                        mode={'edit'} 
                                        classes={classes}
                                        formObject={stringFormObject} 
                                        setFormObject={setStringFormObject}
                                        handleClose={handleDialogClose} 
                                        handleSave={handleSave}/>
                                </Grid>
                            </Grid>
                        </div>
                    <DialogActions className={classes.dialogActions}>
                        <Grid item xs={12} className={classes.paper_footer}>
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
                                        onClick={ () => { saveRef.current.handleSaveParent(stringFormObject) }}
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

export default EditScoreboardParams;



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
