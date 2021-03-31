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

    //STATE
    const [isLoadingState, setIsLoadingState] = React.useState(true);
    const [statusList, setStatusList] = React.useState([]);
    const [inputValue,setInputValue] = React.useState(null);

   const [selectedWOIs, setSelectedWOIs] = React.useState([]);

    const handleChangeDate  = (value)=>{
        if(selectedWOIs?.length == 0 ){
            cogoToast.error("No Items selected")
            return;
        }
        
        if(props.onChange){
            props.onChange(value, selectedWOIs)
        }
    }

    // you can past mostly all available props, like minDate, maxDate, autoOk and so on
    const { pickerProps, wrapperProps, inputProps } = useStaticState({
        // value,
        
        ...other,
        onChange: handleChangeDate,
    });

    useEffect(()=>{ // runs on open only
        if(wrapperProps?.open){

        }
    },[wrapperProps?.open])

    
    //console.log("other",{ ...other})
    //console.log("PickerProps", pickerProps);
    //console.log("WrapperProps", wrapperProps);
    //console.log("inputProps", inputProps);

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
                     description: `Item Arrived`, sign: `${item.description}`, date: ` ${item.scoreboard_arrival_date}`, arrived: true})
            })
        }

        //null scoreboard_arrival_dates (if null, arrival dates not set, else )
        var nullArrivalItems = data.filter((item) => item.scoreboard_arrival_date == null && item.vendor != 2 ) //not rainey
        //console.log("nullArrivalItems", nullArrivalItems)

        if(nullArrivalItems?.length > 0){
            nullArrivalItems.forEach((item)=>{
                statusListUpdate.push({woi_id: item.record_id, type: 'error', title: 'Empty Arrival Date',
                     description: `No Arrival Date set.`, sign: `${item.description}`, empty: true})
            })
        }

        //console.log("Status lst update", statusListUpdate);
        setStatusList(statusListUpdate);
        setSelectedWOIs(statusListUpdate.filter((item)=> item.empty == true))
        if(statusListUpdate.length){
            setInputValue(getMinDateItem(statusListUpdate))
        }
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
            cogoToast.error("No Items selected");
            return;
        }
        if(props.onItemsArrived){
            props.onItemsArrived(selectedWOIs);
        }
        wrapperProps.onDismiss();
    }

    const handleRenderDayForCalendar =  (day, selectedDate, dayInCurrentMonth, dayComponent, futureMonth) => {
        
        //Hides the numbers if the date is outside of the month (the numbers are disabled otherwise id leave them)
        if(!dayInCurrentMonth){
            return <><button className={clsx( classes.pickerDay, classes.pickerIconButton, classes.pickerButtonBase, { [classes.pickerDaySet]: set })} disabled tabindex="0" type="button">
            <span class="MuiIconButton-label"><p class="MuiTypography-root MuiTypography-body2 MuiTypography-colorInherit"></p></span>
            <span class="MuiTouchRipple-root"></span>
        </button></>
        }

        let selected = moment(selectedDate).isSame(day,'day');
        let set = statusList.some((item)=> {
            if(!item.date){
                return false;
            }
            return moment(item.date).isSame(day, 'day') 
        })
        let matchToday = moment().isSame(day, 'day');

       return   <div className={clsx({[classes.todayDayComponent]: matchToday })}>
                    <button data-tip={clsx(
                                { ["Arrive Date"]: set,
                                  ["(Today)"]: matchToday
                                 }
                            )} 
                            className={clsx( classes.pickerDay, classes.pickerIconButton, classes.pickerButtonBase,
                                           { /*[classes.pickerDaySelected]: selected && !futureMonth, */
                                            [classes.pickerDaySet]: set ,
                                            })}
                            tabindex="0" type="button">
                        <span class="MuiIconButton-label">
                            <p class="MuiTypography-root MuiTypography-body2 MuiTypography-colorInherit">{moment(day).date()}</p>
                        </span>
                        <span class="MuiTouchRipple-root"></span>
                    </button>
                </div>
        
        
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
        //console.log("UpdateselectedWois", updateSelectedWOIs);
        setSelectedWOIs(updateSelectedWOIs);
    }

    const getMinDateItem = (list)=>{
        let minDateItem = list.reduce(function(prev, current) {
            if(prev.date == null){
                return current;
            }
            if( current.date == null){
                return prev;
            }
            return (prev.date < current.date) ? prev : current
        })
        return minDateItem?.date ? moment(minDateItem.date).format('MM-DD-YYYY') : ''
    }

    const handleGetInputValue =  (list) =>{

        var return_value ="";
        return_value = getMinDateItem(list);
        
        //Overright regular min date return_value if one or more have arrived
        var arrivedItems = list.filter((item)=> {
            if(item.empty == true ){
                return false;
            }
            return item.arrived
        })

        var arrivedItemsLength = arrivedItems.length;

        if(arrivedItemsLength){
            if(arrivedItemsLength < list?.length ){
                return_value = `Arrived (${arrivedItemsLength}/${list?.length })`
            }else{
                return_value = 'Arrived';
            }
        }

        return return_value
    }


    const handleSelectAllSigns = ()=>{
        if(!statusList?.length){
            cogoToast("Interal Server Error");
            console.error("No status list to select");
            return;
        }
        if(selectedWOIs?.length != statusList?.length){
            setSelectedWOIs(statusList)
        }else{
            setSelectedWOIs([]);
        }
        
    }

    const handleOpenPicker = () =>{
        inputProps.openPicker();
    }

    const handleOnMonthChange = (date, num)=>{
        //num: 1 == left calendar | 2 == right calendar
        return new Promise((resolve, reject)=>{
            console.log("Date Month Change", date);
            

            if(num ==1){ // left only
                setInputValue(moment(date).format('MM-DD-YYYY'))
            }
            if(num ==2){ //right only
                setInputValue(moment(date).subtract(1, "M").format('MM-DD-YYYY'))
            }
            resolve(date);
        })
    }

    if(!statusList.length){
        return <></>
    }

    return(
        <div className={classes.root}>
            
            <TextField {...inputProps} onClick={handleOpenPicker} value={  handleGetInputValue(statusList) } className={classes.input} variant="outlined" />
            <Dialog  {...wrapperProps}  maxWidth="md" >
                <ReactTooltip effect={"solid"} delayShow={500}/>
                <DialogTitle id="customized-dialog-title" onClose={wrapperProps.onDismiss} className={classes.dialogTitle}>
                    {props.title ? props.title : "Select Date"}
                </DialogTitle>
                <DialogContent className={classes.dialog} >
                <div className={classes.calendarContainer}>
                    <div className={classes.calendarDiv}>
                        <Calendar  {...pickerProps} onMonthChange={(date)=>handleOnMonthChange(date, 1)}  showDaysOutsideCurrentMonth={true} date={ (()=>{  return inputValue  ? new Date(inputValue) : new Date() })()} renderDay={handleRenderDayForCalendar}
                        rightArrowButtonProps={{disableRipple: true,disabled: true, style: {color: '#fff', visibility: 'hidden'}}}/>
                    </div>
                    <div className={classes.calendarDiv}>
                        <Calendar {...pickerProps} onMonthChange={(date)=>handleOnMonthChange(date,2)}  date={ (()=>{  return inputValue  ? new Date(moment(inputValue).add(1, 'M')) : new Date(moment().add(1, 'M')) })()} 
                        renderDay={(day, selectedDate, dayInCurrentMonth, dayComponent)=>handleRenderDayForCalendar(day, selectedDate, dayInCurrentMonth, dayComponent, true)} disableHighlightToday={true} showDaysOutsideCurrentMonth={true}
                        leftArrowButtonProps={{disableRipple: true,disabled: true, style: {color: '#fff', visibility: 'hidden'}}}/>
                    </div>
                </div>
                <div className={classes.woiListDiv}>
                    { !isLoadingState && statusList ?
                        <><div className={clsx( classes.woiHeadListItem, {
                                [classes.woiHeadListItemSelected]:statusList?.length === selectedWOIs?.length
                            } ) }><Checkbox data-tip="Select/Deselect All" key={'checkboxFieldLISelectAll'} checked={statusList?.length === selectedWOIs?.length} className={classes.li_Headcheckbox}
                            onChange={event=>handleSelectAllSigns(event)}/>
                         <span className={classes.liHeadIdSpan}>ID</span>
                         <span className={classes.liHeadTitleSpan}>Sign</span>
                         <span className={classes.liHeadDateSpan}>Arrival Date</span></div>

                            {statusList.map((item,i)=> {
                            const isSelected = selectedWOIs.find((woi)=> woi.woi_id === item.woi_id) ? true : false;
                            return <div className={clsx( classes.woiListItem, {
                                                    [classes.woiListItemSelected] : isSelected 
                                                    } ) }>
                                     <Checkbox key={'checkboxFieldLI'+i} checked={isSelected} className={clsx(classes.li_checkbox, { [classes.li_checkboxSelected] : isSelected } )}
                                        onChange={event=>handleClickCheckBox(event, item)}/>
                                     <span className={classes.liIdSpan}>{item.woi_id}</span>
                                     <span className={classes.liTitleSpan}>{item.sign}</span>
                                     <span className={classes.liDateSpan}>{item.arrived ? `Arrived (${item.date})` : (item.date ? item.date : 'Not Set')}</span>
                                </div>
                        })
                        }</>
                        :<><CircularProgress/></> 
                      }
                </div>
                <DialogActions>
                <div className={classes.buttonDiv}>
                
                    <Button className={classes.button} fullWidth onClick={handleSetArrived} data-tip="Set selected to arrived (today)" data-place={'bottom'}>
                        Arrived
                    </Button>
                    <Button className={classes.button} fullWidth onClick={wrapperProps.onClear} data-tip="Clear selected dates" data-place={'bottom'}>
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
    calendarContainer:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    calendarDiv:{
        margin: '0px 10px',
        padding: '0px 10px',
        boxShadow: '-1px 2px 8px -1px rgb(161 161 161)',
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
        background: 'linear-gradient(0deg, #8787878a, #6d6d6d8c)',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        '& span':{
            borderRight: '1px solid #777' ,
            '&:last-child' :{
            borderRight: 'none' ,
            },
            '&:first-child':{
                borderRight: 'none',
            },
            margin: '0px 5px'
        },
        maxWidth: '410px',
    },
    woiListItemSelected:{
        background: 'linear-gradient(0deg, #eaeaea8a, #ffffff8c)',
        '& span':{
            borderRight: '1px solid #c7c7c7' ,
            '&:last-child' :{
            borderRight: 'none' ,
            },
            '&:first-child':{
                borderRight: 'none',
            },
            margin: '0px 5px'
        },
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
    li_checkboxSelected:{
        padding: '1px',
        flexBasis: '13%',
        '& span':{
            color: '#4dbe38',
            '&:hover':{
              color: '#398f29',
            },
            border:'none',
        }, 
    },
    liIdSpan:{
        flexBasis: '10%',
        textAlign: 'center',
        
    },
    liTitleSpan:{
        flexBasis: '40%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    liDateSpan:{
        flexBasis: '30%',
        textAlign: 'center',
    },
    
    woiHeadListItem:{
        background: '#3d8b6e',
        color: '#fff',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        '& span':{
            margin: '0px 5px'
        },
        borderBottom: '1px solid #555',
        maxWidth: '410px',
    },
    woiHeadListItemSelected:{
        //background: 'linear-gradient(0deg, #26aded8a, #90ebff8c)',
    },
    li_Headcheckbox:{
        padding: '1px',
        flexBasis: '13%',
        '& span':{
            color: '#fff',
            '&:hover':{
              color: '#bbb',
            },
            border:'none',
        },
        
    },
    liHeadIdSpan:{
        flexBasis: '10%',
        fontWeight: '600',
        textAlign: 'center',
        
    },
    liHeadTitleSpan:{
        flexBasis: '40%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: '600',
        textAlign: 'center',
    },
    liHeadDateSpan:{
        flexBasis: '30%',
        fontWeight: '600',
        textAlign: 'center',
    },

    pickerDay:{
        color: 'rgba(0, 0, 0, 0.87)',
        width: 36,
        height: 36,
        margin: '0 2px',
        padding: 0,
        fontSize: '0.5892857142857143rem',
        fontWeight: 500,
    },
    pickerIconButton:{
        flex: '0 0 auto',
        color: 'rgba(0, 0, 0, 0.54)',
        padding: 12,
        overflow: 'visible',
        fontSize: '1.1785714285714286rem',
        textAlign: 'center',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        borderRadius: '50%',
        '&:hover':{
            backgroundColor: 'rgba(0, 0, 0, 0.10)',
            //borderRadius: '50%',
        }
    },
    pickerButtonBase:{
        color: 'inherit',
        border: 0,
        cursor: 'pointer',
        margin: 0,
        display: 'inline-flex',
        outline: 0,
        padding: 0,
        position: 'relative',
        alignItems: 'center',
        userSelect: 'none',
        borderRadius: 0,
        verticalAlign: 'middle',
        MozAppearance: 'none',
        justifyContent: 'center',
        textDecoration: 'none',
        backgroundColor: 'transparent',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
    },
    pickerDaySelected:{
        background: '#14523b',
        color: '#fff',
        borderRadius: '50%',
        '&:hover':{
            color: '#000',
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
        }
    },
    pickerDaySet:{
        background: '#3d8b6e',
        color: '#fff',
        borderRadius: '50%',
        '&:hover':{
            color: '#000',
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
        }
    },
    pickerDaySetArrived:{
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
    }

  }));
