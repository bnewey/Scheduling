
import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';

import Tasks from '../../../js/Tasks';
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

    const {taskLists, setTaskLists, taskListTasksSaved, setTaskListTasksSaved, filterInOrOut, filterAndOr, taskListToMap, filters } = useContext(TaskContext);
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
    const [zoomUnit, setZoomUnit] = useState('biweek');



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
                        id: Number.parseInt(task.t_id.toString() + '1'),
                        group: task.drill_crew,
                        title: task.t_name,
                        start_time: new Date(task.drill_date).getTime() ,
                        end_time: new Date(task.drill_date).getTime() + 86400000,
                    })
                }
                if(task.install_crew != null){
                    task_array.push({
                        id: Number.parseInt(task.t_id.toString() + '2'),
                        group: task.install_crew,
                        title: task.t_name,
                        start_time: new Date(task.install_date).getTime() ,
                        end_time: new Date(task.install_date).getTime()  + 86400000,
                    })
                }
                //Neither and install date
                if(task.drill_crew== null && task.install_crew== null && task.install_date){
                    task_array.push({
                        id: Number.parseInt(task.t_id.toString() + '3'),
                        group: 0,
                        title: task.t_name,
                        start_time: new Date(task.install_date).getTime() ,
                        end_time: new Date(task.install_date).getTime()  + 86400000,
                    })
                }
                //Neither and drill date
                if(task.drill_crew== null && task.install_crew== null && task.drill_date){
                    task_array.push({
                        id: Number.parseInt(task.t_id.toString() + '4'),
                        group: 0,
                        title: task.t_name,
                        start_time: new Date(task.drill_date).getTime() ,
                        end_time: new Date(task.drill_date).getTime()  + 86400000,
                    })
                }
                return (task_array)
            }));
        }
    },[calendarRows])
    
    

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
        console.log("hey")
    }
    
    const handleOpenTaskModal = (id , e ,time) =>{

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

    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={12}>
                <TaskListFilter setFilteredItems={setCalendarRows}/>
          </Grid>
        </Grid>

        
        { groups && items &&
            <div className={classes.timeline_div}>
                <Timeline
                        groups={groups}
                        items={items}
                        
                        // defaultTimeStart={moment().add(-3, 'day')}
                        // defaultTimeEnd={ moment().add(14, 'day') }
                        visibleTimeStart={timeStart}
                        visibleTimeEnd={timeEnd}
                        dragSnap={ 86400 * 1000}
                        lineHeight={allCrews ? 35 : 35}
                        itemHeightRatio={allCrews ? .8 : .80}
                        onTimeChange={(visibleTimeStart, visibleTimeEnd, updateScrollCanvas)=>handleTimeChange(visibleTimeStart, visibleTimeEnd, updateScrollCanvas)}
                        canResize={false}
                        minZoom={24*60 * 60 * 1000}
                        
                        onItemContextMenu={(itemId,e,time)=>handleOpenTaskModal(itemId,e,time)}
                        onZoom={(timelineContext)=> handleOnZoom(timelineContext)}
                >
                    <TimelineHeaders>
                    <DateHeader unit="primaryHeader"/>
                        <DateHeader/>
                    </TimelineHeaders>
                    <TimelineMarkers>
                        <TodayMarker interval={1000*60*15} />
                    </TimelineMarkers>
                    
                </Timeline> 
                <div>
                    <button onClick={()=>handleTimeHeaderChange("week")}>Week</button>
                    <button onClick={()=>handleTimeHeaderChange("biweek")}>Biweek</button>
                    <button onClick={()=>handleTimeHeaderChange("month")}>Month</button>
                    <button onClick={()=>handleTimeHeaderChange("year")}>Year</button>
                    </div>
            </div>}
        
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
    }
  }));