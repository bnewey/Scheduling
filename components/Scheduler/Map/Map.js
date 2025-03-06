import React, { useRef, useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import cogoToast from "cogo-toast";
import _ from "lodash";
import moment from "moment";

// @react-google-maps/api imports
import {
  LoadScript,
  GoogleMap,
  Marker,
  MarkerClusterer,
  OverlayView,
} from "@react-google-maps/api";

// Updated info window components
import MapMarkerInfoWindow from "./MapMarkerInfoWindow";
import MapVehicleInfoWindow from "./MapVehicleInfoWindow";
import MapCrewInfoWindow from "./MapCrewInfoWindow";

import Tasks from "../../../js/Tasks";
import Util from "../../../js/Util";
import { confirmAlert } from "react-confirm-alert";
import ConfirmYesNo from "../../UI/ConfirmYesNo";
import { MapContext } from "./MapContainer";
import { TaskContext } from "../TaskContainer";

const useStyles = makeStyles((theme) => ({
  root: {},
  map: {},
  infoWindow: {
    backgroundColor: "#000",
  },
  mainContainer: {},
}));

// For radar usage
let animationPosition = 0;
let radarLayers = [];

export default function CustomMap(props) {
  const classes = useStyles();

  // Props from MapContainer
  const {
    taskMarkers,
    setTaskMarkers,
    vehicleMarkers,
    crewMarkers,
    setCrewMarkers,
    setCrewMarkersRefetch,
    visibleItems,
    activeMarker,
    setActiveMarker,
    updateActiveMarker,
    handleFindVehicleIcon,
  } = props;

  // Additional data from context
  const {
    setInfoWeather,
    infoWeather,
    showingInfoWindow,
    setShowingInfoWindow,
    bouncieAuthNeeded,
    setBouncieAuthNeeded,
    setMapRows,
    mapRows,
    setMapRowsRefetch,
    visualTimestamp,
    setVisualTimestamp,
    radarControl,
    setRadarControl,
    radarOpacity,
    setRadarOpacity,
    radarSpeed,
    setRadarSpeed,
    timestamps,
    setTimestamps,
    multipleMarkersOneLocation,
    setMultipleMarkersOneLocation,
    getBorderColorBasedOnDate,
    changeStateSoMapUpdates,
    setChangeStateSoMapUpdates,
    resetBounds,
    setResetBounds,
  } = useContext(MapContext);

  const { job_types } = useContext(TaskContext);

  const [markerToRemap, setMarkerToRemap] = useState(null);
  const [markerLabels, setMarkerLabels] = useState(null);
  const [savedClusterer, setSavedClusterer] = useState(null);
  const clustererLengthRef = useRef(null);

  const [animationTimer, setAnimationTimer] = useState(false);
  const mapRef = useRef(null);

  // Basic container style for the map
  const containerStyle = { width: "100%", height: "calc(100vh - 220px)" };
  const defaultCenter = { lat: 34.731, lng: -94.3749 };
  const defaultZoom = 7;

  //---------------------------------------------------------
  // MAP LOADING & BOUNDS
  //---------------------------------------------------------
  const handleMapLoad = (map) => {
    mapRef.current = map;
    if (resetBounds && crewMarkers?.length) {
      setResetBounds(false);
      mapRef.current.fitBounds(getBounds(crewMarkers));
    }
  };

  const getBounds = (markers) => {
    const geocoded = markers.filter((m) => m.geocoded);
    if (!geocoded.length) return;
    const bounds = new window.google.maps.LatLngBounds();
    geocoded.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    return bounds;
  };

  //---------------------------------------------------------
  // MAP CLICK HANDLER (Remap logic)
  //---------------------------------------------------------
  const handleMapClick = (e) => {
    if (showingInfoWindow && e.placeId) {
      setShowingInfoWindow(false);
    }
    if (markerToRemap) {
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      confirmAlert({
        message: "Change coordinates?",
        buttons: [
          {
            label: "Yes",
            onClick: () => saveRemap(markerToRemap, coords),
          },
          {
            label: "No",
            onClick: () => {
              setMarkerToRemap(null);
              cogoToast.info("Cancelled Remap");
            },
          },
        ],
      });
    }
  };

  const saveRemap = (markerToRemap, coords) => {
    Tasks.saveCoordinates(markerToRemap.item?.address_id, coords)
      .then(() => {
        cogoToast.success("Remapped Marker");
        setMarkerToRemap(null);
        setMapRowsRefetch(true);

        if (activeMarker?.item) {
          const refreshed = { ...activeMarker.item, lat: coords.lat, lng: coords.lng };
          setActiveMarker({ type: activeMarker.type, item: refreshed });
        }
        if (activeMarker?.type === "task") {
          setTaskMarkers(null);
        }
        if (activeMarker?.type === "crew") {
          setCrewMarkersRefetch(true);
        }
      })
      .catch((err) => {
        console.error("Failed to remap", err);
        cogoToast.error("Failed to remap marker");
      });
  };

  //---------------------------------------------------------
  // MARKER CLUSTERING
  //---------------------------------------------------------
  const handleMarkerClustererClick = (markerClusterer) => {
    if (!mapRef.current) return;
    const clickedMarkers = markerClusterer.getMarkers();
    const zoom = mapRef.current.getZoom();
  
    console.log("Clicked cluster at zoom", zoom);
    console.log("Clicked markers titles:", clickedMarkers.map(m => m.getTitle()));
  
    let marker_ids = [];
    if (visibleItems?.indexOf("tasks") > -1) {
      marker_ids = clickedMarkers.map((m) => {
        const parsed = JSON.parse(m.getTitle() || "{}");
        return parsed.t_id;
      });
    } else if (visibleItems?.indexOf("crewJobs") > -1) {
      marker_ids = clickedMarkers.map((m) => {
        const parsed = JSON.parse(m.getTitle() || "{}");
        return parsed.id;
      });
    }
  
    console.log("Computed marker_ids:", marker_ids);
  
    // Only do your multi-marker logic if you're at max zoom
    if (zoom === 22 && marker_ids.length > 0) {
      setMultipleMarkersOneLocation(marker_ids);
  
      // tasks vs crew?
      const type = (visibleItems?.indexOf("tasks") > -1) ? "task" : "crew";
      console.log("Detected type:", type);
  
      let newActiveMarker;
      if (type === "task") {
        // find first in taskMarkers
        newActiveMarker = taskMarkers.find((m) => m.t_id === marker_ids[0]);
      } else {
        // find first in crewMarkers
        newActiveMarker = crewMarkers.find((m) => m.id === marker_ids[0]);
      }
  
      console.log("newActiveMarker:", newActiveMarker);
  
      if (newActiveMarker) {
        setActiveMarker({ type, item: newActiveMarker });
        setShowingInfoWindow(true);
      } else {
        console.warn("Failed to find matching marker in arrays!");
      }
    }
  };
  

  function handleClusterEnd(clusterer) {
    console.log('Clustering ended:', clusterer.getClusters().length);
  }

  //---------------------------------------------------------
  // MULTIPLE MARKERS AT ONE LOCATION
  //---------------------------------------------------------
  useEffect(() => {
    if (multipleMarkersOneLocation?.length) {
      const type = visibleItems?.indexOf("tasks") > 0 ? "task" : "crew";
      let newActive;
      if (type === "crew") {
        newActive = crewMarkers.find((m) => m.id === multipleMarkersOneLocation[0]);
      } else {
        newActive = taskMarkers.find((m) => m.t_id === multipleMarkersOneLocation[0]);
      }
      if (newActive) {
        setActiveMarker({ type, item: newActive });
        setShowingInfoWindow(true);
      }
    }
  }, [multipleMarkersOneLocation]);

  //---------------------------------------------------------
  // RADAR LOGIC
  //---------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current) return;
    if (radarControl) {
      switch (radarControl.control) {
        case "play":
          if (timestamps.length > 0) {
            mapRef.current.overlayMapTypes.clear();
            radarLayers = [];
          }
          if (animationTimer) {
            clearTimeout(animationTimer);
          }
          setAnimationTimer(
            setInterval(() => {
              showFrame(1);
            }, radarSpeed)
          );
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
          if (timestamps.length > 0) {
            mapRef.current.overlayMapTypes.clear();
            radarLayers = [];
          }
          animationPosition = 0;
          showFrame(timestamps.length - 1);
          break;

        default:
          break;
      }
    }
  }, [radarControl]);

  // If "radar" not visible => stop
  useEffect(() => {
    if (!mapRef.current) return;
    if (visibleItems?.indexOf("radar") === -1 && timestamps.length) {
      mapRef.current.overlayMapTypes.clear();
      setRadarControl({ control: "stop" });
    } else if (visibleItems?.indexOf("radar") !== -1) {
      onRadarInit();
    }
  }, [visibleItems]);

  const onRadarInit = () => {
    Util.getWeatherRadar("https://api.rainviewer.com/public/maps.json")
      .then((data) => setTimestamps(data))
      .catch((err) => {
        cogoToast.error("Radar Error");
        console.error(err);
      });
  };

  const addLayer = async (ts) => {
    if (!radarLayers[ts]) {
      radarLayers[ts] = new window.google.maps.ImageMapType({
        getTileUrl: (coord, zoom) =>
          [
            "https://tilecache.rainviewer.com/v2/radar/",
            ts,
            "/256/",
            zoom,
            "/",
            coord.x,
            "/",
            coord.y,
            "/2/1_1.png",
          ].join(""),
        tileSize: new window.google.maps.Size(256, 256),
        opacity: 0.001,
      });
      mapRef.current.overlayMapTypes.push(radarLayers[ts]);
    }
  };

  const changeRadarPosition = async (position, preloadOnly = false) => {
    while (position >= timestamps.length) position -= timestamps.length;
    while (position < 0) position += timestamps.length;

    const currentTimestamp = timestamps[animationPosition];
    const nextTimestamp = timestamps[position];

    await addLayer(nextTimestamp);
    if (preloadOnly) return;

    animationPosition = position;
    if (radarLayers[currentTimestamp]) {
      radarLayers[currentTimestamp].setOpacity(0);
    }
    radarLayers[nextTimestamp].setOpacity(radarOpacity);
    setVisualTimestamp(new Date(nextTimestamp * 1000).toString());
  };

  const showFrame = (step) => {
    const preloadDir = step > 0 ? 1 : -1;
    changeRadarPosition(animationPosition + step);
    changeRadarPosition(animationPosition + step + preloadDir, true);
  };

  //---------------------------------------------------------
  // CREW MARKER LABELS
  //---------------------------------------------------------
  useEffect(() => {
    if (!savedClusterer) return;
    const markerLabelsList = [];
    const allClusters = savedClusterer.getClusters?.() || [];
    allClusters.forEach((cluster) => {
      const allMarkers = cluster.getMarkers();
      if (allMarkers.length <= 1) {
        allMarkers.forEach((marker, idx) => {
          const row = JSON.parse(marker.getTitle());
          const labelAnchor = { x: -56, y: -56 };

          const initials = row?.leader_name
            ? getInitialsFromName(row.leader_name)
            : "C" + row?.crew_id;
          const crewColor = row?.crew_color || "#555";
          const borderColor = getBorderColorBasedOnDate(row?.job_date);
          const jobType = job_types.find((t) => t.type === row.job_type) || {};
          const jobTypeColor = jobType.color || "#fff";
          const jobTypeShorthand = jobType.shorthand || "";

          markerLabelsList.push(
            <OverlayView
              key={`${row.id}_${idx}`}
              position={marker.getPosition()}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={(x, y) =>
                props.getPixelPositionOffset(x, y, labelAnchor)
              }
            >
              <div
                onClick={() =>
                  props.updateActiveMarker(row.id, "crew")(null, null, null)
                }
                style={{
                  boxShadow: "rgb(0 0 0 / 48%) 0px 0px 2px 2px",
                  background: "#fff",
                  padding: "6px",
                  fontSize: "11px",
                  minHeight: "10px",
                  minWidth: "10px",
                  color: "white",
                  borderRadius: "50%",
                  border: `3px ${borderColor} solid`,
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    background: "#fff",
                    borderRadius: "50%",
                    padding: "2px",
                    color: jobTypeColor,
                    fontWeight: 600,
                    fontSize: "13px",
                    fontFamily: "sans-serif",
                    minWidth: "10px",
                  }}
                >
                  {jobTypeShorthand}
                </span>
                {row.num_services > 0 && (
                  <div
                    style={{
                      background: "#fff",
                      color: "#222",
                      position: "absolute",
                      padding: "1px",
                      minWidth: "15px",
                      fontSize: "9px",
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      minHeight: "15px",
                      textAlign: "center",
                      bottom: -8,
                      right: -5,
                      borderRadius: "50%",
                      border: "2px #222 solid",
                    }}
                  >
                    {row.num_services}
                  </div>
                )}
                {row.crew_id && initials && (
                  <div
                    style={{
                      background: crewColor,
                      color: "#fff",
                      position: "absolute",
                      padding: "1px",
                      minWidth: "15px",
                      fontSize: "9px",
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      minHeight: "15px",
                      textAlign: "center",
                      bottom: -8,
                      left: -5,
                      borderRadius: "50%",
                      border: "2px #222 solid",
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>
            </OverlayView>
          );
        });
      }
    });
    setMarkerLabels(markerLabelsList);
  }, [savedClusterer, savedClusterer?.key, crewMarkers]);

  // Helper
  const getInitialsFromName = (name) => {
    const parts = name.split(" ");
    let initials = parts[0]?.[0]?.toUpperCase() || "";
    if (parts.length > 1) {
      initials += parts[parts.length - 1][0]?.toUpperCase() || "";
    }
    return initials;
  };

  useEffect(() => {
    if (showingInfoWindow && activeMarker?.item && mapRef.current) {
      mapRef.current.panTo({
        lat: activeMarker.item.lat,
        lng: activeMarker.item.lng,
      });
    }
  }, [showingInfoWindow, activeMarker]);

  //---------------------------------------------------------
  // RENDER
  //---------------------------------------------------------
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyBd9JvLz52kD4ouQvqlHePUAqlBWzACJ-c"
      libraries={["geometry", "drawing", "places"]}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
      >
        {/* ========== Task Cluster ========== */}
        <MarkerClusterer
          onClick={handleMarkerClustererClick}
          averageCenter
          ignoreHidden
          enableRetinaIcons
          gridSize={40}
          styles={[
            { textColor: "black", height: 53, url: "/static/ClusterIcons/m1.png", width: 53 },
            { textColor: "black", height: 56, url: "/static/ClusterIcons/m2.png", width: 56 },
            { textColor: "white", height: 66, url: "/static/ClusterIcons/m3.png", width: 66 },
            { textColor: "white", height: 78, url: "/static/ClusterIcons/m4.png", width: 78 },
            { textColor: "white", height: 90, url: "/static/ClusterIcons/m5.png", width: 90 },
          ]}
        >
          {(clusterer) =>
            taskMarkers &&
            visibleItems?.includes("tasks") &&
            taskMarkers.map((marker, index) => (
              <Marker
                key={marker.t_id}
                clusterer={clusterer}
                title={JSON.stringify(marker)}
                position={{ lat: +marker.lat, lng: +marker.lng }}
                onClick={props.updateActiveMarker(marker.t_id, "task")}
                label={`#${index + 1}`}
              />
            ))
          }
        </MarkerClusterer>

        {/* ========== Vehicle Cluster ========== */}
        <MarkerClusterer
          averageCenter
          enableRetinaIcons={false}
          maxZoom={14}
          gridSize={30}
          styles={[
            { textColor: "black", height: 40, url: "/static/VehicleCluster/m3.png", width: 40 },
            { textColor: "black", height: 40, url: "/static/VehicleCluster/m4.png", width: 40 },
            { textColor: "white", height: 40, url: "/static/VehicleCluster/m3.png", width: 40 },
            { textColor: "white", height: 40, url: "/static/VehicleCluster/m4.png", width: 40 },
            { textColor: "white", height: 40, url: "/static/VehicleCluster/m5.png", width: 40 },
          ]}
        >
          {(clusterer) =>
            vehicleMarkers &&
            visibleItems?.includes("vehicles") &&
            vehicleMarkers.map((vehicle) => (
              <Marker
                key={vehicle.vin}
                clusterer={clusterer}
                position={{ lat: +vehicle.latitude, lng: +vehicle.longitude }}
                onClick={props.updateActiveMarker(vehicle.vin, "vehicle")}
                icon={{
                  url: handleFindVehicleIcon(vehicle),
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
                title={vehicle.name}
                label={vehicle.name}
              />
            ))
          }
        </MarkerClusterer>

        {/* ========== Crew Cluster ========== */}
        {changeStateSoMapUpdates && (
          <MarkerClusterer
            onClusteringEnd={handleClusterEnd}
            onClick={handleMarkerClustererClick}
            averageCenter
            ignoreHidden
            enableRetinaIcons
            gridSize={1}
            styles={[
              { textColor: "black", height: 53, url: "/static/ClusterIcons/m1.png", width: 53 },
              { textColor: "black", height: 56, url: "/static/ClusterIcons/m2.png", width: 56 },
              { textColor: "white", height: 66, url: "/static/ClusterIcons/m3.png", width: 66 },
              { textColor: "white", height: 78, url: "/static/ClusterIcons/m4.png", width: 78 },
              { textColor: "white", height: 90, url: "/static/ClusterIcons/m5.png", width: 90 },
            ]}
          >
            {(clusterer) =>
              crewMarkers &&
              visibleItems?.includes("crewJobs") &&
              crewMarkers.map((crew) => (
                <Marker
                  key={crew.id}
                  clusterer={clusterer}
                  position={{ lat: +crew.lat, lng: +crew.lng }}
                  title={JSON.stringify(crew)}
                  zIndex={-1}
                  opacity={0}
                  clickable={false}
                  cursor="drag"
                />
              ))
            }
          </MarkerClusterer>
        )}
        {/* Show custom label overlays for single-crew clusters */}
        {changeStateSoMapUpdates && markerLabels}

        {/* ========== Info Windows ========== */}
        {showingInfoWindow && activeMarker?.type === "task" && (
          <MapMarkerInfoWindow
            {...props}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
            setInfoWeather={setInfoWeather}
            infoWeather={infoWeather}
            multipleMarkersOneLocation={multipleMarkersOneLocation}
            setMultipleMarkersOneLocation={setMultipleMarkersOneLocation}
            showingInfoWindow={showingInfoWindow}
            setShowingInfoWindow={setShowingInfoWindow}
            markerToRemap={markerToRemap}
            setMarkerToRemap={setMarkerToRemap}
          />
        )}

        {showingInfoWindow && activeMarker?.type === "crew" && (
          <MapCrewInfoWindow
            {...props}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
            multipleMarkersOneLocation={multipleMarkersOneLocation}
            setInfoWeather={setInfoWeather}
            infoWeather={infoWeather}
            setMultipleMarkersOneLocation={setMultipleMarkersOneLocation}
            setCrewMarkersRefetch={setCrewMarkersRefetch}
            showingInfoWindow={showingInfoWindow}
            setShowingInfoWindow={setShowingInfoWindow}
            markerToRemap={markerToRemap}
            setMarkerToRemap={setMarkerToRemap}
          />
        )}

        {showingInfoWindow && activeMarker?.type === "vehicle" && vehicleMarkers && (
          <MapVehicleInfoWindow
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
            showingInfoWindow={showingInfoWindow}
            setShowingInfoWindow={setShowingInfoWindow}
            bouncieAuthNeeded={bouncieAuthNeeded}
            setBouncieAuthNeeded={setBouncieAuthNeeded}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
