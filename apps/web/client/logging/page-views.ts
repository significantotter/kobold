import {
	START_LOCATION,
	type RouteLocationNormalizedLoaded,
	type Router,
} from 'vue-router';

type PageNavigationType = 'landing' | 'navigation';

function getDocumentNavigationType(): string | null {
	const entry = performance.getEntriesByType('navigation')[0] as
		| PerformanceNavigationTiming
		| undefined;
	return entry?.type ?? null;
}

function getRouteName(route: RouteLocationNormalizedLoaded): string | null {
	return typeof route.name === 'string' ? route.name : null;
}

function getRoutePattern(route: RouteLocationNormalizedLoaded): string | null {
	return route.matched.at(-1)?.path ?? null;
}

export function installPageViewLogging(router: Router): void {
	router.afterEach((to, from, failure) => {
		if (failure) return;

		const navigationType: PageNavigationType =
			from === START_LOCATION ? 'landing' : 'navigation';

		void fetch('/telemetry/page-view', {
			method: 'POST',
			credentials: 'include',
			keepalive: true,
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				navigationType,
				path: to.path,
				fromPath: navigationType === 'navigation' ? from.path : null,
				routeName: getRouteName(to),
				routePattern: getRoutePattern(to),
				documentNavigationType:
					navigationType === 'landing' ? getDocumentNavigationType() : null,
			}),
		}).catch(() => {
			// Telemetry must never interfere with navigation.
		});
	});
}
