
import {makeStyles} from '@material-ui/core';
import { useState, useEffect, useCallback } from 'react';

const fetch = require("isomorphic-fetch");
const { compose, withProps, withHandlers } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  OverlayView
} = require("react-google-maps");
const { MarkerClusterer } = require("react-google-maps/lib/components/addons/MarkerClusterer");
const { MarkerWithLabel } = require("react-google-maps/lib/components/addons/MarkerWithLabel");

import cogoToast from 'cogo-toast';
import MapMarkerInfoWindow from './MapMarkerInfoWindow';
import MapVehicleInfoWindow from './MapVehicleInfoWindow';
import MapCrewInfoWindow from './MapCrewInfoWindow';

import Tasks from '../../../js/Tasks';
import Util from '../../../js/Util';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import _ from 'lodash';
import moment from 'moment';
import { MapContext } from './MapContainer';
import { TaskContext } from '../TaskContainer';


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
    onMarkerClustererClick: () => (markerClusterer,setMultipleMarkersOneLocation, googleMap, visibleItems) => {
      const clickedMarkers = markerClusterer.getMarkers()
      const zoom = googleMap.current.getZoom();
      var marker_ids ;
      if(visibleItems?.indexOf("tasks") > 0) {
        marker_ids = clickedMarkers.map((marker,i)=> JSON.parse(marker.getTitle())?.t_id);
      }
      if(visibleItems?.indexOf("crewJobs") > 0) {
        marker_ids = clickedMarkers.map((marker,i)=> JSON.parse(marker.getTitle())?.id);
      }

      //open menu for selecting correct marker
      if(zoom == 22){

        if(marker_ids){
            setMultipleMarkersOneLocation(marker_ids);
        }else{
            console.error("Failed to setMultiple", marker_ids)
        }
        
        //useEffect below sets marker_ids[0] to activeMarker
      }
    },
    onMapClick: ()=> (event, markerToRemap, setMarkerToRemap, showingInfoWindow, setShowingInfoWindow, setMapRows, setMapRowsRefetch, 
        activeMarker, setActiveMarker, setCrewMarkers, setCrewMarkersRefetch, setTaskMarkers )=> {
      if(showingInfoWindow && event.placeId){
        setShowingInfoWindow(false);
      }
      if(markerToRemap){
        let coords  = {lat: event.latLng.lat(),lng: event.latLng.lng()};
        const save = () =>{
            Tasks.saveCoordinates(markerToRemap.item?.address_id, coords)
            .then((data)=>{
              cogoToast.success("Remapped Marker")
              setMarkerToRemap(null);
              //setMapRows(null);
              setMapRowsRefetch(true);
              //Refresh activeMarker with new coords
              if(activeMarker?.item){
                let refreshedMarker = {...activeMarker.item};
                refreshedMarker['lat'] = coords.lat;
                refreshedMarker['lng'] = coords.lng;
                setActiveMarker({type: activeMarker.type, item: refreshedMarker});
              }
              if(activeMarker?.type == "task"){
                  console.log("resetting task markers");
                  setTaskMarkers(null);
              }
              if(activeMarker?.type == "crew"){
                  //setCrewMarkers(null);
                  setCrewMarkersRefetch(true);
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
    getPixelPositionOffset: () => (offsetWidth, offsetHeight, labelAnchor) => {
        return {
            x: offsetWidth + labelAnchor.x,
            y: offsetHeight + labelAnchor.y,
        };
    },
    
  }),
  withScriptjs,
  withGoogleMap
)(props =>{

    const googleMap = React.useRef(null);
    const {taskMarkers, setTaskMarkers, vehicleMarkers, crewMarkers, setCrewMarkers, setCrewMarkersRefetch,
        visibleItems, activeMarker, setActiveMarker,     } = props;

    const {setInfoWeather, infoWeather,   showingInfoWindow, setShowingInfoWindow, bouncieAuthNeeded, setBouncieAuthNeeded,  setMapRows, 
        mapRows,  setMapRowsRefetch,  visualTimestamp, setVisualTimestamp,  radarControl,setRadarControl,  radarOpacity, setRadarOpacity,
     radarSpeed, setRadarSpeed,   timestamps, setTimestamps,  multipleMarkersOneLocation, setMultipleMarkersOneLocation,
     getBorderColorBasedOnDate, changeStateSoMapUpdates, setChangeStateSoMapUpdates,  resetBounds, setResetBounds} = React.useContext(MapContext);

    const {job_types} = React.useContext(TaskContext);

    const [markerToRemap, setMarkerToRemap] = React.useState(null);
    const [markerLabels, setMarkerLabels] = React.useState(null);
    const [savedClusterer, setSavedClusterer] = React.useState(null)
    const clustererLengthRef= React.useRef(null);
    //Radar state maybe can stay here
    
    const [animationTimer, setAnimationTimer] =React.useState(false);

    useEffect( () =>{ //useEffect for inputText
        if( resetBounds && googleMap && crewMarkers){
            setResetBounds(false);
            googleMap.current.fitBounds(getBounds(google.maps, [...crewMarkers]));
        }
        return () => { //clean up
            if(resetBounds){
                
            }
        }
    },[ googleMap, crewMarkers ]);

    useEffect(()=>{
        var a = googleMap.current.getDiv();

        if(a == null){
            return
        }

        if(markerToRemap != null){     
            a.style.border = '8px solid #ffa500';
        }else{
            a.style.border = '';
        }
    }, [markerToRemap])

    useEffect(()=>{
        if(multipleMarkersOneLocation && multipleMarkersOneLocation.length){
            let newActiveMarker;
            let type = visibleItems?.indexOf("tasks") > 0 ? 'task' : 'crew' 
            if(type == 'crew'){
                newActiveMarker = crewMarkers.find((marker,i)=> marker.id == multipleMarkersOneLocation[0]);
            }
            if(type == 'task'){
                newActiveMarker = taskMarkers.find((marker,i)=> {
                    console.log("marker", marker);
                    console.log("multipleMarkersOneLocation", multipleMarkersOneLocation)
                    return marker.t_id == multipleMarkersOneLocation[0]
                }
                );
            }

            console.log("newActiveMarker", newActiveMarker)
            
            setActiveMarker({ type: type, item: newActiveMarker});
            setShowingInfoWindow(true);
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
            case "current":
            if (animationTimer) {
                clearTimeout(animationTimer);
                setAnimationTimer(false);
            }
            if(timestamps.length > 0){
                googleMap.current.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.overlayMapTypes.clear();
                radarLayers=[];
            }
            animationPosition = 0;
            showFrame(timestamps.length-1); 
            
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
        
        setVisualTimestamp((new Date(nextTimestamp * 1000)).toString());
    }
    const showFrame = (nextPosition) => {
        var preloadingDirection = (animationPosition + nextPosition) - animationPosition > 0 ? 1 : -1;
        changeRadarPosition(animationPosition + nextPosition);
        // preload next next frame (typically, +1 frame)
        // if don't do that, the animation will be blinking at the first loop
        changeRadarPosition((animationPosition + nextPosition) + preloadingDirection, true);
    }
    ///END OF RADAR //////////////////////////////////////////////////////////////////////////////////////////////////////

    ///
    // end of radar //
  
    const getBounds = (map, markers)=> {
        const points = markers.filter((v, i)=> v.geocoded).map((item, index)=> ({ lat: item.lat, lng: item.lng}));
        var tempBounds = new map.LatLngBounds();
        for (var i = 0; i < points.length; i++) {    tempBounds.extend(points[i]);    }
        
        return tempBounds;
    };

    const handleClusterEnd = (clusterer) =>{
        //Checking our saved ref vs current clusterer (only way to tell if clusters have changed so it will update the overlay labels)
        //checking each cluster length of ref vs current cluster
        if(savedClusterer && clustererLengthRef != null && !_.isEqual(clustererLengthRef.current, clusterer?.clusters_.map((cluster)=> cluster.length))){ 
            clusterer["key"] = Math.random(); 
            setChangeStateSoMapUpdates(Math.random());
        }
        
        if(savedClusterer){
            clustererLengthRef.current =  savedClusterer.clusters_.map((cluster)=> cluster.length)
        }
        setSavedClusterer(clusterer); return;
    }


    const getInitialsFromName = (name)=> {
        var names = name.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }

    

    useEffect(()=>{
        if(!savedClusterer){
            console.log(" Bad Random", savedClusterer);
            return;
        }

        const markerLabelsList = [];
        let allClusters = savedClusterer.clusters_,
            allMarkers;
            allClusters.forEach( (cluster, clusterIndex) => {
            allMarkers = cluster.getMarkers();
            
            allMarkers.forEach( (marker, MarkerIndex) => {
                
                let row = JSON.parse(marker.title);
                let labelAnchor = { x: -56, y: -56 };
                if (allMarkers.length <= 1) {
                    let initials = row?.leader_name ? getInitialsFromName(row.leader_name) : 'C' + row?.crew_id ;
                    let crewColor = row?.crew_color ? row.crew_color : '#555';
                    let borderColor = getBorderColorBasedOnDate(row?.job_date );
                    let jobTypeColor = job_types.find((type)=> type.type === row.job_type )?.color || '#fff';
                    let jobTypeShorthand = job_types.find((type)=> type.type === row.job_type )?.shorthand || '';
                   markerLabelsList.push(
                         <OverlayView
                             key={MarkerIndex + Math.random()}
                             position={marker.position}
                             mapPaneName= {OverlayView.OVERLAY_MOUSE_TARGET}
                             getPixelPositionOffset={(x, y) => props.getPixelPositionOffset(x, y, labelAnchor)}
                             >
                                 <div 
                                   onClick = { props.updateActiveMarker(row.id, "crew") }
                                   style={{
                                    boxShadow: 'rgb(0 0 0 / 48%) 0px 0px 2px 2px',
                                    background: `#fff`,
                                    padding: `6px`,
                                    fontSize: '11px',
                                    minHeight: '10px',
                                    minWidth: '10px',
                                    color: `white`,
                                    borderRadius: '50%',
                                    border: `3px ${borderColor} solid`,
                                    position: 'relative',
                                    cursor: 'pointer',
                                   }}>
                                    <span
                                    onClick = { props.updateActiveMarker(row.id, "crew") }
                                    style={{
                                    background: `#fff`,
                                    borderRadius: '50%',
                                    padding: '2px',
                                    color: `${jobTypeColor}`,
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    fontFamily: 'sans-serif',
                                    minWidth: '10px',
                                   }}>{jobTypeShorthand}</span>
                                    {row.num_services && row.num_services > 0 ? <div style={{
                                        background: `#fff`,
                                        color: '#222',
                                        position: 'absolute',
                                        padding: '1px',
                                        minWidth: '15px',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        fontFamily: 'sans-serif',
                                        minHeight: '15px',
                                        textAlign: 'center',
                                        bottom: -8,
                                        right: -5,
                                        borderRadius: '50%',
                                        border: `2px #222 solid`,
                                    }}>{row.num_services}</div> : ''}
                                    {row.crew_id && initials ? <div style={{
                                        background: `${crewColor}`,
                                        color: '#fff',
                                        position: 'absolute',
                                        padding: '1px',
                                        minWidth: '15px',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        fontFamily: 'sans-serif',
                                        minHeight: '15px',
                                        textAlign: 'center',
                                        bottom: -8,
                                        left: -5,
                                        borderRadius: '50%',
                                        border: `2px #222 solid`,
                                    }}>{initials}</div> : ''}
                                    
                                 </div>
                          </OverlayView>)
                }
             });
            });
            setMarkerLabels(markerLabelsList)
    },[savedClusterer, savedClusterer?.key, crewMarkers])


  return(
    <>
    <GoogleMap
        defaultZoom={7} 
        ref={googleMap}
        defaultCenter={{ lat: 34.731, lng: -94.3749 }}
        onClick={event => props.onMapClick(event, markerToRemap, setMarkerToRemap, showingInfoWindow, setShowingInfoWindow, setMapRows, setMapRowsRefetch,
            activeMarker, setActiveMarker, setCrewMarkers,setCrewMarkersRefetch, setTaskMarkers)}
    >
       <MarkerClusterer
       
        onClick={(event)=>props.onMarkerClustererClick(event, setMultipleMarkersOneLocation, googleMap, visibleItems)}
        averageCenter
        ignoreHidden={true}
        enableRetinaIcons
        gridSize={40}
        styles={[{ textColor: 'black', height: 53, url: "/static/ClusterIcons/m1.png", width: 53 }, { textColor: 'black', height: 56, url: "/static/ClusterIcons/m2.png", width: 56 }, { textColor: 'white', height: 66, url: "/static/ClusterIcons/m3.png", width: 66 }, { textColor: 'white', height: 78, url: "/static/ClusterIcons/m4.png", width: 78 }, { textColor: 'white', height: 90, url: "/static/ClusterIcons/m5.png", width: 90 }]}
        >
        {taskMarkers && visibleItems.indexOf("tasks") != -1 && taskMarkers.map((marker,index) => {
            return (
            <MarkerWithLabel
            key={marker.t_id}
            title={JSON.stringify(marker)} 
            id={marker.t_id}
            position={{ lat:  parseFloat(marker.lat), lng: parseFloat(marker.lng)}}
            onClick = { props.updateActiveMarker(marker.t_id, "task") }
             labelAnchor={new google.maps.Point( `#${index}`.toString().length * 5 , 40)}
             labelStyle={{backgroundColor: "rgba(202, 69, 58, 0.8)", fontSize: "13px", padding: "2px", borderRadius: '5px', color: '#fff',}}
            ><div>#{index+1}</div> 
            </MarkerWithLabel>
           
            )})}
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
            position={{ lat: parseFloat(vehicle.latitude), lng: parseFloat(vehicle.longitude)}}
            onClick = { props.updateActiveMarker(vehicle.vin, "vehicle") }
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

         {changeStateSoMapUpdates && <MarkerClusterer
        onClusteringEnd={handleClusterEnd}
        onClick={(event)=>props.onMarkerClustererClick(event, setMultipleMarkersOneLocation, googleMap, visibleItems)}
        averageCenter
        ignoreHidden={true}
        enableRetinaIcons
        gridSize={1}
        styles={[{ textColor: 'black', height: 53, url: "/static/ClusterIcons/m1.png", width: 53 }, { textColor: 'black', height: 56, url: "/static/ClusterIcons/m2.png", width: 56 }, { textColor: 'white', height: 66, url: "/static/ClusterIcons/m3.png", width: 66 }, { textColor: 'white', height: 78, url: "/static/ClusterIcons/m4.png", width: 78 }, { textColor: 'white', height: 90, url: "/static/ClusterIcons/m5.png", width: 90 }]}
        >
            {crewMarkers && visibleItems.indexOf("crewJobs") != -1 && crewMarkers.map((crew,i) => { 
                return(
                <Marker
                zIndex={-1}
                    opacity={0}
                    clickable={false}
                    cursor={"drag"}
                    position={{ lat: parseFloat(crew.lat), lng: parseFloat(crew.lng)}}
                    className={'marker'+i}
                    id={crew.id}
                    key={crew.id}
                    title={JSON.stringify(crew)}
                />
            ) })}
        </MarkerClusterer> }
        {changeStateSoMapUpdates && markerLabels} 

        {showingInfoWindow && activeMarker?.type ==="task" ? <MapMarkerInfoWindow {...props} onContentChanged={props.infoWindowContentChanged} 
                            activeMarker={activeMarker} setActiveMarker={setActiveMarker} 
                            setInfoWeather={setInfoWeather} infoWeather={infoWeather}
                            multipleMarkersOneLocation={multipleMarkersOneLocation} setMultipleMarkersOneLocation={setMultipleMarkersOneLocation}
                            showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow} markerToRemap={markerToRemap} setMarkerToRemap={setMarkerToRemap}/> : <></>}
        {showingInfoWindow && activeMarker?.type ==="crew" ? <MapCrewInfoWindow {...props} onContentChanged={props.infoWindowContentChanged} 
                            activeMarker={activeMarker} setActiveMarker={setActiveMarker} multipleMarkersOneLocation={multipleMarkersOneLocation} 
                            setInfoWeather={setInfoWeather} infoWeather={infoWeather} setMultipleMarkersOneLocation={setMultipleMarkersOneLocation} setCrewMarkersRefetch={setCrewMarkersRefetch}
                            showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow} markerToRemap={markerToRemap} setMarkerToRemap={setMarkerToRemap}/> : <></>}
        {showingInfoWindow && activeMarker?.type === "vehicle" && vehicleMarkers ? <MapVehicleInfoWindow activeMarker={activeMarker} setActiveMarker={setActiveMarker}
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