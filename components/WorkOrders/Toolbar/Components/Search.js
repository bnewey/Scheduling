import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, CircularProgress, Grid, IconButton,TextField,InputBase, Select, MenuItem} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Grow from '@material-ui/core/Grow';
import cogoToast from 'cogo-toast';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import Util from  '../../../../js/Util';
import Work_Orders from  '../../../../js/Work_Orders';
import { ListContext } from '../../WOContainer';
import dynamic from 'next/dynamic'

import Autocomplete from '@material-ui/lab/Autocomplete';
import clsx from 'clsx';

const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

const Search = function(props) {
  const {user} = props;

  const [searchTable, setSearchTable] = useState(null);
  const [searchHistory, setSearchHistory] = useState(null);

  // New states for “Search Results” field
  const [additionalSearchValue, setAdditionalSearchValue] = useState("");
  const [isAdditionalSearchVisible, setIsAdditionalSearchVisible] = useState(false);

  // Fixed Type options for the Search view
const TYPE_OPTIONS = [
  'All',
  'Install',
  'Install (Drill)',
  'Delivery',
  'Parts (Mfg.)',
  'Parts (Service)',
  'Field',
  'Loaner',
  'Shipment',
  'Bench',
  'Pickup'
];

const [typeFilter, setTypeFilter] = useState('All');

// get a normalized type string from a row
const getRowType = (r) =>
  (r?.wo_type ?? r?.type ?? r?.['wo.type'] ?? '')
    .toString()
    .trim();

  const {
    savedSearch,
    setSavedSearch,
    searchValue,
    setSearchValue,
    workOrders,
    setWorkOrders,
    rowDateRange,
    setDateRowRange,
    currentView,
    previousView,
    handleSetView,
    views,
    backToSearch,
    setBackToSearch,
    savedSearchValue,
    setSavedSearchValue
  } = useContext(ListContext);

  const searchOpen = currentView && currentView.value === "search";
  const [open, setOpen] = useState(false);

  const searchTableObject = [
    {value: "all", displayValue: 'All'},
    {value: "wo.description", displayValue: 'Description'},
    {value: "wo.record_id", displayValue: 'Work Order #'},
    {value: "wo.po_number", displayValue: 'Purchase Order #'},
    {value: "a.name", displayValue: 'Billing Name'},
    {value: "c.name", displayValue: 'Entity Name'},
    {value: "wo.job_reference", displayValue: 'Job Reference'},
    {value: "wo.city", displayValue: 'WO City'},
    {value: "wo.state", displayValue: 'WO State'},
    {value: 'wo.organization', displayValue: 'Account/Org'},
    {value: 'sc.city', displayValue: 'Customer City'},
    {value: 'sc.state', displayValue: 'Customer State'},
    // {value: 'wo.type', displayValue: 'Type'}
  ];

  const classes = useStyles({searchOpen});

  const toggleAdditionalSearch = () => {
    setIsAdditionalSearchVisible((prev) => !prev);
  };

  const handleAdditionalSearchChange = (event) => {
    const val = event.target.value;
    setAdditionalSearchValue(val);
    // OPTIONAL: Live filtering onChange. If you only want it on Enter, put this in a separate handler:
    if (val.trim() === "") {
      // Reset to your original savedSearch if text field is cleared
      setWorkOrders(savedSearch);
    } else {
      // Filter the already fetched 'workOrders' in memory
      const filteredWorkOrders = workOrders.filter((wo) =>
        objectContainsSearchValue(wo, val)
      );
      setWorkOrders(filteredWorkOrders);
    }
  };

  // If user hides the “Search Results” field, optionally reset additionalSearchValue
  // and bring back your main search results.
  useEffect(() => {
    if (!isAdditionalSearchVisible) {
      setAdditionalSearchValue("");
      setWorkOrders(savedSearch); 
    }
  }, [isAdditionalSearchVisible]);

  useEffect(() => {
    if (currentView.value === 'search' && savedSearch?.length > 0) {
      setWorkOrders(savedSearch);
      setBackToSearch(true);
    }
  }, [currentView, savedSearch]);

  const searchRef = useRef(null);
  const tableRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (searchTable) {
      document.activeElement.blur();
      if (searchRef.current) {
        // If needed, focus or select
        // searchRef.current.focus();
        // searchRef.current.select();
      }
    }
  }, [searchTable]);

  // Apply the Type dropdown behavior:
  // - If "All": restore last text search (if any) otherwise clear list
  // - If a Type is selected and we have saved text results: filter them in-memory
  // - If a Type is selected and we have NO text results yet: fetch that type from server
  useEffect(() => {
  if (!searchOpen) return;

  const run = async () => {
    if (typeFilter === 'All') {
      if (Array.isArray(savedSearch)) {
        setWorkOrders(savedSearch);
      } else {
        // nothing searched yet; clear so user can start a fresh text search
        setWorkOrders(null);
      }
      return;
    }

    // If we already have text-search results, just filter those locally
    if (Array.isArray(savedSearch) && savedSearch.length) {
      const filtered = savedSearch.filter((row) => getRowType(row) === typeFilter);
      setWorkOrders(filtered);
      return;
    }

    // No text search yet — treat the dropdown as its own search
    try {
      const data = await search('wo.type', typeFilter);
      // IMPORTANT: do NOT setSavedSearch here; this keeps the text search independent
      setWorkOrders(data);
    } catch (e) {
      cogoToast.error('Failed to load work orders by Type');
      console.error(e);
    }
  };

  run();
}, [typeFilter, savedSearch, searchOpen, setWorkOrders]);

  // Save or fetch searchTable to local storage
  useEffect(() => {
    if (searchTable == null) {
      var tmp = window.localStorage.getItem('searchTable');
      var tmpParsed;
      if (tmp) {
        tmpParsed = JSON.parse(tmp);
      }
      if (tmpParsed) {
        setSearchTable(tmpParsed);
      } else {
        setSearchTable("a.name");
      }
    }
    if (searchTable) {
      window.localStorage.setItem('searchTable', JSON.stringify(searchTable));
    }
  }, [searchTable]);

  // Save or fetch searchHistory to local storage
  useEffect(() => {
    if (searchHistory == null) {
      var tmp = window.localStorage.getItem('searchHistory');
      var tmpParsed;
      if (tmp) {
        tmpParsed = JSON.parse(tmp);
      }
      if (Array.isArray(tmpParsed)) {
        setSearchHistory(tmpParsed);
      } else {
        setSearchHistory([]);
      }
    }
    if (Array.isArray(searchHistory)) {
      window.localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Apply the filter whenever the selection or results change
  useEffect(() => {
    if (!Array.isArray(savedSearch)) return;
    if (!typeFilter || typeFilter === 'All') {
      setWorkOrders(savedSearch);
      return;
    }
    const next = savedSearch.filter(r => {
      const t = (r?.wo_type ?? r?.type ?? r?.['wo.type'] ?? '').toString().trim().toLowerCase();
      return t === typeFilter.toLowerCase();
    });
    setWorkOrders(next);
  }, [typeFilter, savedSearch, setWorkOrders]);

  const updateSearchHistory = (searchValue, searchTable, resultsCount) => {
    if (searchValue !== "") {
      var updateArray = searchHistory ? [...searchHistory] : [];
      var a = searchHistory[searchHistory.length - 1];
      if (
        searchHistory.length === 0 ||
        (searchHistory.length > 0 && (a.searchValue !== searchValue || a.searchTable !== searchTable))
      ) {
        if (updateArray.length > 15) {
          updateArray.shift();
        }
        setSearchHistory([
          ...updateArray,
          {
            id: searchValue + Math.floor(Math.random() * 10000 + 1),
            searchValue: searchValue,
            searchTable: searchTable,
            results: resultsCount,
          },
        ]);
      }
    }
  };

  // Build the dropdown options from whatever is currently in results
  const typeOptions = React.useMemo(() => {
    const src = Array.isArray(savedSearch) && savedSearch.length ? savedSearch : (workOrders || []);
    const set = new Set(
      (src || [])
        .map(r => (r?.wo_type ?? r?.type ?? r?.['wo.type'] ?? '').toString().trim())
        .filter(Boolean)
    );
    return ['All', ...Array.from(set).sort()];
  }, [savedSearch, workOrders]);

  // Recursively check for searchValue in any nested fields
  const objectContainsSearchValue = (obj, sVal) => {
    const lowerSearchValue = sVal.toLowerCase();
    const checkValue = (value) => {
      if (value == null) return false;
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().toLowerCase().includes(lowerSearchValue);
      } else if (typeof value === 'object') {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    return checkValue(obj);
  };

  // Main search function
  const search = (table, value) => {
    return new Promise((resolve, reject) => {
      if ((!value && value !== "") || !table) {
        console.error("Bad search value or search table on search");
        reject();
      }

      if (table === "all") {
        const fieldsToSearch = searchTableObject
          .filter((j) => j.value !== "all" /* && j.value !== "searchWithinSearch" */)
          .map((v) => v.value);

        Work_Orders.superSearchAllWorkOrders(fieldsToSearch, value)
          .then((data) => {
            if (data) {
              updateSearchHistory(value, table, data?.length || 0);
              resolve(data);
            }
          })
          .catch((error) => {
            cogoToast.error("Failed to search work orders");
            reject(error);
          });
      } 
      else {
        // Normal field search
        Work_Orders.searchAllWorkOrders(table, value)
          .then((data) => {
            if (data) {
              updateSearchHistory(value, table, data?.length || 0);
              resolve(data);
            }
          })
          .catch((error) => {
            cogoToast.error("Failed to search work orders");
            reject(error);
          });
      }
    });
  };

  // Handle pressing Enter in the main search
  const handleEnterSearch = async (keyCode, event) => {
    var id = event.target.id;
    if (isNaN(keyCode) || keyCode == null || !id) {
      console.error("Bad keycode or element on handleEnterSearch");
      return;
    }
    if (keyCode === 13 && id === "wo_search_input") {
      try {
        var response = await search(searchTable, searchValue);
        setOpen(false);
        setWorkOrders(response);
        setSavedSearch(response);
      } catch (error) {
        cogoToast.error("Failed to search work orders");
        console.error("Error", error);
      }
    }
  };

  // Search button next to the main field
  const handleSearchClick = async () => {
    if (searchOpen === false) {
      handleSetView(views.filter((view) => view.value === "search")[0]);
    } else {
      let response = await search(searchTable, searchValue);
      setWorkOrders(response);
      setSavedSearch(response);
    }
  };

  const handleChangeSearchValue = (event, value, reason) => {
    const str = (value ?? '').toString().trimStart();

    // If the input was cleared via the UI, wipe state.
    if (reason === 'clear') {
      setSearchValue('');
      setSavedSearchValue('');
      return;
    }

    // For typing ('input') and selecting an option ('reset'),
    // reflect the new value in the text box.
    setSearchValue(str);
    setSavedSearchValue(str);
};

  const handleHighLigh = (event, option, reason) => {
    // optional highlight logging
  };

  const handleOnOpen = () => {
    setOpen(true);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const selectSearchField = () => {
    const handleSearchTable = (event) => {
      setSearchTable(event.target.value);
    };
    return (
      <Select
        value={searchTable}
        onChange={handleSearchTable}
        className={classes.selectSearchTable}
        ref={tableRef}
        disableUnderline
      >
        {searchTableObject.map((item, i) => (
          <MenuItem key={item.value + i} value={item.value}>
            {item.displayValue}
          </MenuItem>
        ))}
      </Select>
    );
  };

  return (
    <>
      <Grid item className={classes.searchGridItem} xs={searchOpen ? 7 : 5} md={5}>
        {searchHistory && searchOpen === true ? (
          <Grow in={searchOpen} style={{ width: '100%' }}>
            <div>
              <KeyBinding onKey={(e) => handleEnterSearch(e.keyCode, e)} />
              <ClickAwayListener onClickAway={handleClickAway}>
                <Autocomplete
                  id="wo_search_input"
                  options={searchHistory}
                  getOptionLabel={(option) => option.id || option}
                  freeSolo
                  openOnFocus
                  open={open}
                  onOpen={handleOnOpen}
                  debug
                  ListboxProps={{ ref: listRef }}
                  onHighlightChange={handleHighLigh}
                  autoHighlight={false}
                  inputValue={searchValue}
                  classes={{
                    input: classes.actualInputElement,
                    option: classes.optionLi,
                    listbox: classes.optionList
                  }}
                  onInputChange={async (event, value, reason) => {
                    // If user picks a previous history item, it has a known searchValue
                    var searchMatch = searchHistory.find((v) => v.id === value);
                    var matchValue = searchMatch?.searchValue || null;
                    handleChangeSearchValue(event, matchValue || value, reason);
                    if (matchValue) {
                      setSearchTable(searchMatch.searchTable);
                      let response = await search(searchMatch.searchTable, matchValue);
                      setWorkOrders(response);
                      setSavedSearch(response);
                    }
                  }}
                  renderInput={(params) => {
                    searchRef.current = params.inputProps.ref.current;
                    return (
                      <TextField
                        className={classes.input}
                        placeholder="Search Work Orders"
                        inputProps={{
                          'aria-label': 'search work orders',
                          id: "wo_search_input",
                          ref: searchRef,
                          autoFocus: true
                        }}
                        autoFocus={true}
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: searchOpen ? selectSearchField() : "",
                          classes: { underline: classes.underline }
                        }}
                      />
                    );
                  }}
                  renderOption={(option, state) => {
                    return (
                      <div
                        className={clsx(classes.optionDiv, {
                          [classes.optionDivSelected]: false
                        })}
                      >
                        <span className={classes.optionSearchTableSpan}>
                          {searchTableObject.find((item) => item.value === option.searchTable)
                            ?.displayValue || option.searchTable}
                        </span>
                        <span className={classes.optionSearchValueSpan}>{option.searchValue}</span>
                        <span className={classes.optionSearchResultsSpan}>
                          Results: {option.results}
                        </span>
                      </div>
                    );
                  }}
                />
              </ClickAwayListener>
            </div>
          </Grow>
        ) : (
          <span className={classes.toolbarLeftGridHeadSpan}>Search</span>
        )}
        <IconButton className={classes.iconButton} aria-label="search" onClick={handleSearchClick}>
          <SearchIcon />
        </IconButton>
      </Grid>

      {/* Button to show/hide an extra text field for “Search Results” */}
      {searchOpen && (
        <button className={classes.searchGridItem} onClick={toggleAdditionalSearch}>
        {isAdditionalSearchVisible ? "Hide Search Results" : "Search Results"}
        </button>
      )}

      {searchOpen && (
        <Grid item className={classes.typeFilterWrap}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            variant="outlined"
            className={classes.typeSelect}
          >
            {TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </Grid>
      )}

        <Grid className={classes.searchGridItem} container direction="column" style={{ marginLeft: 325, marginTop: 8 }} xs={searchOpen ? 7 : 5} md={5}>
        {isAdditionalSearchVisible && (
          <Grid item style={{ marginTop: 8 }}>
            <TextField
              className={classes.additionalInput}
              placeholder="Search Results"
              value={additionalSearchValue}
              onChange={handleAdditionalSearchChange}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default Search;

const useStyles = makeStyles((theme) => ({
  searchGridItem: {
    margin: '4px 5px 4px 10px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: (props) => (props.searchOpen ? 'space-between' : 'flex-start'),
    alignItems: 'center',
    background: (props) => (props.searchOpen ? '#fff' : ''),
    border: (props) => (props.searchOpen ? '1px solid #dcd9d9' : ''),
    borderRadius: (props) => (props.searchOpen ? '0px 25px 25px 0px' : ''),
    '&:hover': {
      boxShadow: (props) => (props.searchOpen ? '1px 1px 2px #a2a2a2' : ''),
    }
  },
  typeFilterWrap: {
    margin: '4px 10px',
    display: 'flex',
    alignItems: 'center',
  },
  typeSelect: {
    minWidth: 180,
    height: 36,
    fontSize: 13,
    fontWeight: 600,
    background: '#fff',
    borderRadius: 18,
  },
  input: {
    fontSize: '15px',
    width: '100%',
  },
  actualInputElement: {
    marginLeft: '5px',
  },
  selectUnderline: {
    border: 'none',
  },
  searchXDiv: {
    flexBasis: '11%',
  },
  selectSearchTable: {
    lineHeight: '2.4em',
    paddingLeft: '15px',
    backgroundColor: '#e2e2e2',
    margin: '2px',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    fontWeight: '600',
    color: '#545454',
    '&:hover': {
      backgroundColor: '#d1d1d1',
    }
  },
  toolbarLeftGridHeadSpan: {
    fontFamily: 'sans-serif',
    fontSize: '21px',
    color: '#4e4e4e',
    margin: '0px 10px 0px 10px'
  },
  optionDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderLeft: '2px solid #fff',
    '&:hover': {
      backgroundColor: '#d3d3d3',
      borderLeft: '2px solid #ff9007'
    }
  },
  optionDivSelected: {
    backgroundColor: '#ccc',
  },
  optionSearchValueSpan: {
    fontFamily: 'sans-serif',
    color: '#000',
    flexBasis: '64%',
    padding: '4px 5px 4px 10px',
  },
  optionSearchTableSpan: {
    fontFamily: 'sans-serif',
    color: '#888',
    flexBasis: '16%',
    padding: '4px 5px 4px 15px',
  },
  optionSearchResultsSpan: {
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
  optionLi: {
    padding: 0,
    borderBottom: '1px solid #ececec',
    '&:last-child': {
      borderBottom: '1px solid #fff'
    },
  },
  optionList: {
    padding: '5px 1px 5px 1px',
    border: '1px solid #888',
    borderTop: "none",
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  toggleButton: {
    marginLeft: 10,
    cursor: 'pointer'
  },
  additionalInput: {
    marginLeft: 10,
    marginTop: 8
  }
}));
