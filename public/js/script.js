// public/js/script.js
class FaceSwapApp {
    constructor() {
        this.camera = null;
        this.stream = null;
        this.facingMode = 'user'; // 'user' for front camera, 'environment' for back camera
        this.canvas = null;
        this.currentImageFile = null;
        
        this.initializeElements();
        this.bindEvents();
        this.setupDragAndDrop();
    }

    initializeElements() {
        // Get DOM elements
        this.cameraBtn = document.getElementById('cameraBtn');
        this.fileBtn = document.getElementById('fileBtn');
        this.imageFile = document.getElementById('imageFile');
        this.cameraContainer = document.getElementById('cameraContainer');
        this.camera = document.getElementById('camera');
        this.switchCameraBtn = document.getElementById('switchCamera');
        this.captureBtn = document.getElementById('captureBtn');
        this.canvas = document.getElementById('canvas');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.removeImageBtn = document.getElementById('removeImage');
        this.submitBtn = document.getElementById('submitBtn');
        this.form = document.getElementById('faceSwapForm');
        this.uploadContainer = document.querySelector('.image-upload-container');
    }

    bindEvents() {
        // Button events
        if (this.cameraBtn) {
            this.cameraBtn.addEventListener('click', () => this.startCamera());
        }
        
        if (this.fileBtn) {
            this.fileBtn.addEventListener('click', () => this.imageFile.click());
        }
        
        if (this.imageFile) {
            this.imageFile.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (this.switchCameraBtn) {
            this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        }
        
        if (this.captureBtn) {
            this.captureBtn.addEventListener('click', () => this.capturePhoto());
        }
        
        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', () => this.removeImage());
        }

        // Form validation
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Input validation
        this.setupInputValidation();
    }

    setupDragAndDrop() {
        if (!this.uploadContainer) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadContainer.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadContainer.addEventListener(eventName, () => {
                this.uploadContainer.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadContainer.addEventListener(eventName, () => {
                this.uploadContainer.classList.remove('dragover');
            }, false);
        });

        this.uploadContainer.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            this.handleFileUpload(file);
        }
    }

    async startCamera() {
        try {
            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showError('Camera is not supported in this browser');
                return;
            }

            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: this.facingMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            this.camera.srcObject = this.stream;
            this.cameraContainer.style.display = 'block';
            this.imagePreview.style.display = 'none';

            // Check if device has multiple cameras
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length > 1) {
                this.switchCameraBtn.style.display = 'inline-block';
            }

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError('Unable to access camera. Please check permissions.');
        }
    }

    async switchCamera() {
        try {
            // Stop current stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            // Switch facing mode
            this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';

            // Start camera with new facing mode
            await this.startCamera();

        } catch (error) {
            console.error('Error switching camera:', error);
            this.showError('Unable to switch camera');
        }
    }

    capturePhoto() {
        if (!this.camera || !this.stream) {
            this.showError('Camera not available');
            return;
        }

        // Set canvas size to match video
        this.canvas.width = this.camera.videoWidth;
        this.canvas.height = this.camera.videoHeight;

        // Draw video frame to canvas
        const context = this.canvas.getContext('2d');
        context.drawImage(this.camera, 0, 0, this.canvas.width, this.canvas.height);

        // Convert canvas to blob
        this.canvas.toBlob((blob) => {
            if (blob) {
                // Create file from blob
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                this.currentImageFile = file;

                // Show preview
                const url = URL.createObjectURL(blob);
                this.showImagePreview(url);

                // Stop camera
                this.stopCamera();

                // Update file input (for form validation)
                const dt = new DataTransfer();
                dt.items.add(file);
                this.imageFile.files = dt.files;

                this.showSuccess('Photo captured successfully!');
            }
        }, 'image/jpeg', 0.8);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.cameraContainer.style.display = 'none';
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFileUpload(file);
        }
    }

    handleFileUpload(file) {
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            this.showError(validation.error);
            return;
        }

        this.currentImageFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Update file input
        const dt = new DataTransfer();
        dt.items.add(file);
        this.imageFile.files = dt.files;

        this.showSuccess('Image uploaded successfully!');
    }

    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!allowedTypes.includes(file.type)) {
            return { isValid: false, error: 'Only JPG, JPEG, and PNG images are allowed' };
        }

        if (file.size > maxSize) {
            return { isValid: false, error: 'Image size must be less than 2MB' };
        }

        return { isValid: true };
    }

    showImagePreview(imageSrc) {
        this.previewImg.src = imageSrc;
        this.imagePreview.style.display = 'block';
        this.cameraContainer.style.display = 'none';
        
        // Add animation
        this.imagePreview.classList.add('fade-in');
    }

    removeImage() {
        this.currentImageFile = null;
        this.imageFile.value = '';
        this.imagePreview.style.display = 'none';
        this.previewImg.src = '';
        
        // Stop camera if running
        this.stopCamera();
        
        this.showInfo('Image removed');
    }

    setupInputValidation() {
        // Name validation
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const isValid = /^[a-zA-Z\s]{4,30}$/.test(value);
                this.toggleInputValidation(nameInput, isValid);
            });
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                this.toggleInputValidation(emailInput, isValid);
            });
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const isValid = /^\d{10}$/.test(value);
                this.toggleInputValidation(phoneInput, isValid);
            });
        }
    }

    toggleInputValidation(input, isValid) {
        if (input.value === '') {
            input.classList.remove('is-valid', 'is-invalid');
            return;
        }

        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }
    }

    handleSubmit(event) {
        // Show loading state
        this.showLoading();
        
        // Basic client-side validation
        if (!this.validateForm()) {
            event.preventDefault();
            this.hideLoading();
            return false;
        }

        // Let the form submit naturally
        return true;
    }

    validateForm() {
        let isValid = true;
        const errors = [];

        // Check required fields
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const terms = document.getElementById('terms').checked;
        const image = this.imageFile.files[0];

        if (!name || name.length < 4 || name.length > 30 || !/^[a-zA-Z\s]+$/.test(name)) {
            errors.push('Name must be 4-30 characters and contain only letters');
            isValid = false;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please provide a valid email address');
            isValid = false;
        }

        if (!phone || !/^\d{10}$/.test(phone)) {
            errors.push('Phone number must be exactly 10 digits');
            isValid = false;
        }

        if (!terms) {
            errors.push('You must accept the terms and conditions');
            isValid = false;
        }

        if (!image) {
            errors.push('Please upload an image');
            isValid = false;
        }

        if (errors.length > 0) {
            this.showError(errors.join('<br>'));
        }

        return isValid;
    }

    showLoading() {
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        }

        // Show loading spinner if it exists
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Swap Face';
        }

        // Hide loading spinner
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }

    showError(message) {
        this.showNotification(message, 'danger');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingAlert = document.querySelector('.temp-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create notification
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} temp-alert fade-in`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        alert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getIconForType(type)} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    getIconForType(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Utility method to handle page cleanup
    cleanup() {
        this.stopCamera();
        
        // Revoke any object URLs to prevent memory leaks
        if (this.previewImg && this.previewImg.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.previewImg.src);
        }
    }
}

// Additional utility functions
class FormUtils {
    static formatPhone(input) {
        // Remove any non-digit characters
        let value = input.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.substr(0, 10);
        }
        
        input.value = value;
    }

    static formatName(input) {
        // Remove any non-letter characters except spaces
        let value = input.value.replace(/[^a-zA-Z\s]/g, '');
        
        // Capitalize first letter of each word
        value = value.replace(/\b\w/g, letter => letter.toUpperCase());
        
        input.value = value;
    }

    static validateFileSize(file, maxSizeMB = 2) {
        const maxSize = maxSizeMB * 1024 * 1024;
        return file.size <= maxSize;
    }

    static validateFileType(file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']) {
        return allowedTypes.includes(file.type);
    }
}

// Image processing utilities
class ImageUtils {
    static resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    static getImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.src = URL.createObjectURL(file);
        });
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }

    startTimer(name) {
        this.metrics[name] = performance.now();
    }

    endTimer(name) {
        if (this.metrics[name]) {
            const duration = performance.now() - this.metrics[name];
            console.log(`${name} took ${duration.toFixed(2)}ms`);
            delete this.metrics[name];
            return duration;
        }
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app
    const app = new FaceSwapApp();
    
    // Initialize performance monitoring in development
    if (window.location.hostname === 'localhost') {
        const monitor = new PerformanceMonitor();
        monitor.measurePageLoad();
    }

    // Add additional event listeners for enhanced UX
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => FormUtils.formatPhone(phoneInput));
    }

    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('input', () => FormUtils.formatName(nameInput));
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, stop camera to save resources
            app.stopCamera();
        }
    });

    // Cleanup when page unloads
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to all forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                
                // Re-enable after 30 seconds as failsafe
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 30000);
            }
        });
    });

    console.log('Face Swap App initialized successfully');
});