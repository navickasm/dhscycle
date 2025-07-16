import { Paper, Typography } from '@mui/material';

interface PeriodBlockProps {
    period: {
        name: string;
        time: string;
    };
    index: number;
}

export default function PeriodBlock(p: PeriodBlockProps) {
    return (
        <Paper
            elevation={2}
            sx={{
                padding: 1,
                textAlign: 'center',
                width: '240px',
                height: '40px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                mx: 'auto',
            }}
        >
            <Typography variant="h6" fontWeight="medium" color="text.primary" sx={{ lineHeight: 1 }}>
                {p.period.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
                {p.period.time}
            </Typography>
        </Paper>
    );
}