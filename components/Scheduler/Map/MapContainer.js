
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import MapSidebar from './MapSidebar/MapSidebar';
import TaskModal from '../Table/TaskModal/TaskModal';
import { useState, useEffect } from 'react';


import { useSnackbar } from 'material-ui-snackbar-provider'

import MapMarkerInfoWindow from './MapMarkerInfoWindow';

import Tasks from '../../../js/Tasks';
import Util from '../../../js/Util';



const useStyles = makeStyles(theme => ({
    root: {
      width: '69% !important',
      height: '90% !important',
      position: 'absolute',
      '&& .gm-style-iw-a':{
        marginTop: '-45px',
      }
    },
    map:{

    },
    infoWindow: {
      backgroundColor: '#000'
    }
  }));

const MapContainer = (props) => {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const {mapRows, setMapRows, selectedIds, setSelectedIds, taskLists, setTaskLists, taskListToMap, setTaskListToMap, setSnackBarStatus} = props;
    const [showingInfoWindow, setShowingInfoWindow] = useState(false);
    const [activeMarker, setActiveMarker] = useState(null);
    const [bounds, setBounds] = useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);  
    const [modalTaskId, setModalTaskId] = React.useState();  
    const [resetBounds, setResetBounds] = React.useState(true);
    const [markedRows, setMarkedRows] = useState([]);
    const [infoWeather, setInfoWeather] = useState(null);
    const [reFetchTaskList, setReFetchTaskList] = React.useState(false);

    useEffect( () =>{ //useEffect for inputText
      if(resetBounds)
        getBounds();
        setResetBounds(false);
      return () => { //clean up
          if(resetBounds){
              
          }
      }
    },[resetBounds]);

    useEffect( () =>{ //useEffect for inputText
      if(mapRows)
        setMarkedRows(mapRows.filter((row, index) => row.geocoded)  );

      //Find and set geolocation of unset rows
      if(noMarkerRows){
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
            
            //Save lat, lng, geocoded to db
            Tasks.saveCoordinates(row.t_id, data)
            .then((ok)=>{
              if(!ok){
                console.warn("Did not save coordinates.");
              }
              if(i == noMarkerRows.length){

              }
              snackbar.showMessage(
                'Unmapped Markers have been added to map',
                'OK', () => {console.log("Hey")}
              )
            })
            .catch((error)=> {
              console.error(error);
            })
          })
          .catch((error)=> {
            console.error(error);
          })
        })
        
      }
      return () => { //clean up
      }
    },[mapRows]);
    

    if(mapRows.length > 50){
      setMapRows( mapRows.slice(0, 49));
      
      snackbar.showMessage(
        'Too many tasks have been selected! Showing first 50 tasks...',
        'OK', () => {console.log("Hey")}
      )
    }

    //Get mapRows that do not have lat, lng
    const noMarkerRows = mapRows.filter((row, index) => !row.geocoded);
    


    //Get Bounds 
    const getBounds = () => {
      const points = mapRows.filter((v, i)=> v.geocoded).map((item, index)=> ({ lat: item.lat, lng: item.lng}));
      var tempBounds = new props.google.maps.LatLngBounds();
      for (var i = 0; i < points.length; i++) {    tempBounds.extend(points[i]);    }
      setBounds(tempBounds);
    }

    const updateActiveMarker = id => (props, marker, e) => {
        var task = mapRows.filter((row, i) => row.t_id === id)[0];
        setActiveMarker(task);
        setShowingInfoWindow(true);
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
    
    return (
      <div>
          <Grid container spacing={3}>
            <Grid item xs={9}>
            <TaskModal modalOpen={modalOpen} setModalOpen={setModalOpen} 
                        modalTaskId={modalTaskId} setModalTaskId={setModalTaskId}
                        taskLists={taskLists} setTaskLists={setTaskLists}/>
              <Map
                google={props.google}
                zoom={6}
                className={classes.root}
                onClick = { onMapClick}
                bounds={bounds}
              >
                {markedRows.map((marker) => (
                <Marker key={marker.t_id} 
                        position={{ lat: marker.lat, lng: marker.lng}}
                        onClick = { updateActiveMarker(marker.t_id) }
                        
                        id={marker.t_id}
                        title={marker.t_name} 
                        name={marker.t_name}
                        icon={{
                          url: handleMarkerURL(marker.t_id)
                        }}/>
                ))}
                { <MapMarkerInfoWindow {...props} 
                                    activeMarker={activeMarker} setActiveMarker={setActiveMarker} 
                                    infoWeather={infoWeather} setInfoWeather={setInfoWeather}
                                    showingInfoWindow={showingInfoWindow} setShowingInfoWindow={setShowingInfoWindow}/>}
              </Map>
            </Grid>
            <Grid item xs={3}>
              <MapSidebar mapRows={mapRows} setMapRows={setMapRows}
                          selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                          noMarkerRows={noMarkerRows} 
                          markedRows={markedRows} setMarkedRows={setMarkedRows}
                          activeMarker={activeMarker} setActiveMarker={setActiveMarker}
                          setShowingInfoWindow={setShowingInfoWindow}
                          setModalOpen={setModalOpen} setModalTaskId={setModalTaskId}
                          taskLists={taskLists} setTaskLists={setTaskLists}
                          setResetBounds={setResetBounds}
                          taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
                          setSnackBarStatus={setSnackBarStatus}
                          infoWeather={infoWeather} setInfoWeather={setInfoWeather}
                          reFetchTaskList={reFetchTaskList} setReFetchTaskList={setReFetchTaskList}
                          />
            </Grid>
          </Grid>
        </div>
    );
    }
  

  export default GoogleApiWrapper({
    apiKey: 'AIzaSyBd9JvLz52kD4ouQvqlHePUAqlBWzACJ-c'
  })(MapContainer);

