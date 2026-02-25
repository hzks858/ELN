import React from 'react';
import { View, Permission } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
    activeView: View;
    onNavigate: (view: View) => void;
}

export const Sidebar: React.FC<Props> = ({ activeView, onNavigate }) => {
    const { user, hasPermission } = useAuth();

    const allItems: { id: View; label: string; icon: string; permission?: Permission }[] = [
        { id: 'experiment', label: '实验', icon: 'science', permission: 'view_experiments' },
        { id: 'inventory', label: '库存', icon: 'inventory_2', permission: 'manage_inventory' },
        { id: 'analysis', label: '分析', icon: 'analytics', permission: 'view_analysis' },
        { id: 'batch', label: '追溯性', icon: 'timeline', permission: 'view_experiments' },
        { id: 'audit', label: '审计日志', icon: 'fact_check', permission: 'view_audit_log' },
        { id: 'settings', label: '设置', icon: 'settings', permission: 'manage_users' },
    ];

    const items = allItems.filter(item => !item.permission || hasPermission(item.permission));

    return (
        <nav className="w-16 lg:w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 transition-all duration-300">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-200 dark:border-slate-700">
                 <div className="flex items-center gap-2 text-primary">
                    <span className="material-icons text-2xl">science</span>
                    <span className="hidden lg:block font-bold text-lg tracking-tight text-slate-900 dark:text-white">Helix<span className="font-normal opacity-80">ELN</span></span>
                 </div>
            </div>

            <ul className="flex-1 py-4 space-y-1">
                {items.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-sm font-medium transition-colors relative
                                ${activeView === item.id 
                                    ? 'text-primary bg-primary/10 dark:bg-primary/20 border-r-2 border-primary' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="material-icons text-xl">{item.icon}</span>
                            <span className="hidden lg:block">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                     <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            user?.initials
                        )}
                     </div>
                     <div className="hidden lg:block overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.role}</p>
                     </div>
                </button>
            </div>
        </nav>
    );
};