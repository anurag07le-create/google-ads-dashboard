import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Loader2, Zap, Target, TrendingUp, ArrowUpRight, Globe, Sparkles } from 'lucide-react';
import { fetchLeads } from '../lib/googleSheets';
import { useAuth } from '../context/AuthContext';

const SourceAnalysis = () => {
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

    const sourceStats = useMemo(() => {
        const stats = leads.reduce((acc, lead) => {
            const source = lead['Lead source'] || 'Unknown';
            if (!acc[source]) {
                acc[source] = { name: source, totalLeads: 0, wonLeads: 0, totalRevenue: 0, quotedLeads: 0 };
            }

            const amount = parseFloat(lead['Quotation Amount']?.replace(/[$,]/g, '')) || 0;
            const wonLost = lead['Won/ Lost']?.toLowerCase();

            acc[source].totalLeads += 1;
            if (wonLost === 'won') {
                acc[source].wonLeads += 1;
                acc[source].totalRevenue += amount;
            }
            if (lead['Status']?.toUpperCase() === 'QUOTED') {
                acc[source].quotedLeads += 1;
            }

            return acc;
        }, {});

        return Object.values(stats).map(s => ({
            ...s,
            conversionRate: ((s.wonLeads / s.totalLeads) * 100).toFixed(1),
            avgDealSize: s.wonLeads > 0 ? (s.totalRevenue / s.wonLeads) : 0
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [leads]);

    const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const GRADIENTS = ['gradient-indigo', 'gradient-blue'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-14 h-14 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-5"></div>
            <p className="font-bold text-base text-slate-400 tracking-tight">Analyzing channels...</p>
        </div>
    );

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        notation: 'compact'
    }).format(val);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Top Source Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sourceStats.slice(0, 2).map((source, idx) => (
                    <div key={source.name} className={`relative overflow-hidden rounded-[24px] p-7 ${GRADIENTS[idx]} group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-500`}>
                        <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px'}}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-white/20 text-white/80 uppercase tracking-widest">
                                    {idx === 0 ? 'Top Channel' : 'Runner Up'}
                                </span>
                                <ArrowUpRight size={16} className="text-white/40" />
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tighter mb-6">{source.name}</h2>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Leads</p>
                                    <p className="text-xl font-bold text-white tracking-tight">{source.totalLeads}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Conv Rate</p>
                                    <p className="text-xl font-bold text-white tracking-tight">{source.conversionRate}%</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Revenue</p>
                                    <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(source.totalRevenue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pie Chart */}
                <div className="glass-card p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl gradient-indigo flex items-center justify-center">
                            <Globe size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Lead Distribution</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceStats}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={6}
                                    dataKey="totalLeads"
                                    nameKey="name"
                                >
                                    {sourceStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', fontWeight: 700 }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Bar */}
                <div className="glass-card p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl gradient-emerald flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Conversion by Source</h3>
                    </div>
                    <div className="h-72">
                        {sourceStats.every(s => parseFloat(s.conversionRate) === 0) ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                                    <TrendingUp size={24} className="text-emerald-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">No conversions yet</p>
                                <p className="text-xs text-slate-300 mt-1">Conversion data will appear once leads are won</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceStats} layout="vertical" margin={{ left: 20 }}>
                                    <defs>
                                        <linearGradient id="srcBarGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#14b8a6" />
                                        </linearGradient>
                                    </defs>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontWeight: 700, fontSize: 12 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(16, 185, 129, 0.04)', radius: 8 }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', fontWeight: 700 }}
                                    />
                                    <Bar dataKey="conversionRate" fill="url(#srcBarGrad)" radius={[0, 10, 10, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Revenue by Source */}
            <div className="glass-card p-7">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl gradient-dark flex items-center justify-center">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-pucho-dark tracking-tight">Revenue by Channel</h3>
                </div>
                <div className="h-72">
                    {sourceStats.every(s => s.totalRevenue === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                <Sparkles size={24} className="text-indigo-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No revenue recorded yet</p>
                            <p className="text-xs text-slate-300 mt-1">Revenue data will appear once deals are closed</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceStats}>
                                <defs>
                                    <linearGradient id="revSrcGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1e1b4b" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', padding: '12px 16px', fontWeight: 700 }}
                                    formatter={(val) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val), 'Revenue']}
                                />
                                <Bar dataKey="totalRevenue" fill="url(#revSrcGrad)" radius={[10, 10, 0, 0]} barSize={44} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SourceAnalysis;
