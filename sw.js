// تم تحديث رقم1 الإصدار واسم الكاش ليتوافق مع "كايدو فولو" والتصميم الفخم (v4.0)
const CACHE_NAME = 'kaido-cache-v5.0';
const urlsToCache = [
    './',
    './index.html',
    './admin.html',
    './manifest.json',
    './logo.jpg' // تأكد أن اسم صورة اللوجو لديك مطابق لهذا
];

// حدث التثبيت: إجبار الهاتف على قبول النسخة الجديدة فوراً
self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

// حدث التفعيل: مسح أي ذاكرة قديمة (الإصدارات السابقة) لتنظيف هاتف المستخدم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // إذا كان اسم الكاش القديم لا يطابق الاسم الجديد (kaido-cache-v4.0)، قم بحذفه فوراً
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// حدث الجلب: استراتيجية "الشبكة أولاً" لملفات HTML لضمان وصول التحديثات
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate' || event.request.url.includes('.html')) {
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
        // للملفات الأخرى استخدم الذاكرة أولاً لسرعة التحميل وتوفير باقة الإنترنت
        event.respondWith(
            caches.match(event.request)
            .then(response => response || fetch(event.request))
        );
    }
});
