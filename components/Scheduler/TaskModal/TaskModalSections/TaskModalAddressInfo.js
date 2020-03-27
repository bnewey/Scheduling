import React from 'react';

import { Grid, TextField, FormControl, Typography, IconButton } from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';

const TaskModalAddressInfo = (props) => {

    const { classes, modalTask, handleInputOnChange, handleShouldUpdate, handleSave, ref_object, editAddressInfo, setEditAddressInfo } = props;

    

    const handleEditAddressInfo = (event) =>{
        //TODO be able to edit address
        //setEditAddressInfo(!editAddressInfo);
    }

    return(
        <>
        <div><Typography variant="h3" component="h3" className={classes.taskTitle}>Address Information</Typography>
        <IconButton edge="end" aria-label="edit" className={classes.editFormButton} onClick={event => handleEditAddressInfo(event)}>
            <EditIcon />
        </IconButton></div>
        
        { !editAddressInfo ?
        <>  {/* TEXT (NON EDIT) MODE */}
            <div className={classes.subsectionContainer} >
                <Grid container className={classes.lowerGridHead} style={{backgroundColor: '#ececec'}}>
                    <Grid item xs={5} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Address Name</Typography>
                    </Grid> 
                    <Grid item xs={7} >
                        <Typography variant="body1" component="span" className={classes.text_head}>Address</Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.lowerGrid}>
                    <Grid item xs={5} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>&nbsp;{modalTask.address_name}</Typography>
                    </Grid> 
                    <Grid item xs={7} className={classes.text_info_grid}>
                        <Typography variant="body1" component="span" className={classes.text_info}>
                            &nbsp;{modalTask.address}&nbsp;{modalTask.city},&nbsp;{modalTask.state}&nbsp;{modalTask.zip}
                        </Typography>
                    </Grid>
                </Grid>
            </div>
        </>
        :
        <> {/* EDIT MODE */}
        
            <p className={classes.taskTitle}>Address Information</p>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={6} ><FormControl fullWidth><TextField className={classes.inputField} variant="outlined" id="input-address-name" label="Address Name:"  defaultValue={modalTask.address_name}/></FormControl></Grid>
                        <Grid item xs={6} ><FormControl fullWidth><TextField className={classes.inputField} variant="outlined" id="input-address" label="Address:"  defaultValue={modalTask.address}/></FormControl></Grid>
                    </Grid>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="input-city" label="City:"  defaultValue={modalTask.city}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="input-state" label="State:"  defaultValue={modalTask.state}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputField} variant="outlined" id="input-zip" label="Zipcode:"  defaultValue={modalTask.zip}/></Grid>
                    </Grid>
        </>}
        </>
    );
}

export default TaskModalAddressInfo;