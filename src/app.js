import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import errorHandling from './middlewares/errorHandling.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.use(errorHandling);

export default app;