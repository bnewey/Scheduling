import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import Crew from '../../../../js/Crew';
import { CrewContext } from '../CrewContextContainer';
import cogoToast from 'cogo-toast';


const CrewMemberActionEdit = (props) => {
 
    //PROPS
    const { children, initialMember } = props;
    const {crewMembers, setCrewMembers } = useContext(CrewContext);

    //STATE
    const [editOpen, setEditOpen] = React.useState(false);
    const [memberName, setMemberName] = React.useState(initialMember ? initialMember.member_name : '');
    const [memberId, setMemberId] = React.useState(initialMember ? initialMember.id : 1)
    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleEditClickOpen = (event) => {
        setEditOpen(true);   
    };

    const handleEditClose = () => {
        setMemberName(null);
        setEditOpen(false);
    };
  

      const handleEditAdd = (event, name,id) =>{
          if(!name || name == "" || !id){
              cogoToast.warn("Bad name", {hideAfter: 4});
              return;
          }
        Crew.updateCrewMember(name, id)
                .then((reponse) => {
                    if(!reponse){
                        console.warn("Bad reponse returned from editCrewMember");
                        throw "Bad response from server on editCrewMember";
                    }
                    //refetch members
                    setCrewMembers(null);
                    handleEditClose();
                    cogoToast.success(`Edited member`, {hideAfter: 4});
                })
                .catch( error => {
                    cogoToast.error(`Error editing member`, {hideAfter: 4});
                    console.error(error);
            });
    };

    
    return(
        <React.Fragment>
            <IconButton className={classes.secondary_button} edge="end" aria-label="edit" onClick={event => handleEditClickOpen(event)}>
                <EditIcon />
            </IconButton>
            
            { editOpen && crewMembers ? 
            
            <Dialog PaperProps={{className: classes.dialog}} open={handleEditClickOpen} onClose={handleEditClose}>
            <DialogTitle className={classes.title}>Name of Crew Member</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                <TextField id="task-list-edit-name" 
                            className={classes.textField}
                            label="Name"
                            value={memberName}
                            onChange={event => setMemberName(event.target.value)}/>
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleEditClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleEditAdd(event, memberName, memberId)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Update
                    </Button>
                    
             </DialogActions> 
            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} 

export default CrewMemberActionEdit;

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
        backgroundColor: '#ffedc4',
        color: '#d87b04'
      },
    },
    icon_small:{
        verticalAlign: 'text-bottom'
    },
    text_button:{
        textAlign: 'center',
        cursor: 'pointer',
        fontSize: '12px',
        color: '#677fb3',
        margin: '0% 3% 0% 0%',
        '&:hover':{
            color: '#697fb1',
            textDecoration: 'underline',
        }
    },
    secondary_button:{
        padding: '6px',
        marginRight: '2px',
    }
  }));
