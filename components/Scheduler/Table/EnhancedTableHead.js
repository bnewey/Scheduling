import React, {useRef, useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {TableCell, TableHead, TableRow, TableSortLabel, Checkbox} from '@material-ui/core';

import EnhancedTableAddCreateTL from './EnhancedTableAddCreateTL';


const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)


const headCells = [
    { id: 't_id', numeric: true, disablePadding: true, label: 'WO#' },
    { id: 'priority_order', numeric: true, disablePadding: true, label: 'Priority' },
    { id: 't_name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'description', numeric: false, disablePadding: false, label: 'Desc' },
    { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
    { id: 'date_assigned', numeric: true, disablePadding: true, label: 'Date Assigned' },
    { id: 'hours_estimate', numeric: true, disablePadding: false, label: 'Hours' },
    { id: 'users', numeric: false, disablePadding: false, label: 'Users' },
    { id: 'date_desired', numeric: true, disablePadding: false, label: 'Desired' },
    { id: 'date_completed', numeric: true, disablePadding: false, label: 'Completed' },
    { id: 'drilling', numeric: false, disablePadding: false, label: 'Drilling' },
    { id: 'sign', numeric: false, disablePadding: true, label: 'Sign' },
    { id: 'artwork', numeric: false, disablePadding: false, label: 'Artwork' },
  ];


function EnhancedTableHead(props) {
    //PROPS
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, rows, 
            setFilteredRows,filterConfig, setFilterConfig } = props;
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };


    //STATE
    const [filteredData, setFilteredData] = React.useState(rows);

    const filterUpdated = function(newData, filterConfiguration) {
      setFilteredData(newData);
      setFilterConfig(filterConfiguration);
    } 

    useEffect(() =>{ //useEffect for inputText
      if(filteredData){
        setFilteredRows(filteredData);
      }
    
      return () => { //clean up
          if(filteredData){
              
          }
      }
    },[filteredData]);




  
    return (
      <TableHead>
          <TableRow padding="checkbox">
            <TableCell colSpan={2}>
              <Checkbox
                color={"primary"}
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}/>
                <p style={{display: "inline"}}>Select All</p>
            </TableCell>
            <TableCell colSpan={11}>
              { numSelected > 0 ?
                <EnhancedTableAddCreateTL {...props}/>
                : <></>
              }
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
                ) : <></>}
              </TableSortLabel>
            </TableCell>
          ))}
          </TableFilter>
      </TableHead>
    );
  }
  
  EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };

  export default EnhancedTableHead