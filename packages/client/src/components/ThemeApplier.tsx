'use client';

import {useEffect} from 'react';
import {applyTheme, loadTheme} from '../theme.ts';

export default function ThemeApplier() {
    useEffect(() => {
        const theme = loadTheme();
        if (theme) applyTheme(theme);
    }, []);

    return null;
}
