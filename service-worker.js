// فایل سرویس ورکر برای برنامه تغییر سایز و فرمت عکس

// نسخه کش
const CACHE_VERSION = 'v1';
const CACHE_NAME = `image-resizer-${CACHE_VERSION}`;

// فایل‌هایی که باید کش شوند
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/sw-register.js',
    '/manifest.json',
    '/icons/favicon.ico',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/icons/maskable-icon.png',
    'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
    'https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3.1.2/dist/svg.min.js',
    'https://cdn.jsdelivr.net/npm/potrace@2.1.8/potrace.min.js',
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap',
];

// نصب سرویس ورکر و کش کردن فایل‌ها
self.addEventListener('install', event => {
    console.log('[سرویس ورکر] نصب شد');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[سرویس ورکر] در حال کش کردن فایل‌ها');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('[سرویس ورکر] تمام فایل‌ها با موفقیت کش شدند');
                return self.skipWaiting();
            })
    );
});

// فعال‌سازی سرویس ورکر و پاکسازی کش‌های قدیمی
self.addEventListener('activate', event => {
    console.log('[سرویس ورکر] فعال شد');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName.includes('image-resizer-')) {
                        console.log('[سرویس ورکر] حذف کش قدیمی', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[سرویس ورکر] اکنون به عنوان کنترل‌کننده صفحات فعال است');
            return self.clients.claim();
        })
    );
});

// مدیریت درخواست‌های شبکه
self.addEventListener('fetch', event => {
    console.log('[سرویس ورکر] درخواست:', event.request.url);
    
    // استراتژی Network First برای فایل‌های خارجی و صفحه اصلی
    if (event.request.url.includes('cdn.jsdelivr.net') || 
        event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('fonts.gstatic.com') ||
        event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // ذخیره پاسخ در کش
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    // اگر آفلاین هستیم، از کش استفاده کن
                    return caches.match(event.request);
                })
        );
    } else {
        // استراتژی Cache First برای سایر فایل‌ها
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    return fetch(event.request)
                        .then(response => {
                            // ذخیره پاسخ در کش
                            const clonedResponse = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, clonedResponse);
                            });
                            return response;
                        });
                })
        );
    }
}); 