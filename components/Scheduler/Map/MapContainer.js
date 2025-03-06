import { makeStyles, Grid } from "@material-ui/core";
import ActiveVehicleIcon from "@material-ui/icons/PlayArrow";
import StoppedVehicleIcon from "@material-ui/icons/Stop";
import { useState, useEffect, useContext, createContext } from "react";
import moment from "moment";
import cogoToast from "cogo-toast";

import MapSidebar from "./MapSidebar/MapSidebar";
import CustomMap from "./Map"; // <-- Make sure this is also updated to @react-google-maps/api internally

import Tasks from "../../../js/Tasks";
import Crew from "../../../js/Crew";
import TaskLists from "../../../js/TaskLists";
import Util from "../../../js/Util";
import Vehicles from "../../../js/Vehicles";
import TaskListFilter from "../TaskList/TaskListFilter";
import { TaskContext } from "../TaskContainer";
import { confirmAlert } from "react-confirm-alert"; // Import
import ConfirmYesNo from "../../UI/ConfirmYesNo";

import { createFilter } from "../../../js/Filter";
import { createSorter } from "../../../js/Sort";
import { CrewContext } from "../Crew/CrewContextContainer";
import _ from "lodash";

export const MapContext = createContext(null);

const useStyles = makeStyles((theme) => ({
  root: {},
  map: {},
  infoWindow: {
    backgroundColor: "#000",
  },
  mainContainer: {},
}));

const MapContainer = (props) => {
  const classes = useStyles();

  const {
    modalOpen,
    setModalOpen,
    setModalTaskId,
    taskLists,
    setTaskLists,
    taskListToMap,
    setTaskListToMap,
    crewToMap,
    setCrewToMap,
    filters,
    setFilter,
    sorters,
    setSorters,
    filterInOrOut,
    filterAndOr,
    setTaskListTasksSaved,
    setTLTasksExtraSaved,
    refreshView,
    installDateFilters,
    setInstallDateFilters,
    drillDateFilters,
    arrivalDateFilters,
    drillCrewFilters,
    installCrewFilters,
    job_types,
  } = useContext(TaskContext);

  const { crewJobDateRange, setShouldResetCrewState, crewJobDateRangeActive } =
    useContext(CrewContext);

  const [showingInfoWindow, setShowingInfoWindow] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);

  const [changeStateSoMapUpdates, setChangeStateSoMapUpdates] = useState(1);

  const [mapRows, setMapRows] = useState(null);
  const [mapRowsRefetch, setMapRowsRefetch] = useState(false);
  const [resetBounds, setResetBounds] = useState(true);
  const [markedRows, setMarkedRows] = useState([]);
  const [noMarkerRows, setNoMarkerRows] = useState(null);
  const [multipleMarkersOneLocation, setMultipleMarkersOneLocation] =
    useState(null);

  const [woiData, setWoiData] = useState(null);
  const [infoWeather, setInfoWeather] = useState(null);

  // Vehicles
  const [vehicleRows, setVehicleRows] = useState(null);
  const [vehicleNeedsRefresh, setVehicleNeedsRefresh] = useState(true);
  const [bouncieAuthNeeded, setBouncieAuthNeeded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(null);

  // Crew
  const [crewJobs, setCrewJobs] = useState(null);
  const [crewJobsRefetch, setCrewJobsRefetch] = useState(false);
  const [crewJobsLoading, setCrewJobsLoading] = useState(false);
  const [unfilteredJobs, setUnfilteredJobs] = useState(null);
  const [showCompletedJobs, setShowCompletedJobs] = useState(false);
  const [crewFilters, setCrewFilters] = useState([]);
  const [crewJobSorters, setCrewJobSorters] = useState([
    { property: "job_date", direction: "ASC" },
  ]);

  const [mapHeight, setMapHeight] = useState("400px");

  // Radar
  const [radarControl, setRadarControl] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [radarOpacity, setRadarOpacity] = useState(0.5);
  const [radarSpeed, setRadarSpeed] = useState(400);
  const [visualTimestamp, setVisualTimestamp] = useState(null);

  // Refresh logic
  useEffect(() => {
    if (refreshView && refreshView === "map") {
      setMapRowsRefetch(true);
      setCrewJobsRefetch(true);
      setCrewJobsLoading(false);
    }
  }, [refreshView]);

  // Vehicles
  useEffect(() => {
    if (vehicleNeedsRefresh) {
      const locations = [];
      Promise.all([Vehicles.getLinxupLocations(), Vehicles.getBouncieLocations()])
        .then((values) => {
          const linuxp_loc_array = values[0]?.data?.locations || [];
          const tmpData =
            linuxp_loc_array?.map((item) => ({
              latitude: item.latitude,
              longitude: item.longitude,
              make: item.make,
              model: item.model,
              name: item.firstName + " " + item.lastName,
              vin: item.vin,
              service: "linxup",
              active: item.speed > 0,
              direction: item.direction,
            })) || [];

          locations.push(...tmpData);

          if (values[1]?.error || !Array.isArray(values[1])) {
            console.error("Custom Error from bouncie", values[1]);
            setBouncieAuthNeeded(true);
          } else {
            const tmpData2 =
              values[1]?.map((item) => ({
                latitude: item.stats.location.lat,
                longitude: item.stats.location.lon,
                make: item.model.make,
                model: item.model.name,
                name: item.nickName,
                vin: item.vin,
                service: "bouncie",
                active: item.stats.isRunning,
                direction: item.stats.location.heading,
              })) || [];
            locations.push(...tmpData2);
          }

          setVehicleRows(locations);
          setVehicleNeedsRefresh(false);

          // Update active marker if it's a vehicle
          if (activeMarker?.type === "vehicle" && activeMarker?.item) {
            const refreshedActive = locations.find(
              (v) => v.vin === activeMarker.item.vin
            );
            if (refreshedActive) {
              setActiveMarker({ type: "vehicle", item: refreshedActive });
            }
          }
        })
        .catch((error) => {
          console.error("Vehicle error", error);
        });
    }
  }, [vehicleNeedsRefresh]);

  // Poll vehicles every 30 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setVehicleNeedsRefresh(true);
    }, 30000);
    return () => clearTimeout(timeoutId);
  }, [vehicleRows]);

  // Show/hide features
  useEffect(() => {
    if (visibleItems == null) {
      const tmp = window.localStorage.getItem("visibleItems");
      let tmpParsed;
      if (tmp) {
        tmpParsed = JSON.parse(tmp);
      }
      if (Array.isArray(tmpParsed)) {
        setVisibleItems(tmpParsed);
      } else {
        setVisibleItems(["crewJobs", "vehicles"]);
      }
    } else {
      window.localStorage.setItem("visibleItems", JSON.stringify(visibleItems));
    }
  }, [visibleItems]);

  // Load tasks for map
  useEffect(() => {
    if (
      (mapRows == null || mapRowsRefetch === true) &&
      filterInOrOut != null &&
      filterAndOr != null &&
      filters != null &&
      installDateFilters != null &&
      drillDateFilters != null &&
      arrivalDateFilters != null &&
      drillCrewFilters != null &&
      installCrewFilters != null
    ) {
      if (taskLists && taskListToMap && taskListToMap.id) {
        if (mapRowsRefetch) {
          setMapRowsRefetch(false);
        }

        TaskLists.getTaskList(taskListToMap.id)
          .then((data) => {
            if (!Array.isArray(data)) {
              console.error("Bad tasklist data", data);
              return;
            }
            let tmpData = [];

            // Apply filters
            if (filters?.length > 0) {
              const properties = new Set(filters.map((v) => v.property));
              properties.forEach((prop) => {
                const tmpFilter = filters.filter((f) => f.property === prop);
                let filteredData;
                if (
                  (filterAndOr === "or" && filterInOrOut === "in") ||
                  (filterAndOr === "and" && filterInOrOut === "out")
                ) {
                  // Start from blank and add
                  filteredData = data.filter(
                    createFilter([...tmpFilter], filterInOrOut, "or")
                  );
                  tmpData.push(...filteredData);
                  tmpData = [...new Set(tmpData)]; // remove duplicates
                } else if (
                  (filterAndOr === "and" && filterInOrOut === "in") ||
                  (filterAndOr === "or" && filterInOrOut === "out")
                ) {
                  // Start from entire set, then refine
                  if (tmpData.length <= 0) {
                    tmpData = [...data];
                  }
                  filteredData = tmpData.filter(
                    createFilter([...tmpFilter], filterInOrOut, "or")
                  );
                  tmpData = filteredData;
                }
              });
            }

            setTaskListTasksSaved(data);
            setTLTasksExtraSaved(tmpData);

            // Additional date or crew filters
            const applyInOrFilters = (base, extraFilters) => {
              if (extraFilters.length > 0) {
                if (base.length <= 0 && filters?.length === 0) {
                  base = [...data];
                }
                return base.filter(createFilter([...extraFilters], "in", "or"));
              }
              return base;
            };

            tmpData = applyInOrFilters(tmpData, installDateFilters);
            tmpData = applyInOrFilters(tmpData, drillDateFilters);
            tmpData = applyInOrFilters(tmpData, arrivalDateFilters);
            tmpData = applyInOrFilters(tmpData, drillCrewFilters);
            tmpData = applyInOrFilters(tmpData, installCrewFilters);

            // If no filters at all
            if (
              filters?.length === 0 &&
              installDateFilters?.length === 0 &&
              drillDateFilters?.length === 0 &&
              arrivalDateFilters?.length === 0 &&
              drillCrewFilters?.length === 0 &&
              installCrewFilters?.length === 0
            ) {
              tmpData = [...data];
            }

            // Sort
            if (sorters && sorters.length > 0) {
              tmpData = tmpData.sort(createSorter(...sorters));
            }

            if (Array.isArray(tmpData)) {
              setMapRows(tmpData);
              console.log("SETTING MAP ROWS main", tmpData);
            }
            setWoiData(null);
          })
          .catch((error) => {
            cogoToast.error(`Error getting Task List`, { hideAfter: 4 });
            console.error("Error getting tasklist", error);
          });
      } else {
        console.log("No valid TaskList to map or missing ID");
      }
    }

    if (mapRows) {
      const tmp = mapRows.filter((row) => row.geocoded);
      setMarkedRows(tmp);
    }
  }, [
    mapRows,
    mapRowsRefetch,
    filterInOrOut,
    filterAndOr,
    taskLists,
    taskListToMap,
    filters,
    installDateFilters,
    drillDateFilters,
    arrivalDateFilters,
    drillCrewFilters,
    installCrewFilters,
  ]);

  // Sort watch
  useEffect(() => {
    if (Array.isArray(sorters) && sorters.length) {
      if (mapRows && mapRows.length) {
        const tmpData = mapRows.sort(createSorter(...sorters));
        console.log("SETTING MAP ROWS sorters", tmpData);
        setMapRows([...tmpData]);
        cogoToast.success(`Sorting by ${sorters.map((v) => v.property).join(", ")}`);
      }
    }
  }, [sorters]);

  // If mapRows changed, refetch crew
  useEffect(() => {
    if (mapRows && crewJobs) {
      setCrewJobsRefetch(true);
    }
  }, [mapRows]);

  // Geocode any tasks that lack lat/lng
  useEffect(() => {
    if (noMarkerRows == null && mapRows) {
      setNoMarkerRows(mapRows.filter((row) => !row.geocoded));
    }
    if (noMarkerRows && noMarkerRows.length > 0 && mapRows) {
      const tmpMapRows = [...mapRows];
      noMarkerRows.forEach((row, idx) => {
        if (!row.address) return;

        Tasks.getCoordinates(row.address, row.city, row.state, row.zip)
          .then((data) => {
            if (!data) {
              throw new Error("Bad return from getCoordinates");
            }
            const mapRowIndex = mapRows.indexOf(row);
            const tmpRow = { ...row, lat: data.lat, lng: data.lng, geocoded: 1 };
            tmpMapRows[mapRowIndex] = tmpRow;
            setMapRows(tmpMapRows);

            setNoMarkerRows(tmpMapRows.filter((r) => !r.geocoded));

            Tasks.saveCoordinates(row.address_id, data).catch((error) => {
              console.warn("Did not save coordinates", error);
            });
            if (idx === noMarkerRows.length - 1) {
              cogoToast.info("Unmapped Markers have been added to map", {
                hideAfter: 4,
              });
            }
          })
          .catch((error) => {
            console.error(error);
            cogoToast.error("Error getting coordinates", { hideAfter: 4 });
            setNoMarkerRows([]);
          });
      });
    }
  }, [noMarkerRows, mapRows]);

  // Crew
  useEffect(() => {
    if (
      mapRows &&
      (crewToMap || taskListToMap) &&
      (crewJobs == null || crewJobsRefetch === true) &&
      crewFilters &&
      crewJobSorters &&
      crewJobsLoading !== true
    ) {
      if (crewJobsRefetch) {
        setCrewJobsRefetch(false);
      }
      if (taskListToMap) {
        setCrewJobsLoading(true);
        Crew.getCrewJobsByTaskList(taskListToMap.id)
          .then((data) => {
            if (data) {
              // Filter to tasks in our map
              let updateData = data.filter((item) =>
                mapRows.find((row) => row.t_id === item.task_id)
              );
              // Only incomplete
              updateData = updateData.filter((j) => j.completed === 0);

              // Filter by crew
              if (crewFilters?.length) {
                updateData = updateData.filter((job) => {
                  return _.find(crewFilters, function (filter) {
                    if (filter === "unassigned" && job.crew_id === null) {
                      return true;
                    }
                    return filter == job.crew_id;
                  });
                });
              }

              // Filter by date range
              if (crewJobDateRange) {
                updateData = updateData.filter((job) => {
                  let date = null;
                  if (job.job_type === "install") {
                    date = Util.convertISODateToMySqlDate(job.sch_install_date);
                  } else if (job.job_type === "drill") {
                    date = Util.convertISODateToMySqlDate(job.drill_date);
                  } else {
                    date = Util.convertISODateToMySqlDate(job.job_date);
                  }
                  if (date && crewJobDateRangeActive) {
                    return (
                      moment(date).isAfter(
                        moment(
                          Util.convertISODateToMySqlDate(crewJobDateRange.from)
                        ).subtract(1, "days")
                      ) &&
                      moment(date).isBefore(
                        moment(
                          Util.convertISODateToMySqlDate(crewJobDateRange.to)
                        ).add(1, "days")
                      )
                    );
                  }
                  return true;
                });
              }

              // Sort
              if (crewJobSorters?.length) {
                updateData = updateData.sort(createSorter(...crewJobSorters));
              }

              setUnfilteredJobs([...data]);
              setCrewJobs(updateData);
              setCrewJobsLoading(false);

              // If active marker is a crew item, refresh it
              if (activeMarker && activeMarker.type === "crew") {
                const newMarker = data.find(
                  (item) => item.id === activeMarker.item.id
                );
                if (newMarker) {
                  setActiveMarker({ type: "crew", item: newMarker });
                }
              }
            }
          })
          .catch((error) => {
            console.error("Error getting crewJobs", error);
            cogoToast.error("Failed to get crew jobs");
          });
      }
    }
  }, [
    mapRows,
    crewJobs,
    crewJobsRefetch,
    crewToMap,
    taskListToMap,
    crewFilters,
    crewJobSorters,
  ]);

  // Marker click logic
  const updateActiveMarker = (id, type) => (props, marker, e) => {
    let item;
    if (type === "task") {
      item = mapRows.find((row) => row.t_id === id);
    } else if (type === "vehicle") {
      item = vehicleRows.find((row) => row.vin === id);
    } else if (type === "crew") {
      item = crewJobs.find((row) => row.id === id);
    }

    if (!item) {
      console.error("Bad marker type or item not found");
      return;
    }
    setMultipleMarkersOneLocation(null);
    setActiveMarker({ type, item });
    setShowingInfoWindow(true);
  };

  // Utility function to pick icons
  const handleFindVehicleIcon = (vehicle) => {
    if (!vehicle) return;
    const direction = Util.getDirectionFromDegree(vehicle.direction);
    if (vehicle.service === "bouncie") {
      return vehicle.active
        ? `static/vehicle_icons/bouncie_active_${direction.toLowerCase()}.png`
        : `static/vehicle_icons/bouncie_stop.png`;
    } else if (vehicle.service === "linxup") {
      return vehicle.active
        ? `static/vehicle_icons/linxup_active_${direction.toLowerCase()}.png`
        : `static/vehicle_icons/linxup_stop.png`;
    }
  };

  const handleFindCrewIcon = (job) => {
    if (!job) return;
    if (job.job_type === "drill") {
      return `static/crew_icons/drill_marker.png`;
    } else if (job.job_type === "install") {
      return `static/crew_icons/install_marker.png`;
    }
  };

  const getBorderColorBasedOnDate = (date) => {
    if (!date) return "#888";
    if (moment(date).isBefore(moment())) {
      return "#ff0000";
    }
    if (moment(date).isBefore(moment().add(2, "day"))) {
      return "#ff8000";
    }
    if (moment(date).isBefore(moment().add(5, "day"))) {
      return "#fff600";
    }
    // else
    return "#55c200";
  };

  return (
    <MapContext.Provider
      value={{
        showingInfoWindow,
        setShowingInfoWindow,
        activeMarker,
        setActiveMarker,
        mapRows,
        setMapRows,
        mapRowsRefetch,
        setMapRowsRefetch,
        resetBounds,
        setResetBounds,
        markedRows,
        setMarkedRows,
        noMarkerRows,
        setNoMarkerRows,
        multipleMarkersOneLocation,
        setMultipleMarkersOneLocation,
        infoWeather,
        setInfoWeather,
        vehicleRows,
        setVehicleRows,
        vehicleNeedsRefresh,
        setVehicleNeedsRefresh,
        bouncieAuthNeeded,
        setBouncieAuthNeeded,
        visibleItems,
        setVisibleItems,
        crewJobs,
        setCrewJobs,
        crewJobsRefetch,
        setCrewJobsRefetch,
        crewJobsLoading,
        setCrewJobsLoading,
        unfilteredJobs,
        setUnfilteredJobs,
        showCompletedJobs,
        setShowCompletedJobs,
        radarControl,
        setRadarControl,
        timestamps,
        setTimestamps,
        radarOpacity,
        setRadarOpacity,
        radarSpeed,
        setRadarSpeed,
        visualTimestamp,
        setVisualTimestamp,
        crewFilters,
        setCrewFilters,
        crewJobSorters,
        setCrewJobSorters,
        getBorderColorBasedOnDate,
        changeStateSoMapUpdates,
        setChangeStateSoMapUpdates,
        woiData,
        setWoiData,
      }}
    >
      <div>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TaskListFilter filteredItems={mapRows} setFilteredItems={setMapRows} />
          </Grid>
        </Grid>
        <Grid container spacing={1} className={classes.mainContainer}>
          <Grid item xs={12} md={8}>
            <CustomMap
              taskMarkers={markedRows}
              setTaskMarkers={setMarkedRows}
              vehicleMarkers={vehicleRows}
              crewMarkers={crewJobs}
              setCrewMarkers={setCrewJobs}
              setCrewMarkersRefetch={setCrewJobsRefetch}
              crewMarkersRefetch={crewJobsRefetch}
              visibleItems={visibleItems}
              updateActiveMarker={updateActiveMarker}
              handleFindVehicleIcon={handleFindVehicleIcon}
              handleFindCrewIcon={handleFindCrewIcon}
              resetBounds={resetBounds}
              activeMarker={activeMarker}
              setActiveMarker={setActiveMarker}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MapSidebar />
          </Grid>
        </Grid>
      </div>
    </MapContext.Provider>
  );
};

export default MapContainer;
