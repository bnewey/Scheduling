import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress} from '@material-ui/core';

import Crew from '../../../js/Crew';

import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';

var today =  new Date();

export const CrewContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const CrewContainer = function(props) {

    const {tabValue, children} = props;

    const [crewMembers, setCrewMembers] = useState(null);
    const [allCrewJobMembers, setAllCrewJobMembers] = useState(null);
    const [allCrewJobs, setAllCrewJobs] = useState(null);
    const [allCrews, setAllCrews] = useState(null);
    const [memberJobs, setMemberJobs] = useState(null);
    const [shouldResetCrewState, setShouldResetCrewState] = useState(false);
    const [crewJobDateRange, setCrewJobDateRange] = useState({to: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()+30))),
        from: Util.convertISODateToMySqlDate(today)})
    const [crewJobDateRangeActive, setCrewJobDateRangeActive] = useState(false)
        
    //Modal Props
    const [crewModalOpen, setCrewModalOpen] = React.useState(false);

    const classes = useStyles();

    useEffect( ()=>{
        if(tabValue == 2) {//crew page
            setShouldResetCrewState(true);
            console.log("Resetting state on tab")
        }
    }, [tabValue])

    //GetCrewMembers
    useEffect( () =>{ 
    //Gets data only on initial component mount
    if(!crewMembers || crewMembers == null) {
        Crew.getCrewMembers()
        .then( (data) => {
        setCrewMembers(data);
        console.log("crew members available ",data);
        })
        .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting crewMembers`, {hideAfter: 4});
        })
    }
    },[ crewMembers]);

    //GetAllCrewJobMembers - this is for # of jobs before click and also an ez to check against other members items
    useEffect( () =>{ 
        //Gets data only on initial component mount
        if(!allCrewJobMembers || allCrewJobMembers == null) {
            Crew.getAllCrewJobMembers()
            .then( (data) => {
            setAllCrewJobMembers(data);
            console.log("crew job members",data);
            })
            .catch( error => {
            console.warn(error);
            cogoToast.error(`Error getting getAllCrewJobMembers`, {hideAfter: 4});
            })
    }
    },[ allCrewJobMembers]);

    //GetAllCrewJobs - install or drill for each task
    useEffect( () =>{ 
        //Gets data only on initial component mount
        if(!allCrewJobs || allCrewJobs == null) {
            Crew.getAllCrewJobs()
            .then( (data) => {
            setAllCrewJobs(data);
            console.log("crew jobs",data);
            })
            .catch( error => {
            console.warn(error);
            cogoToast.error(`Error getting allcrewJobs`, {hideAfter: 4});
            })
    }
    },[ allCrewJobs]);

    //GetAllCrews - 
    useEffect( () =>{ 
        //Gets data only on initial component mount
        if(!allCrews || allCrews == null) {
            Crew.getAllCrews()
            .then( (data) => {
                setAllCrews(data);
                console.log("crews ",data);
            })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error getting getAllCrews`, {hideAfter: 4});
            })
    }
    },[ allCrews]);

    

    //Reset state effect
    useEffect(()=>{
        if(shouldResetCrewState){
            setAllCrewJobs(null);
            setAllCrews(null);
            setMemberJobs(null);
            setCrewMembers(null);
            setAllCrewJobMembers(null);
            setShouldResetCrewState(false);
        }
    },[shouldResetCrewState])

    return (
    <div className={classes.root}>
        <CrewContext.Provider value={{setShouldResetCrewState, crewMembers, setCrewMembers, crewModalOpen, setCrewModalOpen, allCrewJobs, 
                allCrewJobMembers, setAllCrewJobMembers, setAllCrewJobs, memberJobs,setMemberJobs, allCrews, setAllCrews, crewJobDateRange, setCrewJobDateRange,
                crewJobDateRangeActive, setCrewJobDateRangeActive} } >
                    <> <>{children} </>
   
                    </>
        </CrewContext.Provider>
    </div>
    );
}

export default CrewContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '0px 0px 0px 0px',
  },
}));