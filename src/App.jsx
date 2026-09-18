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
          <footer>
          © Laser Eletro – Dashboard geral • Desenvolvedor: Vinicius MKT • Versão: Alpha 1.0.0 • 2026
          </footer>
        </div>
    
    </>
  )
}

export default App
