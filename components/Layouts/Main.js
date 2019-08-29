import Head from 'next/head'
import Wrapper from '../Machine/Wrapper'
import Nav from '../Nav'
import Footer from '../Footer'

export default ({ children, title = 'Nitrogen Display' }) => (
    <Wrapper>
      <Head>
        <title>{ title }</title>
        
      </Head>
      <header>
        <Nav />
      </header>
    
      <main className='main-wrapper'>
        { children }
        <style jsx>{`
            
        `}</style>
      </main>
  
      <Footer>
        Rainey Electronics - Nitrogen Display
      </Footer>
      
    </Wrapper>
  )