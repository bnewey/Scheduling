import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


import Grid from '@material-ui/core/Grid';
import { mergeClasses } from '@material-ui/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';
import { Z_BLOCK } from 'zlib';

import SplitButton from './Buttons/SplitButton';
import { textAlign } from '@material-ui/system';

import { red } from '@material-ui/core/colors';
import ReconnectSnack from '../UI/ReconnectSnack';

const util = require('../../util/util');




//Necessary to use this function to allow the useStyles hook to work
const UiTableWithStyles = ({rows , endpoint}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: 'auto',
      padding: '2% 3% 4% 3%',
      backgroundColor: '#ffffff',
      boxShadow: '-11px 12px 6px -5px rgba(0,0,0,0.2), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)',
    },
    machine:{
      boxShadow: '0px 0px 15px 3px rgba(0,46,84,.13), 0px 0px 4px -2px rgba(0,0,0,0.14), 0px 0px 38px -18px rgba(0,0,0,0.12)',
      backgroundColor: '#fff',
      padding: '110px 15px 94px 15px',
      textAlign: 'center',
      color: theme.palette.text.primary
    },
    Label:{
      fontSize: '20px', 
    },
    machine_type_1: {
      height: '288px',
      width: '200px', 
    },
    machine_type_2: {
      height: '288px',
      width: '144px'
    },
    grid_container:{
      backgroundColor: '#e5efe994',
      borderRadius: '4px',
    },
    grid_machine_large: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '216px',
      textAlign: 'center'
    },
    grid_machine_small: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '165px',
      textAlign: 'center'
    },
    sm_box_red: {
      fontSize: '29px',
      color: '#c11f1f',
      fontWeight: 'bold'
    },
    sm_box_green: {
      fontSize: '29px',
      color: '#44b944',
      fontWeight: 'bold'
    },
    SplitButtonWrapper: {
      fontSize: '14px'
    }
  
  }));

  //only works inside a functional component
  const classes = useStyles();

  //Add in machine names and image url for css
  const machines = [
    "air_compressor", "air_dryer", "tank_1", "tank1_3", "tank2_3", "tank3_3", "generator", "nitrogen_tank"
  ];
  const images = [
    "url(/static/sm_grey_box.png)", "url(/static/sm_light_blue.png)", "url(/static/green_tank.png)", "url(/static/big_grey_tank.png)",
     "url(/static/big_grey_tank.png)", "url(/static/big_grey_tank.png)", "url(/static/generator_grey.png)", "url(/static/sm_green_tank.png)"
  ]

  const array = rows.map((item, i)=>{
    return ({ id: item.id, name: item.name, pressure: item.pressure, temp: item.temp, machine: machines[i], imageURL: images[i]});
  });

  return (
    <Paper classes={{root:classes.root}} className={classes.root}>
      
      <SplitButton endpoint={endpoint} name={"all_machines"} options={['Turn On All Machines', 'Turn Off All Machines', 'Restart All Machines']}/>
      <br/>
      <Grid justify="space-around" container spacing={2} className={classes.grid_container}>

      { array.map((row, i) => (
          <Grid item xs={1} className={ i == 0 || i==1 ||i==6 ? classes.grid_machine_large : classes.grid_machine_small }>          
            <Paper classes={{root:classes.machine}} className={  i == 0 || i==1 ||i==6 ? classes.machine_type_1 : classes.machine_type_2} style={{backgroundImage: `${row.imageURL}`}}>
            <span className={row.temp > 100 ? classes.sm_box_red : classes.sm_box_green}>{row.temp}&#176;</span>
            <br/><span className={row.pressure > 100 ? classes.sm_box_red : classes.sm_box_green}>{row.pressure}</span></Paper> 
            <br/><label className={classes.Label}>{row.name}</label><hr/>
            <div className={classes.SplitButtonWrapper}>
            <SplitButton endpoint={endpoint} name={row.machine} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
          </Grid>
      ))}
        
      </Grid>
    </Paper>
  )
}

class Ui extends React.Component {
    
  render() {
    const  {rows, endpoint, socket} = this.props;

    return (
      <div>{rows  ?  
        <div><UiTableWithStyles rows={rows} endpoint={endpoint}/></div> 
        : <div ><CircularProgress style={{marginLeft: "47%"}}/></div>
      } <ReconnectSnack socket={socket}/></div>
    );
  }
}

export default Ui;
