import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails,Checkbox,
     TextField,Select, IconButton} from '@material-ui/core';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import PDFIcon from '@material-ui/icons/PictureAsPdf';
import LinkIcon from '@material-ui/icons/Link';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
    ViewPDF: forwardRef((props, ref) => <PDFIcon {...props} ref={ref} />),
};

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import MaterialTable, {MTableBodyRow, MTableCell} from "material-table";

import cogoToast from 'cogo-toast';
import moment from 'moment';

import Util from  '../../../js/Util';
import Inventory from  '../../../js/Inventory';
import { Add } from '@material-ui/icons';
//import { DetailContext } from '../InvPartsContainer';

const PartManufactureList = function(props) {
    const {user, part, resetFunction} = props;

    const classes = useStyles();
    const [partManItems, setPartManItems] = React.useState(null)
    const [manNames, setManNames] = React.useState(null);


    const columns = [
        // { field: 'id', title: 'ID', minWidth: 20, align: 'center', editable: 'never' },
        { field: 'mf_part_number', title: 'Part#', minWidth: 80, align: 'center', editable: 'onUpdate',
        render: rowData => rowData.mf_part_number,
        editComponent: props => (
            <TextField id={`mf_part_num_input`} 
                variant="standard"
                value={props && props.value}
                classes={{root: classes.inputRoot}}
                onChange={(event) => props.onChange(event.target.value)}  />
        )},
        { field: 'default_qty', title: 'Default Qty', minWidth: 25, align: 'center', editable: 'onUpdate',
          render: rowData => rowData.default_qty,
          editComponent: props => (
            <TextField id={`qty_input`} 
                type="number"
                variant="standard"
                value={props && props.value}
                classes={{root: classes.inputRoot}}
                onChange={(event) => props.onChange(event.target.value)}  />
          )},
          { field: 'manufacturer', title: 'Man Name', minWidth: 25, align: 'center', editable: 'onUpdate',
          render: rowData => rowData.manufacture_name,
          editComponent: props => { return(
            <Select
                id={'manufacturer_select'}
                value={props && props.value ? props.value : 0}
                inputProps={{classes:  classes.inputSelect}}
                onChange={(event) => props.onChange(event.target.value)}
                native
            >
                <option value={0}>
                    Select
                </option>
                {manNames && manNames.map((item)=>{
                    return (
                        <option value={item.id}>
                            {item.name}
                        </option>
                    )
                })}
            </Select>
         )}},
          { field: 'notes', title: 'Notes', minWidth: 80, align: 'center', editable: 'onUpdate',
          render: rowData => <div className={classes.notesSpan}>{rowData.notes}</div>,
          editComponent: props => ( <TextField id={`notes_input`} 
                                    variant="standard"
                                    multiline
                                    rowsMax={4}
                                    value={props && props.value}
                                    //inputProps={{className: classes.inputStyle}} 
                                    classes={{root: classes.inputRoot}}
                                    onChange={(event) => {
                                        let value = event.target.value;
                                        if(value?.length > 199){
                                            cogoToast.info("Max Length")
                                            return;
                                        }
                                        props.onChange(value)
                                    } }  />
            )},
            { field: 'date_updated', title: 'Date Updated', minWidth: 80, align: 'center', editable: 'never'   },
            { field: 'url', title: 'Url', minWidth: 80, align: 'center', editable: 'onUpdate',
          render: rowData => rowData.url ? <div className={classes.urlSpan} ><a href={rowData.url}  target="_blank"><LinkIcon/></a></div> : <></>,
          editComponent: props => ( <TextField id={`url_input`} 
                                    variant="standard"
                                    multiline
                                    rowsMax={4}
                                    value={props && props.value}
                                    //inputProps={{className: classes.inputStyle}} 
                                    classes={{root: classes.inputRoot}}
                                    onChange={(event) => {
                                        let value = event.target.value;
                                        if(value?.length > 249){
                                            cogoToast.info("Max Length")
                                            return;
                                        }
                                        props.onChange(value)
                                    } }  />
            )},
            { field: 'default_man', title: 'Default', minWidth: 45, align: 'center', editable: 'onUpdate',
            render: rowData => rowData.default_man ? 'Yes' : 'No',
            editComponent: props => (
              <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  name="checkedI"
                  checked={props.value ? true : false}
                  onChange={(event)=> props.onChange(event.target.checked ? 1 : 0)}
              />
            )},
      ];

    //Part manufacturing Data
    useEffect( () =>{
        if(partManItems == null && part) {
            
            Inventory.getPartManItems(part.rainey_id)
            .then( data => { setPartManItems(data); })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error getting wois`, {hideAfter: 4});
                setPartManItems([]);
            })
        }
    },[partManItems, part]);

    //Part manufacturing Data
    useEffect( () =>{
        if(manNames == null) {
            
            Inventory.getManufactures()
            .then( data => { setManNames(data); })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error getting wois`, {hideAfter: 4});
                setManNames([]);
            })
        }
    },[manNames]);


    const handleUpdatePartManItem = (newData, oldData) => {
        return new Promise((resolve, reject)=>{
            Inventory.updatePartManItem(newData)
            .then((data)=>{
                cogoToast.success("Updated Part Manf Item");
                if(resetFunction){
                    resetFunction();
                }
                resolve();
            })
            .catch((error)=>{
                console.error("Failed to update Part Manf Item", error);
                cogoToast.error("Failed to update Part Manf Item");
                if(resetFunction){
                    resetFunction();
                }
                reject();
            })
        })
    }   

    const handleDeleteManItem = (row)=>{
        if(!row.id){
          cogoToast.error("Bad row in delete part manufacture item");
          console.error("Failed to delete part manufacture item");
          return;
        }
        const deleteItem = ()=>{
          Inventory.deletePartManItem(row.id)
          .then((data)=>{
            if(data){
                if(resetFunction){
                    resetFunction();
                }
              cogoToast.success("Deleted part manufacture item");
            }
          })
          .catch((error)=>{
              
            cogoToast.error("Failed to delete part manufacture item")
            console.error("Failed to delete part manufacture item", error);
            if(resetFunction){
                resetFunction();
            }
          })
        }

        confirmAlert({
          customUI: ({onClose}) => {
              return(
                  <ConfirmYesNo onYes={deleteItem} onClose={onClose} customMessage={"Remove manufacturing item?"}/>
              );
          }
        })
  
    }
    
    const handleAddNewItem = (event,)=>{
        if( !part){
            console.error("Bad rowData or part in handleAddNewItem")
            return;
        }

        let addData = { rainey_id: part.rainey_id}
        Inventory.addNewPartManItem(addData)
        .then((data)=>{
            cogoToast.success("Added part manufacture item")
            if(resetFunction){
                resetFunction();
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to add part manufacture item")
            console.error("Failed to add part manufacture item", error);
            if(resetFunction){
                resetFunction();
            }
            
        })
    }

    return ( 
        <>

        {part ?
            <div className={classes.container}>
                
            <Grid container>
                    <Grid item xs={12}>
                        <div className={classes.tableDiv}>
                        { partManItems &&
                            <MaterialTable 
                                columns={columns}
                                style={{ width: "inherit"}}
                                data={partManItems}
                                title={"Part Manufacturing List"}
                                editable={{
                                    onRowUpdate: (newData, oldData) => handleUpdatePartManItem(newData, oldData)
                                }}
                                icons={tableIcons}
                                options={{
                                    filtering: false,
                                    paging: false,
                                    search: false,
                                    draggable: false,
                                    toolbar: false,
                                    showTitle: false,
                                    headerStyle:{
                                    fontSize: '14px',
                                    fontFamily: 'sans-serif',
                                    borderRight: '1px solid #c7c7c7' ,
                                    '&:lastChild' :{
                                        borderRight: 'none' ,
                                    },
                                    background: 'linear-gradient(0deg, #cecece, #ededed)',
                                    fontWeight: 600,
                                    color: '#444',
                                    padding: '5px',
                                    zIndex: 0,
                                    },
                                    // actionsColumnIndex: -1,
                                    cellStyle: {
                                        fontSize: '13px',
                                        fontFamily: 'sans-serif',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        borderLeft: '1px solid #c7c7c7' ,
                                        padding: "5px",
                                    },
                                        actionsCellStyle:{
                                        background: '#ffefdd'
                                    },
                                }} 
                                actions={[
                                {
                                    icon: tableIcons.Delete,
                                    tooltip: 'Delete Packing Slip',
                                    onClick: (event, rowData) => handleDeleteManItem(rowData)
                                },
                                ]}
                                
                            />
                            }

                        </div>
                    </Grid>
                    <div className={classes.bottomDiv}><IconButton className={classes.iconButton}
                onClick={(event) => handleAddNewItem(event)} ><Add 
                />Add New </IconButton></div>
                </Grid>
            </div>
        :<><CircularProgress/></>}

        </>
    );
}

export default PartManufactureList


const useStyles = makeStyles(theme => ({
    root:{

    },
    tableDiv:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxHeight: '400px',
        flexWrap: 'wrap',
        width: '-webkit-fill-available',
    },
    notesSpan:{
        maxWidth: '150px',
        whiteSpace: 'pre-wrap',
        fontSize: '10px',
        maxHeight: '50px',
        overflowY: 'scroll',
        overflowX: 'hidden',
    },
    urlSpan:{
        cursor: 'pointer',
        textDecoration: 'underline',
        color: '#0055ff',
    },
    iconButton:{
        padding: '5px 10px',
        '& svg':{
            height: '1.4em',
            width: '1.4em'
        },
        background: '#dbdbdb',
        border: '1px solid #a5a5a5',
        borderRadius: '2px',
        '&:hover':{
            background: '#d4e9f3',
        }
    },
    bottomDiv:{
        width: '100%',
        textAlign: 'right',
        marginTop: '2%',
        marginRight: '2%'
    }

}));