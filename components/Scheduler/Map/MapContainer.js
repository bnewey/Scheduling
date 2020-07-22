
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

import {makeStyles, Paper, Grid, Button} from '@material-ui/core';

import MapSidebar from './MapSidebar/MapSidebar';
import { useState, useEffect, useMemo, useCallback, useContext } from 'react';

import cogoToast from 'cogo-toast';
import MapMarkerInfoWindow from './MapMarkerInfoWindow';

import Tasks from '../../../js/Tasks';
import TaskLists from '../../../js/TaskLists';
import Util from '../../../js/Util';
import TaskListFilter from '../TaskList/TaskListFilter';
import { TaskContext } from '../TaskContainer';

import {createFilter} from '../../../js/Filter';


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

    const { modalOpen, setModalOpen, setModalTaskId, taskLists, setTaskLists, taskListToMap, setTaskListToMap,
          filters, setFilter, filterInOrOut, setTaskListTasksSaved} = useContext(TaskContext);
    const [showingInfoWindow, setShowingInfoWindow] = useState(false);
    const [activeMarker, setActiveMarker] = useState(null);
    const [bounds, setBounds] = useState(null);
    
    const [mapRows, setMapRows] = useState(null); 
    const [resetBounds, setResetBounds] = React.useState(true);
    const [markedRows, setMarkedRows] = useState([]);
    const [noMarkerRows, setNoMarkerRows] = useState(null);
    const [infoWeather, setInfoWeather] = useState(null);

    useEffect( () =>{ //useEffect for inputText
      if(mapRows != null)
        getBounds();
        //setResetBounds(false);
      return () => { //clean up
          if(resetBounds){
              
          }
      }
    },[resetBounds, mapRows]);


    useEffect( () =>{ //useEffect for inputText
      if(mapRows == null){
          if(taskLists && taskListToMap && taskListToMap.id ) { 
            TaskLists.getTaskList(taskListToMap.id)
            .then( (data) => {
                if(!Array.isArray(data)){
                    console.error("Bad tasklist data",data);
                    return;
                }
                var tmpData = [...data];

                if(filters && filters.length > 0 && filterInOrOut != null){
                  //If more than one property is set, we need to filter seperately
                  let properties = new Set([...filters].map((v,i)=>v.property));
                  
                  //in works different than out, this seperates properties seperate instead of all together
                  if( properties.size > 1 && filterInOrOut == "in"){
                      properties.forEach((index,property)=>{
                          let tmpFilter = filters.filter((v,i)=> v.property == property);
                          tmpData = [...tmpData].filter(createFilter([...tmpFilter], filterInOrOut));
                      })
                  }else{
                      //Just one property or any filterInOrOut == out case
                      tmpData = data.filter(createFilter([...filters], filterInOrOut));
                  }
                }
                
                setTaskListTasksSaved(data);

                //Set TaskListTasks
                if(Array.isArray(tmpData)){
                    setMapRows(tmpData);
                }
                
            })
            .catch( error => {
                cogoToast.error(`Error getting Task List`, {hideAfter: 4});
                console.error("Error getting tasklist", error);
            })
        }
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
    },[mapRows,filterInOrOut]);

    useEffect(()=>{
        if(noMarkerRows == null && mapRows){
           setNoMarkerRows(mapRows.filter((row, index) => !row.geocoded));
        }
        console.log("noMarkerRows", mapRows);
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
              Tasks.saveCoordinates(row.t_id, data)
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


    //Get Bounds 
    //useCallback saves dep on mapRows, improves performance
    const getBounds = useCallback( () => {
      const points = mapRows.filter((v, i)=> v.geocoded).map((item, index)=> ({ lat: item.lat, lng: item.lng}));
      var tempBounds = new props.google.maps.LatLngBounds();
      for (var i = 0; i < points.length; i++) {    tempBounds.extend(points[i]);    }
      setBounds(tempBounds);
    },[ mapRows ] );

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
        <Grid container spacing={1}>
          <Grid item xs={12}>
          <TaskListFilter setFilteredItems={setMapRows}/>
          </Grid>
        </Grid>
          <Grid container spacing={3}>
            
            <Grid item xs={9}>
            
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
                        drilling={marker.drilling}
                        artwork={marker.artwork}
                        sign={marker.sign}

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
              <MapSidebar mapRows={mapRows} setMapRows={setMapRows} noMarkerRows={noMarkerRows} 
                          markedRows={markedRows} setMarkedRows={setMarkedRows}
                          activeMarker={activeMarker} setActiveMarker={setActiveMarker}
                          setShowingInfoWindow={setShowingInfoWindow}
                          setModalOpen={setModalOpen} setModalTaskId={setModalTaskId}
                          setResetBounds={setResetBounds}
                          infoWeather={infoWeather} setInfoWeather={setInfoWeather}
                          />
            </Grid>
          </Grid>
        </div>
    );
    }
  

  export default GoogleApiWrapper({
    apiKey: 'AIzaSyBd9JvLz52kD4ouQvqlHePUAqlBWzACJ-c'
  })(MapContainer);

