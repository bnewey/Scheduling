import React, {useRef, useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {TableCell, TableHead, TableRow, TableSortLabel, Checkbox, Tooltip, Button} from '@material-ui/core';
import cogoToast from 'cogo-toast';

import EnhancedTableAddCreateTL from './EnhancedTableAddCreateTL';


const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)


const headCells = [
    { id: 't_id', numeric: true, disablePadding: true, label: 'Task#' },
    { id: 'table_id', numeric: true, disablePadding: true, label: 'WO#' },
    { id: 'wo_date', numeric: true, disablePadding: true, label: 'Order Date' },
    { id: 't_name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'description', numeric: false, disablePadding: false, label: 'Desc' },
    { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
    { id: 'date_desired', numeric: true, disablePadding: false, label: 'Desired' },
    { id: 'date_completed', numeric: true, disablePadding: false, label: 'Completed' },
  ];


function EnhancedTableHead(props) {
    //PROPS
    const { classes, disabled, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, filteredRows, 
            setFilteredRows,filterConfig, setFilterConfig, selectedIds, taskListToMap, filterSelectedOnly, setFilterSelectedOnly, 
            filterScoreboardsAndSignsOnly, setFilterScoreboardsAndSignsOnly, tabValue} = props;
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };

    const filterUpdated = function(newData, filterConfiguration) {
      setFilteredRows(newData);
      setFilterConfig(filterConfiguration);
    } 

    const handleFilterSelectedOnly = (event)=>{
      cogoToast.info( !filterSelectedOnly ? "Filtered Out Unselected Tasks" : "Removed Filter - Unselected Tasks", {hideAfter: 4});
      setFilterSelectedOnly(!filterSelectedOnly);
    }

    const handleFilterScoreboardsAndSignsOnly = (event) =>{
      cogoToast.info( !filterScoreboardsAndSignsOnly ? "Filtering to Scoreboards and Signs Only" : "Removed Filter - Scoreboards and Signs", {hideAfter: 4});
      setFilterScoreboardsAndSignsOnly(!filterScoreboardsAndSignsOnly);
    }

  
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
                <p style={{display: "inline"}}>{selectedIds.length == 0 ? 'Select All' : 'Deselect All'}</p>
            </TableCell>
            <TableCell colSpan={2}>
              { numSelected > 0 ?
                <EnhancedTableAddCreateTL {...props}/>
                : <></>
              }
              </TableCell>
              <TableCell colSpan={2}>
              <Tooltip title="Click to show only selected tasks."
                             arrow={true} enterDelay={400} placement={'top'}
                              classes={{tooltip: classes.tooltip }}>
              <Button
                    onClick={event => handleFilterSelectedOnly(event)}
                    variant="text"
                    color="secondary"
                    size="medium"
                    className={filterSelectedOnly ? classes.filterButtonActive : classes.filterButton} >
                    Filter Selected Tasks
                </Button>
              </Tooltip>
              </TableCell>

              <TableCell colSpan={2}>
              <Tooltip title="Click to show only scoreboard and sign tasks."
                             arrow={true} enterDelay={400} placement={'top'}
                              classes={{tooltip: classes.tooltip }}>
              <Button
                    onClick={event => handleFilterScoreboardsAndSignsOnly(event)}
                    variant="text"
                    color="secondary"
                    size="medium"
                    className={filterScoreboardsAndSignsOnly ? classes.filterButtonActive : classes.filterButton} >
                    Scoreboards/Signs Only
                </Button>
              </Tooltip>
              </TableCell>

          </TableRow>
          { tabValue == 1 ?
          <TableFilter
            rows={filteredRows}
            onFilterUpdate={filterUpdated}
            initialFilters={filterConfig ? filterConfig : null}
            className={classes.tableFilter}
            >
          {headCells.map((headCell, i) => (
            <TableCell
              key={headCell.id}
              align={ 'center'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
              filterkey={headCell.id}
              className={classes.tableHead}

              alignleft={i != 0 ? "true" : "false"}
              
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
          : <></>}
        
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