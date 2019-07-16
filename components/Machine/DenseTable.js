import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import socketIOClient from 'socket.io-client'
const util = require('../../util/util')

//Necessary to use this function to allow the useStyles hook to work
const DenseTableWithStyles = ({rows}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: '70%',
    },
    paper: {
      marginTop: theme.spacing(3),
      width: '70%',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 650,
    },
  }));

  //only works inside a functional component
  const classes = useStyles();

  const machines = rows;

  return (
    <div className={classes.root}>
            <Paper className={classes.paper}>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Temperature F</TableCell>
                    <TableCell align="right">Pressure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {machines.map(row => (
                  <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.temp}</TableCell>
                  <TableCell align="right">{row.pressure}</TableCell>
                </TableRow>
                ))}
                </TableBody>
              </Table>
            </Paper>
          </div>
  )
}

export default class DenseTable extends React.Component {
    
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
        <h1>Machine list {rows  ?  <p><DenseTableWithStyles rows={rows}/></p> : <p>Loading...</p>} </h1>
      );
    }
}