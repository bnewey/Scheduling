import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import Inventory from '../../../js/Inventory';
import Util from '../../../js/Util';
import cogoToast from 'cogo-toast';

const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
    ssr: false
  });
  import dynamic from 'next/dynamic'

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';
import { InventoryContext } from '../InventoryContainer';
import { ListContext } from '../Inv_Parts/InvPartsContainer';
import clsx from 'clsx';


const EditPartInvDialog = (props) => {
 
    //PROPS
    const { part } = props;
    const { user, setPartsRefetch, setPartsSearchRefetch, currentView,setActivePart} = useContext(ListContext);
    const textFieldRef = React.useRef();
    const refreshRef= React.useRef();

    //STATE
    const [invValue, setInvValue] = useState()
    const [editInvModalOpen,setEditInvModalOpen] = useState(false);
    const [addSub, setAddSub] = useState('add');
    const [validationErrors , setValidationErrors] = useState([]);
    //CSS
    const classes = useStyles();

    //FUNCTIONS



    const handleDialogClose = () => {
        setEditInvModalOpen(false);
        setInvValue(0);
        setValidationErrors([]);
    };


  

    const handleUpdatePartInv = (event, addSub) =>{

        let updatePart = {...part};

        updatePart.old_inv_qty = updatePart["inv_qty"];
        updatePart.inv_qty = handleGetSumFromRef(invValue, part.inv_qty, addSub  )


        //Validate
        var validationArray = [];
        if(updatePart.inv_qty  < 0){
            validationArray.push("Negative Inventory not allowed")
        }
        setValidationErrors( validationArray )

        if(validationArray.length){
            cogoToast.warn("Validation errors");
            return;
        }
        //End Validation

        if(invValue === 0 || invValue === "" || invValue === null || invValue === undefined){
            cogoToast.info("No Changes");
            handleDialogClose();
            return;
        }
       
        //UpdatePartInv only updates inv_qty and tracks inventory change
        Inventory.updatePartInv(updatePart, user)
        .then((data)=>{
            cogoToast.success("Updated ");

            if(currentView.value === "partsList"){
                setPartsRefetch(true);
            }
            if(currentView.value === "partsSearch"){
                setPartsSearchRefetch(true);
            }
            if(currentView.value === "partsDetail"){
                setActivePart(null);
            }
            handleDialogClose();
        })
        .catch((error)=> {
            cogoToast.error("Failed to Update ");
            console.error("Failed to update inv_qty", error);
        })
    };

    const handleOpenEditInvModal = (event)=>{
        setEditInvModalOpen(true)
      }

    const handleChangeAddSub = (event, add_or_sub) =>{
        setAddSub(add_or_sub);
        if( textFieldRef?.current){
           textFieldRef.current.focus();
        }
        
        
    }

    const handleChangeAddSubByKey = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null || !id ){
          console.error("Bad keycode or element on handleChangeAddSubByKey");
          return;
        }
        if(keyCode === 109 && id ==  "inv_update"){ //enter key & input element's id
          try {
            setAddSub('sub');
          } catch (error) {
            console.error("Error", error);
          }
        }
        if(keyCode === 107 && id ==  "inv_update"){ //enter key & input element's id
            try {
              setAddSub('add');
            } catch (error) {
              console.error("Error", error);
            }
          }
    }

    const handleChangeInvValue = (event)=>{
        //refreshRef.current = Math.random();
        console.log("event.target.value",event.target.value)
        setInvValue( !Number.isNaN(parseInt(event.target.value)) ? parseInt(event.target.value) : '');
    }

    const handleGetSumFromRef = (value, inv_qty, add_or_sub) =>{
        if(Number.isNaN(parseInt(value))){
            return '';
        }
        //let value = ref?.current?.querySelector("#inv_update")?.value;
        let update_qty;

        switch(add_or_sub){
            case "add":
                update_qty = inv_qty + value;
                break;
            case "sub":
                update_qty = inv_qty - value;
                break;
            default: 
                console.error("Bad add or sub in switch for add_or_sub");
        }


        return parseInt(update_qty)
    }


    
    return(
        <React.Fragment>  
            <div onClick={handleOpenEditInvModal} className={classes.editDiv} >{part.inv_qty}</div>          
            
            
            <Dialog PaperProps={{className: classes.dialog}} open={editInvModalOpen} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>{part.description}</DialogTitle>
                <DialogContent className={classes.content}>

                    <div className={classes.formGrid}>
                        <div className={classes.stockDiv}>
                            <span className={classes.stockLabel}>IN STOCK: </span>
                            <span className={classes.stockValue}>{part.inv_qty}</span>
                        </div>
                       
                        <div className={classes.inputDivs}>
                            <div className={classes.addSubButtonDiv}>
                                <AddIcon onClick={(event) => handleChangeAddSub(event, "add")}
                                        className={clsx({ [classes.add_sub_button]: true, [classes.add_sub_button_active]: addSub === "add",
                                            [classes.add_button]: addSub === "add"})}/>
                                <RemoveIcon onClick={(event) => handleChangeAddSub(event, "sub")}
                                        className={clsx({ [classes.add_sub_button]: true, [classes.add_sub_button_active]: addSub === "sub",
                                            [classes.sub_button]: addSub === "sub"})}/>
                            </div>
                            <div>
                            <KeyBinding onKey={ (e) => handleChangeAddSubByKey(e.keyCode, e) } />
                                   <input id={`inv_update`} 
                                    ref={textFieldRef}
                                    
                                    autocomplete="off"
                                   variant="outlined"
                                   key={'testkey'}
                                   value={invValue}
                                   autoFocus
                                   disableAutoFocus={true}
                                   className={classes.inputRoot }
                                   onChange={(event)=>handleChangeInvValue(event)}  
                                   />
                            </div>
                        </div>
                        <div className={classes.stockDiv} key={refreshRef}>
                            <span className={classes.stockLabel}>NEW TOTAL: </span>
                            <span className={classes.stockValue}>{handleGetSumFromRef(invValue,parseInt(part.inv_qty), addSub)}</span>
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
                            onMouseUp={event => handleUpdatePartInv(event, addSub)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >{addSub === "add" ? "ADD" : "SUBTRACT"}
                            </Button>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
          
        </React.Fragment>
      
    );

} 

export default EditPartInvDialog;

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
    }
   
    
  }));
