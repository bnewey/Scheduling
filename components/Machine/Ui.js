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
const UiTableWithStyles = ({rows}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      padding: '30px',
      fontSize: '25px',   
    },
    paper_machine_0: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/sm_grey_box.png)`,
      height: '288px',
      width: '200px',
    },
    Label:{
      fontSize: '20px',
      
    },
    paper_machine_1: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/sm_light_blue.png)`,
      height: '288px',
      width: '200px'
      
    },
    paper_machine_2: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/green_tank.png)`,
      height: '288px',
      width: '144px'
      
    },
    paper_machine_3: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/big_grey_tank.png)`,
      height: '288px',
      width: '144px'
      
    },
    paper_machine_4: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/big_grey_tank.png)`,
      height: '288px',
      width: '144px'
      
    },
    paper_machine_5: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/big_grey_tank.png)`,
      height: '288px',
      width: '144px'
      
    },
    paper_machine_6: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/generator_grey.png)`,
      height: '288px',
      width: '200px'
      
    },
    paper_machine_7: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '110px 15px 94px 15px',backgroundImage : `url(/static/sm_green_tank.png)`,
      height: '288px',
      width: '144px'
      
    },
    machine_0: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '216px',
      textAlign: 'center'
    },
    machine_1: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '216px',
      textAlign: 'center'
    },
    machine_2: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '165px',
      textAlign: 'center'
    },
    machine_3: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '165px',
      textAlign: 'center'
    },
    machine_4: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '165px',
      textAlign: 'center'
    },
    machine_5: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '165px',
      textAlign: 'center'
    },
    machine_6: {
      margin: '1.5% .5% 1.5% .5%',
      minWidth: '216px',
      textAlign: 'center'
    },
    machine_7: {
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

  /*{machines.map(row => (
          <Grid item xs={1} className={row.id}>
          <label className="label">{row.name}</label>
            <Paper className={classes.paper}><span>{row.temp}&#176;</span><br/><span>{row.pressure}</span></Paper>
          </Grid>
        ))}*/

  const machines = rows;
  return (
    <div className={mergeClasses.root}>


      <style jsx>{`
          .{mergeClasses.root} {  margin: 2% 2% 3% 2%; }
      
          .{machine_1}
      `}</style>


      <Grid container spacing={2}>
  
        <Grid item xs={1} className={classes.machine_0}>          
            <Paper className={classes.paper_machine_0}><span className={classes.sm_box}>{rows[0].temp}&#176;</span>
            <br/><span className={classes.sm_box}>{rows[0].pressure}</span></Paper> <br/><label className={classes.Label}>{rows[0].name}</label>
            <div className={classes.SplitButtonWrapper}>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_1}>          
            <Paper className={classes.paper_machine_1}><span className={classes.sm_box}>{rows[1].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[1].pressure}</span></Paper>
            <br/><label className={classes.Label}>{rows[1].name}</label>
            <div>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_2}>         
          <Paper className={classes.paper_machine_2}><span className={classes.sm_box}>{rows[2].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[2].pressure}</span></Paper>
          <br/> <label className={classes.Label}>{rows[2].name}</label>
          <div>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_3}>          
          <Paper className={classes.paper_machine_3}><span className={classes.sm_box}>{rows[3].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[3].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[3].name}</label>
          <div>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_4}>          
          <Paper className={classes.paper_machine_4}><span className={classes.sm_box}>{rows[4].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[4].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[4].name}</label>
          <div>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_5}>          
          <Paper className={classes.paper_machine_5}><span className={classes.sm_box}>{rows[5].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[5].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[5].name}</label>
          <div>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_6}>
          <Paper className={classes.paper_machine_6}><span className={classes.sm_box}>{rows[6].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[6].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[6].name}</label>
          <div>
             <SplitButton/>
            </div>
        </Grid>
        <Grid item xs={1} className={classes.machine_7}>
          <Paper className={classes.paper_machine_7}><span className={classes.sm_box}>{rows[7].temp}&#176;</span><br/><span className={classes.sm_box}>{rows[7].pressure}</span></Paper>
          <br/><label className={classes.Label}>{rows[7].name}</label>
          <div>
             <SplitButton/>
            </div>
        </Grid>
      </Grid>


    </div>
  )
}

export default class Ui extends React.Component {
    
    _isMounted = false;

    constructor(props){
      super(props);
      this.state = {
        rows: "",
        endpoint: "10.0.0.109:4000"
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

      return (
        <div><h1>Machine list</h1> {rows  ?  <div><UiTableWithStyles rows={rows}/></div> : <div ><CircularProgress /></div>} </div>
      );
    }
}