import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
    Users, Clock, AlertCircle, TrendingUp, Calendar, Zap, Sparkles, ArrowUpRight
} from 'lucide-react';
import { fetchLeads } from '../lib/googleSheets';
import { useAuth } from '../context/AuthContext';

const OverviewCard = ({ title, value, icon: Icon, gradient, subValue, subColor, delay = 0 }) => (
    <div className="relative overflow-hidden rounded-[28px] p-7 group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-500 cursor-default"
        style={{ animationDelay: `${delay}ms` }}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 ${gradient} opacity-100`}></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                    <Icon size={22} className="text-white" />
                </div>
                {subValue && (
                    <span className={`text-[9px] font-bold px-2.5 py-1.5 rounded-xl uppercase tracking-widest bg-white/20 backdrop-blur-sm text-white border border-white/10`}>
                        {subValue}
                    </span>
                )}
            </div>
            <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-[0.25em] mb-1.5">{title}</h3>
            <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-white tracking-tighter leading-none animate-count-up">{value}</p>
                <ArrowUpRight size={16} className="text-white/40 mb-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
        </div>
    </div>
);

const Overview = () => {
    const { user } = useAuth();
    const isSalesMode = window.location.pathname.startsWith('/salesman');
    
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total: 0, pending: 0, quoted: 0, completed: 0,
        won: 0, lost: 0, salesAlert: 0, ownerAlert: 0
    });
    const [chartData, setChartData] = useState({
        status: [], source: [], timeline: []
    });

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            const data = await fetchLeads();
            
            // Filter by agent if in sales mode
            const filteredData = isSalesMode 
                ? data.filter(l => l['Assigned to'] === user?.email)
                : data;
                
            setLeads(filteredData);
            const statsData = filteredData; // use filtered data for all calculations

            const total = statsData.length;
            const pending = statsData.filter(l => l.Status?.toUpperCase() === 'PENDING').length;
            const quoted = statsData.filter(l => l.Status?.toUpperCase() === 'QUOTED').length;
            const completed = statsData.filter(l => l.Status?.toUpperCase() === 'COMPLETED').length;
            const won = statsData.filter(l => l['Won/ Lost']?.toLowerCase() === 'won').length;
            const lost = statsData.filter(l => l['Won/ Lost']?.toLowerCase() === 'lost').length;

            // Follow-up alerts: 2 <= days < 5 AND status !== 'COMPLETED'
            const salesAlert = statsData.filter(l => {
                const days = parseInt(l['days open']) || 0;
                const status = l.Status?.toUpperCase();
                return days >= 2 && days < 5 && status !== 'COMPLETED';
            }).length;

            // Critical alerts: days >= 5 AND status !== 'COMPLETED'
            const ownerAlert = statsData.filter(l => {
                const days = parseInt(l['days open']) || 0;
                const status = l.Status?.toUpperCase();
                return days >= 5 && status !== 'COMPLETED';
            }).length;

            setMetrics({ total, pending, quoted, completed, won, lost, salesAlert, ownerAlert });

            const statusCounts = statsData.reduce((acc, curr) => {
                const status = curr.Status || 'Unknown';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));

            const sourceCounts = statsData.reduce((acc, curr) => {
                const source = curr['Lead source'] || 'Other';
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {});
            const sourceData = Object.keys(sourceCounts).map(name => ({ name, leads: sourceCounts[name] }));

            const timelineData = statsData.reduce((acc, curr) => {
                const dateRaw = curr['Date Created'] || '';
                const date = dateRaw.split(' ')[0] || 'Unknown';
                if (date !== 'Unknown') {
                    acc[date] = (acc[date] || 0) + 1;
                }
                return acc;
            }, {});
            const sortedTimeline = Object.keys(timelineData).sort().map(date => ({
                date, count: timelineData[date]
            }));

            setChartData({ status: statusData, source: sourceData, timeline: sortedTimeline });
            setLoading(false);
        };
        getData();
    }, []);

    const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-fade-in">
            <div className="w-16 h-16 border-4 border-pucho-purple/20 border-t-pucho-purple rounded-full animate-spin mb-6"></div>
            <p className="text-pucho-text font-bold text-lg tracking-tight">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <OverviewCard
                    title="Total Leads"
                    value={metrics.total}
                    icon={Users}
                    gradient="gradient-indigo"
                    subValue="Overall"
                    delay={0}
                />
                <OverviewCard
                    title="Active Leads"
                    value={`${metrics.pending + metrics.quoted}`}
                    icon={Clock}
                    gradient="gradient-violet"
                    subValue="In Pipeline"
                    delay={100}
                />
                <OverviewCard
                    title="Conversion Rate"
                    value={`${Math.round((metrics.won / metrics.total) * 100)}%`}
                    icon={TrendingUp}
                    gradient="gradient-emerald"
                    subValue={`${metrics.won} Won`}
                    delay={200}
                />
                <OverviewCard
                    title="Active Alerts"
                    value={metrics.salesAlert + metrics.ownerAlert}
                    icon={AlertCircle}
                    gradient="gradient-rose"
                    subValue={`${metrics.ownerAlert} Critical`}
                    delay={300}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Status Pie Chart */}
                <div className="glass-card p-7 group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl gradient-indigo flex items-center justify-center">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Lead Status Breakdown</h3>
                    </div>
                    <div className="h-72">
                        {chartData.status.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                    <Sparkles size={24} className="text-indigo-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">No lead data available</p>
                                <p className="text-xs text-slate-300 mt-1">Status breakdown will appear once leads are added</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.status}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={6}
                                        dataKey="value"
                                    >
                                        {chartData.status.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', padding: '12px 16px', fontWeight: 700 }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Source Bar Chart */}
                <div className="glass-card p-7 group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Channel Performance</h3>
                    </div>
                    <div className="h-72">
                        {chartData.source.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                    <TrendingUp size={24} className="text-blue-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">No channel data yet</p>
                                <p className="text-xs text-slate-300 mt-1">Channel performance will appear once leads arrive</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.source}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.06)', radius: 8 }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', padding: '12px 16px', fontWeight: 700 }}
                                    />
                                    <Bar dataKey="leads" fill="url(#barGrad)" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline Chart */}
            <div className="glass-card p-7">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl gradient-emerald flex items-center justify-center">
                            <Calendar size={14} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-pucho-dark tracking-tight">Lead Activity Timeline</h3>
                    </div>
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        Daily Trend
                    </span>
                </div>
                <div className="h-72">
                    {chartData.timeline.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                                <Calendar size={24} className="text-emerald-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No activity timeline yet</p>
                            <p className="text-xs text-slate-300 mt-1">Lead activity will be tracked here over time</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.timeline}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', padding: '12px 16px', fontWeight: 700 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                                    activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Alert Banner */}
            {(metrics.salesAlert > 0 || metrics.ownerAlert > 0) && (
                <div className="relative overflow-hidden rounded-[24px] p-5 flex items-center gap-5 group hover:shadow-lg transition-all duration-500 cursor-default gradient-rose">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '15px 15px'}}></div>
                    <div className="relative z-10 flex items-center gap-5 w-full">
                        <div className="relative">
                            <div className="bg-white/20 backdrop-blur-sm text-white p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                <Zap size={22} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse-dot"></div>
                        </div>
                        <div>
                            <p className="text-white font-bold text-base tracking-tight">Action Required</p>
                            <p className="text-white/70 font-medium text-sm">
                                <span className="font-bold text-white">{metrics.salesAlert} Sales Alerts</span> and <span className="font-bold text-white">{metrics.ownerAlert} Escalations</span> need attention.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;
