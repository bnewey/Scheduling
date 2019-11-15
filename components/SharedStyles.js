//can import styles from here to multiple locations
//works with ssr

//ex
const styleToolbar = {
    background: '#FFF',
    height: '64px',
    paddingRight: '20px'
  }
  
  module.exports = {
    styleToolbar
  }

  //in component : 
//   import { styleToolbar } from './SharedStyles';
//   <Toolbar style={styleToolbar}></Toolbar>