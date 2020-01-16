import React, {useRef, useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ItemizationTableHead from './ItemizationTableHead';




const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)

const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
      '&& .MuiTableCell-paddingNone': {
        padding: '6px 24px 6px 16px',
      }
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    selectedRow:{
      backgroundColor: '#abb7c9'
      
    },
    nonSelectedRow:{
      backgroundColor: '#ffffff',
    },
    tableHead:{
      fontSize: 11,
      fontWeight: 600,
    },
    tableFilter: {
      margin: '50px',
    }
  }));

  function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }
  
  function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
  }
  
  function ItemizationTable(props) {
    const classes = useStyles();
    const {rows, filterConfig,setFilterConfig} = props;
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('record_id');
    const [selected, setSelected] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(true);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const [filteredRows, setFilteredRows] = React.useState(rows);

    const handleRequestSort = (event, property) => {
      const isDesc = orderBy === property && order === 'desc';
      setOrder(isDesc ? 'asc' : 'desc');
      setOrderBy(property);
    };

  
    // const handleSelectAllClick = event => {
    //   if (event.target.checked) {
    //     const newSelecteds = filteredRows ? filteredRows.map(n=>n.t_id) : rows.map(n => n.t_id);
    //     setSelectedIds(newSelecteds);
    //     return;
    //   }
    //   setSelectedIds([]);
    // };

    useEffect( () =>{ //useEffect for inputText
      //Gets data only on initial component mount
      if( rows) {

        
      }
    
      return () => { //clean up
          if(rows){
              
          }
      }
    },[rows]);


  
    const handleClick = (event, record_id) => {   
      setSelected(record_id);

    };
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = event => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const handleChangeDense = event => {
      setDense(event.target.checked);
    };
  
    const isSelected = record_id => selected === record_id;
  
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, (filteredRows ? filteredRows.length : rows.length  ) - page * rowsPerPage);
  
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
              aria-label="enhanced table"
            >
              <ItemizationTableHead
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={ filteredRows ? filteredRows.length : rows.length}
                rows={filteredRows ? filteredRows : rows}
                setFilteredRows={setFilteredRows}
                filterConfig={filterConfig}
                setFilterConfig={setFilterConfig}
              />
              <TableBody>
                {stableSort(filteredRows ? filteredRows : rows, getSorting(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.record_id);
                    const labelId = `enhanced-table-checkbox-${index}`;
  
                    return (
                      <TableRow
                        hover
                        onMouseUp={event => handleClick(event, row.record_id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.record_id}
                        className={isItemSelected ? classes.selectedRow : classes.nonSelectedRow}
                      >
                        
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                          {row.work_order /*if you change t_id, change it above */}
                        </TableCell>
                        <TableCell align="right">{row.date}</TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{row.description}</TableCell>
                        <TableCell align="right">{row.job_reference}</TableCell>
                        <TableCell align="right">{row.e_name}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
      
          <TablePagination
            rowsPerPageOptions={[15, 30, 50]}
            component="div"
            count={ filteredRows ? filteredRows.length : rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Paper>
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </div>
    );
  }

  export default ItemizationTable;