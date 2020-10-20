import React, {useRef, useState, useEffect, createContext,useContext } from 'react';
import {makeStyles, CircularProgress, Grid, Typography, Button} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';
import WorkOrderDetail from  '../../../js/WorkOrderDetail';

import { ListContext } from '../WOContainer';
import { DetailContext } from '../WOContainer';

import SidebarPages from './components/SidebarPages';
import CompInvTool from './components/CompInvTool';


const WOSidebarDetail = function(props) {
  const {user} = props;



  const { workOrders,setWorkOrders, rowDateRange, setDateRowRange, setEditWOModalOpen, setEditModalMode, currentView,setCurrentView, views,
    activeWorkOrder } = useContext(ListContext);

  const {setEditWOIModalMode,setEditWOIModalOpen, setFPOrderModalOpen, setFPOrderModalMode} = useContext(DetailContext);
  
  const classes = useStyles();
  
  const handleOpenAddWOModal = () =>{
    setEditModalMode("edit");
    setEditWOModalOpen(true);
  }

  const handleOpenWOIModal = () =>{
    setEditWOIModalMode("add")
    setEditWOIModalOpen(true);
  }

  const handleOpenFPOrderModal = () =>{
    setFPOrderModalMode("add");
    setFPOrderModalOpen(true);
  }

  const handleAddNewPackingSlip =()=>{
    if(!activeWorkOrder){
      cogoToast.error("No active work order to add packing slip to");
      return;
    }

    WorkOrderDetail.addPackingSlip(activeWorkOrder.wo_record_id)
    .then((data)=>{
      setCurrentView(views.find((v)=> v.value === "packingSlip"))
      //setPackingSlips(null);
    })
    .catch((error)=>{
      cogoToast.error("Failed to add new packing slip")
      console.error("Failed to add new packing slip", error);
    })
  }

  const sideBarTopButtons = () =>{
    switch(currentView.value){
      case "allWorkOrders":
        return <Search />
        break
      case "search":
        return <Search />
        break;
      case "woPdf":
        break;
      case "pastWO":  
        break;
      case "woFPOrder":
        return(
          <div className={classes.newButtonDiv} >
            <Button className={classes.newButton} classes={{label: classes.newButtonLabel}} variant="outlined"
                onClick={()=> handleOpenFPOrderModal()}>
                <AddIcon className={classes.plusIcon}/>
                <div>New Order</div>
            </Button>
          </div>
        )
        break;
      case "woDetail":
        return (<>
          <div className={classes.newButtonDiv} >
              <Button className={classes.newButton} 
                    classes={{label: classes.newButtonLabel}} 
                    variant="outlined"
                    onClick={event=> handleOpenAddWOModal()}>
                      <EditIcon className={classes.editIcon}/><div>Edit Info</div>
              </Button>
          </div></>);
        break;
      case "woItems":
        return (<>
          <div className={classes.newButtonDiv} >
            <Button className={classes.newButton} 
                    classes={{label: classes.newButtonLabel}} 
                    variant="outlined"
                    onClick={event => handleOpenWOIModal()}
                    >
              <AddIcon className={classes.plusIcon}/>
              <div>New Item</div>
            </Button>
          </div></>);
          break;
      case "packingSlip":
        return (<>
        <div className={classes.newButtonDiv} >
          <Button className={classes.newButton} 
                  classes={{label: classes.newButtonLabel}} 
                  variant="outlined"
                  onClick={event=> handleAddNewPackingSlip()}>
            <AddIcon className={classes.plusIcon}/>
            <div>New Packing Slip</div>
          </Button>
        </div></>);
        break;
      default: 
        cogoToast.error("Bad view");
        return <></>;
        break;
    }
  }
  
  return (
    <div className={classes.root}>
        {sideBarTopButtons()}
        {/* { current view == allWorkOrders && <div className={classes.dateRangeDiv}>
            <div className={classes.labelDiv}><span className={classes.dateRangeSpan}>Date Range</span></div>
            <div className={classes.inputDiv}>
              
            </div>
        </div>} */}
        <div className={classes.pagesContainer}>
          <SidebarPages />
        </div>
        <div className={classes.pagesContainer}>
          <CompInvTool />
        </div>

    </div>
  );
}

export default WOSidebarDetail

const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #993333',
      padding: '1%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4%',
      minHeight: '730px',
      borderRight: '1px solid #d2cece',
      backgroundColor: '#f8f8f8'
    },
    newButtonDiv:{
      padding: '3%',
      marginBottom: '15px',
    },
    dateRangeDiv:{
      borderTop: '1px solid #d2cece',
      padding: '3%',
      width: '100%',
      backgroundColor: '#f9f9f9',
    },
    newButtonLabel:{
      display:'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      color: '#5f5f5f',
      fontWeight: 600,
    },
    newButton:{
      boxShadow: '0px 1px 1px 0px #4c4c4c',
      padding: '4px 17px',
      borderRadius: '21px',
      fontSize: '14px',
      background: 'linear-gradient(0deg, #f5f5f5, white)',
      '&:hover':{
        boxShadow: '0px 3px 10px 0px #8c8c8c',
      }
    },
    plusIcon:{
      fontSize: '30px',
      color: '#ce6a00',
    },
    editIcon:{
      fontSize: '30px',
      color: '#25a12e',
      marginRight: '5px',
    },
    labelDiv:{
      textAlign: 'center',
    },  
    inputDiv:{
      display:'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '60%',
      marginLeft: '20%',
      marginTop: '5px',
      color: '#a55400'
    },
    dateRangeSpan:{
      marginRight: '10px',
      fontSize: '13px',
      fontFamily: 'sans-serif',
      fontWeight:'600',
      color: '#666',
      textAlign: 'center'
    },
    inputSpan:{
      marginRight: '10px',
      fontSize: '13px',
      fontFamily: 'sans-serif',
    },
    inputField:{
      '& input':{
      backgroundColor: '#fff',
      padding: '5px 8px',
      width: '80px'
      }
    },
    inlineErrorText:{

    },
    warningDiv:{
      textAlign: 'center',
      color: '#e91818',
      margin: '3px 10px'
    },
    pagesContainer:{
      width: '100%',
      padding: '8% 8%',
      borderTop: '1px solid #d2cece',
      borderBottom: '1px solid #d2cece',
    }
  
}));