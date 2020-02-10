import React, {useRef, useState, useEffect} from 'react';
import SnackBar from '@material-ui/core/Snackbar';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { makeStyles } from '@material-ui/core/styles';


export default function CustomSnackBar(props){
    const classes = useStyles();

    const {snackBarStatus, key, setSnackBarStatus} = props;

    const [open, setOpen] = React.useState(false);

    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(snackBarStatus.message != null){
            if(!open) {
                setOpen(true);
            }
                    
            
        }
        return () => { //clean up
            if(snackBarStatus){
               
            }
        }
        
      },[snackBarStatus]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            console.log('clickaway');
          return;
        }
        setSnackBarStatus(null);
        setOpen(false);
      };
      


    return(
        <>
        {snackBarStatus ? 
       
        <SnackBar key={key ? key : 'snackbar-1'} 
                open={open} 
                message={snackBarStatus.message ? snackBarStatus.message : ""}
                className={snackBarStatus.className ? snackBarStatus.className : classes.root}
                autoHideDuration={snackBarStatus.autoHideDuration ? snackBarStatus.autoHideDuration : 5000} 
                onClose={handleClose}/>
 
        :
        <></>}
        </>
    );
}

const useStyles = makeStyles(theme => ({
    root:{

    }
}));