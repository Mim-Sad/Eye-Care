// renderer.js
const startStopButton = document.getElementById('start-stop-button');
const timerDisplay = document.getElementById('timer-display');
const settingsButton = document.getElementById('settings-button');
const buttonText = startStopButton.querySelector('.button-text');

let timerInterval;
let timeRemaining = 20 * 60; // Default 20 minutes in seconds
let isPlaying = false;
let currentTimerDuration = 20 * 60; // Store the duration from settings
let selectedSound = 'beep.mp3'; // Default sound, will be updated from settings
let audio;

// Function to play sound using HTML5 Audio
function playNotificationSound() {
    if (selectedSound) {
        if (audio) {
            audio.pause(); // Stop previous sound if any
        }
        // Construct path relative to HTML file, assuming sounds folder is at root
        // For Electron, paths need to be handled carefully. Since preload scripts run with Node.js access,
        // a better way might be to get an absolute path or data URL from main process if files are not directly web-accessible.
        // However, for simplicity with local files and `loadFile`, relative paths from the HTML's location should work.
        // The `sounds` folder is at the same level as `index.html`.
        audio = new Audio(`./sounds/${selectedSound}`);
        audio.play().catch(e => console.error("Error playing sound:", e));
        console.log(`Renderer: Playing sound ${selectedSound}`);
    } else {
        console.warn('Renderer: No sound selected to play.');
    }
}

// Function to format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Function to update timer display
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
}

// Function to handle timer tick
function tick() {
    timeRemaining--;
    updateDisplay();

    if (timeRemaining <= 0) {
        playNotificationSound();
        console.log('Timer elapsed, playing sound.');
        timeRemaining = currentTimerDuration; // Reset timer
        updateDisplay();
    }
}

// Function to toggle play/stop state
function togglePlayState() {
    isPlaying = !isPlaying;

    if (isPlaying) {
        buttonText.textContent = 'Stop';
        startStopButton.classList.remove('stopped');
        startStopButton.classList.add('playing');
        document.body.classList.add('playing-theme');

        // Add animation class and remove after animation ends
        startStopButton.classList.add('animate-change');
        setTimeout(() => startStopButton.classList.remove('animate-change'), 1000);

        if (timeRemaining <= 0) timeRemaining = currentTimerDuration; // Reset if starting from 0
        updateDisplay();
        timerInterval = setInterval(tick, 1000);
        console.log('Timer started.');
    } else {
        buttonText.textContent = 'Start';
        startStopButton.classList.remove('playing');
        startStopButton.classList.add('stopped');
        document.body.classList.remove('playing-theme');

        // Add animation class and remove after animation ends
        startStopButton.classList.add('animate-change');
        setTimeout(() => startStopButton.classList.remove('animate-change'), 1000);

        clearInterval(timerInterval);
        console.log('Timer stopped.');
    }
    // Notify main process about state change (optional, if main needs to know)
    // window.electronAPI.onStateChange(isPlaying);
}

// Event listener for the start/stop button
startStopButton.addEventListener('click', togglePlayState);

// Event listener for the settings button
settingsButton.addEventListener('click', () => {
    window.electronAPI.openSettings();
});

// Initialize display
updateDisplay();

// Listen for settings updates from the main process (if settings affect the timer directly)
window.electronAPI.onTimerUpdate((newDuration) => {
    console.log('Received timer update from main:', newDuration);
    currentTimerDuration = newDuration * 60; // Convert minutes to seconds
    if (!isPlaying) { // Only update if not playing, or on next start
        timeRemaining = currentTimerDuration;
        updateDisplay();
    }
});

// Load initial settings when the renderer is ready
async function loadInitialSettings() {
    try {
        console.log('Renderer: Requesting initial settings...');
        // Use the loadSettings function exposed via preload from settingsPreload.js, but it should be from general preload.js
        // Let's assume 'electronAPI' in preload.js will also have 'loadSettings'
        // We need to add 'loadSettings' to 'electronAPI' in preload.js
        const settings = await window.electronAPI.loadSettings(); 
        if (settings) {
            console.log('Renderer: Initial settings loaded', settings);
            if (settings.timerDuration) {
                currentTimerDuration = settings.timerDuration * 60;
                if (!isPlaying) { // Only update if not playing
                    timeRemaining = currentTimerDuration;
                }
            }
            if (settings.selectedSound) {
                selectedSound = settings.selectedSound;
            }
            updateDisplay();
        } else {
            console.log('Renderer: No initial settings returned or settings are empty.');
        }
    } catch (error) {
        console.error('Renderer: Failed to load initial settings:', error);
        // Fallback to defaults if loading fails
        currentTimerDuration = 20 * 60;
        selectedSound = 'beep.mp3';
        timeRemaining = currentTimerDuration;
        updateDisplay();
    }
}

// Listen for settings updates from the main process
window.electronAPI.onTimerUpdate((newDuration) => {
    console.log('Renderer: Received timer duration update from main:', newDuration);
    currentTimerDuration = newDuration * 60; // Convert minutes to seconds
    if (!isPlaying) { // Only update if not playing, or on next start
        timeRemaining = currentTimerDuration;
        updateDisplay();
    }
});

// This IPC is for when settings (like sound) are changed and saved.
// We need a specific IPC for selected sound update if it's separate from timer duration.
// For now, loadInitialSettings and onTimerUpdate cover duration. Sound is loaded initially.
// If sound changes, settings window closes, main window might need to reload settings or get specific update.
// Let's assume loadInitialSettings is sufficient for now, or main.js can send a generic 'settings-updated' event.

loadInitialSettings();

console.log('Renderer script for main window loaded.');