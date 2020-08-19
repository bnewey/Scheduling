import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Switch, FormControlLabel, List, ListItem, ListItemText,ListItemIcon, Modal, Backdrop, Fade, Grid, TextField, FormControl, InputLabel, MenuItem, Select, 
    ButtonGroup, Button, CircularProgress, Avatar} from '@material-ui/core';
import BulletIcon from '@material-ui/icons/Crop75';
import RemoveIcon from '@material-ui/icons/Remove';
import PersonalVideoIcon from '@material-ui/icons/PersonalVideo';
import cogoToast from 'cogo-toast';

import WorkOrders from '../../../../js/Work_Orders';
import Util from '../../../../js/Util';

import { TaskContext } from '../../TaskContainer';



const TaskModalWOSignArtItems = (props) =>{
    const {taskId} = props;
    //const {} = useContext(TaskContext);

    //css
    const classes = useStyles();

    //State Variables
    const [signItems, setSignItems] = useState(null);
    const [showDates, setShowDates] = useState(false);

    useEffect(()=>{
        if(signItems == null){
            WorkOrders.getAllWorkOrderSignArtItems(taskId)
            .then((data)=>{
                console.log("items", data);
                setSignItems(data);
            })
            .catch((error)=>{
                console.error(error);
                cogoToast.error("Error getting work order items for sign/artwork");
            })
        }
    },[signItems])

    const handleChangeShowDates = event => {
        setShowDates(event.target.checked);
      };

    const convertDate = (date) => {
        if(!date){
            return 'N/A';
        }
        let date_string = Util.convertISODateToMySqlDate(date);
        return date_string;
    };
    

    return(
        
        <Grid container >
            {signItems && signItems.length > 0 
            ?
            <Grid item xs={12} className={classes.paper}>
               <div className={classes.root}>
                    <p className={classes.taskTitle}>Work Order Items </p> 
                    <FormControlLabel
                        control={<Switch checked={showDates} onChange={handleChangeShowDates} />}
                        label="Show Comp Dates"
                        />
                    <List component="nav" aria-label="main mailbox folders" className={classes.list}>
                        {signItems.map((item)=> (
                            <ListItem button className={classes.list_item_root}>
                                <ListItemIcon>
                                { item.scoreboard_or_sign > 0 ?<PersonalVideoIcon/> : <RemoveIcon/> }
                                </ListItemIcon>
                                <ListItemText>
                                    <>
                        <div className={classes.item_head}>{item.description}&nbsp;(x{item.quantity})&nbsp;-&nbsp;{item.vendor}</div>
                                    { item.scoreboard_or_sign > 0 ? <><div className={classes.item_info}>
                                        <div className={item.sign_built ? classes.item_info_item : classes.item_info_item_na}>Sign Built</div> 
                                        <div className={item.copy_received ? classes.item_info_item : classes.item_info_item_na}>Copy Received</div>
                                        <div className={item.sent_for_approval ? classes.item_info_item : classes.item_info_item_na}>Sent for Appr</div>
                                        <div className={item.final_copy_approved ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Final Copy Appr</div>
                                        <div className={item.artwork_completed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Artwork Completed</div>
                                        <div className={item.sign_popped_and_boxed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Sign Popped/Boxed</div>
                                    </div>
                                    {showDates ? 
                                    <div className={classes.item_info}>
                                        <div className={item.sign_built ? classes.item_info_item : classes.item_info_item_na}> {convertDate(item.sign_built)}</div> 
                                        <div className={item.copy_received ? classes.item_info_item : classes.item_info_item_na}>{convertDate(item.copy_received)}</div>
                                        <div className={item.sent_for_approval ? classes.item_info_item : classes.item_info_item_na}>{convertDate(item.sent_for_approval)}</div>
                                        <div className={item.final_copy_approved ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.final_copy_approved)}</div>
                                        <div className={item.artwork_completed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.artwork_completed)}</div>
                                        <div className={item.sign_popped_and_boxed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.sign_popped_and_boxed)}</div>
                                    </div>
                                    : <></> } </> : <></>}
                                    </>
                                    </ListItemText>
                            </ListItem>
                        ))}
                        
                    </List>
                </div>
            
            </Grid>
            : <></>}
        </Grid>
    );

};

export default TaskModalWOSignArtItems

const useStyles = makeStyles(theme => ({
    paper: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: '1% 3% !important',
      position: 'relative'
    },
    list:{
        padding: '0px',
    },
    list_item_root:{

        borderBottom: '1px solid #ececec',
    },
    item_head:{
        fontWeight: '600',
        color: '#2d3b4a',
        fontSize: '11px',
    },
    item_info:{
        display: 'flex',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
    },
    item_info_item:{
        
        color: '#238605',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '16%'
    },
    item_info_item_na:{
        color: '#4c4a4a',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '16%'
    },
    item_info_item_bigger:{
        color: '#238605',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '2 1 16%',
    },
    item_info_item_bigger_na:{
        color: '#4c4a4a',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '2 1 16%',
    },
    taskTitle: {
        fontSize: '16px',
        fontWeight: '500',
        
        display: 'inline',
    },
  }));