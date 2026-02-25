import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuditRecord {
    id: string;
    timestamp: string;
    actor: {
        name: string;
        role: string;
        initials: string;
    };
    action: {
        category: 'security' | 'data' | 'system' | 'signature';
        name: string;
        icon: string;
        color: string;
    };
    target: {
        type: string;
        id: string;
    };
    details: string;
    changes?: {
        field: string;
        old: string;
        new: string;
    }[];
    meta: {
        ip: string;
        hash: string;
        status: 'verified' | 'tampered';
    };
}

const MOCK_LOGS: AuditRecord[] = [
    {
        id: 'evt-99238',
        timestamp: '2023-10-27 14:35:22',
        actor: { name: 'Sarah Chen 博士', role: '高级科学家', initials: 'SC' },
        action: { category: 'signature', name: '签署记录', icon: 'history_edu', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
        target: { type: 'Experiment', id: 'EXP-2023-889' },
        details: '用户对实验记录进行了电子签名（批准）。',
        meta: { ip: '192.168.1.104', hash: '8d969eef6ecad3c29a3a629280e686cf', status: 'verified' }
    },
    {
        id: 'evt-99237',
        timestamp: '2023-10-27 14:10:05',
        actor: { name: 'Sarah Chen 博士', role: '高级科学家', initials: 'SC' },
        action: { category: 'data', name: '修改步骤', icon: 'edit', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
        target: { type: 'Step', id: 'step-1' },
        details: '更新了步骤 1 的观察记录字段。',
        changes: [
            { field: 'observations', old: '称量过程正常。', new: '称量过程顺利，天平型号：XS-204。' }
        ],
        meta: { ip: '192.168.1.104', hash: '7c229eef6ecad3c29a3a629280e681ab', status: 'verified' }
    },
    {
        id: 'evt-99236',
        timestamp: '2023-10-27 10:45:00',
        actor: { name: 'David Wu', role: '质量控制 (QC)', initials: 'DW' },
        action: { category: 'system', name: '库存变动', icon: 'inventory_2', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
        target: { type: 'Inventory', id: 'INT-9022' },
        details: '登记了新批次甲醇的使用记录。',
        changes: [
            { field: 'quantity', old: '2.55 L', new: '2.50 L' }
        ],
        meta: { ip: '192.168.1.110', hash: '1a969eef6ecad3c29a3a629280e686cf', status: 'verified' }
    },
    {
        id: 'evt-99235',
        timestamp: '2023-10-27 09:00:12',
        actor: { name: 'System Admin', role: '系统管理员', initials: 'AD' },
        action: { category: 'security', name: '权限变更', icon: 'admin_panel_settings', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
        target: { type: 'UserRole', id: 'Role-QA' },
        details: '修改了 QA 角色的默认权限集。',
        changes: [
            { field: 'permissions', old: '[view_exp, approve_exp]', new: '[view_exp, approve_exp, manage_inv]' }
        ],
        meta: { ip: '10.0.0.5', hash: '9b969eef6ecad3c29a3a629280e686ff', status: 'verified' }
    },
    {
        id: 'evt-99234',
        timestamp: '2023-10-27 08:55:00',
        actor: { name: '未知用户', role: 'N/A', initials: 'UN' },
        action: { category: 'security', name: '登录失败', icon: 'gpp_bad', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
        target: { type: 'Auth', id: 'Session' },
        details: '检测到来自外部 IP 的多次失败登录尝试。',
        meta: { ip: '45.33.22.11', hash: '5f969eef6ecad3c29a3a629280e686aa', status: 'verified' }
    },
];

export const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<AuditRecord[]>(MOCK_LOGS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const { hasPermission } = useAuth();
    const canManage = hasPermission('manage_audit_log');

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };

    const handleArchiveLog = (id: string) => {
        if(confirm("确定要归档此审计记录吗？归档后记录将移至冷存储，不再显示于当前列表中。")) {
            setLogs(current => current.filter(log => log.id !== id));
        }
    };

    const handleBulkArchive = () => {
        alert("已启动归档作业：将迁移 30 天前的记录至长期存储库。");
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.target.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || log.action.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex h-full bg-background-light dark:bg-background-dark overflow-hidden flex-col">
            {/* Header Toolbar */}
            <header className="px-6 py-4 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons text-primary">fact_check</span>
                        系统审计日志
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-tight">21 CFR Part 11 Compliant Audit Trail</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {['all', 'data', 'security', 'signature'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${
                                    filterCategory === cat 
                                    ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {cat === 'all' ? '全部' : cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-64"
                            placeholder="搜索事件 ID, 用户或详情..."
                        />
                    </div>
                    {canManage && (
                        <button 
                            onClick={handleBulkArchive}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all hover:text-amber-600"
                        >
                            <span className="material-icons text-sm">inventory_2</span> 归档旧记录
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">
                        <span className="material-icons text-sm">download</span> 导出 CSV
                    </button>
                </div>
            </header>

            {/* Data Table */}
            <div className="flex-1 overflow-auto p-6">
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden min-w-[1000px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-surface-dark-lighter text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 w-12"></th>
                                <th className="px-6 py-4">时间戳 (UTC+8)</th>
                                <th className="px-6 py-4">操作用户</th>
                                <th className="px-6 py-4">动作类别</th>
                                <th className="px-6 py-4">目标对象</th>
                                <th className="px-6 py-4">事件详情</th>
                                <th className="px-6 py-4 text-right">完整性哈希</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {filteredLogs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr 
                                        onClick={() => toggleRow(log.id)}
                                        className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${expandedRows.has(log.id) ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <span className={`material-icons text-slate-400 text-sm transition-transform ${expandedRows.has(log.id) ? 'rotate-90' : ''}`}>chevron_right</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {log.actor.initials}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-xs">{log.actor.name}</p>
                                                    <p className="text-[10px] text-slate-500">{log.actor.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${log.action.color}`}>
                                                <span className="material-icons text-[14px]">{log.action.icon}</span>
                                                {log.action.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.target.id}</span>
                                                <span className="text-[10px] text-slate-400 uppercase">{log.target.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                                                    <span className="material-icons text-[12px]">verified</span>
                                                    <span className="text-[9px] font-bold uppercase">Verified</span>
                                                </div>
                                                <span className="font-mono text-[9px] text-slate-400">{log.meta.hash.substring(0, 8)}...</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Expanded Details Row */}
                                    {expandedRows.has(log.id) && (
                                        <tr className="bg-slate-50 dark:bg-slate-800/30 shadow-inner">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="pl-12 grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                                                    {/* Individual Archive Action (Positioned absolute top right of the expanded area) */}
                                                    {canManage && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleArchiveLog(log.id); }}
                                                            className="absolute top-0 right-0 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"
                                                        >
                                                            <span className="material-icons text-sm">archive</span>
                                                            单独归档
                                                        </button>
                                                    )}

                                                    {/* Technical Meta */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <span className="material-icons text-sm">terminal</span>
                                                            技术元数据
                                                        </h4>
                                                        <div className="bg-white dark:bg-surface-dark-lighter rounded-lg border border-slate-200 dark:border-slate-700 p-4 font-mono text-xs space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Event ID:</span>
                                                                <span className="text-slate-900 dark:text-white select-all">{log.id}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Client IP:</span>
                                                                <span className="text-slate-900 dark:text-white select-all">{log.meta.ip}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Full Hash:</span>
                                                                <span className="text-slate-900 dark:text-white break-all select-all">{log.meta.hash}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Changes Diff */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <span className="material-icons text-sm">difference</span>
                                                            变更详情 (Diff)
                                                        </h4>
                                                        {log.changes && log.changes.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {log.changes.map((change, idx) => (
                                                                    <div key={idx} className="bg-white dark:bg-surface-dark-lighter rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                                        <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase">
                                                                            Field: {change.field}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 text-xs divide-x divide-slate-100 dark:divide-slate-700">
                                                                            <div className="p-3 bg-red-50/50 dark:bg-red-900/10">
                                                                                <span className="block text-[9px] text-red-400 uppercase mb-1">Before</span>
                                                                                <span className="text-red-700 dark:text-red-300 line-through decoration-red-300">{change.old}</span>
                                                                            </div>
                                                                            <div className="p-3 bg-green-50/50 dark:bg-green-900/10">
                                                                                <span className="block text-[9px] text-green-500 uppercase mb-1">After</span>
                                                                                <span className="text-green-700 dark:text-green-300">{change.new}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-xs italic">
                                                                无字段级数据变更
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                        End of Records • System Integrity Check Passed at {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>
    );
};