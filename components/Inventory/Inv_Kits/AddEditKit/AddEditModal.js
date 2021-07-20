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
import InventoryKits from '../../../../js/InventoryKits';
import { ListContext } from '../InvKitsContainer';

import FormBuilder from '../../../UI/FormComponents/FormBuilder';


const AddEditModal = function(props) {
    const {user} = props;

    const { kits, setKits, setKitsRefetch,currentView, setCurrentView, views,columnState, setColumnState, detailKitId,
        setDetailKitId,editKitModalMode,setEditKitModalMode, activeKit, setActiveKit, editKitModalOpen,setEditKitModalOpen,
         recentKits, setRecentKits} = useContext(ListContext);

    const saveRef = React.createRef();
    const classes = useStyles();

    const handleCloseModal = () => {
        setActiveKit(null);
        setEditKitModalOpen(false);
    };

   
    const fields = [
        //type: select must be hyphenated ex select-type
        { field: 'description', label: 'Description', type: 'text',updateBy: 'ref', required:true }, 
        { field: 'inv_qty', label: 'In Stock',  type: 'number',updateBy: 'ref', hidden: (data)=> data?.rainey_id  },
        { field: 'min_inv', label: 'Minimum Inv',  type: 'number',updateBy: 'ref' },
        { field: 'num_in_kit', label: '# in Kit', type: 'number',updateBy: 'ref',  },
        { field: 'storage_location', label: 'Storage Location',  type: 'text',updateBy: 'ref',  },
        { field: 'notes', label: 'Notes',  type: 'text',updateBy: 'ref',}, 
        { field: 'obsolete', label: 'Obsolete',   type: 'check',updateBy: 'ref', },
    ];

    //Kit active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        console.log("Tes");
        if(editKitModalMode == "add"){
            console.log("setting to {}")
            setActiveKit({});
        }
    },[editKitModalMode])


        

    const handleSave = (kit, updateKit ,addOrEdit) => {
        return new Promise((resolve, reject)=>{
            if(!kit){
                console.error("Bad work order")
                reject("Bad work order");
            }
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateKit["rainey_id"] = kit.rainey_id;
                updateKit["date_updated"] = moment().format('YYYY-MM-DD HH:mm:ss');

                InventoryKits.updateKit( updateKit )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Kit ${kit.rainey_id} has been updated!`, {hideAfter: 4});
                    setKitsRefetch(true);
                    setActiveKit(null);
                    handleCloseModal();
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating kit. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                InventoryKits.addNewKit( updateKit )
                .then( (data) => {
                    //Get id of new workorder and kit view to detail
                    if(data && data.insertId){
                        setDetailKitId(data.insertId);
                        setCurrentView(views.filter((v)=>v.value == "setDetail")[0]);
                    }
                    cogoToast.success(`Kit has been added!`, {hideAfter: 4});
                    setKitsRefetch(true);
                    setActiveKit(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding kit. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    };

    const handleDeleteKit = (kit) => {
        if(!kit || !kit.rainey_id){
            console.error("Bad kit in delete Kit");
            return;
        }

        const deleteEnt = () =>{
            InventoryKits.deleteKit(kit.rainey_id)
            .then((data)=>{
                setKitsRefetch(true);
                handleCloseModal();
                setCurrentView(views.filter((v)=>v.value == "kitsList")[0]);
                cogoToast.success("Deleted Kit: " + kit.rainey_id);
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete kit")
                console.error("Failed to delete kit", error);
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete Kit permanently?"}/>
                );
            }
        })
    }

    return(<>
        { editKitModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editKitModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editKitModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailKitId && activeKit ? `Edit Rainey Kit#: ${activeKit.rainey_id}` : 'Add Kit'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editKitModalMode} 
                                classes={classes} 
                                formObject={activeKit} 
                                setFormObject={setActiveKit}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}/>
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editKitModalMode == "edit" && activeKit?.rainey_id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeleteKit(activeKit)}
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
                                    onClick={ () => { console.log("1",activeKit); saveRef.current.handleSaveParent(activeKit) }}
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