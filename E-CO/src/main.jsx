import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'

// Importez ici vos feuilles de style globales
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import './global.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
)