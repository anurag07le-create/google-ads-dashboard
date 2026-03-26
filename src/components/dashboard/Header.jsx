import React from "react";
import { useLocation } from "react-router-dom";
import { Command } from 'lucide-react';

const Header = ({ onMenuClick }) => {
    const location = useLocation();

    // Map paths to Title and Description
    const pageMetadata = {
        '/admin': { title: 'Executive Overview', description: 'Real-time performance metrics and business health.' },
        '/admin/leads': { title: 'Lead Management', description: 'Centralized acquisition and lifecycle tracking.' },
        '/admin/alerts': { title: 'Operational Alerts', description: 'Automatic escalation for overdue leads across the organization.' },
        '/admin/performance': { title: 'Sales Performance', description: 'In-depth audit of human capital efficiency and conversion dynamics.' },
        '/admin/revenue': { title: 'Capital Analytics', description: 'Financial forecasting and funnel yield analysis.' },
        '/admin/sources': { title: 'Source Intelligence', description: 'Channel attribution and ROI breakdown.' },
        
        '/salesman': { title: 'Personal Overview', description: 'Your real-time performance and active lead pipeline.' },
        '/salesman/leads': { title: 'My Leads', description: 'Manage your assigned prospects and engagement.' },
        '/salesman/alerts': { title: 'Personal Alerts', description: 'Action items for your overdue leads.' },
        '/salesman/performance': { title: 'My Performance', description: 'Audit of your conversion efficiency and deal velocity.' },
        '/salesman/revenue': { title: 'Revenue Analytics', description: 'Personal revenue contribution and commission audit.' },
        '/salesman/sources': { title: 'Source Intelligence', description: 'Channel attribution for your leads.' },
    };

    const currentPath = location.pathname;
    const { title, description } = pageMetadata[currentPath] || { title: 'Intelligence Suite', description: 'Pucho Advanced Analytics Terminal' };

    return (
        <header className="sticky top-0 z-20 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-8 py-5 flex items-center justify-between transition-all duration-500">
            {/* Left Side */}
            <div className="flex items-center gap-6">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100"
                >
                    <Command size={20} className="text-pucho-purple" />
                </button>

                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold text-pucho-dark tracking-tight leading-tight">{title}</h1>
                    <p className="text-xs font-medium text-slate-400 opacity-80">{description}</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
