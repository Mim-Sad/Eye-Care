// settings.js
const timerDurationInput = document.getElementById('timer-duration');
const soundSelect = document.getElementById('sound-select');
const previewSoundButton = document.getElementById('preview-sound-button');
const saveSettingsButton = document.getElementById('save-settings-button');
const closeSettingsButton = document.getElementById('close-settings-button');

let availableSounds = [];
let previewAudio; // Audio object for previewing sounds

// Load sounds and populate the dropdown
async function loadSounds() {
    try {
        availableSounds = await window.settingsAPI.getSounds();
        soundSelect.innerHTML = ''; // Clear existing options
        if (availableSounds.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No sounds found in /sounds folder';
            soundSelect.appendChild(option);
            previewSoundButton.disabled = true;
        } else {
            availableSounds.forEach(sound => {
                const option = document.createElement('option');
                option.value = sound;
                option.textContent = sound.replace('.mp3', ''); // Display name without .mp3
                soundSelect.appendChild(option);
            });
            previewSoundButton.disabled = false;
        }
    } catch (error) {
        console.error('Failed to load sounds:', error);
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Error loading sounds';
        soundSelect.appendChild(option);
        previewSoundButton.disabled = true;
    }
}

// Function to play preview sound using HTML5 Audio
function playPreviewSound(soundFile) {
    if (soundFile) {
        if (previewAudio) {
            previewAudio.pause(); // Stop previous sound if any
        }
        // Sounds are in the 'sounds' directory relative to the HTML file's location.
        previewAudio = new Audio(`./sounds/${soundFile}`);
        previewAudio.play().catch(e => console.error("Error playing preview sound:", e));
        console.log(`Settings: Previewing sound ${soundFile}`);
    } else {
        console.warn('Settings: No sound selected to preview.');
    }
}

// Preview selected sound
previewSoundButton.addEventListener('click', () => {
    const selectedSound = soundSelect.value;
    if (selectedSound) {
        playPreviewSound(selectedSound);
    }
});

// Save settings
saveSettingsButton.addEventListener('click', async () => {
    const settings = {
        timerDuration: parseInt(timerDurationInput.value, 10),
        selectedSound: soundSelect.value
    };
    console.log('Settings: Saving settings', settings);
    await window.settingsAPI.saveSettings(settings);
    // Optionally, provide feedback to the user that settings are saved.
    // For now, we just close the window after saving.
    window.close(); // Closes the current settings window
});

// Close settings window
closeSettingsButton.addEventListener('click', () => {
    window.close(); // Closes the current settings window
});

// Load current settings when the page loads
async function loadCurrentSettings() {
    try {
        const settings = await window.settingsAPI.loadSettings();
        if (settings) {
            if (settings.timerDuration) {
                timerDurationInput.value = settings.timerDuration;
            }
            if (settings.selectedSound && availableSounds.includes(settings.selectedSound)) {
                soundSelect.value = settings.selectedSound;
            }
        }
    } catch (error) {
        console.error('Failed to load current settings:', error);
        // Fallback to defaults if loading fails
        timerDurationInput.value = 20;
    }
}

// Initial setup
async function init() {
    await loadSounds();
    await loadCurrentSettings();
}

init();

console.log('Settings script loaded.');