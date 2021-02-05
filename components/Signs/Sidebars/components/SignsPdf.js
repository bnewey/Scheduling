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


const SignsPdf = function(props) {
    const {user} = props;
  
    const { signs , columnState, columns} = useContext(ListContext);
    const classes = useStyles();

     
    const handleOpenSignsPdf = (event, signs)=>{

        if(signs && Array.isArray(signs)){

            Pdf.createSignSchedulePdf( signs, columns)
            .then((data)=>{
            var fileURL = URL.createObjectURL(data);
            window.open(fileURL);
            })
            .catch((error)=>{
            console.error("Failed to create and open pdf", error);
            })
        }    

        if(event){
            event.stopPropagation();
        }

    }

    return(<>
        <div className={classes.toolDiv}>
            <div className={classes.labelDiv}><span className={classes.labelSpan}>PDF </span></div>
            <div className={classes.rowDiv}>
             {/* <span className={classes.createPdfSpan} >Create Pdf</span> */}
             <div className={classes.newButtonDiv} >
            <Button className={classes.newButton} 
                    classes={{label: classes.newButtonLabel}} 
                    variant="outlined"
                    onClick={event=> handleOpenSignsPdf(event, signs)}
                    >
              <AddIcon className={classes.plusIcon}/>
              <span className={classes.buttonSpan}>Create Pdf</span>
            </Button>
          </div>
            </div>
        </div>
    </>)
}

export default SignsPdf;



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
        padding: '3%',
      },
      newButtonLabel:{
        display:'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        whiteSpace: 'nowrap',
        color: '#5f5f5f',
        fontWeight: 600,
      },
      newButton:{
        boxShadow: '0px 1px 1px 0px #4c4c4c',
        padding: '4px 17px',
        fontSize: '14px',
        background: 'linear-gradient(0deg, #f5f5f5, white)',
        '&:hover':{
          boxShadow: '0px 3px 10px 0px #8c8c8c',
        }
      },
    buttonSpan:{
        fontSize: '.7em',
    },
    plusIcon:{
        width: '.7em',
        height: '.7em',
    }
    
}));