import React, {useRef, useState, useEffect} from 'react';

import ReactDOM from 'react-dom';
import {makeStyles, Avatar, Tooltip} from '@material-ui/core';
//import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
const {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow
  } = require("react-google-maps");

import Util from '../../../js/Util';

const days=["Sunday",'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const MapMarkerInfoWindow = (props)=>{

    //PROPS
    const {activeMarker, setActiveMarker, infoWeather, setInfoWeather, showingInfoWindow, setShowingInfoWindow} = props;
    //STATE

    //CSS
    const classes = useStyles();

    //FUNCTIONS
    useEffect( () =>{ //useEffect for inputText
        setInfoWeather(null);
    },[activeMarker]);

    const handleInfoWindowClose = () =>{
        setInfoWeather(null);
        setShowingInfoWindow(false);
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

    return (
        <InfoWindowEx
        position = {activeMarker ? { lat: activeMarker.lat , lng: activeMarker.lng} : {lat: 0, lng:0}}
        open = { showingInfoWindow }
        style = {classes.infoWindow}
        onCloseClick={handleInfoWindowClose}
        {...props}
        >
        <div >
            {activeMarker ? 
                <><div className={classes.MarkerInfo}>{activeMarker.t_name}</div>
                <div className={classes.MarkerSubInfo}>  ID:&nbsp;{activeMarker.t_id}&nbsp;&nbsp;Priority:&nbsp;{activeMarker.priority_order} </div>
                <div className={classes.avatarContainer}>
                    {!(activeMarker.drilling == "" || activeMarker.drilling == null )
                        ? 
                        <Tooltip title={"Drilling"}><div className={classes.avatarItem}> <Avatar src='/static/drilling-icon.png' alt="Drilling" className={classes.avatar} style={{left: '25%'}}/>{activeMarker.drilling} </div> 
                        </Tooltip>: <></>}
                    {!(activeMarker.sign == "" || activeMarker.sign == null )
                        ? 
                        <Tooltip title={"Sign Status"}>
                        <div className={classes.avatarItem}><Avatar src='/static/sign-build-icon.png' alt="Sign Status" className={classes.avatar} style={{left: '25%'}}/> {activeMarker.sign} </div>
                        </Tooltip>: <></>}
                    {!(activeMarker.artwork == "" || activeMarker.artwork == null )
                        ? 
                        <Tooltip title={"Artwork"}>
                        <div className={classes.avatarItem}><Avatar src='/static/art-icon.png' alt="Artwork" className={classes.avatar} style={{left: '25%'}}/> {activeMarker.artwork} </div> 
                        </Tooltip>: <></>}
                 </div>
            </>  : <p>No Data</p>}
        <button type="button" onClick={event => getWeather(event, activeMarker.lat, activeMarker.lng)} className={classes.infoButton}>
            Weather {infoWeather ? "X" : ""}
        </button>
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

export default MapMarkerInfoWindow;


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
    MarkerInfo:{
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        color: '#16233b',
        backgroundColor: '#abb7c93d',
        padding: '2px',

    },
    MarkerSubInfo:{
        marginLeft:'5%',
        display:'block',
        fontSize: '11px',
        fontWeight: '400',
        color: '#666464',
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
        textTransform: 'uppercase',
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
    }
  }));