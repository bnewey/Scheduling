import React from 'react';

import { Grid, TextField, FormControl, InputLabel, MenuItem, Select, Typography, IconButton} from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';
import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

const TaskModalTaskInfo = (props) => {

    const { classes, modalTask, handleInputOnChange, handleShouldUpdate, handleSave, ref_object, editTaskInfo, setEditTaskInfo } = props;


    const handleEditTaskInfo = (event) =>{
        setEditTaskInfo(!editTaskInfo);
    }

    return(
        <>
        <div><Typography variant="h3" component="h3" className={classes.taskTitle}>Task Information</Typography>
        <IconButton edge="end" aria-label="edit" className={classes.editFormButton} onClick={event => handleEditTaskInfo(event)}>
            <EditIcon />
        </IconButton></div>
        
        { !editTaskInfo ?
        <>  {/* TEXT (NON EDIT) MODE */}
            <div className={classes.subsectionContainer} >
                <Grid container className={classes.lowerGridHead} style={{backgroundColor: '#ececec'}}>
                    <Grid item xs={4} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Task Name</Typography>
                    </Grid> 
                    <Grid item xs={4} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Work Type</Typography>
                    </Grid>
                    <Grid item xs={4} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Hours Est</Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.lowerGrid}>
                    <Grid item xs={4} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.t_name}</Typography>
                    </Grid> 
                    <Grid item xs={4} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.type}</Typography>
                    </Grid>
                    <Grid item xs={4} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.hours_estimate}</Typography>
                    </Grid>
                </Grid>
            </div>
            <div className={classes.subsectionContainer}>
                <Grid container className={classes.lowerGridHead} style={{backgroundColor: '#ececec'}}>
                    <Grid item xs={4} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Description</Typography>
                    </Grid>
                    <Grid item xs={4} >
                        <Typography variant="body1" component="span" className={classes.text_head}></Typography>
                    </Grid>
                    <Grid item xs={4} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Notes</Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.lowerGrid}>
                    <Grid item xs={4} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.description}</Typography>
                    </Grid>
                    <Grid item xs={4} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;</Typography>
                    </Grid>
                    <Grid item xs={4} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.notes}</Typography>
                    </Grid>
                </Grid>
            </div>
            <div className={classes.subsectionContainer_date} >
                <Grid container className={classes.lowerGridHead} style={{backgroundColor: '#ececec'}}>
                    <Grid item xs={3} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Order Date</Typography>
                    </Grid> 
                    <Grid item xs={3} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Desired Date</Typography>
                    </Grid>
                    <Grid item xs={3} >
                        <Typography variant="body1" component="span" className={classes.text_head}>First Game</Typography>
                    </Grid>
                    <Grid item xs={3} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Completed Date</Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.lowerGrid}>
                    <Grid item xs={3} className={classes.text_info_grid}>
                    <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.wo_date}</Typography>
                    </Grid> 
                    <Grid item xs={3} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.date_desired}</Typography>
                    </Grid>
                    <Grid item xs={3} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.first_game}</Typography>
                    </Grid>
                    <Grid item xs={3} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.date_completed}</Typography>
                    </Grid>
                </Grid>
            </div>
            
        </>
        :
        <> {/* EDIT MODE */}
            <FormControl fullWidth>
                <TextField className={classes.inputFieldMatUi} variant="outlined" id="input-name" label="Name:" inputRef={ref_object.t_name}  defaultValue={modalTask.t_name} onChange={handleShouldUpdate(true)}/>
                <Grid container className={classes.lowerGrid}>
                <Grid item xs={6} >
                <FormControl variant="outlined" className={classes.inputFieldMatUi}>
                    <InputLabel id="status-input-label">
                    Work Type
                    </InputLabel>
                    <Select
                    labelId="task-type-input-label"
                    id="task-type-input"
                    value={modalTask.type}
                    onChange={value => handleInputOnChange(value, true, "select", "type")}
                    >
                    <MenuItem value={null}>N/A</MenuItem>
                    <MenuItem value={'Bench'}>Bench</MenuItem>
                    <MenuItem value={'Delivery'}>Delivery</MenuItem>
                    <MenuItem value={'Field'}>Field</MenuItem>
                    <MenuItem value={'Install'}>Install</MenuItem>
                    <MenuItem value={'Install (Drill)'}>Install (Drill)</MenuItem>
                    <MenuItem value={'Loaner'}>Loaner</MenuItem>
                    <MenuItem value={'Parts (Mfg.)'}>Parts (Mfg.)</MenuItem>
                    <MenuItem value={'Parts (Service)'}>Parts (Service)</MenuItem>
                    <MenuItem value={'Pickup'}>Pickup</MenuItem>
                    <MenuItem value={'Shipment'}>Shipment</MenuItem>
                    </Select>
                </FormControl></Grid>
                <Grid item xs={6} ><TextField className={classes.inputFieldMatUi} type="number" variant="outlined" id="input-hours" label="Hours" inputRef={ref_object.hours_estimate} defaultValue={modalTask.hours_estimate} onChange={handleShouldUpdate(true)} /></Grid>
            </Grid>
                <TextField className={classes.inputFieldMatUi} multiline rows="2" variant="outlined" id="input-description" label="Sign/Product Description:" inputRef={ref_object.description} defaultValue={modalTask.description} onChange={handleShouldUpdate(true)}/>
                <TextField className={classes.inputFieldMatUi} multiline rows="2" variant="outlined" id="input-notes" label="Notes:" inputRef={ref_object.notes} defaultValue={modalTask.notes} onChange={handleShouldUpdate(true)}/>
            </FormControl>
            
            <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Assigned Date" className={classes.inputFieldMatUi} inputVariant="outlined"  value={modalTask.wo_date} onChange={value => handleInputOnChange(value, true, "datetime", "date_assigned")} /></MuiPickersUtilsProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Desired Date" className={classes.inputFieldMatUi} inputVariant="outlined"  value={modalTask.date_desired} onChange={value => handleInputOnChange(value, true, "datetime", "date_desired")} /></MuiPickersUtilsProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="First Game" className={classes.inputFieldMatUi} inputVariant="outlined"  value={modalTask.first_game} onChange={value => handleInputOnChange(value, true, "datetime", "first_game")} /></MuiPickersUtilsProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}><DateTimePicker label="Completed Date" className={classes.inputFieldMatUi} inputVariant="outlined"  value={modalTask.date_completed} onChange={value => handleInputOnChange(value, true, "datetime", "date_completed")} /></MuiPickersUtilsProvider>
        </>}
        </>
    );
}

export default TaskModalTaskInfo;