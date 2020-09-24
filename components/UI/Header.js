import PropTypes from 'prop-types';
import Link from 'next/link';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';

import { makeStyles } from '@material-ui/core/styles';
import navButtons from "../../config/buttons";
import Nav from '../Nav';

import {styled} from '@material-ui/core/styles';

const StyledNav = styled(Nav)({
  display: 'flex',
  background: '#0968cf',
});

import AvatarMenu from './AvatarMenu';

import Avatar from '@material-ui/core/Avatar';


//import { styleToolbar } from './SharedStyles';

function Header({ user }) {

  const classes = useStyles();

  return (
    <div>
      <Toolbar className={classes.toolbar} >
        <Grid className={classes.grid_container} container direction="row" justify="space-around"  alignItems="center">
        <Grid item sm={11} xs={9} style={{ textAlign: 'left' }}>
            {/* {user ? (
                <div>
                <Hidden smDown>
                    <Link href="/">
                    <a style={{ marginRight: '20px' }}>Settings</a>
                    </Link>
                </Hidden>
                </div>
            ) : (
                <Link href="/">
                <Avatar
                    src="https://storage.googleapis.com/builderbook/logo.svg"
                    alt="Builder Book logo"
                    style={{ margin: '0px auto 0px 20px' }}
                />
                </Link>
            )} */}
            <StyledNav navButtons={navButtons} />
            </Grid>
            <Grid item sm={1} xs={3} style={{ textAlign: 'right' }}>
            {user ? (
                <div style={{ whiteSpace: ' nowrap' }}>
                    {user.avatarUrl ? (
                        <AvatarMenu options={optionsMenu} src={user.avatarUrl} alt={user.displayName} />
                    ) : null}
                </div>
            ) : (
              <Link href="/login">
              <Avatar
                  src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=128"
                  alt="Default Google logo"
                  style={{ margin: '0px auto 0px 20px' }}
              />
              </Link>

          )}
            </Grid>
        </Grid>
      </Toolbar>
    </div>
  );
}

const optionsMenu = [
    {
      text: 'Log out',
      href: '/logout',
    },
  ];

Header.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    displayName: PropTypes.string,
  }),
};

Header.defaultProps = {
  user: null,
};

export default Header;

const useStyles = makeStyles(theme => ({
  root: {
    
  },
  toolbar:{
    padding: '0px',
    margin:'0px',
    height:'auto',
    minHeight: '20px'
  },
  grid_container: {
    padding:'0px',
    margin: '0px',
    boxShadow: 'inset 0px 2px 4px -1px rgba(0,0,0,0.2), inset 0px 4px 5px 0px rgba(0,0,0,0.14), inset 0px 1px 10px 0px rgba(0,0,0,0.12)'
  }
}));