import React, {useState} from 'react';

import {makeStyles, Grid} from '@material-ui/core';

import SingleImageModal from '../../../UI/SingleImageModal';

const TasksMap = (props) => {
    //const {} = props;

    const classes = useStyles();

   

    return(
        <>
        <Grid container className={classes.heading}>
            <Grid item xs={12}>
                <h3>Tasks (Home) - Task Map View</h3>
            </Grid>
        </Grid>

        <Grid container className={classes.info_item}>
            <Grid item xs={3} className={classes.info_item_head}>
                <span className={classes.info_item_head_text}>Task Map basic info:</span>
                <SingleImageModal imageSrc={'/static/HelpImages/taskmap.png'}
                                 imageTitle={"Task Map"} 
                                 thumbDivStyle={classes.thumb_img_div} 
                                 thumbImgStyle={classes.thumb_img}/>
            
            </Grid>
            <Grid item xs={9} className={classes.info_item_info}>
                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Task Map</span>
                    <span className={classes.info_item_info_text}>
                        The Task Map's purpose is to assist in prioritizing an Active Task List by using job location. 
                        A map will make it easier to assign specific crews their own priority.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Active Task List</span>
                    <span className={classes.info_item_info_text}>
                        An active Task List means that current task list is active for all sections (TaskList, Task Table, Map) of the Task(Home) page. 
                        The task will remain active unless if it is manually changed, if you select new tasks on the Task Table section, 
                        or if you remove a task from a task list in the Map section.
                    </span>
                </div>
            </Grid>
        </Grid>

        <Grid container className={classes.info_item}>
            <Grid item xs={3} className={classes.info_item_head}>
                <span className={classes.info_item_head_text}>Task Map:</span>
                <SingleImageModal imageSrc={'/static/HelpImages/taskmapmap.png'}
                                 imageTitle={"Task List Toolbar"} 
                                 thumbDivStyle={classes.thumb_img_div} 
                                 thumbImgStyle={classes.thumb_img}/>
            </Grid>
            <Grid item xs={9} className={classes.info_item_info}>
                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Map Markers</span>
                    <span className={classes.info_item_info_text}>
                    Each marker on the map represents a task. Click on the marker to view more information. 
                    The selected task will also appear on the sidebar.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Map Marker Weather</span>
                    <span className={classes.info_item_info_text}>
                    Each mapped task has viewable weather forcast. Click on a Map Marker, and select the weather button to view specific weather info.
                    </span>
                </div>
            </Grid>
           
        </Grid>

        <Grid container className={classes.info_item}>
            <Grid item xs={3} className={classes.info_item_head}>
                <span className={classes.info_item_head_text}>Task Map Sidebar:</span>
                <SingleImageModal imageSrc={'/static/HelpImages/taskmapsidebar.png'}
                                 imageTitle={"Task List Table"} 
                                 thumbDivStyle={classes.thumb_img_div} 
                                 thumbImgStyle={classes.thumb_img}/>
                <div>

                </div>
            </Grid>
            <Grid item xs={9} className={classes.info_item_info}>
                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Change Task List</span>
                    <span className={classes.info_item_info_text}>
                        Activate a Task List or to change to a different one.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Add To/Create Task List</span>
                    <span className={classes.info_item_info_text}>
                        This button appears when there is no active Task List. This will either add currently mapped/selected items to an existing or new Task List.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Reorder Tasks</span>
                    <span className={classes.info_item_info_text}>
                    With an active Task List, you can easily reorder Tasks in the sidebar by dragging and dropping tasks in your preferred order.
                     It will save automatically.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Task Modal/Edit Task</span>
                    <span className={classes.info_item_info_text}>
                    To open the Task Modal to view all Task information, right click or click the edit button on the right of the task in the TL table. 
                    You can edit a Task’s basic information, address, delivery/install status, work order itemization status, Task status, and assigned Task List in this window.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Remove Task from TL</span>
                    <span className={classes.info_item_info_text}>
                        To remove Task from the active Task List, select the Task in the sidebar and click the ‘x’ on the right of the Task in the TL Table. 
                        This does not delete the task permanently. 
                        You can also perform this action in the Task Modal by clicking “REMOVE FROM TASKLIST”.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Unmapped Markers</span>
                    <span className={classes.info_item_info_text}>
                        Rarely there will be a task with a bad location. The enitities address (geolocation) will need to be updated!
                    </span>
                </div>
            </Grid>
           
        </Grid>
        
        </>
    );
}
export default TasksMap;

const useStyles = makeStyles(theme => ({
    heading:{
        backgroundColor: '#404654',
        color: '#e5f4f6',
        marginBottom: '12px',
    },
    info_item:{
        margin: '2px 0px',
        padding: '1% 2%',
        borderBottom: '1px solid #ececec'
    },
    info_item_container:{
        margin: '0px 0px 6px 0px',
        padding: '1% 2%',
    },
    info_item_head_text:{
        fontWeight:'600',
        fontSize: '15px',
        fontVariantCaps: 'all-small-caps',
        color: '#ce7500',
        border: '1px solid #d4d4d4',
        padding: '3px'
    },
    info_item_head:{
        textAlign: 'left',
    },
    info_item_info:{
        textAlign: 'left',
    },
    info_item_subhead:{
        display: 'block',
        color: '#006b96',
        fontWeight: '600',
    },
    info_item_info_text:{
        display: 'block',
        fontSize: '11px',
        color: '#232a32',
    },
    thumb_img_div:{
        width: '100%',
        padding: '7%',
        cursor: 'pointer',
        
    },
    thumb_img:{
        width: '100%',
        boxShadow: '0px 5px 8px 0px rgba(0,0,0,0.12)',
        '&:hover':{
            boxShadow: '0px 5px 8px 0px rgba(0,0,0,0.32)'
        },
        border: '1px solid #9a9a9a',
    },
    small_thumb_img:{
        width: '40%',
        boxShadow: '0px 5px 8px 0px rgba(0,0,0,0.12)',
        '&:hover':{
            boxShadow: '0px 5px 8px 0px rgba(0,0,0,0.32)'
        },
        border: '1px solid #9a9a9a',
    }
}));
