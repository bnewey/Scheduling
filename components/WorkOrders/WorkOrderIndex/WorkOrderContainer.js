import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

import WorkOrderTable from '../WorkOrderIndex/Table/WorkOrderTable';
import WorkOrderPdf from '../WorkOrderIndex/Pdf/WorkOrderPdf';

import FullWidthTabs from './Tabs/FullWidthTabs';
import WorkOrders from '../../../js/Work_Orders';
import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';

const today = new Date();

//we can make this a functional component now
const WorkOrderContainer = function() {
      const [rows, setRows] = useState();
      const [rowDateRange, setDateRowRange] = useState({
        to: today,
        from: new Date(new Date().setDate(today.getDate()-180))
      });
      const [pdfRows, setPdfRows] = useState([]); //setMapRows gets called in children components
      const [filterConfig, setFilterConfig] = useState();
      const [selectedIds, setSelectedIds] = useState([]);

      const [tabValue, setTabValue] = React.useState(0);

      const [filterOutCompletedInvoiced, setFilterOutCompletedInvoiced] = useState(false);
      

      const classes = useStyles();
      
      useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(!rows || rows == [] && rowDateRange) {
          WorkOrders.getAllWorkOrders(rowDateRange)
          .then( (data) => setRows(data))
          .catch( error => {
            console.warn(error);
          })
          
        }
      
        return () => { //clean up
            if(rows){
                
            }
        }
      },[rows]);

      const changeDateRange = (to, from) =>{
        setDateRowRange({
          to: to ? new Date(to) : rowDateRange.to,
          from: from ? new Date(from) : rowDateRange.from
        })
        setRows(null);
      }

      

      return (
        <div className={classes.root}>
          <FullWidthTabs value={tabValue} setValue={setTabValue} >
          {rows  ?  
          <div>
            <WorkOrderTable 
              rows={rows} setRows={setRows}
              pdfRows={pdfRows}  setPdfRows={setPdfRows} 
              filterConfig={filterConfig} setFilterConfig={setFilterConfig}
              selectedIds={selectedIds} setSelectedIds={setSelectedIds}
              filterOutCompletedInvoiced={filterOutCompletedInvoiced} setFilterOutCompletedInvoiced={setFilterOutCompletedInvoiced}
              tabValue={tabValue} setTabValue={setTabValue}
              rowDateRange={rowDateRange} changeDateRange={changeDateRange}
              />
          </div> 
          : 
          <div>
            <CircularProgress style={{marginLeft: "47%"}}/>
          </div>
          } 
        <div style={{minHeight: '600px'}}>
         { <WorkOrderPdf 
              rows={rows} setRows={setRows}
              pdfRows={pdfRows} setPdfRows={setPdfRows} 
         /> }</div>
        </FullWidthTabs>
        </div>
        
        
      );
    
}

export default WorkOrderContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '25px 0px 0px 0px',
  },
}));