import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, withStyles, Checkbox, Radio, RadioGroup, FormControl, FormControlLabel} from '@material-ui/core';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import Util from  '../../../../js/Util';
import Work_Orders from  '../../../../js/Work_Orders';
import { ListContext } from '../../WOContainer';
import { AirlineSeatLegroomNormalOutlined } from '@material-ui/icons';


const FilterCompInv = function(props) {
    const {user} = props;
  
    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
      currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder,  setEditWOModalOpen, raineyUsers, compInvState, setCompInvState} = useContext(ListContext);
    const classes = useStyles();

    
    const handleChange =( value, field)=>{
        if(!value || value == null){
            console.error("bad value in handleChange");
            return;
        }
        var tmpState = {...compInvState};
        tmpState[field] = value; 

        setCompInvState(tmpState);
        setWorkOrders(null)
    }


    return(<>
        <div className={classes.toolDiv}>
            <div className={classes.labelDiv}><span className={classes.labelSpan}>Completed/Invoiced</span></div>
            <div className={classes.rowDiv}>
                <span className={classes.label}>COMPLETED:</span>
                <span className={classes.value}>
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={compInvState?.completed} 
                                    onChange={event => handleChange(event?.target?.value, "completed")}
                                    classes={{root: classes.radioGroup}}>
                                        <FormControlLabel value={"all"} control={<Radio  classes={{checked: classes.radio }}/>} label="All" />   
                                        <FormControlLabel value={"yes"} control={<Radio  classes={{checked: classes.radio }}/>} label="Yes" />
                                        <FormControlLabel value={"no"} control={<Radio  classes={{checked: classes.radio }}/>} label="No" />
                        </RadioGroup>
                    </FormControl>
                </span>
            </div>
            <div className={classes.rowDiv}>
                <span className={classes.label}>INVOICED:</span>
                <span className={classes.value}>
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="Scoreboard/Sign/Other" 
                                    name="Scoreboard/Sign/Other" 
                                    value={compInvState?.invoiced} 
                                    onChange={event => handleChange(event?.target?.value, "invoiced")}
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

export default FilterCompInv;



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