import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AccountBoxIcon from '@material-ui/icons/AccountBox';

import cogoToast from 'cogo-toast';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    KeyboardDatePicker,
    TimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import Util from '../../../../../../js/Util.js';

import Settings from  '../../../../../../js/Settings';
import Entities from  '../../../../../../js/Entities';
import { ListContext } from '../../../../EntitiesContainer';

import FormBuilder from '../../../../../UI/FormComponents/FormBuilder';


const AddEditEntityContact = function(props) {
    const {detailEntContactId,setDetailEntContactId, activeContact, setActiveContact,editContactModalOpen, setEditContactModalOpen,
        editContactModalMode, setEditContactModalMode, setContacts} = props;

    const { entities, setEntities,
        currentView, previousView, handleSetView, views,  recentEntities, setRecentEntities, activeEntity, user} = useContext(ListContext);
    
    const [defaultAddresses, setDefaultAddresses] = useState(null);
    const [entContactTitles, setEntContactTitles] = useState(null);

    useEffect(()=>{
        if(detailEntContactId){
            console.log("Getting address data");
            Entities.getEntContactById(detailEntContactId)
            .then((data)=>{
                setActiveContact(data[0]);
            })
            .catch((data)=>{
                console.error("Failed to get address");
                cogoToast.error("Failed to get address data");
            })
        }
    },[detailEntContactId])

    useEffect(()=>{
        if(activeEntity && defaultAddresses==null){
            console.log("active entity", activeEntity)
            Entities.getDefaultAddresses(activeEntity.record_id)
            .then((data)=>{
                setDefaultAddresses(data);
            })
            .catch((error)=>{
                console.error("Failed to get default addresses for contact addedit form")
            })
        }

        if(activeEntity && activeContact && entContactTitles==null){
            console.log("active entity", activeEntity)
            Entities.getEntContactTitles(activeEntity.record_id, activeContact.record_id)
            .then((data)=>{
                setEntContactTitles(data);
            })
            .catch((error)=>{
                console.error("Failed to get contact titles for contact addedit form")
            })
        }
    },[activeEntity, activeContact])
    

    const saveRef = React.createRef();
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);
    const classes = useStyles();

    const handleCloseModal = () => {
        setActiveContact(null);
        setEditContactModalOpen(false);
        setDetailEntContactId(null);
        setSaveButtonDisabled(false);
    };

    
   
    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'name', label: 'Name', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'work_phone', label: 'Work Phone', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'home_phone', label: 'Home Phone', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'cell', label: 'Cell', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'fax', label: 'fax', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'email', label: 'Email', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'shipping', label: 'Default Shipping Address', type: 'select-default-address', updateBy: 'ref'},
        {field: 'billing', label: 'Default Billing Address', type: 'select-default-address', updateBy: 'ref'},
        {field: 'mailing', label: 'Default Mailing Address', type: 'select-default-address', updateBy: 'ref'},
        {field: 'titles', label: 'Titles', type: 'entity-titles', updateBy: 'ref'}
    ];

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(editContactModalMode == "add"){
            setActiveContact({});
        }
    },[editContactModalMode])


    const handleSave = (contact, updateContact ,addOrEdit) => {
        
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);


        return new Promise((resolve, reject)=>{
            if(!contact){
                console.error("Bad contact")
                reject();
            }

            updateContact["entities_id"] = activeEntity.record_id;
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateContact["record_id"] = contact.record_id;

                Entities.updateEntityContact( updateContact , user)
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Contact ${contact.record_id} has been updated!`, {hideAfter: 4});
                    const callback = ()=>{
                        setContacts(null);
                        setActiveContact(null);
                        handleCloseModal();
                        console.log("IT RAN!!!!!!!!!")
                    }
                    resolve({data, callback});
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating contact. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                Entities.addEntityContact( updateContact, user )
                .then( (data) => {
                
                    cogoToast.success(`Contact has been added!`, {hideAfter: 4});
                    const callback = ()=>{
                        setContacts(null);
                        setActiveContact(null);
                        handleCloseModal();
                        console.log("IT RAN!!!!!!!!!")
                    }
                    resolve({data, callback});
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding contact. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    };

    return(<>
        { editContactModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editContactModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editContactModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailEntContactId && activeContact ? `Edit Contact #: ${activeContact.record_id}` : 'Add Contact'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            {/*FORM*/}
                            {activeContact && defaultAddresses && <FormBuilder 
                                user={user}
                                ref={saveRef}
                                fields={fields} 
                                mode={editContactModalMode} 
                                classes={classes} 
                                formObject={activeContact} 
                                setFormObject={setActiveContact}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                defaultAddresses={defaultAddresses}
                                entContactTitles={entContactTitles}
                                 />}
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
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
                                    onClick={ () => { saveRef.current.handleSaveParent(activeContact) }}
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

export default AddEditEntityContact;

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
    deleteButton:{
        backgroundColor: '#b7c3cd'
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
    titleDiv:{
        width: '40%',
    },
    titleRowDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #bbb',
        padding: '2px 0px',
    },
    titleSpan:{
        fontFamily: 'sans-serif',
    },
    titleButtonSpan:{
        fontFamily: 'sans-serif',
        cursor: 'pointer',
        textDecoration: 'underline',
        marginLeft: 15,
    },
    addressTypeSpan:{
        background: '#ffdf00cc'
    }
}));