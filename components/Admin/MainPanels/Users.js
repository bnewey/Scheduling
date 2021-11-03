import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';



import cogoToast from 'cogo-toast';


import Util from  '../../../js/Util';
import Settings from '../../../js/Settings';
import { AdminContext } from '../AdminContainer';

import EditUserSettings from '../components/EditUserSettings';
import Edit from '@material-ui/icons/Edit';


const Users = function(props) {

  const { currentView, previousView, handleSetView, views, user } = useContext(AdminContext);
  const classes = useStyles();

  const [users, setUsers] = React.useState(null);
  const [userToEdit, setUserToEdit] = React.useState(null);
  const [dialogOpen, setDialogOpen]= React.useState(false);

  useEffect(()=>{
    if( users == null){
        Settings.getGoogleUsers()
        .then((data)=>{
            if(data){
                setUsers(data);
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to get users");
            console.error("Failed to get users", error);
        })
    }
  },[users])

  const handleDialogOpen = (user)=>{
    setDialogOpen(true);
    setUserToEdit(user);
  }

  return (
    <div className={classes.root}>
        <EditUserSettings dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} userToEdit={userToEdit} setUserToEdit={setUserToEdit} />
        <Grid container xs={12} md={8} className={classes.settingsContainer}>
          {users?.map((user, i)=>{
            console.log("user", user);
            return <div className={classes.settingDiv} key={i}>
                      <div className={classes.edit} onClick={(event)=>handleDialogOpen(user)}><Edit className={classes.icon}/></div>
                      <span className={classes.spanName}>{user.name}</span>
                      <span className={classes.spanAdmin}>{user.isAdmin ? "Admin": ""}</span>
                    </div>
          })}
        </Grid>
    </div>
  );
}

export default Users



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '2%',
    minHeight: '730px',
  },
  settingsContainer:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingDiv:{
    fontFamily: 'arial',
    width: '100%',
    padding: '6px 5px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    '&:hover':{
      boxShadow: '0px 0px 2px 1px #e0dddd',
    }
  },
  spanName:{
    padding: '0px 5px',
    fontSize: '1.1em',
    fontWeight: '600',
  },
  spanAdmin:{
    padding: '0px 5px',
    fontSize: '1.1em',
    fontWeight: '400',
  },
  edit:{
    padding: '0px 15px',

  },
  icon:{
    height: '1em',
    width: '1em',
    color: '#2084f2',
    '&:hover':{
      color: '#a4cfff',
      cursor: 'pointer',
    }
  }
}));