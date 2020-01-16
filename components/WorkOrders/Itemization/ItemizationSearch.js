import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';

import InputBase from '@material-ui/core/InputBase';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';


export default function ItemizationSearch({inputText, setInputText, searchTable, setSearchTable, shouldFetch, setShouldFetch}){
    const formInputText = useRef();
    let classes = useMakeStyles();
    

    const handleSearchTable = event => {
        setSearchTable(event.target.value);
      };

    //Event Handler - sets then resets input text 
    function handleInput () {
        setInputText(formInputText.current.children[0].value);
        setShouldFetch(true);
    }

    useEffect(() =>{ //useEffect for inputText
        if(inputText){
            
        }
        return () => {
            if(inputText){
                
            }
        }
    },[inputText]);

    return (
        <Paper className={classes.root}>
            <Select
                value={searchTable}
                onChange={handleSearchTable}
                className={classes.select}
            >
                <MenuItem value={'woi.description'}>Description</MenuItem>
                <MenuItem value={'woi.work_order'}>Work Order #</MenuItem>
                <MenuItem value={'e.name'}>Entity Name</MenuItem>
            </Select>
            <InputBase type="text" placeholder={'Search'} ref={formInputText} className={classes.input} />
            <Button onClick={handleInput} variant="contained" className={classes.button}>
                 Send
            </Button>
        </Paper>
    );

    function useMakeStyles(){
        const useStyles = makeStyles(theme => ({
            root: {
                width: 'auto',
                padding: '1% 2% 1% 3%',
                backgroundColor: '#b7c3cd',
                marginBottom: '1%'
            },
            input: {
                backgroundColor: '#fff',
                padding: '.25%',
                margin: '0% 1% 0% 1%',
            },
            button: {
                margin: '0% 1% 0% 0%'
            },
            span: {
                color: 'yellow',
                fontSize: '22px'
            },
            select: {
                backgroundColor: '#5e8dc5',
                padding: '2px 18px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '15px'
            }
        }));
        
        return(useStyles());
    }

}

