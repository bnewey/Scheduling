import React, {useRef, useState, useEffect, useContext} from 'react';
import {List, ListItem, ListItemText,ListItemIcon, ListSubheader, makeStyles, withStyles} from '@material-ui/core';

import DetailIcon from '@material-ui/icons/Dvr';
import PackingSlipIcon from '@material-ui/icons/Receipt';
import PDFIcon from '@material-ui/icons/PictureAsPdf';
import ListIcon from '@material-ui/icons/List';
import PastIcon from '@material-ui/icons/AccessTime';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import Util from  '../../../../../js/Util';
import InventoryKits from  '../../../../../js/InventoryKits';
import { ListContext } from '../../InvKitsContainer';


const SidebarPages = function(props) {
    const {user} = props;
  
    const { kits, setKits, setKitsRefetch,currentView, setCurrentView, views,columnState, setColumnState, 
        setDetailKitId,editKitModalMode,setEditKitModalMode, activeKit, setActiveKit, editKitModalOpen,setEditKitModalOpen,
         recentKits, setRecentKits} = useContext(ListContext);
    const classes = useStyles();

    const pages = [
        "kitsDetail", "kitsItemization", "kitsRecentOrders", "kitsKits"
    ];

    const handleChangePage = (view) =>{
        setCurrentView(view)
    }

    const getIcon = (page)=>{
        switch(page){
            case 'kitsDetail':{
                return(<DetailIcon className={classes.icon}/>)
                break;
            }
            case 'kitsItemization':{
                return(<ListIcon className={classes.icon}/>)
                break;
            }
            case 'kitsKits':{
                return(<ListIcon className={classes.icon}/>)
                break;
            }
            case 'kitsRecentOrders':{
                return(<PastIcon className={classes.icon}/>);
                break;
            }
        }
    }

    return(<>
        <List component="nav" 
                
                className={classes.pageList}>
            {pages && pages.map((page, i)=>{
                var view = views.filter((v)=> v.value === page)[0];
                var selected = currentView.value === page;
                return(
                    <ListItem button key={"sidepage"+i} selected={selected} 
                                onClick={() =>handleChangePage(view)}
                                className={ clsx({ [classes.selectedExpList] : selected ,
                                            [classes.nonselectedExpList]: !selected })}>
                        <ListItemText  >
                            <div className={classes.itemDiv}>
                                <span className={classes.iconSpan}>{getIcon(page)}</span>
                                <span className={classes.liText}>{view.displayName}</span>
                            </div>
                        </ListItemText>
                    </ListItem>
                )
            })}
            
        </List>
    </>)
}

export default SidebarPages;



const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #339933',
      padding: '1%',
      minHeight: '730px',
    },
    pageList:{
        width: '100%',
        backgroundColor: 'f8f8f8',
        borderRadius: '5px',
        padding: '0',
    },
    list_head:{
        lineHeight: '24px',
        borderRadius: '5px',
    },
    selectedExpList:{
        fontWeight: '600',
        boxShadow: '0px 0px 2px 0px #848484, 0px 0px 3px 0px #ff8b00',
        background: 'linear-gradient(0deg, #d8d8d8, #e3e3e3)',
        
        color: '#333',
        marginBottom: '5px',
        padding: '5px 0px',
    },
    nonselectedExpList:{
        fontWeight: '600',
        boxShadow: '0px 1px 2px 0px #848484',
        background: 'linear-gradient(0deg, white, white)',
        '&:hover':{
            boxShadow: '0px 3px 10px 0px #8c8c8c',
        },
        color: '#333',
        marginBottom: '5px',
        padding: '5px 0px',
    },
    liText:{
        [theme.breakpoints.down('sm')]: {
            fontSize: '9px',
            fontWeight: 400,
            textAlign: 'center',
        },
        [theme.breakpoints.up('md')]: {
            fontWeight: 600,
            fontSize: '13px',
            textAlign: 'left',
        },
        fontFamily: 'sans-serif',
        
        
        color: '#4c4c4c',
        width: '100%'

    },
    iconSpan:{
        width: '100%',
        [theme.breakpoints.down('sm')]: {
            textAlign: 'center',
        },
        [theme.breakpoints.up('md')]: {
            textAlign: 'right',
        },
        
        margin: '0px 15px',
        flexBasis: '34%',
    },
    itemDiv:{
        display: 'flex',
        
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'center',
        },
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        justifyContent: 'center',
        
    },
    icon:{
        color: '#888'
    }
}));