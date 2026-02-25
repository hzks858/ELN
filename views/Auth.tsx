import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login, signup } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'login') {
            login(email);
        } else {
            signup(name, email);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <span className="material-icons text-2xl">science</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                        {mode === 'login' ? '欢迎回来' : '创建账户'}
                    </h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
                        输入您的凭据以访问 HelixELN
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">全名</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark-lighter border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Jane Doe 博士"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">电子邮件地址</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark-lighter border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="name@lab.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">密码</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark-lighter border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg shadow-lg shadow-primary/20 transition-all mt-6"
                        >
                            {mode === 'login' ? '登录' : '创建账户'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        {mode === 'login' ? "还没有账户？ " : "已经有账户？ "}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-primary font-bold hover:underline"
                        >
                            {mode === 'login' ? '注册' : '登录'}
                        </button>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-surface-dark-lighter px-8 py-4 text-center">
                    <p className="text-[10px] text-slate-400">受 21 CFR Part 11 合规协议保护</p>
                </div>
            </div>
        </div>
    );
};