import { authRouter } from './procedures/auth.js';

// Main app router - plain object per oRPC best practices
export const router = {
	auth: authRouter,
};

// Export the router type for client-side type inference
export type AppRouter = typeof router;
