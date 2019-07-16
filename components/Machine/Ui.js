import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';
import { mergeClasses } from '@material-ui/styles';

import socketIOClient from 'socket.io-client'
const util = require('../../util/util')

//Necessary to use this function to allow the useStyles hook to work
const UiTableWithStyles = ({rows}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      padding: '30px',
      
      
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      padding: '30px 15px 32px 15px',
    },
  
  }));

  //only works inside a functional component
  const classes = useStyles();

  //i do not now why this step is necessary. the arrays before and after seem to be identical but apparently they are not
  // i had to do the same in api/machines
  const machines = rows;

  return (
    <div className={mergeClasses.root}>
<style jsx>{`
     .{mergeClasses.root} {  margin: 2% 2% 3% 2%; }
 `}</style>
<Grid container spacing={3}>
 <Grid item xs={1}>
     <label>Air Compressor</label>
   <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
 </Grid>
 <Grid item xs={1}>
 <label>Air Dryer</label>
   <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
 </Grid>
 <Grid item xs={2}>
 <label>Tank 1</label>
   <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
 </Grid>
 <Grid item xs={3}>  
    <Grid container spacing={1}>
        <Grid item xs={4}>  
            <label>1</label>
            <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
        </Grid>
        <Grid item xs={4}>  
            <label>2</label>
            <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
        </Grid>
        <Grid item xs={4}>  
            <label>3</label>
            <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
        </Grid>
    </Grid>
 </Grid>  
 <Grid item xs={2}>
 <label>Random Box</label>
   <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
 </Grid>
 <Grid item xs={2}>
 <label>Nitrogen Tank</label>
   <Paper className={classes.paper}><span>75F</span><br/><span>75F</span></Paper>
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
        <h1>Machine list {rows  ?  <p><UiTableWithStyles rows={rows}/></p> : <p>Loading...</p>} </h1>
      );
    }
}