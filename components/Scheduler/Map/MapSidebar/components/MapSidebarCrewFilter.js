import React, {useRef, useState, useEffect, useContext} from 'react';


import {makeStyles, Button, Box, Select, MenuItem} from '@material-ui/core';
import GroupIcon from '@material-ui/icons/Group';

import AddSharpIcon from '@material-ui/icons/AddSharp';
import RemoveSharpIcon from '@material-ui/icons/RemoveSharp';
import cogoToast from 'cogo-toast';
import DeleteIcon from '@material-ui/icons/Clear';

import clsx from 'clsx';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MapContext } from '../../MapContainer';
import { CrewContext } from '../../../Crew/CrewContextContainer';


const MapSiderbarCrewJobs = (props) =>{

    const { mapRows, setMapRows,noMarkerRows, setMapRowsRefetch, markedRows, setMarkedRows, vehicleRows, setVehicleRows,
        activeMarker, setActiveMarker,  setResetBounds, infoWeather,setInfoWeather, bouncieAuthNeeded,setBouncieAuthNeeded, visibleItems, setVisibleItems,
        visualTimestamp, setVisualTimestamp, radarControl, setRadarControl,  radarOpacity, setRadarOpacity, radarSpeed, setRadarSpeed, timestamps, setTimestamps,
        multipleMarkersOneLocation, setMultipleMarkersOneLocation, crewJobs, setCrewJobs, crewJobsRefetch, setCrewJobsRefetch, unfilteredJobs, setUnfilteredJobs,
        showCompletedJobs, setShowCompletedJobs,setShowingInfoWindow, crewFilters, setCrewFilters} = useContext(MapContext);

    const {allCrews} = useContext(CrewContext);

    //STATE
    const [crewFilterOpen, setCrewFilterOpen] = useState(null)
    const [selectCrewMenuOpen,setSelectCrewMenuOpen] = useState(false);

    //PROPS
    //const {   } = props;
  


    //CSS
    const classes = useStyles();
    //FUNCTIONS

    const handleOpenCrewFilter = (event)=>{
        setCrewFilterOpen(true);
        setSelectCrewMenuOpen(true);
    }

    const handleClearAndCloseCrewFilter = (event)=>{
        setCrewFilterOpen(false);
        setCrewFilters([]);
        setCrewJobsRefetch(true)
        setResetBounds(true);
    }

    const handleUpdateCrewFilter =(value)=>{
        
        var newArray = value.map((item)=>{
            return (item)
        })

        setCrewFilters(newArray);
        handleCloseSelectMenu();
        setCrewJobsRefetch(true);
        setResetBounds(true);
    }

    const handleCloseSelectMenu = (event)=>{
        setSelectCrewMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectCrewMenuOpen(true);
    }

    


    return(
        <>{crewFilterOpen && allCrews ? 
            <div className={classes.filterCrewDiv}>
                <Select  multiple
                        id={"crewFilterSelect"}
                        className={classes.selectBox}
                        value={(crewFilters)}
                        open={selectCrewMenuOpen}
                        onOpen={handleOpenSelectMenu}
                        onClose={handleCloseSelectMenu}
                        className={classes.filterCrew}
                        onChange={event => handleUpdateCrewFilter(event.target.value)}
                        >
                            <MenuItem value={'unassigned'}>Unassigned</MenuItem>
                    {(()=> {
                        
                        
                        return allCrews?.map((item,i)=>{
                            let name = item.crew_leader_name || `Crew ${item.id}` 
                            return( 
                            <MenuItem value={item.id}>{name}</MenuItem>
                            );
                        }) ;
                    })()}
                </Select> 
                <span>
                    <DeleteIcon className={classes.clearCrewFilterIcon} onClick={event => handleClearAndCloseCrewFilter(event)}/>
                </span>
            </div> : 
            <Button className={classes.crewFilterButton}
                onClick={event => handleOpenCrewFilter(event)}
                variant="text"
                color="secondary"
                size="medium"
            >
                    <GroupIcon/>
                <Box display={{ xs: 'none', md: 'inline' }}  component="span">Crew Filter</Box>
            </Button>
            } </>
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
    },
    filterCrew: {
      
        padding: '0px',
        background: '#fff',
        color: '#19253a',
        '&& .MuiSelect-select':{
            padding: '8px 20px 8px 10px',
            minWidth: '100px',
        },
    },
    filterCrewDiv:{
        margin: '0px 10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#d7ffef',
        padding: '2px 4px',
        borderRadius: '3px',
    },
    crewFilterButton:{
        color: '#152f24',
        border: '1px solid #385248',
        margin: '0px 10px',
        fontWeight: 500,
        backgroundColor: '#ffdfa5',
        '&:hover':{
            backgroundColor: '#f5b844',
            color: '#222',
        }
        
    },
    clearCrewFilterIcon:{
        margin: '2px',
        marginTop: '4px',
        '&:hover':{
            color: '#000',
            background: '#b7b7b75c',
            borderRadius: '8px',
        }
    }
}));