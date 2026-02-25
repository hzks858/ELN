import React, { useState } from 'react';

interface BatchEvent {
    id: string;
    time: string;
    type: 'process' | 'analysis' | 'inventory' | 'compliance';
    title: string;
    desc: string;
    operator: string;
    status: 'success' | 'warning' | 'error' | 'pending';
    icon: string;
}

interface MaterialNode {
    id: string;
    name: string;
    lot: string;
    qty: string;
    status: 'passed' | 'pending' | 'failed';
    type: 'input' | 'intermediate' | 'output';
}

export const Traceability: React.FC = () => {
    const [selectedBatch, setSelectedBatch] = useState('BT-2023-0942');
    
    const events: BatchEvent[] = [
        { id: '1', time: '2023-10-27 09:00', type: 'inventory', title: '物料发放', desc: '氯化钠 (Lot: SC-9001) 及甲醇 (Lot: 8829A) 已发放。', operator: 'Sarah Chen', status: 'success', icon: 'inventory_2' },
        { id: '2', time: '2023-10-27 10:15', type: 'process', title: '溶液制备', desc: 'SOP-PREP-01 步骤 1 完成，pH 值校准为 7.42。', operator: 'Sarah Chen', status: 'success', icon: 'science' },
        { id: '3', time: '2023-10-27 13:45', type: 'analysis', title: 'HPLC 中间体检测', desc: '主峰面积 98.5%，符合内控标准。报告 ID: AN-4421。', operator: 'David Wu', status: 'success', icon: 'analytics' },
        { id: '4', time: '2023-10-27 15:20', type: 'compliance', title: '偏差记录', desc: '反应温度波动超出范围 (±2.0°C)，已触发记录。', operator: 'System', status: 'warning', icon: 'report_problem' },
        { id: '5', time: '2023-10-28 08:30', type: 'process', title: '产物提纯', desc: '重结晶完成，得率 82.4%。', operator: 'Sarah Chen', status: 'pending', icon: 'filter_alt' },
    ];

    const genealogy: MaterialNode[] = [
        { id: 'm1', name: '氯化钠 (NaCl)', lot: 'SC-9001', qty: '500g', status: 'passed', type: 'input' },
        { id: 'm2', name: '无水乙醇', lot: 'E-2201', qty: '1.2L', status: 'passed', type: 'input' },
        { id: 'm3', name: '中间体-AX', lot: 'IM-102', qty: '420g', status: 'passed', type: 'intermediate' },
        { id: 'm4', name: '化合物-AX (成品)', lot: 'BT-2023-0942', qty: '385g', status: 'pending', type: 'output' },
    ];

    return (
        <div className="flex h-full bg-[#f8fafc] dark:bg-[#0f1115] overflow-hidden">
            {/* Left Column: Batch Genealogy & Material Flow */}
            <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">批次谱系管理</h2>
                    <div className="space-y-4">
                        <div className="relative group">
                            <span className="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                            <input 
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary transition-all" 
                                placeholder="搜索批次或序列号..." 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <section>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">关键输入物料 (Raw Materials)</h3>
                        <div className="space-y-2">
                            {genealogy.filter(m => m.type === 'input').map(node => (
                                <div key={node.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{node.name}</span>
                                        <span className="material-icons text-emerald-500 text-sm">verified</span>
                                    </div>
                                    <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 uppercase">
                                        <span>LOT: {node.lot}</span>
                                        <span>{node.qty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="relative">
                        <div className="absolute left-1/2 -top-4 -bottom-4 w-px bg-slate-100 dark:bg-slate-800 -z-10"></div>
                        <div className="flex justify-center py-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-icons text-xs">south</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">产出与状态 (Final Release)</h3>
                        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1">
                                <span className="material-icons text-primary/20 text-4xl rotate-12">inventory</span>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-primary uppercase">BT-2023-0942</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[8px] font-bold uppercase border border-amber-200">隔离待检</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">化合物-AX 结晶体</h4>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                                    <span>QTY: 385.2g</span>
                                    <span>YIELD: 91.2%</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </aside>

            {/* Main Column: Traceability Timeline */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                            <span className="material-icons">timeline</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">全流程追溯视图</h1>
                            <p className="text-xs text-slate-400 font-mono">BATCH UUID: 550E8400-E29B-41D4-A716-446655440000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all">
                            <span className="material-icons text-sm">print</span> 打印追溯单
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                            <span className="material-icons text-sm">ios_share</span> 导出批记录 (eBMR)
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative pl-10 border-l-2 border-slate-100 dark:border-slate-800 space-y-12">
                            {events.map((event, idx) => (
                                <div key={event.id} className="relative group/evt">
                                    {/* Timeline Node */}
                                    <div className={`absolute -left-[51px] top-0 h-10 w-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-surface-dark shadow-sm z-10 transition-transform group-hover/evt:scale-110
                                        ${event.status === 'success' ? 'bg-emerald-500 text-white' : 
                                          event.status === 'warning' ? 'bg-amber-500 text-white' : 
                                          event.status === 'error' ? 'bg-red-500 text-white' : 'bg-slate-300 text-white'}
                                    `}>
                                        <span className="material-icons text-lg">{event.icon}</span>
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:border-primary/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest text-white ${
                                                    event.type === 'process' ? 'bg-blue-500' :
                                                    event.type === 'analysis' ? 'bg-purple-500' :
                                                    event.type === 'inventory' ? 'bg-slate-600' : 'bg-amber-600'
                                                }`}>
                                                    {event.type}
                                                </span>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{event.title}</h3>
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                                {event.time}
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                            {event.desc}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {event.operator.substring(0, 1)}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">操作员: {event.operator}</span>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button className="h-8 px-3 text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                                    查看详情
                                                </button>
                                                {event.type === 'analysis' && (
                                                    <button className="h-8 px-3 text-[10px] font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all">
                                                        色谱图谱
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Column: Compliance Summary */}
            <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-[#131920] flex flex-col shrink-0 p-8 overflow-y-auto custom-scrollbar">
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">合规性与生命周期</h2>
                
                <div className="space-y-8">
                    <section>
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">批次完成度 (Completion)</h3>
                            <span className="text-sm font-bold text-primary">85%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">关键参数审核 (CPP/CQA)</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-emerald-500 text-sm">check_circle</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">pH 控制 (Range: 7.2-7.6)</p>
                                    <p className="text-[10px] text-slate-500 font-mono">RESULT: 7.42 (IN RANGE)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-amber-500 text-sm">warning</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">反应温度 (Range: 40±1°C)</p>
                                    <p className="text-[10px] text-amber-600 font-mono italic">DEVIATION: 42.1°C (EXTENDED)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-emerald-500 text-sm">check_circle</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">水分含量 (Range: &lt;0.5%)</p>
                                    <p className="text-[10px] text-slate-500 font-mono">RESULT: 0.22% (IN RANGE)</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">电子签名状态 (Signatures)</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                    <span className="material-icons text-sm">verified</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Sarah Chen</p>
                                    <p className="text-[9px] text-slate-400 uppercase">作者批准 · 2023-10-27</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-100 dark:border-slate-800 opacity-50">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <span className="material-icons text-sm">history_edu</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">QA Manager</p>
                                    <p className="text-[9px] text-slate-400 uppercase">等待质量复核</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-8 text-center border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mb-4">符合 GAMP5 与 21 CFR P11</p>
                        <div className="flex items-center justify-center gap-2 grayscale opacity-30">
                            <div className="h-6 w-12 bg-slate-400 rounded"></div>
                            <div className="h-6 w-12 bg-slate-400 rounded"></div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};