import React from 'react';

import { Grid, TextField, FormControl, Typography, IconButton } from '@material-ui/core';
import cogoToast from 'cogo-toast';

import EditIcon from '@material-ui/icons/Edit';
import Tasks from '../../../../js/Tasks';

const TaskModalAddressInfo = (props) => {

    const { classes, modalTask, handleInputOnChange, handleSave, ref_object, editAddressInfo, setEditAddressInfo,setShouldReFetch,
        shouldUpdateAddressInfo, setShouldUpdateAddressInfo } = props;
    const [addressState, setAddressState] = React.useState(
        {
            address_name: modalTask.address_name,
            address: modalTask.address,
            city: modalTask.city,
            state: modalTask.state,
            zip: modalTask.zip
        })
    

    

    const handleEditAddressInfo = (event) =>{
        //TODO be able to edit address
        setEditAddressInfo(!editAddressInfo);
    }

    const handleSaveAddress = (event) =>{
        if(!addressState){
            cogoToast.error("Failed to update address");
            console.error("Failed to update address, bad object in handleSaveAddress");
        }
        if(!shouldUpdateAddressInfo){
            console.log("No updates to address info made")
            setEditAddressInfo(false);
            return;
        }
        //Add a new address to entities_addresses and set task = 1, remove task =1 from all others
        console.log("AddressState",addressState);

        Tasks.addAndSaveAddress(addressState, modalTask.entities_id)
        .then((data)=>{
            console.log('data',data);
            setShouldReFetch(true);
            setShouldUpdateAddressInfo(false);
            setEditAddressInfo(false);
        })
        .catch((error)=>{
            cogoToast.error("Failed to save address")
            console.error("Failed to save address", error)
        })
        
    }

    const handleChange = (event, variable) => {
        var a = {...addressState}
        a[variable] = event.target.value;
        setAddressState(a);
        setShouldUpdateAddressInfo(true);
      };

    return(
        <>
        <div><Typography variant="h3" component="h3" className={classes.taskTitle}> Shipping Address Information</Typography>
       {/* { !editAddressInfo  ? <IconButton edge="end" aria-label="edit" className={classes.editFormButton} onClick={event => handleEditAddressInfo(event)}>
            <EditIcon />
    </IconButton>: <div className={classes.textButtonDiv}><span className={classes.text_button} onClick={event => handleSaveAddress(event)}>save</span></div>}*/ }</div>
        
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
        
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={6} ><FormControl fullWidth><TextField className={classes.inputFieldMatUi} variant="outlined" id="input-address-name" label="Address Name:" 
                                 defaultValue={addressState.address_name} onChange={event => handleChange(event, "address_name")}/></FormControl></Grid>
                        <Grid item xs={6} ><FormControl fullWidth><TextField className={classes.inputFieldMatUi} variant="outlined" id="input-address" label="Address:"  
                                defaultValue={addressState.address} onChange={event => handleChange(event, "address")}/></FormControl></Grid>
                    </Grid>
                    <Grid container className={classes.lowerGrid}>
                        <Grid item xs={4} ><TextField className={classes.inputFieldMatUi} variant="outlined" id="input-city" label="City:"  
                                defaultValue={addressState.city} onChange={event => handleChange(event, "city")}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputFieldMatUi} variant="outlined" id="input-state" label="State:"  
                                defaultValue={addressState.state} onChange={event => handleChange(event, "state")}/></Grid>
                        <Grid item xs={4} ><TextField className={classes.inputFieldMatUi} variant="outlined" id="input-zip" label="Zipcode:"  
                                defaultValue={addressState.zip} onChange={event => handleChange(event, "zip")}/></Grid>
                    </Grid>
        </>}
        </>
    );
}

export default TaskModalAddressInfo;