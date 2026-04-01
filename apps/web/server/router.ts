import { os } from '@orpc/server';
import { authRouter } from './procedures/auth.js';

// Create the oRPC instance
const orpc = os;

// Main app router - combines all procedure routers
export const appRouter = orpc.router({
	auth: authRouter,
});

// Export the router type for client-side type inference
export type AppRouter = typeof appRouter;
