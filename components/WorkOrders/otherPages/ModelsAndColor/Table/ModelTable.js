import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import EditScoreboardParams from '../Editor/ColumnEditor';
import {ParamContext} from "../ModelContainer"

import cogoToast from 'cogo-toast';

const ModelTable = () => {
    const { models } = React.useContext(ParamContext);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(null);

    const [dialogOpen, setDialogOpen]= React.useState(false);

    const [itemProperty, setItemProperty] = React.useState(null);
    const [itemColumn, setItemColumn] = React.useState('model');

    const classes = useStyles();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

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

      const handleDialogOpen = (edit_value) => {
        setDialogOpen(true);
        setItemProperty(edit_value);
        setItemColumn("model");
    };

    const columns = [
        {id: 'model', label: 'Model Name', minWidth: 20, maxWidth: 150, align: 'left',
        format: (value)=> <span onClick={()=>handleDialogOpen(value)} className={classes.clickableWOnumber}>{value}</span> }
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

    useEffect(() => {
        if(models !== null){
            models.sort()
        }
    })

    return (
        <div className={classes.root}>
            <EditScoreboardParams dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} itemProperty={itemProperty} setItemProperty={setItemProperty} itemColumn={itemColumn} setItemColumn={setItemColumn}  />
            <TableContainer className={classes.container} style ={{overflowY: 'auto'}}>
            <Table stickyHeader  size="small" aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                    className={classes.tableCellHead}
                    classes={{stickyHeader: classes.stickyHeader}}
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {models && models.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  return (
                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code} >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell className={classes.tableCell} 
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}>
                            {column.format ? column.format(value) : value}
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
            count={models ? models.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </div>
      );
};

export default ModelTable;

const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #339933',
      padding: '1%',
      [theme.breakpoints.down('sm')]: {
          //minHeight: '700px',
      },
      [theme.breakpoints.up('md')]: {
          minHeight: '730px',
      },
      
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
      },
    },
    prevWOnumber:{
      cursor: 'pointer',
      textDecoration: 'underline',
      color: 'purple',
      '&:hover':{
        color: '#9174B6',
      },
    },
  }));