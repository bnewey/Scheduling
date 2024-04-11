import React, {useRef, useState, useEffect, createContext} from 'react';
import Settings from '../../../../js/Settings'

import ModelTable from './Table/ModelTable';
import ColorTable from './Table/ColorTable';
import DescTable from './Table/DescTable';

import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';

export const ParamContext = React.createContext(null);


const ModelContainer = ({ activeTab }) => {

    const [desc, setDesc] = React.useState(null);
    const [models, setModels] = React.useState(null);
    const [colors, setColors] = React.useState(null);

    const masterUpdater = (newData, param) => {
        switch(param){
            case 'model':
                setModels(newData);
                break;
            case 'description':
                setDesc(newData);
                break;
            case 'color':
                setColors(newData);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if(desc == null){
            Settings.getPastScoreboardParams("description")
            .then( data => {
                setDesc(data);
        }).catch( error => {
            console.warn(error);
            cogoToast.error(`Error getting tasks`, {hideAfter: 4});
        })  
    }}, [desc]);

    useEffect(() => {
        if(colors == null){
            Settings.getPastScoreboardParams("color")
            .then( data => {
                setColors(data);
        }).catch( error => {
            console.warn(error);
            cogoToast.error(`Error getting tasks`, {hideAfter: 4});
        })  
    }}, [colors]);

    useEffect(() => {
        if(models == null){
            Settings.getPastScoreboardParams("model")
            .then( data => {
                setModels(data);
        }).catch( error => {
            console.warn(error);
            cogoToast.error(`Error getting tasks`, {hideAfter: 4});
        })  
    }}, [models]);

    const getActiveTabComponent = (activeTab) => {
        switch (activeTab) {
          case 'model':
            return <ModelTable />;
          case 'color':
            return <ColorTable />;
          case 'description':
            return <DescTable />;
          default:
            return null;
        }
      };

  return (
    <div>
        <ParamContext.Provider value={{colors, setColors, desc, setDesc, models, setModels, masterUpdater} } >
        <Grid container>
            <Grid item xs={12}>
                {getActiveTabComponent(activeTab)}
            </Grid>
        </Grid>
        </ParamContext.Provider>
    </div>
  );
};

export default ModelContainer;
