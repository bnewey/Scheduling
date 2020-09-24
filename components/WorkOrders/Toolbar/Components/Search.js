import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, CircularProgress, Grid, IconButton,TextField,InputBase, Select, MenuItem} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Grow from '@material-ui/core/Grow';
import cogoToast from 'cogo-toast';

import Util from  '../../../../js/Util';
import Work_Orders from  '../../../../js/Work_Orders';
import { WOContext } from '../../WOContainer';
import dynamic from 'next/dynamic'
const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

const Search = function(props) {
  const {user} = props;

  
  const [searchValue,setSearchValue] = useState("");
  const [searchTable, setSearchTable] = useState("a.name")
  
  const { workOrders,setWorkOrders, rowDateRange, setDateRowRange, currentView, setCurrentView, views} = useContext(WOContext);
  const searchOpen = currentView && currentView.value == "search";

  const classes = useStyles({searchOpen});

  useEffect(()=>{
    if(!searchOpen ){
        setSearchValue("");
    }
  },[searchOpen])
  
  const search =()=>{
    return new Promise((resolve,reject)=>{
      if((!searchValue && searchValue != "") || !searchTable){
        console.error("Bad search value or search table on search");
        reject();
      }
      Work_Orders.searchAllWorkOrders(searchTable, searchValue)
      .then((data)=>{
        if(data){
          console.log(data);
          resolve(data)
        }
      })
      .catch((error)=>{
        cogoToast.error("Failed to search work orders");
        reject(error);
        
      })
    })
    
  }
  const handleEnterSearch = async (keyCode, event)=>{

    var id = event.target.id;

    if(isNaN(keyCode) && !id){
      console.error("Bad keycode or element on handleClearSelectedTasksOnEsc");
      return;
    }
    if(keyCode === 13 && id ==  "wo_search_input"){ //enter key & input element's id
      try {
        var response = await search()
        setWorkOrders(response);
      } catch (error) {
        cogoToast.error("Failed to search wo")
        console.error("Error", error);
      }
    }
  }

  const handleSearchClick = async() =>{
    if(searchOpen == false){
      setCurrentView( views.filter((view)=> view.value == "search")[0] )
      
    }else{
      //submit search
      setWorkOrders(await search());
    }
  }

  const handleChangeSearchValue = (value)=>{
    let str = value;
    str = str.replace(/^\s+/, '');
    if(str || str == '' ){
      setSearchValue(str)
    } 
  }

  const handleClearSearch = () =>{
    setSearchValue("");
    //dont know if i should clear
    //setWorkOrders(null);
  }

  const searchXButton = () =>{
    return(
      <div className={classes.searchXDiv}>
        <IconButton type="submit" className={classes.iconButton} aria-label="clear-search" onClick={event=> handleClearSearch()}>
          <ClearIcon />
        </IconButton>
      </div>
    )
  }

  const selectSearchField = () =>{
    const handleSearchTable = event => {
      setSearchTable(event.target.value);
    };

    return ( 
      <Select
        value={searchTable}
        onChange={handleSearchTable}
        className={classes.selectSearchTable}
        disableUnderline
      >
        <MenuItem value={'wo.description'}>Description</MenuItem>
        <MenuItem value={'wo.record_id'}>Work Order #</MenuItem>
        <MenuItem value={'a.name'}>Entity Name</MenuItem>
      </Select>)
  }


  return (
        <> 
        <Grid item className={classes.searchGridItem} xs={searchOpen ? 5 : 5}>
        {searchOpen == true ? 
            <><Grow in={searchOpen} style={{width: '100%'}}  >
            <div><KeyBinding onKey={ (e) => handleEnterSearch(e.keyCode, e) } /><InputBase
                className={classes.input}
                
                classes={{input: classes.actualInputElement }}
                placeholder="Search Work Orders"
                inputProps={{ 'aria-label': 'search work orders', id: "wo_search_input"}}
                autoFocus={true}
                value={searchValue }
                startAdornment={searchOpen ? selectSearchField() : ""}
                endAdornment={searchValue ? searchXButton() : ""}
                onChange={event=> handleChangeSearchValue(event.target.value)}
            /> </div></Grow>
            </> :
                <><span className={classes.toolbarLeftGridHeadSpan}>Search</span></>}
        <IconButton type="submit" className={classes.iconButton} aria-label="search" onClick={event=> handleSearchClick()}>
            <SearchIcon />
        </IconButton>    
        </Grid>
        </>
  );
}

export default Search

const useStyles = makeStyles(theme => ({
  
  searchGridItem:{
    margin: '4px 5px 4px 10px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: props => props.searchOpen ? 'space-between' : 'flex-end',
    alignItems: 'center',
    
    background: props => props.searchOpen ?  '#fff' : '',
    border: props => props.searchOpen ? '1px solid #dcd9d9' : '',
    borderRadius: props => props.searchOpen ?  '25px': '',
    // boxShadow: props => props.searchOpen ?  '1px 1px 2px #a2a2a2' : '',
    '&:hover':{
      boxShadow: props => props.searchOpen ?  '1px 1px 2px #a2a2a2' : '',
    }
  },
  input:{
    fontSize: '15px',
    width: '100%',
  },
  actualInputElement:{
    marginLeft:'5px',
  },
  selectUnderline: {
    border: 'none',
  },
  searchXDiv:{
    flexBasis: '11%',
  },
  selectSearchTable:{
    lineHeight: '2.4em',
    paddingLeft: '15px',
    backgroundColor: '#e2e2e2',
    borderRadius: '20px 0px 0px 20px',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    fontWeight: '600',
    color: '#545454',
    '&:hover':{
      backgroundColor: '#d1d1d1',
    }
  },
  toolbarLeftGridHeadSpan:{
    fontFamily: 'sans-serif',
    fontSize: '21px',
    color: '#4e4e4e',
    margin: '0px 10px 0px 10px'
  },

}));