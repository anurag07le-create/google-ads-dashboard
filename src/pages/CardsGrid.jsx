import React, { useState, useEffect } from 'react';
import Card from '../components/dashboard/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FlowIcon from '../assets/icons/card_flow.png';
import { LayoutGrid, List, Loader2 } from 'lucide-react'; // Import icons
import { fetchLeads } from '../lib/googleSheets';

const CardsGrid = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const getLeads = async () => {
            setLoading(true);
            const data = await fetchLeads();
            setLeads(data);
            setLoading(false);
        };
        getLeads();
    }, []);

    return (
        <div className="">
            {/* View Toggle (Grid / List) - Floating at top right */}
            <div className="flex justify-end mb-6">
                <div className="flex items-center gap-[6px]">
                    {/* Grid Button */}
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`
                            flex items-center justify-center w-[44px] h-[36px] rounded-full transition-all duration-200
                            ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'}
                        `}
                    >
                        <LayoutGrid size={20} className={`transition-all ${viewMode === 'grid' ? 'stroke-white' : 'stroke-current opacity-60'}`} strokeWidth={viewMode === 'grid' ? 2 : 1.5} />
                    </button>

                    {/* List Button */}
                    <button
                        onClick={() => setViewMode('list')}
                        className={`
                            flex items-center justify-center w-[44px] h-[36px] rounded-full transition-all duration-200
                            ${viewMode === 'list' ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'}
                        `}
                    >
                        <List size={24} className={`transition-all ${viewMode === 'list' ? 'stroke-white' : 'stroke-current opacity-60'}`} strokeWidth={viewMode === 'list' ? 2 : 1.5} />
                    </button>
                </div>
            </div>

            {/* Content Grid/List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-pucho-purple/60">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-medium">Fetching Leads from Google Sheets...</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No leads found in the spreadsheet.</p>
                </div>
            ) : (
                <div className={`
                    ${viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'flex flex-col gap-4'
                    }
                `}>
                    {leads.map((lead, index) => (
                        <Card
                            key={lead['Lead Id'] || index}
                            title={lead['Customer Name'] || 'Unnamed Lead'}
                            description={`${lead['Status'] || 'No Status'} | ${lead['Lead source'] || 'Unknown Source'}`}
                            active={selectedCard?.index === index}
                            onClick={() => setSelectedCard({ ...lead, index, title: lead['Customer Name'], description: lead['Status'] })}
                            listView={viewMode === 'list'}
                        />
                    ))}
                </div>
            )}

            {/* Mini Window Modal */}
            <Modal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                title={selectedCard?.title}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-[#A0D296]/20 flex items-center justify-center flex-none text-[#5A7C60]">
                            <img src={FlowIcon} alt="Icon" className="w-5 h-5 object-contain opacity-100" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{selectedCard?.['Lead Id'] || 'Lead Details'}</p>
                            <p className="text-xs text-gray-500">{selectedCard?.['Location/ City'] || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Email</p>
                            <p className="text-gray-900 truncate font-medium">{selectedCard?.['Email'] || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Phone</p>
                            <p className="text-gray-900 font-medium">{selectedCard?.['Phone Number'] || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Lead Source</p>
                            <p className="text-gray-900 font-medium">{selectedCard?.['Lead source'] || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Date Created</p>
                            <p className="text-gray-900 font-medium">{selectedCard?.['Date Created'] || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Days Open</p>
                            <p className="text-gray-900 font-medium">{selectedCard?.['days open'] || '0'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Assigned To</p>
                            <p className="text-gray-900 font-medium">{selectedCard?.['Assigned to'] || 'Unassigned'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">PO Received</p>
                            <p className="text-gray-900 font-medium">{selectedCard?.['PO Received'] || 'None'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Won / Lost</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                selectedCard?.['Won/ Lost'] === 'Won' ? 'bg-green-100 text-green-700' : 
                                selectedCard?.['Won/ Lost'] === 'Lost' ? 'bg-red-100 text-red-700' : 
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {selectedCard?.['Won/ Lost'] || 'Pending'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-pucho-purple/5 rounded-xl border border-pucho-purple/10 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-pucho-purple/60 uppercase tracking-widest font-bold mb-0.5">Quotation Status</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedCard?.['Status']}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-pucho-purple/60 uppercase tracking-widest font-bold mb-0.5">Amount</p>
                            <p className="text-sm font-bold text-pucho-purple">₹{selectedCard?.['Quotation Amount'] || '0'}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setSelectedCard(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                        <Button onClick={() => console.log("View Lead Details")}>
                            View Details
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CardsGrid;
