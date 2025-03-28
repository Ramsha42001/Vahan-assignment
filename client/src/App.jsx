import { useState } from 'react'
import { BrowserRouter as Router }  from 'react-router-dom'
import './App.css'
import AppRoute from './routes'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <AppRoute />
    </Router>

     </>
  )
}

export default App
