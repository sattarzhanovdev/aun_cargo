import React from 'react'
import './App.scss'
import { Components } from './components'
import MainRoutes from './routes'
import axios from 'axios'
import BarcodeScanner from './pages/code'
import { API } from './api'
import { useNavigate } from 'react-router-dom'

// axios.defaults.baseURL = 'https://auncrm.pythonanywhere.com/clients'
axios.defaults.baseURL = 'http://127.0.0.1:8000/api'

function App() {
  const nav = useNavigate()

  
  return (
    <div>
      <Components.Navbar />
      <MainRoutes />
    </div>
  )
}

export default App
