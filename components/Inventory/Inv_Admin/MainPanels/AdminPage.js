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

import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import {createSorter} from '../../../../js/Sort';
import Inventory from '../../../../js/Inventory' 
import Settings from '../../../../js/Settings' 
import _, {debounce} from 'lodash';

import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';

import cogoToast from 'cogo-toast';
import clsx from 'clsx';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';


import Util from  '../../../../js/Util';
import { AdminContext } from '../InvAdminContainer';
import { InventoryContext } from '../../InventoryContainer';
import AddEditManfDialog from './components/AddEditManfDialog';
import AddEditPartTypeDialog from './components/AddEditPartTypeDialog';
import UpdateNotificationSettingDialog from "./components/UpdateNotificationSettingDialog";

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
  const [dimensions, setDimensions] = useState({ width:600, height: 500 });
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
      <VirtualizedTable dimensions={dimensions} setDimensions={setDimensions}  />
  );
}

const AdminPage = function(props) {
  const { dimensions, rowHeight = 22, headerHeight = 30,} = props;

  const {  currentView, setCurrentView, views, manItems, manItemsRefetch, setManItemsRefetch, partTypes,
     partTypesRefetch, setPartTypesRefetch } = useContext(AdminContext);

  const {user} = useContext(InventoryContext);
  const classes = useStyles();

  const [tableRows, setTableRows] = useState(null);
  const [columns, setColumns] = useState(null);
  const tabs = [{field:"manufacturers", label: "Manufacturers"}, {field:"partTypes", label: "Part Types"}, {field:"settings", label: "Settings"} ]
  const [adminTab, setAdminTab] = useState("manufacturers");

  const [manfToEdit, setManfToEdit] = useState(null);
  const [addNewManDialog,setAddNewManDialog] = useState(false);
  const [partTypeToEdit, setPartTypeToEdit] = useState(null);
  const [addNewPartTypeDialog,setAddNewPartTypeDialog ] = useState(false);
  const [settingToEdit, setSettingToEdit] = useState(null);
  const [updateSettingDialogOpen,setUpdateSettingDialogOpen ] = useState(false);

  const [settings, setSettings] = useState(null);
  const [settingsRefetch, setSettingsRefetch] = useState(false);

  useEffect(()=>{
    if(adminTab == "settings" && (settings == null || settingsRefetch == true)){
      if(settingsRefetch){
        setSettingsRefetch(false);
      }
      
      Settings.getNotificationSettings(user.googleId, 'inventory')
      .then((data)=>{
        setSettings(data);
      })
      .catch((error)=>{
        console.error("Failed to get settings", error);
        cogoToast.error("Internal Server Error");
      })
    }

  },[settings, settingsRefetch, adminTab])
  
  useEffect(()=>{
    if(adminTab){
      switch(adminTab){
        case 'manufacturers':
          setTableRows(manItems)
          setColumns(man_columns);
          break;
        case 'partTypes':
          setTableRows(partTypes)
          setColumns(part_columns);
          break;
        case 'settings':
          setTableRows(settings);
          setColumns(settings_columns);
      }
      
    }
  },[adminTab,manItems,partTypes, settings ])

 
  
  const handleChangeTab = (event, tab)=>{
    setAdminTab(tab.field);
  }
  
  const man_columns = [
    { dataKey: 'id', label: 'ID', type: 'number', width: 90, align: 'center'}, 
    { dataKey: 'name', label: 'Manf. Name', type: 'text', width: 350, align: 'left' }, 
    { dataKey: 'actions', label: 'Actions', type: 'text', width: 80, align: 'left',
     format: (value, row)=> <div>
       <IconButton onClick={event=> handleOpenAddNewDialog(event, row)}><EditIcon/></IconButton>
       <IconButton onClick={event=> handleDeleteItem(event, row)}><DeleteIcon/></IconButton></div> }, 
    
  ];
  const part_columns = [
    { dataKey: 'id', label: 'ID', type: 'number', width: 90, align: 'center'}, 
    { dataKey: 'type', label: 'Type Name', type: 'text', width: 350, align: 'left' }, 
    { dataKey: 'actions', label: 'Actions', type: 'text', width: 80, align: 'left',
     format: (value, row)=> <div>
       <IconButton onClick={event=> handleOpenAddNewDialog(event, row)}><EditIcon/></IconButton>
       <IconButton onClick={event=> handleDeleteItem(event, row)}><DeleteIcon/></IconButton></div> }
    
  ];

  const settings_columns = [
    { dataKey: 'name', label: 'Setting', type: 'text', width: 250, align: 'left' }, 
    { dataKey: 'description', label: 'Description', type: 'text', width: 250, align: 'left' }, 
    { dataKey: 'actions', label: 'Actions', type: 'text', width: 80, align: 'left',
     format: (value, row)=> <div>
       <IconButton onClick={event=> handleOpenAddNewDialog(event, row)}><EditIcon/></IconButton></div> }
    
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
    //const isSorted =  sorters && sorters[0] && sorters[0].property == column.dataKey;
    //const isASC = sorters && sorters[0] && sorters[0].direction === 'ASC';
    return(
    <TableCell
      component="div"
      variant="body"
      className={clsx({  [classes.tableCellHead]: true })}
      classes={{stickyHeader: classes.stickyHeader}}
      align={column.align}
      style={{ minWidth: column.width,height: headerHeight  }}
      > 
      <span>
        <div>{label}</div>
       
      </span>
    </TableCell>)
  };

  const handleOpenAddNewDialog = (event, row)=>{
    switch(adminTab){
      case "manufacturers":
        setAddNewManDialog(true);
        setManfToEdit(row)
        break;
      case "partTypes":
        setAddNewPartTypeDialog(true);
        setPartTypeToEdit(row)
        break;
      case "settings":
        setUpdateSettingDialogOpen(true);
        setSettingToEdit(row);
    }
    
  }

  const handleDeleteItem = (event, row)=>{
    if(!row.id){
      cogoToast.error("Bad row in delete handleDeleteItem");
      console.error("Failed to delete handleDeleteItem");
      return;
    }

    switch(adminTab){
      case "manufacturers":
        
        var deleteItem = ()=>{
          Inventory.deleteManufacturer(row.id, user)
          .then((data)=>{
            if(data){
                setManItemsRefetch(true);
              cogoToast.success("Deleted Manufacturer");
            }
          })
          .catch((error)=>{
              
            cogoToast.error("Failed to delete Manufacturer")
            console.error("Failed to delete Manufacturer", error);
            setManItemsRefetch(true);
          })
        }
  
        confirmAlert({
          customUI: ({onClose}) => {
              return(
                  <ConfirmYesNo onYes={deleteItem} onClose={onClose} customMessage={`Remove manufacturer ${row.name}?`}/>
              );
          }
        })
        break;
      case "partTypes":
        var deleteItem = ()=>{
          Inventory.deletePartType(row.id, user)
          .then((data)=>{
            if(data){
                setPartTypesRefetch(true);
              cogoToast.success("Deleted PartTypes");
            }
          })
          .catch((error)=>{
            cogoToast.error("Failed to delete PartTypes")
            console.error("Failed to delete PartTypes", error);
            setPartTypesRefetch(true);
          })
        }
  
        confirmAlert({
          customUI: ({onClose}) => {
              return(
                  <ConfirmYesNo onYes={deleteItem} onClose={onClose} customMessage={`Remove PartType ${row.type}?`}/>
              );
          }
        })
        break;
      case 'settings':

        break;
    }
    
  }

  return (
    <div className={classes.root} >
        <div className={classes.tabDiv}>
          {tabs.map((tab)=>{
            const isSelected = adminTab === tab.field;
            return (
              <div className={clsx({[classes.tabButton]: true, [classes.tabButtonSelected]: isSelected})}
              onClick={(event)=> handleChangeTab(event, tab)}>
                  <span > {tab.label}</span>
              </div>
            )
          })}
        </div>
        <TableContainer className={classes.container}>
          <div className={classes.tableLabelDiv}>
            <span className={classes.tableLabel}>{tabs.find((tab)=> tab.field === adminTab)?.label}</span>
            <div>
                { adminTab != "settings" && <div className={classes.addButton} onClick={event=> handleOpenAddNewDialog(event)}><span>Add New</span></div>}
            </div>
          </div>
        <Table stickyHeader
            height={dimensions?.height - 20}
            width={dimensions?.width}
            rowHeight={rowHeight}
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            rowCount={tableRows ? tableRows.length : 0 }
            rowGetter={({ index }) => tableRows ? tableRows[index] : null }
            rowClassName={getRowClassName}
          >
            {columns?.map(({ dataKey, ...other }, index) => {
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
      <AddEditManfDialog user={user} manf={manfToEdit} refreshFunction={()=> setManItemsRefetch(true)} addNewManDialog={addNewManDialog} setAddNewManDialog={setAddNewManDialog}/>
      <AddEditPartTypeDialog user={user} part_type={partTypeToEdit} refreshFunction={()=> setPartTypesRefetch(true)} addNewPartTypeDialog={addNewPartTypeDialog} setAddNewPartTypeDialog={setAddNewPartTypeDialog}/>
      <UpdateNotificationSettingDialog settingToEdit={settingToEdit} setSettingToEdit={setSettingToEdit} refreshFunction={()=> setSettingsRefetch(true)} updateSettingDialogOpen={updateSettingDialogOpen}  setUpdateSettingDialogOpen={setUpdateSettingDialogOpen}/>
    </div>
  );
}

const VirtualizedTable = withStyles(styles)(AdminPage);



const useStyles = makeStyles(theme => ({
  root:{
    // border: '1px solid #339933',
    padding: '1%',
    minHeight: '730px',
  },
  container: {
    //maxHeight: 650,
    margin: '15px 10px',
  },
  tableLabelDiv:{
    padding: '2px 5px',
    margin: '3px 3px 10px 3px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems:"center",
  },
  tableLabel:{
    fontFamily: 'arial',
    fontSize: '1.5em',
    fontWeight: '600',
    color: '#999'
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
  clickablePartnumber:{
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
  tabDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    borderBottom: '1px solid #9f9f9f',
  },
  tabButton:{
    padding: '5px 10px',
    margin: '0px 5px',
    borderRadius: '3px 3px 0px 0px',
    background: '#eee',
    borderBottom: '3px solid #eee',
    border: '1px solid #9f9f9f',
    cursor: 'pointer',
    '&:hover':{
      border: '1px solid #777',
    }
  },
  tabButtonSelected:{
    borderBottom: '3px solid #0055ff',
    color: '#0033dd',
    boxShadow: 'inset 0px 2px 4px 0px #a7a7a7',
  },
  addButton:{
    padding: '3px 6px',
    margin: '0px 5px',
    borderRadius: '3px',
    background: '#eee',
    border: '1px solid #9f9f9f',
    cursor: 'pointer',
    '&:hover':{
      border: '1px solid #777',
    },
    fontSize: '1em',
  }
}));