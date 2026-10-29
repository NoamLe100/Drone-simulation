import { useState } from 'react'
import { cellToCoordinates } from './simulation/gridGeo';

function App() {
  const [count, setCount] = useState(0)
  console.log('(3, 7)', cellToCoordinates(3, 7));
  console.log('(0, 0)', cellToCoordinates(0, 0));
  console.log('(99, 99)', cellToCoordinates(99, 99));

  return (<></>)
}

export default App
