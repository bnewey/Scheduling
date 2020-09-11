
import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, Grid, TextField, Select, MenuItem} from '@material-ui/core';

import Tasks from '../../../js/Tasks';
import Crew from '../../../js/Crew';
import Util from '../../../js/Util';
import TaskLists from '../../../js/TaskLists';

import { TaskContext } from '../TaskContainer';
import { CrewContext} from '../Crew/CrewContextContainer';
import cogoToast from 'cogo-toast';


import Timeline, {TimelineMarkers, TodayMarker, TimelineHeaders, DateHeader} from 'react-calendar-timeline'
import moment from 'moment'
import TaskListFilter from '../TaskList/TaskListFilter';


import {createFilter} from '../../../js/Filter';


const CalendarContainer = (props) => {
    const classes = useStyles();

    //const {} = props;

    const {taskLists, setTaskLists, taskListTasksSaved, setTaskListTasksSaved, filterInOrOut, filterAndOr, taskListToMap, filters,
        setModalTaskId, setModalOpen } = useContext(TaskContext);
    const {setShouldResetCrewState, crewMembers, setCrewMembers, crewModalOpen, setCrewModalOpen, allCrewJobs, 
        allCrewJobMembers, setAllCrewJobMembers, setAllCrewJobs, memberJobs,setMemberJobs, allCrews, setAllCrews} = useContext(CrewContext);
   
    const [calendarRows, setCalendarRows] = useState(null);
    const [groups, setGroups] = useState(null);
    const [items, setItems] = useState(null);


    const [timeStart, setTimeStart] = useState(moment()
                            .startOf("week")
                            .valueOf())
    const [timeEnd, setTimeEnd] = useState( moment()
                            .startOf("week")
                            .add(14, "day")
                            .valueOf())
    const [zoomUnit, setZoomUnit] = useState(null);


    useEffect(()=>{
        if(allCrews){
            setGroups([...allCrews.map((crew, i)=>(
                {
                    id: crew.id,
                    title: crew.crew_leader_name ? crew.crew_leader_name : 'Crew '+crew.id,
                    stackItems: true,
                }
            )), {id: 0, title: "No Crew",stackItems: true,} ])
        }
    },[allCrews])

    useEffect(()=>{
        if(calendarRows && calendarRows.length > 0){
            console.log("calendarRows",calendarRows)
            setItems(calendarRows.flatMap((task,i)=>{
                var task_array = [];
                if(task.drill_crew != null){
                    task_array.push({
                        id: (task.t_id.toString() + '#drill_date'),
                        group: task.drill_crew,
                        title: 'D-'+task.t_name,
                        start_time: new Date(task.drill_date).getTime() ,
                        end_time: new Date(task.drill_date).getTime() + 86400000,
                    })
                }
                if(task.install_crew != null){
                    task_array.push({
                        id: (task.t_id.toString() + '#sch_install_date'),
                        group: task.install_crew,
                        title: 'I-'+task.t_name,
                        start_time: new Date(task.install_date).getTime() ,
                        end_time: new Date(task.install_date).getTime()  + 86400000,
                    })
                }
                //Neither and install date
                if(task.drill_crew== null && task.install_crew== null && task.install_date){
                    task_array.push({
                        id: (task.t_id.toString() + '#sch_install_date'),
                        group: 0,
                        title: 'I-'+task.t_name,
                        start_time: new Date(task.install_date).getTime() ,
                        end_time: new Date(task.install_date).getTime()  + 86400000,
                    })
                }
                //Neither and drill date
                if(task.drill_crew== null && task.install_crew== null && task.drill_date){
                    task_array.push({
                        id: (task.t_id.toString() + '#drill_date'),
                        group: 0,
                        title: 'D-'+task.t_name,
                        start_time: new Date(task.drill_date).getTime() ,
                        end_time: new Date(task.drill_date).getTime()  + 86400000,
                    })
                }
                return (task_array)
            }));
        }
    },[calendarRows])
    
    //Modal
    const handleRightClick = (id, event, time) => {
        console.log("id", id);
        var tmp = id.split('#');
        var split_id = tmp[0];
        //Drill, install, no crew drill/install
        var split_type = tmp[1];
        
        setModalTaskId(split_id);
        setModalOpen(true);
  
        //Disable Default context menu
        event.preventDefault();
      };

    //
    useEffect(()=>{
        if(zoomUnit == null){
            var tmp = window.localStorage.getItem('zoomUnit');
            var tmpParsed;
            if(tmp && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed){
                handleTimeHeaderChange(tmpParsed);
            }else{
                handleTimeHeaderChange("biweek");
            }
        }
        if((zoomUnit)){
            window.localStorage.setItem('zoomUnit', JSON.stringify(zoomUnit));
        }
    }, [zoomUnit])

    //Filter
    useEffect( () =>{ //useEffect for inputText
        if(calendarRows == null && filterInOrOut != null && filterAndOr != null){
            if(taskLists && taskListToMap && taskListToMap.id ) { 
              TaskLists.getTaskList(taskListToMap.id)
              .then( (data) => {
                  if(!Array.isArray(data)){
                      console.error("Bad tasklist data",data);
                      return;
                  }
                  var tmpData = [];
  
                  if(filters && filters.length > 0){
                    //If more than one property is set, we need to filter seperately
                    let properties = new Set([...filters].map((v,i)=>v.property));
                    
                    properties.forEach((index,property)=>{
                      
                      let tmpFilter = filters.filter((v,i)=> v.property == property);
                      let tmpTmpData;
  
                      //On or use taskListTasksSaved to filter from to add to 
                      if((filterAndOr == "or" && filterInOrOut == "in") || (filterAndOr == "and" && filterInOrOut == "out") ){
                          if(tmpFilter.length > 1){
                              //Always use 'or' on same property
                              tmpTmpData = data.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                          }
                          if(tmpFilter.length <= 1){
                              tmpTmpData = data.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                              //console.log("MapContainer tmpData in loop", tmpData);
                          }
                          //Add to our big array
                          tmpData.splice(tmpData.length, 0, ...tmpTmpData);
                          //Remove duplicates
                          tmpData.splice(0, tmpData.length, ...(new Set(tmpData)));
                      }
  
                      //On and use tmpData to filter from
                      if((filterAndOr == "and" && filterInOrOut == "in") || (filterAndOr == "or" && filterInOrOut == "out")){
                          if(tmpData.length <= 0){
                            tmpData = [...data];
                          }  
                          if(tmpFilter.length > 1){
                              //Always use 'or' on same property
                              tmpData = tmpData.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                          }
                          if(tmpFilter.length <= 1){
                              tmpData = tmpData.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                              console.log("MapContainer tmpData in loop", tmpData);
                          }
                      }
                      
                      console.log("TaskListFilter each loop, ",tmpData);
                    })              
                  }else{
                    console.log("else on filters && filters.length > 0")
                  }
                  
                  setTaskListTasksSaved(data);
                  
                  //No filters 
                  if(filters && !filters.length){
                    //no change to tmpData
                    tmpData = [...data];
                  }
                  //Set TaskListTasks
                  if(Array.isArray(tmpData)){
                      setCalendarRows(tmpData);
                  }
  
              })
              .catch( error => {
                  cogoToast.error(`Error getting Task List`, {hideAfter: 4});
                  console.error("Error getting tasklist", error);
              })
          }else{
            console.log("else on taskLists && taskListToMap && taskListToMap.id ");
          }
        }else{
          console.log("else on calendarRows == null && filterInOrOut != null && filterAndOr != null")
        }
          
        
        return () => { //clean up
        }
      },[calendarRows,filterInOrOut, filterAndOr,taskLists, taskListToMap]);
    //end of Filter

    const handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) =>{
        //updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
        setTimeStart(visibleTimeStart);
        setTimeEnd(visibleTimeEnd);
    }
    
   
    
    const handleOnZoom = (timelineContext) => {
        console.log("timeline context", timelineContext);   
    }

    const handleTimeHeaderChange = (unit) =>{
        setZoomUnit(unit);
        switch (unit){
            case 'week':
                
                setTimeStart(moment()
                        .startOf("week")
                        .valueOf())
                setTimeEnd(moment()
                        .endOf("week")
                        .valueOf());
                
                break;
            case 'biweek':
                setTimeStart(moment()
                        .startOf("week")
                        .valueOf())
                setTimeEnd(moment()
                        .endOf("week")
                        .add(7,'day')
                        .valueOf());
                break;
            case 'month':
                setTimeStart(moment()
                        .startOf("week")
                        .valueOf())
                setTimeEnd(moment()
                        .endOf("week")
                        .add(30,'day')
                        .valueOf());
                break;
            case 'year':
                setTimeStart(moment()
                        .startOf("year")
                        .valueOf())
                setTimeEnd(moment()
                        .endOf("year")
                        .valueOf());
                break;
        }
    }
    const format  = {
        year: {
          long: 'YYYY',
          mediumLong: 'YYYY',
          medium: 'YYYY',
          short: 'YY'
        },
        month: {
          long: 'MMMM YYYY',
          mediumLong: 'MMMM',
          medium: 'MMMM',
          short: 'MM/YY'
        },
        week: {
          long: 'w',
          mediumLong: 'w',
          medium: 'w',
          short: 'w'
        },
        day: {
          long: 'dddd, LL',
          mediumLong: 'dddd, LL',
          medium: 'dd D',
          short: 'D'
        },
        hour: {
          long: 'dddd, LL, HH:00',
          mediumLong: 'L, HH:00',
          medium: 'HH:00',
          short: 'HH'
        },
        minute: {
          long: 'HH:mm',
          mediumLong: 'HH:mm',
          medium: 'HH:mm',
          short: 'mm',
        }
        }

    const handleLabelFormats = (times, unit, labelWidth, formatOptions = format ) => {

        var return_string = "";
        var format_string = ""; 
        if(labelWidth < 45){
            format_string = format[unit].short; 
        }else if(labelWidth > 150){
            format_string = format[unit].mediumLong;
        }else{
            format_string = format[unit].medium;
        }
        return_string = moment(times[0], "dddd").format(format_string);
        return return_string;
    }

    const handleItemMoved = (itemId, dragTime, newGroupOrder) => {
        var tmp_array = itemId.split('#');
        var id = tmp_array[0];
        var type = tmp_array[1];
        var job_id_type = type == 'sch_install_date' ? 'install' : 'drill';
        console.log("job_id_type", job_id_type);
        var crew_job = allCrewJobs.filter((item,i)=> item.task_id == id && item.job_type == job_id_type )[0]
        var job_id; 
        var date = moment(dragTime).format("YYYY-MM-DD");
        var what_to_run;
        if(crew_job){
            job_id = crew_job.id;
            if(groups[newGroupOrder].id == 0){
                what_to_run == "delete";
            }else{
                what_to_run = "update";
            }
        }else{
            if(groups[newGroupOrder].id == 0){
                what_to_run = "nothing";
            }else{
                what_to_run = "create"; 
            }
        }
        console.log("what_to_run", what_to_run);


        const getFunction = (method) =>{
            if(method == "delete"){
                return Crew.deleteCrewJob(job_id);
            }
            if(method == "update"){
                return  Crew.updateCrewJob( groups[newGroupOrder].id,job_id);
            }
            if(method == "nothing"){
                return  ;
            }
            if(method == "create"){
                return  addCrewJobs([id], [job_id_type], groups[newGroupOrder].id)
            }
        }

        
        //Need to add moving from no crew to crew
        Promise.all([Tasks.updateMultipleTaskDates([id], date, type),  getFunction()  ])
        .then((values)=>{
            setCalendarRows(null);
        })
        .catch((error)=>{
            console.error("Fail to move item", error)
            cogoToast.error("Failed to moved item");
            setCalendarRows(null);
        })
    }

    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={12}>
                <TaskListFilter filteredItems={calendarRows} setFilteredItems={setCalendarRows}/>
          </Grid>
        </Grid>

        
        { groups && items && <>
        
            <div className={classes.timeline_div}>
                <div className={classes.timeline_toolbar}>
                    <Grid container >
                        <Grid item xs={11}>

                        </Grid>
                        <Grid item xs={1}>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select
                                id="demo-simple-select-outlined"
                                value={zoomUnit}
                                onChange={event => handleTimeHeaderChange(event.target.value)}
                                classes={{ select: classes.selectZoom}}
                                >
                                <MenuItem value={"week"}>Week</MenuItem>
                                <MenuItem value={"biweek"}>Biweek</MenuItem>
                                <MenuItem value={"month"}>Month</MenuItem>
                                <MenuItem value={"year"}>Year</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    
                </div>
                <Timeline
                        groups={groups}
                        items={items}
                        visibleTimeStart={timeStart}
                        visibleTimeEnd={timeEnd}
                        dragSnap={ 86400 * 1000}
                        lineHeight={allCrews ? 35 : 35}
                        itemHeightRatio={allCrews ? .8 : .80}
                        onItemMove={(itemId, dragTime, newGroupOrder)=>handleItemMoved(itemId, dragTime, newGroupOrder)}
                        onTimeChange={(visibleTimeStart, visibleTimeEnd, updateScrollCanvas)=>handleTimeChange(visibleTimeStart, visibleTimeEnd, updateScrollCanvas)}
                        canResize={false}
                        minZoom={24*60 * 60 * 1000}
                        sidebarWidth={100}
                        onItemContextMenu={(itemId,e,time)=>handleRightClick(itemId,e,time)}
                        onZoom={(timelineContext)=> handleOnZoom(timelineContext)}
                >
                    <TimelineHeaders>
                    <DateHeader unit="primaryHeader"/>
                        <DateHeader labelFormat={handleLabelFormats}/>
                    </TimelineHeaders>
                    <TimelineMarkers>
                        <TodayMarker interval={1000*60*15} />
                    </TimelineMarkers>
                    
                </Timeline> 
                
            </div></>}
        
        </div>
    );
    }

export default CalendarContainer;

const useStyles = makeStyles(theme => ({
    root: {

    },
    map:{
    },
    infoWindow: {
      backgroundColor: '#000'
    },
    mainContainer:{
        padding: '2%',
    },
    timeline_div:{
        backgroundColor: '#f1f1f1',
        marginTop: '.5%',
        padding: '1%',
        borderRadius: '4px',
    },
    timeline_toolbar:{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0px 0px 10px 5px',
    },
    formControl:{

    },
    selectZoom:{
        padding: '10px 20px',
        background: "#fff",
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
    }
  }));