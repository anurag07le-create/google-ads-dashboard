import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Loader2, TrendingUp, Award, Clock, Target, Users, Zap, Crown, ArrowUpRight } from 'lucide-react';
import { fetchLeads } from '../lib/googleSheets';
import { useAuth } from '../context/AuthContext';

const Performance = () => {
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

    const agentMetrics = useMemo(() => {
        const groups = leads.reduce((acc, lead) => {
            const agent = lead['Assigned to'] || 'Unassigned';
            if (!acc[agent]) {
                acc[agent] = {
                    name: agent, total: 0, won: 0, pending: 0,
                    quoted: 0, totalDays: 0, leads: []
                };
            }
            acc[agent].total += 1;
            acc[agent].leads.push(lead);
            acc[agent].totalDays += (parseInt(lead['days open']) || 0);

            if (lead['Won/ Lost']?.toLowerCase() === 'won') acc[agent].won += 1;
            if (lead.Status?.toUpperCase() === 'PENDING') acc[agent].pending += 1;
            else if (lead.Status?.toUpperCase() === 'QUOTED') acc[agent].quoted += 1;

            return acc;
        }, {});

        return Object.values(groups).map(agent => ({
            ...agent,
            avgDays: (agent.totalDays / agent.total).toFixed(1),
            successRate: ((agent.won / agent.total) * 100).toFixed(1),
            activePipeline: agent.total - agent.won
        })).sort((a, b) => b.won - a.won);
    }, [leads]);

    const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-5"></div>
            <p className="font-bold text-base text-slate-400 tracking-tight">Loading performance data...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="relative overflow-hidden rounded-[24px] p-6 gradient-indigo group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Crown size={18} className="text-white" />
                            </div>
                            <ArrowUpRight size={16} className="text-white/40" />
                        </div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em] mb-1">Top Performer</p>
                        <p className="text-2xl font-bold text-white tracking-tighter truncate">{agentMetrics[0]?.name || '—'}</p>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-[24px] p-6 gradient-emerald group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <ArrowUpRight size={16} className="text-white/40" />
                        </div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em] mb-1">Avg Success Rate</p>
                        <p className="text-2xl font-bold text-white tracking-tighter">{(agentMetrics.reduce((s, a) => s + parseFloat(a.successRate), 0) / agentMetrics.length || 0).toFixed(1)}%</p>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-[24px] p-6 gradient-violet group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Clock size={18} className="text-white" />
                            </div>
                            <ArrowUpRight size={16} className="text-white/40" />
                        </div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em] mb-1">Avg Response Time</p>
                        <p className="text-2xl font-bold text-white tracking-tighter">{(agentMetrics.reduce((s, a) => s + parseFloat(a.avgDays), 0) / agentMetrics.length || 0).toFixed(1)} Days</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-card p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl gradient-indigo flex items-center justify-center">
                            <Users size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Lead Distribution</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agentMetrics}>
                                <defs>
                                    <linearGradient id="perfBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', padding: '12px 16px', fontWeight: 700 }}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.06)', radius: 8 }}
                                />
                                <Bar dataKey="total" fill="url(#perfBarGrad)" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl gradient-emerald flex items-center justify-center">
                            <Target size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Wins by Agent</h3>
                    </div>
                    <div className="h-72">
                        {agentMetrics.reduce((s, a) => s + a.won, 0) === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                                    <Target size={24} className="text-emerald-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">No wins recorded yet</p>
                                <p className="text-xs text-slate-300 mt-1">Wins will appear here once leads are converted</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={agentMetrics}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={6}
                                        dataKey="won"
                                        nameKey="name"
                                    >
                                        {agentMetrics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', fontWeight: 700 }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-gradient-to-r from-slate-50/80 to-white">
                    <div className="p-2.5 rounded-xl gradient-indigo text-white shadow-sm">
                        <Zap size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Agent Leaderboard</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ranked by conversions</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                <th className="px-6 py-4">Rank / Agent</th>
                                <th className="px-6 py-4 text-center">Total</th>
                                <th className="px-6 py-4 text-center">Won</th>
                                <th className="px-6 py-4 text-center">Win Rate</th>
                                <th className="px-6 py-4 text-center">Avg Days</th>
                                <th className="px-6 py-4 text-right">Pipeline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentMetrics.map((agent, index) => (
                                <tr key={agent.name} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                                index === 0 ? 'gradient-indigo text-white shadow-sm' :
                                                index === 1 ? 'bg-slate-200 text-slate-600' :
                                                index === 2 ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-300 border border-slate-100'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <span className="font-bold text-slate-800 text-sm">{agent.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 text-sm">{agent.total}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-emerald-100">
                                            {agent.won} Won
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-600 text-sm">{agent.successRate}%</td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-400 text-sm">{agent.avgDays}d</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {agent.activePipeline} open
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Performance;
