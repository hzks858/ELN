import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => void;
    signup: (name: string, email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('helix_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (email: string) => {
        // Mock login
        const mockUser: User = {
            name: email.split('@')[0],
            email,
            role: '高级科学家',
            initials: email.substring(0, 2).toUpperCase(),
            avatar: 'https://ui-avatars.com/api/?background=1973f0&color=fff&name=' + email.split('@')[0]
        };
        setUser(mockUser);
        localStorage.setItem('helix_user', JSON.stringify(mockUser));
    };

    const signup = (name: string, email: string) => {
        const mockUser: User = {
            name,
            email,
            role: '科学家',
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
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};