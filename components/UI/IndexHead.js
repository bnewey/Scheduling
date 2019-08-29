import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Link from 'next/link';

const PostLink = props => (
  <li>
      <Link href={`${props.id}`}>
          <a>{props.title}</a>
      </Link>
  </li>
);

const IndexHead = ({children}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: 'auto',
      padding: '.7% 0% .7% 3%',
      margin: '1% 0% 2% 0%',
      backgroundColor: '#d6d6d68c'
    },
    h1: {
      fontSize: '35px'

    }
   
  }));

  //only works inside a functional component
  const classes = useStyles();

  return (
    <div className={classes.root}>
                <h1 className={classes.h1}>{children}</h1>
          </div>
  )
}
export default IndexHead;