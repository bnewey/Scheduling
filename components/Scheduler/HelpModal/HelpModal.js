import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,Fab, Modal, Backdrop, Fade, Grid, Typography, List, ListSubheader, ListItem, ListItemText, ListItemIcon, Collapse } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import HelpIcon from '@material-ui/icons/Help';

import { TaskContext } from '../TaskContainer';

import TasksLists from './HelpPages/TasksLists';
import TasksTable from './HelpPages/TasksTable';
import TasksMap from './HelpPages/TasksMap';
import WOTable from './HelpPages/WOTable';
import WOPDF from './HelpPages/WOPDF';
import SearchItems from './HelpPages/SearchItems';

const subMenuVar = { //use this data to jump to related help section
    "tasks": ["tasks_lists","tasks_table", "tasks_map"],
    "work_order": ["WOTable", "WOPDF"],
    "search_items": ["search_items"]
}

const HelpModal = (props) => {

    const {initialPage, initialTab} = props;
    //const {} = useContext(TaskContext);
    const classes = useStyles();

    //Modal Props
    const [helpModalOpen, setHelpModalOpen] = React.useState(false);
    
    //Functional State
    const [selectedPage, setSelectedPage] = React.useState( initialPage !=null && initialTab !=null ? subMenuVar[initialPage][initialTab] : null);

    //List Expanded Props
    const [scheduleOpen, setScheduleOpen] = React.useState(initialPage == "tasks" ? true : false);
    const [workOrderOpen, setWorkOrderOpen] = React.useState(initialPage == "work_order" ? true : false);
    const [searchItemsOpen, setSearchItemsOpen] = React.useState(initialPage == "search_items" ? true : false);

    useEffect(()=>{
        if(helpModalOpen){
            setSelectedPage(initialPage !=null && initialTab !=null ? subMenuVar[initialPage][initialTab] : null);
            switch(initialPage){
                case "tasks":
                    setScheduleOpen(true);
                    break;
                case "work_order":
                    setWorkOrderOpen(true);
                    break;
                case "search_items":
                    setSearchItemsOpen(true);
                    break;
                default:
                    break;
            }
        }

        return(()=>{
            if(helpModalOpen){
                setSelectedPage(null);
                setScheduleOpen(false);
                setWorkOrderOpen(false);
                setSearchItemsOpen(false);
            }

        })
    },[helpModalOpen])

    const handleHelpModalOpen = (event) => {
        setHelpModalOpen(!helpModalOpen);
    }

    const handleHelpModalClose = () => {
        setHelpModalOpen(false);
    };

    const handleListClick = (event, page) => {
        switch(page){
            case "work_order":
                setWorkOrderOpen(!workOrderOpen);
                setScheduleOpen(false);
                setSearchItemsOpen(false);
                break;
            case "tasks": 
                setScheduleOpen(!scheduleOpen);
                setWorkOrderOpen(false);
                setSearchItemsOpen(false);
                break;
            case "search_items":
                setSearchItemsOpen(!searchItemsOpen);
                setWorkOrderOpen(false);
                setScheduleOpen(false);
                break;
            default: 
                setScheduleOpen(!setScheduleOpen);
                setWorkOrderOpen(false);
                setSearchItemsOpen(false);
                break;     
        }
    }

    const handlePageContentClick = (event, page) => {
        setSelectedPage(page);
    }

    return(
        <>
        <Fab color="primary" aria-label="add" className={classes.helpButton} onClick={handleHelpModalOpen}>
          <HelpIcon color="#fff" className={classes.helpIcon}/>
        </Fab>

        <Modal aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={helpModalOpen}
            onClose={handleHelpModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
             }}>
            <Fade in={helpModalOpen}>
                <div className={classes.container}>
                <Grid container >  
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            Help
                        </span>
                    </div>
                    <Grid item xs={3} classes={{root: classes.grid_x3}} className={classes.paperList}>
                    <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                                Pages
                            </ListSubheader>
                        }
                        className={classes.pageList}
                        >
                        <ListItem button key="tasks" onClick={event => handleListClick(event, "tasks")} className={scheduleOpen ? classes.selectedExpList : classes.nonselectedExpList}>
                            <ListItemIcon>
                            <HelpIcon />
                            </ListItemIcon>
                            <ListItemText classes={{primary: classes.expListText}} primary="Tasks (Home)" />
                            {scheduleOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                                <Collapse in={scheduleOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                    <ListItem 
                                        key="tasks_lists"
                                        button 
                                        onClick={event => handlePageContentClick(event, "tasks_lists")}  
                                        className={selectedPage == "tasks_lists" ?  classes.selectedSubList  :  classes.listNested}
                                        >
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Task Lists" />
                                    </ListItem>
                                    <ListItem 
                                        key="tasks_table"
                                        button 
                                        onClick={event => handlePageContentClick(event, "tasks_table")} 
                                        className={selectedPage == "tasks_table" ?  classes.selectedSubList  :  classes.listNested}>
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Tasks Table" />
                                    </ListItem>
                                    <ListItem 
                                        key="tasks_map"
                                        button 
                                        onClick={event => handlePageContentClick(event, "tasks_map")} 
                                        className={selectedPage == "tasks_map" ?  classes.selectedSubList  :  classes.listNested}>
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Map View" />
                                    </ListItem>
                                    </List>
                                </Collapse>
                        
                        <ListItem key="wo" button onClick={event => handleListClick(event, "work_order")} className={workOrderOpen ? classes.selectedExpList : classes.nonselectedExpList}>
                            <ListItemIcon>
                            <HelpIcon />
                            </ListItemIcon>
                            <ListItemText classes={{primary: classes.expListText}} primary="Work Orders" />
                            {workOrderOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                                <Collapse in={workOrderOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                    <ListItem 
                                        key="wo_table"
                                        button 
                                        onClick={event => handlePageContentClick(event, "wo_table")} 
                                        className={selectedPage == "wo_table" ?  classes.selectedSubList  :  classes.listNested}>
                                        <ListItemIcon>
                                        <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="WO Table" />
                                    </ListItem>
                                    <ListItem
                                        key="wo_pdf"
                                        button 
                                        onClick={event => handlePageContentClick(event, "wo_pdf")} 
                                        className={selectedPage == "wo_pdf" ?  classes.selectedSubList  :  classes.listNested}>
                                        <ListItemIcon>
                                        <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="PDF" />
                                    </ListItem>
                                    </List>
                                </Collapse>

                            <ListItem key="search_items" button onClick={event => handleListClick(event, "search_items")} className={searchItemsOpen ? classes.selectedExpList : classes.nonselectedExpList}>
                                <ListItemIcon>
                                <HelpIcon />
                                </ListItemIcon>
                                <ListItemText classes={{primary: classes.expListText}} primary="Search Items" />
                                {searchItemsOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                                    <Collapse in={searchItemsOpen} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            <ListItem
                                                key="search_items2" 
                                                button 
                                                onClick={event => handlePageContentClick(event, "search_items")} 
                                                className={selectedPage == "search_items" ?  classes.selectedSubList  :  classes.listNested}>
                                                <ListItemIcon>
                                                <HelpIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Search Items" />
                                            </ListItem>
                                        </List>
                                    </Collapse>
                        </List>
                    </Grid>
                    <Grid item xs={9} classes={{root: classes.grid_x9}} className={classes.paper}>
                        { selectedPage == "tasks_lists" ? <TasksLists/>: <></>}
                        { selectedPage == "tasks_table" ? <TasksTable/>: <></>}
                        { selectedPage == "tasks_map" ? <TasksMap/> : <></>}
                        { selectedPage == "wo_table" ? <WOTable/>: <></>}
                        { selectedPage == "wo_pdf" ? <WOPDF/>: <></>}
                        { selectedPage == "search_items" ? <SearchItems/> : <></>}
                    </Grid>
                </Grid>
                </div>
            </Fade>
        </Modal>

        </>
    );
};

export default HelpModal;


const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1 !important',
        '&& div':{
            outline: 'none',
        },
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: '2% 3% 3% 3% !important',
        position: 'relative',
        width: '100%',
        overflowY: 'auto',
        maxHeight: '665px',

        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },

    paperList:{
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: '1% !important',
        position: 'relative',
        width: '100%'
    },
    container: {
        width: '60%',
        maxWidth: '60%',
        textAlign: 'center',
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
    helpButton:{
      position: 'fixed',
      bottom: '2%',
      right: '1%',
      backgroundColor: '#414d59',
      '&:hover':{
        backgroundColor: '#7895af',
      }
    },
    helpIcon:{
      
    },
    pageList:{
        width: '100%',
        backgroundColor: '#dedede',
        borderRadius: '5px',
    },
    list_head:{
        lineHeight: '24px',
        borderRadius: '5px',
    },
    listNested: {
        paddingLeft: '4em',
    },
    selectedExpList:{
        fontWeight: '600',
        backgroundColor: '#404654',
        color: '#fff',
        '&:hover':{
            backgroundColor: '#a2ccf8',
            color: '#404654',
        }
    },
    nonselectedExpList:{
        backgroundColor: '#8196ab',
        '&:hover':{
            backgroundColor: '#a2ccf8',
            color: '#404654',
        }
    },
    expListText:{
        fontWeight: '600',
        fontSize: '14px',
    } ,
    selectedSubList:{
        backgroundColor: '#7b9aca80',
        paddingLeft: '4em',
        border: '1px solid #ff9000',
    },
    grid_x3:{
        maxWidth: '23%',
        flexBasis: '23%',
    },
    grid_x9:{
        maxWidth: '77%',
        flexBasis: '77%',
    },

    
  }));

