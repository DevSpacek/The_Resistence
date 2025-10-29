const CACHE_NAME = "the-resistance-v1";

// Detecta automaticamente o caminho base (funciona com GitHub Pages e localhost)
const getBasePath = () => {
	const path = self.location.pathname;
	const match = path.match(/^\/[^\/]+\//);
	return match ? match[0] : '/';
};

const BASE_PATH = getBasePath();

const urlsToCache = [
	`${BASE_PATH}`,
	`${BASE_PATH}index.html`,
	`${BASE_PATH}reveal.html`,
	`${BASE_PATH}styles.css`,
	`${BASE_PATH}js/game.js`,
	`${BASE_PATH}js/setup.js`,
	`${BASE_PATH}js/reveal.js`,
	`${BASE_PATH}manifest.json`,
];

// Install Service Worker
self.addEventListener("install", (event) => {
	console.log("[Service Worker] Instalando...");
	console.log("[Service Worker] Base Path:", BASE_PATH);
	console.log("[Service Worker] URLs para cache:", urlsToCache);
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("[Service Worker] Cache aberto");
			return cache.addAll(urlsToCache).catch((err) => {
				console.error("[Service Worker] Erro ao adicionar ao cache:", err);
				console.error("[Service Worker] Tentando cache individual...");
				// Tenta adicionar um por um para identificar o problema
				return Promise.all(
					urlsToCache.map(url => 
						cache.add(url).catch(e => console.error(`Erro ao cachear ${url}:`, e))
					)
				);
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
