import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, Button, ButtonGroup, Slider} from '@material-ui/core'
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { MapContext } from '../MapContainer';

const MapSidebarRadarControls = (props) => { 

    //const {} = props;
    
    const { visibleItems, setVisibleItems,
        visualTimestamp, setVisualTimestamp, radarControl, setRadarControl,  radarOpacity, setRadarOpacity, radarSpeed, setRadarSpeed, timestamps, setTimestamps,
    } = useContext(MapContext);
    
    

    //CSS
    const classes = useStyles();

    const handleChangeRadarControl = (control) =>{
        setRadarControl({
            control
        });
    }

    const handleRadarSpeedChange = (event, newValue) =>{
        setRadarControl({control: "play"})
        setRadarSpeed( newValue);
    }

    const handleRadarOpacityhange = (event, newValue) =>{
        setRadarControl({control: "play"})
        setRadarOpacity( newValue);
    }

    return(
        <div className={classes.rootDiv}>
            <div className={classes.controlsDiv}>
                <ButtonGroup className={classes.radarControlsButtonGroup} variant="contained" color="primary" aria-label="outlined primary button group">
                    <Button className={classes.controlButton} onClick={event => handleChangeRadarControl("reverse")}>
                        <SkipPreviousIcon/>
                    </Button>
                    <Button className={classes.controlButton} onClick={event => handleChangeRadarControl("play")}>
                        <PlayArrowIcon/>
                    </Button>
                    <Button className={classes.controlButton} onClick={event => handleChangeRadarControl("stop")}>
                        <PauseIcon/>
                    </Button>
                    <Button className={classes.controlButton} onClick={event => handleChangeRadarControl("forward")}>
                        <SkipNextIcon/>
                    </Button>
                    <Button className={classes.controlButton} onClick={event => handleChangeRadarControl("current")}>
                        Current
                    </Button>
                </ButtonGroup>
            </div>
            {  radarSpeed && radarControl && radarControl.control == "play" &&
             <div className={classes.speedDiv}>
                 <span className={classes.speedLabelSpan}>Speed:</span>
                 <span className={radarSpeed == 800 ? classes.selectedSpeed : classes.nonSelectedSpeed} 
                        onClick={event => handleRadarSpeedChange(event, 800)}>Slow</span>
                 <span className={radarSpeed == 400 ? classes.selectedSpeed : classes.nonSelectedSpeed} 
                        onClick={event => handleRadarSpeedChange(event, 400)}>Medium</span>
                 <span className={radarSpeed == 100 ? classes.selectedSpeed : classes.nonSelectedSpeed} 
                        onClick={event => handleRadarSpeedChange(event, 100)}>Fast</span>
             </div>  }

             {  radarOpacity && radarControl && radarControl.control == "play" &&
             <div className={classes.speedDiv}>
                 <span className={classes.speedLabelSpan}>Opacity:</span>
                 <span className={radarOpacity == .8 ? classes.selectedSpeed : classes.nonSelectedSpeed} 
                        onClick={event => handleRadarOpacityhange(event, .8)}>Solid</span>
                 <span className={radarOpacity == .5 ? classes.selectedSpeed : classes.nonSelectedSpeed} 
                        onClick={event => handleRadarOpacityhange(event, .5)}>Medium</span>
                 <span className={radarOpacity == .3 ? classes.selectedSpeed : classes.nonSelectedSpeed} 
                        onClick={event => handleRadarOpacityhange(event, .3)}>Clear</span>
             </div>  }
            <div>
                <span>{visualTimestamp}</span>
            </div>
            
        </div>
    );
}

export default MapSidebarRadarControls

const useStyles = makeStyles(theme => ({
    rootDiv: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    controlsDiv:{
        padding: '2%',
        margin: '2px',
        boxShadow: 'inset 0px 0px 1px 1px #bfbfbf',
        backgroundColor: '#868686',
        borderRadius: '6px',
    },
    radarControlsButtonGroup:{
        display: 'flex',
        flexDirection: 'row',
    },
    controlButton:{
        backgroundColor: "#ececec",
        color: '#333333',
        fontWeight: '700',
        '&:hover':{
            backgroundColor: "#fefefe",
            color: '#333399',
        },
    },
    speedDiv:{
        width: '50%',
        display:'flex',
        flexDirection: 'row',
        padding: '1%',
        backgroundColor: '#b0e2cf',
        justifyContent:"center"
    },
    speedLabelSpan:{
        margin: '0% 2%',
        fontWeight: '700'
    },
    selectedSpeed:{
        cursor: "default",
        margin: '0 2px'
    },
    nonSelectedSpeed:{
        cursor: "pointer",
        textDecoration: 'underline',
        margin: '0 2px',
        '&:hover':{
            color: '#555599',
        }
    }
}));