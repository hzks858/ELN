import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSign: () => void;
}

export const SignatureModal: React.FC<Props> = ({ isOpen, onClose, onSign }) => {
    const [step, setStep] = useState<'form' | 'biometric'>('form');
    const [uuid, setUuid] = useState('550e8400-e29b-41d4-a716-446655440000');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark-lighter">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-icons">verified_user</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">签署并锁定记录</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: ELN-2023-8942-B</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 shadow-sm">
                        <span className="material-icons text-amber-700 flex-shrink-0">gavel</span>
                        <div>
                            <h3 className="font-semibold text-amber-800 text-sm">法律声明</h3>
                            <p className="text-sm text-amber-800/90 mt-1">
                                通过电子签名，我证明记录的数据是真实、准确和完整的。我理解此电子签名与我的手写签名具有同等法律效力。
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">签署人凭证</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">全名</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-icons text-[20px]">person</span>
                                </span>
                                <input className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-surface-dark-lighter border border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 cursor-not-allowed text-sm" readOnly type="text" value="Sarah Chen 博士" />
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                    <span className="material-icons text-[18px]">check_circle</span>
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">密码 / PIN</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-icons text-[20px]">lock</span>
                                </span>
                                <input className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-surface-dark-lighter border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" placeholder="••••••••••••" type="password" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">签名含义</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-icons text-[20px]">history_edu</span>
                                </span>
                                <select className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-surface-dark-lighter border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary appearance-none">
                                    <option>我批准此记录</option>
                                    <option>我是此记录的作者</option>
                                    <option>我已审阅此记录</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-icons text-[20px]">expand_more</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="material-icons text-slate-400 text-[18px]">fact_check</span>
                                审计追踪预览
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800">已生成安全哈希</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-surface-dark-lighter rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs font-mono space-y-2 text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-slate-500 shrink-0">文档 UUID:</span>
                                <input 
                                    type="text"
                                    value={uuid}
                                    onChange={(e) => setUuid(e.target.value)}
                                    className="flex-1 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-right font-mono text-[11px] focus:ring-1 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white transition-all"
                                    placeholder="输入 UUID..."
                                />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">SHA-256:</span>
                                <span className="truncate max-w-[200px]">8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">时间戳:</span>
                                <span>2023-10-27T14:35:22.00Z</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-surface-dark-lighter border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        取消
                    </button>
                    <button onClick={onSign} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all">
                        <span className="material-icons text-[18px]">lock</span>
                        签署并锁定记录
                    </button>
                </div>
            </div>
        </div>
    );
};