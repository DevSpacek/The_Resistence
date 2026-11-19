const CACHE_NAME = "the-resistance-v9"; // Bust stale HTML & JS caches across all pages

// Detecta automaticamente o caminho base (funciona com GitHub Pages e localhost)
const getBasePath = () => {
	const path = self.location.pathname;
	const match = path.match(/^\/[^\/]+\//);
	return match ? match[0] : "/";
};

const BASE_PATH = getBasePath();

const urlsToCache = [
	`${BASE_PATH}`,
	`${BASE_PATH}index.html`,
	`${BASE_PATH}reveal.html`,
	`${BASE_PATH}multiplayer.html`,
	`${BASE_PATH}master.html`,
	`${BASE_PATH}styles.css`,
	`${BASE_PATH}js/game.js`,
	`${BASE_PATH}js/board.js`,
	`${BASE_PATH}js/setup.js`,
	`${BASE_PATH}js/reveal.js`,
	`${BASE_PATH}js/multiplayer.js`,
	`${BASE_PATH}images_back/mission-map.png`,
	`${BASE_PATH}images_back/token-ally.png`,
	`${BASE_PATH}images_back/token-axis.png`,
	`${BASE_PATH}manifest.json`,
];

// Install Service Worker
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return Promise.all(
				urlsToCache.map((url) =>
					cache.add(url).catch((e) => console.warn(`Cache skip ${url}:`, e))
				)
			);
		})
	);
	self.skipWaiting();
});

// Network-first fetch with cache fallback for offline support
self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;
	event.respondWith(
		fetch(event.request)
			.then((networkResponse) => {
				if (networkResponse && networkResponse.status === 200) {
					const responseClone = networkResponse.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseClone);
					});
				}
				return networkResponse;
			})
			.catch(() => {
				return caches.match(event.request);
			})
	);
});

// Update Service Worker
self.addEventListener("activate", (event) => {
	console.log("[Service Worker] Ativando v2...");
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheWhitelist.indexOf(cacheName) === -1) {
							console.log(
								"[Service Worker] Deletando cache antigo:",
								cacheName
							);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => {
				console.log("[Service Worker] Controlando todas as páginas...");
				return self.clients.claim();
			})
	);
});
