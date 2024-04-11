import React from 'react';
import { makeStyles, Button, ButtonGroup } from '@material-ui/core';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ListIcon from '@material-ui/icons/List';
import MapIcon from '@material-ui/icons/Map';



const ModelTabs = ({ activeTab, setActiveTab }) => {
  const classes = useStyles();

  return (
    <ButtonGroup className={classes.root} aria-label="navigation buttons">
      <Button
        className={`${classes.button} ${activeTab === 'model' ? classes.activeButton : ''}`}
        onClick={() => setActiveTab('model')}
      >
        Models
      </Button>
      <Button
        className={`${classes.button} ${activeTab === 'description' ? classes.activeButton : ''}`}
        onClick={() => setActiveTab('description')}
      >
        Descriptions
      </Button>
      <Button
        className={`${classes.button} ${activeTab === 'color' ? classes.activeButton : ''}`}
        onClick={() => setActiveTab('color')}
      >
        Colors
      </Button>
    </ButtonGroup>
  );
};

export default ModelTabs

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50px', // Adjust the height as needed
      backgroundColor: '#e0e0e0', // Your desired background color
    },
    buttonGroup: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
    button: {
      margin: theme.spacing(1),
      color: 'white',
      textTransform: 'none', // Prevents uppercase transformation
      backgroundColor: '#6d6d6d', // Adjust button background color
      '&:hover': {
        backgroundColor: '#5c5c5c', // Adjust hover state color
      },
    },
    activeButton: {
      backgroundColor: '#8a8a8a', // Adjust active button color
    },
    icon: {
      marginRight: theme.spacing(1),
    },
  }));