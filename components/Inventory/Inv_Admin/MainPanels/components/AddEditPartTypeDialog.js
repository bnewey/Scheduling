import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import Inventory from '../../../../../js/Inventory';
import Util from '../../../../../js/Util';
import cogoToast from 'cogo-toast';

import clsx from 'clsx';


const AddEditPartTypeDialog = (props) => {
 
    //PROPS
    const { part_type, addNewPartTypeDialog,setAddNewPartTypeDialog, refreshFunction } = props;
    const textFieldRef = React.useRef();

    //STATE
    const [newName, setNewName] = useState("")
    //const [editInvModalOpen,setEditInvModalOpen] = useState(false);
    const [validationErrors , setValidationErrors] = useState([]);
    //CSS
    const classes = useStyles();

    //FUNCTIONS



    const handleDialogClose = () => {
        setAddNewPartTypeDialog(false);
        setNewName("");
        setValidationErrors([]);
    };


  

    const handleAddOrEdit = (event) =>{

        let updatePartType = {...part_type};

        if(newName === 0 || newName === "" || newName === null || newName === undefined){
            cogoToast.info("No Changes");
            handleDialogClose();
            return;
        }

        updatePartType["type"] = newName;
       
        //Update
        if(updatePartType.id){
            Inventory.updatePartType(updatePartType)
            .then((data)=>{
                cogoToast.success("Updated ");

                if(refreshFunction){
                    refreshFunction();
                }
                handleDialogClose();
            })
            .catch((error)=> {
                cogoToast.error("Failed to Update ");
                console.error("Failed to update inv_qty", error);
                if(refreshFunction){
                    refreshFunction();
                }
                handleDialogClose();
            })

        }else{
            //Add New
            Inventory.addNewPartType(updatePartType)
            .then((data)=>{
                cogoToast.success("Added New ");

                if(refreshFunction){
                    refreshFunction();
                }
                handleDialogClose();
            })
            .catch((error)=> {
                cogoToast.error("Failed to ADD ");
                console.error("Failed to Add part_type", error);
                if(refreshFunction){
                    refreshFunction();
                }
                handleDialogClose();
            })
        }

        
    };

 



    const handleChangeNameValue = (event)=>{
        //refreshRef.current = Math.random();
        console.log("event.target.value",event.target.value)
        setNewName( event.target.value );
    }


    
    return(
        <React.Fragment>          
            <Dialog PaperProps={{className: classes.dialog}} open={addNewPartTypeDialog} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{part_type?.id ? `Edit ${part_type.type}` : 'Add New PartType'}</DialogTitle>
                <DialogContent className={classes.content}>

                    <div className={classes.formGrid}>
                        <div className={classes.inputDivs}>
                            <span>Name: </span>
                            <div>
                                   <input id={`name_part_type`} 
                                    ref={textFieldRef}
                                    autocomplete="off"
                                   variant="outlined"
                                   key={'testkey'}
                                   value={newName}
                                   autoFocus
                                   disableAutoFocus={true}
                                   className={classes.inputRoot }
                                   defaultValue={part_type?.name}
                                   onChange={(event)=>handleChangeNameValue(event)}  
                                   />
                            </div>
                        </div>
                    </div>

                    {validationErrors.length > 0 ? <div className={classes.validationDiv}>
                        {validationErrors.map((error)=>
                        <span className={classes.errorSpan}>{error}</span>)}
                    </div> : <></>}
                    <DialogActions>
                        <Button onMouseUp={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onMouseUp={event => handleAddOrEdit(event)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >{part_type?.id ? "Update" : "Add"}
                            </Button>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default AddEditPartTypeDialog;

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
            fontSize: '18px',
            color: '#fff',
        },
        
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
    }
   
    
  }));
