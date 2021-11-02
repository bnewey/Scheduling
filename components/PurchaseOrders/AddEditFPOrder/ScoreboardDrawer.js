import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, List, ListItem, ListItemText, CircularProgress, Checkbox, InputBase, IconButton, Button} from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import cogoToast from 'cogo-toast';
import { FixedSizeList } from 'react-window';

import dynamic from 'next/dynamic'
const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

import Util from '../../../js/Util.js';
import WorkOrderDetail from  '../../../js/WorkOrderDetail';

import Settings from  '../../../js/Settings';
import FormBuilder from '../../UI/FormComponents/FormBuilder';


const ScoreboardDrawer = function(props) {
    const {user, scbdDrawerOpen, setScbdDrawerOpen, fpScbdFields, activeFPOrderItem, setActiveFPOrderItem,
        fpOrderItems, setFPOrderItems, scbdMode, setScbdMode, resetFPDrawerForm, setResetFPDrawerForm,activeFPOrder,  fpOrderModalMode,} = props;



    const classes = useStyles();
    const saveRef = React.createRef();
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);

    useEffect(()=>{

        if( resetFPDrawerForm && saveRef?.current ){
            //resets the form when you change something by state
            saveRef.current.handleResetFormToDefault()
            setResetFPDrawerForm(false);
        }
    },[resetFPDrawerForm, saveRef])

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(scbdDrawerOpen && scbdMode == "add"){
            setResetFPDrawerForm(true);
            
            let a = fpScbdFields.filter((item)=> item.defaultValue ? true : false).reduce((map, obj)=> {
                 map[obj.field] = obj.defaultValue;
                 return map;
            }, {});
            setActiveFPOrderItem( a);
        }
    },[scbdMode, scbdDrawerOpen])

    useEffect(()=>{
        if(scbdDrawerOpen == false){
            handleCloseScbdDrawer();
        }
    },[scbdDrawerOpen])
     
    const handleSave = (fpoItem, updateFPOItem, scbdAddOrEdit) => {

        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            if(!fpoItem){
                console.error("Bad work order item")
                reject("Bad fpOItem");
            }
        
                    
            //Add Id to this new object
            if(scbdMode == "edit"){
                updateFPOItem["record_id"] = fpoItem.record_id;
                //edit and refetch
                if(fpOrderModalMode =="edit"){
                    WorkOrderDetail.updateFPOrderItem(updateFPOItem, user)
                    .then((data)=>{
                        if(data){
                            //refetch
                            setFPOrderItems(null);
                            handleCloseScbdDrawer();
                            resolve(data)
                        }
                    })
                    .catch((error)=>{
                        cogoToast.error("Failed to update existing item");
                        console.error("Failed to update existing item", error)
                        reject(error)
                    })
                }
                //set items to state and we will add items with FP order later
                if(fpOrderModalMode == "add"){
                    if(!activeFPOrderItem.tmp_record_id){
                        console.warn("No tmp_record_id for activeFPOrderItem.")
                    }
                    
                    var index;
                    var items = fpOrderItems ? [...fpOrderItems] : [];
                    var itemToUpdate = items.find((item,i)=> { 
                        if(item.tmp_record_id == activeFPOrderItem.tmp_record_id){
                            index = i;
                            return true;
                        }else{
                            return false;
                        }
                        
                    })

                    if(updateFPOItem){
                        items.splice(index, 1, updateFPOItem);
                    }

                    //set items and we will save these on FP order save
                    setFPOrderItems(items);
                    handleCloseScbdDrawer();
                    resolve()
                }
                
                
            }
            if(scbdMode == "add"){
                
                
                if(fpOrderModalMode =="edit"){
                    updateFPOItem["fairplay_order"] = activeFPOrder.record_id;
                    //record_id exists so we can add item immediately
                    WorkOrderDetail.addNewFPOrderItem(updateFPOItem, user)
                    .then((data)=>{
                        if(data){
                            //refetch
                            setFPOrderItems(null);
                            handleCloseScbdDrawer();
                            resolve(data)
                        }
                    })
                    .catch((error)=>{
                        cogoToast.error("Failed to add item");
                        console.error("Failed to add item", error)
                        reject(error);
                    })

                }
                if(fpOrderModalMode =="add"){
                    //Give random id so that we can identify when editing item before its into DB
                    updateFPOItem["tmp_record_id"] = Math.floor((Math.random() * 10000) + 1);
                    //add later


                    //set items and we will save these on FP order save
                    //setFPOrderItems(items);
                    // handleCloseScbdDrawer();
                    var items = fpOrderItems ? [...fpOrderItems, updateFPOItem] : [updateFPOItem];
                    setFPOrderItems(items);
                    handleCloseScbdDrawer();
                    resolve()

                }
                
            }
        })
        
    };

    const handleDeleteItem = (deleteItem)=>{
        if(!deleteItem ||  !(deleteItem.record_id || deleteItem.tmp_record_id)){
            console.error("Bad id or deleteItem to delete");
            return;
        }
        //In DB
        if(deleteItem.record_id){
            WorkOrderDetail.deleteFPOrderItem(deleteItem.record_id, user)
            .then((data)=>{
                if(data){
                    setFPOrderItems(null)
                    handleCloseScbdDrawer();
                }
            })
            .catch((error)=>{
                cogoToast.error("Failed to delete item");
                console.error("Failed to delete item", error)
            })
        }
        //If item is not in DB 
        if(deleteItem.tmp_record_id){
            var index;
            var items = fpOrderItems ? [...fpOrderItems] : [];
            //Find index
            var itemToDelete = items.find((item,i)=> { 
                
                if(item.tmp_record_id == deleteItem.tmp_record_id){
                    index = i;
                    return true;
                }else{
                    return false;
                }
                
            })

            if(itemToDelete){
                items.splice(index, 1);
            }
            setFPOrderItems(items);
            handleCloseScbdDrawer();
        }
        
    }
    
    const handleCloseScbdDrawer = () =>{
        setSaveButtonDisabled(false);
        setScbdDrawerOpen(false);
        setActiveFPOrderItem({});
    }

    
    return(
        <div className={classes.root}>
            <div className={classes.absCloseButton}>
                <IconButton    aria-label="clear-search" onClick={event=> handleCloseScbdDrawer()}>
              <ClearIcon />
            </IconButton></div>
            <div className={classes.titleDiv}>
                <span className={classes.titleSpan}>Add Scoreboard</span>
            </div>

            <div className={classes.listDiv}>
                <>
                    <FormBuilder 
                        ref={saveRef}
                        fields={fpScbdFields} 
                        mode={scbdMode} 
                        classes={classes} 
                        formObject={activeFPOrderItem} 
                        setFormObject={setActiveFPOrderItem}
                        handleClose={handleCloseScbdDrawer} 
                        handleSave={handleSave}
                         />
                </>
            </div>
            <div className={classes.buttonDiv}>
                <Button variant="outlined" onClick={event => handleCloseScbdDrawer()}>Cancel</Button>
                { scbdMode == "edit" && <Button variant="outlined" onClick={event => handleDeleteItem(activeFPOrderItem)}>Delete</Button>}
                <Button disabled={saveButtonDisabled} variant="outlined" onClick={event => saveRef.current.handleSaveParent(activeFPOrderItem)}>Save</Button>
                
            </div>
        </div>
    )
}

export default ScoreboardDrawer

const useStyles = makeStyles(theme => ({
    root:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignContent: 'center',

    },
    titleDiv:{
        padding: '5px 10px',
        marginBottom: '3px',
        borderBottom: '1px solid #aaa'
    },
    titleSpan:{
        color: '#888',
        fontSize: 15,
        textTransform: 'uppercase',
        fontFamily: 'sans-serif',
    },
    entityListItem:{
        borderBottom: '1px solid #ddd',
        padding: '5px 9px',
        background: '#fcfcfc'
    },
    entityHeadItem:{
        
        padding: '2px 4px',
        '& span':{
            fontWeight: '600',
        },
        margin: '0px 0px', 
    },
    entityDiv:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    entityNameSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '50%',
        textOverflow: 'ellipsis',
        fontWeight: '500',
    },
    entityCheckSpan:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignContent: 'center',
        flexBasis: '20%',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
    },
    entityIdSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '10%',
        textOverflow: 'ellipsis',
    },
    entityCountyOrParishSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '20%',
        textOverflow: 'ellipsis',
    },
    searchDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    searchInput:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        border:'1px solid #ccc',
        padding: '1% 2%',
        margin:'1% 2% 0% 2%',
        borderRadius: '20px',
    },
    searchLabel:{
        fontSize: 11,
        fontWeight: 600,
        color: '#666',
        marginRight: 7,
        
    },
    iconButton:{
        padding: '5px'
    },
    absCloseButton:{
        position: 'absolute',
        top:'10px',
        left: '10px',
    },
    inputDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        minHeight: '25px',
    //   padding: '4px 0px 4px 0px',
        borderBottom: '1px solid #eee'
    },
    inputLabel:{
        flexBasis: '30%',
        textAlign: 'right',
        marginRight: '35px',
        fontSize: '15px',
        color: '#787878',
    },
    inputRoot: {
        padding: '5px 7px',
        width: '100%',
        '&& .MuiOutlinedInput-multiline': {
            padding: '0px'
        },
    },
    inputStyle:{
        padding: '5px 7px',
        width: '100%',
        
    },
    inputStyleDate:{
        padding: '5px 7px',
        width: '175px',
        
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
    multiline:{
        padding: 0,
    },
    underline: {
        "&&&:before": {
          borderBottom: "none"
        },
        "&&:after": {
          borderBottom: "none"
        },
        border: '1px solid #c4c4c4',
        borderRadius: 4,
        '&:hover':{
            border: '1px solid #555',
        }
    },
    optionLi:{
        padding: 0,
        borderBottom: '1px solid #ececec',
        '&:last-child':{
            borderBottom: '1px solid #fff'
        },
       
    },
    optionList:{
        padding: '5px 1px 5px 1px',
        border: '1px solid #888',
        borderTop: "none",
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'stretch',
    },
    optionDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        width: '100%',
        backgroundColor: '#fff',
        borderLeft: '2px solid #fff',
         '&:hover':{
          backgroundColor: '#d3d3d3',
          borderLeft: '2px solid #ff9007'
        },
      },
      optionSearchValueSpan:{
        fontFamily: 'sans-serif',
        color: '#000',
        overflow: 'hidden',
        maxWidth: '200px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '1px 5px 1px 5px',
      },
      optionSearchResultsSpan:{
        padding: '4px 5px 4px 10px',
        fontFamily: 'sans-serif',
        color: '#888',
        flexBasis: '20%'
      },
      autocompleteRoot:{
          width: '70%',
      },
      actualInputElement:{
        
        padding: '4px 5px !important',
        
      }
}));
