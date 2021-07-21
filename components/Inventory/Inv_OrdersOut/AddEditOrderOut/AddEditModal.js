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
import InventoryOrdersOut from '../../../../js/InventoryOrdersOut';
import { ListContext } from '../InvOrdersOutContainer';

import FormBuilder from '../../../UI/FormComponents/FormBuilder';


const AddEditModal = function(props) {
    //const {} = props;

    const { user, ordersOut, setOrdersOut, setOrdersOutRefetch,currentView, setCurrentView, views,columnState, setColumnState, detailOrderOutId,
        setDetailOrderOutId,editOrderOutModalMode,setEditOrderOutModalMode, activeOrderOut, setActiveOrderOut, editOrderOutModalOpen,setEditOrderOutModalOpen,
         recentOrdersOut, setRecentOrdersOut} = useContext(ListContext);

    const saveRef = React.createRef();
    const classes = useStyles();

    const [raineyUsers, setRaineyUsers] = useState(null)

    const handleCloseModal = () => {
        setActiveOrderOut(null);
        setEditOrderOutModalOpen(false);
    };

   
    const fields = [
        //type: select must be hyphenated ex select-type
        { field: 'description', label: 'Description', type: 'text',updateBy: 'ref', required:true }, 
        { field: 'notes', label: 'Notes',  type: 'text',updateBy: 'ref',}, 
        { field: 'made_by', label: 'Made By',   type: 'select-users',updateBy: 'state', required:true },
        { field: 'requested_by', label: 'Requested By',   type: 'select-users',updateBy: 'state', required:true },
    ];

    //OrderOut active worker to a tmp value for add otherwise activeworker will be ordersOut to edit
    useEffect(()=>{
        if(editOrderOutModalMode == "add"){
            setActiveOrderOut({});
        }
    },[editOrderOutModalMode])

    useEffect(()=>{
        if(raineyUsers == null){
          Settings.getGoogleUsers()
          .then((data)=>{
            setRaineyUsers(data);
          })
          .catch((error)=>{
            cogoToast.error("Failed to get rainey users");
            console.error("failed to get rainey users", error)
          })
        }
    },[raineyUsers])
        

    const handleSave = (ordersOut, updateOrderOut ,addOrEdit) => {
        return new Promise((resolve, reject)=>{
            if(!ordersOut){
                console.error("Bad work order")
                reject("Bad work order");
            }
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateOrderOut["id"] = ordersOut.id;
                updateOrderOut["date_updated"] = moment().format('YYYY-MM-DD HH:mm:ss');

                InventoryOrdersOut.updateOrderOut( updateOrderOut, user )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`OrderOut ${ordersOut.id} has been updated!`, {hideAfter: 4});
                    setOrdersOutRefetch(true);
                    setActiveOrderOut(null);
                    handleCloseModal();
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating ordersOut. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                InventoryOrdersOut.addNewOrderOut( updateOrderOut )
                .then( (data) => {
                    //Get id of new workorder and ordersOut view to detail
                    if(data && data.insertId){
                        setDetailOrderOutId(data.insertId);
                        setCurrentView(views.filter((v)=>v.value == "ordersOutDetail")[0]);

                    }
                    cogoToast.success(`OrderOut has been added!`, {hideAfter: 4});
                    setOrdersOutRefetch(true);
                    setActiveOrderOut(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding ordersOut. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    };

    const handleDeleteOrderOut = (ordersOut) => {
        if(!ordersOut || !ordersOut.id){
            console.error("Bad ordersOut in delete OrderOut");
            return;
        }

        const deleteEnt = () =>{
            InventoryOrdersOut.deleteOrderOut(ordersOut.id, user)
            .then((data)=>{
                setOrdersOutRefetch(true);
                handleCloseModal();
                setCurrentView(views.filter((v)=>v.value == "ordersOutList")[0]);
                cogoToast.success("Deleted OrderOut: " + ordersOut.id);
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete ordersOut")
                console.error("Failed to delete ordersOut", error);
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete OrderOut permanently?"}/>
                );
            }
        })
    }

    return(<>
        { editOrderOutModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editOrderOutModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editOrderOutModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailOrderOutId && activeOrderOut ? `Edit Rainey OrderOut#: ${activeOrderOut.id}` : 'Add OrderOut'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editOrderOutModalMode} 
                                classes={classes} 
                                formObject={activeOrderOut} 
                                setFormObject={setActiveOrderOut}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                raineyUsers={raineyUsers}/>
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editOrderOutModalMode == "edit" && activeOrderOut?.id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeleteOrderOut(activeOrderOut)}
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
                                    onClick={ () => { console.log("1",activeOrderOut); saveRef.current.handleSaveParent(activeOrderOut) }}
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