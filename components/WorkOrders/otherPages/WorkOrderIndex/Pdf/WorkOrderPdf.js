import React, {useRef, useState, useEffect} from 'react';
import { makeStyles, CircularProgress, Button, FormHelperText, FormControl, InputLabel, Select, MenuItem, Paper } from '@material-ui/core';

import { Document, Page, pdfjs, Text, Image, View, StyleSheet,
  createElement, pdf, PDFRenderer} from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = '../../../../static/pdf.worker.js';
import blobStream from 'blob-stream';
import Pdf from '../../../../../js/Pdf';

//we can make this a functional component now
const WorkOrderPdf = function(props) {
      
    const {rows, setRows, pdfRows, setPdfRows} = props;

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderBy, setOrderBy] = useState("date");
    const [ascending, setAscending ] = useState(false);

    const [pdfurl, setUrl] = useState(null);

    const handleOrderByChange = event => {
      setOrderBy(event.target.value);
    };

    const handleAscDescChange = event =>{
      setAscending(event.target.value);
    }

    const handleNextPage = () =>{
      setPageNumber(pageNumber + 1);
    }

    const handlePrevPage = () =>{
      setPageNumber(pageNumber - 1);
    }

    const classes = useStyles();
      


    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    }

    const createAndDownloadPdf = (event) => {
            setLoading(true);
            setLoaded(false);

            //Reorder
            var temp = [...pdfRows];
            switch(orderBy) {
              case "wo_record_id":
                temp.sort((a,b) => ascending ? a[orderBy]-b[orderBy] : b[orderBy]-a[orderBy]);
                break;
              case "completed":
              case "invoiced":
                if(ascending){
                temp.sort((a,b)=> { 
                    if(a[orderBy]>b[orderBy]) 
                     return 1;
                    else
                     return -1; });
                }
                if(!ascending){
                  temp.sort((a,b)=> { 
                      if(a[orderBy]<b[orderBy]) 
                       return 1;
                      else
                       return -1; });
                  }
              break;
              case "date":
                temp.sort((a,b) => ascending ? new Date(a[orderBy]) - new Date(b[orderBy]) : new Date(b[orderBy])- new Date(a[orderBy]));
              break;
              default:
                temp.sort((a,b) => a[orderBy]-b[orderBy]);
            }
            
            const modifiedTemp = temp.map(row => {
              if (row.description) {
                  row.descriptionLines = row.description.split(',').map(line => line.trim());
                }
                return row;
            });

            Pdf.createPackingSlipPdf({},modifiedTemp)//createWOPdf(temp)
            .then( (data) => {
                setLoaded(true);
                setLoading(false);
                setUrl(data);

                var file = new Blob([data], {type: 'application/pdf'});
                var fileURL = URL.createObjectURL(file);
                window.open(fileURL);
                
            })
            .catch( error => {
              console.warn(error);
            })
            
    }

    const goToPdfLink = (event)=>{

    }


  
      
    return (
    <React.Fragment>
      <Paper className={classes.paper}>
        <div className={classes.textContainer}><p className={classes.text}>{pdfRows.length} Work Order(s) Selected</p></div>
        <FormControl className={classes.formControl}>
        <InputLabel id="order-by-select-label">Order By:</InputLabel>
          <Select
            labelId="order-by-select-label"
            id="order-by-select"
            value={orderBy}
            onChange={handleOrderByChange}
            className={classes.select}
          >
            <MenuItem value={'wo_record_id'}>Work Order #</MenuItem>
            <MenuItem value={'date'}>Date</MenuItem>
            <MenuItem value={'completed'}>Completed</MenuItem>
            <MenuItem value={'invoiced'}>Invoiced</MenuItem>
          </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
        <InputLabel id="ascdesc-select-label">Order By:</InputLabel>
          <Select
            labelId="ascdesc-select-label"
            id="ascdesc-select"
            value={ascending}
            onChange={handleAscDescChange}
            className={classes.select}
          >
            <MenuItem value={false}>Descending</MenuItem>
            <MenuItem value={true}>Ascending</MenuItem>
          </Select>
          </FormControl>
        <Button
            className={classes.pdfButton}
            variant="contained"
            color="primary"
            size="medium"
            onClick={event => createAndDownloadPdf(event)}>
            Click to Create PDF
        </Button>
        {loaded? 
          <Button
          className={classes.pdfOpenButton}
            variant="contained"
            color="secondary"
            size="medium"
            href={"./static/work_orders.pdf"}
            target="_blank">
            SAVE/PRINT PDF
            </Button>
        :<></>
        }
        </Paper>
        {loaded ? 
        <div className={classes.container}>
          <div className={classes.document}>
          <Document
            
            file={pdfurl}//"/static/work_orders.pdf"
            onLoadSuccess={ onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
          </Document>
          <div className={classes.documentControls}>
          <p style={{display:'inline'}}>Page {pageNumber} of {numPages}</p>
          { pageNumber != 1 ? <Button onClick={handlePrevPage}
                color="secondary">
                   Prev Page</Button> : <></>}
          {pageNumber != numPages ? <Button onClick={handleNextPage}
                color="secondary">
                   Next Page</Button> : <></>}
          </div>
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
    margin: theme.spacing(1),
    marginTop: '24px',
    marginLeft: '100px',
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
    padding: '.5% 2% .5% 2%',
    backgroundColor: '#b7c3cd',
    marginBottom: '1%'
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
    backgroundColor: '#646464',
    padding: '15px 8px',
    borderRadius: '4px',
    color: '#fff'
  },
  document:{
    marginLeft: '25%',
  },
  documentControls:{
    margin: '5px',
    marginLeft: '46%',

  }
}));