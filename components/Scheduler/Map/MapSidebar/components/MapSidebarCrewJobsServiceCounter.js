import React, {useRef, useState, useEffect, useContext} from 'react';


import {makeStyles} from '@material-ui/core';

import AddSharpIcon from '@material-ui/icons/AddSharp';
import RemoveSharpIcon from '@material-ui/icons/RemoveSharp';
import cogoToast from 'cogo-toast';

import clsx from 'clsx';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../../js/Tasks';
import Crew from '../../../../../js/Crew';
import TaskLists from '../../../../../js/TaskLists';
import TLCrewJobDatePicker from '../../../TaskList/components/TLCrewJobDatePicker';
import {TaskContext} from '../../../TaskContainer';
import Util from '../../../../../js/Util';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import {debounce} from 'lodash';


import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SwapIcon from '@material-ui/icons/SwapHoriz';
// import { confirmAlert } from 'react-confirm-alert'; // Import
// import ConfirmYesNo from '../../../../UI/ConfirmYesNo';

//import { CrewContext } from '../../CrewContextContainer';

import moment from 'moment'

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';
import { MapContext } from '../../MapContainer';



const MapSiderbarCrewJobs = (props) =>{


    //STATE

    //PROPS
    const { crewJob  } = props;
  

    const {  setCrewJobsRefetch ,setChangeStateSoMapUpdates,} = useContext(MapContext);

    const [savePending, setSavePending] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(crewJob.num_services);

    //CSS
    const classes = useStyles();
    //FUNCTIONS

    const handleDebounceUpdateNumServices = React.useCallback(
        debounce((crew_id, numToUpdate) => 
            Crew.updateCrewNumServices(crew_id,numToUpdate )
            .then((data)=>{
                setCrewJobsRefetch(true)
            })
            .catch((error)=>{
                console.error("Failed to add to numservices", error);
                cogoToast.error("Failed to add to numServices")
            })
        ,2000)
    ,[]);

    const handleUpdateToNumServices = (value)=>{
        
        if(!crewJob.id){
            console.error("No crewjob id in handleAddToNumServices");
            return;
        }
        if(!isNaN(value)){
            setSavePending(true);

            handleDebounceUpdateNumServices(crewJob.id, value)
        }
    }

    const handleAdd = (event) =>{
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        setLocalValue(localValue + 1);
        handleUpdateToNumServices(localValue + 1)
    }

    const handleSubtract = (event) =>{
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        if(localValue > 0){
            setLocalValue(localValue - 1);
            handleUpdateToNumServices(localValue - 1)
        }else{
            cogoToast.error("Cannot lower")
            return;
        }
        
    }



    return(
        <div className={classes.numServicesContainer}>
            <div className={classes.removeIconDiv} onClick={(event)=> handleSubtract(event)}><RemoveSharpIcon/></div>
            <span>{localValue}</span>
            <div className={classes.addIconDiv} onClick={(event)=> handleAdd(event)}><AddSharpIcon/></div>
        </div>
    );

}
export default MapSiderbarCrewJobs;


const useStyles = makeStyles(theme => ({
    root: {
        margin: '10px 0px 10px 0px',
        color: '#535353',
        width: '100%',
    },
    numServicesContainer:{
        display: 'flex',
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeIconDiv:{
        cursor: 'pointer',
        color: '#3179ff',
        '&:hover':{
            
        },
        '& svg':{
            width: '.8em',
            height: '.8em',
            margin: '0px 4px',
            padding: '0px 2px',
            border: '1px solid #b8b8b8',
            background: 'linear-gradient(   0deg, #bababa, #f6f6f6, #e3e3e3)',
        }
    },
    addIconDiv:{
        cursor: 'pointer',
        color: '#3179ff',
        '&:hover':{
            
        },
        '& svg':{
            width: '.8em',
            height: '.8em',
            margin: '0px 4px',
            padding: '0px 2px',
            border: '1px solid #b8b8b8',
            background: 'linear-gradient(   0deg, #bababa, #f6f6f6, #e3e3e3)',
        }
    }
}));