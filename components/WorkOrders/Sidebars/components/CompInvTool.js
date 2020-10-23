import React, {useRef, useState, useEffect, useContext} from 'react';
import { makeStyles, withStyles, Checkbox} from '@material-ui/core';

import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import Util from  '../../../../js/Util';
import Work_Orders from  '../../../../js/Work_Orders';
import { ListContext } from '../../WOContainer';


const CompInvTool = function(props) {
    const {user} = props;
  
    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange,
      currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder,  setEditWOModalOpen, raineyUsers} = useContext(ListContext);
    const classes = useStyles();

    const [completed, setCompleted] = useState(activeWorkOrder ? (activeWorkOrder["completed"] == 1 ? true : false ) : false )
    const [invoiced, setInvoiced] = useState(activeWorkOrder ? (activeWorkOrder["invoiced"] == 1 ? true : false ) : false )

    useEffect(()=>{
        if(activeWorkOrder){
            setCompleted(activeWorkOrder["completed"])
            setInvoiced(activeWorkOrder["invoiced"])
        }
    },[activeWorkOrder])


    const handleChange =(event, field)=>{
        if(!event || !field){
            cogoToast.error("Failed to Update");
            console.error("Failed to update, bad field or event");
            return;
        }

        var updateWorkOrder = {...activeWorkOrder};
        var updateValue = event.target.checked ? 1 : 0;

        updateWorkOrder[field] = updateValue;
        updateWorkOrder['record_id'] = activeWorkOrder.wo_record_id;


        Work_Orders.updateWorkOrder(updateWorkOrder)
        .then((data)=>{
            if(data){
                cogoToast.success("Updated " + field)
                setActiveWorkOrder(null)
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to Update WO")
            console.error("Failed to Update WO", error);
        })

    }

    return(<>
        <div className={classes.toolDiv}>
            <div className={classes.rowDiv}>
                <span className={classes.label}>Completed</span>
                <span className={classes.value}>
                    <Checkbox checked={completed ? true : false} 
                                onChange={event => handleChange(event, "completed")}
                                className={classes.checkbox}
                                checkedIcon={ <CheckBoxIcon className={classes.iconChecked} /> }
                                icon={<CheckBoxOutlineBlankIcon className={classes.icon}/>}/>
                </span>
            </div>
            <div className={classes.rowDiv}>
                <span className={classes.label}>Invoiced</span>
                <span className={classes.value}>
                <Checkbox checked={invoiced ? true : false} 
                                onChange={event => handleChange(event, "invoiced")}
                                className={classes.checkbox}
                                checkedIcon={ <CheckBoxIcon className={classes.iconChecked} /> }
                                icon={<CheckBoxOutlineBlankIcon className={classes.icon}/>}/>
                </span>
            </div>
        </div>
    </>)
}

export default CompInvTool;



const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #339933',
      padding: '1%',
      minHeight: '730px',
    },
    toolDiv:{
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
    label:{
        fontSize: '2em',
        color: '#444',
        textAlign: 'right',
        flexBasis:'60%',
        fontFamily: 'sans-serif',
    },
    value:{
        flexBasis:'40%',
        textAlign:'left',
        paddingLeft: '15px'
    },
    iconChecked:{
        width: '1.7em',
        height: '1.7em',
        color:'#33bb22',
    },
    icon:{
        width: '1.7em',
        height: '1.7em',
        color:'#929292',
        '&:hover':{
            color: '#303030',
        },
        backgroundColor: 'linear-gradient(0deg, #f5f5f5, white)'
    }
}));