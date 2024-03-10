import { ErrorRequestHandler } from 'express';

import { Logger } from '../services/index.js';

export function handleError(): ErrorRequestHandler {
	return (error, req, res, _next) => {
		Logger.error(
			`An error occurred while processing a '${req.method}' request to '${req.url}'.`,
			error
		);
		res.status(500).json({ error: true, message: error.message });
	};
}
