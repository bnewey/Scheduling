// import React, {useRef, useState, useEffect, useContext} from 'react';
// import {makeStyles, withStyles, List, ListItem, ListItemText,ListItemIcon, CircularProgress, Checkbox, InputBase, IconButton} from '@material-ui/core';
// import EditIcon from '@material-ui/icons/Edit';
// import AddIcon from '@material-ui/icons/Add';

// import clsx from 'clsx';
// import cogoToast from 'cogo-toast';
// import { FixedSizeList } from 'react-window';

// import dynamic from 'next/dynamic'
// const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
//   ssr: false
// });

// import Util from '../../../js/Util.js';

// import Settings from  '../../../js/Settings';
// import { ListContext } from '../WOContainer';
// import { DetailContext } from '../WOContainer';

// import WorkOrderDetail from  '../../../js/WorkOrderDetail';



// const ScoreboardList = function(props) {
//     const {scbdDrawerOpen, setScbdDrawerOpen,activeFPOrderItem, setActiveFPOrderItem, fpOrderItems, setFPOrderItems, scbdMode, setScbdMode} = props;

//     const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid,
//     currentView, previousView, handleSetView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

//     const {editWOIModalMode,setEditWOIModalMode, activeWOI, setActiveWOI, workOrderItems, 
//         setWorkOrderItems,editWOIModalOpen,setEditWOIModalOpen, vendorTypes, setVendorTypes,
//          shipToContactOptionsWOI, setShipToContactOptionsWOI, fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder,
//          fpOrderModalOpen, setFPOrderModalOpen, fpOrders, setFPOrders} = useContext(DetailContext)

    
     
//     const classes = useStyles();

//     // useEffect(()=>{
        
//     // },[scbdDrawerOpen])

//     const handleEditScbd = (scbd)=>{
//         if(!scbd){
//             console.error("Bad scbd data for edit scbd");
//             return;
//         }

//         setScbdDrawerOpen(true);
//         setScbdMode("edit");
//         setActiveFPOrderItem(scbd);
        
//     }

//     const handleAddScbd =()=>{
//         setScbdDrawerOpen(true);
//         setScbdMode("add");
//         setActiveFPOrderItem({model_quantity: 1, controller_quantity: 1});
        
//     }

//     return(
//         <div className={classes.root}>
//             <div>
//                 <span>Scoreboards</span>
//             </div>
//             <List className={classes.list}>

            
//             { fpOrderItems && fpOrderItems.map((item,i)=>{
//                 const isSelected = scbdMode == "edit" && (( activeFPOrderItem?.record_id  != null && activeFPOrderItem?.record_id == item.record_id ) ||  ( activeFPOrderItem?.tmp_record_id != null && activeFPOrderItem?.tmp_record_id == item.tmp_record_id ));
//                 return(
//                     <ListItem key={'scbd'+i} 
//                         dense 
//                         selected={ isSelected }
//                         button onClick={event => handleEditScbd(item)} 
//                         className={ clsx(classes.listItem, {
//                             [classes.listItemSelected]: isSelected,
//                           })}>
//                         <ListItemIcon onClick={event => handleEditScbd(item)} >
//                             <EditIcon />
//                         </ListItemIcon>
//                         <ListItemText>
//                             <div className={classes.liContainer}>
//                                 <div className={classes.liRowDiv}>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Model:</span><span className={classes.liRowItemValue}>{item.model}</span>
//                                     </div>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Qty:</span><span className={classes.liRowItemValue}>{item.model_quantity}</span>
//                                     </div>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Color:</span><span className={classes.liRowItemValue}>{item.color}</span>
//                                     </div>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Trim:</span><span className={classes.liRowItemValue}>{item.trim}</span>
//                                     </div>
//                                 </div>


//                                 <div className={classes.liRowDiv}>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Controller:</span><span className={classes.liRowItemValue}>{item.controller}</span>
//                                     </div>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Qty:</span><span className={classes.liRowItemValue}>{item.controller_quantity}</span>
//                                     </div>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Case:</span><span className={classes.liRowItemValue}>{item.ctrl_case}</span>
//                                     </div>
//                                     <div className={classes.liRowItem}>
//                                         <span className={classes.liRowItemLabel}>Horn:</span><span className={classes.liRowItemValue}>{item.horn}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </ListItemText>
//                     </ListItem>
//                 )
//             })
//             }
//                 { fpOrderItems?.length >= 4 ? <>Max of 4 Scoreboards</> : 
//                         <ListItem 
//                             button 
//                             selected={scbdDrawerOpen&& scbdMode && scbdMode == "add"}
//                             onClick={event => handleAddScbd()} 
//                             className={ clsx(classes.listItem, {
//                                 [classes.listItemSelected]: scbdDrawerOpen&& scbdMode && scbdMode == "add",
//                               })}>
//                      <ListItemIcon  >
//                             <AddIcon />
//                     </ListItemIcon>
//                     <ListItemText >Add New Scoreboard</ListItemText>
                    
//                 </ListItem> }
//             </List>
//         </div>
//     )
// }

// export default ScoreboardList

// const useStyles = makeStyles(theme => ({
//     root:{

//     },
//     list:{
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: '100%',
//     },
//     listItem:{
//         background: 'linear-gradient(0deg, #e5e5e5, #fefefe)',
//         boxShadow: '0px 0px 2px 1px #787878, 0px 0px 2px 1px #92e1ff',
//         '&:hover':{
//             background: 'linear-gradient(0deg, #d0d0d0, #e9e9e9)',
//         },
//         width: 600,
//     },
//     listItemSelected:{
//         background: 'linear-gradient(0deg, #a0c1cb, #d5e9ef)',
//         boxShadow: '0px 0px 2px 1px #787878, 0px 0px 2px 1px #92e1ff',
//         '&:hover':{
//             background: 'linear-gradient(0deg, #87bbcb, #aad4e0)',
//         },
//         width: 600,
//     },
//     liContainer:{
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
        
//     },
//     liRowDiv: {
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-around',
//         width: '100%',
//     },
//     liRowItem:{
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: '100%',
//         padding: '0px 15px'
//     },
//     liRowItemLabel:{
//         flexBasis: '40%',
//         textAlign: 'right',
//         color: '#777',
//         fontWeight: '600',
//         fontFamily: 'sans-serif',
//         whiteSpace: 'nowrap',
//         padding: '2px 5px'
        
//     },
//     liRowItemValue:{
//         flexBasis: '60%',
//         textAlign: 'left',
//         color: '#000',
//         fontWeight: '400',
//         fontFamily: 'sans-serif',
//         overflow: 'hidden',
//         textOverflow: 'ellipsis',
//         whiteSpace: 'nowrap',
//         padding: '2px 5px'
//     }
// }));
