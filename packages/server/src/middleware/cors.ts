import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000',
    'https://www.dhscycle.com',
    'http://www.dhscycle.com',
    'https://dhscycle.com',
    'http://dhscycle.com',
];

export const corsMiddleware = cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
});
