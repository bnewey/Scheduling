import { makeStyles } from '@material-ui/core/styles';

/*
const Wrapper = styled.div`
  border-bottom: 1px solid #ddd;
  background-color: #ececec;
  padding: 0% 0% 2% 0%;
  a {
    padding: 15px;
    text-decoration: none;
    display: block;
    &:hover {
      background: #414d5a;
      color: #c8dee4;
    }
  }
  h3 {
    color: #222;
    font-weight: bold;
    font-size: 1.75rem;
    line-height: 35px;
    font-family: "PT Sans", sans-serif;
    text-transform: capitalize;
    margin: 0;
  }
  p {
    font-size: 1.2rem;
    line-height: 35px;
    color: #444;
    font-family: "PT Serif", sans-serif;
    margin: 0;
  }
`*/

const Wrapper = ({children}) => {


  const useStyles = makeStyles(theme => ({
    root:  {
      borderBottom: '1px solid #ddd',
      backgroundColor: '#ececec',
      padding: '0% 0% 2% 0%',
    },
  }) );

  const classes = useStyles();
  return (
      <div className={classes.root}>{children}</div>
  );
}

export default Wrapper