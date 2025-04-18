document.addEventListener('DOMContentLoaded', () => {
    // تعریف المان‌های DOM
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-btn');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileDimensions = document.getElementById('file-dimensions');
    const previewImage = document.getElementById('preview-image');
    
    // المان‌های جدید مربوط به فرمت
    const formatOptions = document.getElementById('format-options');
    const formatRadios = document.querySelectorAll('input[name="format"]');
    const qualityContainer = document.getElementById('quality-container');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const startConversionBtn = document.getElementById('start-conversion');
    
    // المان‌های مربوط به تم و نصب
    const themeToggle = document.getElementById('theme-toggle');
    const installContainer = document.getElementById('install-container');
    const installBtn = document.getElementById('install-btn');
    
    // المان‌های مربوط به سایز دستی
    const customSizesToggle = document.getElementById('custom-sizes-toggle');
    const customSizesPanel = document.getElementById('custom-sizes-panel');
    const customSizesList = document.getElementById('custom-sizes-list');
    const addSizeBtn = document.getElementById('add-size-btn');
    const preserveRatioCheckbox = document.getElementById('preserve-ratio');
    
    const processing = document.getElementById('processing');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const sizesContainer = document.getElementById('sizes-container');
    const sizesGrid = document.getElementById('sizes-grid');
    const downloadZipBtn = document.getElementById('download-zip');

    // تعریف ۱۵ سایز پرکاربرد
    const defaultSizes = [
        { width: 16, height: 16, label: 'فاویکون کوچک', description: '16×16 پیکسل' },
        { width: 32, height: 32, label: 'فاویکون استاندارد', description: '32×32 پیکسل' },
        { width: 48, height: 48, label: 'آیکون اکستنشن', description: '48×48 پیکسل' },
        { width: 64, height: 64, label: 'آیکون کوچک', description: '64×64 پیکسل' },
        { width: 96, height: 96, label: 'آیکون متوسط', description: '96×96 پیکسل' },
        { width: 128, height: 128, label: 'آیکون بزرگ', description: '128×128 پیکسل' },
        { width: 192, height: 192, label: 'آیکون PWA', description: '192×192 پیکسل' },
        { width: 256, height: 256, label: 'بنر اکستنشن', description: '256×256 پیکسل' },
        { width: 512, height: 512, label: 'بنر فروشگاه', description: '512×512 پیکسل' },
        { width: 640, height: 480, label: 'تصویر وب‌سایت', description: '640×480 پیکسل' },
        { width: 800, height: 600, label: 'تصویر وب‌سایت', description: '800×600 پیکسل' },
        { width: 1024, height: 1024, label: 'تصویر بزرگ', description: '1024×1024 پیکسل' },
        { width: 1280, height: 720, label: 'HD', description: '1280×720 پیکسل' },
        { width: 1920, height: 1080, label: 'Full HD', description: '1920×1080 پیکسل' },
        { width: 2048, height: 2048, label: 'آیکون بسیار بزرگ', description: '2048×2048 پیکسل' }
    ];

    // متغیر برای ذخیره سایزهای فعال (پیش‌فرض یا دستی)
    let sizes = [...defaultSizes];
    
    // متغیرهای سراسری
    let originalImage = null;
    let originalFileName = '';
    let originalFileExtension = '';
    let resizedImages = [];
    
    // متغیرهای مربوط به تنظیمات فرمت
    let selectedFormat = 'original';
    let selectedQuality = 0.9;
    let outputExtension = '';
    
    // متغیرهای مربوط به نصب PWA
    let deferredPrompt = null;

    // تنظیم حالت تم براساس ترجیحات کاربر
    initTheme();
    
    // تنظیم رویدادهای Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('drag-over');
        });
    });

    dropArea.addEventListener('drop', handleDrop);
    
    // دکمه انتخاب فایل
    selectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);
    
    // رویدادهای مربوط به انتخاب فرمت
    formatRadios.forEach(radio => {
        radio.addEventListener('change', updateFormatOptions);
    });
    
    qualitySlider.addEventListener('input', () => {
        const value = qualitySlider.value;
        qualityValue.textContent = `${value}%`;
        selectedQuality = value / 100;
    });
    
    startConversionBtn.addEventListener('click', startResizing);
    
    // دکمه تغییر تم
    themeToggle.addEventListener('click', toggleTheme);
    
    // رویدادهای مربوط به نصب PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        // ذخیره رویداد برای استفاده بعدی
        deferredPrompt = e;
        // دکمه نصب را نمایش نمی‌دهیم چون از دکمه مرورگر استفاده می‌کنیم
        installContainer.hidden = true; // همیشه مخفی می‌ماند
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('برنامه با موفقیت نصب شد');
    });
    
    // رویدادهای مربوط به تنظیم سایز دستی
    customSizesToggle.addEventListener('change', () => {
        customSizesPanel.hidden = !customSizesToggle.checked;
        updateSizesArray();
    });
    
    addSizeBtn.addEventListener('click', () => {
        addCustomSizeInput();
    });
    
    // تنظیم اولیه حداقل یک فیلد تنظیم سایز
    initCustomSizeFields();
    
    // تنظیم اولیه تم
    function initTheme() {
        // بررسی تنظیمات ذخیره شده قبلی
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // تنظیم تم براساس ترجیحات کاربر
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    // تغییر حالت تم
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // تنظیم تم جدید
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // ذخیره انتخاب کاربر
        localStorage.setItem('theme', newTheme);
    }
    
    // مقداردهی اولیه فیلدهای تنظیم سایز دستی
    function initCustomSizeFields() {
        // اولین فیلد را اضافه می‌کنیم
        const firstItem = customSizesList.querySelector('.custom-size-item');
        if (firstItem) {
            setupCustomSizeItem(firstItem);
        }
    }
    
    // افزودن فیلد جدید برای تنظیم سایز
    function addCustomSizeInput() {
        const newItem = document.createElement('div');
        newItem.className = 'custom-size-item';
        newItem.innerHTML = `
            <div class="size-inputs">
                <input type="number" class="size-input width-input" placeholder="عرض" min="1" max="5000">
                <span class="size-separator">×</span>
                <input type="number" class="size-input height-input" placeholder="ارتفاع" min="1" max="5000">
            </div>
            <button class="remove-size" title="حذف این سایز">×</button>
        `;
        
        customSizesList.appendChild(newItem);
        setupCustomSizeItem(newItem);
        
        // فعال کردن دکمه حذف برای همه آیتم‌ها، اگر بیش از یک آیتم داریم
        updateRemoveButtons();
    }
    
    // تنظیم رویدادهای مربوط به هر فیلد سایز
    function setupCustomSizeItem(item) {
        const widthInput = item.querySelector('.width-input');
        const heightInput = item.querySelector('.height-input');
        const removeButton = item.querySelector('.remove-size');
        
        // رویداد تغییر ورودی‌ها
        [widthInput, heightInput].forEach(input => {
            input.addEventListener('input', () => {
                // اگر حفظ نسبت فعال باشد و نسبت اصلی در دسترس باشد
                if (preserveRatioCheckbox.checked && originalImage) {
                    const originalRatio = originalImage.width / originalImage.height;
                    
                    if (input === widthInput && widthInput.value) {
                        // محاسبه ارتفاع براساس عرض وارد شده
                        const newWidth = parseInt(widthInput.value);
                        const newHeight = Math.round(newWidth / originalRatio);
                        heightInput.value = newHeight;
                    } else if (input === heightInput && heightInput.value) {
                        // محاسبه عرض براساس ارتفاع وارد شده
                        const newHeight = parseInt(heightInput.value);
                        const newWidth = Math.round(newHeight * originalRatio);
                        widthInput.value = newWidth;
                    }
                }
                
                updateSizesArray();
            });
        });
        
        // رویداد دکمه حذف
        removeButton.addEventListener('click', () => {
            item.remove();
            updateRemoveButtons();
            updateSizesArray();
        });
    }
    
    // به‌روزرسانی وضعیت دکمه‌های حذف
    function updateRemoveButtons() {
        const items = customSizesList.querySelectorAll('.custom-size-item');
        
        items.forEach(item => {
            const removeButton = item.querySelector('.remove-size');
            removeButton.disabled = items.length <= 1;
        });
    }
    
    // به‌روزرسانی آرایه سایزها براساس انتخاب کاربر
    function updateSizesArray() {
        if (customSizesToggle.checked) {
            // استفاده از سایزهای دستی
            const customSizes = [];
            const items = customSizesList.querySelectorAll('.custom-size-item');
            
            items.forEach(item => {
                const widthInput = item.querySelector('.width-input');
                const heightInput = item.querySelector('.height-input');
                
                const width = parseInt(widthInput.value);
                const height = parseInt(heightInput.value);
                
                if (width && height && width > 0 && height > 0) {
                    customSizes.push({
                        width,
                        height,
                        label: `سایز دستی`,
                        description: `${width}×${height} پیکسل`
                    });
                }
            });
            
            sizes = customSizes.length > 0 ? customSizes : [...defaultSizes];
        } else {
            // استفاده از سایزهای پیش‌فرض
            sizes = [...defaultSizes];
        }
    }
    
    // به‌روزرسانی گزینه‌های فرمت
    function updateFormatOptions() {
        selectedFormat = document.querySelector('input[name="format"]:checked').value;
        
        // نمایش اسلایدر کیفیت برای JPEG و WebP
        if (selectedFormat === 'jpeg' || selectedFormat === 'webp') {
            qualityContainer.hidden = false;
        } else {
            qualityContainer.hidden = true;
        }
        
        // تنظیم پسوند خروجی
        switch (selectedFormat) {
            case 'original':
                outputExtension = originalFileExtension;
                break;
            case 'png':
                outputExtension = 'png';
                break;
            case 'jpeg':
                outputExtension = 'jpg';
                break;
            case 'webp':
                outputExtension = 'webp';
                break;
            case 'svg':
                outputExtension = 'svg';
                break;
        }
    }

    // مدیریت فایل رها شده
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    // مدیریت انتخاب فایل
    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    }

    // پردازش فایل ورودی
    function processFile(file) {
        if (!file.type.match('image.*')) {
            alert('لطفاً یک فایل تصویری انتخاب کنید.');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            // ذخیره اطلاعات فایل اصلی
            originalImage = new Image();
            
            // استخراج نام و پسوند فایل
            const fullFileName = file.name;
            const lastDotIndex = fullFileName.lastIndexOf('.');
            originalFileName = fullFileName.substring(0, lastDotIndex);
            originalFileExtension = fullFileName.substring(lastDotIndex + 1).toLowerCase();
            outputExtension = originalFileExtension; // تنظیم اولیه پسوند خروجی
            
            // انتخاب گزینه "حفظ فرمت اصلی" به صورت پیش‌فرض
            document.getElementById('format-original').checked = true;
            updateFormatOptions();
            
            // نمایش اطلاعات فایل
            fileName.textContent = fullFileName;
            fileSize.textContent = formatFileSize(file.size);
            
            // بارگذاری تصویر
            originalImage.onload = function() {
                // نمایش ابعاد تصویر
                fileDimensions.textContent = `${originalImage.width} × ${originalImage.height} پیکسل`;
                
                // نمایش پیش‌نمایش و اطلاعات فایل
                previewImage.src = e.target.result;
                fileInfo.hidden = false;
                
                // نمایش گزینه‌های فرمت
                formatOptions.hidden = false;
            };
            
            originalImage.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    // تبدیل سایز فایل به فرمت خوانا
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' بایت';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' کیلوبایت';
        else return (bytes / 1048576).toFixed(2) + ' مگابایت';
    }

    // شروع فرآیند تغییر سایز
    function startResizing() {
        // به‌روزرسانی آرایه سایزها قبل از شروع
        updateSizesArray();
        
        // بررسی وجود حداقل یک سایز معتبر
        if (sizes.length === 0) {
            alert('لطفاً حداقل یک سایز معتبر وارد کنید.');
            return;
        }
        
        // نمایش بخش پردازش
        formatOptions.hidden = true;
        processing.hidden = false;
        sizesContainer.hidden = true;
        
        // پاکسازی نتایج قبلی
        sizesGrid.innerHTML = '';
        resizedImages = [];
        
        // شروع تغییر سایز
        resizeImageSequentially(0);
    }
    
    // تغییر سایز تصاویر به صورت ترتیبی برای نمایش پیشرفت
    function resizeImageSequentially(index) {
        if (index >= sizes.length) {
            // پایان فرآیند
            processing.hidden = true;
            sizesContainer.hidden = false;
            return;
        }
        
        // به‌روزرسانی نوار پیشرفت
        const progress = ((index + 1) / sizes.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${index + 1} از ${sizes.length}`;
        
        // تغییر سایز تصویر فعلی
        const size = sizes[index];
        
        // اگر فرمت انتخابی SVG است اما تابع SVG کار نمی‌کند، از PNG استفاده کن
        if (selectedFormat === 'svg') {
            try {
                // تلاش برای تبدیل به SVG
                createSVG(originalImage, size)
                    .then(result => {
                        // ذخیره نتیجه
                        resizedImages.push(result);
                        
                        // ایجاد المان نمایش
                        createSizeItem(result);
                        
                        // ادامه با تصویر بعدی
                        setTimeout(() => {
                            resizeImageSequentially(index + 1);
                        }, 100);
                    })
                    .catch(error => {
                        console.error('خطا در تبدیل به SVG:', error);
                        
                        // در صورت خطا، به PNG تبدیل کن
                        console.log('استفاده از PNG به جای SVG به دلیل خطا');
                        
                        // تنظیم موقت فرمت به PNG
                        const originalFormat = selectedFormat;
                        selectedFormat = 'png';
                        outputExtension = 'png';
                        
                        resizeImage(originalImage, size)
                            .then(result => {
                                // ذخیره نتیجه
                                resizedImages.push(result);
                                
                                // ایجاد المان نمایش
                                createSizeItem(result);
                                
                                // بازگرداندن فرمت اصلی
                                selectedFormat = originalFormat;
                                outputExtension = 'svg';
                                
                                // ادامه با تصویر بعدی
                                setTimeout(() => {
                                    resizeImageSequentially(index + 1);
                                }, 100);
                            });
                    });
            } catch (e) {
                console.error('خطا در اجرای تابع createSVG:', e);
                
                // تنظیم موقت فرمت به PNG
                const originalFormat = selectedFormat;
                selectedFormat = 'png';
                outputExtension = 'png';
                
                resizeImage(originalImage, size)
                    .then(result => {
                        // ذخیره نتیجه
                        resizedImages.push(result);
                        
                        // ایجاد المان نمایش
                        createSizeItem(result);
                        
                        // بازگرداندن فرمت اصلی
                        selectedFormat = originalFormat;
                        outputExtension = 'svg';
                        
                        // ادامه با تصویر بعدی
                        setTimeout(() => {
                            resizeImageSequentially(index + 1);
                        }, 100);
                    });
            }
        } else if (selectedFormat === 'ico') {
            // تبدیل به فرمت ICO با استفاده از PNG به عنوان واسطه
            resizeImage(originalImage, size, 'png')
                .then(result => {
                    // ذخیره نتیجه با تغییر پسوند
                    const icoResult = {
                        ...result,
                        fileName: getFileName(size, 'ico'),
                        type: 'image/x-icon'
                    };
                    
                    resizedImages.push(icoResult);
                    
                    // ایجاد المان نمایش
                    createSizeItem(icoResult);
                    
                    // ادامه با تصویر بعدی
                    setTimeout(() => {
                        resizeImageSequentially(index + 1);
                    }, 100);
                });
        } else {
            resizeImage(originalImage, size)
                .then(result => {
                    // ذخیره نتیجه
                    resizedImages.push(result);
                    
                    // ایجاد المان نمایش
                    createSizeItem(result);
                    
                    // ادامه با تصویر بعدی
                    setTimeout(() => {
                        resizeImageSequentially(index + 1);
                    }, 100);
                });
        }
    }

    // تغییر سایز تصویر با پشتیبانی از تعیین فرمت اختیاری
    function resizeImage(image, size, overrideFormat = null) {
        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            canvas.width = size.width;
            canvas.height = size.height;
            const ctx = canvas.getContext('2d');
            
            // تنظیم کیفیت تصویر
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // حفظ نسبت تصویر
            let targetWidth, targetHeight, startX, startY;
            
            const originalRatio = image.width / image.height;
            const targetRatio = size.width / size.height;
            
            if (originalRatio > targetRatio) {
                // عرض بیشتر از ارتفاع است (نسبت به هدف)
                targetHeight = size.height;
                targetWidth = targetHeight * originalRatio;
                startX = (size.width - targetWidth) / 2;
                startY = 0;
            } else {
                // ارتفاع بیشتر از عرض است (نسبت به هدف)
                targetWidth = size.width;
                targetHeight = targetWidth / originalRatio;
                startX = 0;
                startY = (size.height - targetHeight) / 2;
            }
            
            // پر کردن پس‌زمینه با شفافیت
            ctx.clearRect(0, 0, size.width, size.height);
            
            // رسم تصویر با اندازه مناسب
            ctx.drawImage(image, startX, startY, targetWidth, targetHeight);
            
            // تنظیم فرمت خروجی و کیفیت براساس انتخاب کاربر
            let type = 'image/png';
            let quality = 0.9;
            let extension = outputExtension;
            
            // استفاده از فرمت override اگر تعیین شده باشد
            if (overrideFormat) {
                switch (overrideFormat) {
                    case 'png':
                        type = 'image/png';
                        extension = 'png';
                        break;
                    case 'jpeg':
                    case 'jpg':
                        type = 'image/jpeg';
                        quality = selectedQuality;
                        extension = 'jpg';
                        break;
                    case 'webp':
                        type = 'image/webp';
                        quality = selectedQuality;
                        extension = 'webp';
                        break;
                    case 'ico':
                        type = 'image/x-icon';
                        extension = 'ico';
                        break;
                }
            } else {
                switch (selectedFormat) {
                    case 'original':
                        // حفظ فرمت اصلی
                        if (originalFileExtension === 'jpg' || originalFileExtension === 'jpeg') {
                            type = 'image/jpeg';
                            quality = selectedQuality;
                        } else if (originalFileExtension === 'webp') {
                            type = 'image/webp';
                            quality = selectedQuality;
                        } else if (originalFileExtension === 'ico') {
                            type = 'image/x-icon';
                        } else {
                            type = 'image/png';
                        }
                        break;
                    case 'png':
                        type = 'image/png';
                        break;
                    case 'jpeg':
                        type = 'image/jpeg';
                        quality = selectedQuality;
                        break;
                    case 'webp':
                        type = 'image/webp';
                        quality = selectedQuality;
                        break;
                    case 'ico':
                        type = 'image/x-icon';
                        break;
                }
            }
            
            // تبدیل به DataURL
            const dataUrl = canvas.toDataURL(type, quality);
            
            // ساخت شیء نتیجه
            resolve({
                dataUrl,
                size,
                fileName: getFileName(size, extension),
                type
            });
        });
    }
    
    // تبدیل تصویر به SVG
    function createSVG(image, size) {
        return new Promise((resolve, reject) => {
            try {
                // بررسی وجود کتابخانه‌های مورد نیاز
                if (typeof potrace === 'undefined') {
                    console.error('کتابخانه Potrace بارگذاری نشده است');
                    reject(new Error('کتابخانه Potrace بارگذاری نشده است'));
                    return;
                }
                
                if (typeof SVG === 'undefined') {
                    console.error('کتابخانه SVG.js بارگذاری نشده است');
                    reject(new Error('کتابخانه SVG.js بارگذاری نشده است'));
                    return;
                }
                
                // ایجاد کنواس موقت برای تغییر سایز تصویر اصلی
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = size.width;
                tempCanvas.height = size.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                // حفظ نسبت تصویر
                let targetWidth, targetHeight, startX, startY;
                
                const originalRatio = image.width / image.height;
                const targetRatio = size.width / size.height;
                
                if (originalRatio > targetRatio) {
                    // عرض بیشتر از ارتفاع است (نسبت به هدف)
                    targetHeight = size.height;
                    targetWidth = targetHeight * originalRatio;
                    startX = (size.width - targetWidth) / 2;
                    startY = 0;
                } else {
                    // ارتفاع بیشتر از عرض است (نسبت به هدف)
                    targetWidth = size.width;
                    targetHeight = targetWidth / originalRatio;
                    startX = 0;
                    startY = (size.height - targetHeight) / 2;
                }
                
                // پر کردن پس‌زمینه با رنگ سفید
                tempCtx.fillStyle = '#FFFFFF';
                tempCtx.fillRect(0, 0, size.width, size.height);
                
                // رسم تصویر با اندازه مناسب
                tempCtx.drawImage(image, startX, startY, targetWidth, targetHeight);
                
                // دریافت داده‌های تصویر
                const imageData = tempCtx.getImageData(0, 0, size.width, size.height);
                
                // تبدیل تصویر به سیاه و سفید برای تبدیل بهتر به SVG
                const grayData = new Uint8ClampedArray(imageData.data.length / 4);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const a = imageData.data[i + 3];
                    
                    // تبدیل به سطح خاکستری با در نظر گرفتن شفافیت
                    if (a < 128) {
                        grayData[i / 4] = 255; // شفاف یا سفید
                    } else {
                        grayData[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    }
                }
                
                // تنظیمات پیشرفته برای تبدیل به SVG
                const potraceOptions = {
                    turdsize: 2,  // حذف نویز کوچک
                    turnpolicy: potrace.TURNPOLICY_MINORITY,
                    alphamax: 1,  // مقدار کمتر برای خطوط زاویه‌دار بیشتر
                    opticurve: true,  // منحنی‌های بهینه
                    optidist: 0.8,  // تطابق منحنی
                    width: size.width,
                    height: size.height,
                    threshold: 128  // حد آستانه سیاه و سفید
                };
                
                // ایجاد SVG با استفاده از Potrace
                const pngData = {
                    data: grayData,
                    width: size.width,
                    height: size.height
                };
                
                // تبدیل به مسیرهای SVG
                try {
                    const svgString = potrace.getSVG(pngData, potraceOptions);
                    
                    // ایجاد SVG با امکانات بیشتر با استفاده از SVG.js
                    const draw = SVG().size(size.width, size.height);
                    
                    // استخراج مسیرهای SVG از خروجی Potrace
                    const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g;
                    let match;
                    let pathsFound = 0;
                    
                    while ((match = pathRegex.exec(svgString)) !== null) {
                        pathsFound++;
                        const pathD = match[1];
                        // ایجاد مسیر با رنگ مشکی برای ساده‌سازی
                        draw.path(pathD).fill('#000000');
                    }
                    
                    // اگر هیچ مسیری پیدا نشد یا مسیرها بسیار کم هستند، خطا برگرداند
                    if (pathsFound < 1) {
                        throw new Error('مسیر SVG معتبری یافت نشد یا تصویر بسیار ساده است');
                    }
                    
                    // تنظیم نسخه و ویژگی‌های SVG
                    const svgOutput = draw.svg()
                        .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
                        .replace('</svg>', `<title>${originalFileName} - ${size.width}x${size.height}</title></svg>`);
                    
                    // تبدیل SVG به DataURL
                    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const dataUrl = e.target.result;
                        
                        // برگرداندن نتیجه نهایی
                        resolve({
                            dataUrl,
                            size,
                            fileName: getFileName(size, 'svg'),
                            type: 'image/svg+xml'
                        });
                    };
                    reader.onerror = function() {
                        console.error('خطا در خواندن فایل SVG');
                        createPNGFallback();
                    };
                    reader.readAsDataURL(blob);
                } catch (potraceError) {
                    console.error('خطا در تبدیل Potrace:', potraceError);
                    createPNGFallback();
                }
            } catch (error) {
                console.error('خطا در تبدیل به SVG:', error);
                createPNGFallback();
            }
            
            // تابع کمکی برای ایجاد PNG در صورت خطا
            function createPNGFallback() {
                console.log('استفاده از PNG به عنوان جایگزین به دلیل خطا در تبدیل SVG');
                
                // ایجاد کنواس جدید
                const canvas = document.createElement('canvas');
                canvas.width = size.width;
                canvas.height = size.height;
                const ctx = canvas.getContext('2d');
                
                // حفظ نسبت تصویر
                let targetWidth, targetHeight, startX, startY;
                
                const originalRatio = image.width / image.height;
                const targetRatio = size.width / size.height;
                
                if (originalRatio > targetRatio) {
                    targetHeight = size.height;
                    targetWidth = targetHeight * originalRatio;
                    startX = (size.width - targetWidth) / 2;
                    startY = 0;
                } else {
                    targetWidth = size.width;
                    targetHeight = targetWidth / originalRatio;
                    startX = 0;
                    startY = (size.height - targetHeight) / 2;
                }
                
                // پر کردن پس‌زمینه با شفافیت
                ctx.clearRect(0, 0, size.width, size.height);
                
                // رسم تصویر با اندازه مناسب
                ctx.drawImage(image, startX, startY, targetWidth, targetHeight);
                
                // تبدیل به DataURL با فرمت PNG
                const dataUrl = canvas.toDataURL('image/png');
                
                // برگرداندن نتیجه به عنوان PNG
                resolve({
                    dataUrl,
                    size,
                    fileName: getFileName(size, 'png'),
                    type: 'image/png',
                    isFallback: true // علامت‌گذاری به عنوان جایگزین
                });
            }
        });
    }

    // ایجاد نام فایل با فرمت مناسب
    function getFileName(size, format) {
        // استفاده از format اگر داده شده، در غیر این صورت استفاده از outputExtension
        const extension = format || outputExtension;
        
        // ساخت نام فایل
        let filename = originalFileName;
        
        // حذف پسوند فایل اصلی
        const extIndex = filename.lastIndexOf('.');
        if (extIndex !== -1) {
            filename = filename.substring(0, extIndex);
        }
        
        // افزودن اندازه و پسوند جدید
        filename += `-${size.width}x${size.height}.${extension}`;
        
        return filename;
    }

    // ایجاد المان نمایش برای هر سایز
    function createSizeItem(result) {
        const { dataUrl, size, fileName, isFallback } = result;
        
        const sizeItem = document.createElement('div');
        sizeItem.className = 'size-item';
        
        // ایجاد بخش پیش‌نمایش
        const preview = document.createElement('div');
        preview.className = 'size-preview';
        
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = `${size.width}x${size.height}`;
        
        preview.appendChild(img);
        sizeItem.appendChild(preview);
        
        // ایجاد بخش اطلاعات
        const info = document.createElement('div');
        info.className = 'size-info';
        
        const title = document.createElement('h4');
        title.textContent = size.label;
        
        const description = document.createElement('p');
        const fileFormat = result.type.split('/')[1].toUpperCase().replace('SVG+XML', 'SVG');
        description.textContent = `${size.description} - ${fileFormat}`;
        
        info.appendChild(title);
        info.appendChild(description);
        
        // نمایش هشدار در صورت استفاده از جایگزین
        if (isFallback && result.type === 'image/png' && outputExtension === 'svg') {
            const fallbackWarning = document.createElement('p');
            fallbackWarning.className = 'fallback-warning';
            fallbackWarning.textContent = 'تبدیل به SVG انجام نشد، از PNG استفاده شد';
            info.appendChild(fallbackWarning);
        }
        
        sizeItem.appendChild(info);
        
        // ایجاد بخش دانلود
        const download = document.createElement('div');
        download.className = 'size-download';
        download.textContent = 'دانلود';
        download.addEventListener('click', () => {
            downloadSingleImage(dataUrl, fileName);
        });
        
        sizeItem.appendChild(download);
        sizesGrid.appendChild(sizeItem);
    }

    // دانلود یک تصویر
    function downloadSingleImage(dataUrl, fileName) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
    }

    // دانلود همه تصاویر به صورت ZIP
    downloadZipBtn.addEventListener('click', createAndDownloadZip);
    
    function createAndDownloadZip() {
        if (resizedImages.length === 0) return;
        
        // نمایش وضعیت در حال پردازش
        downloadZipBtn.disabled = true;
        downloadZipBtn.textContent = 'در حال ایجاد فایل ZIP...';
        
        // ایجاد فایل ZIP
        const zip = new JSZip();
        const promises = [];
        
        // افزودن هر تصویر به ZIP
        resizedImages.forEach(({ dataUrl, fileName }) => {
            // تبدیل Data URL به Blob
            const promise = fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    zip.file(fileName, blob);
                });
            
            promises.push(promise);
        });
        
        // بعد از افزودن همه تصاویر
        Promise.all(promises)
            .then(() => {
                // ایجاد فایل ZIP
                return zip.generateAsync({ type: 'blob' });
            })
            .then(blob => {
                // دانلود فایل ZIP
                saveAs(blob, `${originalFileName}_${outputExtension}_resized.zip`);
                
                // بازگرداندن وضعیت دکمه
                downloadZipBtn.disabled = false;
                downloadZipBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15L12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 11L12.087 14.913V14.913C12.039 14.961 11.961 14.961 11.913 14.913V14.913L8 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20 21H4C3.44772 21 3 20.5523 3 20V18C3 17.4477 3.44772 17 4 17H20C20.5523 17 21 17.4477 21 18V20C21 20.5523 20.5523 21 20 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    دانلود همه سایزها (ZIP)
                `;
            })
            .catch(error => {
                console.error('خطا در ایجاد فایل ZIP:', error);
                alert('متأسفانه در ایجاد فایل ZIP خطایی رخ داد.');
                
                // بازگرداندن وضعیت دکمه
                downloadZipBtn.disabled = false;
                downloadZipBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15L12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 11L12.087 14.913V14.913C12.039 14.961 11.961 14.961 11.913 14.913V14.913L8 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20 21H4C3.44772 21 3 20.5523 3 20V18C3 17.4477 3.44772 17 4 17H20C20.5523 17 21 17.4477 21 18V20C21 20.5523 20.5523 21 20 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    دانلود همه سایزها (ZIP)
                `;
            });
    }
}); 