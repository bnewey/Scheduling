import React, { useContext, useState } from 'react';
import { makeStyles, Select, MenuItem } from '@material-ui/core';
import clsx from 'clsx';
import { Clear } from '@material-ui/icons';
import { ListContext } from '../../InvPartsContainer';

const DIV_OPTIONS = [
  { value: 'shop', label: 'Shop' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'insulation', label: 'Insulation' },
];

const DivisionFilterSelect = () => {
  const { divisFilter, setDivisFilter, setPartsRefetch } = useContext(ListContext);
  const classes = useStyles();

  const handleChange = (e) => setDivisFilter(e.target.value);
  const handleRemove = () => {
    setDivisFilter('');
    setPartsRefetch(true);
  };

  return (
    <>
      <div className={classes.headDiv}>
        <span className={classes.headSpan}>Filter By Division</span>
      </div>
      <div className={classes.container}>
        <Select
          className={clsx({ [classes.selectItem]: true, [classes.selectedItemActive]: divisFilter })}
          id="division_filter_select"
          value={divisFilter || ''}
          onChange={handleChange}
        >
          {DIV_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
        {divisFilter && (
          <div className={classes.removeDiv} onClick={handleRemove}>
            <Clear className={classes.icon} />
            <span className={classes.removeSpan}>Remove</span>
          </div>
        )}
      </div>
    </>
  );
};

export default DivisionFilterSelect;

const useStyles = makeStyles(() => ({
  container: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  removeDiv: {
    border: '1px solid #ce2727',
    borderRadius: '2px',
    background: '#ff8888',
    cursor: 'pointer',
    '&:hover': { background: '#dd7777' },
    padding: '3px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSpan: { fontFamily: 'arial', fontSize: '1em', color: '#222' },
  icon: { width: '.6em', height: '.6em' },
  selectItem: {
    minWidth: '10em',
    maxWidth: '12em',
    lineHeight: '2.4em',
    paddingLeft: '15px',
    backgroundColor: '#fff',
    border: '1px solid #bbb',
    margin: '2px',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    fontWeight: '600',
    color: '#545454',
    '&:hover': { backgroundColor: '#d1d1d1' },
    padding: 0,
  },
  selectedItemActive: { border: '1px solid #0066ff' },
  headDiv: { width: '100%', textAlign: 'center', padding: 4 },
  headSpan: { color: '#666', fontSize: 13, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 600, marginRight: 10 },
}));
