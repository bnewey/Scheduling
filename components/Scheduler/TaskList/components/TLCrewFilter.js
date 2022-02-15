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

const CrewFilter = (props) => {
    //PROPS
    const {activeTaskView,taskViews, handleRefreshView, taskListTasksSaved,crewFilters, setCrewFilters,
        setRefreshView,tabValue, fieldId, tLTasksExtraSaved, setSorters, activeTVOrder} = props;
 
    //STATE
    const [crewFilterOpen, setCrewFilterOpen] = useState(null)
    const [selectCrewFilterMenuOpen,setSelectCrewFilterMenuOpen] = useState(false);
    const [ctrl, setCtrl] = useState(false);
    const [filterType, setFilterType] = useState(fieldId);
    
    const [isVisible, setIsVisible] = useState(!!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === filterType ));

    useEffect(()=>{
        if(activeTaskView && taskViews?.length > 0){
            setIsVisible( !!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === filterType ));
        }
    }, [activeTaskView])


    useEffect(() => {
        if(crewFilterOpen == null){
            var tmp = window.localStorage.getItem('crewFilterOpen');
            var tmpParsed;
            if(tmp != null && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed != null){
                setCrewFilterOpen(tmpParsed);
            }else{
                setCrewFilterOpen(false);
            }
        }
        if((crewFilterOpen != null)){
            window.localStorage.setItem('crewFilterOpen', JSON.stringify(crewFilterOpen));
        }
        
    }, [crewFilterOpen]);
    

    //CSS
    const classes = useStyles({ctrl, filterLength: crewFilters?.length });


    const handleOpenCrewFilter = (event)=>{
        setCrewFilterOpen(true);
        setSelectCrewFilterMenuOpen(true);
    }

    const handleClearAndCloseCrewFilter = (event)=>{
        setCrewFilterOpen(false);
        setCrewFilters([]);
        handleRefreshView()
    }

    const handleUpdateInstallDateFilter =(value)=>{
        console.log("Value ", value);

        if(value.find((item)=> item === "clear")){
            setCrewFilters([])
            handleCloseSelectMenu();
            handleRefreshView()
            return;
        }

        var newArray = value.map((item)=>{
            return ({property: filterType, value: item})
        })
        if(!ctrl){
            newArray = newArray.slice(newArray.length-1)
        }

        setCrewFilters(newArray);
        setSorters([{property: activeTVOrder, 
            direction: "ASC"}])

        if(!ctrl){
            handleCloseSelectMenu();
        }else{
            
        }
        handleRefreshView()
    }

    const handleCloseSelectMenu = (event)=>{
        setSelectCrewFilterMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectCrewFilterMenuOpen(true);
    }

    const handleCheckCtrlIsDown = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null ){
          console.error("Bad keycode or element on handleCheckCtrlIsDown");
          return;
        }
        if(keyCode === 17 && selectCrewFilterMenuOpen){ //enter key & input element's id
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
        if(keyCode === 17 && selectCrewFilterMenuOpen){ //enter key & input element's id
          setCtrl(false);
        }
    }

    if(!isVisible){
        return <></>
    }
    
    return(
        <>
                {selectCrewFilterMenuOpen && tLTasksExtraSaved ? 
                <div className={classes.filterInstallDateDiv}>
                    <KeyBinding type={"keydown"} onKey={ (e) => handleCheckCtrlIsDown(e.keyCode, e) } />
                    <KeyBinding type={"keyup"} onKey={ (e) => handleCheckCtrlIsUp(e.keyCode, e) } /> 
                    <Select  multiple
                            autoWidth
                            id={"crewFilter"}
                            className={classes.selectBox}
                            value={(crewFilters?.map((item)=> (item.value))
                            )}
                            open={selectCrewFilterMenuOpen}
                            onOpen={handleOpenSelectMenu}
                            onClose={handleCloseSelectMenu}
                            className={classes.filterInstallDate}
                            onChange={event => handleUpdateInstallDateFilter(event.target.value)}
                            >
                        {(()=> {
                            var array = [...tLTasksExtraSaved].map((task)=> task[filterType])
                                           .filter((v, i, array)=> array.indexOf(v)===i && v != null )
                            var newArray = array.sort((a, b) => { return a - b })
                            return [...newArray.map((item,i)=>{
                                var crew_leader_name = tLTasksExtraSaved.find((task)=> item == task[filterType])[ filterType == "install_crew" ? 'install_crew_leader' : 'drill_crew_leader' ]
                                return( 
                                <MenuItem className={classes.menuItem} value={item}>{crew_leader_name ? crew_leader_name : `Crew ${item}`}</MenuItem>
                                );
                            }), <MenuItem className={classes.menuItem} value={'clear'}>Clear</MenuItem> ] ;
                        })()}
                    </Select> 
                    <span>
                        <DeleteIcon className={classes.clearInstallDateFilterIcon} onClick={event => handleClearAndCloseCrewFilter(event)}/>
                    </span>
                </div> : 
                // <Button className={classes.installDateFilterButton}
                //     onClick={event => handleOpenCrewFilter(event)}
                //     variant="text"
                //     color="secondary"
                //     size="medium"
                // >
                //     <DateIcon/>
                //     <Box display={{ xs: 'none', md: 'inline' }}  component="span">Install Date Filter</Box>
                // </Button>
                <div>
                    <FilterIcon className={classes.icon} onClick={event => handleOpenCrewFilter(event)}/>
                </div>
                }
        </>
    );

} 

export default CrewFilter;

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
