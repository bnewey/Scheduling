import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import DeleteIcon from '@material-ui/icons/Delete';

import cogoToast from 'cogo-toast';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    KeyboardDatePicker,
    TimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import moment from 'moment';
import Util from '../../../js/Util.js';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import Settings from  '../../../js/Settings';
import Entities from  '../../../js/Entities';
import Work_Orders from  '../../../js/Work_Orders';
import { ListContext } from '../WOContainer';
import EntitiesDrawer from './EntitiesDrawer.js';

import FormBuilder from '../../UI/FormComponents/FormBuilder';


const AddEditModal = function(props) {
    const {editModalMode} = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid, setDetailWOid,
    currentView, previousView, handleSetView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers, user} = useContext(ListContext);

    const [entityDrawerOpen, setEntityDrawerOpen] = useState(false);
    const [entityShippingContacts, setEntityShippingContacts] = useState(null);
    const [entityShippingAddresses, setEntityShippingAddresses] = useState(null);
    const [entityBillingContacts, setEntityBillingContacts] = useState(null);
    const [entityBillingAddresses, setEntityBillingAddresses] = useState(null);

    //state variables for shipping and billing logic
    const [entityShippingEntityEditChanged, setEntityShippingEntityEditChanged ] = useState(false);
    const [entityShippingContactEditChanged, setEntityShippingContactEditChanged ] = useState(false);
    const [entityBillingEntityEditChanged, setEntityBillingEntityEditChanged] = useState(false);
    const [entityBillingContactEditChanged, setEntityBillingContactEditChanged] = useState(false);

    const saveRef = React.createRef();
    const classes = useStyles();

    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);

    const handleCloseModal = () => {
        setEntityDrawerOpen(false);
        setActiveWorkOrder(null);
        setEditWOModalOpen(false);
        setEntityShippingContacts(null)
        setEntityShippingAddresses(null)
        setEntityBillingContacts(null)
        setEntityBillingAddresses(null)
        setEntityShippingEntityEditChanged(false);
        setEntityBillingEntityEditChanged(false);
        setEntityShippingContactEditChanged(false);
        setEntityBillingContactEditChanged(false);
        setSaveButtonDisabled(false);
    };

    const handleOpenEntityDraw = ()=>{
        setEntityDrawerOpen(true);
    }
   
    const fields = [
        //type: select must be hyphenated ex select-type
        {field: 'customer_id', label: 'Product Goes To', type: 'entity', updateBy: 'ref', displayField: 'c_name', onClick: ()=>handleOpenEntityDraw(),required: true},
        {field: 'customer_contact_id', label: 'Shipping Contact', type: 'select-entity-contact', updateBy: 'ref',
            hidden: (row)=> !row || (row && row['customer_id'] == null) ,required: true},
        {field: 'customer_address_id', label: 'Shipping Address', type: 'select-entity-address', updateBy: 'ref',
            hidden: (row)=> !row || (row && row['customer_contact_id'] == null),required: true },
        {field: 'account_id', label: 'Bill Goes To', type: 'entity', updateBy: 'ref', displayField: 'a_name', onClick: ()=>handleOpenEntityDraw(),required: true,},
        {field: 'account_contact_id', label: 'Billing Contact', type: 'select-entity-contact', updateBy: 'ref',
            hidden: (row)=> !row || (row && row['account_id'] == null) },
        {field: 'account_address_id', label: 'Billing Address', type: 'select-entity-address', updateBy: 'ref',
            hidden: (row)=> !row || (row && row['account_contact_id'] == null) },
        {field: 'date', label: 'Date Entered', type: 'date', updateBy: 'state',required: true},
        {field: 'requestor', label: 'Requestor', type: 'select-users', updateBy: 'ref'},
        {field: 'maker', label: 'Maker', type: 'select-users', updateBy: 'ref'},
        {field: 'type', label: 'Type', type: 'select-type', updateBy: 'ref',required: true},
        {field: 'job_reference', label: 'Job Reference', type: 'text', updateBy: 'ref'},
        {field: 'description', label: 'Description', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'notes', label: 'Notes', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'advertising_notes', label: 'Ad Notes', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'po_number', label: 'Purchase Order #', type: 'text', updateBy: 'ref'},
        {field: 'requested_arrival_date', label: 'Desired Date', type: 'date', updateBy: 'state', hidden: (row)=> row?.wo_record_id  /*hidden on edit*/},
        {field: 'completed', label: 'Completed', type: 'check', updateBy: 'ref'},
        {field: 'invoiced', label: 'Invoiced', type: 'check', updateBy: 'ref'},
    ];
    //This is currently hardcoded in formbuilder
    const types = ["Install", "Install (Drill)", "Delivery", "Parts (Mfg.)", "Parts (Service)", "Field", "Loaner", "Shipment", "Bench", "Pickup"];
    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(editModalMode == "add" && editWOModalOpen){
            setActiveWorkOrder({date: moment().format()});
        }
    },[editModalMode, editWOModalOpen])

    useEffect(()=>{
        if(!editWOModalOpen){
            return;
        }
        //Shipping Contacts
        if(activeWorkOrder?.customer_id && entityShippingContacts == null ){
            
            Entities.getDefaultContacts(activeWorkOrder.customer_id)
            .then((data)=>{
                setEntityShippingContacts(data);
                //Set default address as selected
                let updateWorkOrder = {...activeWorkOrder};
                
                //Dont set Default if were in edit and the customer_id has not been changes
                if( editModalMode == "add" || (entityShippingEntityEditChanged && editModalMode == "edit")){
                    
                    let temp =  data.find((item)=>  item.record_id == item.default_shipping)?.record_id || null;
                    //let actual = data.find((item)=>  item.record_id == activeWorkOrder.customer_contact_id)?.record_id || null;
                    updateWorkOrder["customer_contact_id"] = temp;
                    setEntityShippingContactEditChanged(true);
                }
                
                setActiveWorkOrder(updateWorkOrder);
            })
            .catch((error)=>{
                console.error("Failed to get shipping contacts", error);
                cogoToast.error("Internal Server Error");
            })
        }else{
            if(!activeWorkOrder?.customer_id && entityShippingContacts){
                setEntityShippingContacts(null);
            }
        }

        //Shipping Addresses
        if(activeWorkOrder?.customer_contact_id && entityShippingAddresses == null ){
            Entities.getDefaultAddressesForContact( activeWorkOrder.customer_id,activeWorkOrder.customer_contact_id)
            .then((data)=>{
                setEntityShippingAddresses(data);
                //Set default address as selected
                let updateWorkOrder = {...activeWorkOrder};

                //Dont set Default if were in edit and the customer_contact_id has not been changes
                if(editModalMode == "add" || ( entityShippingContactEditChanged && editModalMode == "edit")){
                    updateWorkOrder["customer_address_id"] = data.find((item)=>  item.record_id == item.default_shipping)?.record_id || null;
                }
                setActiveWorkOrder(updateWorkOrder);
            })
            .catch((error)=>{
                console.error("Failed to get shipping contacts", error);
                cogoToast.error("Internal Server Error");
            })
        }else{
            if(!activeWorkOrder?.customer_contact_id && entityShippingAddresses){
                
                setEntityShippingAddresses(null);
            }
        }

        //Billing Contacts
        if(activeWorkOrder?.account_id && entityBillingContacts == null ){
            
            Entities.getDefaultContacts(activeWorkOrder.account_id)
            .then((data)=>{
                setEntityBillingContacts(data);
                //Set default address as selected
                let updateWorkOrder = {...activeWorkOrder};

                //Dont set Default if were in edit and the account_id has not been changes
                if(editModalMode == "add" || (entityBillingEntityEditChanged && editModalMode == "edit")){
                    updateWorkOrder["account_contact_id"] = data.find((item)=>  item.record_id == item.default_billing)?.record_id || null;
                    setEntityBillingContactEditChanged(true);
                }

                setActiveWorkOrder(updateWorkOrder);
            })
            .catch((error)=>{
                console.error("Failed to get billing contacts", error);
                cogoToast.error("Internal Server Error");
            })
        }else{
            if(!activeWorkOrder?.account_id && entityBillingContacts){
                
                setEntityBillingContacts(null);
            }
        }

        //Billing Addresses
        if(activeWorkOrder?.account_contact_id && entityBillingAddresses == null ){
            
            Entities.getDefaultAddressesForContact( activeWorkOrder.account_id,activeWorkOrder.account_contact_id)
            .then((data)=>{
                setEntityBillingAddresses(data);
                //Set default address as selected
                let updateWorkOrder = {...activeWorkOrder};

                //Dont set Default if were in edit and the account_contact_id has not been changed
                if(editModalMode == "add" || (entityBillingContactEditChanged && editModalMode == "edit")){
                    updateWorkOrder["account_address_id"] = data.find((item)=>  item.record_id == item.default_billing)?.record_id || null;
                }

                setActiveWorkOrder(updateWorkOrder);
            })
            .catch((error)=>{
                console.error("Failed to get billing contacts", error);
                cogoToast.error("Internal Server Error");
            })
        }else{
            if(!activeWorkOrder?.account_contact_id && entityBillingAddresses){
               
                setEntityBillingAddresses(null);
            }
        }
        
    },[activeWorkOrder,editWOModalOpen])

        

    const handleSave = (work_order, updateWorkOrder ,addOrEdit) => {
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            if(!work_order){
                console.error("Bad work order")
                reject("Bad work order");
            }
    
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateWorkOrder["record_id"] = work_order.wo_record_id;

                Work_Orders.updateWorkOrder( updateWorkOrder , user)
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Work Order ${work_order.wo_record_id} has been updated!`, {hideAfter: 4});
                    setWorkOrders(null);
                    setActiveWorkOrder(null);
                    handleCloseModal();
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating work_order. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                Work_Orders.addWorkOrder( updateWorkOrder , user)
                .then( (data) => {
                    //Get id of new workorder and set view to detail
                    if(data && data.insertId){
                        setDetailWOid(data.insertId);
                        handleSetView(views.filter((v)=>v.value == "woDetail")[0]);
                    }
                    cogoToast.success(`Work Order has been added!`, {hideAfter: 4});
                    setWorkOrders(null);
                    setActiveWorkOrder(null);
                    handleCloseModal();
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding work_order. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    };

    const handleDeleteWO = (wo) => {
        if(!wo || !wo.wo_record_id){
            console.error("Bad wo in delete WOI");
            return;
        }

        const deleteWOI = () =>{
            Work_Orders.deleteWorkOrder(wo.wo_record_id, user)
            .then((data)=>{
                setWorkOrders(null)
                handleSetView(views.filter((v)=>v.value == "allWorkOrders")[0]);
                setDetailWOid(null);
                handleCloseModal();
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete wo")
                console.error("Failed to delete wo", error);
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteWOI} onClose={onClose} customMessage={"Delete Work Order Item permanently?"}/>
                );
            }
        })
    }

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
                        <Grid item xs={entityDrawerOpen ? 2 : 12} md={entityDrawerOpen ? 6 : 12} className={classes.paperScroll}>
                            {/*FORM*/ console.log("Job types in parent", types)}
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editModalMode} 
                                classes={classes} 
                                formObject={activeWorkOrder} 
                                setFormObject={setActiveWorkOrder}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                raineyUsers={raineyUsers} jobTypes={types}
                                entityShippingContacts={entityShippingContacts} setEntityShippingContacts={setEntityShippingContacts} 
                                entityShippingAddresses={entityShippingAddresses} setEntityShippingAddresses={setEntityShippingAddresses}
                                entityBillingContacts={entityBillingContacts} setEntityBillingContacts={setEntityBillingContacts} 
                                entityBillingAddresses={entityBillingAddresses} setEntityBillingAddresses={setEntityBillingAddresses}
                                entityShippingContactEditChanged={entityShippingContactEditChanged} setEntityShippingContactEditChanged={setEntityShippingContactEditChanged}
                                entityBillingContactEditChanged={entityBillingContactEditChanged} setEntityBillingContactEditChanged={setEntityBillingContactEditChanged}/>
                        </Grid>
                        {entityDrawerOpen && 
                            <Grid item xs={10} md={6} className={classes.paperScroll}>
                                <EntitiesDrawer  
                                     entityDrawerOpen={entityDrawerOpen} setEntityDrawerOpen={setEntityDrawerOpen} saveRef={saveRef} 
                                     setEntityShippingContacts={setEntityShippingContacts}
                                     setEntityShippingAddresses={setEntityShippingAddresses}
                                     setEntityBillingContacts={setEntityBillingContacts}
                                     setEntityBillingAddresses={setEntityBillingAddresses}
                                     entityShippingEntityEditChanged={entityShippingEntityEditChanged} setEntityShippingEntityEditChanged={setEntityShippingEntityEditChanged}
                                     entityBillingEntityEditChanged={entityBillingEntityEditChanged} setEntityBillingEntityEditChanged={setEntityBillingEntityEditChanged}
                                     />
                            </Grid>}
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editModalMode == "edit" && activeWorkOrder?.wo_record_id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeleteWO(activeWorkOrder)}
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
        [theme.breakpoints.down('sm')]: {
            width: '94%',
        },
        [theme.breakpoints.up('md')]: {
            width: '70%',
        },
        minHeight: '50%',
        textAlign: 'center',
        margin: '15px 0px',
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
        width: '95%',
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
    }
}));