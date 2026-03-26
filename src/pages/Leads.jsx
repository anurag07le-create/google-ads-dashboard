import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/dashboard/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { LayoutGrid, List, Table as TableIcon, Search, Filter, Loader2, Mail, Phone, MapPin, User, Tag, Calendar, AlertTriangle, Clock, MoreVertical, ExternalLink } from 'lucide-react';
import { fetchLeads, fetchTeamMembers } from '../lib/googleSheets';
import { useAuth } from '../context/AuthContext';

const Leads = () => {
    const { user } = useAuth();
    const isSalesMode = window.location.pathname.startsWith('/salesman');
    
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [salespersonFilter, setSalespersonFilter] = useState('All');
    const [teamMembers, setTeamMembers] = useState([]);
    const [editingAmount, setEditingAmount] = useState(null);
    const [editAmountValue, setEditAmountValue] = useState('');
    const amountTimers = React.useRef({});

    const WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/vsJZQji2Owg0zSN2w8xxG';

    const triggerWebhook = async (updatedLead) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedLead),
            });
        } catch (error) {
            console.error('Webhook error:', error);
        }
    };

    useEffect(() => {
        const getLeads = async () => {
            setLoading(true);
            const [data, members] = await Promise.all([fetchLeads(), fetchTeamMembers()]);
            
            // Filter by agent if in sales mode
            const filteredData = isSalesMode 
                ? data.filter(l => l['Assigned to'] === user?.email)
                : data;
                
            setLeads(filteredData);
            setTeamMembers(members);
            setLoading(false);
        };
        getLeads();
    }, []);

    const handleAssignChange = (leadId, newAssignee) => {
        setLeads(prev => {
            const updated = prev.map(lead =>
                lead['Lead Id'] === leadId ? { ...lead, 'Assigned to': newAssignee } : lead
            );
            const updatedLead = updated.find(l => l['Lead Id'] === leadId);
            if (updatedLead) triggerWebhook(updatedLead);
            return updated;
        });
    };

    const handleAmountSave = (leadId) => {
        setLeads(prev => prev.map(lead =>
            lead['Lead Id'] === leadId ? { ...lead, 'Quotation Amount': editAmountValue } : lead
        ));
        setEditingAmount(null);
    };

    const filterOptions = useMemo(() => {
        const statuses = ['All', 'PENDING', 'QUOTED', 'COMPLETED'];
        const sources = ['All', ...new Set(leads.map(l => l?.['Lead source']).filter(Boolean))];
        const salespersons = ['All', ...new Set(leads.map(l => l?.['Assigned to']).filter(Boolean))];
        return { statuses, sources, salespersons };
    }, [leads]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch =
                (lead['Customer Name'] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (lead['Lead Id'] || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || lead.Status?.toUpperCase() === statusFilter.toUpperCase();
            const matchesSource = sourceFilter === 'All' || lead['Lead source'] === sourceFilter;
            const matchesSales = salespersonFilter === 'All' || lead['Assigned to'] === salespersonFilter;
            return matchesSearch && matchesStatus && matchesSource && matchesSales;
        });
    }, [leads, searchQuery, statusFilter, sourceFilter, salespersonFilter]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 size={48} className="animate-spin mb-6 text-pucho-purple opacity-40" />
            <p className="font-extrabold text-xl tracking-tight text-slate-400">Synchronizing Lead Database...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-premium">
                {/* Search */}
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pucho-purple transition-all duration-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search Identity or Name..."
                        className="w-full pl-12 pr-5 h-12 bg-slate-50/50 rounded-2xl border-none focus:ring-2 focus:ring-pucho-purple/20 outline-none font-bold text-sm text-pucho-dark placeholder:text-slate-300 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <CompactFilter label="Status" value={statusFilter} onChange={setStatusFilter} options={filterOptions.statuses} icon={Tag} />
                    <CompactFilter label="Source" value={sourceFilter} onChange={setSourceFilter} options={filterOptions.sources} icon={Filter} />
                    {!isSalesMode && (
                        <CompactFilter label="Salesperson" value={salespersonFilter} onChange={setSalespersonFilter} options={filterOptions.salespersons} icon={User} />
                    )}
                </div>
            </div>

            {/* Visualization Area */}
            {filteredLeads.length === 0 ? (
                <div className="glass-card py-32 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200 border-2 border-white shadow-inner">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-pucho-dark tracking-tight">Zero Matches Found</h3>
                    <p className="text-slate-400 font-medium mt-2">Try adjusting your filters.</p>
                </div>
            ) : viewMode === 'table' ? (
                <div className="glass-card overflow-hidden border-none shadow-premium bg-white/80">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                                    <th className="px-8 py-5">Prospect</th>
                                    <th className="px-8 py-5">Engagement</th>
                                    <th className="px-8 py-5">Source & Details</th>
                                    <th className="px-8 py-5">Financials</th>
                                    <th className="px-8 py-5">Allocated</th>
                                    <th className="px-8 py-5">Created</th>
                                    <th className="px-8 py-5">Result</th>
                                    <th className="px-8 py-5 text-right">Age</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLeads.map((lead) => (
                                    <tr
                                        key={lead['Lead Id']}
                                        onClick={() => setSelectedCard(lead)}
                                        className="group cursor-pointer hover:bg-slate-50/50 transition-all duration-300 relative"
                                    >
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-pucho-dark text-base tracking-tight group-hover:text-pucho-purple transition-all">
                                                    {lead['Customer Name']}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-300 tracking-widest mt-0.5 uppercase">#{lead['Lead Id']}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Mail size={12} className="text-slate-300" />
                                                    <span className="truncate max-w-[140px]">{lead['Email']}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Phone size={12} className="text-slate-300" />
                                                    <span>{lead['Phone Number']}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <MapPin size={12} className="text-slate-300" />
                                                    <span>{lead['Location/ City']}</span>
                                                </div>
                                                <div className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-md w-fit uppercase border border-slate-100 pointer-events-none tracking-tight">
                                                    {lead['Lead source']}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col gap-1.5">
                                                <select
                                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border cursor-pointer outline-none transition-all ${lead.Status === 'Quoted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                            lead.Status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                lead.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}
                                                    value={lead.Status || ''}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setLeads(prev => {
                                                            const updated = prev.map(l =>
                                                                l['Lead Id'] === lead['Lead Id'] ? { ...l, Status: newStatus } : l
                                                            );
                                                            const updatedLead = updated.find(l => l['Lead Id'] === lead['Lead Id']);
                                                            if (updatedLead) triggerWebhook(updatedLead);
                                                            return updated;
                                                        });
                                                    }}
                                                >
                                                    <option value="QUOTED">Quoted</option>
                                                    <option value="PENDING">Pending</option>
                                                    <option value="COMPLETED">Completed</option>
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-slate-400">₹</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        className="w-28 h-7 px-2 text-sm font-bold text-pucho-dark bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-pucho-purple/20 focus:bg-white focus:border-indigo-200 transition-all"
                                                        value={lead['Quotation Amount']?.replace(/[$,]/g, '') || ''}
                                                        placeholder="0"
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setLeads(prev => prev.map(l =>
                                                                l['Lead Id'] === lead['Lead Id'] ? { ...l, 'Quotation Amount': val } : l
                                                            ));
                                                            // Debounce webhook for amount changes
                                                            clearTimeout(amountTimers.current[lead['Lead Id']]);
                                                            amountTimers.current[lead['Lead Id']] = setTimeout(() => {
                                                                setLeads(curr => {
                                                                    const updatedLead = curr.find(l => l['Lead Id'] === lead['Lead Id']);
                                                                    if (updatedLead) triggerWebhook(updatedLead);
                                                                    return curr;
                                                                });
                                                            }, 800);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-100/50">
                                                    {lead['Assigned to']?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <select
                                                        disabled={isSalesMode}
                                                        className={`text-xs font-bold bg-transparent border-none outline-none transition-colors appearance-none pr-4 -ml-0.5 ${isSalesMode ? 'text-slate-400 cursor-default' : 'text-slate-600 cursor-pointer hover:text-pucho-purple'}`}
                                                        value={lead['Assigned to'] || ''}
                                                        onChange={(e) => handleAssignChange(lead['Lead Id'], e.target.value)}
                                                        style={{ backgroundImage: !isSalesMode ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` : 'none', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' }}
                                                    >
                                                        {teamMembers.map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                        {lead['Assigned to'] && !teamMembers.includes(lead['Assigned to']) && (
                                                            <option value={lead['Assigned to']}>{lead['Assigned to']}</option>
                                                        )}
                                                    </select>
                                                    <span className="text-[9px] text-slate-300 font-bold">PO: {lead['PO Received'] || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-bold text-slate-500">
                                                {lead['Date Created'] ? new Date(lead['Date Created']).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 outline-none cursor-pointer appearance-none text-center min-w-[80px] ${lead['Won/ Lost']?.toUpperCase() === 'WON'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : lead['Won/ Lost']?.toUpperCase() === 'LOSS'
                                                            ? 'bg-rose-50 text-rose-500 border-rose-100'
                                                            : 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}
                                                value={lead['Won/ Lost'] || ''}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    setLeads(prev => {
                                                        const updated = prev.map(l =>
                                                            l['Lead Id'] === lead['Lead Id'] ? { ...l, 'Won/ Lost': newValue } : l
                                                        );
                                                        const updatedLead = updated.find(l => l['Lead Id'] === lead['Lead Id']);
                                                        if (updatedLead) triggerWebhook(updatedLead);
                                                        return updated;
                                                    });
                                                }}
                                            >
                                                <option value="">—</option>
                                                <option value="WON">WON</option>
                                                <option value="LOSS">LOSS</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className={`flex items-center gap-1.5 font-bold text-lg tracking-tighter ${parseInt(lead['days open']) >= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                                                    {lead['days open'] || '0'}
                                                    <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">d</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredLeads.map((lead) => (
                        <div
                            key={lead['Lead Id']}
                            onClick={() => setSelectedCard(lead)}
                            className="glass-card p-6 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-pucho-purple group-hover:bg-indigo-50 transition-colors">
                                    <User size={18} />
                                </div>
                                <StatusBadge status={lead.Status} />
                            </div>
                            <h3 className="font-bold text-pucho-dark text-lg tracking-tight mb-0.5 truncate">{lead['Customer Name']}</h3>
                            <p className="text-xs font-medium text-slate-400 mb-5">{lead['Lead source']}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-lg font-bold text-pucho-purple">₹{new Intl.NumberFormat('en-IN').format(parseFloat(lead['Quotation Amount']?.replace(/[$,]/g, '')) || 0)}</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase">
                                    <Clock size={10} /> {lead['days open']}d
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                title={selectedCard?.['Customer Name']}
                maxWidth="2xl"
            >
                {selectedCard && (
                    <div className="p-1 space-y-6">
                        {/* Compact Header */}
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100/50">
                            <div className="w-12 h-12 rounded-xl gradient-indigo flex items-center justify-center text-white flex-none shadow-sm">
                                <User size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Lead ID</p>
                                <p className="text-base font-bold text-slate-800 tracking-tight truncate">#{selectedCard['Lead Id']}</p>
                            </div>
                            {parseInt(selectedCard['days open']) >= 5 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 gradient-rose text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex-none shadow-sm">
                                    <AlertTriangle size={12} /> Critical
                                </div>
                            )}
                        </div>

                        {/* Stats Grid - 2x2 for better readability */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                                <p className="text-lg font-bold text-indigo-600 tracking-tight">₹{new Intl.NumberFormat('en-IN').format(parseFloat(selectedCard['Quotation Amount']?.replace(/[$,]/g, '')) || 0)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Open</p>
                                <p className={`text-lg font-bold tracking-tight ${parseInt(selectedCard['days open']) >= 5 ? 'text-rose-500' : 'text-slate-700'}`}>{selectedCard['days open'] || '0'} Days</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PO Status</p>
                                <p className="text-lg font-bold text-emerald-600 tracking-tight">{selectedCard['PO Received'] || 'None'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-lg font-bold text-indigo-600 tracking-tight">{selectedCard['Status']}</p>
                            </div>
                        </div>

                        {/* Contact & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Contact Info</h4>
                                <DetailField label="Email" value={selectedCard['Email']} icon={Mail} />
                                <DetailField label="Phone" value={selectedCard['Phone Number']} icon={Phone} />
                                <DetailField label="Location" value={selectedCard['Location/ City']} icon={MapPin} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Lead Details</h4>
                                <DetailField label="Source" value={selectedCard['Lead source']} icon={Filter} />
                                <DetailField label="Created" value={selectedCard['Date Created']} icon={Calendar} />
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 flex-none">
                                        <User size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Assigned To</p>
                                        {isSalesMode ? (
                                            <p className="text-sm font-semibold text-slate-700 truncate">{selectedCard['Assigned to']}</p>
                                        ) : (
                                            <select
                                                className="text-sm font-semibold text-pucho-purple bg-transparent border-none outline-none cursor-pointer hover:underline transition-all appearance-none"
                                                value={selectedCard['Assigned to'] || ''}
                                                onChange={(e) => {
                                                    handleAssignChange(selectedCard['Lead Id'], e.target.value);
                                                    setSelectedCard(prev => ({ ...prev, 'Assigned to': e.target.value }));
                                                }}
                                            >
                                                {teamMembers.map(name => <option key={name} value={name}>{name}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setSelectedCard(null)}
                                className="px-5 h-10 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all rounded-xl hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <Button className="px-6 h-10 rounded-xl gradient-indigo text-white shadow-lg shadow-indigo-200 flex items-center gap-2 group text-sm font-bold">
                                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                <span>Contact Lead</span>
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const CompactFilter = ({ label, value, onChange, options, icon: Icon }) => (
    <div className="relative group">
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-pucho-purple transition-colors pointer-events-none" />
        <select
            className="h-10 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-100/50 text-[11px] font-bold text-slate-600 uppercase tracking-widest outline-none focus:ring-2 focus:ring-pucho-purple/10 cursor-pointer appearance-none min-w-[140px] transition-all hover:bg-white"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : opt}</option>)}
        </select>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        'Quoted': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
        'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 ${styles[status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {status}
        </span>
    );
};

const DetailField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 flex-none">
            <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{value || 'N/A'}</p>
        </div>
    </div>
);

export default Leads;

