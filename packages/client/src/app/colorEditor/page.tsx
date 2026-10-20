'use client';

import {useEffect, useState} from 'react';
import {
    applyTheme,
    clearSavedTheme,
    decodeTheme,
    defaultTheme,
    encodeTheme,
    loadTheme,
    resetAppliedTheme,
    saveTheme,
    Theme,
    THEME_VARS,
} from '../../theme.ts';
import scheduleStyles from '../../components/schedule.module.css';

const buttonStyle: React.CSSProperties = {
    padding: '6px 16px',
    cursor: 'pointer',
    backgroundColor: 'var(--light)',
    color: 'var(--fg)',
    border: '2px solid var(--main)',
    fontSize: '1rem',
    fontFamily: 'inherit',
};

function DummySchedule() {
    return (
        <div style={{marginTop: '30px', textAlign: 'center'}}>
            <h1>Date</h1>
            <h2 style={{color: 'var(--main)', marginTop: '15px'}}>Special Schedule Name</h2>
            <table
                className={scheduleStyles.schedule}
                style={{tableLayout: 'fixed', width: '200px', margin: '20px auto 0'}}
            >
                <thead>
                <tr>
                    <td colSpan={3}>Cycle LS</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td colSpan={3}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span className={scheduleStyles.pn}>EB*</span>
                            <span className={scheduleStyles.pt}>9:00&ndash;9:09</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span className={scheduleStyles.pn}>1</span>
                            <span className={scheduleStyles.pt}>9:00&ndash;9:09</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td className={scheduleStyles.fakeLunch}></td>
                    <td
                        colSpan={2}
                        rowSpan={2}
                        style={{background: 'linear-gradient(to bottom, var(--main) 50%, var(--light) 50%)'}}
                    >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span className={scheduleStyles.pn}>4</span>
                            <span className={scheduleStyles.pt}>9:00&ndash;<br/>9:09</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td className={scheduleStyles.lunch}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: '100%',
                        }}>
                            <span className={scheduleStyles.ln}>Lunch A</span>
                            <span className={scheduleStyles.pt} style={{textAlign: 'center', lineHeight: '0.9'}}>
                                9:00<br/>&ndash;<br/>9:09
                            </span>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default function ThemePage() {
    const [theme, setTheme] = useState<Theme>(defaultTheme());
    const [importCode, setImportCode] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [statusIsError, setStatusIsError] = useState(false);

    useEffect(() => {
        const saved = loadTheme();
        if (saved) setTheme(saved);
    }, []);

    const showStatus = (message: string, isError = false) => {
        setStatus(message);
        setStatusIsError(isError);
    };

    const handleColorChange = (cssVar: string, value: string) => {
        const next = {...theme, [cssVar]: value};
        setTheme(next);
        applyTheme(next);
        setStatus(null);
    };

    const handleUpdate = () => {
        saveTheme(theme);
        applyTheme(theme);
        showStatus('Theme saved. It will apply across the whole site.');
    };

    const handleReset = () => {
        clearSavedTheme();
        resetAppliedTheme();
        setTheme(defaultTheme());
        setImportCode('');
        showStatus('Colors reset to defaults.');
    };

    const handleCopy = async () => {
        const code = encodeTheme(theme);
        try {
            await navigator.clipboard.writeText(code);
            showStatus('Theme code copied to clipboard.');
        } catch {
            setImportCode(code);
            showStatus('Could not access the clipboard. Your theme code is in the box above.', true);
        }
    };

    const handleImport = () => {
        const decoded = decodeTheme(importCode);
        if (!decoded) {
            showStatus('That theme code is not valid.', true);
            return;
        }
        setTheme(decoded);
        applyTheme(decoded);
        showStatus('Theme imported. Press Update to keep it.');
    };

    return (
        <div style={{maxWidth: '48rem', margin: '0 auto', padding: '30px'}}>
            <p style={{marginBottom: '20px'}}>
                <a href="/">&larr; Back to schedule</a>
            </p>

            <fieldset style={{
                border: '2px solid var(--dhsCycleBorder)',
                padding: '20px',
            }}>
                <legend style={{padding: '0 8px', fontWeight: 'bold', fontSize: '1.2rem'}}>Theme</legend>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: 'center',
                    marginBottom: '25px',
                }}>
                    {THEME_VARS.map(v => (
                        <label key={v.cssVar} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="color"
                                value={theme[v.cssVar] ?? v.defaultValue}
                                onChange={e => handleColorChange(v.cssVar, e.target.value)}
                                style={{
                                    width: '60px',
                                    height: '45px',
                                    padding: '4px',
                                    border: '2px solid var(--dhsCycleBorder)',
                                    backgroundColor: 'var(--bg)',
                                    cursor: 'pointer',
                                }}
                            />
                            <span style={{fontSize: '0.85rem'}}>{v.label}</span>
                        </label>
                    ))}
                </div>

                <div style={{display: 'flex', gap: '10px', marginBottom: '25px'}}>
                    <input
                        type="text"
                        placeholder="Paste theme code..."
                        value={importCode}
                        onChange={e => setImportCode(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '6px 10px',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            border: '2px solid var(--dhsCycleBorder)',
                            backgroundColor: 'var(--bg)',
                            color: 'var(--fg)',
                        }}
                    />
                    <button onClick={handleImport} disabled={!importCode.trim()} style={buttonStyle}>
                        Import
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}>
                    <button onClick={handleReset} style={buttonStyle}>Reset Colors</button>
                    <button onClick={handleUpdate} style={buttonStyle}>Update</button>
                    <button onClick={handleCopy} style={buttonStyle}>Copy Theme</button>
                </div>

                {status && (
                    <p style={{
                        textAlign: 'center',
                        marginTop: '15px',
                        color: statusIsError ? '#990000' : 'var(--fg)',
                    }}>
                        {status}
                    </p>
                )}
            </fieldset>

            <DummySchedule/>
        </div>
    );
}
