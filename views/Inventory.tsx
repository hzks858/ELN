import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Inventory: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const { addNotification } = useNotification();
    const { hasPermission } = useAuth();
    const canManage = hasPermission('manage_inventory');

    useEffect(() => {
        // Simulate checking for low inventory or issues
        const items = [
            { id: 4, name: "无水乙醇", status: "过期", qty: "100 mL" },
            { id: 3, name: "氯化钠", status: "待检", qty: "500 g" }
        ];

        // Check only once on mount for demo purposes
        const hasNotified = sessionStorage.getItem('inventory_notified');
        if (!hasNotified) {
            items.forEach(item => {
                if (item.status === '过期') {
                    addNotification({
                        type: 'error',
                        title: '试剂过期警告',
                        message: `${item.name} 已过期 (剩余 ${item.qty})，请立即处理。`,
                        actionLabel: '查看',
                        onAction: () => setSelectedItem(item.id)
                    });
                } else if (item.status === '待检') {
                    addNotification({
                        type: 'warning',
                        title: '库存待检提醒',
                        message: `${item.name} 需要进行质量检测。`,
                        actionLabel: '查看',
                        onAction: () => setSelectedItem(item.id)
                    });
                }
            });
            sessionStorage.setItem('inventory_notified', 'true');
        }
    }, []);

    return (
        <div className="flex h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Filter Sidebar */}
            <aside className="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-y-auto">
                <div className="p-4 pb-0"><h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">快速筛选</h2></div>
                <div className="space-y-1 px-2">
                    {["存储条件", "状态", "项目代码"].map((cat) => (
                        <details key={cat} open className="group">
                            <summary className="flex items-center justify-between p-2 font-medium text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                <span>{cat}</span>
                                <span className="material-icons text-slate-400 text-lg group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="pl-4 mt-1 space-y-1 pb-2">
                                {cat === "状态" ? ["可用", "使用中", "待检", "过期"].map(s => (
                                    <label key={s} className="flex items-center px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-primary cursor-pointer">
                                        <input type="checkbox" defaultChecked={s !== "待检"} className="rounded border-slate-300 text-primary focus:ring-primary mr-2" />
                                        {s}
                                    </label>
                                )) : <div className="p-2 text-xs text-slate-400 italic">无可用筛选</div>}
                            </div>
                        </details>
                    ))}
                </div>
            </aside>

            {/* Main List */}
            <main className="flex-1 flex flex-col min-w-0">
                <div className="px-6 py-4 flex items-center justify-between gap-4 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">试剂库存</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span>主列表</span>
                            <span>•</span>
                            <span>12 分钟前更新</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <span className="material-icons absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
                            <input className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" placeholder="搜索库存..." type="text"/>
                        </div>
                        {canManage && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                                <span className="material-icons text-lg">add</span>
                                接收批次
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-surface-dark-lighter border-b border-slate-200 dark:border-slate-700 sticky top-0">
                                <tr>
                                    <th className="p-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary"/></th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 uppercase">试剂名称</th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 uppercase">内部 ID</th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 uppercase">批号</th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 uppercase">有效期</th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 uppercase">状态</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {[
                                    { id: 1, name: "甲醇 (HPLC 级)", supplier: "Merck", code: "#INT-9022", lot: "8829A", expiry: "2024-12-01", status: "可用", qty: "2.5 L" },
                                    { id: 2, name: "Taq DNA 聚合酶", supplier: "Thermo Fisher", code: "#INT-1029", lot: "B992", expiry: "2025-05-15", status: "使用中", qty: "500 µL" },
                                    { id: 3, name: "氯化钠", supplier: "Sigma Aldrich", code: "#INT-5501", lot: "SC-9001", expiry: "2026-01-20", status: "待检", qty: "500 g" },
                                    { id: 4, name: "无水乙醇", supplier: "VWR", code: "#INT-3044", lot: "E-2201", expiry: "2023-09-10", status: "过期", qty: "100 mL" }
                                ].map((row) => (
                                    <tr key={row.id} onClick={() => setSelectedItem(row.id)} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedItem === row.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="p-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" checked={selectedItem === row.id}/></td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{row.name}</div>
                                            <div className="text-xs text-slate-500">{row.supplier}</div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">{row.code}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{row.lot}</td>
                                        <td className="p-4">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded w-fit text-xs font-medium border ${row.status === '过期' ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'text-slate-600 dark:text-slate-300 border-transparent'}`}>
                                                {row.status === '过期' && <span className="material-icons text-sm">error_outline</span>}
                                                {row.expiry}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${row.status === '可用' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                                  row.status === '使用中' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                  row.status === '待检' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons">more_vert</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Slide-over Details */}
            {selectedItem && (
                 <div className="w-96 bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-surface-dark-lighter">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">甲醇 (HPLC)</h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <span className="font-mono">#INT-9022</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">可用</span>
                            </p>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600"><span className="material-icons">close</span></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative border border-slate-200 dark:border-slate-700">
                             <span className="material-icons text-6xl text-slate-300 dark:text-slate-600">science</span>
                             <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">SDS 预览</div>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">详情</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-[10px] text-slate-500 uppercase">制造商</p><p className="text-sm font-medium text-slate-900 dark:text-white">Merck KGaA</p></div>
                                <div><p className="text-[10px] text-slate-500 uppercase">目录号</p><p className="text-sm font-medium text-slate-900 dark:text-white">1.06009.2500</p></div>
                                <div><p className="text-[10px] text-slate-500 uppercase">位置</p><p className="text-sm font-medium text-slate-900 dark:text-white">柜 A, 层 2</p></div>
                                <div><p className="text-[10px] text-slate-500 uppercase">容器</p><p className="text-sm font-medium text-slate-900 dark:text-white">玻璃瓶</p></div>
                            </div>
                        </div>

                         <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">最近使用</h4>
                            <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-2 space-y-6 pl-5 py-1">
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-white dark:bg-surface-dark border-2 border-primary"></div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">使用了 50 mL</p>
                                    <p className="text-xs text-slate-500">Jane Doe 用于 <span className="text-primary cursor-pointer">Exp-2023-009</span></p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">今天, 上午 10:30</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-white dark:bg-surface-dark border-2 border-slate-300 dark:border-slate-600"></div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">QC 通过</p>
                                    <p className="text-xs text-slate-500">纯度确认 &gt;99.9%</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">2023年10月28日</p>
                                </div>
                            </div>
                         </div>
                    </div>
                 </div>
            )}
        </div>
    );
};