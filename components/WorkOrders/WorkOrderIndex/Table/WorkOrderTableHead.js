import React, {useRef, useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';


const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)


const headCells = [
    { id: 'wo_record_id', numeric: true, disablePadding: true, label: 'WO#' },
    { id: 'date', numeric: true, disablePadding: true, label: 'Date' },
    { id: 'wo_type', numeric: false, disablePadding: false, label: 'Type' },
    { id: 'a_name', numeric: false, disablePadding: false, label: 'Account' },
    { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
    { id: 'completed', numeric: false, disablePadding: true, label: 'Completed' },
    { id: 'invoiced', numeric: false, disablePadding: true, label: 'Invoiced' }
  ];


function WorkOrderTableHead(props) {
    //PROPS
    const { classes, order, orderBy, rowCount, onRequestSort, rows, setFilteredRows,numSelected,
         onSelectAllClick, filterConfig, setFilterConfig, filterOutCompletedInvoiced, setFilterOutCompletedInvoiced } = props;
    //STATE
    const [filteredData, setFilteredData] = React.useState(rows);
    
        
    
    
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };    

    const filterUpdated = function(newData, filterConfiguration) {
      setFilteredData(newData);
      setFilterConfig(filterConfiguration);
    } 

    const handleFilterOutCompletedInvoiced = (event) =>{
        setFilterOutCompletedInvoiced(!filterOutCompletedInvoiced);
    }

    useEffect(() =>{ //useEffect for inputText
      if(filteredData){
        if(filterOutCompletedInvoiced)
          setFilteredRows(filteredData.filter((row, i)=> !(row.completed === "Completed" && row.invoiced == "Invoiced")));
        else{
          setFilteredRows(filteredData);
        }
      }
    
      return () => { //clean up
          if(filteredData){
              
          }
      }
    },[filteredData, filterOutCompletedInvoiced]);



  
    return (
      <TableHead>
        <TableRow padding="checkbox">
          <TableCell colspan="1">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all' }}/>
              <p style={{display: "inline"}}>Select All</p>
          </TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell colspan="2">
            <Tooltip title="Click to filter out work orders that are both completed and invoiced."
                             arrow={true} enterDelay={400} placement={'top'}
                              classes={{tooltip: classes.tooltip }}>
              <Button
                    onClick={event => handleFilterOutCompletedInvoiced(event)}
                    variant="text"
                    color="secondary"
                    size="medium"
                    className={filterOutCompletedInvoiced ? classes.filterButtonActive : classes.filterButton} >
                    Filter Out Completed + Invoiced
                </Button>
              </Tooltip>
          </TableCell>
              
          </TableRow>
          <TableFilter
            rows={rows}
            onFilterUpdate={filterUpdated}
            initialFilters={filterConfig ? filterConfig : null}
            className={classes.tableFilter}>
          {headCells.map(headCell => (
            <TableCell
              key={headCell.id}
              align={ 'center'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
              filterkey={headCell.id}
              className={classes.tableHead}
              alignleft="true"
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={order}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <div className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </div>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          </TableFilter>
      </TableHead>
    );
  }
  
  WorkOrderTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };

  export default WorkOrderTableHead
