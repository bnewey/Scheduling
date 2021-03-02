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


const AddEditEntityAddress = function(props) {
    const {setAddresses,user, activeAddress, setActiveAddress, editAddressModalOpen,  setEditAddressModalOpen,
         editAddressModalMode,setEditAddressModalMode , detailEntAddressId,setDetailEntAddressId} = props;

    const { entities, setEntities,
        currentView, setCurrentView, views,  recentEntities, setRecentEntities, activeEntity} = useContext(ListContext);

    useEffect(()=>{
        if(detailEntAddressId){
            console.log("Getting address data");
            Entities.getEntAddressById(detailEntAddressId)
            .then((data)=>{
                setActiveAddress(data[0]);
            })
            .catch((data)=>{
                console.error("Failed to get address");
                cogoToast.error("Failed to get address data");
            })
        }
    },[detailEntAddressId])
    

    const saveRef = React.createRef();
    const classes = useStyles();

    const handleCloseModal = () => {
        setActiveAddress(null);
        setEditAddressModalOpen(false);
        setDetailEntAddressId(null);
    };

    
   
    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'name', label: 'Name to Identify', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'to_name', label: 'To Name', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'address', label: 'Address', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'address2', label: 'Address2', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'city', label: 'City', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'state', label: 'State (ABRV)', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'zip', label: 'Zip', type: 'text', updateBy: 'ref', multiline: false,required: true},
        {field: 'residence', label: 'Residence', type: 'check', updateBy: 'ref'},
        {field: 'lat', label: 'Latitude', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'lng', label: 'Longitude', type: 'text', updateBy: 'ref', multiline: false},
        {field: 'geocoded', label: 'Geocoded', type: 'check', updateBy: 'ref'},
    ];

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(editAddressModalMode == "add"){
            setActiveAddress({to_name: activeEntity?.name || null});
        }
    },[editAddressModalMode])


    const handleSave = (address, updateAddress ,addOrEdit) => {
        return new Promise((resolve, reject)=>{
            if(!address){
                console.error("Bad address")
                reject("Bad address");
            }

            console.log("Address", address);
            console.log("UpdateAddress", updateAddress);
            
            updateAddress["entities_id"] = activeEntity.record_id;
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateAddress["record_id"] = address.record_id;

                Entities.updateEntityAddress( updateAddress )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Address ${address.record_id} has been updated!`, {hideAfter: 4});
                    setAddresses(null);
                    setActiveAddress(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating address. ` , {hideAfter: 4});
                    reject(error);
                })
            }
            if(addOrEdit == "add"){
                Entities.addEntityAddress( updateAddress )
                .then( (data) => {
                
                    cogoToast.success(`Address has been added!`, {hideAfter: 4});
                    setAddresses(null);
                    setActiveAddress(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding address. ` , {hideAfter: 4});
                    reject(error);
                })
            }
        })
    };

    return(<>
        { editAddressModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editAddressModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editAddressModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailEntAddressId && activeAddress ? `Edit Address #: ${activeAddress.record_id}` : 'Add Address'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            {/*FORM*/}
                            {activeAddress && <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editAddressModalMode} 
                                classes={classes} 
                                formObject={activeAddress} 
                                setFormObject={setActiveAddress}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
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
                                    onClick={ () => { saveRef.current.handleSaveParent(activeAddress) }}
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

export default AddEditEntityAddress;

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