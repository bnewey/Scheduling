import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import socketIOClient from 'socket.io-client';

import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { yellow } from '@material-ui/core/colors';

export default function TempWriteInput({socket}){
    const formInputText = useRef();
    let classes = useMakeStyles();
    
    const [inputText, setInputText] = useState("");

    //Event Handler - sets then resets input text 
    function handleInput () {
        setInputText(formInputText.current.children[0].value);
        formInputText.current.children[0].value = "";
        setTimeout(()=> {
            setInputText(formInputText.current.children[0].value);
        },2000);
    }

    useEffect(() =>{ //useEffect for inputText
        if(inputText){
            socket.emit("Test_Command", inputText);
        }
        return () => {
            if(inputText){
                
            }
        }
    },[inputText]);

    return (
        <Paper className={classes.root}>
            <InputBase type="text" placeholder="send test command" ref={formInputText} className={classes.input} />
            <Button onClick={handleInput} variant="contained" className={classes.button}>
                 Send
            </Button>
            <span className={classes.span}>{inputText ? inputText + ' -   sent to ttyUSB' : ''}</span>
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
            }
        }));
        
        return(useStyles());
    }

}

