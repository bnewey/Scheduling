import React, {useRef, useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';


const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)


const headCells = [
    { id: 'work_order', numeric: false, disablePadding: true, label: 'WO#' },
    { id: 'date', numeric: false, disablePadding: true, label: 'Date' },
    { id: 'quantity', numeric: true, disablePadding: false, label: 'Quantity' },
    { id: 'description', numeric: true, disablePadding: false, label: 'Description' },
    { id: 'job_reference', numeric: true, disablePadding: false, label: 'Job Reference' },
    { id: 'e_name', numeric: false, disablePadding: true, label: 'Product Goes To' }
  ];


function ItemizationTableHead(props) {
    //PROPS
    const { classes, order, orderBy, rowCount, onRequestSort, rows, setFilteredRows,filterConfig, setFilterConfig } = props;
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
  
  ItemizationTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };

  export default ItemizationTableHead