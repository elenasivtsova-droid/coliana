import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ColianaApp from './App.jsx'
import ProviderLanding from './Providers.jsx'
import ProviderApplication from './ProviderApplication.jsx'
import Login from './Login.jsx'
import { AuthProvider } from './AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/coliana/">
        <Routes>
          <Route path="/" element={<ColianaApp />} />
          <Route path="/providers" element={<ProviderLanding />} />
          <Route path="/provider-application" element={<ProviderApplication />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
