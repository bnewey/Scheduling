import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles,Paper, Button, Dialog, DialogTitle, TextField, DialogContent, DialogActions,Checkbox} from '@material-ui/core';
import { useStaticState, ClockView, Calendar } from "@material-ui/pickers";

import cogoToast from 'cogo-toast';

import moment from 'moment';
import WorkOrders from '../../../../js/Work_Orders'
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactTooltip from 'react-tooltip';
import clsx from 'clsx';


const TLArrivalDatePicker = (props) => {
 
    //PROPS
    const { data ,...other} = props;
    console.log('data', data);
    // you can past mostly all available props, like minDate, maxDate, autoOk and so on
    const { pickerProps, wrapperProps, inputProps } = useStaticState({
        // value,
        // onChange: handleDateChange,
        ...other
    });

    //STATE
    const [isLoadingState, setIsLoadingState] = React.useState(true);
    const [statusList, setStatusList] = React.useState([]);

   const [selectedWOIs, setSelectedWOIs] = React.useState([]);

    
    console.log("other",{ ...other})
    console.log("PickerProps", pickerProps);
    console.log("WrapperProps", wrapperProps);
    console.log("inputProps", inputProps);

    const checkData = useCallback((data) =>{
        if(!data){
            console.error("Bad data in checkdata")
            return;
        }
        var statusListUpdate =[];

        //all scoreboard_arrival_date (date not passed, then display all dates and signs, else all fp scbds arrived )
        var awaitingArrivalItems = data.filter((item) => item.scoreboard_arrival_date != null && item.vendor != 2 && moment(item.scoreboard_arrival_date) > moment(new Date()) )
        //console.log("awaitingArrivalItems", awaitingArrivalItems)

        
        if(awaitingArrivalItems?.length > 0){
            awaitingArrivalItems.forEach((item)=>{
                statusListUpdate.push({woi_id: item.record_id,type: 'error', title: 'Arrival Date', 
                     description: `Waiting for Arrival Date`, sign: `${item.description}`, date: ` ${item.scoreboard_arrival_date}`})
            })
        }

                //all scoreboard_arrival_date (date not passed, then display all dates and signs, else all fp scbds arrived )
        var alreadyArrivedItems = data.filter((item) => item.scoreboard_arrival_date != null && item.vendor != 2 && moment(item.scoreboard_arrival_date) <= moment(new Date()) )
        //console.log("alreadyArrivedItems", alreadyArrivedItems)

        
        if(alreadyArrivedItems?.length > 0){
            alreadyArrivedItems.forEach((item)=>{
                statusListUpdate.push({woi_id: item.record_id,type: 'error', title: 'Arrived Date', 
                     description: `Item Arrived`, sign: `${item.description}`, date: ` ${item.scoreboard_arrival_date}`})
            })
        }

        //null scoreboard_arrival_dates (if null, arrival dates not set, else )
        var nullArrivalItems = data.filter((item) => item.scoreboard_arrival_date == null && item.vendor != 2 ) //not rainey
        //console.log("nullArrivalItems", nullArrivalItems)

        if(nullArrivalItems?.length > 0){
            nullArrivalItems.forEach((item)=>{
                statusListUpdate.push({woi_id: item.record_id, type: 'error', title: 'Empty Arrival Date',
                     description: `No Arrival Date set.`, sign: `${item.description}`})
            })
        }

        console.log("Status lst update", statusListUpdate);
        setStatusList(statusListUpdate);

    } ,[data])

    //FUNCTIONS
    useEffect(()=>{
        
        if(!props.task?.table_id || !data){
            console.error("Bad table id or no data");
            return;
        }

        checkData(data);
        setIsLoadingState(false);

    },[data])    

    //CSS
    const classes = useStyles();

    const handleTodayClick = () =>{
        //wrapperProps.onSetToday();
        props.onChange(moment().format('YYYY-MM-DD hh:mm:ss'))
    }

    const handleSetArrived = ()=>{
        if(selectedWOIs?.length == 0 ){
            cogoToast.error("No Items selected")
            return;
        }
        if(props.onItemsArrived){
            props.onItemsArrived(selectedWOIs);
        }
        wrapperProps.onDismiss();
    }

    const handleRenderDayForCalendar =  (day, selectedDate, dayInCurrentMonth, dayComponent) => {

        if(!moment().isSame(day, 'day')){
            return dayComponent
        }else{
            return getTodayStyledDayComponent(dayComponent)
        }
        
    }

    const getTodayStyledDayComponent = (dayComponent) =>{
        if(!dayComponent){
            console.error("Bad dayComponent in getTodayStyledDayComponent")
            return;
        }

        return <div className={classes.todayDayComponent}>{dayComponent}</div>

        
    }

    const handleClickCheckBox = (event, item) =>{
        if(!item){
            console.error("Bad item in handleClickCheckBox")
            return;
        }

        var updateSelectedWOIs = [...selectedWOIs];

        if(updateSelectedWOIs.length == 0){
            //add
            updateSelectedWOIs.push(item);
        }else{
            if(updateSelectedWOIs.find((v)=> v.woi_id == item.woi_id )){
                //remove
                updateSelectedWOIs = updateSelectedWOIs.filter((v,i)=> v.woi_id != item.woi_id )

            }else{
                //append
                updateSelectedWOIs.push(item);
            }

        }
        console.log("UpdateselectedWois", updateSelectedWOIs);
        setSelectedWOIs(updateSelectedWOIs);
    }


    return(
        <div className={classes.root}>
            
            <TextField {...inputProps} onClick={inputProps.openPicker} value={ props.value ? moment(props.value).format('MM-DD-YYYY') : null} className={classes.input} variant="outlined" />
            <Dialog {...wrapperProps} >
                <DialogTitle id="customized-dialog-title" onClose={wrapperProps.onDismiss} className={classes.dialogTitle}>
                    {props.title ? props.title : "Select Date"}
                </DialogTitle>
                <DialogContent className={classes.dialog} >
                <Calendar {...pickerProps} renderDay={handleRenderDayForCalendar}/>
                <div className={classes.woiListDiv}>
                    { !isLoadingState && statusList ?
                        <>{statusList.map((item,i)=> {
                            const isSelected = selectedWOIs.find((woi)=> woi.woi_id === item.woi_id) ? true : false;
                            return <div className={clsx( classes.woiListItem, {
                                                    [classes.woiListItemSelected] : isSelected 
                                                    } ) }>
                                     <Checkbox key={'checkboxFieldLI'+i} checked={isSelected} className={classes.li_checkbox}
                                        onChange={event=>handleClickCheckBox(event, item)}/>
                                     <span className={classes.liIdSpan}>{item.woi_id}</span>
                                     <span className={classes.liTitleSpan}>{item.title}</span>
                                     <span className={classes.liDateSpan}>{item.date ? item.date : 'Not Set'}</span>
                                </div>
                        })
                        }</>
                        :<><CircularProgress/></> 
                      }
                </div>
                <DialogActions>
                <div className={classes.buttonDiv}>
                <ReactTooltip />
                    <Button className={classes.button} fullWidth onClick={handleSetArrived} data-tip="Set selected to arrived (today)">
                        Arrived
                    </Button>
                    <Button className={classes.button} fullWidth onClick={handleTodayClick}>
                        Today
                    </Button>
                    <Button className={classes.button} fullWidth onClick={wrapperProps.onClear}>
                        Clear
                    </Button>
                    <Button className={classes.button} fullWidth onClick={wrapperProps.onDismiss}>
                        Cancel
                    </Button>
                </div>
                </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    );

} 
export default TLArrivalDatePicker;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        padding: '4px',
    },
    dialogTitle:{
        background: '#222b3f',
        color: '#fff',
    },
    input:{
        '& input':{
            textAlign: 'center',
            cursor: 'pointer',
            padding: '1px 0px 0px 0px',
            backgroundColor: '#f5fdff',
            padding: '0px 5px',
        }
        
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
    todayDayComponent:{
        background: '#ff77228c',
    },
    woiListDiv:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    woiListItem:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        borderRadius: '3px',
        '& span':{
            borderRight: '1px solid #c7c7c7' ,
            '&:last-child' :{
            borderRight: 'none' ,
            },
            margin: '0px 5px'
        }
    },
    woiListItemSelected:{
        background: 'linear-gradient(0deg, #26aded8a, #90ebff8c)',
    },
    li_checkbox:{
        padding: '1px',
        flexBasis: '13%',
        '& span':{
            color: '#444',
            '&:hover':{
              color: '#000',
            },
            border:'none',
        },
        
    },
    liIdSpan:{
        flexBasis: '20%',
        
    },
    liTitleSpan:{
        flexBasis: '35%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    liDateSpan:{
        flexBasis: '25%',
    },

  }));
