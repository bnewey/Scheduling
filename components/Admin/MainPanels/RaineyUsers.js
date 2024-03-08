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

import EditRaineyUserSettings from '../components/EditRaineyUsers';
import UserBanner from '../components/AddUserBanner';
import Edit from '@material-ui/icons/Edit';


const RaineyUsers = function(props) {

  const { currentView, previousView, handleSetView, views, user } = useContext(AdminContext);
  const classes = useStyles();

  const [raineyUsers, setRaineyUsers] = React.useState(null);
  const [raineyUserToEdit, setRaineyUserToEdit] = React.useState(null);
  const [dialogOpen, setDialogOpen]= React.useState(false);

  useEffect(()=>{
    if( raineyUsers == null){
        Settings.getRaineyUsers()
        .then((data)=>{
            if(data){
                setRaineyUsers(data);
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to get rainey users");
            console.error("Failed to get rainey users", error);
        })
    }
  },[])

  const handleDialogOpen = (raineyUser)=>{
    setDialogOpen(true);
    setRaineyUserToEdit(raineyUser);
  }

  function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
};

  return (
    <div className={classes.root}>
        <UserBanner />
        <EditRaineyUserSettings dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} raineyUserToEdit={raineyUserToEdit} setRaineyUserToEdit={setRaineyUserToEdit} />
        <Grid container className={classes.settingsContainer} spacing={2}>
            <Grid item xs={12} md={8}>
                {raineyUsers?.map((raineyUser, i)=>{
                    console.log("raineyUser", raineyUser);
                    return <div className={classes.settingDiv} key={i}>
                            <div className={classes.edit} onClick={(event)=>handleDialogOpen(raineyUser)}><Edit className={classes.icon}/></div>
                            <span className={classes.spanName}>{raineyUser.name}</span>
                            <span className={classes.spanAdmin}>{raineyUser.is_visible ? "": "Not Visible"}</span>
                            </div>
                })}
          </Grid>
        </Grid>
    </div>
  );
}

export default RaineyUsers



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '2%',
    paddingBottom: '50px',
    minHeight: '730px',
  },
  settingsContainer:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
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