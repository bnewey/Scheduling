import React, {useState} from 'react';

import {makeStyles, Grid} from '@material-ui/core';

import SingleImageModal from '../../../UI/SingleImageModal';

const TasksTable = (props) => {
    //const {} = props;

    const classes = useStyles();

   

    return(
        <>
        <Grid container className={classes.heading}>
            <Grid item xs={12}>
                <h3>Tasks (Home) - Task Table View</h3>
            </Grid>
        </Grid>

        <Grid container className={classes.info_item}>
            <Grid item xs={3} className={classes.info_item_head}>
                <span className={classes.info_item_head_text}>Task Table basic info:</span>
                <SingleImageModal imageSrc={'/static/HelpImages/tasktablefull.png'}
                                 imageTitle={"Task List"} 
                                 thumbDivStyle={classes.thumb_img_div} 
                                 thumbImgStyle={classes.thumb_img}/>
            
            </Grid>
            <Grid item xs={9} className={classes.info_item_info}>
                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Task Table</span>
                    <span className={classes.info_item_info_text}>
                        The Task Table is a table of Tasks created from Work Orders. The table automatically updated from new work orders.
                         The main purpose of the Task Table, is to easily create a list of tasks (Task List). Select multiple Tasks on the table and save 
                        it as a Task List. 
                    </span>
                </div>
            </Grid>
        </Grid>

        <Grid container className={classes.info_item}>
            <Grid item xs={3} className={classes.info_item_head}>
                <span className={classes.info_item_head_text}>Task Table:</span>
                
            </Grid>
            <Grid item xs={9} className={classes.info_item_info}>
                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Select Multiple Tasks</span>
                    <span className={classes.info_item_info_text}>
                        You can select multiple tasks on the Task Table. You can select as many tasks as you want,
                         but you cannot Map or Create a Task List with more than 50.
                    </span>
                    <span className={classes.info_item_info_text}>
                        If there is an Active Task List, selecting/deselecting a task will deactivate that Active Task List.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Filter</span>
                    <span className={classes.info_item_info_text}>
                        Filter the Table by selecting the Filter Button next to the column name. If you have items selected while filtering, they will continue
                         to be selected, but hidden. Active Filters make the Filter Icon red. Filteres are reset if you refresh the page. 
                    </span>
                    <SingleImageModal imageSrc={'/static/HelpImages/filtersearch.png'}
                                 imageTitle={"Filter Search"} 
                                 thumbDivStyle={classes.thumb_img_div} 
                                 thumbImgStyle={classes.small_thumb_img}/>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Filter Selected Only</span>
                    <span className={classes.info_item_info_text}>
                    Filters the table to show only the selected Tasks or Tasks within the active Task List. The regular filters are not available with this activated. 
                    </span>
                    <SingleImageModal imageSrc={'/static/HelpImages/tableselectedonly.png'}
                                 imageTitle={"Filter Selected Only"} 
                                 thumbDivStyle={classes.thumb_img_div} 
                                 thumbImgStyle={classes.small_thumb_img}/>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Sort</span>
                    <span className={classes.info_item_info_text}>
                    Sort the table by selecting the up or down array next to a column name. Default sort is by Task # (newest first). Sorting is reset if you refresh the page.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Search</span>
                    <span className={classes.info_item_info_text}>
                    Search for a specific task by clicking the Filter Icon next to a column name, and typing in the search bar.
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Task Modal/Edit Task</span>
                    <span className={classes.info_item_info_text}>
                    Right click on a task to open the Task Modal (Edit task view).
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Select/Deselect All</span>
                    <span className={classes.info_item_info_text}>
                    Clicking the select all will select all tasks. Clicking deselect all will deselect all selected tasks. 
                    </span>
                </div>

                <div className={classes.info_item_container}>
                    <span className={classes.info_item_subhead}>Map Tasks</span>
                    <span className={classes.info_item_info_text}>
                    Click the MAP TASKS button to view currently selected or active Task List Tasks on the map.
                    </span>
                </div>
                
            </Grid>
        </Grid>
        
        </>
    );
}
export default TasksTable;

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
