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

const InstallDateFilter = (props) => {
    //PROPS
    const {activeTaskView,taskViews, handleRefreshView, taskListTasksSaved, tLTasksExtraSaved , installDateFilters, setInstallDateFilters,
        setRefreshView,tabValue, taskListTasks} = props;
 
    //STATE
    const [installDateFilterOpen, setInstallDateFilterOpen] = useState(null)
    const [selectInstallDateMenuOpen,setSelectInstallDateMenuOpen] = useState(false);
    const [ctrl, setCtrl] = useState(false);
    
    const [isVisible, setIsVisible] = useState(!!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "sch_install_date" ));

    useEffect(()=>{
        if(activeTaskView && taskViews?.length > 0){
            setIsVisible( !!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "sch_install_date" ));
        }
    }, [activeTaskView])


    useEffect(() => {
        if(installDateFilterOpen == null){
            var tmp = window.localStorage.getItem('installDateFilterOpen');
            var tmpParsed;
            if(tmp != null && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed != null){
                setInstallDateFilterOpen(tmpParsed);
            }else{
                setInstallDateFilterOpen(false);
            }
        }
        if((installDateFilterOpen != null)){
            window.localStorage.setItem('installDateFilterOpen', JSON.stringify(installDateFilterOpen));
        }
        
    }, [installDateFilterOpen]);
    

    //CSS
    const classes = useStyles({ctrl, filterLength: installDateFilters?.length });


    const handleOpenInstallDateFilter = (event)=>{
        setInstallDateFilterOpen(true);
        setSelectInstallDateMenuOpen(true);
    }

    const handleClearAndCloseInstallDateFilter = (event)=>{
        setInstallDateFilterOpen(false);
        setInstallDateFilters([]);
        handleRefreshView()
    }

    const handleUpdateInstallDateFilter =(value)=>{
        console.log("Value ", value);

        if(value.find((item)=> item === "clear")){
            setInstallDateFilters([])
            handleCloseSelectMenu();
            handleRefreshView()
            return;
        }

        

        var newArray = value.map((item)=>{
            if(item === "road"){
                return {property: 'install_ready', value: 1, compare_type: 'notnull'}
            }
            if(item === "not_road"){
                return {property: 'install_ready', value: 0, compare_type: 'isnull'}
            }

            return ({property: 'sch_install_date', value: item})
        })
        if(!ctrl){
            newArray = newArray.slice(newArray.length-1)
        }

        setInstallDateFilters(newArray);

        if(!ctrl){
            handleCloseSelectMenu();
        }else{
            
        }
        handleRefreshView()
    }

    const handleCloseSelectMenu = (event)=>{
        setSelectInstallDateMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectInstallDateMenuOpen(true);
    }

    const handleCheckCtrlIsDown = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null ){
          console.error("Bad keycode or element on handleCheckCtrlIsDown");
          return;
        }
        if(keyCode === 17 && selectInstallDateMenuOpen){ //enter key & input element's id
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
        if(keyCode === 17 && selectInstallDateMenuOpen){ //enter key & input element's id
          setCtrl(false);
        }
    }

    if(!isVisible){
        return <></>
    }
    
    return(
        <>
                {selectInstallDateMenuOpen && tLTasksExtraSaved ? 
                <div className={classes.filterInstallDateDiv}>
                    <KeyBinding type={"keydown"} onKey={ (e) => handleCheckCtrlIsDown(e.keyCode, e) } />
                    <KeyBinding type={"keyup"} onKey={ (e) => handleCheckCtrlIsUp(e.keyCode, e) } /> 
                    <Select  multiple
                            autoWidth
                            id={"installDateFilter"}
                            className={classes.selectBox}
                            value={(installDateFilters?.map((item)=> {
                                if(item.property === "install_ready" ){
                                    return item.value ? "road" : 'not_road'
                                }
                                return (item.value)
                            }))}
                            open={selectInstallDateMenuOpen}
                            onOpen={handleOpenSelectMenu}
                            onClose={handleCloseSelectMenu}
                            className={classes.filterInstallDate}
                            onChange={event => handleUpdateInstallDateFilter(event.target.value)}
                            >
                        {(()=> {
                            var array = [...tLTasksExtraSaved].map((task)=> task["sch_install_date"])
                                           .filter((v, i, array)=> array.indexOf(v)===i && v != null )
                            var newArray = array.sort((a, b) => { return new moment(a).format('YYYYMMDD') - new moment(b).format('YYYYMMDD') })
                            return [...newArray.map((item,i)=>{
                                return( 
                                <MenuItem className={classes.menuItem} value={item}>{moment(item).format('MM/DD/YYYY')}</MenuItem>
                                );
                            }), <MenuItem className={classes.menuItem} value={'road'}>On Road</MenuItem>
                            , <MenuItem className={classes.menuItem} value={'not_road'}>Not On Road</MenuItem>
                            , <MenuItem className={classes.menuItem} value={'clear'}>Clear</MenuItem> ] ;
                        })()}
                    </Select> 
                    <span>
                        <DeleteIcon className={classes.clearInstallDateFilterIcon} onClick={event => handleClearAndCloseInstallDateFilter(event)}/>
                    </span>
                </div> : 
                // <Button className={classes.installDateFilterButton}
                //     onClick={event => handleOpenInstallDateFilter(event)}
                //     variant="text"
                //     color="secondary"
                //     size="medium"
                // >
                //     <DateIcon/>
                //     <Box display={{ xs: 'none', md: 'inline' }}  component="span">Install Date Filter</Box>
                // </Button>
                <div>
                    <FilterIcon className={classes.icon} onClick={event => handleOpenInstallDateFilter(event)}/>
                </div>
                }
        </>
    );

} 

export default InstallDateFilter;

const useStyles = makeStyles(theme => ({
    filterInstallDate: {
      
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
    filterInstallDateDiv:{
        // margin: '0px 10px',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // background: '#d7ffef',
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
    installDateFilterButton:{
        color: '#152f24',
        border: '1px solid #385248',
        margin: '0px 10px',
        fontWeight: 500,
        backgroundColor: '#d7ffef',
        '&:hover':{
            backgroundColor: '#85d1b3',
            color: '#222',
        }
        
    },
    clearInstallDateFilterIcon:{
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
