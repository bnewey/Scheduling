import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import 'isomorphic-unfetch'



import socketIOClient from 'socket.io-client'
const util = require('../../util/util')

//Necessary to use this function to allow the useStyles hook to work
const DenseHistoryTableWithStyles = ({rows}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: 'auto',
      padding: '1% 3% 3% 3%'
    },
    paper: {
      marginTop: theme.spacing(3),
      width: 'auto',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
      maxWidth: '50%',
    },
    table: {
      minWidth: 'auto',
     
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
                    <TableCell align="right">Temperature F</TableCell>
                    <TableCell align="right">Pressure</TableCell>
                    <TableCell align="right">Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {machines.map(row => (
                  <TableRow key={row.id}>
                  <TableCell align="right">{row.temp}</TableCell>
                  <TableCell align="right">{row.pressure}</TableCell>
                  <TableCell align="right">{row.read_date}</TableCell>
                </TableRow>
                ))}
                </TableBody>
              </Table>
            </Paper>
          </div>
  )
}

//we can make this a functional component now
const DenseHistoryTable = function({name}) {
      const [rows, setRows] = useState();
      
      useEffect(() =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(!rows || rows == []) {
          async function getData(){
            try{
              var data = await fetch(`/api/history?`+name);
              var list = await data.json();
              setRows(list);
            }catch(err){
              console.log(err);
              
            }
          }
         getData();
        }
      
        return () => { //clean up
            if(rows){
                
            }
        }
      },[rows]);

      return (
        <div>{rows  ?  <div><DenseHistoryTableWithStyles rows={rows}/></div> : <div><CircularProgress style={{marginLeft: "47%"}}/></div>} </div>
      );
    
}

export default DenseHistoryTable