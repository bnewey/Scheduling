import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import Router from 'next/router'

import cogoToast from 'cogo-toast';


import Util from  '../../../../../js/Util';
import Entities from '../../../../../js/Entities';
import { ListContext } from '../../../EntitiesContainer';


const EntWOs = function(props) {
  const {user} = props;

  const { entities, setEntities,
    currentView, setCurrentView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
    editEntModalOpen, setEditEntModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, 
    setRecentEntities, entitiesRefetch, setEntitiesRefetch} = useContext(ListContext);
  const classes = useStyles();

  const [relatedWorkOrders, setRelatedWorkOrders] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);


  useEffect(()=>{
    if( relatedWorkOrders == null && detailEntityId){
        Entities.getEntRelatedWorkOrders(detailEntityId)
        .then((data)=>{
            if(data){
                setRelatedWorkOrders(data);
                setPage(0);
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to get work orders for entity");
            console.warn("detailEntityId maybe bad", detailEntityId)
            console.error("Failed to get work orders for entity", error);
        })
    }

  },[relatedWorkOrders, detailEntityId])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  const handleShowDetailView = (wo_id) =>{
    if(!wo_id){
      cogoToast.error("Failed to get work order");
      console.error("Bad id");
      return;
    }
    //set detailWOIid in local data
    window.localStorage.setItem('detailWOid', JSON.stringify(wo_id));
  
    //set detail view in local data
    window.localStorage.setItem('currentView', JSON.stringify("woDetail"));
 
    Router.push('/scheduling/work_orders')

  }
  
  const columns = [
    { id: 'wo_record_id', label: 'WO#', minWidth: 20, align: 'center',
      format: (value)=> <span onClick={()=>handleShowDetailView(value)} className={classes.clickableWOnumber}>{value}</span> },
    { id: 'date', label: 'Date', minWidth: 80, align: 'center' },
    { id: 'wo_type', label: 'Type', minWidth: 50, align: 'left',},
    { id: 'a_name', label: 'Bill Goes To', minWidth: 250, align: 'left' },
    { id: 'sa_city', label: 'City', minWidth: 45, align: 'left' },
    { id: 'sa_state', label: 'State', minWidth: 35, align: 'left' },
    { id: 'description', label: 'Description', minWidth: 400, align: 'left' },
    { id: 'c_name', label: 'Product Goes To', minWidth: 250, align: 'left'  },
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
        {relatedWorkOrders ? <><TableContainer className={classes.container}>
        
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
            { relatedWorkOrders?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code} >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell className={classes.tableCell} 
                                key={column.id}
                                 align={column.align}
                                 style={{ minWidth: column.minWidth }}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
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
        count={relatedWorkOrders ? relatedWorkOrders.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      /></>
      : <div className={classes.infoDiv}><span className={classes.infoSpan}>No Past Work Orders</span></div>}
    </div>
  );
}

export default EntWOs



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
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
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
  infoSpan:{
    fontSize: '20px'
  },
  infoDiv:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '-webkit-fill-available',
  }
}));