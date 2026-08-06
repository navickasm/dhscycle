'use client';

import {useEffect, useState} from 'react';
import {clearAdminKey, getAdminKey, setAdminKey, verifyKey} from './adminApi.ts';

const navLinks = [
    {href: '/admin', label: 'Calendar'},
    {href: '/admin/templates', label: 'Templates'},
    {href: '/admin/tools', label: 'Tools'},
    {href: '/admin/settings', label: 'Settings'},
];

function LoginForm({onSuccess}: { onSuccess: () => void }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const ok = await verifyKey(key);
        setLoading(false);
        if (ok) {
            setAdminKey(key);
            onSuccess();
        } else {
            setError('Invalid API key (or server unreachable).');
        }
    };

    return (
        <div style={{maxWidth: '400px', margin: '4rem auto', padding: '1rem'}}>
            <h1>Admin Login</h1>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <input
                    type="password"
                    placeholder="Admin API Key"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    style={{padding: '0.5rem', fontSize: '1rem'}}
                    autoFocus
                />
                <button type="submit" disabled={loading || !key} style={{padding: '0.5rem', fontSize: '1rem'}}>
                    {loading ? 'Verifying…' : 'Log In'}
                </button>
                {error && <p style={{color: 'red'}}>{error}</p>}
            </form>
        </div>
    );
}

export default function AdminLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const [pathname, setPathname] = useState<string>('');
    const [authState, setAuthState] = useState<'checking' | 'unauthenticated' | 'authenticated'>('checking');

    useEffect(() => {
        setPathname(window.location.pathname);
        const check = async () => {
            const key = getAdminKey();
            if (!key) {
                setAuthState('unauthenticated');
                return;
            }
            const ok = await verifyKey(key);
            if (!ok) {
                clearAdminKey();
            }
            setAuthState(ok ? 'authenticated' : 'unauthenticated');
        };
        check();
    }, []);

    if (authState === 'checking') {
        return <p style={{padding: '2rem', textAlign: 'center'}}>Checking authentication…</p>;
    }

    if (authState === 'unauthenticated') {
        return <LoginForm onSuccess={() => setAuthState('authenticated')}/>;
    }

    return (
        <div>
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderBottom: '2px solid #ccc',
                backgroundColor: '#f7f7f7',
            }}>
                <strong>DHS Cycle Admin</strong>
                {navLinks.map(link => (
                    <a
                        key={link.href}
                        href={link.href}
                        style={{
                            textDecoration: pathname === link.href ? 'underline' : 'none',
                            fontWeight: pathname === link.href ? 'bold' : 'normal',
                            color: '#1155cc',
                        }}
                    >
                        {link.label}
                    </a>
                ))}
                <span style={{flex: 1}}/>
                <a href="/" style={{color: '#666'}}>← Back to site</a>
                <button
                    onClick={() => {
                        clearAdminKey();
                        setAuthState('unauthenticated');
                    }}
                    style={{padding: '0.25rem 0.75rem', cursor: 'pointer', font: 'inherit'}}
                >
                    Log Out
                </button>
            </nav>
            <main style={{padding: '1rem'}}>
                {children}
            </main>
        </div>
    );
}
