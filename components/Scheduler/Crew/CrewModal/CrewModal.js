import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,Fab, Modal, Backdrop, Fade, Grid, Typography, List, ListSubheader, ListItem, ListItemText, ListItemIcon, Collapse } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import HelpIcon from '@material-ui/icons/Help';
import CrewMembers from './CrewMembers';
import CrewCrews from './CrewCrews';

import { TaskContext } from '../../TaskContainer';


const CrewModal = (props) => {

    const {crewMembers, setCrewMembers, crewModalOpen ,setCrewModalOpen, allCrewJobs, setAllCrewJobs} = props;
    //const {} = useContext(TaskContext);
    const classes = useStyles();

    const [crewMemberOpen, setcrewMemberOpen] = useState(true);
    const [crewCrewOpen, setcrewCrewOpen] = useState(true);
    
    //Functional State
    const [selectedPage, setSelectedPage] = React.useState(1);




    const handleHelpModalOpen = (event) => {
        setCrewModalOpen(!crewModalOpen);
    };

    const handleHelpModalClose = () => {
        setCrewModalOpen(false);
    };

    const handleListClick = (event, page) => {
        switch(page){
            case 1:
                setcrewMemberOpen(!crewMemberOpen);
                setcrewCrewOpen(false);
                break;
            case 2:
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

    return(
        <>

        <Modal aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={crewModalOpen}
            onClose={handleHelpModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
             }}>
            <Fade in={crewModalOpen}>
                <div className={classes.container}>
                <Grid container >  
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            Crew
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
                                    <ListItem 
                                        key="crew_members"
                                        button 
                                        onClick={event => handlePageContentClick(event, 1)}  
                                        className={selectedPage == 1 ?  classes.selectedSubList  :  classes.listNested}
                                        >
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Crew Members" />
                                    </ListItem>
                                    <ListItem 
                                        key="crew_crews"
                                        button 
                                        onClick={event => handlePageContentClick(event, 2)}  
                                        className={selectedPage == 2 ?  classes.selectedSubList  :  classes.listNested}
                                        >
                                        <ListItemIcon>
                                            <HelpIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Crews" />
                                    </ListItem>
                        </List>
                    </Grid>
                    <Grid item xs={9} classes={{root: classes.grid_x9}} className={classes.paper}>
                         { selectedPage == 1 ? <CrewMembers crewMembers={crewMembers} setCrewMembers={setCrewMembers} allCrewJobs={allCrewJobs}
                                    setAllCrewJobs={setAllCrewJobs}/>: <></>}
                        { selectedPage == 2 ? <CrewCrews crewMembers={crewMembers} setCrewMembers={setCrewMembers} allCrewJobs={allCrewJobs}
                        setAllCrewJobs={setAllCrewJobs}/>: <></>}
                    </Grid>
                </Grid>
                </div>
            </Fade>
        </Modal>

        </>
    );
};

export default CrewModal;


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
        boxShadow: theme.shadows[5],
        padding: '1% !important',
        position: 'relative',
        width: '100%'
    },
    container: {
        width: '70%',
        maxWidth: '70%',
        textAlign: 'center',
        minHeight: '700px'
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

