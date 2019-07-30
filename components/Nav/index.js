import Link from 'next/link'
import styled from 'styled-components'

const Wrapper = styled.nav`
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  background: #414d5a;
  a {
    padding: 0 15px;
    color: #FFF;
    &:hover {
      background: #414d5a;
      color: #c8dee4;
    }
  }
  
`

const Nav = () => (
  <Wrapper>
    <Link href="/"><a>DEV</a></Link>
    <Link href='/'><a>Home</a></Link> |
    <Link href='/machineData' prefetch><a>MachineData</a></Link>
  </Wrapper>
)

export default Nav