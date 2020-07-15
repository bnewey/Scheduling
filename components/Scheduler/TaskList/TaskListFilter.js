import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Modal, Backdrop, Fade, ButtonGroup, Button, Checkbox, Chip,
     Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText,  FormControlLabel, Switch,Grid, List, FilledInput } from '@material-ui/core';

     import FilterIcon from '@material-ui/icons/ShortText';
     import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
     import Filter from '@material-ui/icons/Sort';

import CircularProgress from '@material-ui/core/CircularProgress';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import TaskLists from '../../../js/TaskLists';
import {createFilter} from '../../../js/Filter';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

const TaskListFilter = (props) => {
   
    //PROPS
    const { taskListTasks, setTaskListTasks, filters, setFilters, filterInOrOut, setFilterInOrOut, openTaskList, table_info,
        selectedTasks,setSelectedTasks} = props;

    const {taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen, priorityList, setPriorityList, setSelectedIds,
         setMapRows, taskListTasksSaved, setTaskListTasksSaved} = useContext(TaskContext);

    //STATE
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    

    //CSS
    const classes = useStyles({filters});

    //Filter
    useEffect(()=>{
        if (Array.isArray(filters) && filters.length) {
            if (taskListTasksSaved && taskListTasksSaved.length) {
                var tmpData = taskListTasksSaved.filter(createFilter([...filters], filterInOrOut))
                console.log(tmpData);
                var copyObject = [...tmpData];
                setTaskListTasks(copyObject);
                setSelectedTasks([]);
            }
        }
        if(Array.isArray(filters) && !filters.length){
            setTaskListTasks(null);
        }
    },[filters]);

    useEffect(()=>{
        if(taskListTasks == null){
            //setTaskListTasksSaved([]);
        }
        if(taskListTasksSaved.length == 0 && taskListTasks){
            //setTaskListTasksSaved(taskListTasks);
        }
    },[taskListTasks]);
    
    const handleModalOpen = () => {
        setFilterModalOpen(true);
    };

    const handleModalClose = () => {
        setFilterModalOpen(false);
    };

    const handleListFilter = (event, field, fieldItem) =>{
        if(field == null || fieldItem == null){
            cogoToast.error("Bad field or item");
            console.log("FIeldItem", fieldItem);
            return;
            
        }
        if(!table_info){
            cogoToast.error("Bad field while trying to sort");
            return;
        }
        //no filters yet
        if(!filters || filters.length <= 0){
            setFilters([{
                property: field, 
                value: fieldItem.toString(),
            }]);
            cogoToast.success(`Filtering by ${filters.map((v, i)=> v.property + ", ")}`);
        }
        //existing filters
        if(filters && filters.length > 0){
            //check for filter 
            var tmpString = fieldItem.toString();
            var tmpNewFilter = {
                property: field, 
                value: tmpString,
            };
           
            var filtersMatching = filters.filter((v , i)=> ( v.property == tmpNewFilter.property && v.value === tmpNewFilter.value));
             //not in filters yet
            if(filtersMatching && filtersMatching.length == 0){
                setFilters([...filters, tmpNewFilter]);
                cogoToast.success(`Filtering by ${filters.map((v, i)=> v.property + ", ")}`);
            }else{
                //Remove from Filters
                handleRemoveFromFilters(tmpNewFilter);
                
            }
        }
    }

    const handleRemoveFromFilters = (filterToRemove) => {
        if(!filterToRemove || !filterToRemove.property || !filterToRemove.value){
            cogoToast.error("Bad filter");
            return;
        }
        setFilters([...filters.filter((v , i)=> !( v.property == filterToRemove.property && v.value === filterToRemove.value))])
        cogoToast.success(`Removed Filter by ${filterToRemove.value}`);
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

    const handleChangeFilterType = (event) =>{
        setTaskListTasks(null);
        if(filterInOrOut == "out"){
            setFilterInOrOut("in");
        }
        if(filterInOrOut == "in"){
            setFilterInOrOut("out");
        }
    }
     
    return(
        <>
        {openTaskList ? 
        <>
            <div className={classes.filterDiv}>
                <Button className={classes.filterButton}
                    onClick={event=> handleModalOpen()}
                    variant="text"
                    color="secondary"
                    size="medium"
                >   <Filter/>
                        &nbsp;FILTER
                </Button>
                {filters && filters.length > 0 ? <>
                    <Button className={classes.clearFilterButton}
                        onClick={event=> handleClearFilters(event)}
                        variant="text"
                        color="secondary"
                        size="medium"
                    >
                        <DeleteForeverIcon/>
                        &nbsp;Clear Filters
                    </Button>
                    <div className={classes.chipDiv}>
                    {filters && filters.map((filter,i)=>{
                        return(<>
                                <Chip
                                    icon={<FilterIcon/>}
                                    size={'small'}
                                    label={ filter && filter.value && filter.property ? filter.property + ' ' +filter.value : "UnidentifiedChip" + i}
                                    onDelete={filter.value && filter.property ? event=> handleRemoveFromFilters(filter): ""}
                                    className={classes.chip}
                                />
                            </>);
                    })}
                    </div>
                    
                </>
                :
                <>
                    
                </>}
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
                        <Grid item xs={4} className={classes.paper}>
                            <List className={classes.fieldList}>
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
                        <Grid item xs={8} className={classes.paper}>
                        <List className={classes.filterList}>
                            
                            {selectedField && taskListTasksSaved ? 
                                <>
                                    <FormControlLabel
                                        control={
                                        <Switch
                                            checked={filterInOrOut == "in"}
                                            onChange={(event)=> handleChangeFilterType(event)}
                                            name="Filter In or Out"
                                            color="primary"
                                        />
                                         }
                                    label={filterInOrOut  == "in" ? "Filter TO Selected" : "Filter OUT Selected"}
                                    />
                                    {taskListTasksSaved.map((task)=> task[selectedField.field]).filter((v, i, array)=> array.indexOf(v)===i ).map((item,i)=>{
                                        const isFiltered =  (filters.filter((filter, i)=> 
                                        {
                                            if(item != null){
                                                return (filter.property == selectedField.field && item && filter.value == item.toString());
                                            }else{
                                                return (filter.property == selectedField.field && filter.value == "nonassignedValue");
                                            }
                                        }).length > 0);
                                        
                                        return( <div className={classes.listItemDiv}>
                                            
                                            <ListItem key={selectedField.field + i} dense button
                                                className={!isFiltered ? classes.filterListItem : classes.filterListItemFiltered}
                                               onClick={event=> handleListFilter(event, selectedField.field, item ? item : "nonassignedValue")}

                                            >
                                                <ListItemText className={classes.filterListItemText}>
                                                    <Checkbox checked={isFiltered} className={classes.li_checkbox}/>
                                                    {item != null ? item : '*N/A*'}
                                                </ListItemText>
                                            </ListItem>
                                            </div>);
                                    })}
                                </>
                            :<>Select a field to the left to FILTER by.</> }
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
    filterDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '5px',
        backgroundColor: '#d0cde0',
    },
    filterButton:{
        margin: '0px 10px',
        backgroundColor: '#fdfdfd',
        color: '#0067d2',
        fontWeight: '500',
        border: '1px solid #173b7e',
        '&&:hover':{
            backgroundColor: '#97bec9',
            color: '#000',
        }
    },
    clearFilterButton:{
        margin: '0px 10px',
        backgroundColor:  '#fef8cc' ,
        color: '#613703',
        fontWeight: '500',
        border: '1px solid #a17000',
        '&&:hover':{
            backgroundColor: '#97bec9',
            color: '#000',
        }
    },
    chipDiv:{
        backgroundColor: '#d3d2d6',
        padding: '5px',
        borderRadius: '3px',
    },
    chip:{
        backgroundColor: '#fff',
        '&:hover':{
            backgroundColor: '#c5e2f3',
        },
        '& span':{
            maxWidth: '111px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }
    },
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
        width: '40%',
        maxWidth: '50%',
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
    fieldList:{
        backgroundColor: '#ececec',
        padding: '2%',
        boxShadow: '0px 2px 3px 0px #00000073',
    },
    fieldListItem:{
        backgroundColor: "#c6ccd3",
        color: '#2d343b',
        border: '1px solid #ececec',
        
    },
    fieldListItemSelected:{
        boxShadow: 'inset 0 0 5px 0px #44585896',
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
    },
    filterList:{
        backgroundColor: '#ececec',
        padding: '2%',
        boxShadow: '0px 2px 3px 0px #00000073',
        width: 'fit-content',
        minWidth: '50%',
    },
    listItemDiv:{
        
        marginBottom: '2px'
    },
    filterListItem:{
        backgroundColor: "#bdbdbd",
        color: '#2d343b',
        border: '1px solid #ececec',
        margin: '0px 0px 0px 0px',
    },
    filterListItemFiltered:{
        boxShadow: '0 0 5px 0px #44585896',
        backgroundColor: "#fff",
        color: '#0f447a',
        border: '1px solid #fff',
        '&:hover':{
            border: '1px solid #d88f08'
        }
    },
    filterListItemText:{
        display: 'flex',
        flexDirection: 'row',
        '& span':{
            fontWeight: '600'
        }
    },
    li_checkbox:{
        
        padding: '0px 15px 0px 0px',
        left: '0px',
        '& span':{
          color: '#444',
          '&:hover':{
            color: '#000',
          }
        }
      }

      
  }));
