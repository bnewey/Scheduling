import React, {useRef, useState, useEffect} from 'react';

import ReactDOM from 'react-dom';
import {makeStyles, Avatar, Tooltip, Button,TextField} from '@material-ui/core';
//import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
const {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow
  } = require("react-google-maps");

  import CloudTwoToneIcon from '@material-ui/icons/CloudTwoTone';
  import EditLocationSharpIcon from '@material-ui/icons/EditLocationSharp';

import Tasks from '../../../js/Tasks';
import Work_Orders from '../../../js/Work_Orders';

import Util from '../../../js/Util';
import cogoToast from 'cogo-toast';
import moment from 'moment';
import Router from 'next/router'
import clsx from 'clsx';
import { TaskContext } from '../TaskContainer';
import { MapContext } from './MapContainer';

const days=["Sunday",'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const MapCrewInfoWindow = (props)=>{

    //PROPS
    const {crewMarkers, activeMarker, setActiveMarker, infoWeather, setInfoWeather, showingInfoWindow, setShowingInfoWindow,markerToRemap, setMarkerToRemap,
        multipleMarkersOneLocation, setMultipleMarkersOneLocation} = props;
    const {setCrewJobsRefetch} = React.useContext(MapContext)

        const {  job_types, user } = React.useContext(TaskContext);
    //STATE
    const [jobTask, setJobTask] = useState(null);
    const [notesEdit, setNotesEdit] = useState(false);
    const [notes, setNotes] = useState(null);
    const [shouldUpdate,setShouldUpdate]  = useState(false)
    //CSS
    const classes = useStyles();

    //FUNCTIONS
    useEffect( () =>{ //useEffect for inputText
        setInfoWeather(null);
        setShouldUpdate(false);
        console.log("Active marker", activeMarker);
        if(activeMarker){
            Tasks.getTask(activeMarker.item?.task_id)
            .then((data)=>{
                if(data){
                    setJobTask(data[0]);
                }
            })
            .catch((error)=>{
                console.error("Failed to get task for job", error);
                cogoToast.error("Failed to get task for job");
            })

            if(notesEdit){
                setNotesEdit(false);
            }
            if(notes !== activeMarker.item?.notes){
                setNotes(null)
            }
        }
    },[activeMarker]);

    const handleShouldUpdate = (event , update) =>{
        setNotes(event.target.value);
        setShouldUpdate(update)
    }

    const handleInfoWindowClose = () =>{
        setInfoWeather(null);
        setShowingInfoWindow(false);
        setMultipleMarkersOneLocation(null);
        setShouldUpdate(false)
    }

    const getWeather = (event, lat, lng) => {
        if(infoWeather){
            setInfoWeather(null);
            return;
        }

        Util.getWeather(lat, lng)
        .then((data)=>{
            setInfoWeather(data);
        })
        .catch((error)=>{
            console.error(error);
        })
    }

    const getWeatherIcon = (code) =>{
        var icon_url = "/static/weather_icons/";
        switch(code) {
            case "cloudy": case "fog_light":  case "fog":  case "mostly_cloudy": case "partly_cloudy":
                icon_url += "cloud.png";
              break;
            case "partly_cloudy": case "mostly_clear":  case "clear":
                icon_url += "sun.png";
              break;
            case "snow": case "flurries": case "snow_light": case "snow_heavy": case "ice_pellets_light":
            case "ice_pellets_heavy": case "freezing_drizzle": case "freezing_rain_light": case "freezing_rain": case "freezing_rain_heavy":
                icon_url += "snow.png";
                break;
            case "rain": case "drizzle": case "rain_light": case "rainy_heavy": case "tstorm":
                icon_url += "water.png";
            break;
            default:
                icon_url += "sun.png";
          }
          return(icon_url);
    }

    const handleSetMarkerToRemap = (event)=>{
        if(!jobTask || !activeMarker){
            cogoToast.error("Error remapping");
            console.error("Failed to set remap marker; no jobtask")
            return;
        }
        setMarkerToRemap({type: activeMarker.type , item: jobTask});

        //Set cursor to crosshair, maybe focus the map
    }
    const handleCancelRemap = (event)=>{
        setMarkerToRemap(null);
    }

    const handleNextMultiMarker =(event)=>{
        let index = multipleMarkersOneLocation.indexOf(activeMarker.item.id);
        if(index >= multipleMarkersOneLocation.length-1){
            index =0;
        }else{
            index++;
        }
        let newActiveId = multipleMarkersOneLocation[index];
        let newActiveMarker = crewMarkers.filter((marker, i)=> marker.id == newActiveId)[0]; 

        setActiveMarker({type: 'crew', item: newActiveMarker});
    }

    const handlePrevMultiMarker =(event)=>{
        let index = multipleMarkersOneLocation.indexOf(activeMarker.item.id);
        if(index <= 0){
            index = multipleMarkersOneLocation.length-1;
        }else{
            index--;
        }
        let newActiveId = multipleMarkersOneLocation[index];
        let newActiveMarker = crewMarkers.filter((marker, i)=> marker.id == newActiveId)[0]; 
        setActiveMarker({type: "crew", item: newActiveMarker});
    }

    const handleGoToWorkOrderId = (wo_id, event) =>{
        //console.log("woi", wo_id);
        //Disable Default context menu
        event.preventDefault();
        
        //set detailWOIid in local data
        window.localStorage.setItem('detailWOid', JSON.stringify(wo_id));
        
        //set detail view in local data
        window.localStorage.setItem('currentView', JSON.stringify("woDetail"));
    
        Router.push('/scheduling/work_orders')
      }

    const handleEditNotes = (notesEdit)=>{
        if(notesEdit == false){
            setNotesEdit(true);
        }else{
            setNotesEdit(false);
        }
        
    }

    const handleSaveNotes = (event, item)=>{
        if(!shouldUpdate){
            console.log("No changes");
            cogoToast.info("No changes");
            setNotesEdit(false);
            return
        }
        if(!item){
            if(error?.user_error){
                cogoToast.error(error.user_error);
            }else{
                cogoToast.error("Internal Server Error");
            }
            console.error("No item in handleSaveNotes")
        }

        console.log("notes", notes);
        Work_Orders.updateWONotes(item.wo_id, notes, user )
        .then((data)=>{
            cogoToast.success("Updated notes");
            setCrewJobsRefetch(true);
            setNotesEdit(false);
            setShouldUpdate(false);
        })
        .catch((error)=>{
            cogoToast.error("Failed to update notes");
            console.error("Failed to update notes", error);
        })

    }


    const crewColor = React.useCallback(activeMarker?.item?.crew_color || '#555', [activeMarker]);
    const typeColor = React.useCallback(job_types.find((type)=> type.type === activeMarker?.item?.job_type )?.color || '#222', [activeMarker]);


    return (
        <InfoWindowEx
        position = {activeMarker?.item ? { lat: activeMarker.item.lat , lng: activeMarker.item.lng} : {lat: 0, lng:0}}
        open = { showingInfoWindow }
        style = {classes.infoWindow}
        onCloseClick={handleInfoWindowClose}
        defaultOptions={{pixelOffset: new google.maps.Size(0,-35) }}
        {...props}
        >
        <div >
            {activeMarker?.item ? 
                <>
                {multipleMarkersOneLocation && 
                    <div className={classes.multipleMarkersDiv}>
                        <div className={classes.multiMarkerLabelDiv}><span className={classes.multipleMarkersSpan}>Multiple Markers!</span></div>
                        <Button onClick={event=>handlePrevMultiMarker(event)}
                                className={classes.multiMarkerButton}>{"Prev"}</Button>
                        <Button onClick={event=>handleNextMultiMarker(event)}
                                className={classes.multiMarkerButton}>{"Next"}</Button>
                    </div>
                }
                <div className={classes.markerInfo}>{activeMarker.item.t_name}</div>
                <div className={classes.markerSubInfo}> 
                    <div className={classes.markerSubInfoDiv}>
                        <span className={classes.markerSubInfoLabel}>WO#:</span>
                        <span className={clsx({[classes.markerSubInfoValue]: true, 
                                            [classes.clickableWOnumber]: true})} 
                                            onClick={(event)=>handleGoToWorkOrderId(activeMarker?.item?.table_id,event)}>{activeMarker?.item?.table_id}</span>
                    </div> 
                    <div className={classes.markerSubInfoDiv}>
                        <span className={classes.markerSubInfoLabel}>Services:</span>
                        <span className={classes.markerSubInfoValue}>{activeMarker?.item?.num_services}</span>
                    </div> 
                    <div className={classes.markerSubInfoDiv} >
                        <span className={classes.markerSubInfoLabel}>Type:</span>
                        <span className={classes.markerSubInfoValue} style={{fontWeight: '500', color: typeColor, textTransform: 'uppercase',  }}>{activeMarker?.item?.job_type}</span>
                    </div>
                    <div className={classes.markerSubInfoDiv} >
                        <span className={classes.markerSubInfoLabel}>Crew:</span>
                        <span  className={classes.markerSubInfoValue}
                               style={{  fontWeight: '500',
                                        color: '#fff',
                                        backgroundColor: `${crewColor}`}}>{activeMarker?.item?.crew_id ? activeMarker?.item?.leader_name ? activeMarker?.item?.leader_name : 'Crew '+  activeMarker?.item?.crew_id : ''}</span>
                    </div>
                    <div className={classes.markerSubInfoDiv}>
                        <span className={classes.markerSubInfoLabel}>Date:</span>
                        <span className={classes.markerSubInfoValue}>{ activeMarker?.item?.job_date ? moment(activeMarker?.item?.job_date).format('MM-DD-YYYY') : ''}</span>
                    </div>
                    <div className={classes.markerSubInfoDiv}>
                        <span className={classes.markerSubInfoLabel}>Descr:</span>
                        <span className={classes.markerSubInfoValue}>{ activeMarker?.item?.description}</span>
                    </div>
                    <div className={classes.markerSubInfoDiv}>
                        <span className={clsx({[classes.markerSubInfoLabel]: true, 
                                            [classes.clickableWOnumber]: true})}
                                            onClick={(event)=> handleEditNotes(notesEdit)}>Notes:</span>
                        {!notesEdit && <span className={classes.markerSubInfoValue}>{ activeMarker?.item?.notes}</span>}
                        
                        {notesEdit && <div>
                                <TextField id={`wo_notes`} 
                                   
                                    variant="outlined"
                                    multiline
                                    name={'item_notes'}
                                    value={notes}
                                    InputProps={{className: classes.inputRoot}} 
                                    defaultValue={ activeMarker?.item?.notes }
                                    onChange={(event)=>handleShouldUpdate(event,true)}  />
                                <span className={classes.clickableWOnumber} onClick={(event)=> handleSaveNotes(event, activeMarker?.item )}>Save</span>
                            </div>}
                    </div>
                </div>
                
            </>  : <p>No Data</p>}
            <div className={classes.buttonContainer}>
                <div>
                    <CloudTwoToneIcon onClick={event => getWeather(event, activeMarker.item.lat, activeMarker.item.lng)}
                        className={clsx({ [classes.weatherInfoButtonActive]: !!infoWeather, [classes.weatherInfoButtonInactive]: !infoWeather })}/>
                </div>

                <div>
                    {  !markerToRemap && <EditLocationSharpIcon onClick={event => handleSetMarkerToRemap(event)} 
                        className={clsx({ [classes.weatherInfoButtonActive]: !!markerToRemap })} /> }
                </div>
                {markerToRemap ? <button type="button" onClick={event => handleCancelRemap(event)} className={classes.infoButton}>
                    Cancel Remap
                </button> : <></>}
            </div>
            { infoWeather ? <div className={classes.weather_div}> 

            <table className={classes.weather_table}>
                <thead>
                <tr>
                <th></th>
                { 
                    infoWeather.map((day, i)=>{ 
                    var date =new Date(day.observation_time.value).getUTCDay();
                    return(
                    <th key={"head"+i}>{days[date] }</th>
                    )
                })}
                </tr>
                </thead>
                <tbody>
                <tr > 
                <td></td>
                {infoWeather.map((day, i)=>{
                    return (
                    <td key={"avatar"+i}><Avatar src={getWeatherIcon(day.weather_code.value)} className={classes.avatar}/></td>
                    )
                })}
                </tr>
                <tr className='dataRow'> 
                <td>Min/Max</td>
                {infoWeather.map((day, i)=>{
                    return (
                    <td key={"temp"+i}>{day.temp[0].min.value.toFixed(0)}&#176; - {day.temp[1].max.value.toFixed(0)}&#176;</td>
                    )
                })}
                </tr>
                <tr className='dataRow'>
                <td>Rain (%)</td>
                {infoWeather.map((day, i)=>{
                    return (
                    <td key={"rain"+i}>{day.precipitation_probability.value}% </td>
                    )
                })}
                </tr>
                <tr className='dataRow'>
                <td>Rain (in.)</td>
                {infoWeather.map((day, i)=>{
                    return (
                    <td key={"rain_ammount"+i}> {day.precipitation[0].max.value}in.</td>
                    )
                })}
                </tr>
                <tr><td></td>
                    <td colSpan={infoWeather.length} style={{fontSize: '7px'}}>Icons made by <a href="https://www.flaticon.com/authors/freepik" target="_blank" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" target="_blank" title="Flaticon"> www.flaticon.com</a></td>
                    </tr>
                </tbody>
            </table>
        </div>: <></>}

        </div>
        </InfoWindowEx>
    );
}

export default MapCrewInfoWindow;


class InfoWindowEx extends React.Component {
    constructor(props) {
      super(props);
      this.infoWindowRef = React.createRef();
      this.contentElement = document.createElement(`div`);
    }
  
    componentDidUpdate(prevProps) {
      if (this.props.children !== prevProps.children) {
        ReactDOM.render(
          React.Children.only(this.props.children),
          this.contentElement
        );
        //console.log("Infowindowref", this.infoWindowRef.current);
        //this.infoWindowRef.current.setContent(this.contentElement);
        
      }
    }
  
    render() {
      return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
    }
  }

  const useStyles = makeStyles(theme => ({
    infoWindow: {
      backgroundColor: '#000'
    },
    weather_div:{
       backgroundColor: '#f3f3f3',
       boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    markerInfo:{
        minWidth: '260px',
        display: 'block',
        color: '#293a5a',
        display: 'block',
        padding: 0,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'sans-serif',

    },
    markerSubInfo:{
        width: '100%',
        display:'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'start',
    },
    markerSubInfoDiv:{
        width: '100%',
        display:'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'start',
    },
    markerSubInfoLabel:{
        color: '#555',
        flexBasis: '25%',
        paddingRight: '10px',
        textAlign: 'right',
    },
    markerSubInfoValue:{
        color: '#000', 
        flexBasis: '75%',
        paddingLeft: '10px',
        textAlign: 'left',
        maxWidth: '300px'
    },
    buttonContainer:{
        width: '100%',
        display:'flex',
        padding: '5px',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'start',
    },
    weather_table:{
        fontSize: '10px',
        padding: '6px 14px',
        border: '1px solid #b9b9b9',
        '&& td':{
            padding: '5px',
        },
        '&& .dataRow td':{
            borderRight: '1px solid #b5b5b5',
        }
    },
    weatherInfoButtonActive:{
        textTransform: 'uppercase',
        color: "#00ff00",
        '&: hover':{
            color: "#00dd00",
        }
    },
    weatherInfoButtonInactive:{
        textTransform: 'uppercase',
        color: "#444"
    },
    infoButton:{
        display: 'block',
        margin: '5px',
        color: 'rgba(0, 0, 0, 0.87)',
        backgroundColor: '#e1e3f8',
        padding: '0px 16px',
        fontSize: '0.575rem',
        minWidth: '64px',
        boxSizing: 'border-box',
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        fontFamily: "Roboto, Helvetica,Arial, sans-serif",
        fontWeight: '500',
        lineHeight: '1.75',
        borderRadius: '4px',
        letterSpacing: '0.02857em',
        
    },
    avatarContainer:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '2px 5px',
        padding: '10px 15px',
    },
    avatar:{
        width: '35px',
        height:'35px',
        position: 'relative',
    },
    avatarItem:{
        margin: '1px 15px',
    },
    multipleMarkersDiv:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdd4d4',
        borderRadius: '6px',
        border: '1px solid #c1c1c1',
        margin: '3% 1%',
    },
    multiMarkerButton:{
        border: '1px solid #444',
        fontSize: '10px',
        padding: '1%',
        margin: '2% 1%',
        backgroundColor: '#e8e8e8',
        '&:hover':{
            backgroundColor: '#cccccc'
        }
    },
    multiMarkerLabelDiv:{
        margin: '2%'
    },
    clickableWOnumber:{
        cursor: 'pointer',
        textDecoration: 'underline',
        '&:hover':{
          color: '#ee3344',
        }
    },
    inputRoot:{
        backgroundColor: '#f5fdff',
        padding: '2px 2px',
        fontSize: 12,
    }

  }));