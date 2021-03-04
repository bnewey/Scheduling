import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton, Radio, RadioGroup, FormControl, FormControlLabel} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import clsx from 'clsx';

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
import WorkOrderDetail from  '../../../js/WorkOrderDetail';

import Settings from  '../../../js/Settings';
import Work_Orders from  '../../../js/Work_Orders';
import { ListContext } from '../WOContainer';
import { DetailContext } from '../WOContainer';
import ScoreboardDrawer from './ScoreboardDrawer';
import ScoreboardList from './ScoreboardList';

import FormBuilder from '../../UI/FormComponents/FormBuilder';

const AddEditFPOrder = function(props) {
    const {user} = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid, setDetailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const {fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder, workOrderItems, setWorkOrderItems,fpOrderModalOpen,
        setFPOrderModalOpen, vendorTypes, shipToOptionsWOI, setShipToOptionsWOI, fpOrders, setFPOrders} = useContext(DetailContext)
    
    const [scbdDrawerOpen, setScbdDrawerOpen] = useState(false);
    const [scbdMode, setScbdMode] = useState("add");
    const [activeFPOrderItem, setActiveFPOrderItem] = useState(null);
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);

    const saveRef = React.createRef();
    
    const [fpOrderItems, setFPOrderItems] = useState(null);

    const classes = useStyles();

    useEffect(()=>{
        if(activeFPOrder?.record_id && fpOrderItems == null){
            WorkOrderDetail.getFPOrderItems( activeFPOrder.record_id )
            .then( (data) => {
                if(data){
                    setFPOrderItems(data);
                }                
            })
            .catch( error => {
                console.error("Error getting fpOrderitem.",error);
                cogoToast.error(`Error getting fpOrderitem. ` , {hideAfter: 4});
            })
        }
    },[activeFPOrder, fpOrderItems])

    useEffect(()=>{
        if(fpOrderModalOpen == false){
            handleCloseModal();
        }
    },[fpOrderModalOpen])

    const handleCloseModal = () => {
        setActiveFPOrder(null);
        setFPOrderModalOpen(false);
        setFPOrderItems(null);
        setScbdDrawerOpen(false);
        setActiveFPOrderItem(null);
    };


    const fpOrderFields = [
        //type: select must be hyphenated ex select-type
        {field: 'order_date', label: 'Order Date', type: 'date', updateBy: 'state', defaultValue: moment(new Date()).format('MM/DD/YYYY')},
        {field: 'user_entered', label: 'User Entered', type: 'select-users', updateBy: 'state', required: true},
        {field: 'ship_to', label: 'Ship To', type: 'text', updateBy: 'ref', multiline: true, required: true,
                defaultValue: 'To be picked up by our freight truck for delivery to Rainey Electronics, Inc. in Little Rock, AR'},
        {field: 'bill_to', label: 'Bill To', type: 'text', updateBy: 'ref', multiline: true, required: true,
                defaultValue: "Rainey Electronics, Inc. Attention: Bob Rainey 19023 Colonel Glenn Road Little Rock, AR 72210"},
        {field: 'discount', label: 'Discount', type: 'number', updateBy: 'ref',defaultValue: 0 },
        {field: 'sales_order_id', label: 'Sales Order #', type: 'text', updateBy: 'ref'},
        {field: 'special_instructions', label: 'Special Instructions', type: 'text', updateBy: 'ref', multiline: true},
    ];

    const fpScbdFields = [
        //{field: 'scoreboard_or_sign', label: '', type: 'radio-scbd_or_sign', updateBy: 'state',required: true,defaultValue: 0 ,},
        {field: 'model', label: 'Model', type: 'auto', updateBy: 'state',  ref: React.useRef(null),
            dataGetterFunc: async () =>{
                return new Promise(async function (resolve, reject) {
                     try{
                         var results = await Settings.getPastScoreboardParams("model")
                         resolve(results);
                     }
                     catch(error){
                         reject(error);
                         console.error("Failed to get models", error)
                     }
                })
            }},
        
        {field: 'model_quantity', label: 'Quantity*', type: 'number', updateBy: 'ref',required: true, defaultValue: 1},
        {field: 'color', label: 'Color', type: 'auto', updateBy: 'state',  ref: React.useRef(null),
            dataGetterFunc: async () =>{
                return new Promise(async function (resolve, reject) {
                    try{
                        var results = await Settings.getPastScoreboardParams("color")
                        resolve(results);
                    }
                    catch(error){
                        reject(error);
                        console.error("Failed to get colors", error)
                    }
               })
            }},
        {field: 'trim', label: 'Trim', type: 'text', updateBy: 'ref'},
        {field: 'controller', label: 'Controller', type: 'text', updateBy: 'ref'},
        {field: 'controller_quantity', label: 'Quantity*', type: 'number', updateBy: 'ref',required: true, defaultValue: 1},
        {field: 'ctrl_case', label: 'Case', type: 'text', updateBy: 'ref'},
        {field: 'horn', label: 'Horn', type: 'text', updateBy: 'ref'},
        {field: 'arrival_estimate', label: 'Arrival Estimate', type: 'date', updateBy: 'state'},
        {field: 'arrival_date', label: 'Arrival Date', type: 'date', updateBy: 'state'},
    ];
    

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(fpOrderModalOpen && fpOrderModalMode == "add"){
            setActiveFPOrder({order_date: moment(new Date()).format('MM/DD/YYYY') });
        }
    },[fpOrderModalMode, fpOrderModalOpen])


    const handleSave = (fpOrder, updateItem,addOrEdit) => {

        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            if(!fpOrder){
                console.error("Bad work order item")
                reject("Bad fpOrder");
            }
            
                
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateItem["record_id"] = fpOrder.record_id;

                WorkOrderDetail.updateFPOrder( updateItem )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Work Order Item ${fpOrder.record_id} has been updated!`, {hideAfter: 4});
                    setFPOrders(null);
                    handleCloseModal();
                    resolve(data);
                })
                .catch( error => {
                    console.error("Error updating fpOrder.",error);
                    cogoToast.error(`Error updating fpOrder. ` , {hideAfter: 4});
                    reject(error);
                })
            }
            if(addOrEdit == "add"){
                updateItem["work_order"] = activeWorkOrder.wo_record_id;
                WorkOrderDetail.addNewFPOrder( updateItem )
                .then( (data) => {
                    //Get id of new workorder item 
                    if(data && data.insertId){

                        
                        //record_id exists so we can add item immediately
                        if(fpOrderItems && Array.isArray(fpOrderItems)){
                            var updatedFPIarray = fpOrderItems.map((item)=> {item.fairplay_order = data.insertId; return item;})

                            WorkOrderDetail.addMultipleFPOrderItems(updatedFPIarray)
                            .then((data)=>{
                                if(data){
                                    //refetch
                                    setFPOrders(null);
                                    setFPOrderItems(null);
                                    cogoToast.success(`Work Order Item has been added!`, {hideAfter: 4});
                                    handleCloseModal();
                                    resolve(data)
                                }
                            })
                            .catch((error)=>{
                                cogoToast.error("Failed to add item");
                                console.error("Failed to add item", error)
                                handleCloseModal();
                                reject(error)
                            })
                        }else{
                            setFPOrders(null);
                            setFPOrderItems(null);
                            handleCloseModal();
                            resolve(data)
                        }
                        
                        
                    }else{
                        cogoToast.success(`Work Order Item has been added!`, {hideAfter: 4});
                        handleCloseModal();
                        resolve(data);
                    }
                    
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding fpOrder. ` , {hideAfter: 4});
                    reject(error);
                })
            }
            
        })
        
        
    };

    return(<>
        { fpOrderModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={fpOrderModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={fpOrderModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            { activeFPOrder?.record_id ? `Edit FairPlay Order #: ${activeFPOrder.record_id}` : 'Add FairPlay Order'} 
                        </span>
                    </div>


                    {/* BODY */}
                    
                    <Grid container className={classes.grid_container} >  
                        <Grid item xs={ scbdDrawerOpen ?  7 : 12} className={clsx(classes.paperScroll, {
                                                                    [classes.paperScrollAddItem]: scbdDrawerOpen,
                                                                })}><>
                            {/*FORM*/}
                            {/* {fpOrderFields.map((field, i)=>{
                                if(field?.hidden && field.hidden(activeFPOrder)){
                                    return (<></>);
                                }
                                return(
                                <div className={classes.inputDiv}>  
                                    <span className={classes.inputLabel}>{field.label}</span>
                                    {getInputByType(field, ref_object)}
                                </div>)
                            })} */}
                            <FormBuilder 
                                ref={saveRef}
                                fields={fpOrderFields} 
                                mode={fpOrderModalMode} 
                                classes={classes} 
                                formObject={activeFPOrder} 
                                setFormObject={setActiveFPOrder}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                shipToOptionsWOI={shipToOptionsWOI}
                                raineyUsers={raineyUsers} vendorTypes={vendorTypes} />
                            <hr/>
                            <ScoreboardList scbdDrawerOpen={scbdDrawerOpen} setScbdDrawerOpen={setScbdDrawerOpen} 
                                    activeFPOrderItem={activeFPOrderItem} setActiveFPOrderItem={setActiveFPOrderItem}
                                    fpOrderItems={fpOrderItems} setFPOrderItems={setFPOrderItems} scbdMode={scbdMode} setScbdMode={setScbdMode}/>
                            </>
                        </Grid>
                         
                            {scbdDrawerOpen && 
                            <Grid item xs={5} className={classes.paperScroll}>
                                <>
                                
                                <ScoreboardDrawer 
                                     scbdDrawerOpen={scbdDrawerOpen} setScbdDrawerOpen={setScbdDrawerOpen} 
                                     fpScbdFields={fpScbdFields} 
                                     activeFPOrderItem={activeFPOrderItem} setActiveFPOrderItem={setActiveFPOrderItem}
                                     fpOrderItems={fpOrderItems} setFPOrderItems={setFPOrderItems} scbdMode={scbdMode} setScbdMode={setScbdMode}/>
                                </>
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
                                    disabled={saveButtonDisabled}
                                    onClick={ () => { saveRef.current.handleSaveParent(activeFPOrder) }}
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

export default AddEditFPOrder;

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
        maxHeight: '750px',

        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },
    paperScrollAddItem:{
        backgroundColor: '#dadada',
        background: '#dadada',
        boxShadow: 'inset 0 0 3px 1px #989898',
    },
    paper_footer: {
        backgroundColor: '#ececec',
        padding: '1% !important',
        display: 'flex',
        justifyContent:'flex-end',
    },
    container: {
        width: '70%',
        textAlign: 'center',
    },
    grid_container:{
        minHeight: 600,
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
        width: '175px',
        
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
    radioGroup:{
        flexWrap: 'nowrap',
        justifyContent: 'center'
    },
    radioFormControl:{
        flexBasis: '70%',
    },
    radio:{
        color: '#000 !important',
    },
    multiline:{
        padding: 0,
    }
}));