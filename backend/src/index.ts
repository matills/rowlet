import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';
import { healthRouter } from './routes/health.js';
import { searchRouter } from './routes/search.js';
import { contentRouter } from './routes/content.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/search', searchRouter);
app.use('/api/content', contentRouter);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Owlist API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
