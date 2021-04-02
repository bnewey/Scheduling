import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';



import cogoToast from 'cogo-toast';


import Util from  '../../../js/Util';
import { ListContext } from '../EntitiesContainer';


const EntityList = function(props) {
  const {user} = props;

  const { entities, setEntities,
    currentView, previousView, handleSetView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
    editWOModalOpen, setEditWOModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, setRecentEntities} = useContext(ListContext);
  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(null);



  useEffect(()=>{
    setPage(0);
  },[entities])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  //Save and/or Fetch rowsPerPage to local storage
  useEffect(() => {
    if(rowsPerPage == null){
      var tmp = window.localStorage.getItem('rowsPerPage');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(!isNaN(tmpParsed) && tmpParsed != null){
        setRowsPerPage(tmpParsed);
      }else{
        setRowsPerPage(25);
      }
    }
    if(!isNaN(rowsPerPage) && rowsPerPage != null){
      window.localStorage.setItem('rowsPerPage', JSON.stringify(rowsPerPage));
    }
    
  }, [rowsPerPage]);

  const handleShowDetailView = (entitiy_id) =>{
    if(!entitiy_id){
      cogoToast.error("Failed to get work order");
      console.error("Bad id");
      return;
    }
    handleSetView(views && views.find((view, i)=> view.value == "entityDetail"));
    setDetailEntityId(entitiy_id);

  }
  
  const columns = [
    { id: 'record_id', label: 'Id', minWidth: 20, align: 'center',
      format: (value, row)=> <span onClick={()=>handleShowDetailView(value)} className={classes.clickableWOnumber}>{value}</span> },
    {
      id: 'name',
      label: 'Name',
      minWidth: 250,
      align: 'left',
      format: (value, row)=> <span onClick={()=>handleShowDetailView(row.record_id)} className={classes.clickableWOnumber}>{value}</span> 
    },
    { id: 'city', label: 'City', minWidth: 45, align: 'left' },
    { id: 'county_or_parish', label: 'County or Parish', minWidth: 100, align: 'left' },
    { id: 'state', label: 'State', minWidth: 35, align: 'left' },
  ];

  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: "#e8e8e8",
        '&:hover':{
          backgroundColor: "#dcdcdc",
        }
      },
      '&:nth-of-type(even)': {
        backgroundColor: '#f7f7f7',
        '&:hover':{
          backgroundColor: "#dcdcdc",
        }
      },
      border: '1px solid #111 !important',
      '&:first-child':{
        border: '2px solid #992222',
      }
    },
  }))(TableRow);

  return (
    <div className={classes.root}>
        <TableContainer className={classes.container}>
        <Table stickyHeader  size="small" aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                className={classes.tableCellHead}
                classes={{stickyHeader: classes.stickyHeader}}
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {entities && entities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id} >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell className={classes.tableCell} 
                                key={`${column.id}${row.id}`}
                                 align={column.align}
                                 style={{ minWidth: column.minWidth }}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={entities ? entities.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
}

export default EntityList



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
    width: '70%',
    marginLeft: '1%',
  },
  container: {
    maxHeight: 650,
  },
  stickyHeader:{
    // background: 'linear-gradient(0deg, #a4dbe6, #cbf1f9)',
    fontWeight: '600',
    fontFamily: 'sans-serif',
    fontSize: '15px',
    color: '#1b1b1b',
    backgroundColor: '#fff',
    zIndex: '1',
    
  },
  tableCell:{
    borderRight: '1px solid #c7c7c7' ,
    '&:last-child' :{
      borderRight: 'none' ,
    },
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '150px',
    textOverflow: 'ellipsis',
    padding: "4px 6px",
  },
  tableCellHead:{
    
  },
  clickableWOnumber:{
    cursor: 'pointer',
    color: '#385595',
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
}));