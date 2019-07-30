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



const IndexHead = () => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: 'auto',
      padding: '.5% 3% .7% 3%',
      margin: '1% 0% 2% 0%',
      backgroundColor: '#d6d6d68c'
    },
   
  }));

  //only works inside a functional component
  const classes = useStyles();



  return (
    <div className={classes.root}>
                <h1>Nitrogen Machine</h1>
                <ul>
                    <PostLink id="machineData" title="List of Machines"/>
                </ul>
          </div>
  )
}
export default IndexHead;