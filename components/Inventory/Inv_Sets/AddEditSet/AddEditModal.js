import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AccountBoxIcon from '@material-ui/icons/AccountBox';

import moment from 'moment';
import cogoToast from 'cogo-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    KeyboardDatePicker,
    TimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import Util from '../../../../js/Util.js';

import Settings from  '../../../../js/Settings';
import InventorySets from '../../../../js/InventorySets';
import { ListContext } from '../InvSetsContainer';

import FormBuilder from '../../../UI/FormComponents/FormBuilder';


const AddEditModal = function(props) {
    const {user} = props;

    const { sets, setSets, setSetsRefetch,currentView, setCurrentView, views,columnState, setColumnState, detailSetId,
        setDetailSetId,editSetModalMode,setEditSetModalMode, activeSet, setActiveSet, editSetModalOpen,setEditSetModalOpen,
         recentSets, setRecentSets} = useContext(ListContext);

    const saveRef = React.createRef();
    const classes = useStyles();

    const handleCloseModal = () => {
        setActiveSet(null);
        setEditSetModalOpen(false);
    };

   
    const fields = [
        //type: select must be hyphenated ex select-type
        { field: 'description', label: 'Description', type: 'text',updateBy: 'ref', required:true }, 
        { field: 'inv_qty', label: 'In Stock',  type: 'number',updateBy: 'ref', hidden: (data)=> data?.rainey_id  },
        { field: 'num_in_set', label: '# in Set', type: 'number',updateBy: 'ref',  },
        { field: 'notes', label: 'Notes',  type: 'text',updateBy: 'ref',}, 
        { field: 'obsolete', label: 'Obsolete',   type: 'check',updateBy: 'ref', },
    ];

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        console.log("Tes");
        if(editSetModalMode == "add"){
            console.log("setting to {}")
            setActiveSet({});
        }
    },[editSetModalMode])


        

    const handleSave = (set, updateSet ,addOrEdit) => {
        return new Promise((resolve, reject)=>{
            if(!set){
                console.error("Bad work order")
                reject("Bad work order");
            }
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateSet["rainey_id"] = set.rainey_id;
                updateSet["date_updated"] = moment().format('YYYY-MM-DD HH:mm:ss');

                InventorySets.updateSet( updateSet )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Set ${set.rainey_id} has been updated!`, {hideAfter: 4});
                    setSetsRefetch(true);
                    setActiveSet(null);
                    handleCloseModal();
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating set. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                InventorySets.addNewSet( updateSet )
                .then( (data) => {
                    //Get id of new workorder and set view to detail
                    if(data && data.insertId){
                        setDetailSetId(data.insertId);
                        setCurrentView(views.filter((v)=>v.value == "setDetail")[0]);
                    }
                    cogoToast.success(`Set has been added!`, {hideAfter: 4});
                    setSetsRefetch(true);
                    setActiveSet(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding set. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    };

    const handleDeleteSet = (set) => {
        if(!set || !set.rainey_id){
            console.error("Bad set in delete Set");
            return;
        }

        const deleteEnt = () =>{
            InventorySets.deleteSet(set.rainey_id)
            .then((data)=>{
                setSetsRefetch(true);
                handleCloseModal();
                setCurrentView(views.filter((v)=>v.value == "setsList")[0]);
                cogoToast.success("Deleted Set: " + set.rainey_id);
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete set")
                console.error("Failed to delete set", error);
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete Set permanently?"}/>
                );
            }
        })
    }

    return(<>
        { editSetModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editSetModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editSetModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailSetId && activeSet ? `Edit Rainey Set#: ${activeSet.rainey_id}` : 'Add Set'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editSetModalMode} 
                                classes={classes} 
                                formObject={activeSet} 
                                setFormObject={setActiveSet}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}/>
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editSetModalMode == "edit" && activeSet?.rainey_id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeleteSet(activeSet)}
                                    variant="contained"
                                    size="large"
                                    className={classes.deleteButton}
                                >
                                    <DeleteIcon />Delete
                        </Button></ButtonGroup> :<></>}
                        <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleCloseModal()}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    Close
                                </Button></ButtonGroup>
                            <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                    onClick={ () => { console.log("1",activeSet); saveRef.current.handleSaveParent(activeSet) }}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    <SaveIcon />Save
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </div>
            </Fade>
    </Modal>}
    </>) 
    }

export default AddEditModal;

const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1 !important',
        '&& div':{
            outline: 'none',
        },
    },
    paperScroll: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
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
    paper_footer: {
        backgroundColor: '#ececec',
        padding: '1% !important',
        display: 'flex',
        justifyContent:'flex-end',
    },
    container: {
        width: '70%',
        minHeight: '50%',
        textAlign: 'center',
        
    },
    modalTitleDiv:{
        background: 'linear-gradient(0deg, #f1f1f1, white)',
        padding: '5px 0px 5px 0px',
        borderRadius: '6px 6px 0px 0px',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#444',
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
    text_button:{
        cursor: 'pointer',
        fontSize: '14px',
        color: '#fff',
        margin: '1% 2%',
        padding: '1%',
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
    }
}));