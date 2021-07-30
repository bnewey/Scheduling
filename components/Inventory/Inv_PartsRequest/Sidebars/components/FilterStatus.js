import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, withStyles, Checkbox, Radio, RadioGroup, FormControl, FormControlLabel} from '@material-ui/core';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import Util from  '../../../../../js/Util';
import InventoryPartsRequest from  '../../../../../js/InventoryPartsRequest';
import { ListContext } from '../../InvPartsRequestContainer';


const FilterStatus = function(props) {
 
    const {   statusSortState, setStatusSortState,  
      user ,partsRequestItems, setPartsRequestItems, setPartsRequestItemsRefetch,
      partsRequestItemsSearchRefetch,setPartsRequestItemsSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState,
      activePRItem,         sorters, setSorters,  partsRequestItemsSaved, setPartsRequestItemsSaved,
       editPRIDialogMode, setEditPRIDialogMode, editPRIModalOpen, setEditPRIModalOpen,
       setActivePRItem} = useContext(ListContext);
    const classes = useStyles();

    
    const handleChange =( value, field)=>{
        if(!value || value == null){
            console.error("bad value in handleChange");
            return;
        }
        var tmpState = {...statusSortState};
        tmpState[field] = value; 

        setStatusSortState(tmpState);
        setPartsRequestItemsRefetch(true)
    }


    return(<>
        <div className={classes.toolDiv}>
            <div className={classes.labelDiv}><span className={classes.labelSpan}>Status Filter</span></div>
            <div className={classes.rowDiv}>
                <span className={classes.label}>Denied:</span>
                <span className={classes.value}>
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={statusSortState?.denied} 
                                    onChange={event => handleChange(event?.target?.value, "denied")}
                                    classes={{root: classes.radioGroup}}>
                                        <FormControlLabel value={"all"} control={<Radio  classes={{checked: classes.radio }}/>} label="All" />   
                                        <FormControlLabel value={"yes"} control={<Radio  classes={{checked: classes.radio }}/>} label="Yes" />
                                        <FormControlLabel value={"no"} control={<Radio  classes={{checked: classes.radio }}/>} label="No" />
                        </RadioGroup>
                    </FormControl>
                </span>
            </div>
            <div className={classes.rowDiv}>
                <span className={classes.label}>Filled:</span>
                <span className={classes.value}>
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={statusSortState?.filled} 
                                    onChange={event => handleChange(event?.target?.value, "filled")}
                                    classes={{root: classes.radioGroup}}>
                                        <FormControlLabel value={"all"} control={<Radio  classes={{checked: classes.radio }}/>} label="All" />   
                                        <FormControlLabel value={"yes"} control={<Radio  classes={{checked: classes.radio }}/>} label="Yes" />
                                        <FormControlLabel value={"no"} control={<Radio  classes={{checked: classes.radio }}/>} label="No" />
                        </RadioGroup>
                    </FormControl>
                </span>
            </div>
            <div className={classes.rowDiv}>
                <span className={classes.label}>On Hold:</span>
                <span className={classes.value}>
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={statusSortState?.hold} 
                                    onChange={event => handleChange(event?.target?.value, "hold")}
                                    classes={{root: classes.radioGroup}}>
                                        <FormControlLabel value={"all"} control={<Radio  classes={{checked: classes.radio }}/>} label="All" />   
                                        <FormControlLabel value={"yes"} control={<Radio  classes={{checked: classes.radio }}/>} label="Yes" />
                                        <FormControlLabel value={"no"} control={<Radio  classes={{checked: classes.radio }}/>} label="No" />
                        </RadioGroup>
                    </FormControl>
                </span>
            </div>
        </div>
    </>)
}

export default FilterStatus;



const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #339933',
      padding: '1%',
      minHeight: '730px',
    },
    toolDiv:{
        margin: '15px 5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems:'center',
        width: '100%'
    },
    rowDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        width: '100%'
    },
    labelDiv:{
        textAlign: 'center',
    }, 
    labelSpan:{
        marginRight: '10px',
        fontSize: '13px',
        fontFamily: 'sans-serif',
        fontWeight:'600',
        color: '#666',
        textAlign: 'center'
      },
    label:{
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 500,
        color: '#a55400'
    },
    value:{
        flexBasis:'40%',
        textAlign:'left',
        paddingLeft: '15px'
    },
    radioGroup:{
        flexWrap: 'nowrap',
        justifyContent: 'center'
    },
    radioFormControl:{
        flexBasis: '70%',
    },
    radio:{
        color: '#455669 !important',
    },
}));