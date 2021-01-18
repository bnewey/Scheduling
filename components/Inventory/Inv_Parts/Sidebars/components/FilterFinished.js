import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, withStyles, Checkbox, Radio, RadioGroup, FormControl, FormControlLabel} from '@material-ui/core';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import Util from  '../../../../../js/Util';
import Work_Orders from  '../../../../../js/Work_Orders';
import { ListContext } from '../../SignContainer';
import { AirlineSeatLegroomNormalOutlined } from '@material-ui/icons';


const FilterFinished = function(props) {
    const {user} = props;
  
    const { signs, setSigns, setSignRefetch,finishedState, setFinishedState } = useContext(ListContext);
    const classes = useStyles();

     //Save and/or Fetch searchTable to local storage
    useEffect(() => {
    if(finishedState == null){
      var tmp = window.localStorage.getItem('finishedState');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setFinishedState(tmpParsed);
      }else{
        setFinishedState({finished: 'all'});
      }
    }
    if(finishedState){
      window.localStorage.setItem('finishedState', JSON.stringify(finishedState));
    }
    
  }, [finishedState]);
    
    const handleChange =( value, field)=>{
        if(!value || value == null){
            console.error("bad value in handleChange");
            return;
        }
        var tmpState = {...finishedState};
        tmpState[field] = value; 

        setFinishedState(tmpState);
        setSignRefetch(true);
    }


    return(<>
        <div className={classes.toolDiv}>
            <div className={classes.labelDiv}><span className={classes.labelSpan}>Filters </span></div>
            <div className={classes.rowDiv}>
            <span className={classes.label}>Finished:</span>
                <span className={classes.value}>
                    {finishedState &&
                    <FormControl component="fieldset" classes={{ root: classes.radioFormControl}}>
                        <RadioGroup row 
                                    aria-label="ArrivedStatus" 
                                    name="ArrivedStatus" 
                                    value={finishedState?.finished} 
                                    onChange={event => handleChange(event?.target?.value, "finished")}
                                    classes={{root: classes.radioGroup}}>
                                        <FormControlLabel value={"all"} control={<Radio  classes={{checked: classes.radio }}/>} label="All" />   
                                        <FormControlLabel value={"yes"} control={<Radio  classes={{checked: classes.radio }}/>} label="Yes" />
                                        <FormControlLabel value={"no"} control={<Radio  classes={{checked: classes.radio }}/>} label="No" />
                        </RadioGroup>
                    </FormControl>}
                </span>
            </div>
        </div>
    </>)
}

export default FilterFinished;



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
        marginRight: '0px',
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
        flexBasis:'40%',
        fontFamily: 'sans-serif',
        fontWeight: 500,
        color: '#a55400'
    },
    value:{
        flexBasis:'60%',
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