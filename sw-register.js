// فایل ثبت کننده سرویس ورکر

// بررسی پشتیبانی مرورگر از سرویس ورکر
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('سرویس ورکر با موفقیت ثبت شد:', registration.scope);
            })
            .catch(error => {
                console.error('خطا در ثبت سرویس ورکر:', error);
            });
    });
} 