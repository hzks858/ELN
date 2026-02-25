import React, { useState } from 'react';
import { useNotification, Notification } from '../context/NotificationContext';

export const NotificationCenter: React.FC = () => {
    const { notifications, markAsRead, clearNotification } = useNotification();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'info': return 'info';
            case 'success': return 'check_circle';
            case 'warning': return 'warning';
            case 'error': return 'error';
        }
    };

    const getColor = (type: Notification['type']) => {
        switch (type) {
            case 'info': return 'text-blue-500 bg-blue-50 border-blue-100';
            case 'success': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'warning': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'error': return 'text-red-500 bg-red-50 border-red-100';
        }
    };

    return (
        <div className="fixed top-4 right-20 z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
                <span className="material-icons text-slate-500 dark:text-slate-400">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-surface-dark">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-surface-dark-lighter">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">通知中心</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><span className="material-icons text-sm">close</span></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic">暂无通知</div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getColor(notification.type).split(' ')[1]} ${getColor(notification.type).split(' ')[0]}`}>
                                                <span className="material-icons text-sm">{getIcon(notification.type)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notification.title}</h4>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{notification.message}</p>
                                                {notification.actionLabel && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); notification.onAction?.(); }}
                                                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                                                    >
                                                        {notification.actionLabel}
                                                    </button>
                                                )}
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); clearNotification(notification.id); }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                            >
                                                <span className="material-icons text-xs">close</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
