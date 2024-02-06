import React, {useRef, useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {Paper, Switch, Table, TableBody, TableCell, TableRow, Checkbox, TableHead, TablePagination, FormControlLabel, Tooltip} from '@material-ui/core';
import PropTypes from 'prop-types';

import WorkOrderTableHead from './WorkOrderTableHead';
import WorkOrderTableToolbar from './WorkOrderTableToolbar';

const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)

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

function WorkOrderTable(props) {
    const classes = useStyles();
    const {rows, setRows, pdfRows, setPdfRows, filterConfig,setFilterConfig, selectedIds,setSelectedIds,
             filterOutCompletedInvoiced, setFilterOutCompletedInvoiced, tabValue, setTabValue, rowDateRange, changeDateRange} = props;
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('wo_record_id');
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(true);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const [filteredRows, setFilteredRows] = React.useState(rows);
    const [scrollPos, setScrollPos] = React.useState(0);
    

    const handleRequestSort = (event, property) => {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
    };


    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if( filteredRows && selectedIds.length == 0) {
            setPdfRows(filteredRows);
        }

        return () => { //clean up
            if(rows){
                
            }
        }
    },[filteredRows, selectedIds]);

    const handleSelectAllClick = event => {
        if (event.target.checked) {
          const newSelecteds = filteredRows ? filteredRows.map(n=>n.wo_record_id) : rows.map(n => n.wo_record_id);
          setSelectedIds(newSelecteds);
          return;
        }

        setSelectedIds([]);
      };


    const handleClick = (event, record_id) => {

        //TODO If user changes filter to exclude some already selected items, this breaks.
        const selectedIndex = selectedIds.indexOf(record_id);
        let newSelected = [];
        const row = filteredRows.filter((row, index)=> row.wo_record_id == record_id);
        if(row == []){
          error.log("No row found in filteredRows");
        }
  
        if (selectedIndex === -1) { //should add to selectedids and reset pdfRows if selectedids is empty
            newSelected = newSelected.concat(selectedIds, record_id);
            //check if selectedIds is empty
            if(selectedIds.length == 0){
                setPdfRows(row);
            }else{
                setPdfRows(pdfRows ? pdfRows.concat(row) : [row]);
            }
          
        } else if (selectedIndex === 0) {
          newSelected = newSelected.concat(selectedIds.slice(1));
          if(newSelected.length == 0){
            setPdfRows(filteredRows);
          }else{
            setPdfRows(pdfRows.slice(1));
          }
        } else if (selectedIndex === selectedIds.length - 1) {
          newSelected = newSelected.concat(selectedIds.slice(0, -1));
          if(newSelected.length == 0){
            setPdfRows(filteredRows);
          }else{
            setPdfRows(pdfRows.slice(0,-1));
          }
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(
            selectedIds.slice(0, selectedIndex),
            selectedIds.slice(selectedIndex + 1),
          );
          var tempArray = [];
          setPdfRows(
            tempArray.concat(
                pdfRows.slice(0,selectedIndex),
                pdfRows.slice(selectedIndex + 1),
            )
          );
        }
      
        setSelectedIds(newSelected);
  
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

    const isSelected = record_id => selectedIds.indexOf(record_id) !== -1;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, (filteredRows ? filteredRows.length : rows.length  ) - page * rowsPerPage);

    return (
        <div className={classes.root}>
        <Paper className={classes.paper}>
            <WorkOrderTableToolbar numSelected={selectedIds.length}  tabValue={tabValue} setTabValue={setTabValue} numPdfRows={pdfRows.length} />
            <Table
                className={classes.table}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
                aria-label="enhanced table"
            >
                <WorkOrderTableHead
                classes={classes}
                order={order}
                numSelected={selectedIds.length}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={ filteredRows ? filteredRows.length : rows.length}
                rows={filteredRows ? filteredRows : rows}
                setFilteredRows={setFilteredRows}
                filterConfig={filterConfig}
                setFilterConfig={setFilterConfig}
                filterOutCompletedInvoiced={filterOutCompletedInvoiced} setFilterOutCompletedInvoiced={setFilterOutCompletedInvoiced}
                rowDateRange={rowDateRange} changeDateRange={changeDateRange}
                />
                <Tooltip title="Click to Select. You can select multiple items."
                            arrow={true} enterDelay={700} placement={'bottom'} disableHoverListener={selectedIds.length == 0 ? false : true}
                            classes={{tooltip: classes.tooltip}}>
                <TableBody>
                {stableSort(filteredRows ? filteredRows : rows, getSorting(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                    const isItemSelected = isSelected(row.wo_record_id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                        
                        <TableRow
                        hover
                        onMouseUp={event => handleClick(event, row.wo_record_id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.wo_record_id}
                        className={isItemSelected ? classes.selectedRow : classes.nonSelectedRow}
                        >
                        
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                            {row.wo_record_id /*if you change t_id, change it above */}
                        </TableCell>
                        <TableCell align="right">{row.date}</TableCell>
                        <TableCell align="right">{row.wo_type}</TableCell>
                        <TableCell align="right">{row.a_name}</TableCell>
                        <TableCell align="right">{row.description}</TableCell>
                        <TableCell align="right">{row.completed }</TableCell>
                        <TableCell align="right">{row.invoiced}</TableCell>
                        </TableRow>
                        
                    );
                    })}
                {emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
                    </TableRow>
                )}
                </TableBody>
                </Tooltip>
            </Table>
        
            <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
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

export default WorkOrderTable;

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
      backgroundColor: '#abb7c9',
      '&:hover':{
        backgroundColor: 'rgb(142, 166, 201) !important'
      }
      
    },
    nonSelectedRow:{
      backgroundColor: '#ffffff',
      '&:hover':{
        backgroundColor: 'rgba(0, 0, 0, 0.07) !important'
      }
    },
    tableHead:{
        fontSize: 11,
        fontWeight: 600,
    },
    tableFilter: {
        margin: '50px',
    },
    tooltip:{
        fontSize: '18px',
        padding: '4px 5px',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,.60)'
    },
    filterButton:{
        margin: '0px 10px',
        backgroundColor: 'rgba(0,0,0,.30)',
        color: '#fff',
        '&&:hover':{
            backgroundColor: 'rgba(0,0,0,.40)',
            color: '#000',
        }
    },
    filterButtonActive:{
        margin: '0px 10px',
        backgroundColor: '#bdf0ff',
        color: '#000',
        border: '1px solid #173b7e',
        '&&:hover':{
            backgroundColor: '#97bec9',
            color: '#000',
        }
    },
    inlineErrorText:{
        color: '#cc1111',
        display: 'inline-block',
        fontWeight: '500',
        fontSize: '10px'
    },
    inlineHeadText:{
        color: '#444',
        display: 'inline-block',
        fontWeight: '600',
        fontSize: '13px'
    },
    inputField:{
        margin: '-4px 5px', 
        backgroundColor: '#fff',
        borderRadius: '2px',
        border: '1px solid #e88408'
    }
}));