import React from 'react'
import ReactDOM from 'react-dom/client'
import Vitta from './Vitta' // Referência única e exata
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Vitta />
  </React.StrictMode>,
)