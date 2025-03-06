import React, { useState, useEffect, useContext, useCallback } from "react";
import ReactDOM from "react-dom";
import { makeStyles, Avatar, Button, TextField } from "@material-ui/core";
import { InfoWindow } from "@react-google-maps/api"; // <-- NEW IMPORT
import clsx from "clsx";
import moment from "moment";
import Router from "next/router";

import CloudTwoToneIcon from "@material-ui/icons/CloudTwoTone";
import EditLocationSharpIcon from "@material-ui/icons/EditLocationSharp";

import cogoToast from "cogo-toast";
import Tasks from "../../../js/Tasks";
import Work_Orders from "../../../js/Work_Orders";
import Util from "../../../js/Util";
import { TaskContext } from "../TaskContainer";
import { MapContext } from "./MapContainer";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
/**
 * MapCrewInfoWindow – shows a Google Maps InfoWindow with details about a “crew task”
 * or job (the "Active marker").
 */
const MapCrewInfoWindow = (props) => {
  const {
    taskMarkers,
    activeMarker,
    setActiveMarker,
    infoWeather,
    setInfoWeather,
    showingInfoWindow,
    setShowingInfoWindow,
    markerToRemap,
    setMarkerToRemap,
    multipleMarkersOneLocation,
    setMultipleMarkersOneLocation,
  } = props;

  // We use this to force map refresh after editing
  const { setMapRowsRefetch } = useContext(MapContext);
  const { job_types } = useContext(TaskContext);

  const [jobTask, setJobTask] = useState(null);
  const [jobTaskRefetch, setJobTaskRefetch] = useState(false);
  const [notesEdit, setNotesEdit] = useState(false);
  const [notes, setNotes] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const classes = useStyles();

  // On mount or whenever activeMarker changes, fetch data
  useEffect(() => {
    setInfoWeather(null);
    setShouldUpdate(false);

    if (activeMarker || jobTaskRefetch) {
      if (jobTaskRefetch) {
        setJobTaskRefetch(false);
      }
      // fetch the task details
      Tasks.getTask(activeMarker?.item?.t_id)
        .then((data) => {
          if (data) {
            setJobTask(data[0]);
          }
        })
        .catch((error) => {
          console.error("Failed to get task for job", error);
          cogoToast.error("Failed to get task for job");
        });

      // reset notes if needed
      if (notesEdit) {
        setNotesEdit(false);
      }
      if (notes !== activeMarker.item?.notes) {
        setNotes(null);
      }
    }
  }, [activeMarker, jobTaskRefetch]);

  const handleShouldUpdate = (event, update) => {
    setNotes(event.target.value);
    setShouldUpdate(update);
  };

  const handleInfoWindowClose = () => {
    setInfoWeather(null);
    setShowingInfoWindow(false);
    setMultipleMarkersOneLocation(null);
    setShouldUpdate(false);
  };

  const getWeather = (event, lat, lng) => {
    if (infoWeather) {
      setInfoWeather(null);
      return;
    }
    Util.getWeather(lat, lng)
      .then((data) => {
        setInfoWeather(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getWeatherIcon = (code) => {
    let icon_url = "/static/weather_icons/";
    switch (code) {
      case "cloudy":
      case "fog_light":
      case "fog":
      case "mostly_cloudy":
      case "partly_cloudy":
        icon_url += "cloud.png";
        break;
      case "mostly_clear":
      case "clear":
        icon_url += "sun.png";
        break;
      case "snow":
      case "flurries":
      case "snow_light":
      case "snow_heavy":
      case "ice_pellets_light":
      case "ice_pellets_heavy":
      case "freezing_drizzle":
      case "freezing_rain_light":
      case "freezing_rain":
      case "freezing_rain_heavy":
        icon_url += "snow.png";
        break;
      case "rain":
      case "drizzle":
      case "rain_light":
      case "rainy_heavy":
      case "tstorm":
        icon_url += "water.png";
        break;
      default:
        icon_url += "sun.png";
    }
    return icon_url;
  };

  const handleSetMarkerToRemap = () => {
    if (!jobTask || !activeMarker) {
      cogoToast.error("Error remapping");
      console.error("No jobTask or activeMarker to remap");
      return;
    }
    setMarkerToRemap({ type: activeMarker.type, item: jobTask });
  };

  const handleCancelRemap = () => {
    setMarkerToRemap(null);
  };

  const handleNextMultiMarker = () => {
    const index = multipleMarkersOneLocation.indexOf(activeMarker.item.t_id);
    let nextIndex = index >= multipleMarkersOneLocation.length - 1 ? 0 : index + 1;
    const newActiveId = multipleMarkersOneLocation[nextIndex];
    const newActiveMarker = taskMarkers.find((m) => m.t_id === newActiveId);
    setActiveMarker({ type: "task", item: newActiveMarker });
  };

  const handlePrevMultiMarker = () => {
    const index = multipleMarkersOneLocation.indexOf(activeMarker.item.t_id);
    let prevIndex = index <= 0 ? multipleMarkersOneLocation.length - 1 : index - 1;
    const newActiveId = multipleMarkersOneLocation[prevIndex];
    const newActiveMarker = taskMarkers.find((m) => m.t_id === newActiveId);
    setActiveMarker({ type: "task", item: newActiveMarker });
  };

  const handleGoToWorkOrderId = (wo_id, event) => {
    event.preventDefault();
    window.localStorage.setItem("detailWOid", JSON.stringify(wo_id));
    window.localStorage.setItem("currentView", JSON.stringify("woDetail"));
    Router.push("/scheduling/work_orders");
  };

  const handleEditNotes = (currentlyEditing) => {
    setNotesEdit(!currentlyEditing);
  };

  const handleSaveNotes = (event, item) => {
    if (!shouldUpdate) {
      cogoToast.info("No changes");
      setNotesEdit(false);
      return;
    }
    if (!item) {
      cogoToast.error("No item in handleSaveNotes");
      console.error("No item in handleSaveNotes");
      return;
    }
    Work_Orders.updateWONotes(item.table_id, notes)
      .then(() => {
        cogoToast.success("Updated notes");
        setJobTaskRefetch(true);
        setNotesEdit(false);
        setShouldUpdate(false);
      })
      .catch((error) => {
        cogoToast.error("Failed to update notes");
        console.error("Failed to update notes", error);
      });
  };

  const crewColor = useCallback(
    activeMarker?.item?.crew_color || "#555",
    [activeMarker]
  );
  const typeColor = useCallback(() => {
    const jt = job_types.find((type) => type.type === activeMarker?.item?.job_type);
    return jt?.color || "#222";
  }, [activeMarker, job_types]);

  return (
    <InfoWindowEx
      // We must replace "new google.maps.Size" with "new window.google.maps.Size" or leave it out
      position={{ lat: activeMarker.item.lat, lng: activeMarker.item.lng }}
      onCloseClick={handleInfoWindowClose}
      open={showingInfoWindow}
      defaultOptions={{
        pixelOffset: new window.google.maps.Size(0, -35),
      }}
      style={classes.infoWindow}
      {...props}
    >
      <div>
        {jobTask ? (
          <>
            {multipleMarkersOneLocation && (
              <div className={classes.multipleMarkersDiv}>
                <div className={classes.multiMarkerLabelDiv}>
                  <span className={classes.multipleMarkersSpan}>
                    Multiple Markers!
                  </span>
                </div>
                <Button
                  onClick={handlePrevMultiMarker}
                  className={classes.multiMarkerButton}
                >
                  {"Prev"}
                </Button>
                <Button
                  onClick={handleNextMultiMarker}
                  className={classes.multiMarkerButton}
                >
                  {"Next"}
                </Button>
              </div>
            )}
            <div className={classes.markerInfo}>{jobTask.t_name}</div>
            <div className={classes.markerSubInfo}>
              <div className={classes.markerSubInfoDiv}>
                <span className={classes.markerSubInfoLabel}>WO#:</span>
                <span
                  className={clsx(classes.markerSubInfoValue, classes.clickableWOnumber)}
                  onClick={(event) => handleGoToWorkOrderId(jobTask?.table_id, event)}
                >
                  {jobTask?.table_id}
                </span>
              </div>
              <div className={classes.markerSubInfoDiv}>
                <span className={classes.markerSubInfoLabel}>Type:</span>
                <span
                  className={classes.markerSubInfoValue}
                  style={{
                    fontWeight: 500,
                    color: typeColor(),
                    textTransform: "uppercase",
                  }}
                >
                  {jobTask?.wo_type}
                </span>
              </div>
              <div className={classes.markerSubInfoDiv}>
                <span className={classes.markerSubInfoLabel}>Install Date:</span>
                <span className={classes.markerSubInfoValue}>
                  {jobTask?.sch_install_date
                    ? moment(jobTask?.sch_install_date).format("MM-DD-YYYY")
                    : ""}
                </span>
              </div>
              {jobTask?.drill_date && (
                <div className={classes.markerSubInfoDiv}>
                  <span className={classes.markerSubInfoLabel}>Drill Date:</span>
                  <span className={classes.markerSubInfoValue}>
                    {moment(jobTask?.drill_date).format("MM-DD-YYYY")}
                  </span>
                </div>
              )}
              <div className={classes.markerSubInfoDiv}>
                <span className={classes.markerSubInfoLabel}>Descr:</span>
                <span className={classes.markerSubInfoValue}>
                  {jobTask?.description}
                </span>
              </div>
              <div className={classes.markerSubInfoDiv}>
                <span
                  className={clsx(classes.markerSubInfoLabel, classes.clickableWOnumber)}
                  onClick={() => handleEditNotes(notesEdit)}
                >
                  Notes:
                </span>
                {!notesEdit && (
                  <span className={classes.markerSubInfoValue}>
                    {jobTask?.notes}
                  </span>
                )}
                {notesEdit && (
                  <div>
                    <TextField
                      id="wo_notes"
                      variant="outlined"
                      multiline
                      name="item_notes"
                      value={notes}
                      InputProps={{ className: classes.inputRoot }}
                      defaultValue={jobTask?.notes}
                      onChange={(event) => handleShouldUpdate(event, true)}
                    />
                    <span
                      className={classes.clickableWOnumber}
                      onClick={(event) => handleSaveNotes(event, activeMarker?.item)}
                    >
                      Save
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>No Data</p>
        )}
        <div className={classes.buttonContainer}>
          {jobTask && (
            <CloudTwoToneIcon
              onClick={(event) =>
                getWeather(event, activeMarker.item.lat, activeMarker.item.lng)
              }
              className={clsx({
                [classes.weatherInfoButtonActive]: !!infoWeather,
                [classes.weatherInfoButtonInactive]: !infoWeather,
              })}
            />
          )}

          {!markerToRemap && (
            <EditLocationSharpIcon
              onClick={handleSetMarkerToRemap}
              className={clsx({
                [classes.weatherInfoButtonActive]: !!markerToRemap,
              })}
            />
          )}
          {markerToRemap && (
            <button
              type="button"
              onClick={handleCancelRemap}
              className={classes.infoButton}
            >
              Cancel Remap
            </button>
          )}
        </div>
        {infoWeather && (
          <div className={classes.weather_div}>
            <table className={classes.weather_table}>
              <thead>
                <tr>
                  <th></th>
                  {infoWeather.map((day, i) => {
                    const date = new Date(day.observation_time.value).getUTCDay();
                    return <th key={"head" + i}>{days[date]}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  {infoWeather.map((day, i) => (
                    <td key={"avatar" + i}>
                      <Avatar
                        src={getWeatherIcon(day.weather_code.value)}
                        className={classes.avatar}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="dataRow">
                  <td>Min/Max</td>
                  {infoWeather.map((day, i) => (
                    <td key={"temp" + i}>
                      {day.temp[0].min.value.toFixed(0)}° -{" "}
                      {day.temp[1].max.value.toFixed(0)}°
                    </td>
                  ))}
                </tr>
                <tr className="dataRow">
                  <td>Rain (%)</td>
                  {infoWeather.map((day, i) => (
                    <td key={"rain" + i}>
                      {day.precipitation_probability.value}%
                    </td>
                  ))}
                </tr>
                <tr className="dataRow">
                  <td>Rain (in.)</td>
                  {infoWeather.map((day, i) => (
                    <td key={"rain_amount" + i}>
                      {day.precipitation[0].max.value}in.
                    </td>
                  ))}
                </tr>
                <tr>
                  <td></td>
                  <td colSpan={infoWeather.length} style={{ fontSize: "7px" }}>
                    Icons made by{" "}
                    <a
                      href="https://www.flaticon.com/authors/freepik"
                      target="_blank"
                      rel="noreferrer"
                      title="Freepik"
                    >
                      Freepik
                    </a>{" "}
                    from{" "}
                    <a
                      href="https://www.flaticon.com/"
                      target="_blank"
                      rel="noreferrer"
                      title="Flaticon"
                    >
                      www.flaticon.com
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </InfoWindowEx>
  );
};

/**
 * InfoWindowEx – a custom class wrapper that renders children to
 * a contentElement and sets it in the standard <InfoWindow> from @react-google-maps/api.
 */
class InfoWindowEx extends React.Component {
  constructor(props) {
    super(props);
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement("div");
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(this.props.children),
        this.contentElement
      );
    }
  }

  render() {
    // The new library exports InfoWindow from @react-google-maps/api
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

export default MapCrewInfoWindow;

const useStyles = makeStyles((theme) => ({
    infoWindow: {
      backgroundColor: "#000",
    },
    weather_div: {
      backgroundColor: "#f3f3f3",
      boxShadow:
        "inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)",
    },
    markerInfo: {
      minWidth: "260px",
      color: "#293a5a",
      display: "block",
      padding: 0,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "sans-serif",
    },
    markerSubInfo: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "start",
    },
    markerSubInfoDiv: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "start",
    },
    markerSubInfoLabel: {
      color: "#555",
      flexBasis: "35%",
      paddingRight: "10px",
      textAlign: "right",
    },
    markerSubInfoValue: {
      color: "#000",
      flexBasis: "65%",
      paddingLeft: "10px",
      textAlign: "left",
      maxWidth: "300px",
    },
    buttonContainer: {
      width: "100%",
      display: "flex",
      padding: "5px",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "start",
    },
    weather_table: {
      fontSize: "10px",
      padding: "6px 14px",
      border: "1px solid #b9b9b9",
      "&& td": {
        padding: "5px",
      },
      "&& .dataRow td": {
        borderRight: "1px solid #b5b5b5",
      },
    },
    weatherInfoButtonActive: {
      textTransform: "uppercase",
      color: "#00ff00",
      "&: hover": {
        color: "#00dd00",
      },
    },
    weatherInfoButtonInactive: {
      textTransform: "uppercase",
      color: "#444",
    },
    infoButton: {
      display: "block",
      margin: "5px",
      color: "rgba(0, 0, 0, 0.87)",
      backgroundColor: "#e1e3f8",
      padding: "0px 16px",
      fontSize: "0.575rem",
      minWidth: "64px",
      boxSizing: "border-box",
      transition:
        "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
      fontFamily: "Roboto, Helvetica,Arial, sans-serif",
      fontWeight: "500",
      lineHeight: "1.75",
      borderRadius: "4px",
      letterSpacing: "0.02857em",
    },
    multipleMarkersDiv: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fdd4d4",
      borderRadius: "6px",
      border: "1px solid #c1c1c1",
      margin: "3% 1%",
    },
    multiMarkerButton: {
      border: "1px solid #444",
      fontSize: "10px",
      padding: "1%",
      margin: "2% 1%",
      backgroundColor: "#e8e8e8",
      "&:hover": {
        backgroundColor: "#cccccc",
      },
    },
    multiMarkerLabelDiv: {
      margin: "2%",
    },
    clickableWOnumber: {
      cursor: "pointer",
      textDecoration: "underline",
      "&:hover": {
        color: "#ee3344",
      },
    },
    inputRoot: {
      backgroundColor: "#f5fdff",
      padding: "2px 2px",
      fontSize: 12,
    },
  }));