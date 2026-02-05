// State Management for Key Signature Trainer

import { keys, DEFAULTS } from './data.js';

// Application state
let state = {
    currentKeyIndex: DEFAULTS.currentKeyIndex,
    currentExercise: DEFAULTS.currentExercise,
    selectedKeyIndices: [...DEFAULTS.selectedKeyIndices],
    staffDuration: DEFAULTS.staffDuration,
    answerDuration: DEFAULTS.answerDuration,
    includeLedgerLines: DEFAULTS.includeLedgerLines,
    currentAnswer: '',
    cycleInterval: null,
    answerTimeout: null
};

// Getters
export function getCurrentKeyIndex() {
    return state.currentKeyIndex;
}

export function getCurrentExercise() {
    return state.currentExercise;
}

export function getSelectedKeyIndices() {
    return state.selectedKeyIndices;
}

export function getStaffDuration() {
    return state.staffDuration;
}

export function getAnswerDuration() {
    return state.answerDuration;
}

export function getIncludeLedgerLines() {
    return state.includeLedgerLines;
}

export function getCurrentAnswer() {
    return state.currentAnswer;
}

export function getCycleInterval() {
    return state.cycleInterval;
}

export function getAnswerTimeout() {
    return state.answerTimeout;
}

// Setters
export function setCurrentKeyIndex(index) {
    state.currentKeyIndex = index;
}

export function setCurrentExercise(exercise) {
    state.currentExercise = exercise;
}

export function setSelectedKeyIndices(indices) {
    state.selectedKeyIndices = indices;
}

export function setStaffDuration(duration) {
    state.staffDuration = duration;
}

export function setAnswerDuration(duration) {
    state.answerDuration = duration;
}

export function setIncludeLedgerLines(include) {
    state.includeLedgerLines = include;
}

export function setCurrentAnswer(answer) {
    state.currentAnswer = answer;
}

export function setCycleInterval(interval) {
    state.cycleInterval = interval;
}

export function setAnswerTimeout(timeout) {
    state.answerTimeout = timeout;
}

// State manipulation functions
export function addSelectedKeyIndex(index) {
    if (!state.selectedKeyIndices.includes(index)) {
        state.selectedKeyIndices.push(index);
        state.selectedKeyIndices.sort((a, b) => a - b);
    }
}

export function removeSelectedKeyIndex(index) {
    state.selectedKeyIndices = state.selectedKeyIndices.filter(i => i !== index);
}

export function selectAllKeys() {
    state.selectedKeyIndices = keys.map((_, index) => index);
}

export function deselectAllKeys() {
    state.selectedKeyIndices = [];
}

export function moveToNextSelectedKey() {
    if (state.selectedKeyIndices.length === 0) return;
    
    // Find the next selected key index
    let nextIndex = state.selectedKeyIndices.findIndex(idx => idx > state.currentKeyIndex);
    if (nextIndex === -1) {
        // Wrap around to first selected key
        state.currentKeyIndex = state.selectedKeyIndices[0];
    } else {
        state.currentKeyIndex = selectedKeyIndices[nextIndex];
    }
}

export function getNextSelectedKeyIndex() {
    if (state.selectedKeyIndices.length === 0) return 0;
    
    // Find current position in selected keys
    const currentPos = state.selectedKeyIndices.indexOf(state.currentKeyIndex);
    if (currentPos === -1) {
        // Current key not selected, return first selected key
        return state.selectedKeyIndices[0];
    }
    
    // Move to next selected key, wrap around if at end
    const nextPos = (currentPos + 1) % state.selectedKeyIndices.length;
    return state.selectedKeyIndices[nextPos];
}

// Clear intervals
export function clearAllIntervals() {
    if (state.cycleInterval) {
        clearInterval(state.cycleInterval);
        state.cycleInterval = null;
    }
    if (state.answerTimeout) {
        clearTimeout(state.answerTimeout);
        state.answerTimeout = null;
    }
}

// Reset to defaults
export function resetState() {
    state = {
        currentKeyIndex: DEFAULTS.currentKeyIndex,
        currentExercise: DEFAULTS.currentExercise,
        selectedKeyIndices: [...DEFAULTS.selectedKeyIndices],
        staffDuration: DEFAULTS.staffDuration,
        answerDuration: DEFAULTS.answerDuration,
        includeLedgerLines: DEFAULTS.includeLedgerLines,
        currentAnswer: '',
        cycleInterval: null,
        answerTimeout: null
    };
}