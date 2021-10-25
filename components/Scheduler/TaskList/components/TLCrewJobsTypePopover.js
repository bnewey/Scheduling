import React, {useRef, useState, useEffect, useContext} from 'react';


import {makeStyles, List, ListItem, ListItemText,  ListSubheader,  Popover, } from '@material-ui/core';

import cogoToast from 'cogo-toast';



import Crew from '../../../../js/Crew';
import Util from '../../../../js/Util';


import moment from 'moment'
import { TaskContext } from '../../TaskContainer';



const TLCrewJobsTypePopover = (props) =>{

    //STATE

    //PROPS
    //activeMarkerId / setActiveMarkerId / markedRows passed from MapContainer => MapSidebar => Here
    const { crewJob, setTaskListTasksRefetch } = props;
    

    const {  job_types, user } = useContext(TaskContext);

    //Popover Add/swap crew
    const [typeAnchorEl, setTypeAnchorEl] = React.useState(null);

    

    //CSS
    const classes = useStyles();
    //FUNCTIONS
  

    //Add/Swap Popover for crews
    const handleOpenPopover = (event, job) =>{
        
        setTypeAnchorEl(event.currentTarget);
        event.stopPropagation();
    }
    const handlePopoverClose = () => {
        setTypeAnchorEl(null);
    };

    //Swap Crews  
    const updateCrewTypePopoverOpen = Boolean(typeAnchorEl);
    const updateCrewTypePopoverId = open ? 'add-popover' : undefined;

    const handleUpdateCrewType = React.useCallback((event, new_type, old_job_type) => {
       if(!crewJob || !new_type){
           console.error("Bad crewJob");
           return;
       }
       //might need to check other jobs in crew to see if type already exists

       if(new_type !== old_job_type){
        Crew.updateCrewJobType(crewJob.field_job_id, new_type, user)
        .then((data)=>{
         cogoToast.success("Updated Job Type to " + new_type)
         setTaskListTasksRefetch(true);
        })
        .catch((error)=>{
         console.error("Failed to update crewJob type", error);
         cogoToast.error("Failed to update crewJob type");
        })
       }else{
           cogoToast.info("No change to job");
       }
       
        
    },[crewJob])
    //// END OF Add/Swap Popover for crews


    const typeColor = job_types.find((type)=> type.type === crewJob.field_type )?.color || '#222';
 
    if(!crewJob?.field_job_id){
        return <></>
    }

    return( <div className={classes.root}>
    
            <div className={classes.popOverDiv} 
                 style={{ color: typeColor,
                          boxShadow: `${typeColor} 0px 0px 3px 0px inset`}}
                 onMouseUp={event => handleOpenPopover(event, crewJob)}>
                              {crewJob.field_type} &nbsp;
            </div>

            {updateCrewTypePopoverOpen && <Popover
            id={updateCrewTypePopoverId}
            open={updateCrewTypePopoverOpen}
            anchorEl={typeAnchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            className={classes.popover}
            classes={{paper: classes.popoverPaper}}
        >
            <List 
                subheader={
                    <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                        Update Type
                    </ListSubheader>
                }>
                {crewJob && crewJob.field_type && job_types && job_types.map((v)=> v.type).map((type, i)=>(
                          <ListItem className={classes.crew_list_item} 
                                      key={`job_types+${i}`} button
                                      onMouseUp={(event)=>handleUpdateCrewType(event, type, crewJob.field_type)}>
                              <ListItemText className={classes.jobTypeSpan}>{type}</ListItemText>
                          </ListItem>
                      ))}
            </List>
        </Popover>} </div>
    );

}
export default TLCrewJobsTypePopover;


const useStyles = makeStyles(theme => ({
  root: {
      textAlign: 'center',
      width: '100%',
  },
  popOverDiv:{
    textTransform: 'uppercase',
    textAlign: 'center',
        border: '1px solid #a9a9a9',
        backgroundColor: '#fff',
        '&:hover':{
          boxShadow: '0px 0px 4px 0px black',
          cursor: 'pointer',
          backgroundColor: '#b1b1b159',
        },
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '& span':{
            
        }
    },
    crew_list_item:{
        backgroundColor: '#f9ebca',
        '&:hover':{
            backgroundColor: '#e9c46c',
            color: '#404654',
        },
        padding: '0% 5%',
        border: '1px solid #b2b2b2',
    },
        list_head:{
        lineHeight: '24px',
        borderRadius: '5px',
        color: '#fff',
        backgroundColor: '#61a4a1',
    },
    jobTypeSpan:{
        textTransform: 'uppercase',
    },
    typeSpan:{
        height: '1em'
    }
}));