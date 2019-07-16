import Head from 'next/head'
import Wrapper from '../Machine/Wrapper'
import Nav from '../Nav'
import Footer from '../Footer'


export default ({ children, title = 'Nitrogen Machine' }) => (
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
            .main-wrapper {  margin: 3% 4% 5% 4%; }
        `}</style>
      </main>
  
      <Footer>
        Footer
      </Footer>
    </Wrapper>
  )