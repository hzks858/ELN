import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExperimentEditor } from './views/ExperimentEditor';
import { AnalysisDashboard } from './views/AnalysisDashboard';
import { Inventory } from './views/Inventory';
import { Traceability } from './views/Traceability';
import { Settings } from './views/Settings';
import { AuditLog } from './views/AuditLog';
import { Auth } from './views/Auth';
import { Profile } from './views/Profile';
import { View } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DesignProvider, useDesign } from './context/DesignContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationCenter } from './components/NotificationCenter';

// Placeholder components
const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-400">
        <div className="text-center">
            <span className="material-icons text-6xl mb-4 opacity-20">construction</span>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm mt-2">此模块正在开发中。</p>
        </div>
    </div>
);

const MainLayout: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { isEditing, toggleEditMode } = useDesign();
    const [activeView, setActiveView] = useState<View>('experiment');

    // Dragging state
    const [pos, setPos] = useState<{x: number, y: number} | null>(null);
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            setPos({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        };
        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return; // Only left click
        const rect = e.currentTarget.getBoundingClientRect();
        
        // If first time dragging (switching from absolute to fixed)
        if (!pos) {
             setPos({ x: rect.left, y: rect.top });
        }
        
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        startPos.current = { x: e.clientX, y: e.clientY };
        isDragging.current = true;
    };

    const handleMouseClick = (e: React.MouseEvent) => {
        const dist = Math.sqrt(Math.pow(e.clientX - startPos.current.x, 2) + Math.pow(e.clientY - startPos.current.y, 2));
        if (dist < 5) {
            toggleEditMode();
        }
    };

    if (!isAuthenticated) {
        return <Auth />;
    }

    const renderView = () => {
        switch (activeView) {
            case 'experiment': return <ExperimentEditor />;
            case 'analysis': return <AnalysisDashboard />;
            case 'inventory': return <Inventory />;
            case 'batch': return <Traceability />;
            case 'settings': return <Settings />;
            case 'audit': return <AuditLog />;
            case 'profile': return <Profile />;
            default: return <ExperimentEditor />;
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden relative">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <NotificationCenter />
                
                {/* Global Edit Mode Toggle (Draggable) */}
                <div 
                    className="z-50 cursor-move touch-none select-none"
                    style={pos ? { position: 'fixed', left: pos.x, top: pos.y } : { position: 'absolute', top: '1rem', right: '1rem' }}
                    onMouseDown={handleMouseDown}
                    onClick={handleMouseClick}
                    title="按住拖动，点击切换"
                >
                    <button 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg text-xs font-bold transition-all border pointer-events-none ${
                            isEditing 
                            ? 'bg-yellow-400 text-black border-yellow-500 scale-105' 
                            : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        <span className="material-icons text-sm">{isEditing ? 'edit' : 'edit_off'}</span>
                        {isEditing ? '编辑模式' : '查看模式'}
                        <span className="material-icons text-[12px] opacity-40 border-l border-current pl-2 ml-1">drag_indicator</span>
                    </button>
                </div>

                {renderView()}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <DesignProvider>
                    <MainLayout />
                </DesignProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;