import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/pucho_logo_sidebar_v2.png';

// Custom icons imported from assets

import iconOverview from '../../assets/icons/Property 2=Grid, Property 1=Default.png';
import iconLeads from '../../assets/icons/Property 2=Users, Property 1=Default.png';
import iconAlerts from '../../assets/icons/Property 2=warning.png';
import iconPerformance from '../../assets/icons/Property 2=chart, Property 1=Default.png';
import iconRevenue from '../../assets/icons/Property 2=Credits, Property 1=Default.png';
import iconSources from '../../assets/icons/Property 2=Connections, Property 1=Default.png';
import iconLogout from '../../assets/icons/Property 2=Log out, Property 1=Default.png';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentPath = window.location.pathname;
    const basePath = currentPath.startsWith('/salesman') ? '/salesman' : '/admin';
    const isSalesMode = basePath === '/salesman';

    const menuItems = [
        { name: 'Overview', icon: iconOverview, path: `${basePath}` },
        { name: 'Leads', icon: iconLeads, path: `${basePath}/leads` },
        { name: 'Alerts', icon: iconAlerts, path: `${basePath}/alerts` },
        ...(!isSalesMode ? [{ name: 'Performance', icon: iconPerformance, path: `${basePath}/performance` }] : []),
        { name: 'Revenue', icon: iconRevenue, path: `${basePath}/revenue` },
        { name: 'Sources', icon: iconSources, path: `${basePath}/sources` },
    ];

    return (
        <aside
            className={`
                w-[260px] h-screen bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-30
                transition-all duration-500 ease-in-out shadow-premium
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}
        >
            <div className="px-8 py-10">
                <img 
                    src={logo} 
                    alt="Pucho" 
                    className="h-9 w-auto hover:opacity-80 transition-opacity cursor-pointer active:scale-95" 
                    onClick={() => navigate(basePath)} 
                />
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === basePath}
                        onClick={() => setIsMobileOpen?.(false)}
                        className={({ isActive }) => `
                            group relative flex items-center px-4 h-11 rounded-[14px] text-sm font-semibold transition-all duration-200
                            ${isActive
                                ? 'bg-[#f0fdf4] text-[#0f172a]'
                                : 'text-[#334155] hover:bg-slate-50 hover:text-slate-900'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <div className="flex items-center gap-4">
                                <img 
                                    src={item.icon} 
                                    alt="" 
                                    className={`w-5 h-5 object-contain transition-all duration-200 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`} 
                                />
                                <span className="tracking-tight">{item.name}</span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto space-y-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 h-11 rounded-[14px] text-sm font-bold text-[#f43f5e] hover:bg-rose-50 transition-all duration-200"
                >
                    <img src={iconLogout} alt="" className="w-5 h-5 object-contain" />
                    <span>Log out</span>
                </button>

                <div className="flex items-center gap-3 px-4 py-2">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`}
                        alt="User"
                        className="w-9 h-9 rounded-full bg-slate-100"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#0f172a] tracking-tight truncate">
                            {user?.full_name || 'User'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isSalesMode ? 'SALESMAN' : 'ADMIN'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
