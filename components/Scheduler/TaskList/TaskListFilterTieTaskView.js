import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton} from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';

import Settings from '../../../js/Settings';
import { TaskContext } from '../TaskContainer';
import cogoToast from 'cogo-toast';



const TaskListFilterTieTaskView = React.memo(  (props) => {
 
    //PROPS
    const { taskUserFilter, setTaskUserFilters, setTaskListFiltersEdited , taskViews} = props;
    const { filters, user, filterInOrOut, filterAndOr } = useContext(TaskContext);

    //STATE
    const [tieOpen, setTieOpen] = React.useState(false);
    const [selectedTaskView, setSelectedTaskView] = React.useState(taskUserFilter?.task_view || 0);

    //CSS
    const classes = useStyles();


    //FUNCTIONS

    const handleTieClickOpen = (event) => {
        setTieOpen(true);   
    };

    const handleTieClose = () => {
        setSelectedTaskView(null);
        setTieOpen(false);
    };

    const setActiveTaskViewProp =(value) =>{
        if(isNaN(value)){
            console.error("Bad param in setActiveTaskViewProp");
            console.log("Value", value)
            return;
        }

        let tmp = taskViews.find((item)=>  item.value == value)?.value || 0
        
        if(!isNaN(tmp)){
            console.log("Tmp", tmp)
            setSelectedTaskView(tmp);
        }else{
            console.error("Bad tmp value in setActiveTaskViewProp")
            cogoToast.error("Internal Server Error");
        }
        
    }
  

    const handleUpdateFilter = (event, taskView) =>{
        console.log("taskView", taskView)
        if(isNaN(taskView )){
            console.error("Bad parameters in handleUpdateFilter filter save")
            return;
        }
        Settings.updateFilterTaskViewTie(taskUserFilter.id, taskView)
            .then((response) => {
                
                //refetch tasklists
                setTaskUserFilters(null);
                setTaskListFiltersEdited(true);
                handleTieClose();
                cogoToast.success(`Update Saved Task Filter's task_view`, {hideAfter: 4});
            })
            .catch( error => {
                cogoToast.error(`Error updating saved task filter`, {hideAfter: 4});
                console.error(error);
        });
    }

   

    
    return(
        <React.Fragment>
            <IconButton className={classes.secondary_button} edge="end" aria-label="save"  onClick={event => handleTieClickOpen(event)}  >
                <LinkIcon />
            </IconButton> 
        
            
            { tieOpen && filters ? 
            
            <Dialog key={"dialogkey"} PaperProps={{className: classes.dialog}} open={tieOpen} onClose={handleTieClose}>
            <DialogTitle className={classes.title}>Link Task View to Filter {taskUserFilter ?  `(${taskUserFilter.name})` : ""}</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                    <span>Linking a task view to a saved filter will apply the task view when applying a saved filter.</span>
                    <select
                        id={"filterViewTieSelect"}
                        className={classes.selectBox}
                        value={selectedTaskView}
                        onChange={value => setActiveTaskViewProp(value.target.value)}
                        >
                        <option value={0}>None</option>
                        {taskViews.map((view)=>{
                            return (
                                <option value={view.value}>{view.name}</option> 
                            )
                        })}
                    </select> 
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleTieClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleUpdateFilter(event, selectedTaskView)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Save
                    </Button>
                    
             </DialogActions> 
            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} )

export default TaskListFilterTieTaskView;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        
    },
    title:{
        '&& .MuiTypography-root':{
            fontSize: '15px',
            color: '#fff',
        },
        padding: '5px 13px',
        backgroundColor: '#16233b',
  
      },
    content:{
        minWidth: '400px',
    },
    lightButton:{
        backgroundColor: '#b7c3cd',
        fontWeight: '600',
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }
    },
    openButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        margin: '0px 30px',
        fontWeight: '700',
        fontSize: '13px',
        padding: '0px 16px',
        '&:hover':{
            border: '',
            backgroundColor: '#ffedc4',
            color: '#d87b04'
        }
    },
    inputField: {
        margin: '10px 17px ',
        padding: '9px 5px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        display: 'block',
        '&& input':{
            color: '#16233b',
            minWidth: '292px',
        },
        '&& .MuiSelect-select':{
            minWidth: '292px',
            color: '#000',
            fontSize: '15px'
        },
        '&& .MuiOutlinedInput-multiline': {
        },
        '&& label':{
            backgroundColor: 'rgba(0, 0, 0, .00)',
            color: '#16233b',
            fontWeight: '500',
            fontSize: '14px'
        }
    },
    textField:{
        display: 'block',
        minWidth: '120px',
    },
    darkButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid rgb(255, 237, 196)',
        fontSize: '9px',
        padding:'1%',
      '&:hover':{
        border: '',
        backgroundColor: '#e49027',
        color: '#fff'
      },
    },
    icon_small:{
        verticalAlign: 'text-bottom'
    },
    secondary_button:{
        padding: '5px',
        margin: '1%'
    },
  }));
