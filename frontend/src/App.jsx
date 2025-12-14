import { useState, useEffect } from 'react'
import axios from 'axios' // Import Axios to configure global headers
import Inventory from './components/Inventory'
import SoldCars from './components/SoldCars'
import Dashboard from './components/Dashboard'
import Login from './components/Login' // <--- Import Login

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [activeTab, setActiveTab] = useState('home')

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
      localStorage.removeItem('access_token')
      setToken(null)
      delete axios.defaults.headers.common['Authorization']
  }

  // --- ATTACH TOKEN TO EVERY REQUEST ---
  if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // If no token, show Login Screen
  if (!token) {
      return <Login setToken={setToken} />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[95%] mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
                <span className="text-xl font-bold text-blue-600 tracking-wide mr-8">POCHO AUTO</span>
                <div className="hidden md:flex space-x-1">
                    <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}>Home</button>
                    <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}>Inventory</button>
                    <button onClick={() => setActiveTab('sold')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sold' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}>Sold Cars</button>
                </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button onClick={handleLogout} className="text-red-500 text-sm font-medium hover:text-red-700 border border-red-200 px-3 py-1 rounded bg-red-50">
                Log Out
            </button>
        </div>
      </nav>

      <main className="max-w-[95%] mx-auto py-8 px-4">
        {activeTab === 'home' && <Dashboard />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'sold' && <SoldCars />}
      </main>
    </div>
  )
}

export default App