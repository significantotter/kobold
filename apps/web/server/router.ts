import { authRouter } from './procedures/auth.js';
import { characterRouter } from './procedures/character.js';
import { libraryRouter } from './procedures/library.js';

// Main app router - plain object per oRPC best practices
export const router: {
	auth: typeof authRouter;
	character: typeof characterRouter;
	library: typeof libraryRouter;
} = {
	auth: authRouter,
	character: characterRouter,
	library: libraryRouter,
};

// Export the router type for client-side type inference
export type AppRouter = typeof router;
