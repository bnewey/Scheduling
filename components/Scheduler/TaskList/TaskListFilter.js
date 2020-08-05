import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Modal, Backdrop, Fade, ButtonGroup, Button, Checkbox, Chip,
     Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText,  FormControlLabel, Switch,Grid, List, FilledInput, t } from '@material-ui/core';

     import FilterIcon from '@material-ui/icons/ShortText';
     import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
     import Filter from '@material-ui/icons/Sort';

import CircularProgress from '@material-ui/core/CircularProgress';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import Crew from '../../../js/Crew';

import TaskLists from '../../../js/TaskLists';
import {createFilter} from '../../../js/Filter';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

const TaskListFilter = (props) => {
   
    //PROPS
    const { setFilteredItems } = props;

    const {taskListToMap, taskListTasksSaved,filterInOrOut,setFilterInOrOut,filterAndOr, setFilterAndOr, filters, setFilters} = useContext(TaskContext);

    //STATE
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [tableConfig, setTableInfo] = useState([
        {text: "Type", field: "type", type: 'text'},
        {text: "Completed", field: "completed_wo",  type: 'number'}, 
        {text: "i_crew", field: "install_crew",  type: 'text'},
        {text: "d_crew", field: "drill_crew",  type: 'text'},
        {text: "Drilling", field: "drilling", type: 'text'},
        {text: "Art", field: "artwork", type: 'text'},
        {text: "Signs", field: "sign",  type: 'text'},
        {text: "State", field: "state", type: 'text'},
        {text: "City", field: "city", type: 'text'},
        {text: "d_date", field: "drill_date",  type: 'date'},  
        {text: "i_date", field: "install_date", type: 'date'},
        {text: "Desired Date", field: "date_desired", type: 'date'},
        {text: "Date Entered", field: "tl_date_entered", type: 'date'},
        {text: "1st Game", field: "first_game", type: 'date'},
        {text: "Name", field: "t_name", type: 'text'},
        {text: "WO #", field: "table_id", type: 'number'},
        {text: "Description", field: "description",  type: 'text'}, 
        {text: "Order", field: "priority_order", type: 'number'}
    ]);
    
    //Save and/or Fetch filterInOrOut to local storage
    useEffect(() => {
        if(filterInOrOut == null){
            var tmp = window.localStorage.getItem('filterInOrOut');
            var tmpParsed;
            console.log(tmp);
            if(tmp && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed){
                setFilterInOrOut(tmpParsed);
            }else{
                setFilterInOrOut("out");
            }
        }
        if((filterInOrOut)){
            window.localStorage.setItem('filterInOrOut', JSON.stringify(filterInOrOut));
        }
        
    }, [filterInOrOut]);

    useEffect(() => {
        if(filterAndOr == null){
            var tmp = window.localStorage.getItem('filterAndOr');
            var tmpParsed;
            if(tmp && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed){
                setFilterAndOr(tmpParsed);
            }else{
                setFilterAndOr("or");
            }
        }
        if((filterAndOr)){
            window.localStorage.setItem('filterAndOr', JSON.stringify(filterAndOr));
        }
        
    }, [filterAndOr]);
    

    //CSS
    const classes = useStyles({filters});

    //Filter
    useEffect(()=>{
        if (Array.isArray(filters) && filters.length && filterInOrOut != null && filterAndOr != null) {
            if (taskListTasksSaved && taskListTasksSaved.length) {

                var tmpData = [];

                //If more than one property is set, we need to filter seperately
                let properties = new Set([...filters].map((v,i)=>v.property));
                console.log("TaskListFilter running");
                //in works different than out
                properties.forEach((index,property)=>{
                    
                    let tmpFilter = filters.filter((v,i)=> v.property == property);
                    let tmpTmpData;

                    //On or use taskListTasksSaved to filter from to add to
                    if((filterAndOr == "or" && filterInOrOut == "in") || (filterAndOr == "and" && filterInOrOut == "out")){
                        if(tmpFilter.length > 1){
                            //Always use 'or' on same property
                            tmpTmpData = taskListTasksSaved.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                        }
                        if(tmpFilter.length <= 1){
                            tmpTmpData = taskListTasksSaved.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                            console.log("MapContainer tmpData in loop", tmpData);
                        }
                        //Add to our big array
                        tmpData.splice(tmpData.length, 0, ...tmpTmpData);
                        //Remove duplicates
                        tmpData.splice(0, tmpData.length, ...(new Set(tmpData)));
                    }

                    //On and use tmpData to filter from
                    if((filterAndOr == "and" && filterInOrOut == "in") || (filterAndOr == "or" && filterInOrOut == "out")){
                        if(tmpData.length <= 0){
                            tmpData = [...taskListTasksSaved];
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
                
                //No filters 
                if(filters && !filters.length){
                    //no change to tmpData
                    tmpData = [...data];
                }
                
                var copyObject = [...tmpData];
                setFilteredItems(copyObject);
            }
        }
        if(Array.isArray(filters) && !filters.length){
            setFilteredItems(null);
        }
    },[filters, filterInOrOut, filterAndOr]);

    
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

    const handleChangeFilterInOutType = (event) =>{
        setFilteredItems(null);
        if(filterInOrOut == "out"){
            setFilterInOrOut("in");
        }
        if(filterInOrOut == "in"){
            setFilterInOrOut("out");
        }
    }

    const handleChangeFilterAndOrType = (event) =>{
        setFilteredItems(null);
        if(filterAndOr == "and"){
            setFilterAndOr("or");
        }
        if(filterAndOr == "or"){
            setFilterAndOr("and");
        }
    }

    const handleFixSpecificItem = (item, selectedField) =>{ 
        if(item == null){
            return '*N/A*';
        }

        if(!selectedField.field){
            console.error("Bad selectedField.field in handleFixSpecificItem");
            return 'error';
        }

        switch (selectedField.field){
            case "completed_wo":
                if(item == 0){
                    return ("Not Completed")
                }else if(item == 1){
                    return ("Completed");
                }
                break;
            case "drill_crew":
            case "install_crew":
                return(item);
                break;
            default:
                return(item);
        }


    }

    const handleAlternateInorOut = (event, current) =>{
        if(!current){
            cogoToast.error("Bad current value");
            console.error("Bad current value in handleAlternateInorOut");
        }
        if(current == "in"){
            setFilterInOrOut("out");
        }
        if(current == "out"){
            setFilterInOrOut("in");
        }
    }

    const handleAlternateAndorOr = (event, current) =>{
        if(!current){
            cogoToast.error("Bad current value");
            console.error("Bad current value in handleAlternateAndorOr");
        }
        if(current == "or"){
            setFilterAndOr("and");
        }
        if(current == "and"){
            setFilterAndOr("or");
        }
    }

    
    return(
        <>
        {taskListToMap ? 
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
                    <div className={classes.filterTypeInfoDiv}>
                        <span className={classes.filterTypeInfoLabel}>Filtering</span>
                        <t classes={{tooltip: classes.tooltip}} title={"Filtering 'OUT' removes items matching filters and 'IN' shows only items matching"}>
                        <span className={classes.filterTypeInfoClick} onClick={event => handleAlternateInorOut(event, filterInOrOut)}>{filterInOrOut}</span>
                        </t>
                        <span className={classes.filterTypeInfoLabel}>USING</span>
                        <t  classes={{tooltip: classes.tooltip}} title={"'OR' shows items matching at least one filter. 'AND' shows items matching every filter."}>
                        <span className={classes.filterTypeInfoClick} onClick={event => handleAlternateAndorOr(event, filterAndOr)}>{filterAndOr}</span>
                        </t>
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
                            
                                
                                {tableConfig && tableConfig.map((item,i)=>{
                                    const isSelected = selectedField === item; 
                                    return(
                                        <ListItem key={item.field + i} dense button
                                            onMouseUp={event => handleSelectField(event, item)}
                                            className={isSelected ? classes.fieldListItemSelected : classes.fieldListItem}
                                        >
                                            <ListItemText key={"tableConfigText"+i} className={classes.fieldListItemText}>
                                                {item.text}
                                            </ListItemText>
                                        </ListItem>
                                        );
                                })}
                                
                            </List>
                        </Grid>
                        <Grid item xs={8} className={classes.paper}>
                            <>

                            <FormControlLabel
                                        key={"formControlInOut"}
                                        control={
                                        <Switch
                                            key={'switchFilterListInOut'}
                                            checked={filterInOrOut  && filterInOrOut == "in"}
                                            onChange={(event)=> handleChangeFilterInOutType(event)}
                                            name="Filter In or Out"
                                            color="primary"
                                        />
                                         }
                                    label={filterInOrOut && filterInOrOut  == "in" ? "Filter TO Selected" : "Filter OUT Selected"}
                                    />
                                    <FormControlLabel
                                        key={"formControlAddOr"}
                                        control={
                                        <Switch
                                            key={'switchFilterListAndOr'}
                                            checked={filterAndOr  && filterAndOr == "or"}
                                            onChange={(event)=> handleChangeFilterAndOrType(event)}
                                            name="Filter And/Or"
                                            color="primary"
                                        />
                                         }
                                    label={filterAndOr && filterAndOr  == "or" ? "Filter using OR. Shows items matching at least one filter." :
                                         "Filter using AND. Shows items matching all filters."}
                                    />
                        <List className={classes.filterList}>
                                
                            
                                    {selectedField && taskListTasksSaved ? 
                                <>
                                    {taskListTasksSaved.map((task)=> task[selectedField.field]).filter((v, i, array)=> array.indexOf(v)===i ).map((item,i)=>{
                                        const isFiltered =  (filters.filter((filter, i)=> 
                                        {
                                            if(item != null){
                                                return (filter.property == selectedField.field && item && filter.value == item.toString());
                                            }else{
                                                return (filter.property == selectedField.field && filter.value == "nonassignedValue");
                                            }
                                        }).length > 0);
                                        
                                        return( <div key={'liDiv'+ i} className={classes.listItemDiv}>
                                            
                                            <ListItem key={selectedField.field + i} dense button
                                                className={!isFiltered ? classes.filterListItem : classes.filterListItemFiltered}
                                               onClick={event=> handleListFilter(event, selectedField.field, item ? item : "nonassignedValue")}

                                            >
                                                <ListItemText key={'fieldListItemText'+i}className={classes.filterListItemText}>
                                                    <Checkbox key={'checkboxFieldLI'+i} checked={isFiltered} className={classes.li_checkbox}/>
                                                    { handleFixSpecificItem(item, selectedField) }
                                                </ListItemText>
                                            </ListItem>
                                            </div>);
                                    })}
                                </>
                            :<>Select a field to the left to FILTER by.</> }
                            </List>
                            </>
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
    tooltip:{
        fontSize: '15px'
    },
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
        padding: '5px 20px',
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
    filterTypeInfoDiv:{
        fontVariant: 'all-petite-caps',
        display:'flex',
        flexBasis: '10%',
        backgroundColor: '#b5b1c7',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 2px 0px #000000d9',
        justifyContent: 'space-evenly',
        fontSize: 'medium',
    },
    filterTypeInfoClick:{
        textDecoration: 'underline',
        cursor: 'pointer',
        backgroundColor: '#ffffffe6',
        boxShadow: '0px 0px 2px 0px #635f77',
        padding: '1px 5px',
        color: '#265296',
        fontWeight: '700',
        '&:hover':{
            boxShadow: '0px 0px 3px 0px #333',
            backgroundColor:'#ffffffbd',
        }
    },
    filterTypeInfoLabel:{
        color: '#fff',
        fontWeight: '600',
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
        textAlign: "-webkit-center",
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
