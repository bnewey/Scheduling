import React, {useRef, useState, useEffect, useLayoutEffect,useContext,useCallback} from 'react';
import {makeStyles, withStyles,List as MUIList,ListItem,ListItemText, Checkbox,ListSubheader, CircularProgress, Grid, IconButton,
  Popover, TextField} from '@material-ui/core';

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
import InventoryPartsRequest from  '../../../../js/InventoryPartsRequest';
import _, {debounce} from 'lodash';

import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';

import cogoToast from 'cogo-toast';
import clsx from 'clsx';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import Util from  '../../../../js/Util';
import { ListContext } from '../InvPartsRequestContainer';
import { InventoryContext } from '../../InventoryContainer';
import { Delete } from '@material-ui/icons';

const styles = (theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: "#e8e8e9",
      margin: '5px 0px',
      '&:hover':{
        backgroundColor: "#dcdcdc",
      },
      
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
    },
    
   
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

const PartsRequestList = function(props) {
  const {dimensions, rowHeight = 22, headerHeight = 30,} = props;

  const { partsRequestItems, currentView, setCurrentView, views, sorters, setSorters,
    setPartsRequestItemsRefetch, user} = useContext(ListContext);

  const {editInvModalOpen, setEditInvModalOpen} = useContext(InventoryContext);

  const [statusTypes, setStatusTypes] = useState(null);
  
  //Popover Add/swap crew
  const [statusPopAnchorEl, setStatusPopAnchorEl] = React.useState(null);
  const [statusPopItem, setStatusPopItem] = useState(null);

  const classes = useStyles();

  useEffect(()=>{
    if(statusTypes == null){
      InventoryPartsRequest.getStatusTypes()
      .then((data)=>{
        setStatusTypes(data);
      })
      .catch((error)=>{
        console.error("Failed to get status types", error);
        cogoToast.error('Internal Server Error');
        
      })
    }
  },[statusTypes])


  //Add/Swap Popover for crews
  const handleOpenStatusPopover = (event, pr_item) =>{
        

      setStatusPopAnchorEl(event.currentTarget);
      setStatusPopItem(pr_item);
      event.stopPropagation();
  }
  
  const handleStatusPopoverClose = () => {
    setStatusPopAnchorEl(null);
    setStatusPopItem(null);
  };

  //Swap Crews  
  const statusPopoverOpen = Boolean(statusPopAnchorEl);
  const statusPopoverId = open ? 'add-popover' : undefined;

  const handleChangeStatus = useCallback((event, new_status, old_status) => {
      if(!new_status || !statusPopItem){
        console.log("statusPopItem", statusPopItem)
        cogoToast.error("Failed to change status.");
        console.error("Bad statusPopItem for add/update.");
        return;
      }

      if(new_status == old_status){
        console.log("Same status");
        handleStatusPopoverClose();
        return;
      }

      let updateObject = statusPopItem;
      updateObject["status"] = new_status;

      InventoryPartsRequest.updatePartsRequestItemStatus(updateObject, user)
      .then((data)=>{
        setPartsRequestItemsRefetch(true);
        if(statusPopoverOpen){
          handleStatusPopoverClose();
        }
      })
      .catch((error)=>{
        cogoToast.error("Internal Server Error");
        console.error("Failed to change status", error);
      })
     
      
      
  },[statusPopItem])
  //// END OF Add/Swap Popover for crews

  
  const columns = [
    { dataKey: 'rainey_id', label: 'Rainey ID', type: 'number', width: 120, align: 'center',
      format: (value, row)=> <span onClick={(event)=>handleGoToPart(event,value, row.item_type)} className={classes.clickableOrderOutnumber}>{value}</span> }, 
    { dataKey: 'description', label: 'Item', type: 'text', width: 325, align: 'left' }, 
    { dataKey: 'qty', label: 'Qty', type: 'number', width: 80, align: 'center' },
    { dataKey: 'notes', label: 'Notes', type: 'text', width: 220, align: 'left' }, 
    { dataKey: 'work_order_name', label: 'Work Order', width: 180,type: 'text', align: 'center' }, 
    { dataKey: 'status', label: 'Status', type: 'text', width: 170, align: 'center',
      format: (value, row) =>(
        user?.isAdmin ?
         (<div className={classes.popOverDiv} 
                                style={{ 
                                        color: '#333',
                                        backgroundColor: `${ '#fff'}`}}
                                onMouseUp={event => handleOpenStatusPopover(event, row)}>
                                  {row.status_type}
                                </div>)
          :
          (<>{row.status_type}</>)
       ) }, 
     
    { dataKey: 'date_entered', label: 'Date Entered',type: 'date', width: 130, align: 'center',
        format: (value)=> moment(value).format("MM-DD-YYYY") },
    { dataKey: 'date_updated', label: 'Date Updated',type: 'date', width: 130, align: 'center',
        format: (value)=> value ? moment(value).format("MM-DD-YYYY") : "" },
    { dataKey: 'requested_by_name', label: 'Requester',type: 'text', width: 140, align: 'center' },
    {dataKey: 'delete', label: <Delete className={classes.deleteIcon}/> , type: 'delete', width: 100, align:'center',
        format: (value, row)=> <Delete className={classes.deleteIconClickable} onClick={event =>handleDeleteRequestItem(row)}/>  }
  ];

  const handleGoToPart = (event, rainey_id, item_type)=>{
        //ordersOut detailWOIid in local data
     window.localStorage.setItem(item_type == "part" ? 'detailPartId' : 'detailKitId', JSON.stringify(rainey_id));
     
     //set detail view in local data
     window.localStorage.setItem(item_type == "part" ? 'currentInvPartsView' : 'currentInvKitsView', JSON.stringify(item_type == "part" ?  "partsDetail"  : 'kitsDetail'));
     window.localStorage.setItem('currentInventoryView', JSON.stringify(item_type == "part" ?  "invParts" : "invKits"));
     
     window.open('/scheduling/inventory', "_blank");

   }

   const handleDeleteRequestItem = (item) =>{
     const deleteFunc = ()=>{
      InventoryPartsRequest.deletePartsRequestItem(item.id, item.item_type, user)
      .then((data)=>{
         setPartsRequestItemsRefetch(true);
      })
      .catch((error)=>{
         setPartsRequestItemsRefetch(true);
        console.error("Failed to delete item", error);
        cogoToast.error('Internal Server Error');
        
      })
     }

     confirmAlert({
      customUI: ({onClose}) => {
          return(
              <ConfirmYesNo onYes={deleteFunc} onClose={onClose} customMessage={"Delete Item permanently?"}/>
          );
      }
  })
     
   }

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
            rowCount={partsRequestItems ? partsRequestItems.length : 0 }
            rowGetter={({ index }) => partsRequestItems ? partsRequestItems[index] : null }
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
      <Popover
            id={statusPopoverId}
            open={statusPopoverOpen}
            anchorEl={statusPopAnchorEl}
            onClose={handleStatusPopoverClose}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            className={classes.popover}
            classes={{paper: classes.popoverPaper}}
        >
            <MUIList 
                subheader={
                    <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                        Update Status
                    </ListSubheader>
                }>
                {statusTypes?.filter((v)=> v.type != "Seen" && v.type != "Requested").map((type, i)=>(
                          <ListItem className={classes.crew_list_item} 
                                      key={`status_type+${i}`} button
                                      onMouseUp={(event)=>handleChangeStatus(event, type.id, statusPopItem.status )}>
                              <ListItemText primary={type.type} />
                          </ListItem>
                      ))}
            </MUIList>
        </Popover> 
    </div>
  );
}

const VirtualizedTable = withStyles(styles)(PartsRequestList);



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
  clickableOrderOutnumber:{
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
  popOverDiv:{
    border: '1px solid #a9a9a9',
    backgroundColor: '#fff',
    '&:hover':{
      boxShadow: '0px 0px 4px 0px black',
      cursor: 'pointer',
      backgroundColor: '#b1b1b159',
    }
  },
  popoverPaperWoi:{
    width: '600px',
    borderRadius: '2px',
    backgroundColor: '#6f6f6f',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  popoverPaper:{
    width: '200px',
    borderRadius: '10px',
    backgroundColor: '#6f6f6f',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  crew_list_item:{
    backgroundColor: '#fff',
    '&:hover':{
        backgroundColor: '#ddd',
        color: '#222',
    },
    padding: '0% 5%',
    border: '1px solid #b2b2b2',
  },
  list_head:{
    lineHeight: '24px',
    borderRadius: '2px',
    color: '#fff',
    backgroundColor: '#61a4a1',
  },
  deleteIconClickable:{
    cursor: 'pointer',
    color: '#777',
    '&:hover':{
      color: '#555',
    },
  },
  deleteIcon:{
    color: '#777',
  }
}));