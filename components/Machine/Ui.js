import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


import Grid from '@material-ui/core/Grid';
import { mergeClasses } from '@material-ui/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';
import { Z_BLOCK } from 'zlib';


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
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/green_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    paper_machine_1: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/green_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    paper_machine_2: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/green_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    paper_machine_3: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/sm_grey_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    paper_machine_4: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/sm_grey_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    paper_machine_5: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/sm_grey_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    paper_machine_6: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '15px 15px 15px 15px',backgroundImage : `url(/static/generator_grey.png)`,
      height: '288px',
      width: '200px',
      fontSize: '68px'
      
    },
    paper_machine_7: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',backgroundImage : `url(/static/sm_green_tank.png)`,
      height: '288px',
      width: '144px',
      fontSize: '68px'
      
    },
    machine_0: {
      margin: '1.5%'
    },
    machine_1: {
      margin: '1.5%'
    },
    machine_2: {
      margin: '1.5%'
    },
    machine_3: {
      margin: '1.5%'
    },
    machine_4: {
      margin: '1.5%'
    },
    machine_5: {
      margin: '1.5%'
    },
    machine_6: {
      margin: '1.5% 3.5% 1.5% 1.5%'
    },
    machine_7: {
      margin: '1.5%'
    }
  
  }));

  //only works inside a functional component
  const classes = useStyles();

  for(var i =0 ; i< 8;i++){
    console.log("Item name: "+rows[i].id);
    console.log("Item name: "+rows[i].temp);

  }
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
          .{label} {font-size: 16px;}
          .{machine_1}
      `}</style>


      <Grid container spacing={2}>
  
        <Grid item xs={1} className={classes.machine_0}>
          <label className="label">{rows[0].name}</label>
            <Paper className={classes.paper_machine_0}><span>{rows[0].temp}&#176;</span><br/><span>{rows[0].pressure}</span></Paper>
        </Grid>
        <Grid item xs={1} className={classes.machine_1}>
          <label className="label">{rows[1].name}</label>
            <Paper className={classes.paper_machine_1}><span>{rows[1].temp}&#176;</span><br/><span>{rows[1].pressure}</span></Paper>
          </Grid>
          <Grid item xs={1} className={classes.machine_2}>
          <label className="label">{rows[2].name}</label>
            <Paper className={classes.paper_machine_2}><span>{rows[2].temp}&#176;</span><br/><span>{rows[2].pressure}</span></Paper>
          </Grid>
          <Grid item xs={1} className={classes.machine_3}>
          <label className="label">{rows[3].name}</label>
            <Paper className={classes.paper_machine_3}><span>{rows[3].temp}&#176;</span><br/><span>{rows[3].pressure}</span></Paper>
          </Grid>
          <Grid item xs={1} className={classes.machine_4}>
          <label className="label">{rows[4].name}</label>
            <Paper className={classes.paper_machine_4}><span>{rows[4].temp}&#176;</span><br/><span>{rows[4].pressure}</span></Paper>
          </Grid>
          <Grid item xs={1} className={classes.machine_5}>
          <label className="label">{rows[5].name}</label>
            <Paper className={classes.paper_machine_5}><span>{rows[5].temp}&#176;</span><br/><span>{rows[5].pressure}</span></Paper>
          </Grid>
          <Grid item xs={1} className={classes.machine_6}>
          <label className="label">{rows[6].name}</label>
            <Paper className={classes.paper_machine_6}><span>{rows[6].temp}&#176;</span><br/><span>{rows[6].pressure}</span></Paper>
          </Grid>
          <Grid item xs={1} className={classes.machine_7}>
          <label className="label">{rows[7].name}</label>
            <Paper className={classes.paper_machine_7}><span>{rows[7].temp}&#176;</span><br/><span>{rows[7].pressure}</span></Paper>
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
        endpoint: "http://localhost:4000"
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