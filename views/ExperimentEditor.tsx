import React, { useState, useRef, useEffect } from 'react';
import { SignatureModal } from '../components/SignatureModal';
import { EditableText, EditableImage } from '../components/Editable';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';
import { useNotification } from '../context/NotificationContext';

// --- Interfaces ---

interface Project {
    id: string;
    parentId?: string; // Support for nested projects
    title: string;
    description: string;
    createdDate: string;
    status: 'active' | 'archived' | 'completed';
    owner: string;
    color: string;
}

interface ExperimentMetadata {
    id: string;
    projectId: string; // Foreign key to Project
    title: string;
    status: '进行中' | '审核中' | '已完成' | '草稿';
    author: string;
    lastModified: string;
    progress: number;
    description: string;
}

interface Attachment {
    id: string;
    name: string;
    size: string;
    type: string;
    date: string;
    uploader: string;
    data?: string; 
}

interface Step {
    id: string;
    title: string;
    content: string;
    observations?: string;
    attachments?: Attachment[];
    timestamp?: string;
    isCurrent?: boolean;
}

interface HistoryItem {
    id: string;
    time: string;
    user: string;
    role: string;
    action: string;
    desc: string;
    icon: string;
    color: string;
    hash?: string;
}

interface StepTemplate {
    id: string;
    title: string;
    description: string;
    content: string;
    icon: string;
}

// BOM Interfaces
interface BOMItem {
    name: string;
    quantity: string;
    catalog: string;
}

interface BOMTemplate {
    id: string;
    title: string;
    description: string;
    items: BOMItem[];
}

// --- Mock Data ---

const MOCK_PROJECTS: Project[] = [
    { id: 'PROJ-001', title: 'Project Alpha: 抗癌药物研发', description: '针对新型靶点 X 的小分子抑制剂筛选与合成优化。', createdDate: '2023-01-10', status: 'active', owner: 'Sarah Chen', color: 'bg-blue-500' },
    { id: 'PROJ-SUB-01', parentId: 'PROJ-001', title: 'Phase 1: 靶点验证', description: '确认靶点 X 在模型细胞中的表达与活性。', createdDate: '2023-02-15', status: 'completed', owner: 'Sarah Chen', color: 'bg-indigo-500' },
    { id: 'PROJ-002', title: 'Stability Q4: 稳定性研究', description: '2023年第四季度核心产品稳定性及降解产物分析。', createdDate: '2023-09-01', status: 'active', owner: 'David Wu', color: 'bg-emerald-500' },
    { id: 'PROJ-003', title: 'Green Chem: 催化剂回收', description: '探索可持续的贵金属催化剂回收工艺以降低成本。', createdDate: '2023-05-20', status: 'completed', owner: 'Sarah Chen', color: 'bg-amber-500' },
];

const MOCK_EXPERIMENTS: ExperimentMetadata[] = [
    { id: 'EXP-2023-889', projectId: 'PROJ-001', title: '化合物-AX 合成路径验证', status: '审核中', author: 'Sarah Chen', lastModified: '10 分钟前', progress: 100, description: '针对 AX 化合物的新型催化合成路径验证。' },
    { id: 'EXP-2023-890', projectId: 'PROJ-002', title: 'pH 4.0 缓冲液稳定性测试', status: '进行中', author: 'Sarah Chen', lastModified: '2 小时前', progress: 45, description: '评估不同 pH 环境下溶剂的降解速率。' },
    { id: 'EXP-2023-892', projectId: 'PROJ-001', title: '批次 B-992 杂质 HPLC 分析', status: '草稿', author: 'David Wu', lastModified: '1 天前', progress: 10, description: 'HPLC 分析未名杂质峰。' },
    { id: 'EXP-2023-885', projectId: 'PROJ-003', title: '钯催化剂循环效率测试', status: '已完成', author: 'Sarah Chen', lastModified: '3 天前', progress: 100, description: '钯催化剂的循环使用效率测试。' },
    { id: 'EXP-2023-999', projectId: 'PROJ-SUB-01', title: 'Western Blot 靶点表达', status: '已完成', author: 'Sarah Chen', lastModified: '2 个月前', progress: 100, description: 'WB 实验验证蛋白表达水平。' },
];

const INITIAL_TEMPLATES: StepTemplate[] = [
    {
        id: 'prep',
        title: '试剂准备与称量',
        description: '记录起始原料的批号、质量及称量准确度。',
        icon: 'scale',
        content: '物料名称: [请输入]\n批号: [请输入]\n理论量: \n实际称取量: \n天平编号: \n\n备注: 检查外观是否符合要求。'
    },
    {
        id: 'reaction',
        title: '反应过程监控',
        description: '记录反应温度、压力及搅拌速度的实时变化。',
        icon: 'rebase_edit',
        content: '设定温度: \n实时温度: \n搅拌速度: [RPM]\n观察到的现象: \n\nTLC 监控结果: '
    },
    {
        id: 'analysis',
        title: '分析取样',
        description: '记录取样时间、样号及送样目的。',
        icon: 'query_stats',
        content: '取样点: \n样号: \n分析项目: \n取样量: \n\n外观描述: '
    }
];

const INITIAL_BOMS: BOMTemplate[] = [
    {
        id: 'bom-pcr',
        title: '标准 PCR 反应体系',
        description: '50µL 体系，包含 Taq 酶、dNTPs、引物。',
        items: [
            { name: 'Taq Polymerase', quantity: '0.5 µL', catalog: 'M0273' },
            { name: '10X PCR Buffer', quantity: '5 µL', catalog: 'B9014' },
            { name: 'dNTP Mix (10mM)', quantity: '1 µL', catalog: 'N0447' },
            { name: 'Template DNA', quantity: '< 1 µg', catalog: 'N/A' },
            { name: 'Nuclease-free Water', quantity: 'to 50 µL', catalog: 'N/A' }
        ]
    },
    {
        id: 'bom-media',
        title: 'DMEM 细胞培养基 (完全)',
        description: '含 10% FBS 和 1% 双抗。',
        items: [
            { name: 'DMEM High Glucose', quantity: '445 mL', catalog: '11965' },
            { name: 'FBS', quantity: '50 mL', catalog: '10099' },
            { name: 'Pen-Strep', quantity: '5 mL', catalog: '15140' }
        ]
    }
];

// --- Main Controller Component ---

export const ExperimentEditor: React.FC = () => {
    const { addNotification } = useNotification();
    const { hasPermission } = useAuth();
    const [activeExperimentId, setActiveExperimentId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [experiments, setExperiments] = useState<ExperimentMetadata[]>(MOCK_EXPERIMENTS);
    
    useEffect(() => {
        // Simulate checking for upcoming deadlines
        const activeExp = experiments.find(e => e.status === '进行中');
        if (activeExp) {
            const key = `deadline_notified_${activeExp.id}`;
            if (!sessionStorage.getItem(key)) {
                // Delay slightly to not overwhelm on load
                setTimeout(() => {
                    addNotification({
                        type: 'info',
                        title: '实验进度提醒',
                        message: `实验 "${activeExp.title}" 距离预定节点还有 2 小时。`,
                        actionLabel: '查看',
                        onAction: () => setActiveExperimentId(activeExp.id)
                    });
                    sessionStorage.setItem(key, 'true');
                }, 1500);
            }
        }
    }, []);

    // Manage expanded state for projects (can have multiple open)
    const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set([MOCK_PROJECTS[0].id]));

    // Navigation Handlers
    const toggleProjectExpansion = (projectId: string) => {
        const newSet = new Set(expandedProjectIds);
        if (newSet.has(projectId)) {
            newSet.delete(projectId);
        } else {
            newSet.add(projectId);
        }
        setExpandedProjectIds(newSet);
    };

    const goToExperiment = (experimentId: string) => {
        setActiveExperimentId(experimentId);
    };

    const goBackToDashboard = () => {
        setActiveExperimentId(null);
    };

    const createProject = (parentId?: string) => {
        if (!hasPermission('create_experiment')) {
            addNotification({ type: 'error', title: '权限不足', message: '您没有创建项目的权限。', timestamp: Date.now(), read: false });
            return;
        }
        const newId = `PROJ-${Math.floor(Math.random() * 10000)}`;
        const newProj: Project = {
            id: newId,
            parentId: parentId,
            title: parentId ? '新子项目' : '新立项研发项目',
            description: '请点击编辑项目描述...',
            createdDate: new Date().toISOString().split('T')[0],
            status: 'active',
            owner: '当前用户',
            color: parentId ? 'bg-slate-500' : 'bg-indigo-500' // Default colors
        };
        setProjects([...projects, newProj]);
        // Auto expand the new project (and ensure parent is expanded if sub-project)
        const newExpanded = new Set(expandedProjectIds);
        newExpanded.add(newId);
        if (parentId) newExpanded.add(parentId);
        setExpandedProjectIds(newExpanded);
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        if (!hasPermission('edit_experiment')) return; // Reusing edit_experiment for project editing
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProject = (id: string) => {
        if (!hasPermission('delete_experiment')) {
            addNotification({ type: 'error', title: '权限不足', message: '您没有删除项目的权限。', timestamp: Date.now(), read: false });
            return;
        }
        if (confirm('确定要删除此项目及其所有子项目吗？此操作不可恢复。')) {
            // Helper to recursively find all child IDs
            const getIdsToDelete = (currentId: string, allProjects: Project[]): string[] => {
                const children = allProjects.filter(p => p.parentId === currentId);
                let ids = [currentId];
                children.forEach(child => {
                    ids = [...ids, ...getIdsToDelete(child.id, allProjects)];
                });
                return ids;
            };

            const targetIds = getIdsToDelete(id, projects);
            
            // 1. Remove projects
            setProjects(prev => prev.filter(p => !targetIds.includes(p.id)));
            
            // 2. Remove related experiments (optional but recommended)
            setExperiments(prev => prev.filter(e => !targetIds.includes(e.projectId)));
            
            // 3. Cleanup expanded states
            setExpandedProjectIds(prev => {
                const next = new Set(prev);
                targetIds.forEach(tid => next.delete(tid));
                return next;
            });
        }
    };

    const createExperiment = (projectId: string) => {
        if (!hasPermission('create_experiment')) {
            addNotification({ type: 'error', title: '权限不足', message: '您没有创建实验的权限。', timestamp: Date.now(), read: false });
            return;
        }
        const newExp: ExperimentMetadata = {
            id: `EXP-2023-${Math.floor(Math.random() * 10000)}`,
            projectId: projectId,
            title: '新实验记录',
            status: '草稿',
            author: '当前用户',
            lastModified: '刚刚',
            progress: 0,
            description: '在此输入实验摘要...'
        };
        // Add new experiment to the end of the list
        setExperiments([...experiments, newExp]);
    };

    // Render Logic: Single Experiment Editor
    if (activeExperimentId) {
        const exp = experiments.find(e => e.id === activeExperimentId);
        const proj = projects.find(p => p.id === exp?.projectId);
        if (exp && proj) {
            return (
                <SingleExperimentEditor 
                    metadata={exp} 
                    project={proj}
                    onBack={goBackToDashboard}
                    onUpdateTitle={(t) => setExperiments(prev => prev.map(e => e.id === exp.id ? { ...e, title: t } : e))}
                />
            );
        }
    }

    // Default: Collapsible Projects Dashboard
    return (
        <ProjectsDashboard 
            projects={projects} 
            experiments={experiments}
            expandedIds={expandedProjectIds}
            onToggleProject={toggleProjectExpansion}
            onSelectExperiment={goToExperiment}
            onCreateProject={createProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onCreateExperiment={createExperiment}
        />
    );
};

// --- Recursive Project Item Component ---

const ProjectAccordionItem: React.FC<{
    project: Project;
    allProjects: Project[];
    experiments: ExperimentMetadata[];
    expandedIds: Set<string>;
    depth: number;
    onToggle: (id: string) => void;
    onSelectExperiment: (id: string) => void;
    onCreateProject: (parentId?: string) => void;
    onUpdateProject: (id: string, updates: Partial<Project>) => void;
    onDeleteProject: (id: string) => void;
    onCreateExperiment: (projectId: string) => void;
}> = ({ project, allProjects, experiments, expandedIds, depth, onToggle, onSelectExperiment, onCreateProject, onUpdateProject, onDeleteProject, onCreateExperiment }) => {
    const { hasPermission } = useAuth();
    const isExpanded = expandedIds.has(project.id);
    const childProjects = allProjects.filter(p => p.parentId === project.id);
    const projectExperiments = experiments.filter(e => e.projectId === project.id);
    const MAX_DEPTH = 5;

    return (
        <div 
            className={`bg-white dark:bg-surface-dark rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden mb-4 last:mb-0
                ${isExpanded 
                ? 'border-primary/30 shadow-lg ring-1 ring-primary/20' 
                : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30'}
                ${depth > 0 ? 'ml-6 border-l-4 border-l-slate-300 dark:border-l-slate-600' : ''}
            `}
        >
            {/* Project Header Card */}
            <div 
                onClick={(e) => { e.stopPropagation(); onToggle(project.id); }}
                className="p-5 cursor-pointer flex items-start gap-5 group select-none relative"
            >
                {/* Visual Depth Indicator Line (optional, for connecting lines) */}
                {depth > 0 && (
                    <div className="absolute -left-[26px] top-1/2 w-6 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                )}

                {/* Icon Box */}
                <div className={`h-14 w-14 rounded-xl ${project.color} flex items-center justify-center text-white shrink-0 shadow-md transition-transform group-hover:scale-105`}>
                    <span className="material-icons text-2xl">folder</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                            <EditableText 
                                id={`proj-t-${project.id}`} 
                                defaultValue={project.title} 
                                onSave={(val) => onUpdateProject(project.id, { title: val })}
                                readOnly={!hasPermission('edit_experiment')}
                            />
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${
                                project.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                project.status === 'completed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已归档' : '暂停'}
                            </span>
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            {depth > 0 && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mr-2">Level {depth + 1}</span>}
                            
                            {/* Delete Project Button */}
                            {hasPermission('delete_experiment') && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                    className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="删除项目"
                                >
                                    <span className="material-icons text-base">delete_outline</span>
                                </button>
                            )}

                            <button className={`h-7 w-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                                <span className="material-icons text-base">expand_more</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 pr-12">
                        <EditableText 
                            id={`proj-d-${project.id}`} 
                            defaultValue={project.description} 
                            onSave={(val) => onUpdateProject(project.id, { description: val })}
                            readOnly={!hasPermission('edit_experiment')}
                        />
                    </p>
                    
                    {!isExpanded && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                            {childProjects.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500">
                                    <span className="material-icons text-[12px]">account_tree</span>
                                    {childProjects.length} 子项目
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                <span className="material-icons text-[12px]">science</span>
                                {projectExperiments.length} 实验
                            </div>
                            <span className="text-[10px] text-slate-400 ml-auto">Owner: {project.owner}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            <div 
                className={`bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="p-5">
                    
                    {/* 1. Sub-Projects Section */}
                    {(childProjects.length > 0 || depth < MAX_DEPTH) && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-icons text-xs">subdirectory_arrow_right</span>
                                    子项目 ({childProjects.length})
                                </h4>
                                {depth < MAX_DEPTH && hasPermission('create_experiment') && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onCreateProject(project.id); }}
                                        className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-icons text-[12px]">add</span>
                                        新建子项目
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-0">
                                {childProjects.map(child => (
                                    <ProjectAccordionItem 
                                        key={child.id}
                                        project={child}
                                        allProjects={allProjects}
                                        experiments={experiments}
                                        expandedIds={expandedIds}
                                        depth={depth + 1}
                                        onToggle={onToggle}
                                        onSelectExperiment={onSelectExperiment}
                                        onCreateProject={onCreateProject}
                                        onUpdateProject={onUpdateProject}
                                        onDeleteProject={onDeleteProject}
                                        onCreateExperiment={onCreateExperiment}
                                    />
                                ))}
                                {childProjects.length === 0 && (
                                    <div className="p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center text-[10px] text-slate-400 italic">
                                        暂无子项目
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2. Experiments Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-icons text-xs">view_list</span>
                                包含的实验 ({projectExperiments.length})
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {/* Experiment Cards */}
                            {projectExperiments.map(exp => (
                                <div 
                                    key={exp.id}
                                    onClick={(e) => { e.stopPropagation(); onSelectExperiment(exp.id); }}
                                    className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group/card flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                            exp.status === '已完成' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            exp.status === '进行中' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                            {exp.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">{exp.id.split('-').pop()}</span>
                                    </div>
                                    <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1 line-clamp-1 group-hover/card:text-primary transition-colors">{exp.title}</h5>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 h-7 mb-2 leading-relaxed">{exp.description}</p>
                                    <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                                        <span className="flex items-center gap-1"><span className="material-icons text-[10px]">person</span> {exp.author}</span>
                                        <span>{exp.lastModified}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Add Experiment Button */}
                            {hasPermission('create_experiment') && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onCreateExperiment(project.id); }}
                                    className="min-h-[120px] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-transparent hover:bg-white hover:border-primary hover:text-primary text-slate-400 transition-all flex flex-col items-center justify-center group/add"
                                >
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover/add:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
                                        <span className="material-icons text-base">add</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">添加新实验</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Level 1: Expandable Projects Dashboard ---

const ProjectsDashboard: React.FC<{
    projects: Project[];
    experiments: ExperimentMetadata[];
    expandedIds: Set<string>;
    onToggleProject: (id: string) => void;
    onSelectExperiment: (id: string) => void;
    onCreateProject: (parentId?: string) => void;
    onUpdateProject: (id: string, updates: Partial<Project>) => void;
    onDeleteProject: (id: string) => void;
    onCreateExperiment: (projectId: string) => void;
}> = ({ projects, experiments, expandedIds, onToggleProject, onSelectExperiment, onCreateProject, onUpdateProject, onDeleteProject, onCreateExperiment }) => {
    const { hasPermission } = useAuth();
    // Only render root projects (those without parentId) at the top level
    const rootProjects = projects.filter(p => !p.parentId);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1115] overflow-hidden animate-in fade-in duration-300">
            <header className="px-8 py-8 shrink-0">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">项目实验室</h1>
                        <p className="text-sm text-slate-500 mt-2">支持多层级项目管理与实验记录追踪</p>
                    </div>
                    {hasPermission('create_experiment') && (
                        <button 
                            onClick={() => onCreateProject()}
                            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg hover:scale-105 transition-all text-sm font-bold flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">create_new_folder</span>
                            新建根项目
                        </button>
                    )}
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex flex-col max-w-6xl mx-auto pb-20">
                    {rootProjects.map(proj => (
                        <ProjectAccordionItem 
                            key={proj.id}
                            project={proj}
                            allProjects={projects}
                            experiments={experiments}
                            expandedIds={expandedIds}
                            depth={0}
                            onToggle={onToggleProject}
                            onSelectExperiment={onSelectExperiment}
                            onCreateProject={onCreateProject}
                            onUpdateProject={onUpdateProject}
                            onDeleteProject={onDeleteProject}
                            onCreateExperiment={onCreateExperiment}
                        />
                    ))}
                    
                    {/* Add Project Big Button */}
                    {hasPermission('create_experiment') && (
                        <button 
                            onClick={() => onCreateProject()}
                            className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group mt-4"
                        >
                            <span className="material-icons text-3xl group-hover:scale-110 transition-transform">playlist_add</span>
                            <span className="text-sm font-bold uppercase tracking-widest">创建新的项目容器</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Level 3: Single Experiment Editor (Wrapped original logic) ---

const SingleExperimentEditor: React.FC<{ 
    metadata: ExperimentMetadata, 
    project: Project,
    onBack: () => void,
    onUpdateTitle: (t: string) => void
}> = ({ metadata, project, onBack, onUpdateTitle }) => {
    const { user, hasPermission } = useAuth();
    const { edits, updateEdit, isEditing } = useDesign();
    const [isSignatureOpen, setIsSignatureOpen] = useState(false);
    
    const canEdit = hasPermission('edit_experiment');
    
    // Library States
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [libraryTab, setLibraryTab] = useState<'sop' | 'bom'>('sop');
    
    // SOP Template States
    const [isTemplateEditOpen, setIsTemplateEditOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<StepTemplate | null>(null);
    const [templates, setTemplates] = useState<StepTemplate[]>(INITIAL_TEMPLATES);
    
    // BOM Template States
    const [bomTemplates, setBomTemplates] = useState<BOMTemplate[]>(INITIAL_BOMS);
    const [editingBOM, setEditingBOM] = useState<BOMTemplate | null>(null);
    const [isBOMEditOpen, setIsBOMEditOpen] = useState(false);

    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
    const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
    
    // Simulate loading data based on metadata.id
    // In a real app, this would fetch from API
    const [history, setHistory] = useState<HistoryItem[]>([
        { id: 'h1', time: new Date().toLocaleTimeString('zh-CN'), user: "系统", role: "服务器", action: "初始化记录", desc: `实验 ${metadata.id} 已加载。`, icon: "cloud_done", color: "bg-slate-500", hash: "8d969ee...c6c92" },
    ]);

    const [steps, setSteps] = useState<Step[]>(
        metadata.status === '草稿' ? [] : [
        { 
            id: 'step-1', 
            title: '溶液制备', 
            content: '称取 50mg 氯化钠。小心转移至 500mL 锥形瓶中。',
            observations: '称量过程顺利，天平型号：XS-204。',
            attachments: [
                { id: 's1-1', name: '称量原始数据截图.jpg', size: '420 KB', type: 'image/jpeg', date: '2023-10-27', uploader: 'Sarah Chen' }
            ],
            timestamp: '10:15 AM'
        },
        { 
            id: 'step-2', 
            title: '观察与记录', 
            content: '氯化钠呈细白色结晶粉末状。未观察到结块。',
            observations: '溶解速度较快，约 2 分钟完全溶解。',
            attachments: [],
            isCurrent: true,
            timestamp: '10:45 AM'
        }
    ]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stepFileInputRef = useRef<HTMLInputElement>(null);
    const protocolFileInputRef = useRef<HTMLInputElement>(null);
    const [activeStepId, setActiveStepId] = useState<string | null>(null);
    const [protocolFile, setProtocolFile] = useState<Attachment | null>(null);

    const addHistory = (action: string, desc: string, icon: string = "info", color: string = "bg-blue-500") => {
        const newItem: HistoryItem = {
            id: 'h-' + Date.now() + Math.random().toString(36).substr(2, 4),
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            user: user?.name || "未知用户",
            role: user?.role || "访客",
            action,
            desc,
            icon,
            color,
            hash: Math.random().toString(36).substr(2, 10).toUpperCase()
        };
        setHistory(prev => [newItem, ...prev]);
    };

    // ... [File Handling Functions kept same] ...
    const processFiles = (files: FileList, stepId: string) => {
        const newAttachments: Attachment[] = Array.from(files).map((file: File) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
            type: file.type || (file.name.endsWith('.csv') ? 'text/csv' : 'application/octet-stream'),
            date: new Date().toISOString().split('T')[0],
            uploader: user?.name || "未知"
        }));
        
        setSteps(prev => prev.map(s => s.id === stepId ? {
            ...s,
            attachments: [...(s.attachments || []), ...newAttachments]
        } : s));

        const stepTitle = steps.find(s => s.id === stepId)?.title || stepId;
        addHistory("附件上传", `通过拖放或选择为步骤 "${stepTitle}" 上传了 ${newAttachments.length} 个文件`, "cloud_upload", "bg-indigo-500");
    };

    const handleDragOver = (e: React.DragEvent, stepId: string) => {
        e.preventDefault();
        setDragOverStepId(stepId);
    };

    const handleDragLeave = () => {
        setDragOverStepId(null);
    };

    const handleDrop = (e: React.DragEvent, stepId: string) => {
        e.preventDefault();
        setDragOverStepId(null);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files, stepId);
        }
    };

    const handleProtocolFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const fileObj: Attachment = {
                    id: 'prot-' + Date.now(),
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                    type: file.type,
                    date: new Date().toISOString().split('T')[0],
                    uploader: user?.name || "未知",
                    data: reader.result as string
                };
                setProtocolFile(fileObj);
                addHistory("方案上传", `上传了新的实验方案文档: ${file.name}`, "description", "bg-purple-500");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStepFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && activeStepId) {
            processFiles(files, activeStepId);
            setActiveStepId(null);
        }
    };

    const removeStepAttachment = (stepId: string, fileId: string) => {
        const step = steps.find(s => s.id === stepId);
        const fileName = step?.attachments?.find(a => a.id === fileId)?.name;
        setSteps(prev => prev.map(s => s.id === stepId ? {
            ...s,
            attachments: (s.attachments || []).filter(a => a.id !== fileId)
        } : s));
        addHistory("附件删除", `删除了步骤 "${step?.title}" 中的附件: ${fileName}`, "delete_outline", "bg-red-500");
    };

    // --- Step Management ---

    const addStep = (template?: StepTemplate) => {
        const newStep: Step = {
            id: `step-${steps.length + 1}-${Date.now()}`,
            title: template ? template.title : `新步骤 ${steps.length + 1}`,
            content: template ? template.content : '',
            observations: '',
            attachments: [],
        };
        setSteps([...steps, newStep]);
        setIsTemplateModalOpen(false);
        addHistory("添加步骤", `创建了新步骤: ${newStep.title} (${template ? '来自模板库' : '空白步骤'})`, "add_task", "bg-green-500");
    };

    const addBOMStep = (bom: BOMTemplate) => {
        const table = bom.items.map(i => `• ${i.name.padEnd(20)} | ${i.quantity.padEnd(10)} | ${i.catalog}`).join('\n');
        const content = `BOM 引用: ${bom.title}\n描述: ${bom.description}\n\n物料清单:\n名称                 | 数量       | 货号\n---------------------|------------|-----------\n${table}`;
        
        const newStep: Step = {
            id: `step-${steps.length + 1}-${Date.now()}`,
            title: `物料准备: ${bom.title}`,
            content: content,
            observations: '所有物料已核对并称量/移液完毕。',
            attachments: [],
        };
        setSteps([...steps, newStep]);
        setIsTemplateModalOpen(false);
        addHistory("导入 BOM", `导入了物料清单: ${bom.title}`, "inventory_2", "bg-indigo-500");
    };

    const deleteStep = (id: string) => {
        const step = steps.find(s => s.id === id);
        if (confirm(`确定要删除步骤 "${step?.title}" 吗？此操作将记录在审计日志中。`)) {
            setSteps(prev => prev.filter(s => s.id !== id));
            addHistory("删除步骤", `移除了步骤: ${step?.title}`, "delete_forever", "bg-red-600");
        }
    };

    // --- Template Management ---

    const saveTemplate = (templateData: Partial<StepTemplate>) => {
        if (editingTemplate) {
            const updated = templates.map(t => t.id === editingTemplate.id ? { ...t, ...templateData } as StepTemplate : t);
            setTemplates(updated);
            addHistory("管理模板", `更新了 SOP 模板: ${templateData.title}`, "edit_note", "bg-amber-500");
        } else {
            const newT: StepTemplate = {
                id: 'tmpl-' + Date.now(),
                title: templateData.title || '新模板',
                description: templateData.description || '',
                content: templateData.content || '',
                icon: templateData.icon || 'description',
            };
            setTemplates([...templates, newT]);
            addHistory("管理模板", `在库中新建了 SOP 模板: ${newT.title}`, "library_add", "bg-emerald-500");
        }
        setIsTemplateEditOpen(false);
        setEditingTemplate(null);
    };

    const deleteTemplate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('确定要删除此 SOP 模板吗？此操作不可撤销。')) {
            const template = templates.find(t => t.id === id);
            setTemplates(templates.filter(t => t.id !== id));
            addHistory("管理模板", `从库中移除了 SOP 模板: ${template?.title}`, "delete", "bg-red-500");
        }
    };

    const openTemplateEditor = (e: React.MouseEvent, template: StepTemplate | null) => {
        e.stopPropagation();
        setEditingTemplate(template);
        setIsTemplateEditOpen(true);
    };

    // --- BOM Management ---

    const openBOMEditor = (e: React.MouseEvent, bom: BOMTemplate | null) => {
        e.stopPropagation();
        setEditingBOM(bom);
        setIsBOMEditOpen(true);
    };

    const deleteBOM = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('确定要删除此 BOM 模板吗？此操作不可撤销。')) {
            const bom = bomTemplates.find(b => b.id === id);
            setBomTemplates(prev => prev.filter(b => b.id !== id));
            addHistory("管理 BOM", `从库中移除了 BOM 模板: ${bom?.title}`, "delete", "bg-red-500");
        }
    };

    const saveBOM = (bomData: BOMTemplate) => {
        if (editingBOM) {
            setBomTemplates(prev => prev.map(b => b.id === editingBOM.id ? bomData : b));
            addHistory("管理 BOM", `更新了 BOM 模板: ${bomData.title}`, "edit_note", "bg-amber-500");
        } else {
            setBomTemplates(prev => [...prev, bomData]);
            addHistory("管理 BOM", `新建了 BOM 模板: ${bomData.title}`, "library_add", "bg-emerald-500");
        }
        setIsBOMEditOpen(false);
        setEditingBOM(null);
    };

    const getFileMeta = (type: string, name?: string) => {
        const lowerType = type.toLowerCase();
        const lowerName = name?.toLowerCase() || '';
        
        if (lowerType.includes('pdf')) return { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50' };
        if (lowerType.includes('image')) return { icon: 'image', color: 'text-blue-500', bg: 'bg-blue-50' };
        if (lowerType.includes('word') || lowerType.includes('officedocument.wordprocessingml')) return { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (lowerType.includes('presentation') || lowerType.includes('powerpoint')) return { icon: 'slideshow', color: 'text-orange-500', bg: 'bg-orange-50' };
        if (lowerType.includes('spreadsheet') || lowerType.includes('excel') || lowerName.endsWith('.csv') || lowerName.endsWith('.xlsx')) {
            return { icon: 'table_view', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        }
        return { icon: 'insert_drive_file', color: 'text-slate-400', bg: 'bg-slate-50' };
    };

    return (
        <div className="flex h-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
                {/* Header */}
                <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-surface-dark z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="mr-2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            title="返回详情"
                        >
                            <span className="material-icons">arrow_back</span>
                        </button>
                        <div className="flex items-center gap-2 text-primary">
                             <span className="material-icons-outlined">science</span>
                             <h1 className="text-sm font-bold flex items-center gap-2">
                                <EditableText 
                                    id={`exp-title-${metadata.id}`}
                                    defaultValue={metadata.title}
                                    onSave={(v) => {
                                        onUpdateTitle(v);
                                        addHistory("编辑信息", `实验标题更改为: "${v}"`, "edit", "bg-blue-500");
                                    }}
                                    readOnly={!canEdit}
                                />
                             </h1>
                        </div>
                        <span className="h-4 w-px bg-gray-300 dark:bg-gray-600"></span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                             <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{project.title.split(':')[0]}</span>
                             <span>/</span>
                             <span>{metadata.id}</span>
                             <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-bold ${
                                 metadata.status === '已完成' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                 metadata.status === '进行中' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                 'bg-yellow-100 text-yellow-800 border-yellow-200'
                             }`}>
                                {metadata.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`p-2 transition-all ${isHistoryOpen ? 'text-primary bg-primary/5 rounded-lg' : 'text-gray-500 hover:text-primary'}`} title="查看审计追踪">
                            <span className="material-icons-outlined">history</span>
                        </button>
                        <button onClick={() => setIsAuditModalOpen(true)} className="p-2 text-gray-500 hover:text-primary transition-colors" title="全屏审计日志">
                            <span className="material-icons-outlined">fact_check</span>
                        </button>
                        <button onClick={() => setIsSignatureOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95">
                            <span>签署记录</span>
                            <span className="material-icons-outlined text-sm">draw</span>
                        </button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-12">
                        
                        <div className="mb-6 border-l-4 border-primary pl-4">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                {metadata.title}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-mono">GMP-LAB-RECORD // {project.title}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">{metadata.description}</p>
                        </div>

                        {/* Protocol Section */}
                        <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">实验方案图谱 (Protocol)</h2>
                                {protocolFile && isEditing && canEdit && (
                                    <button 
                                        onClick={() => protocolFileInputRef.current?.click()}
                                        className="text-[10px] font-bold text-primary hover:underline uppercase"
                                    >
                                        更换方案
                                    </button>
                                )}
                            </div>
                            
                            <div className={`w-full min-h-[12rem] bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
                                ${protocolFile ? 'border-transparent' : canEdit ? 'border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer' : 'border-slate-200 dark:border-slate-700 cursor-not-allowed'}
                            `} onClick={() => canEdit && !protocolFile && protocolFileInputRef.current?.click()}>
                                
                                <input 
                                    type="file" 
                                    ref={protocolFileInputRef} 
                                    onChange={handleProtocolFileUpload} 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.xlsx,.csv"
                                />

                                {protocolFile ? (
                                    <div className="w-full flex flex-col items-center">
                                        {protocolFile.type.includes('image') ? (
                                            <div className="relative group w-full flex justify-center">
                                                <img src={protocolFile.data} alt="Protocol" className="max-h-64 object-contain rounded-lg shadow-sm" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button onClick={() => setPreviewFile(protocolFile)} className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-lg">查看全图</button>
                                                    {isEditing && canEdit && <button onClick={() => protocolFileInputRef.current?.click()} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg">更换文件</button>}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-sm p-6 bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-slate-700 rounded-xl shadow-md flex items-center gap-4">
                                                <div className={`h-16 w-16 rounded-xl ${getFileMeta(protocolFile.type, protocolFile.name).bg} flex items-center justify-center`}>
                                                    <span className={`material-icons text-3xl ${getFileMeta(protocolFile.type, protocolFile.name).color}`}>{getFileMeta(protocolFile.type, protocolFile.name).icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{protocolFile.name}</h4>
                                                    <p className="text-xs text-slate-500">{protocolFile.size} • {protocolFile.uploader}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <button onClick={() => setPreviewFile(protocolFile)} className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-wider">查看内容</button>
                                                        <a href={protocolFile.data} download={protocolFile.name} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider">保存副本</a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 text-slate-400 group">
                                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <span className="material-icons text-3xl">upload_file</span>
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-widest mb-1">点击上传实验方案</p>
                                        <p className="text-[10px] opacity-60">支持 PDF, Word, PPT, Excel, CSV, 图片等格式</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Steps Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-primary">ballot</span>
                                    标准化操作流程与记录
                                </h2>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">符合 ALCOA+ 原则</span>
                            </div>

                            <div className="space-y-4">
                                {steps.length === 0 && (
                                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                                        <p>暂无步骤，请添加新步骤或从模板导入。</p>
                                    </div>
                                )}
                                {steps.map((step, index) => {
                                    const isStepEditing = editingStepId === step.id || isEditing;
                                    
                                    return (
                                        <div 
                                            key={step.id} 
                                            onDragOver={(e) => handleDragOver(e, step.id)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, step.id)}
                                            className={`p-6 bg-white dark:bg-surface-dark border rounded-xl shadow-sm transition-all group/step relative 
                                                ${step.isCurrent ? 'ring-2 ring-primary ring-opacity-20 border-primary' : 'border-slate-200 dark:border-slate-700'} 
                                                ${dragOverStepId === step.id ? 'border-primary ring-4 ring-primary/10 bg-primary/5' : ''}
                                                ${isStepEditing ? 'ring-2 ring-emerald-500/50 border-emerald-500/50 shadow-md' : ''}
                                            `}
                                        >
                                            {/* Edit Button for Step (Hidden by default, shown on hover) */}
                                            {canEdit && (
                                                <div className="absolute top-4 right-4 opacity-0 group-hover/step:opacity-100 transition-opacity z-10 flex gap-2">
                                                     <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (editingStepId === step.id) {
                                                                setEditingStepId(null);
                                                                addHistory("编辑锁定", `完成了对步骤 ${index + 1} 的编辑`, "lock", "bg-slate-400");
                                                            } else {
                                                                setEditingStepId(step.id);
                                                                addHistory("开始编辑", `开始编辑步骤 ${index + 1}`, "edit", "bg-emerald-500");
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold shadow-sm ${
                                                            isStepEditing 
                                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                                            : 'bg-white text-slate-600 hover:text-primary hover:border-primary border border-slate-200'
                                                        }`}
                                                    >
                                                        <span className="material-icons text-[14px]">{isStepEditing ? 'check' : 'edit'}</span>
                                                        {isStepEditing ? '完成' : '编辑'}
                                                    </button>
                                                    
                                                    {isStepEditing && (
                                                        <button onClick={() => deleteStep(step.id)} className="p-1.5 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-lg transition-all" title="删除步骤">
                                                            <span className="material-icons text-sm">delete_outline</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {dragOverStepId === step.id && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 z-20 rounded-xl pointer-events-none border-2 border-primary border-dashed">
                                                    <div className="bg-white dark:bg-surface-dark px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
                                                        <span className="material-icons text-primary">cloud_upload</span>
                                                        <span className="text-sm font-bold text-primary">释放以上传文件到本步骤</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-4 min-w-0">
                                                    <div className="flex justify-between items-center mr-20">
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                                                            <EditableText 
                                                                id={`${step.id}-title`} 
                                                                defaultValue={step.title} 
                                                                editing={isStepEditing}
                                                                onSave={(v) => addHistory("步骤编辑", `步骤 ${index + 1} 的标题已修改为: "${v}"`, "short_text", "bg-blue-400")}
                                                                readOnly={!canEdit}
                                                            />
                                                        </h3>
                                                        {step.timestamp && <span className="text-[10px] font-mono text-slate-400">{step.timestamp}</span>}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 h-full">
                                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">标准操作描述</label>
                                                                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed h-[calc(100%-1.5rem)]">
                                                                    <EditableText 
                                                                        id={`${step.id}-content`} 
                                                                        multiline 
                                                                        defaultValue={step.content} 
                                                                        placeholder="输入操作描述..." 
                                                                        editing={isStepEditing}
                                                                        onSave={(v) => addHistory("编辑 SOP", `更新了步骤 ${index + 1} 的标准操作程序内容。`, "edit_note", "bg-slate-600")}
                                                                        readOnly={!canEdit}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-lg border border-emerald-100 dark:border-emerald-800/30 h-full">
                                                                <label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                                                    <span className="material-icons text-[12px]">visibility</span>
                                                                    观察记录与实际值
                                                                </label>
                                                                <div className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed h-[calc(100%-1.5rem)]">
                                                                    <EditableText 
                                                                        id={`${step.id}-obs`} 
                                                                        multiline 
                                                                        defaultValue={step.observations || ''} 
                                                                        placeholder="点击记录实验现象或实时参数..." 
                                                                        editing={isStepEditing}
                                                                        onSave={(v) => addHistory("添加观察", `步骤 ${index + 1} 的观察记录已更新: "${v.substring(0, 30)}..."`, "visibility", "bg-emerald-500")}
                                                                        readOnly={!canEdit}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <span className="material-icons text-[12px]">attach_file</span>
                                                                    步骤附件 ({step.attachments?.length || 0})
                                                                </label>
                                                                <button 
                                                                    onClick={() => { setActiveStepId(step.id); stepFileInputRef.current?.click(); }}
                                                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${canEdit ? 'text-primary hover:text-primary-hover cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                                                                    disabled={!canEdit}
                                                                >
                                                                    <span className="material-icons text-xs">add</span>
                                                                    上传/拖入附件
                                                                </button>
                                                            </div>
                                                            
                                                            {step.attachments && step.attachments.length > 0 ? (
                                                                <div className="space-y-3">
                                                                    {['image', 'document', 'data', 'other'].map(category => {
                                                                        const categoryFiles = (step.attachments || []).filter(f => {
                                                                            const type = f.type.toLowerCase();
                                                                            const name = f.name.toLowerCase();
                                                                            if (category === 'image') return type.includes('image');
                                                                            if (category === 'document') return type.includes('pdf') || type.includes('word') || type.includes('presentation') || type.includes('text');
                                                                            if (category === 'data') return type.includes('spreadsheet') || type.includes('excel') || name.endsWith('.csv') || name.endsWith('.xlsx');
                                                                            return !type.includes('image') && !type.includes('pdf') && !type.includes('word') && !type.includes('presentation') && !type.includes('text') && !type.includes('spreadsheet') && !type.includes('excel') && !name.endsWith('.csv') && !name.endsWith('.xlsx');
                                                                        });

                                                                        if (categoryFiles.length === 0) return null;

                                                                        const catLabel = {
                                                                            image: '影像记录',
                                                                            document: '文档资料',
                                                                            data: '原始数据',
                                                                            other: '其他附件'
                                                                        }[category as 'image' | 'document' | 'data' | 'other'];

                                                                        return (
                                                                            <div key={category} className="bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                                                                                <div className="text-[9px] font-bold text-slate-400 uppercase mb-2 px-1">{catLabel}</div>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                    {categoryFiles.map(file => {
                                                                                        const meta = getFileMeta(file.type, file.name);
                                                                                        return (
                                                                                            <div key={file.id} className="group flex items-center justify-between p-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-all shadow-sm">
                                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                                    <span className={`material-icons text-sm ${meta.color}`}>{meta.icon}</span>
                                                                                                    <div className="truncate">
                                                                                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                                                                                                        <p className="text-[9px] text-slate-400">{file.size}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="flex gap-1">
                                                                                                    <button onClick={() => setPreviewFile(file)} className="px-2 py-1 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-all">查看</button>
                                                                                                    {canEdit && (
                                                                                                        <button onClick={() => removeStepAttachment(step.id, file.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><span className="material-icons text-sm">close</span></button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-[10px] text-slate-400 italic">暂无附件（支持拖放至此处上传）</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex gap-4 pt-4">
                                    {canEdit && (
                                        <>
                                            <button 
                                                onClick={() => setIsTemplateModalOpen(true)} 
                                                className="flex-1 py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                            >
                                                <span className="material-icons text-sm">auto_awesome</span>
                                                从 SOP / BOM 库导入
                                            </button>
                                            <button 
                                                onClick={() => addStep()} 
                                                className="px-6 py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                                title="添加自定义空白步骤"
                                            >
                                                <span className="material-icons">add</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                        
                        {/* Hidden file inputs */}
                        <input type="file" ref={stepFileInputRef} onChange={handleStepFileUpload} className="hidden" multiple />
                    </div>
                </div>
            </div>

            {/* Audit Trail Sidebar */}
            <div className={`fixed right-0 top-0 bottom-0 w-[380px] bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-slate-700 shadow-2xl transform transition-transform duration-500 z-[100] flex flex-col ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-surface-dark-lighter">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest text-xs">
                            <span className="material-icons text-primary text-lg">history</span>
                            审计追踪 (Audit Trail)
                        </h3>
                        <p className="text-[9px] text-slate-400 uppercase mt-0.5 font-mono tracking-tighter">Compliant with 21 CFR Part 11</p>
                    </div>
                    <button onClick={() => setIsHistoryOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-icons">close</span>
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-black/10">
                    <div className="relative pl-7 border-l-2 border-slate-200 dark:border-slate-700 space-y-8 pb-8">
                        {history.map((item) => (
                            <div key={item.id} className="relative group/audit">
                                <span className={`absolute -left-[37px] top-0 h-5 w-5 rounded-full ${item.color} ring-4 ring-white dark:ring-surface-dark shadow-sm flex items-center justify-center z-10 transition-transform group-hover/audit:scale-110`}>
                                    <span className="material-icons text-[11px] text-white">{item.icon}</span>
                                </span>
                                <div className="space-y-1.5 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{item.action}</span>
                                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{item.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{item.desc}</p>
                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-slate-800/50">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.user} · <span className="opacity-60">{item.role}</span></span>
                                        <span className="text-[8px] font-mono text-slate-300 uppercase select-none">#{item.hash}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-lighter">
                    <button onClick={() => setIsAuditModalOpen(true)} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                        <span className="material-icons text-sm">open_in_full</span>
                        查看详细审计日志表
                    </button>
                 </div>
            </div>

            {/* Detailed Audit Modal */}
            {isAuditModalOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-surface-dark-lighter shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <span className="material-icons">fact_check</span>
                                    </div>
                                    数据完整性审计报告
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">System Hash Traceability Log // Version 4.2.0</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <span className="material-icons text-sm">print</span> 打印报告
                                </button>
                                <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-all shadow-lg flex items-center gap-2">
                                    <span className="material-icons text-sm">download</span> 导出 CSV
                                </button>
                                <button onClick={() => setIsAuditModalOpen(false)} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-500 transition-all">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800/50 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                                        <th className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 first:rounded-tl-lg">时间戳</th>
                                        <th className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">人员 (角色)</th>
                                        <th className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">动作类别</th>
                                        <th className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">变更描述</th>
                                        <th className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 last:rounded-tr-lg">安全哈希</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 font-mono text-slate-500">{item.time}</td>
                                            <td className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                                                {item.user}
                                                <div className="text-[10px] font-normal text-slate-500 uppercase">{item.role}</div>
                                            </td>
                                            <td className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 uppercase tracking-tighter">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white ${item.color}`}>{item.action}</span>
                                            </td>
                                            <td className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">{item.desc}</td>
                                            <td className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-400">{item.hash}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-8 py-4 bg-slate-50 dark:bg-surface-dark-lighter border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div className="text-[10px] text-slate-400 font-mono uppercase">
                                Report generated at {new Date().toISOString()} // HelixELN-Audit-Sys
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-emerald-500 text-sm">verified</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valid Audit Signature Applied</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Library Modal (Updated with BOM) */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header with Tabs */}
                        <div className="px-6 pt-4 pb-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-surface-dark-lighter">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons text-primary">auto_awesome</span>
                                    实验室标准库
                                </h3>
                                <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setLibraryTab('sop')}
                                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${libraryTab === 'sop' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    SOP 步骤模板
                                </button>
                                <button 
                                    onClick={() => setLibraryTab('bom')}
                                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${libraryTab === 'bom' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    BOM 物料清单
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto bg-white dark:bg-surface-dark">
                            {/* SOP TAB */}
                            {libraryTab === 'sop' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.map(template => (
                                        <div key={template.id} className="relative group">
                                            <button 
                                                onClick={() => addStep(template)} 
                                                className="w-full text-left p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all flex flex-col h-full"
                                            >
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors shrink-0">
                                                        <span className="material-icons">{template.icon}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{template.title}</h4>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 flex-1">{template.description}</p>
                                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">导入步骤</span>
                                                    <span className="material-icons text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                                                </div>
                                            </button>
                                            
                                            {canEdit && (
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/60 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                                                    <button 
                                                        onClick={(e) => openTemplateEditor(e, template)}
                                                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-primary rounded transition-colors"
                                                        title="编辑模板"
                                                    >
                                                        <span className="material-icons text-sm">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => deleteTemplate(e, template.id)}
                                                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-red-500 rounded transition-colors"
                                                        title="删除模板"
                                                    >
                                                        <span className="material-icons text-sm">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {canEdit && (
                                        <button 
                                            onClick={(e) => openTemplateEditor(e, null)}
                                            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary transition-all group h-full min-h-[160px]"
                                        >
                                            <span className="material-icons text-3xl mb-2">library_add</span>
                                            <span className="text-xs font-bold uppercase tracking-widest">新建 SOP 模板</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* BOM TAB */}
                            {libraryTab === 'bom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {bomTemplates.map(bom => (
                                        <div key={bom.id} className="relative group">
                                            <button 
                                                onClick={() => addBOMStep(bom)} 
                                                className="w-full text-left p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all flex flex-col h-full"
                                            >
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:text-indigo-500 transition-colors shrink-0">
                                                        <span className="material-icons">inventory_2</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{bom.title}</h4>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 flex-1">{bom.description}</p>
                                                
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded px-3 py-2 text-[10px] text-slate-500 mb-3">
                                                    包含 {bom.items.length} 种物料
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">导入 BOM 清单</span>
                                                    <span className="material-icons text-sm text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">playlist_add</span>
                                                </div>
                                            </button>
                                            
                                            {canEdit && (
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/60 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                                                    <button 
                                                        onClick={(e) => openBOMEditor(e, bom)}
                                                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-indigo-500 rounded transition-colors"
                                                        title="编辑 BOM"
                                                    >
                                                        <span className="material-icons text-sm">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => deleteBOM(e, bom.id)}
                                                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-red-500 rounded transition-colors"
                                                        title="删除 BOM"
                                                    >
                                                        <span className="material-icons text-sm">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {canEdit && (
                                        <button 
                                            onClick={(e) => openBOMEditor(e, null)}
                                            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all group h-full min-h-[160px]"
                                        >
                                            <span className="material-icons text-3xl mb-2">add_shopping_cart</span>
                                            <span className="text-xs font-bold uppercase tracking-widest">新建 BOM 模板</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Template Editor Modal */}
            {isTemplateEditOpen && (
                <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary">{editingTemplate ? 'edit' : 'add'}</span>
                                {editingTemplate ? '编辑 SOP 模板' : '创建新 SOP 模板'}
                            </h3>
                            <button onClick={() => { setIsTemplateEditOpen(false); setEditingTemplate(null); }} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            saveTemplate({
                                title: formData.get('title') as string,
                                icon: formData.get('icon') as string,
                                description: formData.get('description') as string,
                                content: formData.get('content') as string,
                            });
                        }}>
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-8">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">模板标题</label>
                                    <input 
                                        name="title" 
                                        required 
                                        defaultValue={editingTemplate?.title}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                                        placeholder="例如：产物 HPLC 检测"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">图标编码</label>
                                    <input 
                                        name="icon" 
                                        required 
                                        defaultValue={editingTemplate?.icon || 'description'}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none" 
                                        placeholder="Material Icon"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">简短描述</label>
                                <input 
                                    name="description" 
                                    defaultValue={editingTemplate?.description}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                                    placeholder="描述此模板的用途..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">预设 SOP 内容</label>
                                <textarea 
                                    name="content" 
                                    required 
                                    rows={8}
                                    defaultValue={editingTemplate?.content}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none resize-none" 
                                    placeholder="输入该步骤的默认操作细节..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => { setIsTemplateEditOpen(false); setEditingTemplate(null); }} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">取消</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-colors">保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BOM Editor Modal */}
            {isBOMEditOpen && (
                <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-surface-dark-lighter shrink-0">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-indigo-500">{editingBOM ? 'edit' : 'add_shopping_cart'}</span>
                                {editingBOM ? '编辑 BOM 模板' : '创建新 BOM 模板'}
                            </h3>
                            <button onClick={() => { setIsBOMEditOpen(false); setEditingBOM(null); }} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        
                        {/* BOM Form */}
                        <form className="flex-1 overflow-y-auto" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const items: BOMItem[] = [];
                            
                            // Parse dynamic items from form data (assuming simple sequential processing or DOM reading)
                            // Since standard FormData handling of dynamic arrays is tricky, we'll read from DOM or use state if we had a complex form manager.
                            // For simplicity here, we will read inputs by name arrays or construct manually.
                            // Let's use a simpler approach: Read from the form's elements by name.
                            
                            const form = e.currentTarget;
                            const names = form.querySelectorAll('input[name="itemName"]');
                            const quantities = form.querySelectorAll('input[name="itemQty"]');
                            const catalogs = form.querySelectorAll('input[name="itemCat"]');
                            
                            names.forEach((node, index) => {
                                const name = (node as HTMLInputElement).value;
                                if(name) {
                                    items.push({
                                        name: name,
                                        quantity: (quantities[index] as HTMLInputElement).value,
                                        catalog: (catalogs[index] as HTMLInputElement).value
                                    });
                                }
                            });

                            const newBOM: BOMTemplate = {
                                id: editingBOM?.id || 'bom-' + Date.now(),
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                items: items
                            };
                            saveBOM(newBOM);
                        }}>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">BOM 名称</label>
                                    <input 
                                        name="title" 
                                        required 
                                        defaultValue={editingBOM?.title}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                                        placeholder="例如：标准 PCR 体系"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">描述</label>
                                    <input 
                                        name="description" 
                                        defaultValue={editingBOM?.description}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                                        placeholder="简要描述此清单用途..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                                        <span>物料列表</span>
                                        <span className="text-[9px] text-slate-300">自动保存空行将被忽略</span>
                                    </label>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="grid grid-cols-12 gap-2 p-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                                            <div className="col-span-6">物料名称</div>
                                            <div className="col-span-3">数量/单位</div>
                                            <div className="col-span-3">货号/备注</div>
                                        </div>
                                        
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800" id="bom-items-container">
                                            {/* Existing Items */}
                                            {(editingBOM?.items || []).map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-2 p-2">
                                                    <div className="col-span-6">
                                                        <input name="itemName" defaultValue={item.name} className="w-full bg-transparent border-none p-0 text-sm focus:ring-0" placeholder="物料名称" />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input name="itemQty" defaultValue={item.quantity} className="w-full bg-transparent border-none p-0 text-sm focus:ring-0" placeholder="10 ml" />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input name="itemCat" defaultValue={item.catalog} className="w-full bg-transparent border-none p-0 text-sm focus:ring-0" placeholder="N/A" />
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Empty Rows for new items */}
                                            {[1, 2, 3].map((_, idx) => (
                                                <div key={`new-${idx}`} className="grid grid-cols-12 gap-2 p-2 group">
                                                    <div className="col-span-6">
                                                        <input name="itemName" className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-slate-300" placeholder="添加新物料..." />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input name="itemQty" className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-slate-300" placeholder="-" />
                                                    </div>
                                                    <div className="col-span-3 flex items-center">
                                                        <input name="itemCat" className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-slate-300" placeholder="-" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-surface-dark-lighter shrink-0">
                                <button type="button" onClick={() => { setIsBOMEditOpen(false); setEditingBOM(null); }} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">取消</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">保存 BOM</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl h-full flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-surface-dark-lighter">
                            <div className="flex items-center gap-3">
                                <span className={`material-icons ${getFileMeta(previewFile.type, previewFile.name).color}`}>{getFileMeta(previewFile.type, previewFile.name).icon}</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewFile.name}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">FILE_ID: {previewFile.id} • {previewFile.size}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewFile(null)} className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100 dark:bg-black/20 flex items-center justify-center p-12 overflow-hidden">
                            {previewFile.type.includes('image') ? (
                                <img src={previewFile.data} alt="预览" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700" />
                            ) : previewFile.type.includes('pdf') ? (
                                <div className="text-center space-y-6 max-w-md">
                                    <div className="h-28 w-28 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                        <span className="material-icons text-6xl text-red-500">picture_as_pdf</span>
                                    </div>
                                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">受保护的 PDF 预览</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">此文档可能包含合规性要求。请通过下方按钮下载原始文件以进行完整审阅或在专业 PDF 阅读器中打开。</p>
                                    <div className="flex justify-center gap-4 pt-4">
                                        <a href={previewFile.data} download={previewFile.name} className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center gap-2">
                                            <span className="material-icons text-sm">download</span>
                                            安全下载 PDF
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 max-w-md">
                                    <div className={`h-28 w-28 ${getFileMeta(previewFile.type, previewFile.name).bg} rounded-3xl flex items-center justify-center mx-auto shadow-inner`}>
                                        <span className={`material-icons text-6xl ${getFileMeta(previewFile.type, previewFile.name).color}`}>{getFileMeta(previewFile.type, previewFile.name).icon}</span>
                                    </div>
                                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">暂不支持直接预览</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        该文件格式（如 Word, Excel, CSV, PPT）需要专用的办公套件进行审阅。为了保证数据渲染的绝对准确性，请下载后本地查看。
                                    </p>
                                    <div className="flex justify-center gap-4 pt-4">
                                        <a href={previewFile.data} download={previewFile.name} className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center gap-2">
                                            <span className="material-icons text-sm">download</span>
                                            安全下载文件
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <SignatureModal isOpen={isSignatureOpen} onClose={() => setIsSignatureOpen(false)} onSign={() => { setIsSignatureOpen(false); addHistory("电子签署", "实验记录已通过 2FA 电子签名锁定，符合 21 CFR Part 11 要求。", "verified", "bg-emerald-600"); }} />
        </div>
    );
};