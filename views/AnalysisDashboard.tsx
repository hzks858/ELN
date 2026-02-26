import React from 'react';
import { EditableImage, EditableText } from '../components/Editable';
import { useDesign } from '../context/DesignContext';

export const AnalysisDashboard: React.FC = () => {
    const { isEditing } = useDesign();

    return (
        <div className="flex h-full bg-background-light dark:bg-background-dark overflow-hidden">
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <section className="p-4 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center">
                            <span className="material-icons text-sm mr-1">tune</span>
                            仪器配置
                        </h2>
                        <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">表单: HPLC-STD-09</span>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">设备 ID <span className="text-red-500">*</span></label>
                            {isEditing ? (
                                <select className="block w-full text-sm bg-gray-50 dark:bg-surface-dark-lighter border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-primary">
                                    <option>AGILENT-1100 (活跃)</option>
                                    <option>WATERS-ARC (维护中)</option>
                                </select>
                            ) : (
                                <div className="text-sm font-medium text-slate-900 dark:text-white py-2">AGILENT-1100 (活跃)</div>
                            )}
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">方法参考 <span className="text-red-500">*</span></label>
                            <EditableText 
                                id="analysis-method-ref" 
                                defaultValue="" 
                                placeholder="SOP-LAB-044 v3" 
                                className="block w-full text-sm font-medium"
                            />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">流速</label>
                             <EditableText 
                                id="analysis-flow-rate" 
                                defaultValue="1.5 mL/min" 
                                className="block w-full text-sm font-medium"
                             />
                        </div>
                        <div className="col-span-4 flex items-end justify-end pb-2 text-xs text-gray-400 font-mono">
                             上次校准: 2023-10-01
                        </div>
                    </div>
                </section>

                <section className="flex-1 p-4 flex flex-col min-h-0">
                     <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center">
                            <span className="material-icons text-sm mr-1">analytics</span>
                            色谱分析
                        </h2>
                        <div className="flex gap-2">
                            <button className="text-xs px-2 py-1 bg-surface-dark border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors">导入原始数据</button>
                            <button className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-blue-600 transition-colors">运行积分</button>
                        </div>
                     </div>
                     
                     {/* Chart Area */}
                     <div className="relative w-full h-64 bg-slate-900 rounded-lg border border-slate-700 mb-4 overflow-hidden group">
                        <EditableImage id="chromatogram-chart" alt="色谱图" className="w-full h-full object-contain bg-slate-900">
                            {/* Default SVG Content if no image uploaded */}
                            <div className="relative w-full h-full">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="rgb(25, 115, 240)" stopOpacity={0.5} />
                                            <stop offset="100%" stopColor="rgb(25, 115, 240)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,90 L10,90 L20,85 L30,90 L40,90 L45,10 L50,90 L60,90 L70,80 L80,90 L100,90" fill="url(#grad1)" stroke="#1973f0" strokeWidth="0.5" />
                                </svg>
                                <div className="absolute top-4 left-4 text-xs text-slate-500">mAU</div>
                                <div className="absolute bottom-2 right-4 text-xs text-slate-500">时间 (分钟)</div>
                                <div className="absolute top-[20%] left-[45%] bg-slate-800/80 text-white text-[10px] px-1 rounded border border-slate-600">主峰 (4.2m)</div>
                            </div>
                        </EditableImage>
                     </div>

                     {/* Results Table */}
                     <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-gray-50 dark:bg-surface-dark-lighter px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">积分结果</h3>
                            <span className="text-[10px] text-gray-500">检测到 3 个峰</span>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-surface-dark-lighter text-[10px] uppercase text-gray-500 font-semibold sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">名称</th>
                                        <th className="px-4 py-2 text-right">保留时间</th>
                                        <th className="px-4 py-2 text-right">面积</th>
                                        <th className="px-4 py-2 text-right">高度</th>
                                        <th className="px-4 py-2 text-right">面积 %</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 dark:text-gray-300 text-xs divide-y divide-gray-100 dark:divide-gray-800">
                                    <tr>
                                        <td className="px-4 py-2 text-blue-500">杂质 A</td>
                                        <td className="px-4 py-2 text-right font-mono">1.82</td>
                                        <td className="px-4 py-2 text-right font-mono">12.5</td>
                                        <td className="px-4 py-2 text-right font-mono">4.1</td>
                                        <td className="px-4 py-2 text-right font-mono">0.2%</td>
                                    </tr>
                                    <tr className="bg-primary/5">
                                        <td className="px-4 py-2 font-bold text-primary flex items-center gap-2">主峰 <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded">通过</span></td>
                                        <td className="px-4 py-2 text-right font-mono font-bold">4.20</td>
                                        <td className="px-4 py-2 text-right font-mono font-bold">4820.2</td>
                                        <td className="px-4 py-2 text-right font-mono font-bold">850.5</td>
                                        <td className="px-4 py-2 text-right font-mono font-bold">98.5%</td>
                                    </tr>
                                     <tr>
                                        <td className="px-4 py-2 text-blue-500">杂质 B</td>
                                        <td className="px-4 py-2 text-right font-mono">6.85</td>
                                        <td className="px-4 py-2 text-right font-mono">45.2</td>
                                        <td className="px-4 py-2 text-right font-mono">12.8</td>
                                        <td className="px-4 py-2 text-right font-mono">1.3%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                     </div>
                </section>
            </main>

            {/* Compliance Sidebar */}
            <aside className="w-72 bg-gray-50 dark:bg-[#131920] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 p-4">
                 <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">合规状态</h3>
                 <div className="flex items-center space-x-2 mb-6">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-4/5 rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-yellow-500">80%</span>
                 </div>
                 
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase">ALCOA+ 检查清单</h4>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <span className="material-icons text-green-500 text-sm">check_circle</span>
                            <div>
                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">仪器检查</p>
                                <p className="text-[10px] text-gray-500">验证 ID: AGILENT-1100</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="material-icons text-yellow-500 text-sm animate-pulse">radio_button_unchecked</span>
                            <div>
                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">流动相 pH</p>
                                <p className="text-[10px] text-red-400">要求: 输入值 2-8</p>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="bg-surface-dark rounded p-3 text-center mb-2">
                        <p className="text-[10px] text-gray-400 mb-2">根据 21 CFR Part 11 需要电子签名</p>
                        <button disabled className="w-full py-2 bg-gray-700 text-gray-400 rounded text-xs font-bold cursor-not-allowed transition-all">签署并锁定</button>
                    </div>
                 </div>
            </aside>
        </div>
    );
};