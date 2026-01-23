console.log("Schedulr Extension - Enhanced with NLP");

const scanButton = document.getElementById('scanButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const alertBox = document.getElementById('popupAlert');
const navItems = document.querySelectorAll('.nav-item');
const quickActions = document.querySelectorAll('.quick-action');
const settingsBtn = document.querySelector('.settings-btn');
const themeBtn = document.querySelector('.theme-btn');

// ===== ALERT SYSTEM =====
function showAlert(message, type = 'info') {
    console.log(`[ALERT] ${type}: ${message}`);

    const alertBox = document.getElementById('popupAlert');
    if (!alertBox) {
        console.error('❌ Alert box not found!');
        return;
    }

    alertBox.classList.remove('hidden');
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

    alertBox.className = `alert p-4 rounded-xl border ${config.border} ${config.bg} ${config.text} text-sm animate-[slideIn_0.3s_ease-out]`;

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

    if (type !== 'error') {
        setTimeout(() => hideAlert(), 5000);
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

// ===== GOOGLE CALENDAR FUNCTIONS =====
function createGoogleCalendarUrl(eventData) {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

    const params = new URLSearchParams();

    // Event title
    params.append('text', eventData.title || 'Event from Email');

    // Date and time
    if (eventData.dateTime) {
        const dt = eventData.dateTime;
        const formatDateTime = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startTime = formatDateTime(dt);
        const endDate = new Date(dt.getTime() + 60 * 60 * 1000); // +1 hour
        const endTime = formatDateTime(endDate);

        params.append('dates', `${startTime}/${endTime}`);
    }

    // Description
    let description = `Event Type: ${eventData.eventType}\n`;
    description += `Priority: ${eventData.priority}\n`;
    if (eventData.sender) {
        description += `From: ${eventData.sender}\n`;
    }
    if (eventData.rawDates.length > 0) {
        description += `\nDetected dates: ${eventData.rawDates.join(', ')}`;
    }
    if (eventData.rawTimes.length > 0) {
        description += `\nDetected times: ${eventData.rawTimes.join(', ')}`;
    }

    params.append('details', description);

    // Add reminder based on priority
    if (eventData.priority === 'high') {
        params.append('reminder', '1440'); // 1 day before
    } else if (eventData.priority === 'medium') {
        params.append('reminder', '60'); // 1 hour before
    }

    return `${baseUrl}&${params.toString()}`;
}

function displayEventPreview(eventData) {
    const previewHtml = `
        <div class="mt-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50">
            <h3 class="text-sm font-semibold text-white mb-3">📅 Event Preview</h3>
            
            <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                    <span class="text-gray-400">Title:</span>
                    <span class="text-white font-medium">${eventData.title}</span>
                </div>
                
                <div class="flex justify-between">
                    <span class="text-gray-400">Type:</span>
                    <span class="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">${eventData.eventType}</span>
                </div>
                
                <div class="flex justify-between">
                    <span class="text-gray-400">Priority:</span>
                    <span class="px-2 py-1 rounded ${eventData.priority === 'high' ? 'bg-red-500/20 text-red-300' :
            eventData.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
        }">${eventData.priority}</span>
                </div>
                
                ${eventData.dateTime ? `
                <div class="flex justify-between">
                    <span class="text-gray-400">Date:</span>
                    <span class="text-white">${eventData.dateTime.toLocaleDateString()}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Time:</span>
                    <span class="text-white">${eventData.dateTime.toLocaleTimeString()}</span>
                </div>
                ` : `
                <div class="text-yellow-300 text-center py-2">
                    ⚠️ No specific date/time found
                </div>
                `}
            </div>
            
            <button id="addToCalendarBtn" class="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all">
                <i class="fas fa-calendar-plus mr-2"></i>
                Add to Google Calendar
            </button>
        </div>
    `;

    // Insert preview into main content
    const mainContent = document.querySelector('main');
    const existingPreview = document.getElementById('eventPreview');

    if (existingPreview) {
        existingPreview.remove();
    }

    const previewDiv = document.createElement('div');
    previewDiv.id = 'eventPreview';
    previewDiv.innerHTML = previewHtml;
    mainContent.appendChild(previewDiv);

    // Add click handler for calendar button
    document.getElementById('addToCalendarBtn').addEventListener('click', () => {
        const calendarUrl = createGoogleCalendarUrl(eventData);
        chrome.tabs.create({ url: calendarUrl });
        showAlert('Opening Google Calendar...', 'success');
    });
}

// ===== MAIN SCAN FUNCTION =====
async function performScan() {
    const originalHTML = scanButton.innerHTML;
    scanButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i><span>Analyzing...</span>';
    scanButton.classList.add('opacity-80', 'cursor-not-allowed');

    try {
        await startProgressAnimation();

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs || tabs.length === 0) {
            throw new Error('No active tab found');
        }

        const tab = tabs[0];

        if (!tab.url || !tab.url.includes('mail.google.com')) {
            throw new Error('Please open Gmail first');
        }

        showAlert('Scanning email with AI...', 'info');

        const response = await chrome.tabs.sendMessage(tab.id, { type: 'REQUEST_EMAIL' });

        if (!response?.email) {
            throw new Error('Please open an email to scan');
        }

        const { email, eventData } = response;

        // Check for .edu email
        if (!email.endsWith('.edu')) {
            throw new Error('Only college (.edu) emails are supported');
        }

        // Display results
        if (eventData.hasValidDate) {
            showAlert(`✅ Event detected: ${eventData.eventType} on ${eventData.dateTime.toLocaleDateString()}`, 'success');
            displayEventPreview(eventData);
        } else {
            showAlert(`⚠️ Email scanned but no clear date/time found. Detected: ${eventData.eventType}`, 'warning');
            displayEventPreview(eventData);
        }

        // Update stats (demo)
        const timeSaved = document.querySelector('.stats-card:nth-child(2) .text-2xl');
        if (timeSaved) {
            const current = parseFloat(timeSaved.textContent.replace('h', ''));
            timeSaved.textContent = `${(current + 0.5).toFixed(1)}h`;
        }

    } catch (error) {
        console.error('Scan error:', error);
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

// ===== UI SETUP FUNCTIONS =====
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(i => {
                i.classList.remove('bg-indigo-500/20', 'border-indigo-400/30');
                i.classList.add('bg-gray-700/50', 'border-transparent');
            });
            this.classList.add('bg-indigo-500/20', 'border-indigo-400/30');
            this.classList.remove('bg-gray-700/50', 'border-transparent');

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

// ===== INITIALIZE =====
function initializeEventListeners() {
    if (scanButton) {
        scanButton.addEventListener('click', performScan);
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.fa-times')) {
            hideAlert();
        }
    });

    setupNavigation();
    setupQuickActions();
    setupSettings();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Schedulr initialized with NLP capabilities');
    initializeEventListeners();
    showAlert('Schedulr ready! Open a .edu email in Gmail to scan.', 'info');
});

// Export for debugging
window.showAlert = showAlert;
window.hideAlert = hideAlert;
window.performScan = performScan;

console.log('Schedulr extension with NLP initialized successfully');