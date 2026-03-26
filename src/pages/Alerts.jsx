import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, AlertTriangle, ShieldAlert, Mail, Phone, User, Clock, ArrowRight, Zap, Shield, Flame } from 'lucide-react';
import { fetchLeads } from '../lib/googleSheets';
import { useAuth } from '../context/AuthContext';

const Alerts = () => {
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

    const { salesAlerts, ownerAlerts } = useMemo(() => {
        const filtered = leads.filter(l => {
            const days = parseInt(l['days open']) || 0;
            const status = l.Status?.toUpperCase();
            return days >= 2 && status !== 'COMPLETED';
        });
        return {
            salesAlerts: filtered.filter(l => (parseInt(l['days open']) || 0) < 5),
            ownerAlerts: filtered.filter(l => (parseInt(l['days open']) || 0) >= 5)
        };
    }, [leads]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
            <div className="w-14 h-14 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-5"></div>
            <p className="font-bold text-base text-slate-400 tracking-tight">Scanning for overdue leads...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-2xl p-5 gradient-rose group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <Flame size={18} className="text-white/80" />
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Critical</span>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tighter">{ownerAlerts.length}</p>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 gradient-amber group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle size={18} className="text-white/80" />
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Sales Follow-up</span>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tighter">{salesAlerts.length}</p>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 gradient-emerald group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield size={18} className="text-white/80" />
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Active</span>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tighter">{ownerAlerts.length + salesAlerts.length}</p>
                    </div>
                </div>
            </div>

            {/* Owner Section (Critical) */}
            <AlertSection
                title="Management Escalation"
                subtitle="These leads have been open for 5+ days and require immediate owner attention."
                leads={ownerAlerts}
                variant="owner"
            />

            {/* Sales Section */}
            <AlertSection
                title="Sales Follow-up Required"
                subtitle="Leads open 2-4 days that need salesperson action."
                leads={salesAlerts}
                variant="sales"
            />

            {ownerAlerts.length === 0 && salesAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
                    <div className="w-16 h-16 gradient-emerald rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                        <ShieldAlert size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900 tracking-tight">All Clear!</h3>
                    <p className="text-emerald-600/70 font-medium max-w-xs mt-1 text-sm">No overdue leads require intervention at this time.</p>
                </div>
            )}
        </div>
    );
};

const AlertSection = ({ title, subtitle, leads, variant }) => {
    if (leads.length === 0) return null;

    const isOwner = variant === 'owner';

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isOwner ? 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-100' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100'}`}>
                <div className={`relative p-2.5 rounded-xl shadow-sm ${isOwner ? 'gradient-rose' : 'gradient-amber'}`}>
                    {isOwner ? <AlertCircle size={20} className="text-white" /> : <AlertTriangle size={20} className="text-white" />}
                    <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse-dot ${isOwner ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                </div>
                <div className="flex-1">
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
                    <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                </div>
                <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm border ${isOwner ? 'bg-rose-500 text-white border-rose-400' : 'bg-amber-500 text-white border-amber-400'}`}>
                    {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leads.map((lead) => (
                    <AlertCard key={lead['Lead Id']} lead={lead} variant={variant} />
                ))}
            </div>
        </div>
    );
};

const AlertCard = ({ lead, variant }) => {
    const isOwner = variant === 'owner';
    const days = parseInt(lead['days open']) || 0;

    return (
        <div className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group ${isOwner ? 'border-rose-100 hover:border-rose-200' : 'border-amber-100 hover:border-amber-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col truncate pr-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-300 mb-0.5">Customer</span>
                    <h3 className="text-base font-bold text-slate-800 truncate tracking-tight">{lead['Customer Name']}</h3>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${isOwner ? 'gradient-rose' : 'gradient-amber'}`}>
                    <Clock size={11} /> {days}d
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-300 block mb-0.5">Status</span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${lead['Status']?.toUpperCase() === 'COMPLETED' ? 'bg-emerald-400' : lead['Status']?.toUpperCase() === 'PENDING' ? 'bg-amber-400' : 'bg-indigo-400'}`}></div>
                        {lead['Status'] || 'Pending'}
                    </span>
                </div>
                <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-300 block mb-0.5">Assigned To</span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <User size={10} />
                        {lead['Assigned to'] || 'Unassigned'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex gap-2">
                    <a href={`tel:${lead['Phone Number']}`} title={lead['Phone Number'] || 'No phone'} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <Phone size={13} />
                    </a>
                    <a href={`mailto:${lead['Email']}`} title={lead['Email'] || 'No email'} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <Mail size={13} />
                    </a>
                </div>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2.5 py-1 rounded-md">
                    ID: {lead['Lead Id']}
                </span>
            </div>
        </div>
    );
};

export default Alerts;
