import { makeStyles } from '@material-ui/core/styles';

const Wrapper = ({children}) => {
  const useStyles = makeStyles(theme => ({
    root:  {
      borderBottom: '1px solid #ddd',
      backgroundColor: '#d7d7d7',
      padding: '0% 0% 2% 0%',
    },
  }) );

  const classes = useStyles();
  return (
      <div className={classes.root}>{children}</div>
  );
}

export default Wrapper