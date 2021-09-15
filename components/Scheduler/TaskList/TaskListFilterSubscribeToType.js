import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Checkbox} from '@material-ui/core';
import SubscribeIcon from '@material-ui/icons/Assignment';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import Settings from '../../../js/Settings';
import { TaskContext } from '../TaskContainer';
import cogoToast from 'cogo-toast';
import _ from 'lodash';


const TaskListFilterSubscribeToType = React.memo(  (props) => {
 
    //PROPS
    const { taskUserFilter, setTaskUserFilters, setTaskListFiltersEdited } = props;
    const { filters, user, filterInOrOut, filterAndOr } = useContext(TaskContext);

    //STATE
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedType, setSelectedType] = React.useState([]);
    const [selectedRefetch,setSelectedRefetch] = React.useState(false);

    const subscribeTypes = [ {type: 'install', display: 'Install'},
                            {type: 'drill', display: 'Drill'},
                            {type: 'field', display: 'Field/Service'} ]
    //CSS
    const classes = useStyles();

    useEffect(()=>{
        if(taskUserFilter || selectedRefetch){
            if(selectedRefetch){
                setSelectedRefetch(false);
            }
            let tmp = taskUserFilter.subscribed_types;
            let tmp_array = tmp?.split(",") || [];
            setSelectedType(
                
                ()=> {
                    let test = subscribeTypes.map((item)=> {
                        console.log('tmp_array',tmp_array);
                        tmp_array.forEach((tmp_item)=>{
                            if(tmp_item == item.type){
                                item.checked = 1;
                            }
                        })
                        return item;
                
             } );
             console.log('test', test);
              return test;
             }
             )
             console.log("test")
        }
    },[taskUserFilter, selectedRefetch])

    //FUNCTIONS

    const handleSubscribeClickOpen = (event) => {
        setSelectedRefetch(true)
        setDialogOpen(true);   
    };

    const handleSubscribeClose = () => {
        setSelectedType(null);
        setDialogOpen(false);
    };

    const handleSetActiveSubscribeType =(type, checked) =>{
        if(!type){
            console.error("Bad param in handleSetActiveSubscribeType");
            console.log("Value", type)
            return;
        }

        //let tmp = subscribeTypes.find((item)=>  item.type == type)?.type;
        let tmp = [...selectedType];
        if(selectedType.find((item)=> item.type == type)){
            tmp = selectedType.map((item)=>{
                if(item.type == type){
                    item.checked = checked;
                }
                return item;
            })
        }else{
            tmp.push( ()=>{
                let tmp = subscribeTypes.find((item)=> item.type == type)
                tmp.checked = checked;
                return tmp;
            })
        }
         
        
        if(tmp){
            console.log("Tmp", tmp)
            setSelectedType(tmp);
        }else{
            console.error("Bad tmp value in handleSetActiveSubscribeType")
            cogoToast.error("Internal Server Error");
        }
        
    }

  

    const handleUpdateFilter = (event, sub_type) =>{
        console.log("sub_type", sub_type)
        if(!Array.isArray(sub_type )){
            console.error("Bad parameters in handleUpdateFilter filter save")
            return;
        }
        Settings.updateFilterTaskViewSubscribe(taskUserFilter.id , sub_type)
            .then((response) => {
                
                //refetch tasklists
                setTaskUserFilters(null);
                setTaskListFiltersEdited(true);
                setSelectedRefetch(true);
                handleSubscribeClose();
                cogoToast.success(`Update Saved Task Filter's Subscribed Type`, {hideAfter: 4});
            })
            .catch( error => {
                cogoToast.error(`Error updating saved task filter`, {hideAfter: 4});
                console.error(error);
        });
    }

   

    
    return(
        <React.Fragment>
            <IconButton className={classes.secondary_button} edge="end" aria-label="save"  onClick={event => handleSubscribeClickOpen(event)}  >
                <SubscribeIcon />
            </IconButton> 
        
            
            { dialogOpen && filters ? 
            
            <Dialog key={"dialogkey"} PaperProps={{className: classes.dialog}} open={dialogOpen} onClose={handleSubscribeClose}>
            <DialogTitle className={classes.title}>Link Task View to Filter {taskUserFilter ?  `(${taskUserFilter.name})` : ""}</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                    <span>Subscribing to a type will show tasks with open jobs of that type.</span>
                    <div >
                        {subscribeTypes.map((view)=>{
                            return (
                                <div key={`${view.type}_check_item`}><Checkbox
                                    icon={<CheckBoxOutlineBlankIcon  />}
                                    checkedIcon={<CheckBoxIcon className={classes.checkboxIcon}  />}
                                    name={view.display}
                                    checked={ selectedType?.find((item)=> item.type == view.type)?.checked ? true : false }
                                    onChange={(event)=> { handleSetActiveSubscribeType(view.type,event.target.checked ? 1 : 0) }}
                                />
                                <span>{view.display}</span></div>
                            )
                        })}
                    </div> 
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleSubscribeClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleUpdateFilter(event, selectedType)}
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

export default TaskListFilterSubscribeToType;

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
    checkboxIcon:{
        color: '#3b81dd',
    }
  }));
