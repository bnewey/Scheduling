import React, {useState, useEffect} from "react";
import PropTypes from 'prop-types';


import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Hidden from '@material-ui/core/Hidden';

import Link from 'next/link';
import Avatar from '@material-ui/core/Avatar';
import NotificationsIcon from '@material-ui/icons/Notifications';

import Notifications from '../../js/Notifications';
import Util from '../../js/Util';
import Router from 'next/router'
import cogoToast from "cogo-toast";
import { Clear } from "@material-ui/icons";
import clsx from "clsx";
import moment from "moment";

import Subscription from '../../js/Subscription';

const NotificationsMenu = ({user}) => {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const [notifications, setNotifications] = useState(null);
  const [notificationsRefetch, setNotificationsRefetch] = useState(false);

  useEffect(()=>{
    //console.log("Listening to messages");
    var refetchInterval;

    Subscription.askPermission()
    .then((permissionResult)=>{
        //console.log("permissionResult", permissionResult)
        if(permissionResult){
          return Util.promiseTimeout(14000, Subscription.subscribePush(user.googleId))
        }else{
          throw permissionResult;
        }
    })  
    .then((subResult)=>{
        //console.log("subResult", subResult)
        if(subResult){
          Subscription.listenServiceWorkerMessages(setNotificationsRefetch);
        }else{
          throw subResult;
        }
    })
    .catch((error)=>{
        console.error("Failed to subscribe; using interval instead",error);
  
        refetchInterval = setInterval( ()=> setNotificationsRefetch(true), 30000);

    })

    return () => {
      if(refetchInterval)
        clearInterval(refetchInterval)
    }
      
  },[])

  const handleUnsubscribe = ()=>{

      Subscription.unsubscribePush();
  }

  useEffect(()=>{
    if(notifications == null || notificationsRefetch == true){
      if(notificationsRefetch){
        setNotificationsRefetch(false);
      }

      Notifications.getNotificationsForUser(user.googleId)
      .then((data)=>{
        setNotifications(data);
      })
      .catch((error)=>{
        console.error("Failed to get notifications", error)
        cogoToast.error("Failed to get notifications");
      })
    }

  },[notifications, notificationsRefetch])

  const handleOpenNotesMenu = (event) => {
    setAnchorEl(event.currentTarget );
    setOpen(true);

    let unviewed_notes = notifications?.filter((item)=>!item.viewed).map((item)=> { item["viewed"] = 1; return item });
    if(unviewed_notes.length > 0){
      Notifications.updateNotificationsViewed(unviewed_notes)
      .then((data)=>{
        setNotificationsRefetch(true);
      })
      .catch((error)=>{
        console.error("Failed to update notifications", error)
        cogoToast.error("Failed to update notifications");
      })
    }
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleGoToNotification = (event, item) =>{
    //set detailWOIid in local data
    if(item.detail_id && item.type){
      let detail_name = Util.getCurrentDetailNameByType(item.type);
      if(detail_name){
        window.localStorage.setItem(detail_name, JSON.stringify(item.detail_id));
      }else{
        console.error("Failed to get view name");
      }
    }
    
    if(item.type && item.current_view){
      let view_name = Util.getCurrentViewNameByType(item.type);
      if(view_name){
        window.localStorage.setItem(view_name, JSON.stringify(item.current_view));
      }

    }

    if(item.type && item.current_view && item.sub_current_view){
      let sub_view_name = Util.getSubCurrentViewNameByType(item.type);
      if(sub_view_name){
        window.localStorage.setItem(sub_view_name, JSON.stringify(item.sub_current_view));
      }
    }
    
    //If not on correct page, then change
    if(Router.pathname !==  item.page){
      Router.push('/scheduling' + item.page)
    }else{
      //reload current state so it refetches the localStorage
      //setReloadState(true);
      window.location.reload(false);
    }
  }

  

  return (
      <div>
        <div 
            style={{
            position: 'relative',
            }}>
            <NotificationsIcon
              role="presentation"
              aria-owns="simple-menu"
              aria-haspopup="true"
              className={classes.icon}
              onClick={event => handleOpenNotesMenu(event)}
              onKeyPress={event => handleOpenNotesMenu(event)}
              style={{ margin: '0px 20px 0px auto', cursor: 'pointer' }}
            />
            {notifications?.filter((item)=>!item.viewed).length > 0 ? <div style={{
                                        background: `#ff0000`,
                                        color: '#fff',
                                        position: 'absolute',
                                        padding: '0px',
                                        minWidth: '15px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        fontFamily: 'sans-serif',
                                        minHeight: '15px',
                                        textAlign: 'center',
                                        bottom: -2,
                                        right: 11,
                                        borderRadius: '50%',
                                    }}>{notifications?.filter((item)=>!item.viewed).length}</div> : ''}
        </div>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={open}
          className={classes.menuStyle}
          onClose={() => handleClose()}
        >
          <div className={classes.container}>
            <span className={classes.headSpan}>Notifications</span>
            <div className={classes.listContainer}>
               {notifications?.map((item)=>{
                 const notViewed = !item.viewed;

                 return (
                 <div className={clsx({[classes.listItemDiv]: true, [classes.listItemNotViewed]: notViewed}) }
                      onClick={(event)=> handleGoToNotification(event, item)}>
                   <div style={{flexBasis: '10%'}}><Clear className={classes.clearIcon}/></div>
                   <div style={{flexBasis: '75%', display: 'flex', flexDirection: 'column'}}>
                            <div><span className={classes.messageSpan}>{item.body}</span></div>
                            {item.requires_action ? <div><span className={classes.actionReqSpan}> Action Required </span></div>: <></>}
                  </div>
                   <div style={{flexBasis: '15%'}}><span className={classes.noteDateSpan}>{moment(item.date_entered).format('MMM Do')}</span></div>
                 </div>)
               })}
            </div>
          </div>
          <div className={classes.unsubscribeButton} onClick={event=> handleUnsubscribe()}><span>Unsubscribe</span></div>
        </Menu>
        
      </div>
    );
}


export default NotificationsMenu;

const useStyles = makeStyles(theme => ({
  icon: {
     height: '25px',
     width: '25px',
     color: '#737373',

  },
  menuStyle:{
        background: 'linear-gradient(27deg, #4855622e, #738aa238)',
  },
  container:{
    margin: '5px 5px',
    padding: '5px',
    width: '350px',
    minHeight: '300px',
  },
  headSpan:{
    fontFamily: 'arial',
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#666',
    padding: 5,
    margin: '5px',
  },
  listContainer:{
    padding: 5,
    margin: '5px',
  },
  listItemDiv:{
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: "center",
    padding: '5px 8px',
    boxShadow: '0px 0px 2px 0px #505050',
    background: 'linear-gradient(360deg, #f6f6f6, transparent)',
    '&:hover':{
      boxShadow: '0px 0px 3px 0px #505050',
      background: 'linear-gradient(360deg, #f6f6f6, #fafafa)',
    }
  },
  listItemNotViewed:{
    boxShadow: '0px 0px 2px 0px #ed8300',
    background: 'linear-gradient(360deg, #edfffd, transparent)',
    '&:hover':{
      boxShadow: '0px 0px 3px 0px #ed8300',
      background: 'linear-gradient(360deg, #edfffd, #f4fffe)',
    }
  },
  clearIcon:{
    marginBottom: '-3px',
    width: '1em',
    height: '1em',
    color: '#aaa',
    cursor: 'pointer',
    '&:hover':{
      color: '#777',
    }
  },
  messageSpan:{
    fontFamily: 'arial',
    fontWeight: '600',
    color: '#333',
    letterSpacing: '.02em',
  },
  actionReqSpan:{
    fontFamily: 'arial',
    fontWeight: '600',
    color: '#cc4422',
    letterSpacing: '0em',
  },
  noteDateSpan:{
    fontFamily: 'arial',
    fontWeight: '600',
    color: '#777',
    letterSpacing: '.01em',
    cursor: 'default'
  },
  unsubscribeButton:{
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#666',
    '&:hover':{
      color: '#222',
    }
  }
}))