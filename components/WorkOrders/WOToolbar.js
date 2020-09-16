import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, CircularProgress, Grid, IconButton,TextField,InputBase} from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import SearchIcon from '@material-ui/icons/Search';
import Grow from '@material-ui/core/Grow';

import cogoToast from 'cogo-toast';

import Util from  '../../js/Util';
import Work_Orders from  '../../js/Work_Orders';
import { WOContext } from './WOContainer';
import dynamic from 'next/dynamic'
const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

const OrdersToolbar = function(props) {
  const {user} = props;

  const [searchOpen,setSearchOpen] = useState(false);
  const [searchValue,setSearchValue] = useState("");
  
  const { workOrders,setWorkOrders, rowDateRange, setDateRowRange} = useContext(WOContext);

  const classes = useStyles({searchOpen});
  
  const search =()=>{
    if(!searchValue){
      return;
    }
    Work_Orders.searchAllWorkOrders("description", searchValue)
    .then((data)=>{
      if(data){
        console.log(data);
        return(data)
      }
    })
    .catch((error)=>{
      cogoToast.error("Failed to search work orders");
      return(error);
      
    })
  }
  const handleEnterSearch = (keyCode)=>{
    if(isNaN(keyCode)){
      console.error("Bad keycode on handleClearSelectedTasksOnEsc");
      return;
    }
    if(keyCode === 13){ //enter
      setWorkOrders(search());
    }
  }

  const handleSearchClick = () =>{
    if(searchOpen == false){
      setSearchOpen(true);
      
    }else{
      //submit search
      setWorkOrders(search());
    }
  }

  const handleChangeSearchValue = (value)=>{
    if(value){
      setSearchValue(value)
    }
  }

  return (
        <Grid container className={classes.root} >
            <Grid item xs={2}>
             <span>FairPlay Orders</span>
            </Grid>
            <Grid item xs={7}>

            </Grid>
            <Grid item className={classes.searchGridItem} xs={3}>
                {searchOpen == true ? 
                    <><Grow in={searchOpen} style={{width: '100%'}}  >
                    <div><KeyBinding onKey={ (e) => handleEnterSearch(e.keyCode) } /><InputBase
                      className={classes.input}
                      placeholder="Search Work Orders"
                      inputProps={{ 'aria-label': 'search work orders' }}
                      autoFocus={true}
                      value={searchValue }
                      onChange={event=> handleChangeSearchValue(event.target.value)}
                    /> </div></Grow>
                    </> :
                     <></>}
                <IconButton type="submit" className={classes.iconButton} aria-label="search" onClick={event=> handleSearchClick()}>
                  <SearchIcon />
                </IconButton>
            </Grid>
            
        </Grid>
  );
}

export default OrdersToolbar

const useStyles = makeStyles(theme => ({
  root:{
      display: 'flex',
      flexDirection: 'row',
      // border: '1px solid #333399',
      padding: '.2% 1%',
      background: 'linear-gradient(0deg, #f1f1f1, white)',
      boxShadow: '0px 3px 4px 0px #dcdcdc',
      border: '1px solid #d6d6d6',
  },
  searchGridItem:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: props => props.searchOpen ? 'space-between' : 'flex-end',
    alignItems: 'center',
    
    background: props => props.searchOpen ?  '#fff' : '',
    border: props => props.searchOpen ? '1px solid #dcd9d9' : '',
    borderRadius: props => props.searchOpen ?  '25px': '',
    boxShadow: props => props.searchOpen ?  '1px 1px 2px #a2a2a2' : '',
    '&:hover':{
      boxShadow: props => props.searchOpen ?  '1px 1px 3px #888888' : '',
    }
  },
  input:{
    marginLeft: '20px',
    fontSize: '15px',
    width: '100%',
  }
}));