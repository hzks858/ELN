import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Permission } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => void;
    signup: (name: string, email: string) => void;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin: [
        'view_experiments', 'create_experiment', 'edit_experiment', 'delete_experiment', 
        'approve_experiment', 'view_audit_log', 'manage_audit_log', 'manage_users', 'manage_inventory',
        'view_analysis', 'edit_analysis'
    ],
    scientist: [
        'view_experiments', 'create_experiment', 'edit_experiment', 
        'manage_inventory', 'view_analysis', 'edit_analysis'
    ],
    qa: [
        'view_experiments', 'approve_experiment', 'view_audit_log', 'view_analysis'
    ],
    viewer: [
        'view_experiments', 'view_analysis'
    ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('helix_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Migration: Ensure permissions exist for legacy data
                if (parsedUser && !parsedUser.permissions && parsedUser.role) {
                    parsedUser.permissions = ROLE_PERMISSIONS[parsedUser.role as Role] || [];
                }
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('helix_user');
            }
        }
    }, []);

    const hasPermission = (permission: Permission): boolean => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    };

    const login = (email: string) => {
        // Mock login with role assignment based on email
        let role: Role = 'scientist';
        if (email.includes('admin')) role = 'admin';
        else if (email.includes('qa')) role = 'qa';
        else if (email.includes('viewer')) role = 'viewer';

        const mockUser: User = {
            name: email.split('@')[0],
            email,
            role,
            permissions: ROLE_PERMISSIONS[role],
            initials: email.substring(0, 2).toUpperCase(),
            avatar: 'https://ui-avatars.com/api/?background=1973f0&color=fff&name=' + email.split('@')[0]
        };
        setUser(mockUser);
        localStorage.setItem('helix_user', JSON.stringify(mockUser));
    };

    const signup = (name: string, email: string) => {
        // Default new users to scientist
        const role: Role = 'scientist';
        const mockUser: User = {
            name,
            email,
            role,
            permissions: ROLE_PERMISSIONS[role],
            initials: name.substring(0, 2).toUpperCase(),
            avatar: 'https://ui-avatars.com/api/?background=1973f0&color=fff&name=' + name
        };
        setUser(mockUser);
        localStorage.setItem('helix_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('helix_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
