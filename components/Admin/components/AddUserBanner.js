import React, {useRef, useState, useEffect, createContext} from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddUserForm from './AddUserForm';

const UserBanner = function(props) {
    const classes = useStyles();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editModalMode, setEditModalMode] = React.useState(null);
    const [newUser, setNewUser] = React.useState(null);

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };
    
    useEffect(()=>{
        if(editModalMode == null){
            setEditModalMode('add');
        }
    },[editModalMode])

return (
    <>
    <div className={classes.banner}>
        <Button
            variant='contained'
            color='primary'
            className={classes.addButton}
            onClick={handleDialogOpen}
        >
            Add New User
        </Button>
    </div>

    <AddUserForm open={dialogOpen} onClose={handleDialogClose} editModalMode={editModalMode} />
    </>
);
};

export default UserBanner;

const useStyles = makeStyles(theme => ({}))