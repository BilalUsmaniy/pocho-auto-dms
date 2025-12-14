import { useState, useEffect } from 'react'
import axios from 'axios'

// ***FIXED URLs***
const API_BASE = 'https://pocho-backend.onrender.com/api'
const SOLD_API = 'https://pocho-backend.onrender.com/api/sold/records/'

const CAR_MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Buick",
  "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis",
  "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini",
  "Land Rover", "Lexus", "Lincoln", "Lucid", "Maserati", "Mazda", "McLaren",
  "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar", "Porsche", "Ram",
  "Rivian", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
]

export default function Inventory() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(false)

    // --- SEARCH & SORT STATE ---
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOption, setSortOption] = useState('newest')

    // Modal States
    const [isCarModalOpen, setIsCarModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [carForm, setCarForm] = useState({ year: '', make: '', model: '', vin: '', odometer: '', purchase_price: '', status: 'READY', purchase_date: '', auction_name: '', location: '' })

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
    const [activeCar, setActiveCar] = useState(null)
    const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' })

    const [isSellModalOpen, setIsSellModalOpen] = useState(false)
    const [sellForm, setSellForm] = useState({ sale_price: '', tax_amount: '', sale_date: '', customer_name: '' })

    useEffect(() => {
        fetchInventory()
    }, [])

    const fetchInventory = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_BASE}/vehicles/`)
            setVehicles(res.data)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const getFilteredVehicles = () => {
        let filtered = vehicles.filter(car => {
            const searchLower = searchTerm.toLowerCase()
            return (
                car.make.toLowerCase().includes(searchLower) ||
                car.model.toLowerCase().includes(searchLower) ||
                car.vin.toLowerCase().includes(searchLower) ||
                car.year.toString().includes(searchLower)
            )
        })

        filtered.sort((a, b) => {
            if (sortOption === 'newest') return b.id - a.id
            if (sortOption === 'oldest') return a.id - b.id
            if (sortOption === 'price_high') return parseFloat(b.purchase_price) - parseFloat(a.purchase_price)
            if (sortOption === 'price_low') return parseFloat(a.purchase_price) - parseFloat(b.purchase_price)
            if (sortOption === 'year_new') return b.year - a.year
            if (sortOption === 'year_old') return a.year - b.year
            return 0
        })
        return filtered
    }

    const filteredVehicles = getFilteredVehicles()

    // --- HANDLERS ---
    const handleAddNewCar = () => { setCarForm({ year: '', make: '', model: '', vin: '', odometer: '', purchase_price: '', status: 'READY', purchase_date: '', auction_name: '', location: '' }); setEditingId(null); setIsCarModalOpen(true) }
    const handleEditCar = (car) => { setCarForm({ ...car, purchase_date: car.purchase_date || '', auction_name: car.auction_name || '', location: car.location || '' }); setEditingId(car.id); setIsCarModalOpen(true) }
    const submitCarForm = async (e) => { e.preventDefault(); try { if (editingId) await axios.put(`${API_BASE}/vehicles/${editingId}/`, carForm); else await axios.post(`${API_BASE}/vehicles/`, carForm); setIsCarModalOpen(false); fetchInventory() } catch (e) { alert("Error saving") } }
    const handleDeleteCar = async (id) => { if (!confirm("Delete?")) return; await axios.delete(`${API_BASE}/vehicles/${id}/`); fetchInventory() }
    const handleCarInput = (e) => { const { name, value } = e.target; setCarForm({ ...carForm, [name]: value }) }
    const openExpenseManager = (car) => { setActiveCar(car); setExpenseForm({ description: '', amount: '' }); setIsExpenseModalOpen(true) }
    const submitExpense = async (e) => { e.preventDefault(); if (!activeCar) return; await axios.post(`${API_BASE}/expenses/`, { vehicle: activeCar.id, ...expenseForm }); setExpenseForm({ description: '', amount: '' }); await fetchInventory(); const res = await axios.get(`${API_BASE}/vehicles/${activeCar.id}/`); setActiveCar(res.data) }
    const deleteExpense = async (id) => { await axios.delete(`${API_BASE}/expenses/${id}/`); await fetchInventory(); const res = await axios.get(`${API_BASE}/vehicles/${activeCar.id}/`); setActiveCar(res.data) }

    // Reset Tax Amount to empty string when opening modal
    const openSellModal = (car) => {
        setActiveCar(car);
        setSellForm({ sale_price: '', tax_amount: '', sale_date: new Date().toISOString().split('T')[0], customer_name: '' });
        setIsSellModalOpen(true)
    }
    const submitSellForm = async (e) => { e.preventDefault(); try { await axios.post(`${SOLD_API}sell_vehicle/`, { inventory_id: activeCar.id, ...sellForm }); setIsSellModalOpen(false); alert("Sold!"); fetchInventory() } catch (e) { alert("Error selling") } }

    return (
        <div>
            {/* Header & Controls */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <input placeholder="Search Make, Model, VIN..." className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <select className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={sortOption} onChange={e => setSortOption(e.target.value)}>
                        <option value="newest">Newest Added</option>
                        <option value="oldest">Oldest Added</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="year_new">Year: Newest</option>
                        <option value="year_old">Year: Oldest</option>
                    </select>
                    <button onClick={handleAddNewCar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm whitespace-nowrap transition-colors">+ Add Car</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Vehicle / Location</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">VIN / Odometer</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Auction / Date</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Financials</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVehicles.map((car) => (
                            <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${car.status === 'SOLD' ? 'bg-red-100 text-red-800' : car.status === 'SERVICE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{car.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-gray-900 text-base">{car.year} {car.make} {car.model}</div><div className="text-xs text-gray-500 mt-1 flex items-center"><span className="mr-1">📍</span> {car.location || "No Location"}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="font-mono text-gray-700 font-medium">{car.vin}</div><div className="text-xs text-gray-500">{parseInt(car.odometer).toLocaleString()} mi</div></td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{car.auction_name || 'N/A'}</div><div className="text-xs text-gray-500">{car.purchase_date || '-'}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-gray-900">Net: ${parseFloat(car.net_cost).toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Buy: ${parseFloat(car.purchase_price).toLocaleString()}</div>
                                    {parseFloat(car.total_expenses) > 0 && (<div className="text-xs text-red-500 font-medium">Exp: +${parseFloat(car.total_expenses).toLocaleString()}</div>)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-2">
                                    {/* --- UPDATED BUTTON DESIGNS --- */}
                                    <button onClick={() => openSellModal(car)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors">Sell</button>
                                    <button onClick={() => openExpenseManager(car)} className="text-green-700 hover:text-green-900 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">$ Exp</button>
                                    <button onClick={() => handleEditCar(car)} className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteCar(car.id)} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredVehicles.length === 0 && !loading && <div className="text-center py-10 text-gray-400">No inventory found matching your search.</div>}
            </div>

            {/* --- ADD/EDIT MODAL --- */}
            {isCarModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                        <form onSubmit={submitCarForm} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <input required name="year" placeholder="Year" type="number" onChange={handleCarInput} value={carForm.year} className="border p-2 rounded-lg w-full" />
                                <input required name="make" list="make-list" placeholder="Make" onChange={handleCarInput} value={carForm.make} className="border p-2 rounded-lg w-full" />
                                <datalist id="make-list">{CAR_MAKES.map(m => <option key={m} value={m} />)}</datalist>
                                <input required name="model" placeholder="Model" onChange={handleCarInput} value={carForm.model} className="border p-2 rounded-lg w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input required name="vin" placeholder="VIN" onChange={handleCarInput} value={carForm.vin} className="border p-2 rounded-lg w-full" />
                                <input required name="odometer" placeholder="Miles" type="number" onChange={handleCarInput} value={carForm.odometer} className="border p-2 rounded-lg w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input required name="purchase_price" placeholder="Price $" type="number" step="0.01" onChange={handleCarInput} value={carForm.purchase_price} className="border p-2 rounded-lg w-full" />

                                {/* --- UPDATED: NO 'SOLD' OPTION --- */}
                                <div className="relative">
                                    <select
                                        name="status"
                                        onChange={handleCarInput}
                                        value={carForm.status}
                                        className="w-full border p-2 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="READY">Ready</option>
                                        <option value="SERVICE">Service</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>

                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input name="location" placeholder="Location" onChange={handleCarInput} value={carForm.location} className="border p-2 rounded-lg w-full" />
                                <input name="auction_name" placeholder="Auction Name" onChange={handleCarInput} value={carForm.auction_name} className="border p-2 rounded-lg w-full" />
                            </div>
                            <input name="purchase_date" type="date" onChange={handleCarInput} value={carForm.purchase_date} className="border p-2 rounded-lg w-full" />
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsCarModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Vehicle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EXPENSE MODAL (Unchanged) --- */}
            {isExpenseModalOpen && activeCar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Expenses</h2><button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button></div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto border border-gray-100">
                            {activeCar.expenses?.length > 0 ? (<ul className="space-y-2">{activeCar.expenses.map(exp => (<li key={exp.id} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm"><div className={exp.is_active ? "" : "opacity-50 line-through"}><div className="font-semibold text-sm">{exp.description}</div></div><div className="flex items-center space-x-3"><span className={`font-bold ${exp.is_active ? 'text-red-600' : 'text-gray-400 line-through'}`}>-${parseFloat(exp.amount).toLocaleString()}</span>{exp.is_active && (<button onClick={() => deleteExpense(exp.id)} className="text-xs text-red-400">✕</button>)}</div></li>))}</ul>) : (<p className="text-gray-400 text-center text-sm">No expenses.</p>)}
                            <div className="mt-4 pt-2 border-t flex justify-between font-bold text-gray-700"><span>Total:</span><span>${parseFloat(activeCar.total_expenses).toLocaleString()}</span></div>
                        </div>
                        <form onSubmit={submitExpense} className="flex gap-2"><input required placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="border p-2 rounded-lg flex-grow text-sm" /><input required type="number" placeholder="$" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="border p-2 rounded-lg w-20 text-sm" /><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Add</button></form>
                    </div>
                </div>
            )}

            {/* --- SELL MODAL (FIXED MATH) --- */}
            {isSellModalOpen && activeCar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
                        <h2 className="text-2xl font-bold mb-1 text-gray-900">Sell Vehicle</h2>
                        <p className="text-sm text-gray-500 mb-6">Transferring <span className="font-semibold text-gray-700">{activeCar.year} {activeCar.make} {activeCar.model}</span> to Sold History.</p>

                        <form onSubmit={submitSellForm} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sale Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                                        <input required type="number" step="0.01" className="w-full border border-gray-300 p-2 pl-6 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" value={sellForm.sale_price} onChange={e => setSellForm({...sellForm, sale_price: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tax Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                                        <input type="number" step="0.01" className="w-full border border-gray-300 p-2 pl-6 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" value={sellForm.tax_amount} onChange={e => setSellForm({...sellForm, tax_amount: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Customer Name</label>
                                <input required type="text" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. John Doe" value={sellForm.customer_name} onChange={e => setSellForm({...sellForm, customer_name: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date of Sale</label>
                                <input required type="date" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={sellForm.sale_date} onChange={e => setSellForm({...sellForm, sale_date: e.target.value})} />
                            </div>

                            {/* --- MATH FIXED: TAX PROFIT = TAX PRICE - NET COST --- */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm space-y-2">
                                <div className="flex justify-between items-center text-gray-700">
                                    <span>Net Cost:</span>
                                    <span className="font-semibold">${parseFloat(activeCar.net_cost).toLocaleString()}</span>
                                </div>

                                {sellForm.sale_price && (
                                    <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                                        <span className="text-gray-600">Estimated Sale Profit:</span>
                                        <span className={`font-bold ${(sellForm.sale_price - activeCar.net_cost) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            ${(sellForm.sale_price - activeCar.net_cost).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {sellForm.tax_amount && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Estimated Tax Profit:</span>
                                        <span className={`font-bold ${(sellForm.tax_amount - activeCar.net_cost) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            ${(sellForm.tax_amount - activeCar.net_cost).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsSellModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-200">Confirm Sale</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}