import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, CircularProgress, Grid, IconButton,TextField,InputBase, Select, MenuItem} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Grow from '@material-ui/core/Grow';
import cogoToast from 'cogo-toast';
import {createSorter} from '../../../../js/Sort';

import Util from  '../../../../js/Util';
import Inventory from  '../../../../js/Inventory';
import InventoryKits from  '../../../../js/InventoryKits';
import dynamic from 'next/dynamic'

import Autocomplete from '@material-ui/lab/Autocomplete';

const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

const PartsAndKitsSearch = function(props) {

  const [searchValue,setSearchValue] = useState("");
  const [searchTable, setSearchTable] = useState(null);
  const [searchHistory, setSearchHistory] = useState(null);
  
  const { searchOpenPermanent, parts, setParts, partsSearchRefetch, setPartsSearchRefetch, currentView, setCurrentView, views, openOnFocus} = props// useContext(ListContext);
  const searchOpen = searchOpenPermanent ||(currentView && currentView.value == "partsSearch");

  const searchTableObject= [
    {value: "all", displayValue: 'All'},
    {value: "p.rainey_id", displayValue: 'Part Rainey P#', table: 'parts'},
    {value: "p.description", displayValue: 'Part Description', table: 'parts'},
    {value: "pt.type", displayValue: 'Part Type', table: 'parts'},
    {value: "p.notes", displayValue: 'Part Notes', table: 'parts'},
    {value: "k.rainey_id", displayValue: 'Kit Rainey P#', table: 'kits'},
    {value: "k.description", displayValue: 'Kit Description', table: 'kits'},
    {value: "k.notes", displayValue: 'Kit Notes', table: 'kits'}
  ];

  const classes = useStyles({searchOpen});

  useEffect(()=>{
    if(!searchOpen ){
        setSearchValue("");
    }
  },[searchOpen])

  const searchRef = React.useRef(null);
  const tableRef = React.useRef(null);
  const listRef = React.useRef(null);
  

  useEffect(()=>{
    if(searchTable){
      document.activeElement.blur();
      console.log("searchTable", searchTable);
      if(searchRef.current){
        console.log("Currnet", searchRef.current);
         //searchRef.current.focus();
         //searchRef.current.select();
      }
      
    }
  },[searchTable])

  useEffect(()=>{
    if(partsSearchRefetch){
      setPartsSearchRefetch(false);
      

      handleSearchClick()
      .then((data)=>{
        setParts(data);
      })
      .catch((error)=>{
        console.error("Failed to research")
        cogoToast.error("Internal Server Error");
      })
    }


  },[partsSearchRefetch])

  //Save and/or Fetch searchTable to local storage
  useEffect(() => {
    if(searchTable == null){
      var tmp = window.localStorage.getItem('searchInvPartsTable');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setSearchTable(tmpParsed);
      }else{
        setSearchTable("all");
      }
    }
    if(searchTable){
      window.localStorage.setItem('searchInvPartsTable', JSON.stringify(searchTable));
    }
    
  }, [searchTable]);

  //Save and/or Fetch searchHistory to local storage
  useEffect(() => {
    if(searchHistory == null){
      var tmp = window.localStorage.getItem('searchInvPartsHistory');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setSearchHistory(tmpParsed);
      }else{
        setSearchHistory([]);
      }
    }
    if(Array.isArray(searchHistory)){
      window.localStorage.setItem('searchInvPartsHistory', JSON.stringify(searchHistory));
    }
    
  }, [searchHistory]);
  
  const search =(searchTable, searchValue)=>{
    return new Promise((resolve,reject)=>{
      if((!searchValue && searchValue != "") || !searchTable){
        console.error("Bad search value or search table on search");
        reject();
      }

      if(searchTable === "all"){
        Inventory.superSearchAllPartsAndKits(searchTableObject.filter((j)=>j.value !== "all"), searchValue)
          .then((data)=>{
            if(data){
              
              //Update search history
              if(searchValue != ""){
                var updateArray = searchHistory ?  [...searchHistory] : [];

                var a = searchHistory[searchHistory.length -1];
               
                if(searchHistory.length == 0 || (searchHistory.length >0 && (a.searchValue != searchValue || a.searchTable != searchTable))){

                  if(updateArray.length > 15){
                      //remove first index
                      updateArray.shift();
                  }
                  setSearchHistory([...updateArray, { id: searchValue + Math.floor((Math.random() * 10000) + 1),
                      searchValue: searchValue, searchTable: "all", results: data?.length || 0 }])
                }
              }
              
              resolve(data)
            }
          })
          .catch((error)=>{
            cogoToast.error("Failed to search all tables within parts");
            reject(error);
            
          })
      }else{
        if(searchTableObject.find((item)=> item.value == searchTable )?.table == 'parts'){
            Inventory.searchAllParts(searchTable, searchValue)
            .then((data)=>{
              if(data){
                //console.log(data);
                //Update search history
                if(searchValue != ""){
                  var updateArray = searchHistory ?  [...searchHistory] : [];

                  //check if current matches last, if so no need to add
                  if(searchHistory.length == 0 || (searchHistory.length >0 && searchHistory[searchHistory.length -1]?.searchValue != searchValue && searchHistory[searchHistory.length -1]?.searchTable != searchTable)){

                    if(updateArray.length > 15){
                        //remove first index
                        updateArray.shift();
                    }
                    setSearchHistory([...updateArray, { id: searchValue + Math.floor((Math.random() * 10000) + 1),
                        searchValue: searchValue, searchTable: searchTable, results: data?.length || 0 }])
                  }
                }

                resolve(data);
              }
            })
            .catch((error)=>{
              cogoToast.error("Failed to search parts");
              reject(error);
              
            })
        }
        if(searchTableObject.find((item)=> item.value == searchTable )?.table == 'kits'){
          InventoryKits.searchAllKits(searchTable, searchValue)
            .then((data)=>{
              if(data){
                //console.log(data);
                //Update search history
                if(searchValue != ""){
                  var updateArray = searchHistory ?  [...searchHistory] : [];

                  //check if current matches last, if so no need to add
                  if(searchHistory.length == 0 || (searchHistory.length >0 && searchHistory[searchHistory.length -1]?.searchValue != searchValue && searchHistory[searchHistory.length -1]?.searchTable != searchTable)){

                    if(updateArray.length > 15){
                        //remove first index
                        updateArray.shift();
                    }
                    setSearchHistory([...updateArray, { id: searchValue + Math.floor((Math.random() * 10000) + 1),
                        searchValue: searchValue, searchTable: searchTable, results: data?.length || 0 }])
                  }
                }

                resolve(data);
              }
            })
            .catch((error)=>{
              cogoToast.error("Failed to search kits");
              reject(error);
              
            })
        }
        
      }
    })
  }

  const handleEnterSearch = async (keyCode, event)=>{
    var id = event.target.id;

    if(isNaN(keyCode) || keyCode ==null || !id ){
      console.error("Bad keycode or element on handleClearSelectedTasksOnEsc");
      return;
    }
    if(keyCode === 13 && id ==  "sign_search_input"){ //enter key & input element's id
      try {
        var response = await search(searchTable, searchValue)    

        setParts(response);
      } catch (error) {
        cogoToast.error("Failed to search wo")
        console.error("Error", error);
      }
    }
  }

  const handleSearchClick = async() =>{
    if(searchOpen == false){
      setCurrentView( views.filter((view)=> view.value == "partsSearch")[0] )
      
    }else{
      //submit search
      setParts(await search(searchTable, searchValue));
    }
  }

  const handleChangeSearchValue = (event, value, reason, submit = false)=>{
    
    let str = value;
    str = str.replace(/^\s+/, '');
    if(str || str == '' ){
      setSearchValue(str)
    } 
  }

  const selectSearchField = () =>{
    const handleSearchTable = event => {
      setSearchTable(event.target.value);
    };

    return ( 
      <Select
        value={searchTable}
        onChange={handleSearchTable}
        ref={tableRef}
        className={classes.selectSearchTable}
        disableUnderline
      >
        {searchTableObject.map((item,i)=> (
          <MenuItem key={item.value+i} value={item.value}>{item.displayValue}</MenuItem>
        ))}
      </Select>)
  }

  return (
        <> 
        <Grid item className={  classes.searchGridItem} xs={ searchOpenPermanent ? 12 : searchOpen ? 5 : 5} style={searchOpenPermanent ? {width: '47em'} :{} } >
        {searchHistory && searchOpen == true ? 
            <><Grow in={searchOpen} style={{width: '100%'}}  >
            <div><KeyBinding onKey={ (e) => handleEnterSearch(e.keyCode, e) } />
            
            <Autocomplete
              id="sign_search_input"
              options={searchHistory}
              getOptionLabel={(option) => option.id || option}
              freeSolo
              openOnFocus={openOnFocus}
              ListboxProps={
                {ref: listRef}
              }
              inputValue={searchValue }
              classes={{input: classes.actualInputElement, option: classes.optionLi, listbox: classes.optionList }}
              onInputChange={async(event, value, reason)=> {
                //kind of hacked, if value exists as id in searchHistory Array, then use the array value, otherwise use whatevers typed
                //very low chance user types the id perfectly 
                var searchMatch = searchHistory.find((v)=> v.id == value);
                var matchValue = searchMatch?.searchValue || null;
                handleChangeSearchValue(event, matchValue || value, reason)
                if(matchValue){
                  setSearchTable(searchMatch.searchTable);
                  setParts(await search(searchMatch.searchTable, matchValue ));
                }
              } }
              renderInput={(params) => {  searchRef.current = params.inputProps.ref.current; return (<TextField
                
                className={classes.input}                
                placeholder="Search Parts and Kits"
                inputProps={{ 'aria-label': 'search parts', id: "parts_search_input", ref: searchRef, autoFocus: true}}
                autoFocus={true}
                {...params}
                InputProps={{...params.InputProps, startAdornment: searchOpen ? selectSearchField() : "", classes: {underline: classes.underline}}}
                
            />)}}

            renderOption={(option, state)=> {
              
            return(<div className={classes.optionDiv}>
                <span className={classes.optionSearchTableSpan}>{searchTableObject.filter((item)=> item.value == option.searchTable)[0]?.displayValue || option.searchTable}</span>
                <span className={classes.optionSearchValueSpan}>{option.searchValue}</span>
                <span className={classes.optionSearchResultsSpan}>Results: {option.results}</span>
                </div>)
            }}
            />
            
             </div></Grow>
            </> :
                <><span className={classes.toolbarLeftGridHeadSpan}>Search</span></>}
        <IconButton type="submit" className={classes.iconButton} aria-label="search" onClick={event=> handleSearchClick()}>
            <SearchIcon />
        </IconButton>    
        </Grid>
        </>
  );
}

export default PartsAndKitsSearch

const useStyles = makeStyles(theme => ({
  
  searchGridItem:{
    margin: '4px 5px 4px 10px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: props => props.searchOpen ? 'space-between' : 'flex-end',
    alignItems: 'center',
    
    background: props => props.searchOpen ?  '#fff' : '',
    border: props => props.searchOpen ? '1px solid #dcd9d9' : '',
    borderRadius: props => props.searchOpen ?  '0px 25px 25px 0px': '',
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
    margin: '2px',
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
  optionDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    width: '100%',
    backgroundColor: '#fff',
    borderLeft: '2px solid #fff',
     '&:hover':{
      backgroundColor: '#d3d3d3',
      borderLeft: '2px solid #ff9007'
    }
  },
  optionSearchValueSpan:{
    fontFamily: 'sans-serif',
    color: '#000',
    flexBasis: '64%',
    padding: '4px 5px 4px 10px',
    
  },
  optionSearchTableSpan:{
    
    fontFamily: 'sans-serif',
    color: '#888',
    flexBasis: '16%',
    padding: '4px 5px 4px 15px',
  },
  optionSearchResultsSpan:{
    padding: '4px 5px 4px 10px',
    fontFamily: 'sans-serif',
    color: '#888',
    flexBasis: '20%'
  },
  underline: {
    "&&&:before": {
      borderBottom: "none"
    },
    "&&:after": {
      borderBottom: "none"
    }
  },
  optionLi:{
    padding: 0,
    borderBottom: '1px solid #ececec',
    '&:last-child':{
      borderBottom: '1px solid #fff'
    },
    
  },
  optionList:{
    padding: '5px 1px 5px 1px',
    border: '1px solid #888',
    borderTop: "none",
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  

}));