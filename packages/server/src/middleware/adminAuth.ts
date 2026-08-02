import {NextFunction, Request, Response} from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
}
