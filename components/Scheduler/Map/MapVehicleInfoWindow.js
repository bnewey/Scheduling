import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { makeStyles } from "@material-ui/core";
import { InfoWindow } from "@react-google-maps/api"; // <-- NEW IMPORT

import Util from "../../../js/Util";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function MapVehicleInfoWindow(props) {
  // PROPS
  const {
    activeMarker,
    setActiveMarker,
    showingInfoWindow,
    setShowingInfoWindow
  } = props;

  const classes = useStyles();

  // Side effect: (currently empty, but left for future expansions)
  useEffect(() => {
    // e.g. fetch extra data about the vehicle
  }, [activeMarker]);

  const handleInfoWindowClose = () => {
    setShowingInfoWindow(false);
  };

  return (
    <InfoWindowEx
      position={
        activeMarker?.item
          ? { lat: activeMarker.item.latitude, lng: activeMarker.item.longitude }
          : { lat: 0, lng: 0 }
      }
      open={showingInfoWindow}
      style={classes.infoWindow}
      onCloseClick={handleInfoWindowClose}
      // using window.google.maps to avoid references to the global 'google' object
      defaultOptions={{ pixelOffset: new window.google.maps.Size(0, -25) }}
      {...props}
    >
      {activeMarker?.item ? (
        <>
          <div className={classes.MarkerInfo}>
            {activeMarker.item.name}&nbsp;
            {activeMarker.item.active ? "Active" : "Inactive"}
          </div>
          <div className={classes.MarkerSubInfo}>
            {activeMarker.item.active && (
              <>
                Direction:&nbsp;
                {Util.getDirectionFromDegree(activeMarker.item.direction)}
              </>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </InfoWindowEx>
  );
}

export default MapVehicleInfoWindow;

/**
 * Custom InfoWindowEx that renders children into a <InfoWindow> from @react-google-maps/api
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
      // If needed, you could set content here:
      // this.infoWindowRef.current?.infoWindow?.setContent(this.contentElement);
    }
  }

  render() {
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

const useStyles = makeStyles((theme) => ({
  infoWindow: {
    backgroundColor: "#000",
  },
  weather_div: {
    backgroundColor: "#f3f3f3",
    boxShadow:
      "inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  MarkerInfo: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#16233b",
    backgroundColor: "#abb7c93d",
    padding: "2px",
  },
  MarkerSubInfo: {
    marginLeft: "5%",
    display: "block",
    fontSize: "11px",
    fontWeight: "400",
    color: "#666464",
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
    textTransform: "uppercase",
  },
  avatarContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: "2px 5px",
    padding: "10px 15px",
  },
  avatar: {
    width: "35px",
    height: "35px",
    position: "relative",
  },
  avatarItem: {
    margin: "1px 15px",
  },
}));

