// Main Application Entry Point for Key Signature Trainer

import { initializeEventListeners, initializeUI, generateExercise, restartCycleInterval } from './ui-controller.js';

/**
 * Initialize the application when the DOM is ready
 */
function initializeApp() {
    // Initialize UI elements with default values
    initializeUI();
    
    // Set up all event listeners
    initializeEventListeners();
    
    // Generate initial exercise
    generateExercise();
    
    // Start the automatic cycling
    restartCycleInterval();
}

// Initialize the app when the window loads
window.addEventListener('DOMContentLoaded', initializeApp);