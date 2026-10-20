'use client';

import {useEffect} from 'react';
import {applyTheme, holidayTheme, loadTheme} from '../theme.ts';

export default function ThemeApplier() {
    useEffect(() => {
        const theme = holidayTheme() ?? loadTheme();
        if (theme) applyTheme(theme);
    }, []);

    return null;
}
