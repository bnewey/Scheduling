import { makeStyles } from '@material-ui/core/styles';

const Wrapper = ({children}) => {
  const useStyles = makeStyles(theme => ({
    rootWrapper:  {
      borderBottom: '1px solid #ddd',
      backgroundColor: '#d7d7d7',
      padding: '.5% 0% 2% 0%',
    },
  }) );

  const classes = useStyles();
  return (
      <div className={classes.rootWrapper}>{children}</div>
  );
}

export default Wrapper