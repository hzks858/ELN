export type View = 'experiment' | 'analysis' | 'inventory' | 'batch' | 'audit' | 'settings' | 'profile';

export interface SidebarItem {
    id: View;
    label: string;
    icon: string;
}

export interface User {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    initials: string;
}

export interface DesignState {
    [key: string]: string; // id -> value (text or base64 image)
}

export interface SavedDesign {
    id: string;
    name: string;
    date: string;
    state: DesignState;
}