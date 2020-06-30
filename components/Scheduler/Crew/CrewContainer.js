import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress} from '@material-ui/core';

import Crew from '../../../js/Crew';

import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';

import CrewModal from './CrewModal/CrewModal';

export const CrewContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const CrewContainer = function({children}) {
    const [crewMembers, setCrewMembers] = useState(null);
    const [allCrewJobs, setAllCrewJobs] = useState(null);
    //Modal Props
    const [crewModalOpen, setCrewModalOpen] = React.useState(false);

    const classes = useStyles();


    //GetCrewMembers
    useEffect( () =>{ 
    //Gets data only on initial component mount
    if(!crewMembers || crewMembers == []) {
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
        if(!allCrewJobs || allCrewJobs == []) {
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


    return (
    <div className={classes.root}>
        <CrewContext.Provider value={{crewMembers, setCrewMembers, crewModalOpen, setCrewModalOpen, allCrewJobs, setAllCrewJobs} } >
                    <> <>{children} </>
                        <>
                            <CrewModal crewMembers={crewMembers} setCrewMembers={setCrewMembers} crewModalOpen={crewModalOpen} 
                                    setCrewModalOpen={setCrewModalOpen} allCrewJobs={allCrewJobs} setAllCrewJobs={setAllCrewJobs}/>
                        </> 
                    </>
        </CrewContext.Provider>
    </div>
    );
}

export default CrewContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '25px 0px 0px 0px',
  },
}));