import React, { createContext, useContext, useState, useEffect } from 'react';
import { DesignState, SavedDesign } from '../types';

interface DesignContextType {
    edits: DesignState;
    isEditing: boolean;
    toggleEditMode: () => void;
    updateEdit: (id: string, value: string) => void;
    savedDesigns: SavedDesign[];
    saveCurrentDesign: (name: string) => void;
    loadDesign: (designId: string) => void;
    resetDesign: () => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [edits, setEdits] = useState<DesignState>({});
    const [isEditing, setIsEditing] = useState(false);
    const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('helix_saved_designs');
        if (stored) {
            setSavedDesigns(JSON.parse(stored));
        }
        
        // Auto-load last active state if exists
        const current = localStorage.getItem('helix_current_edits');
        if (current) {
            setEdits(JSON.parse(current));
        }
    }, []);

    const toggleEditMode = () => setIsEditing(prev => !prev);

    const updateEdit = (id: string, value: string) => {
        const newEdits = { ...edits, [id]: value };
        setEdits(newEdits);
        localStorage.setItem('helix_current_edits', JSON.stringify(newEdits));
    };

    const saveCurrentDesign = (name: string) => {
        const newDesign: SavedDesign = {
            id: Date.now().toString(),
            name,
            date: new Date().toISOString(),
            state: { ...edits }
        };
        const updated = [...savedDesigns, newDesign];
        setSavedDesigns(updated);
        localStorage.setItem('helix_saved_designs', JSON.stringify(updated));
    };

    const loadDesign = (designId: string) => {
        const design = savedDesigns.find(d => d.id === designId);
        if (design) {
            setEdits(design.state);
            localStorage.setItem('helix_current_edits', JSON.stringify(design.state));
        }
    };

    const resetDesign = () => {
        setEdits({});
        localStorage.removeItem('helix_current_edits');
    };

    return (
        <DesignContext.Provider value={{ 
            edits, 
            isEditing, 
            toggleEditMode, 
            updateEdit, 
            savedDesigns, 
            saveCurrentDesign, 
            loadDesign,
            resetDesign 
        }}>
            {children}
        </DesignContext.Provider>
    );
};

export const useDesign = () => {
    const context = useContext(DesignContext);
    if (!context) throw new Error('useDesign must be used within a DesignProvider');
    return context;
};