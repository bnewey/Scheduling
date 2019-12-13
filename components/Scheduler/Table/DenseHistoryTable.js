import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import EnhancedTable from './EnhancedTable';

import 'isomorphic-unfetch'


//we can make this a functional component now
const DenseHistoryTable = function() {
      const [rows, setRows] = useState();
      
      useEffect(() =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(!rows || rows == []) {
          async function getData(){
            try{
              var data = await fetch(`/api/history?`);
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
        <div>{rows  ?  <div><EnhancedTable rows={rows}/></div> : <div><CircularProgress style={{marginLeft: "47%"}}/></div>} </div>
        
        
      );
    
}

export default DenseHistoryTable