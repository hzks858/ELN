export type View = 'experiment' | 'analysis' | 'inventory' | 'batch' | 'audit' | 'settings' | 'profile';

export interface SidebarItem {
    id: View;
    label: string;
    icon: string;
}

export type Role = 'admin' | 'scientist' | 'qa' | 'viewer';

export type Permission = 
    | 'view_experiments'
    | 'create_experiment'
    | 'edit_experiment'
    | 'delete_experiment'
    | 'approve_experiment'
    | 'view_audit_log'
    | 'manage_audit_log'
    | 'manage_users'
    | 'manage_inventory'
    | 'view_analysis'
    | 'edit_analysis';

export interface User {
    name: string;
    email: string;
    role: Role;
    permissions: Permission[];
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