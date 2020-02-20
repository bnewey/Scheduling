import React from 'react';
import { makeStyles, Paper, Button } from '@material-ui/core';


export default function TaskModal({onYes, onClose, customMessage}){
    const classes = useStyles();

    return(
        <Paper className={classes.confirmBox} elevation={2}>
                <p className={classes.heading}>Are you sure?</p>
                <p>{customMessage ? customMessage : ""}</p>
                <Button onClick={() => {
                    onClose();
                }} className={classes.noButton} variant="contained"  href="#contained-buttons">
                    No
                </Button>
                <Button onClick={() => {
                    onYes();
                    onClose();
                }} className={classes.yesButton} variant="contained"  href="#contained-buttons">
                    Yes
                </Button>
        </Paper>    
    );

}


const useStyles = makeStyles(theme => ({
    confirmBox:{
        padding: '10px 65px 30px 65px',
        textAlign: 'center',
        backgroundColor: '#d8d8d8'
    },
    heading: {
        fontWeight: '600',
        fontSize: '25px',

    },
    noButton:{
        color: 'black',
        backgroundColor: '#b7c3cd',
        margin: '5px 20px',
    },
    yesButton:{
        color: '#fff',
        backgroundColor: '#414d5a',
        margin: '5px 20px',
    }
}));