import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Switch, FormControlLabel, List, ListItem, ListItemText,ListItemIcon, Modal, Backdrop, Fade, Grid, 
    TextField, FormControl, InputLabel, MenuItem, Select, IconButton,Popover,
    ButtonGroup, Button, CircularProgress, Avatar} from '@material-ui/core';
import BulletIcon from '@material-ui/icons/Crop75';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import ClearIcon from '@material-ui/icons/Clear';
import PersonalVideoIcon from '@material-ui/icons/PersonalVideo';
import cogoToast from 'cogo-toast';

import WorkOrders from '../../../../js/Work_Orders';
import Util from '../../../../js/Util';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import { TaskContext } from '../../TaskContainer';
import WoiStatusCheck from '../../TaskList/components/WoiStatusCheck';
import { set } from 'lodash';

const vendors  = []

const TaskModalWOSignArtItems = (props) =>{
    const {taskId, modalTask} = props;
    //const {} = useContext(TaskContext);

    //css
    const classes = useStyles();

    //State Variables
    const [signItems, setSignItems] = useState(null);
    const [showDates, setShowDates] = useState(false);

    //Popover WOI Status
    const [woiStatusAnchorEl, setWoiStatusAnchorEl] = React.useState(null);
    const [woiStatusRows, setWoiStatusRows] = useState([]);

    const [itemObject, setItemObject] = useState(null);

    useEffect(()=>{
        if(signItems == null){
            WorkOrders.getAllWorkOrderSignArtItems(taskId)
            .then((data)=>{
                setSignItems(data);
            })
            .catch((error)=>{
                console.error(error);
                cogoToast.error("Error getting work order items for sign/artwork");
            })
        }
        if(signItems && itemObject == null){
            let in_house = signItems.filter((item)=> item.vendor != null && item.vendor == 2)
            let fair_play = signItems.filter((item)=> item.vendor != null && item.vendor == 1)
            let undefined_sign = signItems.filter((item)=> item.scoreboard_or_sign > 0 && item.vendor == null )
            let reg_items = signItems.filter((item)=> item.scoreboard_or_sign == 0);
            setItemObject({
                in_house,
                fair_play,
                undefined_sign,
                reg_items
            })
        }
    },[signItems, itemObject])

    const handleChangeShowDates = event => {
        setShowDates(event.target.checked);
    };
    
    const convertDate = (date) => {
        if(!date){
            return 'N/A';
        }
        let date_string = Util.convertISODateToMySqlDate(date);
        return date_string;
    };

    const handleUpdateArrivalDate = (value, woi)=>{
        if( !woi ){
            cogoToast.error("Bad value");
            console.error("Bad value in handleUpdateArrivalDate");
            return;
        }
        WorkOrders.updateWorkOrderItemArrivalDate(woi.record_id, Util.convertISODateToMySqlDate(value))
        .then((data)=>{
            if(data){
                setSignItems(null);
                setItemObject(null);
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to update arrival date");
            console.error("Failed to update arrival date", error)
        })
    }

    const handleChangeVendorProp = (value, woi_id) =>{
        if(!value.target.value || !woi_id){
            cogoToast.error("Bad value in handleChangeVendorProp");
            console.error("Bad value in handleChangeVendorProp")
            return;
        }
        console.log(value.target);
        WorkOrders.updateWorkOrderItemVendor(woi_id, value.target.value)
        .then((data)=>{
            if(data){
                setSignItems(null);
                setItemObject(null);
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to update vendor");
            console.error("Failed to update vendor", error)
        })
        
    }
    const woistatusPopoverOpen = Boolean(woiStatusAnchorEl);
    const woiStatusPopoverId = open ? 'status-popover' : undefined;
    const handleOpenWoiStatusPopover = (event, statusRows) =>{
      if(!statusRows){
        console.warn("No status rows in popover");
        return;
      }
      setWoiStatusRows(statusRows);
      setWoiStatusAnchorEl(event.currentTarget);
      
      event.stopPropagation();
    }
    const handleWoiStatusPopoverClose = () => {
        setWoiStatusAnchorEl(null);
        
    };


    return(
        
        <Grid container >
            {itemObject  
            ?
            <Grid item xs={12} className={classes.paper}>
               <div className={classes.root}>
                   <div className={classes.headDiv}>
                        <span className={classes.taskTitle}>Work Order Items </span> 
                        <FormControlLabel
                            control={<Switch checked={showDates} onChange={handleChangeShowDates} />}
                            label="Show Comp Dates"
                            />
                        {/* STATUS POPOVER */}
                        <WoiStatusCheck handleOpenWoiStatusPopover={handleOpenWoiStatusPopover} 
                        task={modalTask} 
                        data={signItems?.filter((sign)=> sign.scoreboard_or_sign != 0)?.filter((item)=>item.work_order == modalTask.table_id)}/>
                        {signItems && <Popover
                            id={woiStatusPopoverId}
                            open={woistatusPopoverOpen}
                            anchorEl={woiStatusAnchorEl}
                            onClose={handleWoiStatusPopoverClose}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                            }}
                            transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                            }}
                            className={classes.popover}
                            classes={{paper: classes.popoverPaperWoi}}
                        >
                        <div className={classes.woiPopoverContainer}>
                            <div className={classes.closeButton} onClick={event => handleWoiStatusPopoverClose()}><CloseIcon/><span>Close</span></div>
                            
                            <div className={classes.woiPopoverHeadDiv}>
                                <span className={classes.woiPopoverSpanTitleHead}>WARNING</span>
                                <span className={classes.woiPopoverSpanDescriptionHead}>INFO</span>
                                <span className={classes.woiPopoverSpanSignHead}>SIGN</span>
                                <span className={classes.woiPopoverSpanDateHead}>DATE</span>
                            </div>  
                            { woiStatusRows.map((item,i)=> 
                            <div className={classes.woiPopoverDiv}>
                            <span className={classes.woiPopoverSpanTitle}>{i+1}. {item.title}</span>
                            <span className={classes.woiPopoverSpanDescription}>{item.description}</span>
                            <span className={classes.woiPopoverSpanSign}>{item.sign}</span>
                            <span className={classes.woiPopoverSpanDate}>{item.date}</span>
                            </div>
                            )

                            } 
                        </div> </Popover>  }
                        {/* END STATUS POPOVER */}
                    </div>

                    <List component="nav" aria-label="main mailbox folders" className={classes.list}>

                        {itemObject.in_house.length > 0 &&  <ListItem className={classes.list_head_item}>
                                <ListItemText  disableTypography className={classes.list_head_text}>
                                    <Grid container>
                                        <Grid item xs={8}>
                                            Rainey - In House Signs
                                        </Grid>
                                        <Grid item xs={2} style={{textAlign: 'center', backgroundColor: '#1f2b3a', borderRadius:'4px'}}>
                                            Vendor
                                        </Grid>
                                        
                                    </Grid>
                                </ListItemText>
                            </ListItem>}
                        {itemObject.in_house.length > 0 && itemObject.in_house.map((item)=> {
                           
                        return(
                            <ListItem button className={classes.list_item_root}>
                                <ListItemIcon>
                                    <PersonalVideoIcon/> 
                                </ListItemIcon>
                                <ListItemText className={classes.list_item_text}>
                                    <Grid container >
                                        <Grid item xs={8}>
                                        <div className={classes.item_head}>{item.description}&nbsp;(x{item.quantity})</div>
                                        { item.scoreboard_or_sign > 0 ? <><div className={classes.item_info}>
                                            <div className={item.sign_built ? classes.item_info_item : classes.item_info_item_na}>Sign Built</div> 
                                            <div className={item.copy_received ? classes.item_info_item : classes.item_info_item_na}>Copy Received</div>
                                            <div className={item.sent_for_approval ? classes.item_info_item : classes.item_info_item_na}>Sent for Appr</div>
                                            <div className={item.final_copy_approved ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Final Copy Appr</div>
                                            <div className={item.artwork_completed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Artwork Completed</div>
                                            <div className={item.sign_popped_and_boxed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Sign Popped/Boxed</div>
                                        </div>
                                        {showDates ? 
                                        <div className={classes.item_info}>
                                            <div className={item.sign_built ? classes.item_info_item : classes.item_info_item_na}> {convertDate(item.sign_built)}</div> 
                                            <div className={item.copy_received ? classes.item_info_item : classes.item_info_item_na}>{convertDate(item.copy_received)}</div>
                                            <div className={item.sent_for_approval ? classes.item_info_item : classes.item_info_item_na}>{convertDate(item.sent_for_approval)}</div>
                                            <div className={item.final_copy_approved ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.final_copy_approved)}</div>
                                            <div className={item.artwork_completed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.artwork_completed)}</div>
                                            <div className={item.sign_popped_and_boxed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.sign_popped_and_boxed)}</div>
                                        </div>
                                        : <></> } </> : <></>}
                                        </Grid>
                                        <Grid item xs={2}>
                                             <div className={classes.dateDiv}>
                                                <select
                                                id={"vendorinput"+item.record_id}
                                                className={classes.selectBox}
                                                value={item.vendor ? item.vendor : 0}
                                                onChange={value => handleChangeVendorProp(value, item.record_id)}
                                                >
                                                <option value={0}>N/A</option>
                                                <option value={1}>Fair Play</option> 
                                                <option value={2}>Rainey</option>
                                                </select> 
                                            </div>                                       
                                        </Grid>
                                        <Grid item xs={2} >
                                            {/* <div className={classes.dateDiv}>  
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <DatePicker clearable showTodayButton className={classes.datePicker} inputVariant="outlined"
                                                                    value={item.scoreboard_arrival_date} 
                                                                    format="MM/dd/yyyy"
                                                                    onChange={value => handleUpdateArrivalDate(value, item)} 
                                                                    />
                                                </MuiPickersUtilsProvider>
                                            </div> */}
                                        </Grid>
                                    </Grid>

                                    </ListItemText>
                            </ListItem>
                        )})}

                        {itemObject.fair_play.length > 0 && <ListItem className={classes.list_head_item}>
                                <ListItemText  disableTypography className={classes.list_head_text}>
                                    <Grid container>
                                        <Grid item xs={8}>
                                            Fair Play Signs
                                        </Grid>
                                        <Grid item xs={2} style={{textAlign: 'center', backgroundColor: '#1f2b3a', borderRadius:'4px'}}>
                                            Vendor
                                        </Grid>
                                        <Grid item xs={2} style={{textAlign: 'center', backgroundColor: '#1f2b3a', borderRadius:'4px'}}>
                                            Arrival Date
                                        </Grid>
                                    </Grid>
                                </ListItemText>
                            </ListItem>}
                        {itemObject.fair_play.length > 0 && itemObject.fair_play.map((item)=> {
                           
                           return(
                               <ListItem button className={classes.list_item_root}>
                                   <ListItemIcon>
                                       <PersonalVideoIcon/> 
                                   </ListItemIcon>
                                   <ListItemText className={classes.list_item_text}>
                                        <Grid container >
                                            <Grid item xs={8}>
                                                <div className={classes.item_head}>{item.description}&nbsp;(x{item.quantity})</div>
                                            </Grid>
                                            <Grid item xs={2}>
                                             <div className={classes.dateDiv}>
                                                <select
                                                id={"vendorinput"+item.record_id}
                                                className={classes.selectBox}
                                                value={item.vendor ? item.vendor : 0}
                                                onChange={value => handleChangeVendorProp(value, item.record_id)}
                                                >
                                                <option value={0}>N/A</option>
                                                <option value={1}>Fair Play</option> 
                                                <option value={2}>Rainey</option>
                                                </select> 
                                            </div>                                       
                                            </Grid>
                                            <Grid item xs={2} className={classes.dateGrid}>
                                            <div className={classes.dateDiv}>  
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <DatePicker clearable format="MM/dd/yyyy" showTodayButton className={classes.datePicker} inputVariant="outlined"
                                                                    value={item.scoreboard_arrival_date} onChange={value => handleUpdateArrivalDate(value, item)} />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </Grid>
                                       </Grid>
                                       </ListItemText>
                               </ListItem>
                        )})}

                        {itemObject.undefined_sign.length > 0 &&
                            <ListItem className={classes.list_head_item}>
                                <ListItemText  disableTypography className={classes.list_head_text}>
                                    <Grid container>
                                        <Grid item xs={8}>
                                            Unset Vendor Signs
                                        </Grid>
                                        <Grid item xs={2} style={{textAlign: 'center', backgroundColor: '#1f2b3a', borderRadius:'4px'}}>
                                            Vendor
                                        </Grid>
                                        <Grid item xs={2} style={{textAlign: 'center', backgroundColor: '#1f2b3a', borderRadius:'4px'}}>
                                            Arrival Date
                                        </Grid>
                                    </Grid>
                                </ListItemText>
                            </ListItem>}
                        {itemObject.undefined_sign.length > 0 && itemObject.undefined_sign.map((item)=> {
                           
                           return(
                               <ListItem button className={classes.list_item_root}>
                                   <ListItemIcon>
                                       <PersonalVideoIcon/> 
                                   </ListItemIcon>
                                   <ListItemText className={classes.list_item_text}>
                                       <Grid container >
                                        <Grid item xs={8}>
                                        <div className={classes.item_head}>{item.description}&nbsp;(x{item.quantity})</div>
                                        { item.scoreboard_or_sign > 0 ? <><div className={classes.item_info}>
                                            <div className={item.sign_built ? classes.item_info_item : classes.item_info_item_na}>Sign Built</div> 
                                            <div className={item.copy_received ? classes.item_info_item : classes.item_info_item_na}>Copy Received</div>
                                            <div className={item.sent_for_approval ? classes.item_info_item : classes.item_info_item_na}>Sent for Appr</div>
                                            <div className={item.final_copy_approved ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Final Copy Appr</div>
                                            <div className={item.artwork_completed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Artwork Completed</div>
                                            <div className={item.sign_popped_and_boxed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>Sign Popped/Boxed</div>
                                        </div>
                                        {showDates ? 
                                        <div className={classes.item_info}>
                                            <div className={item.sign_built ? classes.item_info_item : classes.item_info_item_na}> {convertDate(item.sign_built)}</div> 
                                            <div className={item.copy_received ? classes.item_info_item : classes.item_info_item_na}>{convertDate(item.copy_received)}</div>
                                            <div className={item.sent_for_approval ? classes.item_info_item : classes.item_info_item_na}>{convertDate(item.sent_for_approval)}</div>
                                            <div className={item.final_copy_approved ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.final_copy_approved)}</div>
                                            <div className={item.artwork_completed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.artwork_completed)}</div>
                                            <div className={item.sign_popped_and_boxed ? classes.item_info_item_bigger : classes.item_info_item_bigger_na}>{convertDate(item.sign_popped_and_boxed)}</div>
                                        </div>
                                        : <></> } </> : <></>}
                                        
                                        </Grid>
                                        <Grid item xs={2}>
                                             <div className={classes.dateDiv}>
                                                <select
                                                id={"vendorinput"+item.record_id}
                                                className={classes.selectBox}
                                                value={item.vendor ? item.vendor : 0}
                                                onChange={value => handleChangeVendorProp(value, item.record_id)}
                                                >
                                                <option value={0}>N/A</option>
                                                <option value={1}>Fair Play</option> 
                                                <option value={2}>Rainey</option>
                                                </select> 
                                            </div>                                       
                                        </Grid>
                                        <Grid item xs={2} className={classes.dateGrid}>
                                            <div className={classes.dateDiv}>  
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <DatePicker clearable format="MM/dd/yyyy" showTodayButton className={classes.datePicker} inputVariant="outlined"
                                                                    value={item.scoreboard_arrival_date} onChange={value => handleUpdateArrivalDate(value, item)} />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </Grid>
                                       </Grid>
                                       </ListItemText>
                               </ListItem>
                        )})}

                        {itemObject.reg_items.length > 0 &&<ListItem className={classes.list_head_item}>
                            <ListItemText disableTypography className={classes.list_head_text}>
                                Other Items
                            </ListItemText>
                        </ListItem>}
                            {itemObject.reg_items.length > 0 && itemObject.reg_items.map((item)=> {
                           
                           return(
                               <ListItem button className={classes.list_item_root}>
                                   <ListItemIcon>
                                       <RemoveIcon/> 
                                   </ListItemIcon>
                                   <ListItemText className={classes.list_item_text}>
                                        <Grid container >
                                            <Grid item xs={10}>
                                                <div className={classes.item_head}>{item.description}&nbsp;(x{item.quantity})</div>
                                            </Grid>
                                       </Grid>
                                       </ListItemText>
                               </ListItem>
                           )})}
                        
                    </List>
                </div>
            
            </Grid>
            : <></>}
        </Grid>
    );

};

export default TaskModalWOSignArtItems

const useStyles = makeStyles(theme => ({
    paper: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: '1% 3% !important',
      position: 'relative'
    },
    headDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    list:{
        padding: '0px',
    },
    list_item_root:{
        paddingTop: '0px',
        paddingBottom: '0px',
        borderBottom: '1px solid #ececec',
    },
    list_item_text:{
        marginTop: '0px',
        marginBottom:'0px',
        paddingTop: '0px',
        paddingBottom: '0px',
    },  
    item_head:{
        fontWeight: '600',
        color: '#2d3b4a',
        fontSize: '11px',
    },
    item_info:{
        display: 'flex',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
    },
    item_info_item:{
        
        color: '#238605',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '16%'
    },
    item_info_item_na:{
        color: '#4c4a4a',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '16%'
    },
    item_info_item_bigger:{
        color: '#238605',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '2 1 16%',
    },
    item_info_item_bigger_na:{
        color: '#4c4a4a',
        fontSize: '9px',
        margin: '0px 1%',
        flex: '2 1 16%',
    },
    taskTitle: {
        fontSize: '16px',
        fontWeight: '500',
        
        display: 'inline',
    },
    list_head_item:{
        padding: '0',
        margin: '0 0 0 0',
        backgroundColor: '#37495d'
    },
    list_head_text:{
        fontSize: '1.25em',
        fontWeight: '500',
        color: '#fff',
        padding: '2px 10px 2px 10px'
    },
    dateGrid:{
        backgroundColor: '#ffeebb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent:'center',
    },  
    dateDiv:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px 5px',
    },
    dateLabel:{

    },
    datePicker:{
        '& input':{
            padding: '4px 0px',
            backgroundColor: '#effeff',
        }
    },
    popoverPaperWoi:{
        width: '600px',
        borderRadius: '10px',
        backgroundColor: '#6f6f6f',
        maxHeight: '600px',
        overflowY: 'auto',
    },
    woiPopoverContainer:{
        padding: 13,
        background: '#fff'
    },
    woiPopoverHeadDiv:{
        display: 'flex',
        flexDiection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #cecece',
        textAlign: 'center'
    },
    woiPopoverDiv:{
        display: 'flex',
        flexDiection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #cecece',
    },
    woiPopoverSpanTitle:{
        fontFamily: 'sans-serif',
        color: '#000',
        flexBasis: '20%',
        fontWeight: '600',
    
    },
    woiPopoverSpanDescription:{
        fontFamily: 'sans-serif',
        color: '#333',
        flexBasis: '25%'
    },
    woiPopoverSpanSign:{
        flexBasis: '28%'
    },
    woiPopoverSpanDate:{
        flexBasis: '12%'
    },
    closeButton:{
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'underline'
        },
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
        marginBottom: '5px',
    },
    woiPopoverSpanTitleHead:{
        flexBasis: '20%',
    },
    woiPopoverSpanDescriptionHead:{
        flexBasis: '25%'
    },
    woiPopoverSpanSignHead:{
        flexBasis: '28%'
    },
    woiPopoverSpanDateHead:{
        flexBasis: '12%'
    },
  }));