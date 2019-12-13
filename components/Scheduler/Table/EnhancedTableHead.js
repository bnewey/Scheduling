import React, {useRef, useState, useEffect} from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';

const headCells = [
    { id: 'record_id', numeric: false, disablePadding: true, label: 'Record' },
    { id: 'company', numeric: true, disablePadding: false, label: 'Company' },
    { id: 'date', numeric: true, disablePadding: false, label: 'Date' },
    { id: 'type', numeric: true, disablePadding: false, label: 'Type' },
    { id: 'date_entered', numeric: true, disablePadding: false, label: 'Date Entered' },
    { id: 'accound_id', numeric: false, disablePadding: true, label: 'Accound Id' },
    { id: 'organization', numeric: true, disablePadding: false, label: 'Organization' },
    { id: 'city', numeric: true, disablePadding: false, label: 'City' },
    { id: 'state', numeric: true, disablePadding: false, label: 'State' },
    { id: 'description', numeric: true, disablePadding: false, label: 'Description' },
    { id: 'job_reference', numeric: false, disablePadding: true, label: 'Job Reference' },
    { id: 'requested_arrival_date', numeric: true, disablePadding: false, label: 'Req Arrival Date' },
  ];


function EnhancedTableHead(props) {
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all desserts' }}
            />
          </TableCell>
          {headCells.map(headCell => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={order}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
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