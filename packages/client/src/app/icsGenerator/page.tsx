'use client';

import {useCallback, useState, useEffect} from 'react';

const buttonStyle: React.CSSProperties = {
    padding: '6px 16px',
    cursor: 'pointer',
    backgroundColor: 'var(--light)',
    color: 'var(--fg)',
    border: '2px solid var(--main)',
    fontSize: '1rem',
    fontFamily: 'inherit',
};

export default function IcsPage() {
    const [lunch, setLunch] = useState<'1' | '2' | '3'>('2');
    const [fridayLunch, setFridayLunch] = useState<'A' | 'B' | 'C'>('B');
    const [period6, setPeriod6] = useState<'6A' | '6B'>('6B');
    const [hasEB, setHasEB] = useState<boolean>(false);
    const [hasSC, setHasSC] = useState<boolean>(false);

    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [statusIsError, setStatusIsError] = useState(false);

    const showStatus = (message: string, isError = false) => {
        setStatus(message);
        setStatusIsError(isError);
    };

    const generateCalendarLink = useCallback(() => {
        const params = new URLSearchParams({
            lunch: lunch,
            friLunch: fridayLunch,
            fri6: period6,
            eb: hasEB ? '1' : '0',
            sc: hasSC ? '1' : '0',
        });
        const link = `webcal://api.dhscycle.com/calendar.ics?${params.toString()}`;
        setGeneratedUrl(link);
        return link;
    }, [lunch, fridayLunch, period6, hasEB, hasSC]);

    useEffect(() => {
        const link = generateCalendarLink();
        setGeneratedUrl(link);
    }, [generateCalendarLink]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedUrl ?? '');
            showStatus('Calendar link copied to clipboard.');
        } catch {
            showStatus('Could not access the clipboard. Your link is in the box above.', true);
        }
    };

    return (
        <div style={{maxWidth: '48rem', margin: '0 auto', padding: 'clamp(15px, 5vw, 30px)'}}>
            <p style={{marginBottom: '20px'}}>
                <a href="/">&larr; Back to schedule</a>
            </p>

            <fieldset style={{
                border: '2px solid var(--dhsCycleBorder)',
                padding: '20px',
            }}>
                <legend style={{padding: '0 8px', fontWeight: 'bold', fontSize: '1.2rem'}}>Calendar Integration</legend>

                <p>Enter your calendar details below to generate a link, which can be entered into your calendar application
                    (e.g., Apple Calendar, Google Calendar). Your data is not sent anywhere.</p>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: 'center',
                    marginTop: '25px',
                    marginBottom: '25px',
                }}>
                    <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Regular Lunch</p>
                        {(['1', '2', '3'] as const).map((val) => (
                            <label key={val} style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="lunch"
                                    value={val}
                                    checked={lunch === val}
                                    onChange={() => setLunch(val)}
                                /> {val}
                            </label>
                        ))}
                    </div>

                    <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Friday Lunch</p>
                        {(['A', 'B', 'C'] as const).map((val) => (
                            <label key={val} style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="fridayLunch"
                                    value={val}
                                    checked={fridayLunch === val}
                                    onChange={() => setFridayLunch(val)}
                                /> {val}
                            </label>
                        ))}
                    </div>

                    <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>6th Period on Friday</p>
                        {(['6A', '6B'] as const).map((val) => (
                            <label key={val} style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="period6"
                                    value={val}
                                    checked={period6 === val}
                                    onChange={() => setPeriod6(val)}
                                /> {val}
                            </label>
                        ))}
                    </div>

                    <div>
                        <label style={{ display: 'block', cursor: 'pointer', marginBottom: '5px' }}>
                            <input
                                type="checkbox"
                                checked={hasEB}
                                onChange={(e) => setHasEB(e.target.checked)}
                            /> Early Bird
                        </label>

                        <label style={{ display: 'block', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={hasSC}
                                onChange={(e) => setHasSC(e.target.checked)}
                            /> Staff Collaboration
                        </label>
                    </div>
                </div>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px'}}>
                    <input
                        type="text"
                        value={generatedUrl ?? ''}
                        readOnly={true}
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
                    <button onClick={copyToClipboard} style={buttonStyle}>
                        Copy to Clipboard
                    </button>
                </div>

                {status && (
                    <p style={{
                        textAlign: 'center',
                        margin: '15px',
                        color: statusIsError ? '#990000' : 'var(--fg)',
                    }}>
                        {status}
                    </p>
                )}

                <p>Report any calendar issues <a href="https://github.com/navickasm/dhscycle/issues" target="_blank" rel="noopener noreferrer">here</a>.</p>
            </fieldset>
        </div>
    );
}
