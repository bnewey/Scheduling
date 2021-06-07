import React, {useRef, useState, useEffect, useContext} from 'react';
import {List, ListItem, ListItemText,ListItemIcon, ListSubheader, makeStyles, withStyles} from '@material-ui/core';

import DetailIcon from '@material-ui/icons/Dvr';
import PackingSlipIcon from '@material-ui/icons/Receipt';
import PDFIcon from '@material-ui/icons/PictureAsPdf';
import ListIcon from '@material-ui/icons/List';
import PastIcon from '@material-ui/icons/AccessTime';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import Util from  '../../../../../js/Util';
import { ListContext } from '../../InvOrdersOutContainer';


const RecentOrdersOut = function(props) {
    const {user} = props;
  
    const { ordersOut, setOrdersOut,  currentView, setCurrentView, views, recentOrdersOut, setRecentOrdersOut, setDetailOrderOutId} = useContext(ListContext);
    const classes = useStyles();

    const handleGoRecentlyViewed = (ordersOut) =>{
        if(!ordersOut || !ordersOut.rainey_id){
            cogoToast.error("Failed to get ordersOut");
            console.error("Bad id");
            return;
          }
          setCurrentView(views && views.filter((view, i)=> view.value == "ordersOutDetail")[0]);
          setDetailOrderOutId(ordersOut.rainey_id);
    }

    return(<>
        <div className={classes.container}>
            <div className={classes.headDiv}>
                <span className={classes.headSpan}>
                    Recently Viewed
                </span>
            </div>
            <div className={classes.recentDiv}>
                
                {Array.isArray(recentOrdersOut) && recentOrdersOut.map((item,i)=>{
                    return (
                    <div className={classes.itemDiv} onClick={event => handleGoRecentlyViewed(item)}>
                        <span className={classes.ordersOutNumberSpan}>{item.rainey_id}</span>
                        <span className={classes.itemSpan}>{item.description}</span>
                    </div>
                    )
                })}
            </div>
        </div>
    </>)
}

export default RecentOrdersOut;



const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #339933',
      padding: '1%',
      minHeight: '730px',
    },
    container:{
    },
    headDiv:{
        width:'100%',
        textAlign: 'center',
        padding: 4,
    },
    headSpan:{
        color: '#666',
        fontSize: 13,
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 600,
        marginRight: 10,
    },
    recentDiv:{
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'center',
        alignContent: 'center',
    },
    itemDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        cursor: 'pointer',
        padding: '3px 7px',
        borderBottom: '1px solid #b4b4b4',
        //borderLeft: '1px solid #b4b4b4',
        //borderRight: '1px solid #b4b4b4',
        '&:last-child':{
            borderTop: '1px solid #b4b4b4'
        },
        background: 'linear-gradient(0deg, #f3e5ff, #f8efff)',
        '&:hover':{
            background:"#fff",
            textDecoration: 'underline'
        }
    },
    ordersOutNumberSpan:{
        flexBasis: '20%',
        color: '#555',
        fontSize: 10,
        textAlign: 'left',
        fontFamily: 'sans-serif',
        textDecoration: 'none !important' ,
    },
    itemSpan:{
        flexBasis: '80%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: '#333',
        fontSize: 10,
        textAlign: 'left',
        fontFamily: 'sans-serif',
    },

}));