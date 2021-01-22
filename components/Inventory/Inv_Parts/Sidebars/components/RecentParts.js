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
import { ListContext } from '../../InvPartsContainer';


const RecentParts = function(props) {
    const {user} = props;
  
    const { parts, setParts,  currentView, setCurrentView, views, recentParts, setRecentParts, setDetailPartId} = useContext(ListContext);
    const classes = useStyles();

    const handleGoRecentlyViewed = (part) =>{
        if(!part || !part.rainey_id){
            cogoToast.error("Failed to get part");
            console.error("Bad id");
            return;
          }
          setCurrentView(views && views.filter((view, i)=> view.value == "partsDetail")[0]);
          setDetailPartId(part.rainey_id);
    }

    return(<>
        <div className={classes.container}>
            <div className={classes.headDiv}>
                <span className={classes.headSpan}>
                    Recently Viewed
                </span>
            </div>
            <div className={classes.recentDiv}>
                
                {Array.isArray(recentParts) && recentParts.map((item,i)=>{
                    return (
                    <div className={classes.itemDiv} onClick={event => handleGoRecentlyViewed(item)}>
                        <span className={classes.partNumberSpan}>{item.rainey_id}</span>
                        <span className={classes.itemSpan}>{item.description}</span>
                    </div>
                    )
                })}
            </div>
        </div>
    </>)
}

export default RecentParts;



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
    partNumberSpan:{
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