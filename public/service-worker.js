/**
 * Service Worker para Escuta DF PWA
 * Implementa estratégias de cache para performance em hardware simples
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `escuta-df-${CACHE_VERSION}`;

// Recursos para cache em instalação
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estratégia de fetch: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Pular requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratégia para API: Network First
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar resposta para cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // Se falhar, tentar cache
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Estratégia para recursos estáticos: Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Não cachear respostas inválidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar resposta para cache
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            
            return response;
          })
          .catch(() => {
            return caches.match('/offline.html');
          });
      })
  );
});

// Background Sync para envio offline
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

// Notificações Push (para futuros updates de protocolo)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Atualização disponível',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Escuta DF', options)
  );
});

// Função auxiliar para sincronizar relatórios offline
async function syncReports() {
  // Implementar lógica de sincronização
  console.log('[Service Worker] Sincronizando relatórios offline...');
  // TODO: Buscar do IndexedDB e enviar para API
}
