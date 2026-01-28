import { Router, type Request, type Response } from 'express';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        service: 'owlist-api',
    });
});

export const healthRouter: Router = router;
