

import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles,  Button, Dialog, DialogTitle, TextField, DialogContent, DialogActions,} from '@material-ui/core';
import { ChromePicker } from 'react-color';

import clsx from 'clsx';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../../UI/ConfirmYesNo';
import ReactTooltip from 'react-tooltip';

import cogoToast from 'cogo-toast';

import Crew from '../../../../../js/Crew';



const DEFAULT_COLOR = '#bbb'


const CrewColorPicker = (props) => {

    const {crew, setShouldResetCrewState, user} = props;

    const [newColor, setNewColor] = React.useState( crew?.crew_color || DEFAULT_COLOR)
    const [pickerOpen, setPickerOpen] = React.useState(false);

    const classes = useStyles({color: crew?.crew_color ? crew?.crew_color : DEFAULT_COLOR  });

    const handleOpenPicker = (event) =>{
        setPickerOpen(true)

        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }

    const handleClosePicker = () =>{
        setPickerOpen(false)
    }

    const handleChangeColor = (color) =>{
        if(!color){
            console.error("Bad or no color");
            return;
        }
        setNewColor(color);
    }

    const handleCancel = () =>{
        handleClosePicker();
        //setNewColor()
    }
    const handleSaveCrewColor = (color) =>{
        if(!crew){
            console.error("Bad crew");
            return;
        }
        Crew.updateCrewColor(crew.id, color.hex, user)
        .then((data)=>{
            cogoToast.success("Updated crew's color");
            setShouldResetCrewState(true);
            handleClosePicker();
        })
        .catch((error)=>{
            cogoToast.error("Failed to update crew's color");
            console.error("Failed to update crew's color", error);
            setShouldResetCrewState(true)
            handleClosePicker();
        })
    }


    return( <>
    <div className={classes.changeColorButton} onClick={event => handleOpenPicker(event)}>
        &nbsp;
    </div>

     { pickerOpen && 
     
     <Dialog open={pickerOpen}  maxWidth="md" >
                <ReactTooltip effect={"solid"} delayShow={500}/>
                <DialogTitle id="customized-dialog-title"  className={classes.dialogTitle}>
                    Change {crew?.crew_leader_name || ('Crew ' + crew.id).toString()} Marker Color
                </DialogTitle>
                <DialogContent className={classes.dialog} >
                <ChromePicker color={newColor}
                  onChange={handleChangeColor }/> 
                <DialogActions>
                <div className={classes.buttonDiv}>
                
                    <Button className={classes.button} fullWidth onClick={event=> handleCancel()}>
                        Cancel
                    </Button>
                    <Button className={classes.button} fullWidth onClick={event => handleSaveCrewColor(newColor)}>
                        Save
                    </Button>
                </div>
                </DialogActions>
                </DialogContent>
            </Dialog>}
    </>)
};

export default CrewColorPicker;


const useStyles = makeStyles(theme => ({
    changeColorButton:{
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        margin: '0px 10px',
        backgroundColor: props => props.color ? props.color : DEFAULT_COLOR,
        
    },
    dialog:{
        padding: '4px',
    },
    dialogTitle:{
        background: '#222b3f',
        color: '#fff',
    },
    buttonDiv:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button:{
        flexBasis: '25%',
        background: '#fff',
        borderTop: '1px solid #bbb',
        borderRadius: 0,
        fontFamily: 'sans-serif',
        color: '#001652',
        '&:hover':{
            color: '#0016ff',
            background: 'linear-gradient(#f3f3f3, #c9ced5)',
        }
    },
    
  }));

