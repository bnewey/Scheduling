import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles, Tooltip} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { TaskContext } from '../../TaskContainer';
import cogoToast from 'cogo-toast';

import moment from 'moment';
import WorkOrders from '../../../../js/Work_Orders'
import { map } from 'lodash';


const WoiStatusCheck = (props) => {
 
    //PROPS
    const { fieldId, value, type,task,data , handleOpenWoiStatusPopover} = props;

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
        var awaitingArrivalItems = data.filter((item) => item.scoreboard_arrival_date != null && moment(item.scoreboard_arrival_date) > moment(new Date()) )
        //console.log("awaitingArrivalItems", awaitingArrivalItems)

        
        if(awaitingArrivalItems?.length > 0){
            awaitingArrivalItems.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Arrival Date',
                     description: `${item.description} - Waiting for Arrival Date - ${item.scoreboard_arrival_date}`})
            })
        }

        //null scoreboard_arrival_dates (if null, arrival dates not set, else )
        var nullArrivalItems = data.filter((item) => item.scoreboard_arrival_date == null )
        //console.log("nullArrivalItems", nullArrivalItems)

        if(nullArrivalItems?.length > 0){
            nullArrivalItems.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Empty Arrival Date',
                     description: `${item.description} - No Arrival Date set.`})
            })
        }

        //null sign_built dates (if null, show not all signs built, else all signs built)
        var awaitingSignBuilt = data.filter((item) => item.sign_built == null )
        //console.log("awaitingSignBuilt", awaitingSignBuilt)

        if(awaitingSignBuilt?.length > 0){
            awaitingSignBuilt.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Sign(s) Not Built',
                     description: `${item.description} - Sign not marked as built.`})
            })
        }
        //null sign_popped_and_boxed dates (if null, show not all signs finished, else all signs finished)
        var awaitingSignFinished = data.filter((item) => item.sign_popped_and_boxed == null )
        //console.log("awaitingSignFinished", awaitingSignFinished)

        if(awaitingSignFinished?.length > 0){
            awaitingSignFinished.forEach((item)=>{
                statusListUpdate.push({type: 'error', title: 'Sign(s) Not Finished',
                     description: `${item.description} -Sign not marked as finished (popped & boxed).`})
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

    return(
        <div className={classes.root}>
            { isLoadingState == true ?  <>Checking...</> :
             <>
              {data ? 
              
                <div>
                  {statusList?.length <= 1 ? <>{statusList.map((item)=> 
                    <div>{item.title}</div>
                  )}</> : 
                  <> 
                  {statusList?.length > 0 ? 
                        <div onMouseUp={event => handelOpenStatusPanel(event)}
                            className={classes.openPanelSpan}>
                         ({statusList.length}) Warnings
                        </div> : <></>}
                  </>
                  }
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
        }
    }
  }));
