import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        margin: 'inherit',
        color: '#535353'
    },
    items:{
        color: '#fcfcfc'
    }
  }));

const MapSiderbarMissingMakers = (props) =>{
    const classes = useStyles();

    const {noMarkerRows} = props;

    return(
        <div className={classes.root}>            
            {noMarkerRows.map((row) => (
            <p key={row.t_id}>
                {row.t_id} | {row.t_name} | {row.priority_order}
            </p>))}
        </div>
    );

}
export default MapSiderbarMissingMakers;