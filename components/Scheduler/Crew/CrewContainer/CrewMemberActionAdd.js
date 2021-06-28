import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import Crew from '../../../../js/Crew';
import { CrewContext } from '../CrewContextContainer';
import cogoToast from 'cogo-toast';


const CrewMemberActionAdd = (props) => {
 
    //PROPS
    const {  } = props;
    const {crewMembers, setCrewMembers } = useContext(CrewContext);

    //STATE
    const [addOpen, setAddOpen] = React.useState(false);
    const [newMemberName, setNewMemberName] = React.useState("New Member");

    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleAddClickOpen = (event) => {
        setAddOpen(true);   
    };

    const handleAddClose = () => {
        setNewMemberName(null);
        setAddOpen(false);
    };
  

      const handleAddNew = (event, name) =>{
          if(!name){
              return;
          }
        Crew.addCrewMember(name)
                .then((reponse) => {
                    console.log(reponse);
                    if(!reponse){
                        console.warn("Bad reponse returned from addCrewMember");
                        throw "Bad response from server on addCrewMember";
                    }
                    //refetch members
                    setCrewMembers(null);
                    handleAddClose();
                    cogoToast.success(`Added new member`, {hideAfter: 4});
                })
                .catch( error => {
                    cogoToast.error(`Error adding new member`, {hideAfter: 4});
                    console.error(error);
            });
    };

    return(
        <React.Fragment>
            <Button         
                    onClick={event => handleAddClickOpen(event)}    
                    variant="text"
                    color="secondary"
                    size="small"
                    className={classes.text_button}
            ><AddIcon className={classes.icon_small} fontSize="small"/><span>Add Member</span></Button>
            
            { addOpen && crewMembers ? 
            
            <Dialog PaperProps={{className: classes.dialog}} open={addOpen} onClose={handleAddClose}>
            <DialogTitle className={classes.title}>Name of New Crew Member</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                <TextField id="task-list-edit-name" 
                            className={classes.textField}
                            label="Name"
                            value={newMemberName}
                            onChange={event => setNewMemberName(event.target.value)}/>
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleAddClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleAddNew(event, newMemberName)}
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

} 

export default CrewMemberActionAdd;

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
  }));
