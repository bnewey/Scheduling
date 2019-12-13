import Head from 'next/head'
import Wrapper from '../Scheduler/Wrapper'
import Nav from '../Nav';
import StyledFooter from '../Footer'
import navButtons from "../../config/buttons";
import { Component } from 'react';

import {styled} from '@material-ui/core/styles';

const StyledNav = styled(Nav)({
  display: 'flex',
  background: '#414d5a',
});




 export default class Layout extends React.Component {
    constructor(props){
      super(props);
    }



   render(){
      const {children} = this.props;
      const title = "REI Scheduling";

      return (
        <Wrapper>
          <Head>
            <title>{title}</title>
            
          </Head>
          <header>
            
            <StyledNav navButtons={navButtons} />
          </header>
          
          <main className='main-wrapper'>
            { children }
            <style jsx>{`
                margin: 0% 5% 2% 5%
            `}</style>
          </main>
      
          <StyledFooter />
          
        </Wrapper>
    );
  }
}

