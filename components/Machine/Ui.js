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


const util = require('../../util/util')

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
      boxShadow: '-1px 10px 24px -5px rgba(0,0,0,0.003), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)',
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
    paper_machine_0: { 
      backgroundImage : `url(/static/sm_grey_box.png)`,
    },
    paper_machine_1: {
      backgroundImage : `url(/static/sm_light_blue.png)`      
    },
    paper_machine_2: {
      backgroundImage : `url(/static/green_tank.png)`
    },
    paper_machine_3: {
      backgroundImage : `url(/static/big_grey_tank.png)`
    },
    paper_machine_4: {
      backgroundImage : `url(/static/big_grey_tank.png)`      
    },
    paper_machine_5: {
      backgroundImage : `url(/static/big_grey_tank.png)`
    },
    paper_machine_6: {
      backgroundImage : `url(/static/generator_grey.png)`
    },
    paper_machine_7: {
      backgroundImage : `url(/static/sm_green_tank.png)`
      
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
    sm_box: {
      fontSize: '24px'
    },
    SplitButtonWrapper: {
      fontSize: '14px'
    }
  
  }));

  //only works inside a functional component
  const classes = useStyles();

  const machines = rows;

  return (
    <Paper classes={{root:classes.root}} className={classes.root}>
      
      <SplitButton endpoint={endpoint} name={"all_machines"} options={['Turn On All Machines', 'Turn Off All Machines', 'Restart All Machines']}/>
      <br/><hr/>
      <Grid container spacing={2}>
  
        <Grid item xs={1} className={classes.grid_machine_large}>          
            <Paper classes={{root:classes.machine}} className={[classes.paper_machine_0,classes.machine_type_1]}><span className={classes.sm_box}>{rows[0].temp}&#176;</span>
            <br/><span className={classes.sm_box}>{rows[0].pressure}</span></Paper> <br/><label className={classes.Label}>{rows[0].name}</label><hr/>
            <div className={classes.SplitButtonWrapper}>
             <SplitButton endpoint={endpoint} name={"air_compressor"} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_large}>          
            <Paper classes={{root:classes.machine}} className={[classes.paper_machine_1,classes.machine_type_1]}><span className={classes.sm_box}>{rows[1].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[1].pressure}</span></Paper>
            <br/><label className={classes.Label}>{rows[1].name}</label><hr/>
            <div>
             <SplitButton endpoint={endpoint} name={"air_dryer"} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_small}>         
          <Paper classes={{root:classes.machine}} className={[classes.paper_machine_2,classes.machine_type_2]}><span className={classes.sm_box}>{rows[2].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[2].pressure}</span></Paper>
          <br/> <label className={classes.Label}>{rows[2].name}</label><hr/>
          <div>
             <SplitButton endpoint={endpoint} name={"tank_1"} options={['Turn On', 'Turn Off', 'Restart']} />
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_small}>          
          <Paper classes={{root:classes.machine}} className={[classes.paper_machine_3,classes.machine_type_2]}><span className={classes.sm_box}>{rows[3].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[3].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[3].name}</label><hr/>
          <div>
             <SplitButton endpoint={endpoint} name={"tank1_3"} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_small}>          
          <Paper classes={{root:classes.machine}} className={[classes.paper_machine_4,classes.machine_type_2]}><span className={classes.sm_box}>{rows[4].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[4].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[4].name}</label><hr/>
          <div>
             <SplitButton endpoint={endpoint} name={"tank2_3"} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_small}>          
          <Paper classes={{root:classes.machine}} className={[classes.paper_machine_5,classes.machine_type_2]}><span className={classes.sm_box}>{rows[5].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[5].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[5].name}</label><hr/>
          <div>
             <SplitButton endpoint={endpoint} name={"tank3_3"} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_large}>
          <Paper classes={{root:classes.machine}} className={[classes.paper_machine_6,classes.machine_type_1]}><span className={classes.sm_box}>{rows[6].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[6].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[6].name}</label><hr/>
          <div>
             <SplitButton endpoint={endpoint} name={"generator"} options={['Turn On', 'Turn Off', 'Restart']}/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.grid_machine_small}>
          <Paper classes={{root:classes.machine}} className={[classes.paper_machine_7, classes.machine_type_2]}><span className={classes.sm_box}>{rows[7].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[7].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[7].name}</label><hr/>
          <div>
             <SplitButton endpoint={endpoint} name={"nitrogen_tank"} options={['Turn On', 'Turn Off', 'Restart']} />
            </div>
        </Grid>
      </Grid>


    </Paper>
  )
}

export default class Ui extends React.Component {
    
    _isMounted = false;

    constructor(props){
      super(props);
      this.state = {
        rows: "",
        endpoint: "10.0.0.109:8000"
      };
    }

    componentDidMount(){
      //_isMounted checks if the component is mounted before calling api to prevent memory leak
      this._isMounted = true;
      const { endpoint } = this.state;
      const socket = socketIOClient(endpoint);
      socket.on("FromC", async data => {
          if(this._isMounted) {
            var json = await JSON.parse(data);
            this.setState({ rows: json.machines });
          }
          
      }); 
    }

    componentWillUnmount(){
      this._isMounted = false;
    }

    render() {
      const  rows   = this.state.rows;
      const endpoint = this.state.endpoint;

      return (
        <div>{rows  ?  <div><UiTableWithStyles rows={rows} endpoint={endpoint}/></div> : <div ><CircularProgress style={{marginLeft: "47%"}}/></div>} </div>
      );
    }
}