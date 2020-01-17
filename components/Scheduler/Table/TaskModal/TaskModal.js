//The TaskModal displays a single tasks info
//Methods: Update field, delete task, 
//https://material-ui.com/components/modal/

import React, {useRef, useState, useEffect, createRef} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import TrashIcon from '@material-ui/icons/Delete';
import CircularProgress from '@material-ui/core/CircularProgress';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import Util from '../../../../js/Util.js';
import Tasks from '../../../../js/Tasks';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

//ALERT ////
// This component is in both TaskContainer and MapContainer -
// Chang props to this component in both locations to prevent breaking 

export default function TaskModal({modalOpen, setModalOpen, modalTaskId, setModalTaskId}){
    const classes = useStyles();

    const [modalTask, setModalTask] = React.useState(null); 
    const [shouldUpdate, setShouldUpdate] = React.useState(false);
    
    const [formVariables, setFormVariables] = React.useState({});


    const variables_to_update = ["t_name", "description", "notes", "work_type", "hours_estimate", "date_assigned", "date_desired", "date_completed", 
        "delivery_date", "delivery_crew", "delivery_order", "install_date", "install_crew", "install_order", "task_status", "drilling", "artwork", "sign"];
    const text_variables = ["t_name", "description", "notes",  "hours_estimate", "delivery_crew", "delivery_order" ,
      "install_crew", "install_order"];
    
    //Building an object of refs to update text input values instead of having them tied to state and updating every character
    const buildRefObject = arr => Object.assign({}, ...Array.from(arr, (k) => { return ({[k]: useRef(null)}) }));

    const [ref_object, setRef_Object] = React.useState(buildRefObject(text_variables));
    
    
    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(modalTaskId) {
          Tasks.getTask(modalTaskId)
          .then( (data) => setModalTask(data[0]))
          .catch( error => {
            console.warn(JSON.stringify(error, null,2));
          })
        }

      
        return () => { //clean up
            //Reset modalTask so that it properly updates the modal form with the correct modalTask
            setModalTask(null);
            setShouldUpdate(false);
        }
      },[ modalTaskId]);

    
    const handleOpenModal = () => {
        setModalOpen(true);
    };

    
    const handleClose = () => {
        setModalOpen(false);
        setModalTask(null);
        setModalTaskId(null);
    };

    const handleDelete = id => () => {

        const remove = () => {
            Tasks.removeTask(id)
                .then(handleClose())
                .catch( error => {
                    console.warn(JSON.stringify(error, null,2));
            });
        }
        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={remove} onClose={onClose} customMessage="Delete this task permanently?"/>
                );
            }
        })

    };

    const handleShouldUpdate = param => () => {
        setShouldUpdate(param);
        
    }

    const handleInputOnChange = (value, param, type, key) => {
        if(!value || !param || !type || !key){
            console.error("Bad handleInputOnChange call");
            return;
        }
        var tmpModalTask = {...modalTask};

        if(type === "datetime") {
            tmpModalTask[key] = Util.convertISODateTimeToMySqlDateTime(value.toISOString());

        }
        if(type === "select"){
            console.log("select");
            tmpModalTask[key] = value.target.value;
        }

        console.log(tmpModalTask);
        setModalTask(tmpModalTask);
        setShouldUpdate(param);
        
    }


    const handleSave = task => () => {
        if(!task || !task.t_id){
            return;
        }

        //TODO validate form
 
        if(shouldUpdate){
            var updateModalTask = {};

            //Create Object with our text input values using ref_object
            const objectMap = (obj, fn) =>
                Object.fromEntries(      Object.entries(obj).map( ([k, v], i) => [k, fn(v, k, i)]  )        );

            var textValueObject = objectMap(ref_object, v => v.current.value ? v.current.value : null );
            
            //Get only values we need to updateTask()
            for(var i =0 ; i< variables_to_update.length; i++){
                const index = text_variables.indexOf(variables_to_update[i]);
                //if key is not in text_variables, ie is a date or select input
                if(index === -1)
                    updateModalTask[variables_to_update[i]] = modalTask[variables_to_update[i]];
                //if key is in text_variables, ie is a text input
                if(index >= 0){
                    updateModalTask[variables_to_update[i]] = textValueObject[variables_to_update[i]];
                }
                if(index === null){
                    console.error("index === null in handleSave");
                }
            }

            //Add Id to this new object
            updateModalTask["t_id"] = task.t_id;

            console.log(updateModalTask);
 
            Tasks.updateTask(updateModalTask)
            .then( (data) => console.log("Updated Successfully"))
            .catch( error => {
              console.warn(JSON.stringify(error, null,2));
            })
        }
        handleClose();

    };

    return(
        <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={modalOpen}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
            { modalTask ? /* If modalTask is not loaded, load the circularprogrss instead */
            <div className={classes.container}>
            <div className={classes.modalTitleDiv}><span id="transition-modal-title" className={classes.modalTitle}>Edit Task Id: {modalTask.t_id}</span></div>
            <Grid container >
                
                <Grid item xs={8} className={classes.paper}>
                <hr className={classes.hr}/>
                <p className={classes.taskTitle}>Task Information</p>
                    <FormControl fullWidth>
                        <TextField className={classes.inputField} variant="outlined" id="standard-required" label="Name:" inputRef={ref_object.t_name}  defaultValue={modalTask.t_name} onChange={handleShouldUpdate(true)}/>
                        <TextField className={classes.inputField} multiline rows="2" variant="outlined" id="standard-required" label="Sign/Product Description:" inputRef={ref_object.description} defaultValue={modalTask.description} onChange={handleShouldUpdate(true)}/>
                        <TextField className={classes.inputField} multiline rows="2" variant="outlined" id="standard-required" label="Notes:" inputRef={ref_object.notes} defaultValue={modalTask.notes} onChange={handleShouldUpdate(true)}/>
                    </FormControl>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={6} >
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="status-input-label">
                            Work Type
                            </InputLabel>
                            <Select
                            labelId="task-type-input-label"
                            id="task-type-input"
                            defaultValue={modalTask.work_type}
                            onChange={value => handleInputOnChange(value, true, "select", "work_type")}
                            >
                            <MenuItem value={null}>N/A</MenuItem>
                            <MenuItem value={'install'}>Install</MenuItem>
                            <MenuItem value={'delivery'}>Delivery</MenuItem>
                            <MenuItem value={'repair'}>Repair</MenuItem>
                            <MenuItem value={'service call'}>Service Call</MenuItem>
                            <MenuItem value={'parts'}>Parts</MenuItem>
                            </Select>
                        </FormControl></Grid>
                        <Grid item xs={6} ><TextField className={classes.inputField} type="number" variant="outlined" id="standard-required" label="Hours" inputRef={ref_object.hours_estimate} defaultValue={modalTask.hours_estimate} onChange={handleShouldUpdate(true)} /></Grid>
                    </Grid>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Assigned Date" className={classes.inputField} inputVariant="outlined"  value={modalTask.date_assigned} onChange={value => handleInputOnChange(value, true, "datetime", "date_assigned")} /></MuiPickersUtilsProvider>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Desired Date" className={classes.inputField} inputVariant="outlined"  value={modalTask.date_desired} onChange={value => handleInputOnChange(value, true, "datetime", "date_desired")} /></MuiPickersUtilsProvider>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Completed Date" className={classes.inputField} inputVariant="outlined"  value={modalTask.date_completed} onChange={value => handleInputOnChange(value, true, "datetime", "date_completed")} /></MuiPickersUtilsProvider>
                    <hr className={classes.hr}/>
                    <p className={classes.taskTitle}>Address Information</p>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={6} ><FormControl fullWidth><TextField className={classes.inputField} variant="outlined" id="standard-required" label="Address Name:"  defaultValue={modalTask.address_name}/></FormControl></Grid>
                        <Grid item xs={6} ><FormControl fullWidth><TextField className={classes.inputField} variant="outlined" id="standard-required" label="Address:"  defaultValue={modalTask.address}/></FormControl></Grid>
                    </Grid>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="standard-required" label="City:"  defaultValue={modalTask.city}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="standard-required" label="State:"  defaultValue={modalTask.state}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="standard-required" label="Zipcode:"  defaultValue={modalTask.zip}/></Grid>
                    </Grid>
                    
                    <hr className={classes.hr}/>
                    <p className={classes.taskTitle}>Delivery/Install</p>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={4} >
                            
                            <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Delivery Date" className={classes.inputField} inputVariant="outlined"  value={modalTask.delivery_date} onChange={value => handleInputOnChange(value, true, "datetime", "delivery_date")} /></MuiPickersUtilsProvider>
                            </Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="standard-required" label="Delivery Crew" inputRef={ref_object.delivery_crew} defaultValue={modalTask.delivery_crew} onChange={handleShouldUpdate(true)}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} type="number" variant="outlined" id="standard-required" label="Delivery Order" inputRef={ref_object.delivery_order} defaultValue={modalTask.delivery_order} onChange={handleShouldUpdate(true)}/></Grid>
                    </Grid>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={4} ><MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Install Date" className={classes.inputField} inputVariant="outlined"  value={modalTask.install_date} onChange={value => handleInputOnChange(value, true, "datetime", "install_date")} /></MuiPickersUtilsProvider></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="standard-required" label="Install Crew" inputRef={ref_object.install_crew} defaultValue={modalTask.install_crew} onChange={handleShouldUpdate(true)}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} type="number" variant="outlined" id="standard-required" label="Install Order" inputRef={ref_object.install_order} defaultValue={modalTask.install_order} onChange={handleShouldUpdate(true)}/></Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4} className={classes.paper}>
                <TextField className={classes.inputField} variant="outlined" id="standard-required" label="Assigned Users" defaultValue={"TODO"}/>

                <FormControl variant="outlined" className={classes.inputField}>
                    <InputLabel id="status-input-label">
                    Task Status
                    </InputLabel>
                    <Select
                    labelId="status-input-label"
                    id="status-input"
                    defaultValue={modalTask.task_status}
                    onChange={value => handleInputOnChange(value, true, "select", "task_status")}
                    >
                    <MenuItem value={null}>N/A</MenuItem>
                    <MenuItem value={'Not Started'}>Not Started</MenuItem>
                    <MenuItem value={'In Progress'}>In Progress</MenuItem>
                    <MenuItem value={'Delivered'}>Delivered</MenuItem>
                    <MenuItem value={'Installed'}>Installed</MenuItem>
                    <MenuItem value={'Completed'}>Completed</MenuItem>  
                    </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.inputField}>
                    <InputLabel id="drilling-input-label">
                    Drilling
                    </InputLabel>
                    <Select
                    labelId="drilling-input-label"
                    id="drilling-input"
                    className={classes.selectBox}
                    defaultValue={modalTask.drilling}
                    onChange={value => handleInputOnChange(value, true, "select", "drilling")}
                    >
                    <MenuItem value={null}>N/A</MenuItem>
                    <MenuItem value={'Drill'}>Drill</MenuItem>
                    <MenuItem value={'Need Locate'}>Need Locate</MenuItem>
                    <MenuItem value={'Located'}>Located</MenuItem>
                    <MenuItem value={'Finished'}>Finished</MenuItem>  
                    </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.inputField}>
                    <InputLabel id="sign-input-label">
                    Sign
                    </InputLabel>
                    <Select
                    labelId="sign-input-label"
                    id="sign-input"
                    defaultValue={modalTask.sign}
                    onChange={value => handleInputOnChange(value, true, "select", "sign")}
                    >
                    <MenuItem value={null}>N/A</MenuItem>
                    <MenuItem value={'Build'}>Build</MenuItem>
                    <MenuItem value={'Finished'}>Finished</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.inputField}>
                    <InputLabel id="artwork-input-label">
                    Artwork
                    </InputLabel>
                    <Select
                    labelId="artwork-input-label"
                    id="artwork-input"
                    defaultValue={modalTask.artwork}
                    onChange={value => handleInputOnChange(value, true, "select", "artwork")}
                    >
                    <MenuItem value={null}>N/A</MenuItem>
                    <MenuItem value={'Need Art'}>Need Art</MenuItem>
                    <MenuItem value={'Out for approval'}>Out for approval</MenuItem>
                    <MenuItem value={'Approved'}>Approved</MenuItem>
                    <MenuItem value={'Finished'}>Finished</MenuItem>
                    </Select>
                </FormControl>
                <ButtonGroup className={classes.buttonGroup}>
                    <Button
                        onClick={handleDelete(modalTask.t_id)}
                        variant="contained"
                        color="secondary"
                        size="large"
                        className={classes.deleteButton}
                        startIcon={<TrashIcon />}
                    >
                    </Button>
                    <Button
                        onClick={handleSave(modalTask)}
                        variant="contained"
                        color="primary"
                        size="large"
                        className={classes.saveButton}
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>
                </ButtonGroup>
                </Grid>
            </Grid>
            </div>
            : 
                <div>
                    <CircularProgress />
                </div>
            }   
        </Fade>
      </Modal>
    );
}

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
    paper: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: '3% !important',
      position: 'relative'
    },
    container: {
        width: '60%',
        minHeight: '50%',
        textAlign: 'center',
        
    },
    modalTitleDiv:{
        backgroundColor: '#5b7087',
        padding: '5px 0px 5px 0px',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#fff',
    },
    taskTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#000',
        display: 'inline',
    },
    inputField: {
        margin: '10px 17px 7px 17px',
        padding: '0px',
        '&& input':{
            padding: '12px 0px 12px 15px',
        },
        '&& .MuiSelect-select':{
            padding: '12px 40px 12px 15px',
        },
        '&& .MuiOutlinedInput-multiline': {
            padding: '8.5px 12px'
        },
        '&& label':{
            backgroundColor: '#fff',
        }
    },
    hr: {
        margin: '10px 0px 10px 0px',
        border: '2px solid #e1c179',
    },
    lowerGrid: {
        textAlign: 'center',
    },
    saveButton:{
        backgroundColor: '#414d5a'
    },
    deleteButton:{
        backgroundColor: '#b7c3cd'
    },
    buttonGroup: {
        position: 'absolute',
        bottom: '15px',
        right: '106px',
    },
    selectBox: {
        '&& .MuiInputLabel-outlined': {
            transform: 'translate(14px, 12px) scale(1)',
        }
    }
  }));