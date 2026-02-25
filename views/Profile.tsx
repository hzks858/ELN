import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const { savedDesigns, loadDesign, saveCurrentDesign, resetDesign } = useDesign();
    const [newDesignName, setNewDesignName] = useState('');

    const handleSave = () => {
        if (newDesignName.trim()) {
            saveCurrentDesign(newDesignName);
            setNewDesignName('');
        }
    };

    if (!user) return null;

    return (
        <div className="h-full bg-background-light dark:bg-background-dark p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                    <div className="flex gap-6">
                        <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                        <div className="pt-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded uppercase tracking-wide">{user.role}</span>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase tracking-wide">活跃</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    >
                        退出登录
                    </button>
                </div>

                {/* Design Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Current State Actions */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">当前工作区</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">保存当前设计</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newDesignName}
                                        onChange={(e) => setNewDesignName(e.target.value)}
                                        placeholder="例如：合成协议 V2"
                                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-surface-dark-lighter border border-slate-200 dark:border-slate-700 rounded text-sm outline-none focus:border-primary"
                                    />
                                    <button 
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    onClick={resetDesign}
                                    className="w-full py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    重置为默认
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Saved Designs List */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">已保存的设计</h2>
                        <div className="space-y-3">
                            {savedDesigns.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-8">暂无已保存的设计。</p>
                            ) : (
                                savedDesigns.map((design) => (
                                    <div key={design.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/30 bg-slate-50 dark:bg-surface-dark-lighter/50 transition-colors group">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{design.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono">{new Date(design.date).toLocaleDateString('zh-CN')}</p>
                                        </div>
                                        <button 
                                            onClick={() => loadDesign(design.id)}
                                            className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary hover:text-white transition-all"
                                        >
                                            加载
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};