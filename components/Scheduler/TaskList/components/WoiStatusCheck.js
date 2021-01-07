import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles, Tooltip} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import WarningIcon from '@material-ui/icons/Warning';
import TimeIcon from '@material-ui/icons/Update';

import { TaskContext } from '../../TaskContainer';
import cogoToast from 'cogo-toast';

import moment from 'moment';
import WorkOrders from '../../../../js/Work_Orders'
import { map } from 'lodash';



const WoiStatusCheck = (props) => {
 
    //PROPS
    const { task,data , handleOpenWoiStatusPopover} = props;

    //STATE
    const [isLoadingState, setIsLoadingState] = React.useState(true);

    const [statusList, setStatusList] = React.useState([]);

    //CSS
    const classes = useStyles();

    const checkData = useCallback((data) =>{
        if(!data){
            console.error("Bad data in checkdata")
            return;
        }
        var statusListUpdate =[];

        //all scoreboard_arrival_date (date not passed, then display all dates and signs, else all fp scbds arrived )
        var awaitingArrivalItems = data.filter((item) => item.scoreboard_arrival_date != null && item.vendor != 2 && moment(item.scoreboard_arrival_date) > moment(new Date()) )
        //console.log("awaitingArrivalItems", awaitingArrivalItems)

        
        if(awaitingArrivalItems?.length > 0){
            awaitingArrivalItems.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Arrival Date',
                     description: `Waiting for Arrival Date`, sign: `${item.description}`, date: ` ${item.scoreboard_arrival_date}`})
            })
        }

        //null scoreboard_arrival_dates (if null, arrival dates not set, else )
        var nullArrivalItems = data.filter((item) => item.scoreboard_arrival_date == null && item.vendor != 2 ) //not rainey
        //console.log("nullArrivalItems", nullArrivalItems)

        if(nullArrivalItems?.length > 0){
            nullArrivalItems.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Empty Arrival Date',
                     description: `No Arrival Date set.`, sign: `${item.description}`})
            })
        }

        //null sign_built dates (if null, show not all signs built, else all signs built)
        var awaitingSignBuilt = data.filter((item) => item.sign_built == null && item.vendor == 2 )
        //console.log("awaitingSignBuilt", awaitingSignBuilt)

        if(awaitingSignBuilt?.length > 0){
            awaitingSignBuilt.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Sign Not Built',
                     description: `Sign not marked as built.`, sign: `${item.description}`})
            })
        }
        //null sign_popped_and_boxed dates (if null, show not all signs finished, else all signs finished)
        var awaitingSignFinished = data.filter((item) => item.sign_popped_and_boxed == null && item.vendor == 2 )
        //console.log("awaitingSignFinished", awaitingSignFinished)

        if(awaitingSignFinished?.length > 0){
            awaitingSignFinished.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Sign Not Finished',
                     description: `Sign not marked as finished (popped & boxed).`, sign: `${item.description}`})
            })
        }

        //console.log("Status lst update", statusListUpdate);
        setStatusList(statusListUpdate);

    } ,[data])

    //FUNCTIONS
    useEffect(()=>{
  
        if(!task?.table_id || !data){
            return;
        }

        checkData(data);
        setIsLoadingState(false);

    },[data])    
    
    const handelOpenStatusPanel =(event)=>{
        if(!statusList){
            console.warn("No status list");
            return;
        }
        handleOpenWoiStatusPopover(event, statusList)

        if(event){
            event.stopPropagation();
        }
    }

    const GetSpecialIconIndicators = ({statusList}) =>{
        var icons = <></>

        if(!statusList){
            return icons;
        }
        statusList.forEach((item)=>{
            if(item.title === "Arrival Date"){
                icons = <TimeIcon className={classes.timeIcon}/>
            }
        })
        return <>{icons}</>;
    }

    return(
        <div className={classes.root}>
            { isLoadingState == true ?  <>Checking...</> :
             <>
              {data ? 
              
                <div>
                  
                  {statusList?.length > 0 ? 
                        <div onMouseUp={event => handelOpenStatusPanel(event)}
                            className={classes.openPanelSpan}>
                         <WarningIcon className={classes.warningIcon} />&nbsp;({statusList.length}) Warnings &nbsp; <GetSpecialIconIndicators statusList={statusList}/>
                        </div> : <></>}
                  
                </div> 
                :<>Loading...</>}
             </>
             }
        </div>
    );

} 

export default WoiStatusCheck;

const useStyles = makeStyles(theme => ({
    root: {

    },
    openPanelSpan:{
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'underline',
        },
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningIcon:{
        width: '.6em',
        height: '.6em',
        color: '#ff6900',
    },
    timeIcon:{
        width: '.9em',
        height: '.9em',
        color: '#333',
    }
  }));
