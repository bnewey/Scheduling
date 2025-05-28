import React, {
  useRef,
  useState,
  useEffect,
  useContext,
} from 'react';

import {
  makeStyles,
  withStyles,
} from '@material-ui/core';

import { useRouter } from 'next/router';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import cogoToast from 'cogo-toast';

import { ListContext } from '../WOContainer';


const OrdersList = () => {
  const {
    workOrders,
    handleSetView,
    views,
    setDetailWOid,
  } = useContext(ListContext);

  const classes = useStyles();
  const router = useRouter();
  const scrollRef = useRef(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(null);

  const [filterCompleted, setFilterCompleted] = useState(false);
  const [filterInvoiced, setFilterInvoiced]  = useState(false);

  useEffect(() => {
    setPage(0);
  }, [filterCompleted, filterInvoiced]);

  const toggleCompleted = () => setFilterCompleted(p => !p);
  const toggleInvoiced  = () => setFilterInvoiced(p => !p);

  const filteredOrders = workOrders ? workOrders.filter(row => (
    (!filterCompleted || row.completed !== 'Completed') &&
    (!filterInvoiced  || row.invoiced  !== 'Invoiced')
  )) : [];

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const save    = () => localStorage.setItem('woTableScroll', node.scrollTop.toString());
    const restore = () => {
      const pos = localStorage.getItem('woTableScroll');
      if (pos) node.scrollTop = parseInt(pos, 10);
    };

    node.addEventListener('scroll', save);
    restore();
    return () => node.removeEventListener('scroll', save);
  }, [filteredOrders]);

  useEffect(() => {
    if (rowsPerPage === null) {
      const saved = JSON.parse(localStorage.getItem('rowsPerPage') || '25');
      setRowsPerPage(saved);
    } else {
      localStorage.setItem('rowsPerPage', JSON.stringify(rowsPerPage));
    }
  }, [rowsPerPage]);

  const [pastWOids, setPastWOids] = useState(() =>
    JSON.parse(localStorage.getItem('pastWOids') || '[]'),
  );

  const markVisited = (id) => {
    setPastWOids(prev => {
      const next = [...new Set([...prev, id])];
      localStorage.setItem('pastWOids', JSON.stringify(next));
      return next;
    });
  };

  const openDetail = (id) => {
    if (!id) {
      cogoToast.error('Failed to get work order');
      return;
    }
    markVisited(id);
    handleSetView(views.find(v => v.value === 'woDetail'));
    setDetailWOid(id);
  };

  const renderStatus = (val) =>
    val === 1 || val === 'Completed' || val === 'Invoiced' ? '✓' : null;


  const columns = [
    {
      id: 'wo_record_id', label: 'WO#', align: 'center', minWidth: 20, maxWidth: 120,
      format: (v) => (
        <span
          onClick={() => openDetail(v)}
          className={pastWOids.includes(v) ? classes.prevWOnumber : classes.clickableWOnumber}
        >
          {v}
        </span>
      ),
    },
    {
      id: 'completed', label: 'C', align: 'center', minWidth: 40, maxWidth: 50,
      format: renderStatus, clickable: true, toggle: toggleCompleted, active: filterCompleted,
    },
    {
      id: 'invoiced', label: 'I', align: 'center', minWidth: 40, maxWidth: 50,
      format: renderStatus, clickable: true, toggle: toggleInvoiced, active: filterInvoiced,
    },
    { id: 'date', label: 'Date', align: 'center', minWidth: 80 },
    { id: 'wo_type', label: 'Type', align: 'center', minWidth: 80, maxWidth: 160 },
    { id: 'c_name', label: 'Product Goes To', align: 'left', minWidth: 200, maxWidth: 260 },
    { id: 'customer_city', label: 'City', align: 'left', minWidth: 60 },
    { id: 'customer_state', label: 'State', align: 'left', minWidth: 40 },
    { id: 'description', label: 'Description', align: 'left', minWidth: 150, maxWidth: 260 },
    { id: 'job_reference', label: 'Job Reference', align: 'left', minWidth: 150, maxWidth: 260 },
    { id: 'a_name', label: 'Bill Goes To', align: 'left', minWidth: 200, maxWidth: 260 },
  ];

  const StyledTableRow = withStyles(() => ({
    root: {
      '&:nth-of-type(odd)':  { background: '#e8e8e8' },
      '&:nth-of-type(even)': { background: '#f7f7f7' },
      '&:hover':             { background: '#dcdcdc' },
      border: '1px solid #111 !important',
    },
  }))(TableRow);

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container} ref={scrollRef}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => {
                const cellClasses = [classes.tableCellHead];
                if (col.clickable) cellClasses.push(classes.headerClickable);
                if (col.active)    cellClasses.push(classes.headerClickableActive);

                // add spacing between C & I pills
                const styleExtra = idx === 1 ? { marginRight: 6 } : undefined;

                return (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    style={{ minWidth: col.minWidth, maxWidth: col.maxWidth, padding: 0, ...styleExtra }}
                    className={cellClasses.join(' ')}
                    onClick={col.clickable ? col.toggle : undefined}
                    title={col.clickable ? `${col.active ? 'Click to show' : 'Click to hide'} ${col.label === 'C' ? 'completed' : 'invoiced'}` : undefined}
                  >
                    <span className={classes.headerInner}>{col.label}</span>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredOrders.slice(page * (rowsPerPage || 25), page * (rowsPerPage || 25) + (rowsPerPage || 25)).map(row => (
              <StyledTableRow hover key={row.wo_record_id}>
                {columns.map(col => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    style={{ minWidth: col.minWidth, maxWidth: col.maxWidth }}
                    className={classes.tableCell}
                  >
                    {col.format ? col.format(row[col.id]) : row[col.id]}
                  </TableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage || 25}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />

      <div className={classes.filterNote}>
        Click <strong>C</strong> to {filterCompleted ? 'show' : 'hide'} completed,{' '}
        <strong>I</strong> to {filterInvoiced ? 'show' : 'hide'} invoiced
      </div>
    </div>
  );
};

export default OrdersList;


const useStyles = makeStyles(theme => ({
  /* Container shells */
  root: {
    padding: '1%',
    [theme.breakpoints.up('md')]: {
      minHeight: '730px',
    },
  },

  container: {
    maxHeight: 650,
  },

  /* Table headers */
  tableCellHead: {
    fontWeight: 600,
    fontFamily: 'sans-serif',
    fontSize: 15,
    color: '#1b1b1b',
    background: '#fff',
  },

  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    minHeight: 24,
  },

  headerClickable: {
    cursor: 'pointer',
    border: '1px solid #bdbdbd',
    borderRadius: 4,
    background: '#f5f5f5',
    transition: 'background-color 0.15s, box-shadow 0.15s',

    '&:hover': {
      background: '#e0e0e0',
      boxShadow: '0 0 3px rgba(0,0,0,0.25)',
    },
  },

  headerClickableActive: {
    border: '2px solid #4caf50',
    background: '#e8f5e9',
  },

  /* Table cells */
  tableCell: {
    borderRight: '1px solid #c7c7c7',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '4px 6px',

    '&:last-child': {
      borderRight: 'none',
    },
  },

  /* Work‑order number links */
  clickableWOnumber: {
    cursor: 'pointer',
    textDecoration: 'underline',

    '&:hover': {
      color: '#ee3344',
    },
  },

  prevWOnumber: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: 'purple',

    '&:hover': {
      color: '#9174B6',
    },
  },

  /* Footer text */
  filterNote: {
    fontSize: '0.85em',
    color: '#555',
    marginTop: 4,
  },
}));
