import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton} from '@material-ui/core';
import {useRouter} from 'next/router';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';




import cogoToast from 'cogo-toast';


import Util from  '../../../js/Util';
import { ListContext } from '../WOContainer';


const OrdersList = function(props) {
  const {user} = props;

  const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, 
    currentView, previousView, handleSetView, views, detailWOid,setDetailWOid} = useContext(ListContext);
  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(null);
  const scrollRef = React.useRef(null);
  const router = useRouter();
  const [pastWOids, setPastWOids] = useState(() => {
    const saved = localStorage.getItem('pastWOids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(()=>{
    setPage(0);
  },[workOrders]);

  useEffect(() => {
    // Log to check structure and values of workOrders
    console.log(workOrders);
  }, [workOrders]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const resetScrollPosition = () => {
    localStorage.removeItem('tableScrollPosition');
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const addWOPastSelection = (wo_id) => {
    setPastWOids((prev) => {
      const updated = [...new Set([...prev, wo_id])]; // Ensure uniqueness
      localStorage.setItem('pastWOids', JSON.stringify(updated)); // Save to localStorage
      return updated;
    });
  };

  //Resets past woids and scroll position
  useEffect(() => {
    const handleRouterChange = (url) => {
      if (!url.includes('/work-orders')) {
        resetScrollPosition();
        localStorage.removeItem('pastWOids');
      }
    };

    router.events.on('routeChangeStart', handleRouterChange);

    return () => {
      router.events.off('routeChangeStart', handleRouterChange);
    };
  }, [router.events, resetScrollPosition]);


  //Tracks scroll position
  useEffect( () => {

    const restoreScrollPosition = () => {
        const savedScrollPos = localStorage.getItem('tableScrollPosition');

        if (savedScrollPos && scrollRef.current) {
            scrollRef.current.scrollTop = parseInt(savedScrollPos, 10);
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollTop;
            localStorage.setItem('tableScrollPosition', scrollPosition.toString());
        }
    };

    const scrollableElement = scrollRef.current;
    if(scrollableElement) {
        scrollableElement.addEventListener('scroll', handleScroll);
        restoreScrollPosition();
    }

    if (workOrders && workOrders.length > 0) {
      restoreScrollPosition();
    }

    return () => {
        if(scrollableElement) {
            scrollableElement.removeEventListener('scroll', handleScroll);
        }
    };
}, [workOrders]);



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

  const handleShowDetailView = (wo_id) =>{
    if(!wo_id){
      cogoToast.error("Failed to get work order");
      console.error("Bad id");
      return;
    }

    addWOPastSelection(wo_id);
    handleSetView(views && views.filter((view, i)=> view.value == "woDetail")[0]);
    setDetailWOid(wo_id);

  }

  const renderStatus = (value) => {
    // Handle numeric values (0 or 1)
    if (typeof value === "number") {
      return value === 1 ? "✓" : null;
    }
    
    // Handle string values ("Completed" or "Invoiced")
    if (typeof value === "string") {
      return (value === "Completed" || value === "Invoiced") ? "✓" : null;
    }
    
    // Fallback for unexpected data types
    return null;
  };
  
  const columns = [
    { id: 'wo_record_id', label: 'WO#', minWidth: 20, maxWidth: 150, align: 'center',
      format: (value)=> {
        const prevSelected = pastWOids.includes(value);
        return (
          <span
            onClick={() => handleShowDetailView(value)}
            className={prevSelected ? classes.prevWOnumber : classes.clickableWOnumber}
          >
            {value}
          </span>
        )
      } },
    { id: "completed", label: 'C', maxWidth: 10, align: 'center',
    format: (value) => {
      return(
        renderStatus(value)
      )
    } },
    { id: "invoiced", label: 'I', maxWidth: 10, align: 'center',
    format: (value) => {
      return(
        renderStatus(value)
      )
    } },
    { id: 'date', label: 'Date', minWidth: 80, align: 'center' },
    {
      id: 'wo_type',
      label: 'Type',
      minWidth: 50,
      maxWidth: 150,
      align: 'center',
    },
    {
      id: 'c_name',
      label: 'Product Goes To',
      minWidth: 200,
      maxWidth: 300,
      align: 'left',
    },
    { id: 'customer_city', label: 'City', minWidth: 45, align: 'left' },
    { id: 'customer_state', label: 'State', minWidth: 35, align: 'left' },
    { id: 'description', label: 'Description', minWidth: 150, maxWidth: 250, align: 'left' },
    { id: 'job_reference', label: 'Job Reference', minWidth: 150, maxWidth: 250, align: 'left' },
    { id: 'a_name', label: 'Bill Goes To', minWidth: 200, maxWidth: 250, align: 'left' },
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
        <TableContainer className={classes.container} ref={scrollRef} style ={{overflowY: 'auto'}}>
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
            {workOrders && workOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
        count={workOrders ? workOrders.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
}

export default OrdersList



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