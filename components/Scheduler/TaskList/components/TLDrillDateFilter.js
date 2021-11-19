import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles,  Button,  Box, Select,MenuItem, Tooltip } from '@material-ui/core';

     import DeleteIcon from '@material-ui/icons/Clear';
     import DateIcon from '@material-ui/icons/DateRangeTwoTone'
     import FilterIcon from '@material-ui/icons/MoreVert';

const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
    ssr: false
  });
  import dynamic from 'next/dynamic'

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import cogoToast from 'cogo-toast';
import moment from 'moment';

import _, { property } from 'lodash';

const TLDrillDateFilter = (props) => {
    //PROPS
    const { taskViews, activeTaskView, handleRefreshView, taskListTasksSaved,tLTasksExtraSaved, drillDateFilters, setDrillDateFilters,
        setRefreshView,tabValue} = props;
 
    //STATE
    const [drillDateFilterOpen, setDrillDateFilterOpen] = useState(null)
    const [selectDrillDateMenuOpen,setSelectDrillDateMenuOpen] = useState(false);
    const [ctrl, setCtrl] = useState(false);
    
    const [isVisible, setIsVisible] = useState(!!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "drill_date" ));

    useEffect(()=>{
        if(activeTaskView && taskViews?.length > 0){
            setIsVisible( !!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "drill_date" ));
        }
    }, [activeTaskView]);


    useEffect(() => {
        if(drillDateFilterOpen == null){
            var tmp = window.localStorage.getItem('drillDateFilterOpen');
            var tmpParsed;
            if(tmp != null && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed != null){
                setDrillDateFilterOpen(tmpParsed);
            }else{
                setDrillDateFilterOpen(false);
            }
        }
        if((drillDateFilterOpen != null)){
            window.localStorage.setItem('drillDateFilterOpen', JSON.stringify(drillDateFilterOpen));
        }
                
    }, [drillDateFilterOpen]);
    

    //CSS
    const classes = useStyles({ctrl, filterLength: drillDateFilters?.length });


    const handleOpenDrillDateFilter = (event)=>{
        setDrillDateFilterOpen(true);
        setSelectDrillDateMenuOpen(true);
    }

    const handleClearAndCloseDrillDateFilter = (event)=>{
        setDrillDateFilterOpen(false);
        setDrillDateFilters([]);
        handleRefreshView()
    }

    const handleUpdateDrillDateFilter =(value)=>{
        console.log("Value ", value);

        if(value.find((item)=> item === "clear")){
            setDrillDateFilters([])
            handleCloseSelectMenu();
            handleRefreshView()
            return;
        }

        let property = 'drill_date';
        if(value == 0 || value == 1){
            property = 'drill_ready';
        }        

        var newArray = value.map((item)=>{
            if(item === "located"){
                return {property: 'drill_located', value: 1, compare_type: 'notnull'}
            }
            if(item === "not_located"){
                return {property: 'drill_located', value: 0, compare_type: 'isnull'}
            }
            if(item === "diagram"){
                console.log("ASS")
                return {property: 'drill_diagram', value: 1, compare_type: 'notnull'}
            }
            if(item === "not_diagram"){
                return {property: 'drill_diagram', value: 0, compare_type: 'isnull'}
            }
            return ({property, value: item})
        })
        if(!ctrl){
            newArray = newArray.slice(newArray.length-1)
        }
        console.log("newArray", newArray);
        setDrillDateFilters(newArray);

        if(!ctrl){
            handleCloseSelectMenu();
        }else{
            
        }
        handleRefreshView()
    }  

    const handleCloseSelectMenu = (event)=>{
        setSelectDrillDateMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectDrillDateMenuOpen(true);
    }

    const handleCheckCtrlIsDown = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null ){
          console.error("Bad keycode or element on handleCheckCtrlIsDown");
          return;
        }
        if(keyCode === 17 && selectDrillDateMenuOpen){ //enter key & input element's id
          setCtrl(true);
        }
    }

    const handleCheckCtrlIsUp = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null  ){
          console.error("Bad keycode or element on handleCheckCtrlIsDown");
          return;
        }
        if(keyCode === 17 && selectDrillDateMenuOpen){ //enter key & input element's id
          setCtrl(false);
        }
    }
    
    if(!isVisible){
        return <></>
    }

    return(
        <> 
                {selectDrillDateMenuOpen && tLTasksExtraSaved ? 
                <div className={classes.filterDrillDateDiv}>
                    <KeyBinding type={"keydown"} onKey={ (e) => handleCheckCtrlIsDown(e.keyCode, e) } />
                    <KeyBinding type={"keyup"} onKey={ (e) => handleCheckCtrlIsUp(e.keyCode, e) } /> 
                    <Select multiple
                            autoWidth
                            id={"drillDateFilter"}
                            className={classes.selectBox}
                            value={(drillDateFilters?.map((item)=> {
                                if(item.property === "drill_located" ){
                                    return item.value ? "located" : 'not_located'
                                }
                                if(item.property === "drill_diagram" ){
                                    return item.value ? "diagram" : 'not_diagram'
                                }
                                return (item.value)
                            }))}
                            
                            open={selectDrillDateMenuOpen}
                            onOpen={handleOpenSelectMenu}
                            onClose={handleCloseSelectMenu}
                            className={classes.filterDrillDate}
                            onChange={event => handleUpdateDrillDateFilter(event.target.value)}
                            >
                        {(()=> {
                            var array = [...tLTasksExtraSaved].map((task)=> task["drill_date"])
                                           .filter((v, i, array)=> array.indexOf(v)===i && v != null )
                            var newArray = array.sort((a, b) => { return new moment(a).format('YYYYMMDD') - new moment(b).format('YYYYMMDD') })
                            return [newArray.map((item,i)=>{
                                return( 
                                <MenuItem className={classes.menuItem} value={item}>{moment(item).format('MM/DD/YYYY')}</MenuItem>
                                );
                            }), <MenuItem className={classes.menuItem} value={0}>Drill Not Ready</MenuItem>, <MenuItem value={1}>Drill Ready</MenuItem>,
                            , <MenuItem className={classes.menuItem} value={'diagram'}>Diagramed</MenuItem>
                            , <MenuItem className={classes.menuItem} value={'not_diagram'}>Not Diagramed</MenuItem>
                            , <MenuItem className={classes.menuItem} value={'located'}>Located</MenuItem>
                            , <MenuItem className={classes.menuItem} value={'not_located'}>Not Located</MenuItem>
                            , <MenuItem className={classes.menuItem} value={'clear'}>Clear</MenuItem>] ;
                        })()}
                    </Select> 
                    <span>
                        <DeleteIcon className={classes.clearDrillDateFilterIcon} onClick={event => handleClearAndCloseDrillDateFilter(event)}/>
                    </span>
                </div> : 
                // <Button className={classes.drillDateFilterButton}
                //     onClick={event => handleOpenDrillDateFilter(event)}
                //     variant="text"
                //     color="secondary"
                //     size="medium"
                // >
                //     <DateIcon/>
                //     <Box display={{ xs: 'none', md: 'inline' }}  component="span">Drill Date Filter</Box>
                // </Button>
                <div>
                    <FilterIcon className={classes.icon} onClick={event => handleOpenDrillDateFilter(event)}/>
                </div>
                }
        </>
    );

} 

export default TLDrillDateFilter;

const useStyles = makeStyles(theme => ({
    filterDrillDate: {
      
        padding: '0px',
        background: '#fff',
        color: '#19253a',
        '&& .MuiSelect-select':{
            // padding: '8px 20px 8px 10px',
            // minWidth: '100px',
            padding: '0px',
            minWidth: '1px',
        },
        
    },
    filterDrillDateDiv:{
        // margin: '0px 10px',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // background: '#ad74d9',
        // padding: '2px 4px',
        // borderRadius: '3px',
        margin: '0px 0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px',
        overflow: "hidden",
        width: "1px"
    },
    drillDateFilterButton:{
        color: '#fff',
        border: '1px solid #385248',
        margin: '0px 10px',
        fontWeight: 500,
        backgroundColor: '#ad74d9',
        '&:hover':{
            backgroundColor: '#c184ef',
            color: '#fff',
        }
        
    },
    clearDrillDateFilterIcon:{
        margin: '2px',
        marginTop: '4px',
        '&:hover':{
            color: '#000',
            background: '#b7b7b75c',
            borderRadius: '8px',
        }
    },
    selectBox:{
        display: 'none',
    },
    menuItem:{
        cursor: ({ctrl}) => ctrl ? 'cell': 'pointer',
    },
    icon:{
        color: ({filterLength}) => filterLength > 0 ? '#ff6a1e' : '#fff',
        cursor: 'pointer'
    }

      
  }));
