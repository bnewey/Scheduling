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

const AddEditFPOrder = function(props) {
    const {user } = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid, setDetailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const {fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder, workOrderItems, setWorkOrderItems,fpOrderModalOpen,
        setFPOrderModalOpen, vendorTypes, shipToOptionsWOI, setShipToOptionsWOI, fpOrders, setFPOrders} = useContext(DetailContext)
    
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [errorFields,setErrorFields] = useState([]);
    const [scbdDrawerOpen, setScbdDrawerOpen] = useState(false);
    const [scbdMode, setScbdMode] = useState("add");
    const [activeFPOrderItem, setActiveFPOrderItem] = useState(null);
    const [fpOrderItems, setFPOrderItems] = useState(null);

    const classes = useStyles();

    useEffect(()=>{
        if(activeFPOrder?.record_id && fpOrderItems == null){
            WorkOrderDetail.getFPOrderItems( scbd.record_id )
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
    },[activeFPOrder])

    const handleCloseModal = () => {
        setActiveFPOrder(null);
        setFPOrderModalOpen(false);
        setShouldUpdate(false);
        setErrorFields([]);
    };

    const handleShouldUpdate = (update) =>{
        setShouldUpdate(update)
    }


    const fpOrderFields = [
        //type: select must be hyphenated ex select-type
        {field: 'order_date', label: 'Order Date', type: 'date', updateBy: 'state', defaultValue: moment().format('MM/DD/YYYY')},
        {field: 'ordered_by', label: 'Ordered By', type: 'select-users', updateBy: 'state'},
        {field: 'ship_to', label: 'Ship To', type: 'text', updateBy: 'ref', multiline: true,
                defaultValue: 'To be picked up by our freight truck for delivery to Rainey Electronics, Inc. in Little Rock, AR'},
        {field: 'bill_to', label: 'Bill To', type: 'text', updateBy: 'ref', multiline: true,
                defaultValue: "Rainey Electronics, Inc. Attn: Bob Rainey 19023 Colonel Glenn Road Little Rock, AR 72210"},
        {field: 'discount', label: 'Discount', type: 'number', updateBy: 'ref',defaultValue: 0 },
        {field: 'sales_order_id', label: 'Sales Order #', type: 'text', updateBy: 'ref'},
        {field: 'special_instructions', label: 'Special Instructions', type: 'text', updateBy: 'ref', multiline: true},
    ];

    const fpScbdFields = [
        //{field: 'scoreboard_or_sign', label: '', type: 'radio-scbd_or_sign', updateBy: 'state',required: true,defaultValue: 0 ,},
        {field: 'model', label: 'Model', type: 'text', updateBy: 'ref',required: true},
        {field: 'model_quantity', label: 'Quantity*', type: 'number', updateBy: 'ref',required: true, defaultValue: 1},
        {field: 'color', label: 'Color', type: 'text', updateBy: 'ref'},
        {field: 'trim', label: 'Trim', type: 'text', updateBy: 'ref'},
        {field: 'controller', label: 'Controller', type: 'text', updateBy: 'ref'},
        {field: 'controller_quantity', label: 'Quantity*', type: 'number', updateBy: 'ref',required: true, defaultValue: 1},
        {field: 'ctrl_case', label: 'Case', type: 'text', updateBy: 'ref'},
        {field: 'horn', label: 'Horn', type: 'text', updateBy: 'ref'},
        // {field: 'scoreboard_arrival_date', label: 'Arrival Date', type: 'date', updateBy: 'state'},
        // {field: 'scoreboard_arrival_status', label: 'Arrival Status', type: 'text', updateBy: 'ref'},
    ];
    
    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(fpOrderModalOpen && fpOrderModalMode == "add"){
            setActiveFPOrder({order_date: moment().format('MM/DD/YYYY') });
        }
    },[fpOrderModalMode, fpOrderModalOpen])


    //Building an object of refs to update text input values instead of having them tied to state and updating every character
    const buildRefObject = arr => Object.assign({}, ...Array.from(arr, (k) => { return ({[k]: useRef(null)}) }));
    
    const [ref_object, setRef_Object] = React.useState(buildRefObject(fpOrderFields.map((v)=> v.field)));

    const item_types = [];

    const handleInputOnChange = (value, should, type, key) => {
        if(value == null || !type || !key){
            console.error("Bad handleInputOnChange call");
            return;
        }
        
        var tmpWOI = {...activeFPOrder};

        if(type === "date") {
            tmpWOI[key] = Util.convertISODateTimeToMySqlDateTime(value);
        }
        if(type.split('-')[0] === "select"){
            tmpWOI[key] = value.target.value;
        }
        if(type.split('-')[0] === "radio"){
            tmpWOI[key] = value;
        }

        setActiveFPOrder(tmpWOI);
        setShouldUpdate(should);
    }

    const getInputByType =(field , ref_object)=>{
        if(!field || field.type == null){
            console.error("Bad field");
            return;
        }

        var error = errorFields.filter((v)=> v.field == field.field).length > 0 ? true : false;
        
        switch(field.type){
            case 'text':
            case 'number':
                return(<div className={classes.inputValue}>
                    <TextField id={field.field} 
                            error={error}
                             variant="outlined"
                             multiline={field.multiline}
                             inputRef={ref_object[field.field]}
                             inputProps={{className: classes.inputStyle}} 
                             classes={{root: classes.inputRoot, multiline: classes.multiline}}
                             defaultValue={ activeFPOrder && activeFPOrder[field.field] ? activeFPOrder[field.field] : field?.defaultValue  }
                             onChange={()=>handleShouldUpdate(true)}  /></div>
                )
                break;
            case 'date':
                return(<div className={classes.inputValue}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker className={classes.inputStyleDate} 
                                    error={error}
                                    inputVariant="outlined"  
                                    disableFuture={field.field == "date" }
                                    onChange={(value, value2)=> {
                                        handleInputOnChange(value, true, field.type, field.field)
                                        
                                    }}
                                    value={activeFPOrder &&  activeFPOrder[field.field] ? Util.convertISODateTimeToMySqlDateTime(activeFPOrder[field.field]) : null}
                                    inputProps={{className: classes.inputRoot}} 
                                    format={'M/dd/yyyy'}
                                    />
                </MuiPickersUtilsProvider></div>);
                break;
            case 'select-users':
                return(<div className={classes.inputValueSelect}>
                    <Select
                        error={error}
                        id={field.field}
                        value={activeFPOrder && activeFPOrder[field.field] ? activeFPOrder[field.field] : 0}
                        inputProps={{classes:  classes.inputSelect}}
                        onChange={value => handleInputOnChange(value, true, field.type, field.field)}
                        native
                    >
                        <option value={0}>
                            Select
                        </option>
                        {raineyUsers && raineyUsers.map((user)=>{
                            return (
                                <option value={user.user_id}>
                                    {user.name}
                                </option>
                            )
                        })}
                    </Select></div>
                )
                break;
            case 'check':
                return(
                    <div className={classes.inputValue}>
                    <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        name="checkedI"
                        checked={activeFPOrder && activeFPOrder[field.field] ? activeFPOrder[field.field] == 1 ? true : false : false}
                        onChange={(event)=> handleInputOnChange(event.target.checked ? 1 : 0, true, field.type, field.field)}
                    /></div>
                )
                break;
            
            default: 
                return <></>
                break;
        }
    }

    const handleSave = fpOrder => {
        console.log("Trying to save");
        if(!fpOrder){
            console.error("Bad work order item")
            return;
        }
        var addOrEdit = fpOrderModalMode;
        
 
        if(shouldUpdate){
            var updateFpOrder = {...fpOrder};

            //Create Object with our text input values using ref_object
            const objectMap = (obj, fn) =>
                Object.fromEntries(      Object.entries(obj).map( ([k, v], i) => [k, fn(v, k, i)]  )        );
            var textValueObject = objectMap(ref_object, v => v.current ? v.current.value ? v.current.value : null : null );

            //Get only values we need to updateTask()
            fpOrderFields.forEach((field, i)=>{
                const type = field.type;
                switch(type){
                    case 'text':
                        //Get updated values with textValueObject bc text values use ref
                        if(textValueObject[field.field])
                            updateFpOrder[field.field] = textValueObject[field.field];
                        break;
                    case 'number':
                         //Get updated values with textValueObject bc number values use ref
                         if(textValueObject[field.field])
                         updateFpOrder[field.field] = parseInt(textValueObject[field.field]);
                     break;
                    case 'date':
                        if(textValueObject[field.field])
                            updateFpOrder[field.field] = Util.convertISODateToMySqlDate(textValueObject[field.field]);
                        break;
                    default:
                        //Others are updated with fpOrder (activeFPOrder) state variable
                        if(fpOrder[field.field])
                            updateFpOrder[field.field] = fpOrder[field.field];
                        break;
                }
            })

            console.log("UPDATE", updateFpOrder);
            

            //Validate Required Fields
            var empty_required_fields = fpOrderFields.
                    filter((v,i)=> v.required && !(v.hidden && v.hidden(activeFPOrder) )).
                    filter((item)=> updateFpOrder[item.field] == null || updateFpOrder[item.field] == undefined);;
            if(empty_required_fields.length > 0){
                cogoToast.error("Required fields are blank");
                setErrorFields(empty_required_fields);
                console.error("Required fields are blank", empty_required_fields)
                return;
            }
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateFpOrder["record_id"] = fpOrder.record_id;

                WorkOrderDetail.updateFpOrder( updateFpOrder )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Work Order Item ${fpOrder.record_id} has been updated!`, {hideAfter: 4});
                    setFPOrders(null);
                    handleCloseModal();
                })
                .catch( error => {
                    console.error("Error updating fpOrder.",error);
                    cogoToast.error(`Error updating fpOrder. ` , {hideAfter: 4});
                })
            }
            if(addOrEdit == "add"){
                updateFpOrder["work_order"] = activeWorkOrder.wo_record_id;
                WorkOrderDetail.addFPOrder( updateFpOrder )
                .then( (data) => {
                    //Get id of new workorder item 
                    if(data && data.insertId){
                        setFPOrders(null);
                        //setFPOrderItems(null);
                    }
                    cogoToast.success(`Work Order Item has been added!`, {hideAfter: 4});
                    handleCloseModal();
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding fpOrder. ` , {hideAfter: 4});
                })
            }
            
        }else{
            
            if(addOrEdit == "add"){
                cogoToast.info("Empty Form not allowed");
            }else{
                cogoToast.info("No Changes made");
                handleCloseModal();
            }
            
        }
        
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
                    {ref_object ? 
                    <Grid container className={classes.grid_container} >  
                        <Grid item xs={ scbdDrawerOpen ?  7 : 12} className={clsx(classes.paperScroll, {
                                                                    [classes.paperScrollAddItem]: scbdDrawerOpen,
                                                                })}><>
                            {/*FORM*/}
                            {fpOrderFields.map((field, i)=>{
                                if(field?.hidden && field.hidden(activeFPOrder)){
                                    return (<></>);
                                }
                                return(
                                <div className={classes.inputDiv}>  
                                    <span className={classes.inputLabel}>{field.label}</span>
                                    {getInputByType(field, ref_object)}
                                </div>)
                            })}
                            <hr/>
                            <ScoreboardList scbdDrawerOpen={scbdDrawerOpen} setScbdDrawerOpen={setScbdDrawerOpen} 
                                    activeFPOrderItem={activeFPOrderItem} setActiveFPOrderItem={setActiveFPOrderItem}
                                    fpOrderItems={fpOrderItems} setFPOrderItems={setFPOrderItems} scbdMode={scbdMode} setScbdMode={setScbdMode}/>
                            </>
                        </Grid>
                         
                            {scbdDrawerOpen && 
                            <Grid item xs={5} className={classes.paperScroll}>
                                <>
                                
                                <ScoreboardDrawer handleInputOnChange={handleInputOnChange}  
                                     scbdDrawerOpen={scbdDrawerOpen} setScbdDrawerOpen={setScbdDrawerOpen} 
                                     fpScbdFields={fpScbdFields} getInputByType={getInputByType}
                                     activeFPOrderItem={activeFPOrderItem} setActiveFPOrderItem={setActiveFPOrderItem}
                                     fpOrderItems={fpOrderItems} setFPOrderItems={setFPOrderItems} scbdMode={scbdMode} setScbdMode={setScbdMode}/>
                                </>
                            </Grid>}
                            
                    </Grid>
                    : <></> }

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
                                    onClick={ () => { handleSave(activeFPOrder) }}
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