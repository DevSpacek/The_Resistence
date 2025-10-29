const CACHE_NAME = "the-resistance-v1";
const urlsToCache = [
	"./",
	"./index.html",
	"./reveal.html",
	"./styles.css",
	"./js/game.js",
	"./js/setup.js",
	"./js/reveal.js",
	"./manifest.json",
];

// Install Service Worker
self.addEventListener("install", (event) => {
	console.log("[Service Worker] Instalando...");
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("[Service Worker] Cache aberto");
			return cache.addAll(urlsToCache).catch((err) => {
				console.error("[Service Worker] Erro ao adicionar ao cache:", err);
			});
		})
	);
	self.skipWaiting();
});

// Fetch from cache
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Cache hit - return response
			if (response) {
				return response;
			}
			return fetch(event.request).catch((err) => {
				console.error("[Service Worker] Erro no fetch:", err);
			});
		})
	);
});

// Update Service Worker
self.addEventListener("activate", (event) => {
	console.log("[Service Worker] Ativando...");
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						console.log("[Service Worker] Deletando cache antigo:", cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	return self.clients.claim();
});
