import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, CircularProgress, Button, FormHelperText, FormControl, InputLabel, Select, MenuItem, Paper } from '@material-ui/core';

import { Document, Page, pdfjs, Text, Image, View, StyleSheet,
  createElement, pdf, PDFRenderer} from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = '../../../../../static/pdf.worker.js';
import blobStream from 'blob-stream';

import { ListContext } from '../../../WOContainer';
import Pdf from '../../../../../js/Pdf';
import Work_Orders from '../../../../../js/Work_Orders';
import cogoToast from 'cogo-toast';

//we can make this a functional component now
const WorkOrderPdf = function(props) {
      
    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
        currentView, previousView, handleSetView, views, activeWorkOrder, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    const [pdfurl, setUrl] = useState(null);

    const classes = useStyles();

  
    
   
    useEffect(()=>{
        if(loading == true && loaded == false && activeWorkOrder && raineyUsers){
            Promise.all([Work_Orders.getAllWorkOrderSignArtItems(activeWorkOrder.wo_record_id), 
                Work_Orders.getWorkOrderByIdForPDF(activeWorkOrder.wo_record_id)])
            .then( values => {

                if(values[1][0] && values[0]){
                  
                }else{
                    console.error("NOT WORKING");
                }

                var adj_wo_object = {...values[1][0]};
            
                adj_wo_object.requestor_init = raineyUsers.filter((u)=> u.user_id == adj_wo_object.requestor)[0]?.initials;
                adj_wo_object.maker_init = raineyUsers.filter((u)=> u.user_id == adj_wo_object.maker)[0]?.initials;
                
                
                Pdf.createWorkOrderPdf(adj_wo_object,values[0])
                .then( (data) => {
                    setLoaded(true);
                    setLoading(false);
                    setUrl(data);
                    
                })
                .catch( error => {
                    console.error(error);
                    cogoToast.error("Failed to create pdf");
                })
            })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error getting wois`, {hideAfter: 4});
            })
        } 
    },[loading, loaded, activeWorkOrder, raineyUsers])
    
    const handleNextPage = () =>{
      setPageNumber(pageNumber + 1);
    }

    const handlePrevPage = () =>{
      setPageNumber(pageNumber - 1);
    }

      


    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    }

    const openPDFinNewTab = () =>{
        if(!pdfurl){
            return;
        }
        var file = new Blob([pdfurl], {type: 'application/pdf'});
        var fileURL = URL.createObjectURL(file);
        window.open(fileURL);
    }
  
      
    return (
    <React.Fragment>
      <Paper className={classes.paper}>
        {loaded? <>
          <Button
          className={classes.pdfOpenButton}
            variant="contained"
            color="secondary"
            onClick={()=>openPDFinNewTab()}
            size="medium">
            SAVE/PRINT PDF
            </Button>
            <div className={classes.documentControls}>
                <Button disabled={pageNumber == 1 } variant="contained" onClick={handlePrevPage}
                    className={classes.pageButton} >
                   Prev Page
                </Button> 
                <Button disabled={pageNumber >= numPages} variant="contained" onClick={handleNextPage}
                    className={classes.pageButton} >
                   Next Page
                </Button> 
                <div >Page {pageNumber} of {numPages}</div>
          </div>
          </>
        :<></>
        }
        </Paper>
        {loaded ? 
        <div className={classes.container}>
          <div className={classes.document}>
          <Document
            
            file={pdfurl}
            onLoadSuccess={ onDocumentLoadSuccess}>
                <Page width={500} pageNumber={pageNumber} />
          </Document>
          
         </div>
        </div>
        : <div className={classes.container}>{loading ? <CircularProgress style={{marginLeft: "47%"}}/>
              :
              <></>
              }</div>}
    </React.Fragment>
    );
    
}

export default WorkOrderPdf

const useStyles = makeStyles(theme => ({
  root:{
    margin: '25px 0px 0px 0px',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  pdfButton:{
    margin: theme.spacing(1),
    marginTop: '24px',
  },
  pdfOpenButton:{
    backgroundColor: '#f7f7f7',
    '&&:hover':{
      backgroundColor: 'rgba(0,0,0,.50)',
      color: '#fff',
    }
  },
  select: {
      backgroundColor: '#5e8dc5',
      padding: '2px 18px',
      color: '#fff',
      fontWeight: '600',
      fontSize: '14px'
  },  
  paper:{
    width: 'auto',
    backgroundColor: '#b7c3cd',
    display:'flex',
    flexDirection: 'row',
    justifyContent:'space-evenly',
    alignItems:'center',
    padding: '10px'
  },
  text:{
    color: '#414d59',
    fontSize: '16px',
    fontWeight: '400',
    margin: '0px 21px 0px 11px',
  },
  textContainer:{
    display: 'inline-block',
  },
  container:{
    [theme.breakpoints.down('sm')]: {
      overflow: 'scroll',
      paddingLeft: '250px',
    },
    
    backgroundColor: '#646464',
    padding: '15px 8px',
    borderRadius: '4px',
    color: '#fff',
    
  },
  document:{
    marginLeft: '0%',
    paddingBottom: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentControls:{
    display:'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center'
  },
  pageButton:{

  }
}));