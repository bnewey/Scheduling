import React, {useRef, useState, useEffect, useContext} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {Paper, Switch, Table, TableBody, TableRow,TableCell, Checkbox, TableHead, TablePagination, 
        FormControlLabel, CircularProgress, Tooltip} from '@material-ui/core';
import PropTypes from 'prop-types';

import EnhancedTableHead from './EnhancedTableHead';
import EnhancedTableToolbar from './EnhancedTableToolbar';
import TaskModal from './TaskModal/TaskModal';
import cogoToast from 'cogo-toast';
import { TaskContext } from './TaskContainer';


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
  
  function EnhancedTable(props) {
    const classes = useStyles();

    const {rows,filterConfig,setFilterConfig} = props;
    const { mapRows, setMapRows, selectedIds, setSelectedIds, taskListToMap, setTaskListToMap} = useContext(TaskContext);

    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('date');
    //const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(true);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const [filteredRows, setFilteredRows] = React.useState(rows);
    const [modalOpen, setModalOpen] = React.useState(false);  
    const [modalTaskId, setModalTaskId] = React.useState();  


    useEffect( () =>{ //useEffect for inputText
      //Need to reset filteredRows if rows are refetched
      if(filteredRows) {
        setFilteredRows(rows);
      }
    
      return () => { //clean up
          if(filteredRows){
              
          }
      }
    },[ rows]);

    const handleRequestSort = (event, property) => {
      const isDesc = orderBy === property && order === 'desc';
      setOrder(isDesc ? 'asc' : 'desc');
      setOrderBy(property);
    };

  
    const handleSelectAllClick = event => {
      if (event.target.checked) {
        const newSelecteds = filteredRows ? filteredRows.map(n=>n.t_id) : rows.map(n => n.t_id);
        setSelectedIds(newSelecteds);
        setMapRows(filteredRows);
        return;
      }
      // if unchecked
      setMapRows([]);
      setSelectedIds([]);
    };


  
    const handleClick = (event, record_id) => {
      //Unset tasklist since were adding/removing from task list
      if(taskListToMap){
        setTaskListToMap(null);
        cogoToast.info(`Task List: ${taskListToMap.list_name} has been unmapped`)
      }

      //TODO If user changes filter to exclude some already selected items, this breaks?
      const selectedIndex = selectedIds.indexOf(record_id);
      let newSelected = [];
      const row = filteredRows.filter((row, index)=> row.t_id == record_id);
      if(row == []){
        error.log("No row found in filteredRows");
      }

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedIds, record_id);
        setMapRows(mapRows ? mapRows.concat(row) : [row]);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedIds.slice(1));
        setMapRows(mapRows.slice(1));
      } else if (selectedIndex === selectedIds.length - 1) {
        newSelected = newSelected.concat(selectedIds.slice(0, -1));
        setMapRows(mapRows.slice(0,-1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedIds.slice(0, selectedIndex),
          selectedIds.slice(selectedIndex + 1),
        );
        var tempArray = [];
        setMapRows(
          tempArray.concat(
            mapRows.slice(0,selectedIndex),
            mapRows.slice(selectedIndex + 1),
          )
        );
      }
    
      setSelectedIds(newSelected);

    };

    //Modal
    const handleRightClick = (event, id) => {
      setModalTaskId(id);
      setModalOpen(true);

      //Disable Default context menu
      event.preventDefault();
    };
    ////
  
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
  
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, (filteredRows ? filteredRows.length : rows ? rows.length : 0  ) - page * rowsPerPage);
  
    return (
      <div className={classes.root}>
         
        <Paper className={classes.paper}>
          <EnhancedTableToolbar numSelected={selectedIds.length} mapRowsLength={mapRows.length}/>
            <TaskModal modalOpen={modalOpen} setModalOpen={setModalOpen} 
                        modalTaskId={modalTaskId} setModalTaskId={setModalTaskId} />
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                classes={classes}
                numSelected={selectedIds.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={ filteredRows ? filteredRows.length : rows ? rows.length : 0}
                rows={filteredRows ? filteredRows : rows}
                setFilteredRows={setFilteredRows}
                filterConfig={filterConfig}
                setFilterConfig={setFilterConfig}
              />
              <Tooltip title="Click to Select. You can select multiple items. Right Click to Edit"
                            arrow={true} enterDelay={700} placement={'bottom'} disableHoverListener={selectedIds.length == 0 ? false : true}
                            classes={{tooltip: classes.tooltip }}>
            
              <TableBody>
              {rows ? <>
                {stableSort(filteredRows ? filteredRows : rows, getSorting(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.t_id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    
                    return (
                      <TableRow
                        hover
                        onMouseUp={event => handleClick(event, row.t_id)}
                        onContextMenu={event => handleRightClick(event, row.t_id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.t_id}
                        className={isItemSelected ? classes.selectedRow : classes.nonSelectedRow}
                      >
                        
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                          {row.t_id /*if you change t_id, change it above */}
                        </TableCell>
                        <TableCell align="right">{row.priority_order}</TableCell>
                        <TableCell align="right">{row.t_name}</TableCell>
                        <TableCell align="right">{row.description}</TableCell>
                        <TableCell align="right">{row.type}</TableCell>
                        <TableCell align="right">{row.date_assigned}</TableCell>
                        <TableCell align="right">{row.hours_estimate}</TableCell>
                        <TableCell align="right">{row.users}</TableCell>
                        <TableCell align="right">{row.date_desired}</TableCell>
                        <TableCell align="right">{row.date_completed}</TableCell>
                        <TableCell align="right">{row.drilling}</TableCell>
                        <TableCell align="right">{row.sign}</TableCell>
                        <TableCell align="right">{row.artwork}</TableCell>
                      </TableRow>
                    );
                  })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                    </>:
              <div>
                <CircularProgress/>
              </div>
            }
                </TableBody>
                
              </Tooltip>
            </Table>
      
          <TablePagination
            rowsPerPageOptions={[15, 30, 50]}
            component="div"
            count={ filteredRows ? filteredRows.length : rows ? rows.length : 0}
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

  export default EnhancedTable;

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
        backgroundColor: 'rgba(0,0,0,.50)'
    },
    borderButton:{
      border: '1px solid rgb(255, 237, 196)',
      '&:hover':{
        border: '',
        backgroundColor: '#ffedc4',
        color: '#d87b04'
      }
    }
    
  }));