import { useState } from 'react'
import Dashboard from './pages/Dashboard'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        
          <div>
          <Dashboard />
         
        </div>
    
    </>
  )
}

export default App
