import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AccountBoxIcon from '@material-ui/icons/AccountBox';

import cogoToast from 'cogo-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    KeyboardDatePicker,
    TimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import Util from '../../../js/Util.js';

import Settings from  '../../../js/Settings';
import Entities from  '../../../js/Entities';
import { ListContext } from '../EntitiesContainer';

import FormBuilder from '../../UI/FormComponents/FormBuilder';


const AddEditEntity = function(props) {
    const {editModalMode} = props;

    const { entities, setEntities,
        currentView, previousView, handleSetView,views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,setEntitiesRefetch,
        editEntModalOpen, setEditEntModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, setRecentEntities, user} = useContext(ListContext);


    const saveRef = React.createRef();
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);
    const classes = useStyles();

    const handleCloseModal = () => {
        setActiveEntity(null);
        setEditEntModalOpen(false);
        setDefaultAddresses(null);
        setEntityTypes(null);
        setSaveButtonDisabled(false);
    };

    const [defaultAddresses, setDefaultAddresses] = useState(null);
    const [entityTypes, setEntityTypes] = useState(null);

    useEffect(()=>{
        if(activeEntity && defaultAddresses==null){
            console.log("active entity CONTACT", activeEntity);

            Entities.getDefaultContacts(activeEntity.record_id)
            .then((data)=>{
                console.log("Entity Default Contacts", data);
                setDefaultAddresses(data);
            })
            .catch((error)=>{
                console.error("Failed to get default addresses for entity addedit form")
            })
        }

        if(entityTypes == null){
            Entities.getEntityTypes()
            .then((data)=>{
                setEntityTypes(data);
            })
            .catch((error)=>{
                console.error("Failed to get entity types for entity addedit form")
            })
        }
    },[activeEntity])

    
   
    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'name', label: 'Name', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'county_or_parish', label: 'County or Parish', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'entities_types_id', label: 'Entity Type', type: 'select-entity-type', updateBy: 'ref',required: true},
        {field: 'class', label: 'Class', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'other_organization', label: 'Other Organization', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'phone', label: 'Phone', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'fax', label: 'Fax', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'website', label: 'Website', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'shipping', label: 'Default Shipping Contact', type: 'select-default-address', updateBy: 'ref'},
        {field: 'billing', label: 'Default Billing Contact', type: 'select-default-address', updateBy: 'ref'},
        {field: 'mailing', label: 'Default Mailing Contact', type: 'select-default-address', updateBy: 'ref'},
        {field: 'account_number', label: 'Account Number', type: 'text', updateBy: 'ref'},
        {field: 'purchase_order_required', label: 'Purchase Order Required', type: 'check', updateBy: 'ref'},
        {field: 'prepayment_required', label: 'Prepayment Required', type: 'check', updateBy: 'ref'},
        {field: 'notes', label: 'Notes', type: 'text', updateBy: 'ref', multiline: true},
    ];


    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(editModalMode == "add"){
            setActiveEntity({});
        }
    },[editModalMode])


    const handleSave = (entity, updateEntity ,addOrEdit) => {
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            if(!entity){
                console.error("Bad entity")
                reject("Bad entity");
            }

            updateEntity["entities_id"] = activeEntity.record_id;
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateEntity["record_id"] = entity.record_id;

                Entities.updateEntity( updateEntity, user )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Entity ${entity.record_id} has been updated!`, {hideAfter: 4});
                    setEntitiesRefetch(null);
                    setActiveEntity(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating entity. ` , {hideAfter: 4});
                    reject(error);
                })
            }
            if(addOrEdit == "add"){
                Entities.addEntity( updateEntity, user )
                .then( (data) => {
                    //Get id of new workorder and set view to detail
                    if(data && data.insertId){
                        setDetailEntityId(data.insertId);
                        handleSetView(views.filter((v)=>v.value == "entityDetail")[0]);
                    }
                    cogoToast.success(`Entity has been added!`, {hideAfter: 4});
                    setEntitiesRefetch(null);
                    setActiveEntity(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding entity. ` , {hideAfter: 4});
                    reject(error);
                })
            }
        })
    };

    const handleDeleteEntity = (entity) => {
        if(!entity || !entity.record_id){
            console.error("Bad entity in delete Entity");
            return;
        }

        const deleteEnt = () =>{
            Entities.deleteEntity(entity.record_id, user)
            .then((data)=>{
                setEntitiesRefetch(true);
                handleCloseModal();
                handleSetView(views.filter((v)=>v.value == "allEntities")[0]);
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete entity")
                console.error("Failed to delete entity", error);
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete Entity permanently?"}/>
                );
            }
        })
    }


    return(<>
        { editEntModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editEntModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editEntModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailEntityId && activeEntity ? `Edit Entity #: ${activeEntity.record_id}` : 'Add Entity'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            {/*FORM*/}
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editModalMode} 
                                classes={classes} 
                                formObject={activeEntity} 
                                setFormObject={setActiveEntity}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                entityTypes={entityTypes} defaultAddresses={defaultAddresses}
                                 />
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editModalMode == "edit" && activeEntity?.record_id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeleteEntity(activeEntity)}
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
                                    disabled={saveButtonDisabled}
                                    onClick={ () => { saveRef.current.handleSaveParent(activeEntity) }}
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

export default AddEditEntity;

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
        [theme.breakpoints.down('sm')]: {
            width: '94%',
        },
        [theme.breakpoints.up('md')]: {
            width: '70%',
        },
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
    },
    deleteButton:{
        backgroundColor: '#c4492e',
        '&:hover':{
            backgroundColor: '#f81010',
        }
    },
}));