
import {makeStyles} from '@material-ui/core';
import { useState, useEffect } from 'react';

const fetch = require("isomorphic-fetch");
const { compose, withProps, withHandlers } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} = require("react-google-maps");
const { MarkerClusterer } = require("react-google-maps/lib/components/addons/MarkerClusterer");
const { MarkerWithLabel } = require("react-google-maps/lib/components/addons/MarkerWithLabel");

import cogoToast from 'cogo-toast';
import MapMarkerInfoWindow from './MapMarkerInfoWindow';
import MapVehicleInfoWindow from './MapVehicleInfoWindow';

import Tasks from '../../../js/Tasks';
import Util from '../../../js/Util';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';


//radar variables need to be global
var animationPosition = 0;
var radarLayers = [];


const CustomMap = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBd9JvLz52kD4ouQvqlHePUAqlBWzACJ-c&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: '100%',minHeight: `450px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withHandlers({
    onMarkerClustererClick: () => (markerClusterer,setMultipleMarkersOneLocation, googleMap) => {
      const clickedMarkers = markerClusterer.getMarkers()
      const zoom = googleMap.current.getZoom();
      console.log("clickedMarkers",clickedMarkers);
      var marker_ids = clickedMarkers.map((marker,i)=> marker.getTitle());
      console.log('marker ids', marker_ids);
      console.log("zoom", zoom)
      //open menu for selecting correct marker
      if(zoom == 22){
        setMultipleMarkersOneLocation(marker_ids);
        //useEffect below sets marker_ids[0] to activeMarker
      }
    },
    onMapClick: ()=> (event, markerToRemap, setMarkerToRemap, showingInfoWindow, setShowingInfoWindow, setMapRows, activeMarker, setActiveMarker)=> {
      if(showingInfoWindow && event.placeId){
        setShowingInfoWindow(false);
      }
      if(markerToRemap){
        let coords  = {lat: event.latLng.lat(),lng: event.latLng.lng()};
        const save = () =>{
            Tasks.saveCoordinates(markerToRemap.address_id, coords)
            .then((data)=>{
              cogoToast.success("Remapped Marker")
              setMarkerToRemap(null);
              setMapRows(null);
              //Refresh activeMarker with new coords
              if(activeMarker){
                let refreshedMarker = {...activeMarker};
                refreshedMarker['lat'] = coords.lat;
                refreshedMarker['lng'] = coords.lng;
                setActiveMarker(refreshedMarker);
              }
            })
            .catch((error)=>{
              console.error("failed to remap", error);
              cogoToast.error("Failed to remap marker");
            })
        }

        confirmAlert({
          message:"Change coordinates?",
          buttons:[
              {
                  label: 'Yes',
                  onClick: save
              },
              {
                  label: "No",
                  onClick: () => {setMarkerToRemap(null);
                    cogoToast.info("Cancelled Remap")}
              }
          ],
        })
      }
    },
    infoWindowContentChanged: () => (window)=>{
      //console.log("infowindow content changed ", window)

    },
    
  }),
  withScriptjs,
  withGoogleMap
)(props =>{

    const googleMap = React.useRef(null);
    const {taskMarkers, vehicleMarkers, visibleItems, resetBounds, activeMarker, setActiveMarker,activeVehicle, setActiveVehicle,
        setInfoWeather, infoWeather, showingInfoWindow, setShowingInfoWindow, bouncieAuthNeeded, setBouncieAuthNeeded, setMapRows,
        mapRows, vehicleRows, radarControl, setRadarControl, visualTimestamp, setVisualTimestamp, radarOpacity, radarSpeed, setTimestamps, timestamps,
        multipleMarkersOneLocation,setMultipleMarkersOneLocation} = props;

    const [markerToRemap, setMarkerToRemap] = React.useState(null);

    //Radar state maybe can stay here
    
    const [animationTimer, setAnimationTimer] =React.useState(false);

    useEffect( () =>{ //useEffect for inputText
        if(taskMarkers != null)
        googleMap.current.fitBounds(getBounds(google.maps, [...taskMarkers]));
        //setResetBounds(false);
        return () => { //clean up
            if(resetBounds){
                
            }
        }
    },[resetBounds, taskMarkers, googleMap]);

    useEffect(()=>{
        var a = googleMap.current.getDiv();
        if(markerToRemap != null){     
            a.style.border = '8px solid #ffa500';
        }else{
            a.style.border = '';
        }
    }, [markerToRemap])

    useEffect(()=>{
        if(multipleMarkersOneLocation && multipleMarkersOneLocation.length){
            let newActiveMarker = taskMarkers.filter((marker,i)=> marker.t_id == multipleMarkersOneLocation[0])[0];
            console.log("NewactiveMarker", newActiveMarker);
            setActiveMarker(newActiveMarker);
            setShowingInfoWindow(true);
            setActiveVehicle(null);
        }
    }, multipleMarkersOneLocation)

    ///RADAR //////////////////////////////////////////////////////////////////////////////////////////////////////
    //Control the radar from props (controls in MapSidebar)
    useEffect(()=>{
        if(radarControl && googleMap){
        switch(radarControl.control){
            case "play":
            if(timestamps.length > 0){
                googleMap.current.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.overlayMapTypes.clear();
                radarLayers=[];
                var animationPosition = 0;
            }
            if(animationTimer){
                clearTimeout(animationTimer);
            }

            // Main animation driver. Run this function every 500 ms
            setAnimationTimer((setInterval(()=>{
                showFrame(1)}
                , radarSpeed)));
            break;
            case "stop":
            if (animationTimer) {
                clearTimeout(animationTimer);
                setAnimationTimer(false);
            }
            break;
            case "reverse":
            if (animationTimer) {
                clearTimeout(animationTimer);
                setAnimationTimer(false);
            }
            showFrame(-1);
            break;
            case "forward":
            if (animationTimer) {
                clearTimeout(animationTimer);
                setAnimationTimer(false);
            }
            showFrame(1); 
            break;
        }
        }
    },[radarControl, googleMap])

    useEffect(()=>{
        if(visibleItems && visibleItems.indexOf("radar") != -1){
        onRadarInit();
        }else{
        if(timestamps.length > 0){
            googleMap.current.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.overlayMapTypes.clear();
            setRadarControl({control: "stop"});
        }
        }
    },[visibleItems])

    const onRadarInit = ( )=> {
        Util.getWeatherRadar("https://api.rainviewer.com/public/maps.json")
        .then((data)=>{
            setTimestamps(data)
        })
        .catch((error)=>{
        cogoToast.error("Radar Error");
        })
    }

    const addLayer = (ts) =>   {
        return new Promise( (resolve,reject) => {
        if (!radarLayers[ts]) {
            radarLayers[ts] = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return ['https://tilecache.rainviewer.com/v2/radar/' + ts + '/256/',
                    zoom, '/', coord.x, '/', coord.y, '/2/1_1.png'].join('');
            },
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.001
            });
            
            googleMap.current.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.overlayMapTypes.push(radarLayers[ts]);        
        }
        resolve();
        return
    })
    }
    const changeRadarPosition = async (position, preloadOnly) => {
        while (position >= timestamps.length) {
            position -= timestamps.length;
        }
        while (position < 0) {
            position += timestamps.length;
        }
        
        var currentTimestamp = timestamps[animationPosition];
        var nextTimestamp = timestamps[position];
        
        await addLayer(nextTimestamp);
        
        if (preloadOnly) {
            return;
        }

        animationPosition = position;

        if (radarLayers[currentTimestamp]) {
            radarLayers[currentTimestamp].setOpacity(0);
        }
        radarLayers[nextTimestamp].setOpacity(radarOpacity);
        
        setVisualTimestamp((new Date(nextTimestamp * 1000)).toString())
    }
    const showFrame = (nextPosition) => {
        var preloadingDirection = (animationPosition + nextPosition) - animationPosition > 0 ? 1 : -1;
        changeRadarPosition(animationPosition + nextPosition);
        // preload next next frame (typically, +1 frame)
        // if don't do that, the animation will be blinking at the first loop
        changeRadarPosition((animationPosition + nextPosition) + preloadingDirection, true);
    }
    ///END OF RADAR //////////////////////////////////////////////////////////////////////////////////////////////////////

  
    const getBounds = (map, markers)=> {
        const points = markers.filter((v, i)=> v.geocoded).map((item, index)=> ({ lat: item.lat, lng: item.lng}));
        var tempBounds = new map.LatLngBounds();
        for (var i = 0; i < points.length; i++) {    tempBounds.extend(points[i]);    }
        
        return tempBounds
    };

    const handleClusterClick = (event)=>{
        console.log("event", event);
    }

    

  return(
    <>
    <GoogleMap
        defaultZoom={7} 
        ref={googleMap}
        defaultCenter={{ lat: 34.731, lng: -94.3749 }}
        onClick={event => props.onMapClick(event, markerToRemap, setMarkerToRemap, showingInfoWindow, setShowingInfoWindow, setMapRows, activeMarker, setActiveMarker)}
    >
        <MarkerClusterer
        onClick={(event)=>props.onMarkerClustererClick(event, setMultipleMarkersOneLocation, googleMap)}
        averageCenter
        enableRetinaIcons
        
        gridSize={40}
        styles={[{ textColor: 'black', height: 53, url: "/static/ClusterIcons/m1.png", width: 53 }, { textColor: 'black', height: 56, url: "/static/ClusterIcons/m2.png", width: 56 }, { textColor: 'white', height: 66, url: "/static/ClusterIcons/m3.png", width: 66 }, { textColor: 'white', height: 78, url: "/static/ClusterIcons/m4.png", width: 78 }, { textColor: 'white', height: 90, url: "/static/ClusterIcons/m5.png", width: 90 }]}
        >
        {taskMarkers && visibleItems.indexOf("tasks") != -1 && taskMarkers.map(marker => (
            <Marker
            key={marker.t_id}
            title={(marker.t_id).toString()} 
            position={{ lat: marker.lat, lng: marker.lng}}
            onClick = { props.updateActiveMarker(marker.t_id) }
            />
        ))}
        </MarkerClusterer>
        <MarkerClusterer
        
        averageCenter
        enableRetinaIcons={false}
        maxZoom={14}
        gridSize={30}
        styles={[{ textColor: 'black', height: 40, url: "/static/VehicleCluster/m3.png", width: 40 }, { textColor: 'black', height: 40, url: "/static/VehicleCluster/m4.png", width: 40 }, { textColor: 'white', height: 40, url: "/static/VehicleCluster/m3.png", width: 40 }, { textColor: 'white', height: 40, url: "/static/VehicleCluster/m4.png", width: 40 }, { textColor: 'white', height: 40, url: "/static/VehicleCluster/m5.png", width: 40 }]}
        >
        {vehicleMarkers && visibleItems.indexOf("vehicles") != -1 && vehicleMarkers.map((vehicle,i) => (
            <MarkerWithLabel
            position={{ lat: vehicle.latitude, lng: vehicle.longitude}}
            onClick = { props.updateActiveVehicle(vehicle.vin) }
            className={'marker'+i}
            id={vehicle.vin}
            key={vehicle.vin}
            title={vehicle.name} 
            name={vehicle.name}
            icon={{
                url: props.handleFindVehicleIcon(vehicle),
                scaledSize: new google.maps.Size(30 ,30)
            }}
            labelAnchor={new google.maps.Point( vehicle.name.length / 2 * 7 , 0)}
            labelStyle={{backgroundColor: "rgba(177, 177, 177, 0.3)", fontSize: "10px", padding: "2px"}}
            ><div>{vehicle.name}</div></MarkerWithLabel>
        ))}
        </MarkerClusterer>
        {showingInfoWindow && activeMarker ? <MapMarkerInfoWindow {...props} onContentChanged={props.infoWindowContentChanged} 
                            activeMarker={activeMarker} setActiveMarker={setActiveMarker} 
                            setInfoWeather={setInfoWeather} infoWeather={infoWeather}
                            multipleMarkersOneLocation={multipleMarkersOneLocation} setMultipleMarkersOneLocation={setMultipleMarkersOneLocation}
                            showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow} markerToRemap={markerToRemap} setMarkerToRemap={setMarkerToRemap}/> : <></>}
        {showingInfoWindow && activeVehicle && vehicleMarkers ? <MapVehicleInfoWindow activeVehicle={activeVehicle} setActiveVehicle={setActiveVehicle} 
                    showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow} bouncieAuthNeeded={bouncieAuthNeeded} setBouncieAuthNeeded={setBouncieAuthNeeded}/>: <></>}
    </GoogleMap></>
  )}
);

export default CustomMap;

const useStyles = makeStyles(theme => ({
    root: {
      
    },
    map:{
    },
    infoWindow: {
      backgroundColor: '#000'
    },
    mainContainer:{
    }
  }));