import { authRouter } from './procedures/auth.js';
import { characterRouter } from './procedures/character.js';

// Main app router - plain object per oRPC best practices
export const router = {
	auth: authRouter,
	character: characterRouter,
};

// Export the router type for client-side type inference
export type AppRouter = typeof router;
