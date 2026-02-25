import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EditableText } from '../components/Editable';

type SettingsTab = 'general' | 'compliance' | 'instruments' | 'team' | 'storage';

interface Permission {
    id: string;
    label: string;
    description: string;
}

interface Role {
    id: string;
    name: string;
    permissions: string[];
}

interface TeamMember {
    id: string;
    name: string;
    roleId: string;
    email: string;
    status: '活跃' | '离职' | '暂停';
    lastActive: string;
}

interface Instrument {
    id: string;
    name: string;
    type: string;
    serial: string;
    status: '在线' | '维护中' | '离线' | '校准过期';
    connection: 'wifi' | 'lan' | 'disconnected';
    lastCalibration: string;
    nextCalibration: string;
    location: string;
}

const PERMISSIONS: Permission[] = [
    { id: 'view_exp', label: '查看实验记录', description: '可以查阅所有授权项目的实验内容' },
    { id: 'edit_exp', label: '编辑实验记录', description: '可以创建和修改自己负责的实验步骤' },
    { id: 'sign_exp', label: '电子签名权限', description: '具有 21 CFR Part 11 法律效力的签署权' },
    { id: 'approve_exp', label: '审核/批准权限', description: '作为 QA 或主管审核并锁定他人记录' },
    { id: 'manage_inv', label: '库存管理', description: '增删改试剂耗材库存及物料批次' },
    { id: 'sys_admin', label: '系统管理', description: '管理用户、配置系统参数及查看全局审计日志' },
];

const INITIAL_ROLES: Role[] = [
    { id: 'r1', name: '高级科学家', permissions: ['view_exp', 'edit_exp', 'sign_exp', 'manage_inv'] },
    { id: 'r2', name: '质量保证 (QA)', permissions: ['view_exp', 'approve_exp', 'sign_exp', 'sys_admin'] },
    { id: 'r3', name: '实验员', permissions: ['view_exp', 'edit_exp'] },
    { id: 'r4', name: '系统管理员', permissions: ['sys_admin', 'view_exp'] },
];

const INITIAL_MEMBERS: TeamMember[] = [
    { id: 'm1', name: 'Sarah Chen 博士', roleId: 'r1', email: 'sarah.c@helix.bio', status: '活跃', lastActive: '10 分钟前' },
    { id: 'm2', name: 'David Wu', roleId: 'r2', email: 'david.w@helix.bio', status: '活跃', lastActive: '2 小时前' },
    { id: 'm3', name: 'Admin', roleId: 'r4', email: 'admin@helix.bio', status: '活跃', lastActive: '在线' },
];

const INITIAL_INSTRUMENTS: Instrument[] = [
    { id: 'INST-001', name: 'Agilent 1260 Infinity II', type: 'HPLC', serial: 'DE6432091', status: '在线', connection: 'lan', lastCalibration: '2023-01-15', nextCalibration: '2024-01-15', location: '实验室 A - 01' },
    { id: 'INST-002', name: 'Mettler Toledo XPR', type: '分析天平', serial: 'B01928374', status: '在线', connection: 'wifi', lastCalibration: '2023-06-20', nextCalibration: '2023-12-20', location: '称量室 1' },
    { id: 'INST-003', name: 'Thermo Fisher Vanquish', type: 'UHPLC', serial: 'US99887766', status: '维护中', connection: 'lan', lastCalibration: '2022-10-30', nextCalibration: '2023-10-30', location: '实验室 B - 04' },
    { id: 'INST-004', name: 'Shimadzu UV-1900i', type: '紫外分光光度计', serial: 'JP112233', status: '校准过期', connection: 'disconnected', lastCalibration: '2022-09-01', nextCalibration: '2023-09-01', location: '实验室 A - 02' },
];

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [teamSubTab, setTeamSubTab] = useState<'members' | 'roles'>('members');
    const [isSaving, setIsSaving] = useState(false);
    const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
    const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
    const [instruments, setInstruments] = useState<Instrument[]>(INITIAL_INSTRUMENTS);
    const [instrumentSearch, setInstrumentSearch] = useState('');
    
    // Instrument Modal State
    const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
    const [currentInstrument, setCurrentInstrument] = useState<Partial<Instrument>>({});

    const tabs: { id: SettingsTab; label: string; icon: string }[] = [
        { id: 'general', label: '通用设置', icon: 'settings' },
        { id: 'compliance', label: '合规与安全', icon: 'gavel' },
        { id: 'instruments', label: '仪器管理', icon: 'biotech' },
        { id: 'team', label: '团队权限', icon: 'group' },
        { id: 'storage', label: '数据存储', icon: 'storage' },
    ];

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    const updateMemberRole = (memberId: string, roleId: string) => {
        setMembers(members.map(m => m.id === memberId ? { ...m, roleId } : m));
    };

    const togglePermission = (roleId: string, permId: string) => {
        setRoles(roles.map(r => {
            if (r.id !== roleId) return r;
            const newPerms = r.permissions.includes(permId)
                ? r.permissions.filter(p => p !== permId)
                : [...r.permissions, permId];
            return { ...r, permissions: newPerms };
        }));
    };

    const handleInstrumentDelete = (id: string) => {
        if(confirm('确定要移除此仪器吗？此操作将记录在审计日志中。')) {
            setInstruments(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleInstrumentCalibrate = (id: string) => {
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const next = nextYear.toISOString().split('T')[0];
        
        setInstruments(prev => prev.map(i => i.id === id ? {
            ...i, 
            lastCalibration: today, 
            nextCalibration: next,
            status: '在线'
        } : i));
        alert(`仪器 ${id} 校准已记录。下次校准日期：${next}`);
    };

    const openInstrumentModal = (inst?: Instrument) => {
        if (inst) {
            setCurrentInstrument(inst);
        } else {
            setCurrentInstrument({
                id: `INST-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                status: '在线',
                connection: 'disconnected',
                lastCalibration: new Date().toISOString().split('T')[0],
                nextCalibration: '',
                type: '通用设备'
            });
        }
        setIsInstrumentModalOpen(true);
    };

    const saveInstrument = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newInst: Instrument = {
            id: currentInstrument.id || `INST-${Date.now()}`,
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            serial: formData.get('serial') as string,
            location: formData.get('location') as string,
            status: (formData.get('status') as any) || '在线',
            connection: (formData.get('connection') as any) || 'disconnected',
            lastCalibration: formData.get('lastCalibration') as string,
            nextCalibration: formData.get('nextCalibration') as string,
        };

        if (instruments.find(i => i.id === newInst.id)) {
            setInstruments(prev => prev.map(i => i.id === newInst.id ? newInst : i));
        } else {
            setInstruments(prev => [...prev, newInst]);
        }
        setIsInstrumentModalOpen(false);
    };

    const filteredInstruments = instruments.filter(inst => 
        inst.name.toLowerCase().includes(instrumentSearch.toLowerCase()) || 
        inst.serial.toLowerCase().includes(instrumentSearch.toLowerCase()) ||
        inst.id.toLowerCase().includes(instrumentSearch.toLowerCase())
    );

    return (
        <div className="flex h-full bg-[#f8fafc] dark:bg-[#0f1115] overflow-hidden relative">
            {/* Sub-navigation Sidebar */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex flex-col shrink-0">
                <div className="p-6">
                    <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">系统配置</h2>
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                                    ${activeTab === tab.id 
                                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-icons text-[20px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">系统版本</p>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-300">v4.2.0-stable</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                <header className="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700"></span>
                        <p className="text-xs text-slate-400">管理您的实验室环境与合规策略</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span className="material-icons text-sm animate-spin">refresh</span>
                        ) : (
                            <span className="material-icons text-sm">save</span>
                        )}
                        {isSaving ? '正在保存...' : '应用更改'}
                    </button>
                </header>

                <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 pb-4 flex items-center gap-2">
                                    <span className="material-icons text-primary text-lg">business</span>
                                    实验室信息
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">实验室名称</label>
                                        <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" defaultValue="核心药物研发实验室" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">所属组织</label>
                                        <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" defaultValue="Helix Bio-Pharmaceuticals" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'compliance' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-icons text-amber-500 text-lg">verified_user</span>
                                        21 CFR Part 11 强制执行
                                    </h3>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'instruments' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center">
                                <div className="relative w-64">
                                    <span className="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                                    <input 
                                        value={instrumentSearch}
                                        onChange={(e) => setInstrumentSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary" 
                                        placeholder="搜索仪器名称、ID或序列号..." 
                                    />
                                </div>
                                <button 
                                    onClick={() => openInstrumentModal()}
                                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg hover:bg-primary-hover flex items-center gap-2 transition-all"
                                >
                                    <span className="material-icons text-sm">add_circle</span> 注册新仪器
                                </button>
                            </div>

                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">仪器信息</th>
                                            <th className="px-6 py-4">型号 / 序列号</th>
                                            <th className="px-6 py-4">连接状态</th>
                                            <th className="px-6 py-4">校准周期</th>
                                            <th className="px-6 py-4">状态</th>
                                            <th className="px-6 py-4 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {filteredInstruments.map((inst) => (
                                            <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            <span className="material-icons text-sm">
                                                                {inst.type.includes('天平') ? 'scale' : 
                                                                 inst.type.includes('HPLC') ? 'analytics' : 
                                                                 inst.type.includes('光度计') ? 'light_mode' : 'science'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{inst.name}</p>
                                                            <p className="text-[10px] text-slate-500">{inst.location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{inst.type}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">SN: {inst.serial}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {inst.connection === 'disconnected' ? (
                                                        <span className="text-slate-400 flex items-center gap-1 text-[10px] font-bold uppercase">
                                                            <span className="material-icons text-sm">wifi_off</span> 无连接
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold uppercase">
                                                            <span className="material-icons text-sm">{inst.connection === 'wifi' ? 'wifi' : 'lan'}</span> 已连接
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] text-slate-400 uppercase">上次: {inst.lastCalibration}</p>
                                                        <p className={`text-xs font-bold ${
                                                            inst.status === '校准过期' ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'
                                                        }`}>
                                                            下次: {inst.nextCalibration}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                                        inst.status === '在线' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' :
                                                        inst.status === '维护中' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
                                                    }`}>
                                                        {inst.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => openInstrumentModal(inst)}
                                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="编辑详情"
                                                        >
                                                            <span className="material-icons text-sm">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleInstrumentCalibrate(inst.id)}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="记录校准"
                                                        >
                                                            <span className="material-icons text-sm">build</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleInstrumentDelete(inst.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="停用仪器"
                                                        >
                                                            <span className="material-icons text-sm">power_settings_new</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Team Sub-tabs */}
                            <div className="flex border-b border-slate-200 dark:border-slate-800">
                                <button 
                                    onClick={() => setTeamSubTab('members')}
                                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${teamSubTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    成员管理
                                </button>
                                <button 
                                    onClick={() => setTeamSubTab('roles')}
                                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${teamSubTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    角色与权限定义
                                </button>
                            </div>

                            {teamSubTab === 'members' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="relative w-64">
                                            <span className="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                                            <input className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none" placeholder="搜索成员姓名或邮箱..." />
                                        </div>
                                        <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg hover:bg-primary-hover flex items-center gap-2">
                                            <span className="material-icons text-sm">person_add</span> 邀请新成员
                                        </button>
                                    </div>

                                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                                <tr>
                                                    <th className="px-6 py-4">姓名 / 邮箱</th>
                                                    <th className="px-6 py-4">分配角色</th>
                                                    <th className="px-6 py-4">状态</th>
                                                    <th className="px-6 py-4">最后在线</th>
                                                    <th className="px-6 py-4 text-right">操作</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {members.map((member) => (
                                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                                    {member.name.substring(0, 1)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{member.name}</p>
                                                                    <p className="text-[10px] text-slate-400">{member.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select 
                                                                value={member.roleId} 
                                                                onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                                                className="bg-slate-50 dark:bg-slate-800 border-none rounded text-xs font-bold text-slate-600 dark:text-slate-300 py-1 pl-2 pr-8"
                                                            >
                                                                {roles.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase">
                                                                {member.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                                                            {member.lastActive}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-slate-400 hover:text-red-500 transition-colors">
                                                                <span className="material-icons text-sm">person_remove</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {teamSubTab === 'roles' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 gap-6">
                                        {roles.map((role) => (
                                            <section key={role.id} className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30 group">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                            <span className="material-icons text-lg">admin_panel_settings</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{role.name}</h4>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">角色 ID: {role.id}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest px-3 py-1.5 rounded border border-transparent hover:border-slate-200">编辑角色名</button>
                                                        {role.id !== 'r4' && (
                                                            <button className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest px-3 py-1.5 rounded border border-transparent hover:border-slate-200">删除角色</button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {PERMISSIONS.map((perm) => (
                                                        <label 
                                                            key={perm.id} 
                                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                                                ${role.permissions.includes(perm.id) 
                                                                    ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/5' 
                                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
                                                        >
                                                            <div className="pt-0.5">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={role.permissions.includes(perm.id)}
                                                                    onChange={() => togglePermission(role.id, perm.id)}
                                                                    className="w-4 h-4 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-bold ${role.permissions.includes(perm.id) ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{perm.label}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{perm.description}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </section>
                                        ))}

                                        <button className="py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                            <span className="material-icons text-3xl mb-2 group-hover:scale-110 transition-transform">add_moderator</span>
                                            <span className="text-xs font-bold uppercase tracking-widest">创建自定义实验室角色</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 pb-4 flex items-center gap-2">
                                    <span className="material-icons text-primary text-lg">cloud_sync</span>
                                    自动备份与同步
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">云端冗余备份</p>
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">备份频率</p>
                                        <select className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none rounded">
                                            <option>每 10 分钟</option>
                                            <option>每小时</option>
                                            <option>每天</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {/* Instrument Modal */}
            {isInstrumentModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-surface-dark-lighter">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary">biotech</span>
                                {currentInstrument.name ? '编辑仪器' : '注册新仪器'}
                            </h3>
                            <button onClick={() => setIsInstrumentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <form onSubmit={saveInstrument} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">仪器名称</label>
                                    <input name="name" required defaultValue={currentInstrument.name} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="例如: HPLC-01" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">类型</label>
                                    <input name="type" required defaultValue={currentInstrument.type} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="例如: HPLC" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">序列号 (SN)</label>
                                    <input name="serial" required defaultValue={currentInstrument.serial} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">位置</label>
                                    <input name="location" required defaultValue={currentInstrument.location} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">状态</label>
                                    <select name="status" defaultValue={currentInstrument.status} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                                        <option value="在线">在线</option>
                                        <option value="维护中">维护中</option>
                                        <option value="离线">离线</option>
                                        <option value="校准过期">校准过期</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">连接方式</label>
                                    <select name="connection" defaultValue={currentInstrument.connection} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                                        <option value="lan">LAN (有线)</option>
                                        <option value="wifi">WiFi</option>
                                        <option value="disconnected">无连接</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">上次校准</label>
                                    <input type="date" name="lastCalibration" defaultValue={currentInstrument.lastCalibration} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">下次校准</label>
                                    <input type="date" name="nextCalibration" defaultValue={currentInstrument.nextCalibration} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsInstrumentModalOpen(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">取消</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-colors">保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};