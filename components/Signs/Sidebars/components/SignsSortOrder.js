import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, withStyles, Checkbox, Radio, RadioGroup, FormControl, FormControlLabel, Button} from '@material-ui/core';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AddIcon from '@material-ui/icons/Add';

import Util from  '../../../../js/Util';
import Pdf from  '../../../../js/Pdf';

import { ListContext } from '../../SignContainer';

const views = ["Description", "Install Date", "Signs + Artwork"]

const SignsSortOrder = function(props) {
    const {user} = props;
  
    const { signs, setSignRefetch ,  keyState, setKeyState, columnState, setColumnState} = useContext(ListContext);
    const classes = useStyles();

    const handleChangeSignSort = (event, view) =>{
        if(!view){
            console.error("No view in handleChangeSignSort")
            return;
        }
        setKeyState(view);
        setColumnState(view);
    }
    
    return(<>
        <div className={classes.toolDiv}>
            <div className={classes.labelDiv}><span className={classes.labelSpan}>Views</span></div>
            <div className={classes.rowDiv}>
             {/* <span className={classes.createPdfSpan} >Create Pdf</span> */}
             { views?.map((view)=> 
                <div className={classes.newButtonDiv} onClick={event=> handleChangeSignSort(event, view)} >
                    <span className={clsx(classes.clickableSpan, {
                        [classes.clickableSpanActive]: view === columnState,
                     })} 
                    >{view}</span>
                </div>
            )}
            </div>
        </div>
    </>)
}

export default SignsSortOrder;



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
        flexDirection: 'column',
        justifyContent: 'center',
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
    createPdfSpan:{
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'underline',
        }
    },
    newButtonDiv:{
        padding: '1%',
    },
    clickableSpan:{
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'underline',
        },
        color: '#004e7a'
    },
    clickableSpanActive:{
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'underline',
        },
        color: '#555'
    }

    
}));