// UI Controller for Key Signature Trainer

import { keys } from './data.js';
import { generateStaff, generateAnswer, getRandomNote, getNoteNameFromRandomNote } from './music-logic.js';
import {
    getCurrentKeyIndex,
    getCurrentExercise,
    getSelectedKeyIndices,
    getStaffDuration,
    getAnswerDuration,
    getIncludeLedgerLines,
    getCurrentAnswer,
    getCycleInterval,
    getAnswerTimeout,
    setCurrentKeyIndex,
    setCurrentExercise,
    setSelectedKeyIndices,
    setStaffDuration,
    setAnswerDuration,
    setIncludeLedgerLines,
    setCurrentAnswer,
    setCycleInterval,
    setAnswerTimeout,
    addSelectedKeyIndex,
    removeSelectedKeyIndex,
    selectAllKeys,
    deselectAllKeys,
    moveToNextSelectedKey,
    getNextSelectedKeyIndex,
    clearAllIntervals
} from './state-management.js';

/**
 * Generate and display a new exercise
 */
export function generateExercise() {
    const key = keys[getCurrentKeyIndex()];
    const exerciseType = getCurrentExercise();
    const includeLedgerLines = getIncludeLedgerLines();
    
    let staff, noteName;
    
    if (exerciseType === 'key-signature') {
        staff = generateStaff(key, exerciseType, includeLedgerLines);
        noteName = '';
    } else {
        // Generate a random note
        const randomNoteObj = getRandomNote(includeLedgerLines);
        noteName = getNoteNameFromRandomNote(randomNoteObj);
        
        staff = generateStaff(key, exerciseType, includeLedgerLines);
    }
    
    // Clear previous rendering
    document.getElementById("staff").innerHTML = '';
    document.getElementById("answer").textContent = '';
    
    // Store the answer that will be revealed
    const answer = exerciseType === 'key-signature' 
        ? `Key: ${key.name}` 
        : generateAnswer(key, exerciseType, noteName);
    
    setCurrentAnswer(answer);
    
    // Render staff
    ABCJS.renderAbc("staff", staff, {
        scale: 2.5,
        add_classes: true,
        staffwidth: 100
    });
    
    // Clear any existing answer timeout
    if (getAnswerTimeout()) {
        clearTimeout(getAnswerTimeout());
    }
    
    // Set timeout to reveal answer
    const timeout = setTimeout(() => {
        const answerElement = document.getElementById("answer");
        answerElement.textContent = getCurrentAnswer();
    }, getStaffDuration() * 1000);
    
    setAnswerTimeout(timeout);
    
    // Move to next selected key
    const nextKeyIndex = getNextSelectedKeyIndex();
    setCurrentKeyIndex(nextKeyIndex);
}

/**
 * Handle exercise type change
 */
export function changeExercise() {
    const exercise = document.querySelector('input[name="exercise"]:checked').value;
    setCurrentExercise(exercise);
    syncCheckboxesWithSelection();
    generateExercise();
}

/**
 * Toggle ledger lines
 */
export function toggleLedgerLines() {
    const includeLedgerLines = document.getElementById('include-ledger').checked;
    setIncludeLedgerLines(includeLedgerLines);
    generateExercise();
    restartCycleInterval();
}

/**
 * Sync checkboxes with selected key indices
 */
export function syncCheckboxesWithSelection() {
    const selectedIndices = getSelectedKeyIndices();
    
    // Update all checkboxes to match selectedKeyIndices
    keys.forEach((key, index) => {
        const checkbox = document.getElementById(`key-${index}`);
        checkbox.checked = selectedIndices.includes(index);
    });
    updateAllKeysCheckbox();
}

/**
 * Toggle individual key selection
 */
export function toggleKey(index) {
    const checkbox = document.getElementById(`key-${index}`);
    const selectedIndices = getSelectedKeyIndices();
    const wasEmpty = selectedIndices.length === 0;
    
    if (checkbox.checked) {
        addSelectedKeyIndex(index);
    } else {
        removeSelectedKeyIndex(index);
    }
    
    // Update "All Keys" checkbox
    updateAllKeysCheckbox();
    
    // If current key is no longer selected, move to next selected key
    const currentKeyIndex = getCurrentKeyIndex();
    if (!getSelectedKeyIndices().includes(currentKeyIndex)) {
        moveToNextSelectedKey();
    }
    
    // Handle edge cases
    const newSelectedIndices = getSelectedKeyIndices();
    if (wasEmpty && newSelectedIndices.length > 0) {
        generateExercise();
        restartCycleInterval();
    } else if (newSelectedIndices.length > 0) {
        generateExercise();
        restartCycleInterval();
    } else if (newSelectedIndices.length === 0) {
        // Stop when no keys are selected
        document.getElementById("staff").innerHTML = '<p>Please select at least one key to practice</p>';
        document.getElementById("answer").textContent = '';
        clearAllIntervals();
    }
}

/**
 * Toggle all keys selection
 */
export function toggleAllKeys() {
    const allCheckbox = document.getElementById('key-all');
    const allSelected = allCheckbox.checked;
    
    // Update all individual key checkboxes
    keys.forEach((key, index) => {
        const checkbox = document.getElementById(`key-${index}`);
        checkbox.checked = allSelected;
    });
    
    // Update selected key indices
    if (allSelected) {
        selectAllKeys();
    } else {
        deselectAllKeys();
    }
    
    // If no keys are selected, we need to handle this case
    const selectedIndices = getSelectedKeyIndices();
    if (selectedIndices.length === 0) {
        document.getElementById("staff").innerHTML = '<p>Please select at least one key to practice</p>';
        document.getElementById("answer").textContent = '';
        clearAllIntervals();
    } else {
        // Make sure current key is selected
        const currentKeyIndex = getCurrentKeyIndex();
        if (!selectedIndices.includes(currentKeyIndex)) {
            moveToNextSelectedKey();
        }
        // Generate new exercise
        generateExercise();
        // Restart interval if it was cleared
        if (!getCycleInterval()) {
            restartCycleInterval();
        }
    }
}

/**
 * Update the "All Keys" checkbox state
 */
export function updateAllKeysCheckbox() {
    const allCheckbox = document.getElementById('key-all');
    const selectedIndices = getSelectedKeyIndices();
    const allSelected = selectedIndices.length === keys.length;
    allCheckbox.checked = allSelected;
}

/**
 * Update staff duration
 */
export function updateStaffDuration() {
    const slider = document.getElementById('staff-duration');
    const duration = parseFloat(slider.value);
    setStaffDuration(duration);
    document.getElementById('staff-duration-value').textContent = `${duration}s`;
    
    // Regenerate exercise with new timing
    const selectedIndices = getSelectedKeyIndices();
    if (selectedIndices.length > 0) {
        generateExercise();
        restartCycleInterval();
    }
}

/**
 * Update answer duration
 */
export function updateAnswerDuration() {
    const slider = document.getElementById('answer-duration');
    const duration = parseFloat(slider.value);
    setAnswerDuration(duration);
    document.getElementById('answer-duration-value').textContent = `${duration}s`;
    
    // Update cycle interval with new timing
    restartCycleInterval();
}

/**
 * Restart the cycle interval
 */
export function restartCycleInterval() {
    clearAllIntervals();
    
    const selectedIndices = getSelectedKeyIndices();
    if (selectedIndices.length > 0) {
        const totalDuration = (getStaffDuration() + getAnswerDuration()) * 1000;
        const interval = setInterval(generateExercise, totalDuration);
        setCycleInterval(interval);
    }
}

/**
 * Skip to next card (reveal answer or advance)
 */
export function skipToNextCard() {
    const answerElement = document.getElementById('answer');
    const answerText = answerElement.textContent.trim();
    
    // If answer is not shown yet, reveal it
    if (!answerText) {
        const timeout = getAnswerTimeout();
        if (timeout) {
            clearTimeout(timeout);
        }
        // Show the answer immediately
        answerElement.textContent = getCurrentAnswer();
    } else {
        // Answer is already shown, advance to next card
        const timeout = getAnswerTimeout();
        if (timeout) {
            clearTimeout(timeout);
        }
        generateExercise();
        restartCycleInterval();
    }
}

/**
 * Open sidebar menu
 */
export function openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const backdrop = document.getElementById('modal-backdrop');
    
    sidebar.classList.add('active');
    menuToggle.classList.add('active');
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

/**
 * Close sidebar menu
 */
export function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const backdrop = document.getElementById('modal-backdrop');
    
    sidebar.classList.remove('active');
    menuToggle.classList.remove('active');
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Toggle sidebar menu
 */
export function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('active')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

/**
 * Open about modal
 */
export function openAboutModal(e) {
    if (e) e.preventDefault();
    const aboutModal = document.getElementById('about-modal');
    const aboutBackdrop = document.getElementById('about-backdrop');
    
    if (!aboutModal) return;
    
    aboutModal.classList.add('active');
    aboutBackdrop.classList.add('active');
    aboutModal.setAttribute('aria-hidden', 'false');
    aboutBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

/**
 * Close about modal
 */
export function closeAboutModal() {
    const aboutModal = document.getElementById('about-modal');
    const aboutBackdrop = document.getElementById('about-backdrop');
    
    if (!aboutModal) return;
    
    aboutModal.classList.remove('active');
    aboutBackdrop.classList.remove('active');
    aboutModal.setAttribute('aria-hidden', 'true');
    aboutBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Initialize UI event listeners
 */
export function initializeEventListeners() {
    // Space bar and tap to skip to next card
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !document.querySelector('.sidebar.active') && !document.querySelector('.about-modal.active')) {
            e.preventDefault();
            skipToNextCard();
        }
        
        // Escape key to close modals
        if (e.key === 'Escape') {
            if (document.querySelector('.sidebar.active')) {
                closeSidebar();
            }
            if (document.querySelector('.about-modal.active')) {
                closeAboutModal();
            }
        }
    });
    
    // Tap to skip (on content area)
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.addEventListener('click', (e) => {
            // Only skip if clicking directly on content area, not on form elements
            if (e.target === contentArea || e.target.id === 'staff' || e.target.id === 'answer') {
                skipToNextCard();
            }
        });
    }
    
    // Hamburger menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Sidebar backdrop
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeSidebar);
    }
    
    // Sidebar close button
    const sidebarCloseBtn = document.querySelector('.sidebar-close');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebar);
    }
    
    // About modal
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) {
        aboutLink.addEventListener('click', openAboutModal);
    }
    
    const aboutBackdrop = document.getElementById('about-backdrop');
    if (aboutBackdrop) {
        aboutBackdrop.addEventListener('click', closeAboutModal);
    }
    
    const aboutClose = document.getElementById('about-close');
    if (aboutClose) {
        aboutClose.addEventListener('click', closeAboutModal);
    }
    
    // Exercise type radio buttons
    const exerciseRadios = document.querySelectorAll('input[name="exercise"]');
    exerciseRadios.forEach(radio => {
        radio.addEventListener('change', changeExercise);
    });
    
    // Include ledger lines checkbox
    const ledgerCheckbox = document.getElementById('include-ledger');
    if (ledgerCheckbox) {
        ledgerCheckbox.addEventListener('change', toggleLedgerLines);
    }
    
    // Key selection checkboxes
    const keyAllCheckbox = document.getElementById('key-all');
    if (keyAllCheckbox) {
        keyAllCheckbox.addEventListener('change', toggleAllKeys);
    }
    
    for (let i = 0; i < keys.length; i++) {
        const checkbox = document.getElementById(`key-${i}`);
        if (checkbox) {
            checkbox.addEventListener('change', () => toggleKey(i));
        }
    }
    
    // Duration sliders
    const staffDurationSlider = document.getElementById('staff-duration');
    if (staffDurationSlider) {
        staffDurationSlider.addEventListener('input', updateStaffDuration);
    }
    
    const answerDurationSlider = document.getElementById('answer-duration');
    if (answerDurationSlider) {
        answerDurationSlider.addEventListener('input', updateAnswerDuration);
    }
}

/**
 * Initialize UI with default values
 */
export function initializeUI() {
    // Sync UI with JavaScript defaults
    syncCheckboxesWithSelection();
    document.getElementById('include-ledger').checked = getIncludeLedgerLines();
    document.querySelector('input[name="exercise"]:checked').value = getCurrentExercise();
    document.querySelector(`input[name="exercise"][value="${getCurrentExercise()}"]`).checked = true;
    document.getElementById('staff-duration').value = getStaffDuration();
    document.getElementById('answer-duration').value = getAnswerDuration();
    
    // Initialize slider display values
    document.getElementById('staff-duration-value').textContent = `${getStaffDuration()}s`;
    document.getElementById('answer-duration-value').textContent = `${getAnswerDuration()}s`;
}