import express, { Express } from 'express';
import util from 'node:util';

import { Controller } from '../controllers/index.js';
import { checkAuth, handleError } from '../middleware/index.js';
import { Logger } from '../services/index.js';
import { Config } from 'kobold-config';

type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;
type GenericFunction<TS extends any[], R> = (...args: TS) => R;
type Promisify<T> = {
	[K in keyof T]: T[K] extends GenericFunction<infer TS, infer R>
		? (...args: TS) => Promise<UnpackedPromise<R>>
		: never;
};

export class Api {
	protected app: Express;

	constructor(public controllers: Controller[]) {
		this.app = express();
		this.app.use(express.json());
		this.setupControllers();
		this.app.use(handleError());
	}

	public async start(): Promise<void> {
		let listen = util.promisify(this.app.listen.bind(this.app)) as Promisify<
			typeof this.app.listen
		>;
		const appListenPromise = new Promise<void>((resolve, reject) => {
			this.app.listen(Config.api.port, () => {
				resolve();
			});
		});
		await appListenPromise;
		Logger.info(`API started on port ${Config.api.port}.`);
	}

	protected setupControllers(): void {
		for (let controller of this.controllers) {
			if (controller.authToken) {
				controller.router.use(checkAuth(controller.authToken));
			}
			controller.register();
			this.app.use(controller.path, controller.router);
		}
	}
}
