// تغيير رقم الإصدار لفرض التحديث على هواتف المستخدمين
const CACHE_NAME = 'kaido-cache-v1.2';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './logo.jpg'
];

// حدث التثبيت: إجبار الهاتف على قبول النسخة الجديدة فوراً
self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

// حدث التفعيل: مسح أي ذاكرة قديمة (الإصدارات السابقة) لتنظيف التطبيق
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// حدث الجلب: استراتيجية "الشبكة أولاً" للملفات الأساسية
self.addEventListener('fetch', event => {
    // إذا كان الطلب يخص واجهة التطبيق (HTML)، جربه من الإنترنت أولاً لضمان أحدث نسخة
    if (event.request.mode === 'navigate' || event.request.url.includes('index.html')) {
        event.respondWith(
            fetch(event.request)
            .then(response => {
                // حفظ النسخة الجديدة في الذاكرة
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => caches.match(event.request)) // في حال عدم وجود إنترنت، استخدم الذاكرة
        );
    } else {
        // للملفات الأخرى (الصور والمانيفيست)، استخدم الذاكرة أولاً لسرعة التحميل
        event.respondWith(
            caches.match(event.request)
            .then(response => response || fetch(event.request))
        );
    }
});
