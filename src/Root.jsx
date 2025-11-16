import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ColianaApp from './App.jsx'
import ProviderLanding from './Providers.jsx'
import ProviderApplication from './ProviderApplication.jsx'
import Login from './Login.jsx'
import { AuthProvider } from './AuthContext.jsx'

export default function Root() {
  return (
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
  )
}