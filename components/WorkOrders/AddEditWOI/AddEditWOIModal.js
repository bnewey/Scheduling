import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton, Radio, RadioGroup, FormControl, FormControlLabel} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

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
import { DetailContext } from '../WOContainer';


const AddEditWOIModal = function(props) {
    const {user } = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid, setDetailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const {editWOIModalMode,setEditWOIModalMode, activeWOI, setActiveWOI, workOrderItems, setWorkOrderItems,editWOIModalOpen,
        setEditWOIModalOpen, vendorTypes, shipToOptionsWOI, setShipToOptionsWOI} = useContext(DetailContext)
    
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [errorFields,setErrorFields] = useState([]);

    const classes = useStyles();

    const handleCloseModal = () => {
        setActiveWOI(null);
        setEditWOIModalOpen(false);
        setShouldUpdate(false);
        setErrorFields([]);
    };

    const handleShouldUpdate = (update) =>{
        setShouldUpdate(update)
    }



   
    const woi_fields = [
        //type: select must be hyphenated ex select-type
        {field: 'item_type', label: 'Item Type', type: 'radio-type', updateBy: 'state', defaultValue: 3 ,required: true},
        {field: 'quantity', label: 'Quantity*', type: 'text', updateBy: 'ref',required: true},
        {field: 'part_number', label: 'Part Number', type: 'text', updateBy: 'ref'},
        {field: 'size', label: 'Size', type: 'text', updateBy: 'ref'},
        {field: 'description', label: 'Description', type: 'text', updateBy: 'ref', multiline: true},
        {field: 'price', label: 'Price', type: 'text', updateBy: 'ref',defaultValue: (0.00).toFixed(2) ,},
        {field: 'contact', label: 'Ship To', type: 'select-ship_to', updateBy: 'state'},

        //Repair or Loaner
        {field: 'receive_date', label: 'Receive Date', type: 'date', updateBy: 'state', hidden: (current_wo)=> current_wo?.item_type == 3 },
        {field: 'receive_by', label: 'Receive By', type: 'select-users', updateBy: 'state', hidden: (current_wo)=> current_wo?.item_type == 3},

    ];

    const scbd_or_sign_fields = [
        {field: 'scoreboard_or_sign', label: '', type: 'radio-scbd_or_sign', updateBy: 'state',required: true,defaultValue: 0 ,},
        //Scoreboard OR Sign
        {field: 'vendor', label: 'Vendor', type: 'select-vendor', updateBy: 'state', hidden: (current_wo)=> current_wo?.scoreboard_or_sign == 0},
        //Scoreboard
        {field: 'model', label: 'Model', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 1},
        {field: 'color', label: 'Color', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 1},
        {field: 'trim', label: 'Trim', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 1},
        {field: 'scoreboard_arrival_date', label: 'Arrival Date', type: 'date', updateBy: 'state', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 1},
        {field: 'scoreboard_arrival_status', label: 'Arrival Status', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 1},
        //Sign
        {field: 'mount', label: 'Mount', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 2},
        {field: 'trim_size', label: 'Trim Size', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 2},
        {field: 'trim_corners', label: 'Trim Corners', type: 'text', updateBy: 'ref', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 2},
        {field: 'date_offset', label: 'Date Offset', type: 'text', updateBy: 'ref',defaultValue: 0, hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 2},
        {field: 'sign_due_date', label: 'Sign Due Date', type: 'date', updateBy: 'state', hidden: (current_wo)=> current_wo?.scoreboard_or_sign != 2},
    ];

    const scbd_or_sign_radio_options = [
        {displayField: 'Scoreboard', value: 1 },
        {displayField: 'Sign', value: 2 },
        {displayField: 'N/A', value: 0 },
    ]

    const item_type_radio_options = [
        {displayField: 'Repair', value: 1 },
        {displayField: 'Loaner', value: 2 },
        {displayField: 'Billing Item', value: 3 },
    ]

    
    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(editWOIModalOpen && editWOIModalMode == "add"){
            setActiveWOI({item_type: 3, scoreboard_or_sign: 0, date_offset: 0, price: 0.00  });
        }
    },[editWOIModalMode, editWOIModalOpen])


    // useEffect(()=>{
    //     if(activeWorkOrderItem == null){
    //         if(detailWOid){
    //             //set woi

    //         }
    //     }
    // },[activeWorkOrderItem, detailWOid])

    //Building an object of refs to update text input values instead of having them tied to state and updating every character
    const buildRefObject = arr => Object.assign({}, ...Array.from(arr, (k) => { return ({[k]: useRef(null)}) }));
    
    const [ref_object, setRef_Object] = React.useState(buildRefObject([...woi_fields.map((v)=> v.field), ...scbd_or_sign_fields.map((v)=> v.field)]));

    const item_types = [];

    const handleInputOnChange = (value, should, type, key) => {
        if(value == null || !type || !key){
            console.error("Bad handleInputOnChange call");
            return;
        }
        
        var tmpWOI = {...activeWOI};

        if(type === "date") {
            tmpWOI[key] = Util.convertISODateTimeToMySqlDateTime(value);
        }
        if(type.split('-')[0] === "select"){
            tmpWOI[key] = value.target.value;
        }
        if(type.split('-')[0] === "radio"){
            tmpWOI[key] = value;
        }

        setActiveWOI(tmpWOI);
        setShouldUpdate(should);
    }

    const getInputByType =(field)=>{
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
                             classes={{root: classes.inputRoot}}
                             defaultValue={ activeWOI && activeWOI[field.field] ? activeWOI[field.field] : field?.defaultValue  }
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
                                    value={activeWOI &&  activeWOI[field.field] ? Util.convertISODateTimeToMySqlDateTime(activeWOI[field.field]) : null}
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
                        value={activeWOI && activeWOI[field.field] ? activeWOI[field.field] : 0}
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
            case 'select-vendor':
                return(<div className={classes.inputValueSelect}>
                    <Select
                        error={error}
                        id={field.field}
                        value={activeWOI && activeWOI[field.field] ? activeWOI[field.field] : null}
                        inputProps={{classes:  classes.inputSelect}}
                        onChange={value => handleInputOnChange(value, true, field.type, field.field)}
                        native
                    >
                        <option value={null}>
                            Select
                        </option>
                        {vendorTypes && vendorTypes.map((item)=>{
                            return (
                                <option value={item.id}>
                                    {item.name}
                                </option>
                            )
                        })}
                    </Select></div>
                )
                break;
                case 'select-ship_to':
                    return(<div className={classes.inputValueSelect}>
                        <Select
                            error={error}
                            id={field.field}
                            value={activeWOI && activeWOI[field.field] ? activeWOI[field.field] : null}
                            inputProps={{classes:  classes.inputSelect}}
                            onChange={value => handleInputOnChange(value, true, field.type, field.field)}
                            native
                        >
                            <option value={null}>
                                Select
                            </option>
                            {shipToOptionsWOI && shipToOptionsWOI.map((item)=>{
                                return (
                                    <option value={item.ec_record_id}>
                                        {item.ec_name}
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
                        checked={activeWOI && activeWOI[field.field] ? activeWOI[field.field] == 1 ? true : false : false}
                        onChange={(event)=> handleInputOnChange(event.target.checked ? 1 : 0, true, field.type, field.field)}
                    /></div>
                )
                break;
            case 'radio-scbd_or_sign':
                return(
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={activeWOI && activeWOI[field.field] != null ? +activeWOI[field.field] : 0} 
                                    onChange={event => handleInputOnChange(event?.target?.value, true, field.type, field.field)}
                                    classes={{root: classes.radioGroup}}>
                                        {scbd_or_sign_radio_options.map((item=>(
                                            <FormControlLabel value={item.value} control={<Radio  classes={{checked: classes.radio }}/>} label={item.displayField} />
                                        )))}
                        </RadioGroup>
                    </FormControl>
                )
                break;
            case 'radio-type':
                return(
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={activeWOI && activeWOI[field.field] != null ? +activeWOI[field.field] : 3} 
                                    onChange={event => handleInputOnChange(event?.target?.value, true, field.type, field.field)}
                                    classes={{root: classes.radioGroup}}>
                                        {item_type_radio_options.map((item=>(
                                            <FormControlLabel value={item.value} control={<Radio classes={{checked: classes.radio }} />} label={item.displayField} />
                                        )))}
                        </RadioGroup>
                    </FormControl>
                )
                break;
            default: 
                return <></>
                break;
        }
    }

    const handleSave = woi => {
        if(!woi){
            console.error("Bad work order item")
            return;
        }
        var addOrEdit = editWOIModalMode;
        

 
        if(shouldUpdate){
            var updateWOI = {...woi};

            //Create Object with our text input values using ref_object
            const objectMap = (obj, fn) =>
                Object.fromEntries(      Object.entries(obj).map( ([k, v], i) => [k, fn(v, k, i)]  )        );
            var textValueObject = objectMap(ref_object, v => v.current ? v.current.value ? v.current.value : null : null );

            //Get only values we need to updateTask()
            [...woi_fields, ...scbd_or_sign_fields].forEach((field, i)=>{
                const type = field.type;
                switch(type){
                    case 'text':
                        //Get updated values with textValueObject bc text values use ref
                        if(textValueObject[field.field])
                            updateWOI[field.field] = textValueObject[field.field];
                        break;
                    case 'date':
                        if(textValueObject[field.field])
                            updateWOI[field.field] = Util.convertISODateToMySqlDate(textValueObject[field.field]);
                        break;
                    default:
                        //Others are updated with woi (activeWOI) state variable
                        if(woi[field.field])
                            updateWOI[field.field] = woi[field.field];
                        break;
                }
            })

            

            //Validate Required Fields
            var empty_required_fields = [...woi_fields, ...scbd_or_sign_fields].
                    filter((v,i)=> v.required && !(v.hidden && v.hidden(activeWOI) )).
                    filter((item)=> updateWOI[item.field] == null || updateWOI[item.field] == undefined);;
            if(empty_required_fields.length > 0){
                cogoToast.error("Required fields are blank");
                setErrorFields(empty_required_fields);
                console.error("Required fields are blank", empty_required_fields)
                return;
            }
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                updateWOI["record_id"] = woi.record_id;

                Work_Orders.updateWorkOrderItem( updateWOI )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Work Order Item ${woi.record_id} has been updated!`, {hideAfter: 4});
                    setWorkOrderItems(null);
                    handleCloseModal();
                })
                .catch( error => {
                    console.error("Error updating woi.",error);
                    cogoToast.error(`Error updating woi. ` , {hideAfter: 4});
                })
            }
            if(addOrEdit == "add"){
                updateWOI["work_order"] = activeWorkOrder.wo_record_id;
                Work_Orders.addWorkOrderItem( updateWOI )
                .then( (data) => {
                    //Get id of new workorder item 
                    if(data && data.insertId){
                        setWorkOrderItems(null);
                    }
                    cogoToast.success(`Work Order Item has been added!`, {hideAfter: 4});
                    handleCloseModal();
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding woi. ` , {hideAfter: 4});
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

    const handleDeleteWOI = (woi) => {
        if(!woi || !woi.record_id){
            console.error("Bad woi in delete WOI");
            return;
        }

        const deleteWOI = () =>{
            Work_Orders.deleteWorkOrderItem(woi.record_id)
            .then((data)=>{
                setWorkOrderItems(null);
                handleCloseModal();
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete woi")
                console.error("Failed to delete woi", error);
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
        { editWOIModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editWOIModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editWOIModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            { activeWOI?.record_id ? `Edit WOI#: ${activeWOI.record_id}` : 'Add Work Order Item'} 
                        </span>
                    </div>


                    {/* BODY */}
                    {ref_object ? 
                    <Grid container className={classes.grid_container} >  
                        <Grid item xs={ 7 } className={classes.paperScroll}>
                            {/*FORM*/}
                            {woi_fields.map((field, i)=>{
                                if(field?.hidden && field.hidden(activeWOI)){
                                    return (<></>);
                                }
                                return(
                                <div className={classes.inputDiv}>  
                                    <span className={classes.inputLabel}>{field.label}</span>
                                    {getInputByType(field)}
                                </div>)
                            })}
                        </Grid>
                         
                            <Grid item xs={5} className={classes.paperScroll}>
                            {scbd_or_sign_fields.map((field, i)=>{
                                if(field?.hidden && field.hidden(activeWOI)){
                                    return (<></>);
                                }
                                return(
                                <div className={classes.inputDiv}>  
                                    <span className={classes.inputLabel}>{field.label}</span>
                                    {getInputByType(field)}
                                </div>)
                            })}
                            </Grid>
                    </Grid>
                    : <></> }

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editWOIModalMode == "edit" && activeWOI.record_id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeleteWOI(activeWOI)}
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
                                    onClick={ () => { handleSave(activeWOI) }}
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

export default AddEditWOIModal;

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
        textAlign: 'center',
    },
    grid_container:{
        minHeight: 500,
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
    deleteButtonGroup: {
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