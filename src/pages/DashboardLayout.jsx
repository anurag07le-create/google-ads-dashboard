import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-pucho-bg overflow-hidden font-sans text-pucho-dark">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar: Responsive */}
            <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-[240px] overflow-hidden relative transition-all duration-500 ease-in-out">
                {/* Header: Sticky Top - Now handled via glass-header tool inside Header component */}
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-12 lg:py-10 relative z-10 scroll-smooth">
                    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
