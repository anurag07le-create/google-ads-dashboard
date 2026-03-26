import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Loader2, DollarSign, TrendingUp, Wallet, ArrowRight, Banknote, ArrowUpRight, Sparkles } from 'lucide-react';
import { fetchLeads } from '../lib/googleSheets';
import { useAuth } from '../context/AuthContext';

const Revenue = () => {
    const { user } = useAuth();
    const isSalesMode = window.location.pathname.startsWith('/salesman');
    
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getLeads = async () => {
            setLoading(true);
            const data = await fetchLeads();
            
            // Filter by agent if in sales mode
            const filteredData = isSalesMode 
                ? data.filter(l => l['Assigned to'] === user?.email)
                : data;
                
            setLeads(filteredData);
            setLoading(false);
        };
        getLeads();
    }, []);

    const metrics = useMemo(() => {
        return leads.reduce((acc, lead) => {
            const amount = parseFloat(lead['Quotation Amount']?.replace(/[$,]/g, '')) || 0;
            const status = lead['Status']?.toUpperCase();
            const wonLost = lead['Won/ Lost']?.toLowerCase();

            acc.totalQuoted += amount;
            if (wonLost === 'won') {
                acc.wonRevenue += amount;
            } else if (status === 'QUOTED' || status === 'PENDING') {
                acc.expectedRevenue += amount;
            }

            acc.funnel.total += 1;
            if (status === 'QUOTED') acc.funnel.quoted += 1;
            if (status === 'PENDING') acc.funnel.pending += 1;
            if (status === 'COMPLETED') acc.funnel.completed += 1;

            return acc;
        }, { totalQuoted: 0, wonRevenue: 0, expectedRevenue: 0, funnel: { total: 0, quoted: 0, pending: 0, completed: 0 } });
    }, [leads]);

    const chartData = useMemo(() => {
        const months = leads.reduce((acc, lead) => {
            const dateStr = lead['Date Created'];
            if (!dateStr) return acc;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return acc;

            const month = date.toLocaleString('default', { month: 'short' });
            const amount = parseFloat(lead['Quotation Amount']?.replace(/[$,]/g, '')) || 0;

            if (!acc[month]) acc[month] = { month, revenue: 0, count: 0 };
            acc[month].revenue += amount;
            acc[month].count += 1;
            return acc;
        }, {});

        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return Object.values(months).sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    }, [leads]);

    const funnelData = [
        { name: 'Quoted', value: metrics.funnel.quoted, color: '#818cf8', subtext: 'Initial Quotations' },
        { name: 'Pending', value: metrics.funnel.pending, color: '#fbbf24', subtext: 'In Discussion' },
        { name: 'Completed', value: metrics.funnel.completed, color: '#34d399', subtext: 'Finalized Deals' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <p className="font-bold text-lg text-slate-300 tracking-widest uppercase">Analyzing Financials...</p>
        </div>
    );

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumSignificantDigits: 3,
        notation: 'compact'
    }).format(val);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Page Header & Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-bold text-pucho-dark tracking-tight mb-1">Revenue Analytics</h1>
                    <p className="text-slate-400 font-medium text-base">Detailed financial forecasting and deal velocity audit.</p>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-6 bg-white/40 border-slate-100/50">
                    <div className="flex flex-col border-r border-slate-100 pr-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Win Probability</span>
                        <span className="text-xl font-bold text-emerald-500 tracking-tight">
                            {metrics.totalQuoted > 0 ? Math.round((metrics.wonRevenue / metrics.totalQuoted) * 100) : 0}%
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Ticket Size</span>
                        <span className="text-xl font-bold text-indigo-600 tracking-tight">
                            {formatCurrency(metrics.totalQuoted / (leads.length || 1))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Quoted', val: metrics.totalQuoted, icon: DollarSign, color: 'indigo', tag: 'Gross Volume' },
                    { label: 'Revenue Won', val: metrics.wonRevenue, icon: TrendingUp, color: 'emerald', tag: 'Realized' },
                    { label: 'In Pipeline', val: metrics.expectedRevenue, icon: Wallet, color: 'amber', tag: 'Projected' }
                ].map((card, i) => (
                    <div key={card.label} className="group relative">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.color === 'indigo' ? 'from-indigo-500 to-purple-600' : card.color === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'} rounded-[32px] opacity-0 group-hover:opacity-20 transition duration-500 blur`}></div>
                        <div className="relative glass-card p-8 bg-white/90 border-slate-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] ${card.color === 'indigo' ? 'bg-indigo-600' : card.color === 'emerald' ? 'bg-emerald-600' : 'bg-amber-600'}`}></div>
                            <div className="flex justify-between items-start mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <card.icon size={28} />
                                </div>
                                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 uppercase tracking-widest border border-slate-100">{card.tag}</span>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{card.label}</h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-slate-800 tracking-tighter">{formatCurrency(card.val)}</span>
                                    <ArrowUpRight size={20} className="text-slate-200 mb-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                {/* Enhanced Sales Funnel */}
                <div className="lg:col-span-5 glass-card p-10 bg-white/70">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl gradient-indigo flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-pucho-dark tracking-tight">Conversion Funnel</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Stage Volume Analysis</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {funnelData.every(item => item.value === 0) ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                                <Sparkles size={40} className="text-slate-300 mb-4" />
                                <p className="font-bold text-slate-400 uppercase tracking-widest">No Movement Detected</p>
                            </div>
                        ) : (
                            funnelData.map((stage, idx) => (
                                <React.Fragment key={stage.name}>
                                    <div className="group relative">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{stage.name}</p>
                                                <p className="text-xs font-bold text-slate-300 italic">{stage.subtext}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-slate-800 tracking-tighter">{stage.value}</p>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-slate-50 rounded-full border border-slate-100 p-0.5 overflow-hidden shadow-inner">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                style={{ 
                                                    width: `${Math.max((stage.value / Math.max(...funnelData.map(d => d.value), 1)) * 100, stage.value > 0 ? 10 : 0)}%`,
                                                    backgroundColor: stage.color
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    {idx < funnelData.length - 1 && (
                                        <div className="flex justify-center py-2 opacity-20">
                                            <ArrowRight size={16} className="rotate-90 text-slate-400" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </div>
                </div>

                {/* Refined Revenue Pulse */}
                <div className="lg:col-span-7 glass-card p-10 bg-white/70">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl gradient-blue flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-pucho-dark tracking-tight">Revenue Pulse</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly Growth Cycle</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            Live Feed
                        </div>
                    </div>

                    <div className="h-[360px] -ml-6">
                        {chartData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <TrendingUp size={40} className="text-slate-300 mb-4" />
                                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Waiting for Data Influx</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800, textAnchor: 'middle' }}
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} 
                                        tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} 
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="glass-card shadow-2xl border-white/40 p-5 bg-white/95 min-w-[160px]">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{payload[0].payload.month}</p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs font-bold text-slate-500">Revenue</span>
                                                                <span className="text-sm font-black text-indigo-600">{formatCurrency(payload[0].value)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs font-bold text-slate-500">Deals</span>
                                                                <span className="text-sm font-black text-slate-800">{payload[0].payload.count}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#6366f1" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#revenueGradient)"
                                        dot={{ r: 6, fill: '#fff', stroke: '#6366f1', strokeWidth: 3 }}
                                        activeDot={{ r: 9, strokeWidth: 0, fill: '#6366f1', shadow: '0 0 20px rgba(99,102,241,0.4)' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
