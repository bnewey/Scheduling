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

import Util from '../../../js/Util.js';

import Settings from  '../../../js/Settings';
import Work_Orders from  '../../../js/Work_Orders';
import { ListContext } from '../WOContainer';
import EntitiesDrawer from './EntitiesDrawer.js';

import FormBuilder from '../../UI/FormComponents/FormBuilder';


const AddEditModal = function(props) {
    const {user, editModalMode} = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid, setDetailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const [entityDrawerOpen, setEntityDrawerOpen] = useState(false);

    const saveRef = React.createRef();
    const classes = useStyles();

    const handleCloseModal = () => {
        setEntityDrawerOpen(false);
        setActiveWorkOrder(null);
        setEditWOModalOpen(false);
    };

    const handleOpenEntityDraw = ()=>{
        setEntityDrawerOpen(true);
    }
   
    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'customer_id', label: 'Product Goes To', type: 'entity', updateBy: 'ref', displayField: 'c_name', onClick: ()=>handleOpenEntityDraw()},
        {field: 'account_id', label: 'Bill Goes To', type: 'entity', updateBy: 'ref', displayField: 'a_name', onClick: ()=>handleOpenEntityDraw()},
        {field: 'date', label: 'Date Entered*', type: 'date', updateBy: 'state',required: true},
        {field: 'requestor', label: 'Requestor', type: 'select-users', updateBy: 'ref'},
        {field: 'maker', label: 'Maker', type: 'select-users', updateBy: 'ref'},
        {field: 'type', label: 'Type*', type: 'select-type', updateBy: 'ref',required: true},
        {field: 'job_reference', label: 'Job Reference', type: 'text', updateBy: 'ref'},
        {field: 'description', label: 'Description', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'notes', label: 'Notes', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'advertising_notes', label: 'Ad Notes', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'po_number', label: 'Purchase Order #', type: 'text', updateBy: 'ref'},
        {field: 'requested_arrival_date', label: 'Desired Date', type: 'date', updateBy: 'state'},
        {field: 'completed', label: 'Completed', type: 'check', updateBy: 'ref'},
        {field: 'invoiced', label: 'Invoiced', type: 'check', updateBy: 'ref'},
    ];

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(editModalMode == "add"){
            setActiveWorkOrder({});
        }
    },[editModalMode])

    const job_types = ["Install", "Delivery", "Parts", "Field", "Loaner", "Shipment", "Bench", "Pickup"];
        

    const handleSave = (work_order, updateWorkOrder ,addOrEdit) => {
        if(!work_order){
            console.error("Bad work order")
            return;
        }
 
        
        //Add Id to this new object
        if(addOrEdit == "edit"){
            updateWorkOrder["record_id"] = work_order.wo_record_id;

            Work_Orders.updateWorkOrder( updateWorkOrder )
            .then( (data) => {
                //Refetch our data on save
                cogoToast.success(`Work Order ${work_order.wo_record_id} has been updated!`, {hideAfter: 4});
                setWorkOrders(null);
                setActiveWorkOrder(null);
                handleCloseModal();
            })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error updating work_order. ` , {hideAfter: 4});
            })
        }
        if(addOrEdit == "add"){
            Work_Orders.addWorkOrder( updateWorkOrder )
            .then( (data) => {
                //Get id of new workorder and set view to detail
                if(data && data.insertId){
                    setDetailWOid(data.insertId);
                    setCurrentView(views.filter((v)=>v.value == "woDetail")[0]);
                }
                cogoToast.success(`Work Order has been added!`, {hideAfter: 4});
                setWorkOrders(null);
                setActiveWorkOrder(null);
                handleCloseModal();
            })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error adding work_order. ` , {hideAfter: 4});
            })
        }
        
    };

    return(<>
        { editWOModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editWOModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editWOModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailWOid && activeWorkOrder ? `Edit WO#: ${activeWorkOrder.wo_record_id}` : 'Add Work Order'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={entityDrawerOpen ? 7 : 12} className={classes.paperScroll}>
                            {/*FORM*/}
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editModalMode} 
                                classes={classes} 
                                formObject={activeWorkOrder} 
                                setFormObject={setActiveWorkOrder}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                raineyUsers={raineyUsers} job_types={job_types} />
                        </Grid>
                        {entityDrawerOpen && 
                            <Grid item xs={5} className={classes.paperScroll}>
                                <EntitiesDrawer  
                                     entityDrawerOpen={entityDrawerOpen} setEntityDrawerOpen={setEntityDrawerOpen} saveRef={saveRef}/>
                            </Grid>}
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
                                    onClick={ () => { saveRef.current.handleSaveParent(activeWorkOrder) }}
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