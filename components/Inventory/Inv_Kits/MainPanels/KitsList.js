import React, {useRef, useState, useEffect, useLayoutEffect,useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, IconButton, TextField} from '@material-ui/core';

//import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { AutoSizer, Column, Table } from 'react-virtualized';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import {createSorter} from '../../../../js/Sort';
import InventoryKits from  '../../../../js/InventoryKits';
import _, {debounce} from 'lodash';

import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';

import cogoToast from 'cogo-toast';
import clsx from 'clsx';


import Util from  '../../../../js/Util';
import { ListContext } from '../InvKitsContainer';
import { InventoryContext } from '../../InventoryContainer';
import EditKitInvDialog from '../components/EditKitInvDialog';

const styles = (theme) => ({
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
});

export default function ReactVirtualizedTable() {

  const targetRef = React.useRef();
  const [dimensions, setDimensions] = useState({ width:1515, height: 700 });
  //Gets size of our list container so that we can size our virtual list appropriately
  useLayoutEffect(() => {
    if (targetRef.current) {
      
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight
      });
    }
  }, []);

  return (
      <VirtualizedTable  dimensions={dimensions} setDimensions={setDimensions} />
  );
}

const KitsList = function(props) {
  const {user, dimensions, rowHeight = 22, headerHeight = 30,} = props;

  const { kits, setKits, setKitsRefetch, currentView, setCurrentView, views,detailKitId , setDetailKitId, sorters, setSorters,
    setKitsSearchRefetch, } = useContext(ListContext);

  const {editInvModalOpen, setEditInvModalOpen} = useContext(InventoryContext);
  
  const classes = useStyles();

  const handleShowDetailView = (set_id) =>{
    if(!set_id){
      cogoToast.error("Failed to get kit");
      console.error("Bad id");
      return;
    }
    setCurrentView(views && views.filter((view, i)=> view.value == "kitsDetail")[0]);
    setDetailKitId(set_id);
  }

  // const handleUpdateKit = (updateRow)=>{

  //   InventoryKits.updateKit(updateRow)
  //   .then((data)=>{
  //     cogoToast.success("Updated ");

  //     if(currentView.value === "kitsList"){
  //       setKitsRefetch(true);
  //     }
  //     if(currentView.value === "kitsSearch"){
  //       setKitsSearchRefetch(true);
  //     }
      
  //   })
  //   .catch((error)=>{
  //     console.error("failed to update ", error)
  //     cogoToast.error("Failed to update ");
  //     invUpdateArray.current =[];
  //   })
  // }
    

  
  
  const columns = [
    { dataKey: 'rainey_id', label: 'Rainey PN', type: 'number', width: 90, align: 'center',
      format: (value)=> <span onClick={()=>handleShowDetailView(value)} className={classes.clickableKitnumber}>{value}</span> }, 
    { dataKey: 'description', label: 'Description', type: 'text', width: 350, align: 'left' }, 
    { dataKey: 'inv_qty', label: 'In Stock', type: 'number', width: 60, align: 'center',
      format: (value,rowData)=> {
        return(
          <EditKitInvDialog kit={rowData}/>
        )
      }
    },
    { dataKey: 'num_in_kit', label: '# in Kit', type: 'number', width: 100, align: 'right' },
    { dataKey: 'notes', label: 'Notes', width: 200,type: 'text', align: 'left' }, 
    { dataKey: 'date_entered', label: 'Date Entered',type: 'date', width: 80, align: 'center',
        format: (value)=> moment(value).format("MM-DD-YYYY") },
    { dataKey: 'obsolete', label: 'Obsolete',type: 'number', width: 40, align: 'center' },
  ];

  const getRowClassName = ({ index }) => {
    const { classes, onRowClick } = props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  const cellRenderer = ({ cellData, columnIndex, rowData}) => {
    const column = columns[columnIndex];

    return(
        <TableCell className={classes.tableCell} 
                    component="div"
                    align={column.align}
                    variant="body"
                    style={{ minWidth: column.width, height: rowHeight }}>
              {column.format  ? column.format(cellData, rowData) : cellData}
        </TableCell>
    )
  };

  const headerRenderer = ({ label, columnIndex }) => {
    const column = columns[columnIndex];
    const isSorted =  sorters && sorters[0] && sorters[0].property == column.dataKey;
    const isASC = sorters && sorters[0] && sorters[0].direction === 'ASC';
    return(
    <TableCell
      component="div"
      variant="body"
      className={clsx({ [classes.tableCellHeadSelected] : isSorted ,
      [classes.tableCellHead]: !isSorted })}
      classes={{stickyHeader: classes.stickyHeader}}
      align={column.align}
      style={{ minWidth: column.width,height: headerHeight  }}
      onClick={event=>handleListSort(event, column)}
      > 
      <span>
        <div>{label}</div>
        {isSorted ?
              <div>
                  {isASC ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
              </div> 
                 : <></>}
      </span>
    </TableCell>)
  };

  const handleListSort = (event, item) =>{
    if(!item){
        cogoToast.error("Bad field while trying to sort");
        return;
    }
    //sort taskListItems according to item
    //this sort can take multiple sorters but i dont think its necessary
       // if it is, you will have to change the [0] to a dynamic index!
    if(item.type == 'date' || item.type == 'datetime' || item.type == 'number' || item.type == 'text'){

        setSorters([{
            property: item.dataKey, 
            direction: sorters && sorters[0] && sorters[0].property == item.dataKey ? 
                    ( sorters[0].direction === 'DESC' ? "ASC" : sorters[0].direction === 'ASC' ? "DESC" : "ASC" ) : "ASC"
        }]);
    }
  }
  return (
    <div className={classes.root}>
        <TableContainer className={classes.container}>
        <Table stickyHeader
            height={dimensions?.height - 20}
            width={dimensions?.width}
            rowHeight={rowHeight}
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            rowCount={kits ? kits.length : 0 }
            rowGetter={({ index }) => kits ? kits[index] : null }
            rowClassName={getRowClassName}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
          </Table>
      </TableContainer>
    </div>
  );
}

const VirtualizedTable = withStyles(styles)(KitsList);



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    //maxHeight: 650,
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
    // '&:last-child' :{
    //   borderRight: 'none' ,
    // },
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '150px',
    textOverflow: 'ellipsis',
    padding: "4px 6px",
  },
  tableCellHead:{
      '& span':{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '&:hover':{
              textDecoration: 'underline',
              color: '#444',
              cursor: 'pointer',
          },
          '& .MuiSvgIcon-root':{
              //position: 'absolute',
              marginLeft: '1px',
              //top: '20%',
              fontSize: '1.5em',
          }
      },
      padding: 0,
      fontWeight: '600',
  },
  tableCellHeadSelected:{
    '& span':{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover':{
            textDecoration: 'underline',
            color: '#444',
            cursor: 'pointer',
        },
        '& .MuiSvgIcon-root':{
            //position: 'absolute',
            marginLeft: '1px',
            //top: '20%',
            fontSize: '1.5em',
        }
    },
    fontWeight: '600',
    padding: 0,
    background: '#dbeaff',
},
  clickableKitnumber:{
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
}));