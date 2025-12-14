import { useState, useEffect } from 'react'
import axios from 'axios'

// ***FIXED URL***
const SOLD_API = 'https://pocho-backend.onrender.com/api/sold/records/'

export default function SoldCars() {
    const [soldVehicles, setSoldVehicles] = useState([])
    const [loading, setLoading] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [historyCar, setHistoryCar] = useState(null)

    // --- SEARCH & SORT STATE ---
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOption, setSortOption] = useState('date_new')

    useEffect(() => {
        fetchSoldCars()
    }, [])

    const fetchSoldCars = async () => {
        setLoading(true)
        try {
            const res = await axios.get(SOLD_API)
            setSoldVehicles(res.data)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleReturnCar = async () => {
        if (!historyCar) return
        if (!confirm(`Are you sure you want to return the ${historyCar.year} ${historyCar.make} to inventory?`)) return

        try {
            await axios.post(`${SOLD_API}${historyCar.id}/return_to_inventory/`)
            alert("Vehicle returned to Inventory successfully!")
            setIsHistoryModalOpen(false)
            fetchSoldCars()
        } catch (error) {
            console.error(error)
            alert("Error returning vehicle.")
        }
    }

    const getFilteredSoldVehicles = () => {
        let filtered = soldVehicles.filter(car => {
            const searchLower = searchTerm.toLowerCase()
            return (
                car.make.toLowerCase().includes(searchLower) ||
                car.model.toLowerCase().includes(searchLower) ||
                car.vin.toLowerCase().includes(searchLower) ||
                car.customer_name.toLowerCase().includes(searchLower) ||
                car.year.toString().includes(searchLower)
            )
        })

        filtered.sort((a, b) => {
            if (sortOption === 'date_new') return new Date(b.sale_date) - new Date(a.sale_date)
            if (sortOption === 'date_old') return new Date(a.sale_date) - new Date(b.sale_date)
            if (sortOption === 'price_high') return parseFloat(b.sale_price) - parseFloat(a.sale_price)
            if (sortOption === 'price_low') return parseFloat(a.sale_price) - parseFloat(b.sale_price)
            if (sortOption === 'profit_high') return parseFloat(b.profit) - parseFloat(a.profit)
            if (sortOption === 'profit_low') return parseFloat(a.profit) - parseFloat(b.profit)
            return 0
        })
        return filtered
    }

    const filteredSoldVehicles = getFilteredSoldVehicles()

    const openHistoryModal = (soldCar) => {
        setHistoryCar(soldCar)
        setIsHistoryModalOpen(true)
    }

    return (
        <div>
            {/* --- HEADER & CONTROLS --- */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <input
                        placeholder="Search Customer, Car, VIN..."
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value)}
                    >
                        <option value="date_new">Date Sold: Newest</option>
                        <option value="date_old">Date Sold: Oldest</option>
                        <option value="price_high">Sale Price: High to Low</option>
                        <option value="price_low">Sale Price: Low to High</option>
                        <option value="profit_high">Profit: High to Low</option>
                        <option value="profit_low">Profit: Low to High</option>
                    </select>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Sale Date</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Financials</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSoldVehicles.map((sale) => (
                            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{sale.sale_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-gray-900">{sale.year} {sale.make} {sale.model}</div>
                                    <div className="text-xs text-gray-500 font-mono">VIN: {sale.vin}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{sale.customer_name}</td>

                                {/* --- CLEANER FINANCIALS COLUMN --- */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <div className="text-gray-900 text-sm"><span className="text-gray-500 text-xs mr-1">Sold Price:</span>${parseFloat(sale.sale_price).toLocaleString()}</div>
                                        <div className="text-blue-600 text-xs"><span className="text-gray-400 mr-1">Tax Price:</span>${parseFloat(sale.tax_amount || 0).toLocaleString()}</div>
                                        <div className="text-gray-500 text-xs"><span className="text-gray-400 mr-1">Net Cost:</span>${parseFloat(sale.net_cost).toLocaleString()}</div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${sale.profit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        ${parseFloat(sale.profit).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => openHistoryModal(sale)} className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-all">
                                        More Info
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSoldVehicles.length === 0 && !loading && <div className="text-center py-10 text-gray-400">No sales records found.</div>}
            </div>

            {/* --- HISTORY MODAL --- */}
            {isHistoryModalOpen && historyCar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Vehicle History Report</h2>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                        </div>

                        <div className="p-6">
                            {/* --- SPLIT HEADER LAYOUT (Left & Right) --- */}
                            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                                {/* Left Side */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{historyCar.year} {historyCar.make}</h3>
                                    <div className="text-lg text-gray-700 font-medium">{historyCar.model}</div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">VIN: {historyCar.vin}</div>
                                </div>
                                {/* Right Side */}
                                <div className="text-right space-y-1">
                                    <div className="text-sm text-gray-600">
                                        <span className="text-xs text-gray-400 uppercase font-semibold mr-2">Auction</span>
                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-800">{historyCar.auction_name || 'N/A'}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="text-xs text-gray-400 uppercase font-semibold mr-2">Purchased</span>
                                        <span className="font-medium">{historyCar.original_purchase_date || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6">
                                <div><div className="text-xs text-gray-400 uppercase font-bold mb-1">Sold To</div><div className="font-semibold text-gray-900">{historyCar.customer_name}</div></div>
                                <div><div className="text-xs text-gray-400 uppercase font-bold mb-1">Sale Date</div><div className="font-semibold text-gray-900">{historyCar.sale_date}</div></div>

                                <div><div className="text-xs text-gray-400 uppercase font-bold mb-1">Sale Price</div><div className="font-bold text-lg text-green-600">${parseFloat(historyCar.sale_price).toLocaleString()}</div></div>
                                <div><div className="text-xs text-gray-400 uppercase font-bold mb-1">Tax Price</div><div className="font-bold text-lg text-blue-600">${parseFloat(historyCar.tax_amount || 0).toLocaleString()}</div></div>

                                <div><div className="text-xs text-gray-400 uppercase font-bold mb-1">Total Profit</div><div className={`font-bold text-lg ${historyCar.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${parseFloat(historyCar.profit).toLocaleString()}</div></div>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">Tax Profit</div>
                                    <div className={`font-bold text-lg ${(parseFloat(historyCar.tax_amount || 0) - parseFloat(historyCar.net_cost)) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        ${(parseFloat(historyCar.tax_amount || 0) - parseFloat(historyCar.net_cost)).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Expense History */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">Expense History</h4>
                                <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden mb-4">
                                    {historyCar.history_expenses && historyCar.history_expenses.length > 0 ? (
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr><th className="px-4 py-2 font-semibold text-gray-600">Date</th><th className="px-4 py-2 font-semibold text-gray-600">Description</th><th className="px-4 py-2 font-semibold text-gray-600 text-right">Amount</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {historyCar.history_expenses.map((exp, idx) => (
                                                    <tr key={idx}><td className="px-4 py-2 text-gray-500">{exp.date}</td><td className="px-4 py-2 font-medium text-gray-800">{exp.description}</td><td className="px-4 py-2 text-right text-red-600">-${parseFloat(exp.amount).toLocaleString()}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 text-sm italic">No expenses were recorded for this vehicle.</div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed border-gray-200">
                                    <span className="text-gray-500">Original Purchase Price:</span>
                                    <span className="font-medium text-gray-900">${parseFloat(historyCar.purchase_price).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <span className="text-gray-500">Total Expenses:</span>
                                    <span className="font-medium text-red-600">+ ${parseFloat(historyCar.total_expenses).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2 p-2 bg-gray-100 rounded text-sm font-bold text-gray-800">
                                    <span>Net Cost Basis:</span>
                                    <span>${parseFloat(historyCar.net_cost).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                            <button onClick={handleReturnCar} className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline">
                                Return Vehicle to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}