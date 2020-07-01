import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Modal, Backdrop, Fade, ButtonGroup, Button, Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText, FormControlLabel, Switch,Grid, List, FilledInput } from '@material-ui/core';



import CircularProgress from '@material-ui/core/CircularProgress';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import TaskLists from '../../../js/TaskLists';
import {createFilter} from '../../../js/Filter';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

const TaskListFilter = (props) => {
   

    
    //PROPS
    const { taskListTasks, setTaskListTasks, filters, setFilters, openTaskList, table_info} = props;

    const {taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen, priorityList, setPriorityList, setSelectedIds, setMapRows} = useContext(TaskContext);

    //STATE
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [taskListTasksSaved, setTaskListTasksSaved] = useState(taskListTasks ? taskListTasks : []);

    //CSS
    const classes = useStyles();

    //Filter
    useEffect(()=>{
        if (Array.isArray(filters) && filters.length) {
            if (taskListTasks && taskListTasks.length) {
                var tmpData = taskListTasks.filter(createFilter(...filters))
                console.log(tmpData);
                var copyObject = [...tmpData];
                setTaskListTasks(copyObject);
                cogoToast.success(`Filtering by ${filters.map((v, i)=> v.property + ", ")}`);
            }
        }
        if(Array.isArray(filters) && !filters.length){
            setTaskListTasks(null);
        }
    },[filters]);

    useEffect(()=>{
        if(taskListTasksSaved.length == 0 && taskListTasks){
            setTaskListTasksSaved(taskListTasks);
        }
    },[taskListTasks]);
    
    const handleModalOpen = () => {
        setFilterModalOpen(true);
    };

    const handleModalClose = () => {
        setFilterModalOpen(false);
    };

    const handleListFilter = (event, field, fieldItem) =>{
        if(!field || !fieldItem){
            cogoToast.error("Bad field or item");
            return;
        }
        if(!table_info){
            cogoToast.error("Bad field while trying to sort");
            return;
        }

        //fix strings , parenthesis dont work for some reason
        var fixedFieldItem = fieldItem.replace('(', '\\(').replace(')','\\)')

        //no filters yet
        if(!filters || filters.length <= 0){
            setFilters([{
                property: field, 
                value: fixedFieldItem
            }]);
        }
        //existing filters
        if(filters && filters.length > 0){
            //check for filter 
            var tmpString = fixedFieldItem.toString();
            var tmpNewFilter = {
                property: field, 
                value: tmpString,
            };
            console.log("String", tmpString);
            console.log("Object", tmpNewFilter);
            console.log("filters", filters);

            //not in filters yet
            var test = filters.filter((v , i)=> { console.log("v",v); return v.property == tmpNewFilter.property && v.value == tmpNewFilter.value});
            console.log("TEST",test);
            if(test && test.length == 0){
                setFilters([...filters, tmpNewFilter]);
            }else{
                //skip
                return;
            }
        }
    }

    const handleClearFilters = (event)=>{
        setFilters([]);
    }

    const handleSelectField = (event, item) => {
        if(!item || !item.field){
            return;
        }
        setSelectedField(item);
    }
     
    return(
        <>
        {openTaskList ? 
        <>
            <div>
                <span onClick={event=> handleModalOpen()}>FILTER</span>
                <span onClick={event=> handleClearFilters(event)}>Clear Filters</span>
            </div> 
            <Modal aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={filterModalOpen}
                onClose={handleModalClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}>
                <Fade in={filterModalOpen}>
                    <div className={classes.container}>
                    <Grid container >  
                        <div className={classes.modalTitleDiv}>
                            <span id="transition-modal-title" className={classes.modalTitle}>
                                Task Filters
                            </span>
                        </div>
                        <Grid item xs={3} className={classes.paper}>
                            <List>
                            {table_info ? 
                                <>
                                    {table_info.map((item,i)=>{
                                        const isSelected = selectedField === item; 
                                        return(
                                            <ListItem key={item.field + i} dense button
                                                onMouseUp={event => handleSelectField(event, item)}
                                                className={isSelected ? classes.fieldListItemSelected : classes.fieldListItem}
                                            >
                                                <ListItemText className={classes.fieldListItemText}>
                                                    {item.text}
                                                </ListItemText>
                                            </ListItem>
                                            );
                                    })}
                                </>
                            :<></> }
                            </List>
                        </Grid>
                        <Grid item xs={9} className={classes.paper}>
                        <List>
                            {selectedField && taskListTasksSaved ? 
                                <>
                                    {taskListTasksSaved.map((task)=> task[selectedField.field]).filter((v, i, array)=> array.indexOf(v)===i ).map((item,i)=>{
                                        return(
                                            <ListItem key={selectedField.field + i} dense button
                                               onClick={event=> handleListFilter(event, selectedField.field, item)}
                                            >
                                                <ListItemText>
                                                    {item}
                                                </ListItemText>
                                            </ListItem>
                                            );
                                    })}
                                </>
                            :<></> }
                            </List>
                        </Grid>
                    </Grid>
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                            <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                    onClick={handleModalClose}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.closeButton}
                                >
                                    Close
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                    </div>
                </Fade>
            </Modal>
        </>
            : <></>}
        
        </>
    );

} 

export default TaskListFilter;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '.62% .3% .3% .3%',
        margin: '0px 0px 5px 5px',
        backgroundColor: '#eee',
        height: '100%',

    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: '2% 3% 3% 3% !important',
        position: 'relative',
        width: '100%',
        overflowY: 'auto',
        maxHeight: '500px',
        minHeight: '500px',
        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },
    modal:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1 !important',
        '&& div':{
            outline: 'none',
        },
    },
    container: {
        width: '60%',
        maxWidth: '70%',
        textAlign: 'center',
        minHeight: '600px'
    },
    modalTitleDiv:{
        backgroundColor: '#5b7087',
        padding: '5px 0px 5px 0px',
        width: '100%',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#fff',
    },
    paper_footer: {
        backgroundColor: '#ececec',
        padding: '1% !important',
        display: 'flex',
        justifyContent:'flex-end',
    },
    buttonGroup: {
        '& .MuiButton-label':{
            color: '#fff',
        },
        '&:hover':{
            '& .MuiButton-label':{
                color: '#333333',
                
            },
        }
    },
    closeButton:{
        backgroundColor: '#414d5a',
        
    },
    fieldListItem:{
        backgroundColor: "#c6ccd3",
        color: '#2d343b',
        border: '1px solid #ececec',
        
    },
    fieldListItemSelected:{
        backgroundColor: "#c8ffff",
        color: '#0f447a',
        border: '1px solid #c8ffff',
        '&:hover':{
            border: '1px solid #d88f08'
        }
    },
    fieldListItemText:{
        '& span':{
            fontWeight: '600'
        }
    }

      
  }));
