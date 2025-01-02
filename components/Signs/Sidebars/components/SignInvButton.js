import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, withStyles, Checkbox, Radio, RadioGroup, FormControl, FormControlLabel, Button} from '@material-ui/core';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AddIcon from '@material-ui/icons/Add';

import Util from  '../../../../js/Util';
import { ListContext } from '../../SignContainer';
import { DetailContext } from '../../SignContainer';

const InvButton = function(props) {
    const {user} = props;
  
    const { signs , columnState, columns, currentView, handleSetView, views} = useContext(ListContext);
    const {setEditSignModalMode,setEditSignModalOpen, setFPOrderModalOpen, setFPOrderModalMode} = useContext(DetailContext);

    const classes = useStyles();

    const invOpen = currentView && currentView.value == 'invSign';

    const handleOpenSignModal = () =>{
        setEditSignModalMode("add")
        setEditSignModalOpen(true);
      }

    return (
        <>
            <div className={classes.toolDiv}>
                <div className={classes.labelDiv}>
                    <span className={classes.labelSpan}>Inventory </span>
                </div>
                <div className={classes.rowDiv}>
                    {/* <span className={classes.createPdfSpan} >Create Pdf</span> */}
                    <div className={classes.newButtonDiv}>
                        { !invOpen &&
                        <Button 
                            className={classes.newButton} 
                            classes={{ label: classes.newButtonLabel }} 
                            variant="outlined"
                            onClick={() => handleSetView( views.filter((view)=> view.value == "invSign")[0] )}
                        >
                            <span className={classes.buttonSpan}>Signs Inventory</span>
                        </Button> 
                        }
                        { invOpen &&
                        <Button 
                            className={classes.newButton} 
                            classes={{ label: classes.newButtonLabel }} 
                            variant="outlined"
                            onClick={event => handleOpenSignModal()}
                        >
                            <span className={classes.buttonSpan}>Add Sign to Inventory</span>
                        </Button> 
                        }
                    </div>
                </div>
            </div>
        </>
    );
}


export default InvButton;

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