import { useState } from 'react'
import Dashboard from './Components/Dashboard'
import StockDashboard from './Components/StockDashboard'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        
          <div>
          <Dashboard />
          <StockDashboard />
        </div>
    
    </>
  )
}

export default App
