
//import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

import {makeStyles, Paper, Grid, Button} from '@material-ui/core';
import ActiveVehicleIcon from '@material-ui/icons/PlayArrow';
import StoppedVehicleIcon from '@material-ui/icons/Stop';
import MapSidebar from './MapSidebar/MapSidebar';
import { useState, useEffect, useMemo, useCallback, useContext } from 'react';

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
import TaskLists from '../../../js/TaskLists';
import Util from '../../../js/Util';
import Vehicles from '../../../js/Vehicles';
import TaskListFilter from '../TaskList/TaskListFilter';
import { TaskContext } from '../TaskContainer';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import {createFilter} from '../../../js/Filter';

const useStyles = makeStyles(theme => ({
    root: {
      // width: '69% !important',
      // height: '90% !important',
      // position: 'absolute',
      // '&& .gm-style-iw-a':{
      //   marginTop: '-45px',
      // }
    },
    map:{
    },
    infoWindow: {
      backgroundColor: '#000'
    },
    mainContainer:{
    }
  }));

const MapContainer = (props) => {
    const classes = useStyles();

    //const {} = props;

    const { modalOpen, setModalOpen, setModalTaskId, taskLists, setTaskLists, taskListToMap, setTaskListToMap,
          filters, setFilter, filterInOrOut, filterAndOr, setTaskListTasksSaved} = useContext(TaskContext);
    const [showingInfoWindow, setShowingInfoWindow] = useState(false);
    const [activeMarker, setActiveMarker] = useState(null);
    const [activeVehicle, setActiveVehicle] = useState(null);
    const [bounds, setBounds] = useState(null);
    
    const [mapRows, setMapRows] = useState(null); 
    const [resetBounds, setResetBounds] = React.useState(true);
    const [markedRows, setMarkedRows] = useState([]);
    const [noMarkerRows, setNoMarkerRows] = useState(null);
    
    const [infoWeather, setInfoWeather] = useState(null);

    const [vehicleRows, setVehicleRows] = useState(null);
    const [vehicleNeedsRefresh, setVehicleNeedsRefresh] = useState(true);
    const [bouncieAuthNeeded,setBouncieAuthNeeded] = useState(false);
    const [visibleItems, setVisibleItems] = React.useState(() => ['tasks', 'vehicles']);

    const [mapHeight,setMapHeight] = useState('400px');

    const [radarActive, setRadarActive] = useState(false);
    const [radarControl, setRadarControl] = useState(null);
    const [visualTimestamp, setVisualTimestamp] = useState(null);


    useEffect(()=>{
      if(vehicleNeedsRefresh == true){
        var locations = [];
        //Get all vehicle locations and combine into vehicleRows
        Promise.all([Vehicles.getLinxupLocations(), Vehicles.getBouncieLocations()])
        .then((values)=>{
          console.log("valuies",values);
          let linuxp_loc_array = values[0]["data"]["locations"];
          let tmpData = linuxp_loc_array.map((item,i )=> (
                                                { latitude: item.latitude, 
                                                  longitude: item.longitude, 
                                                  make: item.make, 
                                                  model: item.model, 
                                                  name: item.firstName+' '+item.lastName,
                                                  vin: item.vin,
                                                  service: 'linxup',
                                                  active: item.speed > 0 ? true : false,
                                                  direction:  item.direction }))
          locations.splice(locations.length, 0, ...tmpData);
          let tmpData2 =[];
          if(values[1]["error"] || !Array.isArray(values[1])){
            console.error("Custom Error from bouncie", values[1]);
            setBouncieAuthNeeded(true);
          }else{
            tmpData2 =  values[1].map((item,i )=> ({latitude: item['stats']['location'].lat, 
                      longitude: item['stats']['location'].lon, 
                      make: item['model'].make, 
                      model: item['model'].name, 
                      name: item.nickName,
                      vin: item.vin,
                      service: 'bouncie',
                      active: item['stats'].isRunning,
                      direction: item['stats']['location'].heading }))
          }
           
          locations.splice(locations.length, 0, ...tmpData2);
          setVehicleRows(locations);
          setVehicleNeedsRefresh(false);
          console.log(locations);

          //Move our info window by resetting activeVehicle with update info
          if(activeVehicle){
            var refreshedActive = locations.filter((v, i)=> v.vin == activeVehicle.vin)[0];
            setActiveVehicle(refreshedActive);
          }
        })
        .catch((error)=>{
          console.error("Vehicle error", error);
        })
      }
    },[vehicleNeedsRefresh]);

    
    //Refetches vehicle Rows every 30 seconds
    useEffect(()=>{
      const timeoutId = setTimeout(()=>{
        setVehicleNeedsRefresh(true);

      }, 30000)
      return () => clearTimeout(timeoutId);
    }, [vehicleRows])


    useEffect( () =>{ //useEffect for inputText
      if(mapRows == null && filterInOrOut != null && filterAndOr != null){
          if(taskLists && taskListToMap && taskListToMap.id ) { 
            TaskLists.getTaskList(taskListToMap.id)
            .then( (data) => {
                if(!Array.isArray(data)){
                    console.error("Bad tasklist data",data);
                    return;
                }
                var tmpData = [];

                if(filters && filters.length > 0){
                  //If more than one property is set, we need to filter seperately
                  let properties = new Set([...filters].map((v,i)=>v.property));
                  
                  properties.forEach((index,property)=>{
                    
                    let tmpFilter = filters.filter((v,i)=> v.property == property);
                    let tmpTmpData;

                    //On or use taskListTasksSaved to filter from to add to 
                    if((filterAndOr == "or" && filterInOrOut == "in") || (filterAndOr == "and" && filterInOrOut == "out") ){
                        if(tmpFilter.length > 1){
                            //Always use 'or' on same property
                            tmpTmpData = data.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                        }
                        if(tmpFilter.length <= 1){
                            tmpTmpData = data.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                            //console.log("MapContainer tmpData in loop", tmpData);
                        }
                        //Add to our big array
                        tmpData.splice(tmpData.length, 0, ...tmpTmpData);
                        //Remove duplicates
                        tmpData.splice(0, tmpData.length, ...(new Set(tmpData)));
                    }

                    //On and use tmpData to filter from
                    if((filterAndOr == "and" && filterInOrOut == "in") || (filterAndOr == "or" && filterInOrOut == "out")){
                        if(tmpData.length <= 0){
                          tmpData = [...data];
                        }  
                        if(tmpFilter.length > 1){
                            //Always use 'or' on same property
                            tmpData = tmpData.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                        }
                        if(tmpFilter.length <= 1){
                            tmpData = tmpData.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                            console.log("MapContainer tmpData in loop", tmpData);
                        }
                    }
                    
                    console.log("TaskListFilter each loop, ",tmpData);
                  })              
                }else{
                  console.log("else on filters && filters.length > 0")
                }
                
                setTaskListTasksSaved(data);
                
                //No filters 
                if(filters && !filters.length){
                  //no change to tmpData
                  tmpData = [...data];
                }
                //Set TaskListTasks
                if(Array.isArray(tmpData)){
                    setMapRows(tmpData);
                }

                
                
            })
            .catch( error => {
                cogoToast.error(`Error getting Task List`, {hideAfter: 4});
                console.error("Error getting tasklist", error);
            })
        }else{
          console.log("else on taskLists && taskListToMap && taskListToMap.id ");
        }
      }else{
        console.log("else on mapRows == null && filterInOrOut != null && filterAndOr != null")
      }
      if(mapRows){
        //filter geocoded, then sort by priority_order
        var tmp = mapRows.filter((row, index) => row.geocoded).sort((a,b)=>{
          if(a.priority_order > b.priority_order) return 1;
          if(b.priority_order > a.priority_order) return -1;
          return 0; 
        });
        setMarkedRows(tmp);
      }

      
      return () => { //clean up
      }
    },[mapRows,filterInOrOut, filterAndOr,taskLists, taskListToMap]);

    useEffect(()=>{
        if(noMarkerRows == null && mapRows){
           setNoMarkerRows(mapRows.filter((row, index) => !row.geocoded));
        }
        //Find and set geolocation of unset rows
        if(noMarkerRows && noMarkerRows.length > 0 && mapRows){
          console.log("noMarkerRows in if");
          var tmpMapRows = [...mapRows];
          noMarkerRows.forEach((row, i)=> {
            if(!row.address){
              return;
              
            }
              
            Tasks.getCoordinates(row.address, row.city, row.state, row.zip)
            .then((data)=>{
              if(!data){
                throw new Error("Bad return from getCoordinates from GoogleAPI");
              }
              //Update MapRows with lat, lng, geocoded instead of refreshing
              var mapRowIndex = mapRows.indexOf(row)
              var tmpRow = {...row};
              
              tmpRow["lat"] = data.lat;
              tmpRow["lng"] = data.lng;
              tmpRow["geocoded"] = 1;
              tmpMapRows[mapRowIndex] = tmpRow;
              setMapRows(tmpMapRows);
              setNoMarkerRows(tmpMapRows.filter((row, index) => !row.geocoded));
              //Save lat, lng, geocoded to db
              Tasks.saveCoordinates(row.address_id, data)
              .then((ok)=>{
                if(!ok){
                  console.warn("Did not save coordinates.");
                }
                if(i == noMarkerRows.length){
                  cogoToast.info('Unmapped Markers have been added to map', {hideAfter: 4});
                }

                
              })
              .catch((error)=> {
                console.error(error);
                cogoToast.error(`Error Saving Coordinates`, {hideAfter: 4});
                setNoMarkerRows([]);
              })
            })
            .catch((error)=> {
              console.error(error);
              cogoToast.error(`Error getting coordinates`, {hideAfter: 4});
              setNoMarkerRows([]);
            })
          })
          
        }
    }, [noMarkerRows, mapRows])

    const mapRef = React.useRef(null)
    useEffect(()=>{
      if(mapRef && document){
        console.log("mapref",mapRef);
        //console.log("style", mapRef.current.style.height)
      }else{
        console.log("No document")
      }
    },[mapHeight, mapRef])

    useEffect(()=>{
      
    },[vehicleRows])

    

    const updateActiveMarker = id => (props, marker, e) => {
        var task = mapRows.filter((row, i) => row.t_id === id)[0];
        setActiveMarker(task);
        setShowingInfoWindow(true);
        setActiveVehicle(null);
    }

    const updateActiveVehicle = id => (props, marker, e) => {
      var vehicle = vehicleRows.filter((row, i) => row.vin === id)[0];
      setActiveVehicle(vehicle);
      setShowingInfoWindow(true);
      setActiveMarker(null)
  }

    


    const onMapClick = (props) => {
      if (showingInfoWindow) {
          setInfoWeather(null);
          setShowingInfoWindow(false);
          setResetBounds(true);
      }
    }

    const handleMarkerURL = (id) => {
      if(activeMarker && activeMarker.t_id===id){
          return `static/highlight_marker.png`;
      }
      return `static/default_marker.png`;
    }



    //Modal
    const handleRightClick = (event, id) => {
      setModalTaskId(id);
      setModalOpen(true);

      //Disable Default context menu
      event.preventDefault();
    };
    ////
    const handleFindVehicleIcon = (vehicle)=>{
      if(!vehicle){
        console.error("Bad vehilce for handleFindVehcileIcon");
        return
      }
      let selected = false;
      if(activeVehicle && vehicle.vin === activeVehicle.vin){
        selected = true;
      }
      let url = "";
      let direction = Util.getDirectionFromDegree(vehicle.direction);
      switch (vehicle.service){
        case 'bouncie':
          // if(selected){
          //   url = vehicle.active ? 'static/vehicle_icons/bouncie_active_selected.png' : 'static/vehicle_icons/bouncie_stop_selected.png';
          // }else{
          //   url = vehicle.active ? 'static/vehicle_icons/bouncie_active_nonselected.png' : 'static/vehicle_icons/bouncie_stop_nonselected.png';
          // }
          url = vehicle.active ?  `static/vehicle_icons/bouncie_active_${direction.toLowerCase()}.png` 
                :   `static/vehicle_icons/bouncie_stop.png`;
          
          break;
        case 'linxup':
          url = vehicle.active ?  `static/vehicle_icons/linxup_active_${direction.toLowerCase()}.png` 
                :   `static/vehicle_icons/linxup_stop.png`;
          break;
      }
      return url;
    }

    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={12}>
          <TaskListFilter setFilteredItems={setMapRows}/>
          </Grid>
        </Grid>
          <Grid container spacing={3} className={classes.mainContainer}>
            
            <Grid item xs={12} md={8}>
                <MapWithAMarkerClusterer taskMarkers={markedRows} vehicleMarkers={vehicleRows} visibleItems={visibleItems} 
                      updateActiveMarker={updateActiveMarker} updateActiveVehicle={updateActiveVehicle} handleFindVehicleIcon={handleFindVehicleIcon}
                      resetBounds={resetBounds}
                      activeMarker={activeMarker} setActiveMarker={setActiveMarker} 
                      activeVehicle={activeVehicle} setActiveVehicle={setActiveVehicle}
                      setInfoWeather={setInfoWeather} infoWeather={infoWeather}
                      showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow}
                      bouncieAuthNeeded={bouncieAuthNeeded} setBouncieAuthNeeded={setBouncieAuthNeeded}
                      setMapRows={setMapRows} mapRows={mapRows}
                      visualTimestamp={visualTimestamp} setVisualTimestamp={setVisualTimestamp}
                      radarControl={radarControl} setRadarControl={setRadarControl}/>
            </Grid>
            <Grid item xs={12} md={4}>
              <MapSidebar mapRows={mapRows} setMapRows={setMapRows} noMarkerRows={noMarkerRows} 
                          markedRows={markedRows} setMarkedRows={setMarkedRows}
                          vehicleRows={vehicleRows} setVehicleRows={setVehicleRows}
                          activeVehicle={activeVehicle} setActiveVehicle={setActiveVehicle}
                          activeMarker={activeMarker} setActiveMarker={setActiveMarker}
                          setShowingInfoWindow={setShowingInfoWindow}
                          setModalOpen={setModalOpen} setModalTaskId={setModalTaskId}
                          setResetBounds={setResetBounds}
                          infoWeather={infoWeather} setInfoWeather={setInfoWeather}
                          bouncieAuthNeeded={bouncieAuthNeeded} setBouncieAuthNeeded={setBouncieAuthNeeded}
                          visibleItems={visibleItems} setVisibleItems={setVisibleItems}
                          visualTimestamp={visualTimestamp} setVisualTimestamp={setVisualTimestamp}
                          radarControl={radarControl} setRadarControl={setRadarControl}
                          />
            </Grid>
          </Grid>
        </div>
    );
    }
  
  //Get Bounds 
    //useCallback saves dep on mapRows, improves performance
    const getBounds = (map, markers)=> {
      
      const points = markers.filter((v, i)=> v.geocoded).map((item, index)=> ({ lat: item.lat, lng: item.lng}));
      var tempBounds = new map.LatLngBounds();
      for (var i = 0; i < points.length; i++) {    tempBounds.extend(points[i]);    }
      
      return tempBounds
    };
  

const MapWithAMarkerClusterer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBd9JvLz52kD4ouQvqlHePUAqlBWzACJ-c&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: '100%',minHeight: `450px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withHandlers({
    onMarkerClustererClick: () => (markerClusterer) => {
      const clickedMarkers = markerClusterer.getMarkers()
      console.log(`Current clicked markers length: ${clickedMarkers.length}`);
      console.log("clickedMarkers",clickedMarkers);
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
          customUI: ({onClose}) => {
              
              return(
                  <ConfirmYesNo onYes={save} onClose={onClose} customMessage="Change coordinates?"/>
              );
          },
          afterClose: ()=>{
            setMarkerToRemap(null);
            cogoToast.info("Cancelled Remap");
          }
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
      mapRows, vehicleRows,radarActive,radarControl, setRadarControl, visualTimestamp, setVisualTimestamp} = props;

  const [markerToRemap, setMarkerToRemap] = React.useState(null);

  const [timestamps,setTimestamps] =React.useState([]);
  var radarLayers = [];
  var animationPosition = 0;
  var animationTimer = false;

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
  
   //Control the radar from props (controls in MapSidebar)
   useEffect(()=>{
    console.log("asd");
    if(radarControl && googleMap){
      console.log("Running radarcontrol");
      switch(radarControl.control){
        case "play":
          play();
          break;
        case "stop":
          stop();
          break;
        case "reverse":
          stop();
          showFrame(animationPosition - 1);
          break;
        case "forward":
          stop(); 
          showFrame(animationPosition + 1); 
          break;
      }
    }
  },[radarControl, googleMap])

  useEffect(()=>{
    if(visibleItems && visibleItems.indexOf("radar") != -1){
      onRadarInit();
    console.log("Ran radar init")
    }else{
      if(timestamps.length > 0){
        googleMap.current.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.overlayMapTypes.clear();
        radarLayers=[];
      }
      
      
    }
    
  },[visibleItems])

  useEffect(()=>{
    if(visibleItems && visibleItems.indexOf("radar") != -1 && timestamps.length > 0 && googleMap && setVisualTimestamp){
      //googleMap.current.overlayMapTypes = new MVCArray
      console.log("googelmap overlay", googleMap.current.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
      //showFrame(-1);
    }
  },[visibleItems, timestamps, googleMap, setVisualTimestamp])

  const onRadarInit = ( )=> {
    Util.getWeatherRadar("https://api.rainviewer.com/public/maps.json")
    .then((data)=>{
        setTimestamps(data)
        console.log("data",data);
        
    })
    .catch((error)=>{
      console.error("Radar error", error);
      cogoToast.error("Radar Error");
    })
  }

  const addLayer = (ts) =>   {
    return new Promise( (resolve,reject) => {
    if (!radarLayers[ts]) {
       console.log("Boutta run addLayers googlemaps shit");
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
    console.log("ChangeRadarPosition", position)
      while (position >= timestamps.length) {
        console.log("poistion min", position)
          position -= timestamps.length;
      }
      while (position < 0) {
        console.log("poistion add", position)
        console.log("timestamps", timestamps.length);
          position += timestamps.length;
      }
      
      var currentTimestamp = timestamps[animationPosition];
      var nextTimestamp = timestamps[position];
      
      await addLayer(nextTimestamp);
      
      if (preloadOnly) {
          return;
      }

      animationPosition = position;
      console.log("radarLayers", radarLayers);
      if (radarLayers[currentTimestamp]) {
          radarLayers[currentTimestamp].setOpacity(0);
      }
      radarLayers[nextTimestamp].setOpacity(100);
      
      
      //document.getElementById("timestamp").innerHTML = (new Date(nextTimestamp * 1000)).toString();
      setVisualTimestamp((new Date(nextTimestamp * 1000)).toString())
  }
  const showFrame = (nextPosition) => {
      var preloadingDirection = nextPosition - animationPosition > 0 ? 1 : -1;
      console.log("Before 1changeRadarPosition")
      changeRadarPosition(nextPosition);
      console.log("after 1changeRadarPosition")
      // preload next next frame (typically, +1 frame)
      // if don't do that, the animation will be blinking at the first loop
      console.log("Before 2changeRadarPosition")
      changeRadarPosition(nextPosition + preloadingDirection, true);
      console.log("after 2changeRadarPosition")
  }
  const stop = () => {
      console.log("animation timer", animationTimer)
      if (animationTimer) {
          console.log("Clearing timer")
          clearTimeout(animationTimer);
          animationTimer = false;
          return true;
      }
      return false;
  }

  const play = ()=> {
      console.log("playing");
      showFrame(animationPosition + 1);

      // Main animation driver. Run this function every 500 ms
      animationTimer = (setTimeout(play, 500));
  }

  const  stopControl = ()=> {
      stop();
  }
  const  playControl = ()=> {
    play();
}

  return(
    <>
  <GoogleMap
    defaultZoom={6} 
    ref={googleMap}
    defaultCenter={{ lat: 34.731, lng: -94.3749 }}
    onClick={event => props.onMapClick(event, markerToRemap, setMarkerToRemap, showingInfoWindow, setShowingInfoWindow, setMapRows, activeMarker, setActiveMarker)}
  >
    <MarkerClusterer
      onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
      maxZoom={10}
      gridSize={40}
      styles={[{ textColor: 'black', height: 53, url: "/static/ClusterIcons/m1.png", width: 53 }, { textColor: 'black', height: 56, url: "/static/ClusterIcons/m2.png", width: 56 }, { textColor: 'white', height: 66, url: "/static/ClusterIcons/m3.png", width: 66 }, { textColor: 'white', height: 78, url: "/static/ClusterIcons/m4.png", width: 78 }, { textColor: 'white', height: 90, url: "/static/ClusterIcons/m5.png", width: 90 }]}
    >
      {taskMarkers && visibleItems.indexOf("tasks") != -1 && taskMarkers.map(marker => (
        <Marker
          key={marker.t_id} 
          position={{ lat: marker.lat, lng: marker.lng}}
          onClick = { props.updateActiveMarker(marker.t_id) }
        />
      ))}
    </MarkerClusterer>
    <MarkerClusterer
      onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
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
                          showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow} markerToRemap={markerToRemap} setMarkerToRemap={setMarkerToRemap}/> : <></>}
    {showingInfoWindow && activeVehicle && vehicleMarkers ? <MapVehicleInfoWindow activeVehicle={activeVehicle} setActiveVehicle={setActiveVehicle} 
                  showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow} bouncieAuthNeeded={bouncieAuthNeeded} setBouncieAuthNeeded={setBouncieAuthNeeded}/>: <></>}
  </GoogleMap></>
  )}
);

export default MapContainer;
