console.log("Schedulr Extension - Modern Version Loaded");

const scanButton = document.getElementById('scanButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const alertBox = document.getElementById('popupAlert');
const navItems = document.querySelectorAll('.nav-item');
const quickActions = document.querySelectorAll('.quick-action');
const settingsBtn = document.querySelector('.settings-btn');
const themeBtn = document.querySelector('.theme-btn');

function showAlert(message, type = 'info') {
    console.log(`[ALERT] ${type}: ${message}`);

    const alertBox = document.getElementById('popupAlert');
    if (!alertBox) {
        console.error('❌ Alert box not found!');
        return;
    }

    // Remove hidden class FIRST
    alertBox.classList.remove('hidden');

    // Clear and update content
    alertBox.innerHTML = '';

    const typeConfig = {
        success: {
            bg: 'bg-green-500/20',
            border: 'border-green-500/40',
            text: 'text-green-300',
            icon: '✅'
        },
        error: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/40',
            text: 'text-red-300',
            icon: '❌'
        },
        warning: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/40',
            text: 'text-yellow-300',
            icon: '⚠️'
        },
        info: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/40',
            text: 'text-blue-300',
            icon: 'ℹ️'
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    // Set classes
    alertBox.className = `alert p-4 rounded-xl border ${config.border} ${config.bg} ${config.text} text-sm animate-[slideIn_0.3s_ease-out]`;

    // Create content
    alertBox.innerHTML = `
        <div class="flex items-start">
            <div class="text-lg mr-3">${config.icon}</div>
            <div class="flex-1">
                <div class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="mt-1 text-sm">${message}</div>
            </div>
            <button onclick="hideAlert()" class="text-gray-400 hover:text-white ml-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Auto-hide after 5 seconds (except errors)
    if (type !== 'error') {
        setTimeout(() => {
            hideAlert();
        }, 5000);
    }
}

function hideAlert() {
    const alertBox = document.getElementById('popupAlert');
    if (alertBox) {
        alertBox.classList.add('hidden');
    }
}


// ===== PROGRESS ANIMATION =====
function startProgressAnimation() {
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';

    let progress = 0;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            progress += Math.random() * 40;
            if (progress > 100) progress = 100;

            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => resolve(), 250);
            }
        }, 100);
    });
}

async function performScan() {
    // Set loading state
    const originalHTML = scanButton.innerHTML;
    scanButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i><span>Scanning...</span>';
    scanButton.classList.add('opacity-80', 'cursor-not-allowed');

    try {
        // Start progress animation
        await startProgressAnimation();

        // Check active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs || tabs.length === 0) {
            throw new Error('No active tab found');
        }

        const tab = tabs[0];

        // Check if on Gmail
        if (!tab.url || !tab.url.includes('mail.google.com')) {
            throw new Error('Please open Gmail first');
        }

        // Send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'REQUEST_EMAIL' });

        if (!response?.email) {
            throw new Error('Please open an email to scan');
        }

        const email = response.email;

        if (email.endsWith('.edu')) {
            showAlert(`College email detected`, 'success');

            const timeSaved = document.querySelector('.stats-card:nth-child(2) .text-2xl');
            if (timeSaved) {
                const current = parseFloat(timeSaved.textContent.replace('h', ''));
                timeSaved.textContent = `${(current + 0.5).toFixed(1)}h`;
            }
        } else {
            throw new Error('Only college emails are supported');
        }

    } catch (error) {
        showAlert(error.message, 'error');
    } finally {

        scanButton.innerHTML = originalHTML;
        scanButton.classList.remove('opacity-80', 'cursor-not-allowed');
        progressContainer.classList.add('hidden');

        scanButton.classList.remove('bg-gradient-to-r', 'from-indigo-500', 'via-purple-500', 'to-pink-500');
        scanButton.classList.add('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');

        setTimeout(() => {
            scanButton.classList.remove('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');
            scanButton.classList.add('bg-gradient-to-r', 'from-indigo-500', 'via-purple-500', 'to-pink-500');
        }, 2000);
    }
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(i => {
                i.classList.remove('bg-indigo-500/20', 'border-indigo-400/30', 'glow');
                i.classList.add('bg-gray-700/50', 'border-transparent');
            });
            this.classList.add('bg-indigo-500/20', 'border-indigo-400/30', 'glow');
            this.classList.remove('bg-gray-700/50', 'border-transparent');

            // Show notification for demo
            const label = this.querySelector('span').textContent;
            showAlert(`Navigated to ${label}`, 'info');
        });
    });
}

function setupQuickActions() {
    quickActions.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.classList.add('transform', 'scale-105');
        });

        button.addEventListener('mouseleave', function () {
            this.classList.remove('transform', 'scale-105');
        });

        button.addEventListener('click', function () {
            const action = this.querySelector('span').textContent;
            showAlert(`${action} feature coming soon!`, 'info');
        });
    });
}

function setupSettings() {
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showAlert('Settings panel coming in next update!', 'info');
        });
    }

    if (themeBtn) {
        let isDark = true;
        themeBtn.addEventListener('click', () => {
            isDark = !isDark;
            const icon = themeBtn.querySelector('i');
            if (isDark) {
                icon.className = 'fas fa-moon text-gray-400 hover:text-yellow-300 text-sm';
                showAlert('Switched to dark mode', 'info');
            } else {
                icon.className = 'fas fa-sun text-gray-400 hover:text-yellow-300 text-sm';
                showAlert('Switched to light mode', 'info');
            }
        });
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Scan button
    if (scanButton) {
        scanButton.addEventListener('click', performScan);
    }

    // Close alert button
    document.addEventListener('click', (e) => {
        if (e.target.closest('.fa-times')) {
            hideAlert();
        }
    });

    // Setup UI interactions
    setupNavigation();
    setupQuickActions();
    setupSettings();
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initializeEventListeners();
    showAlert('Schedulr ready! Open a .edu email in Gmail to scan.', 'info');
});

// ===== EXPORT FOR DEBUGGING =====
window.showAlert = showAlert;
window.hideAlert = hideAlert;
window.performScan = performScan;

console.log('Schedulr extension initialized successfully');