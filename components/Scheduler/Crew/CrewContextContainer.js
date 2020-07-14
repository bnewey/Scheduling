import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress} from '@material-ui/core';

import Crew from '../../../js/Crew';

import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';


export const CrewContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const CrewContainer = function({children}) {
    const [crewMembers, setCrewMembers] = useState(null);
    const [allCrewJobs, setAllCrewJobs] = useState(null);
    const [memberJobs, setMemberJobs] = useState(null);
    const [shouldResetCrewState, setShouldResetCrewState] = useState(false);
    //Modal Props
    const [crewModalOpen, setCrewModalOpen] = React.useState(false);

    const classes = useStyles();


    //GetCrewMembers
    useEffect( () =>{ 
    //Gets data only on initial component mount
    if(!crewMembers || crewMembers == null) {
        Crew.getCrewMembers()
        .then( (data) => {
        setCrewMembers(data);
        console.log("crew",data);
        })
        .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting crewMembers`, {hideAfter: 4});
        })
    }
    },[ crewMembers]);

    //GetAllCrewJobs
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

    //Reset state effect
    useEffect(()=>{
        if(shouldResetCrewState){
            setAllCrewJobs(null);
            setMemberJobs(null);
            setCrewMembers(null);
            setShouldResetCrewState(false);
        }
    },[shouldResetCrewState])

    return (
    <div className={classes.root}>
        <CrewContext.Provider value={{setShouldResetCrewState, crewMembers, setCrewMembers, crewModalOpen, setCrewModalOpen, allCrewJobs, setAllCrewJobs, memberJobs,setMemberJobs} } >
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