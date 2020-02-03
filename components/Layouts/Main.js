import Head from 'next/head'
import Wrapper from '../Scheduler/Wrapper'
import Nav from '../Nav';
import StyledFooter from '../Footer'
import navButtons from "../../config/buttons";
import { SnackbarProvider } from 'material-ui-snackbar-provider'

import {makeStyles } from '@material-ui/core/styles';

import {styled} from '@material-ui/core/styles';

const StyledNav = styled(Nav)({
  display: 'flex',
  background: '#414d5a',
});




const Layout = (props) => {

      const {children} = props;
      const title = "REI Scheduling";
      //CSS
      const classes = useStyles();
      return (
        <Wrapper>
          <Head>
            <title>{title}</title>
            
          </Head>
          <header>
            
            <StyledNav navButtons={navButtons} />
          </header>
          <SnackbarProvider  SnackbarProps={{ autoHideDuration: 5000, className: classes.snackbar } }>
          <main className='main-wrapper'>
            { children }
            <style jsx>{`
                margin: 0% 5% 2% 5%
            `}</style>
          </main>
          </SnackbarProvider>
          <StyledFooter />
          
        </Wrapper>
    );
  }

  export default Layout;


const useStyles = makeStyles(theme => ({
  snackbar: {
    '&& .MuiSnackbarContent-root':{
      padding: '0px 25px',
      minHeight: '50px',
      backgroundColor: '#4d5762',
      color: '#fff',
      border: '2px solid #bdf0ff',
      fontSize: '17px',
      fontWeight: 500,
     }
  },
}));
