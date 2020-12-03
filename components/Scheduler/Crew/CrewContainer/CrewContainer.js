import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,Fab, Modal, Backdrop, Fade, Grid, Typography, List, ListSubheader, ListItem, ListItemText, ListItemIcon, Collapse } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import HelpIcon from '@material-ui/icons/Help';
import CrewMembers from './CrewMembers';
import CrewCrews from './CrewCrews/CrewCrews';

import { TaskContext } from '../../TaskContainer';
import { CrewContext } from '../CrewContextContainer';


const CrewContainer = (props) => {

    //const {} = props;
    const {crewMembers, setCrewMembers, allCrewJobs, setAllCrewJobs, memberJobs,setMemberJobs, shouldResetCrewState, setShouldResetCrewState} = useContext(CrewContext);
    const classes = useStyles();

    const [crewMemberOpen, setcrewMemberOpen] = useState(true);
    const [crewCrewOpen, setcrewCrewOpen] = useState(true);
    
    //Functional State
    const [selectedPage, setSelectedPage] = React.useState(1);


    const handleListClick = (event, page) => {
        switch(page){
            case 2:
                setcrewMemberOpen(!crewMemberOpen);
                setcrewCrewOpen(false);
                break;
            case 1:
            setcrewCrewOpen(!crewCrewOpen);
            setcrewMemberOpen(false);
            break;
            default: 
                setcrewMemberOpen(!setcrewMemberOpen);
                setcrewCrewOpen(false);
                break;     
        }
    }

    const handlePageContentClick = (event, page) => {
        setSelectedPage(page);
    }

    const pageNames = ["Crews", "Crew Members"];

    return(
        <>
                <div className={classes.container}>
                <Grid container >  
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {selectedPage ? pageNames[selectedPage-1] : "Crew"}
                        </span>
                    </div>
                    <Grid item xs={2}  className={classes.paperList}>
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
                                    <ListItem 
                                        key="crew_crews"
                                        button 
                                        onClick={event => handlePageContentClick(event, 1)}  
                                        className={selectedPage == 1 ?  classes.selectedSubList  :  classes.listNested}
                                        >
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Crews" />
                                    </ListItem>
                                    <ListItem 
                                        key="crew_members"
                                        button 
                                        onClick={event => handlePageContentClick(event, 2)}  
                                        className={selectedPage == 2 ?  classes.selectedSubList  :  classes.listNested}
                                        >
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Crew Members" />
                                    </ListItem>
                                    
                        </List>
                    </Grid>
                    {!shouldResetCrewState ?
                    <Grid item xs={10}  className={classes.paper}>
                         { selectedPage == 2 ? <CrewMembers />: <></>}
                        { selectedPage == 1 ? <CrewCrews />: <></>}
                    </Grid>
                    : <></>}
                </Grid>
                </div>
        </>
    );
};

export default CrewContainer;


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
        //boxShadow: theme.shadows[5],
        borderLeft: '1px solid #ccc',
        padding: '1% 1% 1% 1% !important',
        position: 'relative',
        width: '100%',
        overflowY: 'auto',
        maxHeight: '700px',
        minHeight: '700px',
        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },

    paperList:{
        backgroundColor: theme.palette.background.paper,
        //boxShadow: theme.shadows[5],
        padding: '1% !important',
        position: 'relative',
        width: '100%'
    },
    container: {
        width: '100%',
        maxWidth: '100%',
        textAlign: 'center',
        minHeight: '700px'
    },
    modalTitleDiv:{
        backgroundColor: '#61a4a1',
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

    
  }));

