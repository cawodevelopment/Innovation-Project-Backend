import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import recipeRoutes from './routes/recipe.routes.js';
import dietRoutes from './routes/diet.routes.js';
import errorHandling from './middlewares/errorHandling.middleware.js';
import { authLimiter, apiLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: process.env.FRONTEND_ORIGIN,
		credentials: true
	})
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authLimiter, authRoutes);
app.use('/users', apiLimiter, userRoutes);
app.use('/recipes', apiLimiter, recipeRoutes);
app.use('/diet', apiLimiter, dietRoutes);

app.use(errorHandling);

export default app;