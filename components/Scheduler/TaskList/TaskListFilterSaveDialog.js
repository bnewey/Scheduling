import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import Settings from '../../../js/Settings';
import { TaskContext } from '../TaskContainer';
import cogoToast from 'cogo-toast';



const TaskListFilterSaveDialog = React.memo(  (props) => {
 
    //PROPS
    const { taskUserFilters, setTaskUserFilters, setTaskListFiltersEdited } = props;
    const { filters, user, filterInOrOut, filterAndOr } = useContext(TaskContext);

    //STATE
    const [addOpen, setAddOpen] = React.useState(false);
    const [newFilterName, setNewFilterName] = React.useState("New Filter");

    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleAddClickOpen = (event) => {
        setAddOpen(true);   
    };

    const handleAddClose = () => {
        setNewFilterName(null);
        setAddOpen(false);
    };
  

    const handleAddNew = React.useCallback((event, name) =>{
        if(!name || !user || !filterInOrOut || !filterAndOr){
            console.error("Bad parameters in handleAddNew filter save")
            return;
        }
        Settings.addSavedTaskFilter(name, user.id, filterAndOr == "and" ? 0 : 1, filterInOrOut == "in" ? 0 : 1, filters)
            .then((response) => {
                
                //refetch tasklists
                setTaskUserFilters(null);
                setTaskListFiltersEdited(true);
                handleAddClose();
                cogoToast.success(`Added new Saved Task Filter`, {hideAfter: 4});
            })
            .catch( error => {
                cogoToast.error(`Error adding new saved task filter`, {hideAfter: 4});
                console.error(error);
        });
    },[ user, filterInOrOut, filterAndOr ])

    const NameTextField = React.useCallback(() =>{
        const handleChangeText = (value) =>{
            setNewFilterName(value);
        }
        return(<TextField key={"textField1"} id="task-list-edit-name" 
        className={classes.textField}
        label="Name"
        value={newFilterName}
        onChange={event => handleChangeText(event.target.value)}/>)
    },[newFilterName, setNewFilterName])

    
    return(
        <React.Fragment>
            <Button         
                    onClick={event => handleAddClickOpen(event)}    
                    variant="text"
                    color="secondary"
                    size="large"
                    className={classes.darkButton}
            ><AddIcon className={classes.icon_small} fontSize="small"/><span>New Saved Filter from current Filter</span></Button>
            
            { addOpen && filters ? 
            
            <Dialog key={"dialogkey"} PaperProps={{className: classes.dialog}} open={addOpen} onClose={handleAddClose}>
            <DialogTitle className={classes.title}>Name of New Saved Filter</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                {NameTextField()}
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleAddClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleAddNew(event, newFilterName)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Add
                    </Button>
                    
             </DialogActions> 
            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} )

export default TaskListFilterSaveDialog;

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
        minWidth: '500px',
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
        minWidth: '220px',
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
  }));
