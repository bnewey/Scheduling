import React, {useState, useEffect} from "react";

import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import LinearProgress from '@material-ui/core/LinearProgress';

import socketIOClient from 'socket.io-client';

function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
}

export default function ReconnectSnack({socket}) {

    const [state, setState] = React.useState({
        open: false,
        Transition: SlideTransition,
        socket: socket,
        message: "",
      });

    const handleChange = (isRetrying, data) => {
        var msg = isRetrying ? "Reconnecting..." : !data ? "Connected, waiting for data..." : "";

        setState({
            ...state,
            open: !data, //keep open if not retrying to connect but no data
            message: msg,
        });
    };

    useEffect(() => { //useEffect for state
        if(socket){
            socket.on("Reconnect", params => {    
                if(params) {
                    handleChange(params.retrying, params.data);
                }        
            });         
        }
    },[state.socket,state.open]);

    const useStyles = makeStyles(theme => ({
        root: {
          width: '100%',
        }
      }));
    
    //only works inside a functional component
    const classes = useStyles();

    return(
        <div>
            <Snackbar color="primary"
                open={state.open} 
                TransitionComponent = {Slide}
                ContentProps={{
                    'aria-describedby': 'message-id'
                }}
                message={ <div >
                            <span id="message-id">{state.message}</span>
                            <LinearProgress />
                        </div>}
            />
        </div>
    );
}