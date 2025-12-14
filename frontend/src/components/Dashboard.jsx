import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import { DollarSign, Car, TrendingUp, Package, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

// ***FIXED URL***
const STATS_API = 'https://pocho-backend.onrender.com/api/sold/stats/'
const COLORS = ['#16a34a', '#eab308', '#dc2626'];

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(STATS_API)
                setData(res.data)
            } catch (error) { console.error("Error fetching stats:", error) }
            finally { setLoading(false) }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>

    const { kpi, charts, activity } = data

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>

            {/* --- ROW 1: KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Total Profit" value={kpi.total_profit} icon={<TrendingUp className="text-green-600" />} color="bg-green-50" isMoney />
                <KpiCard title="Total Revenue" value={kpi.total_revenue} icon={<DollarSign className="text-blue-600" />} color="bg-blue-50" isMoney />
                <KpiCard title="Inventory Value" value={kpi.inventory_value} sub={`Stock: ${kpi.cars_in_stock} cars`} icon={<Package className="text-orange-600" />} color="bg-orange-50" isMoney />
                <KpiCard title="Cars Sold" value={kpi.total_sold} icon={<Car className="text-indigo-600" />} color="bg-indigo-50" />
            </div>

            {/* --- ROW 2: FINANCIAL GRAPHS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graph 1: Cars Sold */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Cars Sold (Last 12 Months)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.trend_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{fontSize: 10}} />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} formatter={(value) => [value, 'Cars Sold']} />
                                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graph 2: Profit Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Net Profit (Last 12 Months)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.trend_data}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{fontSize: 10}} />
                                <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} formatter={(value) => [`$${value.toLocaleString()}`, 'Net Profit']} />
                                <Area type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- ROW 3: INVENTORY ANALYTICS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Inventory Mix (Pie Chart) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Status</h3>
                    <div className="h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={charts.status_data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {charts.status_data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'READY' ? COLORS[0] : entry.name === 'SERVICE' ? COLORS[1] : COLORS[2]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs mt-2">
                        {charts.status_data.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${item.name === 'READY' ? 'bg-green-600' : 'bg-yellow-500'}`}></div>
                                <span className="text-gray-600">{item.name} ({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory By Brands (Bar Chart) - RESTORED & RENAMED */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory by Brands</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.brand_data} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- ROW 4: ACTIVITY LISTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Sales List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-green-600" /> Recent Sales
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-100">
                                    <th className="pb-2 text-left font-medium">Vehicle</th>
                                    <th className="pb-2 text-right font-medium">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activity.recent_sales.map(sale => (
                                    <tr key={sale.id}>
                                        <td className="py-3">
                                            <div className="font-semibold text-gray-900">{sale.name}</div>
                                            <div className="text-xs text-gray-500">{sale.date}</div>
                                        </td>
                                        <td className="py-3 text-right font-bold text-green-600">+${parseFloat(sale.profit).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {activity.recent_sales.length === 0 && <tr><td colSpan="2" className="py-4 text-center text-gray-400">No sales yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Arrivals List - RESTORED */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ArrowDownLeft className="w-5 h-5 text-blue-600" /> New Arrivals
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-100">
                                    <th className="pb-2 text-left font-medium">Vehicle</th>
                                    <th className="pb-2 text-right font-medium">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activity.recent_adds.map(car => (
                                    <tr key={car.id}>
                                        <td className="py-3">
                                            <div className="font-semibold text-gray-900">{car.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                {car.date || 'No Date'}
                                                <span className={`px-1.5 rounded text-[10px] ${car.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{car.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-gray-700 font-medium">${parseFloat(car.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {activity.recent_adds.length === 0 && <tr><td colSpan="2" className="py-4 text-center text-gray-400">No inventory added yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ title, value, sub, icon, color, isMoney }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isMoney ? '$' : ''}{parseFloat(value || 0).toLocaleString()}
                </p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
        </div>
    )
}