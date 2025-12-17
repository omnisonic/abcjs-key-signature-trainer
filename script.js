const keys = [
    {name: 'C Major / A minor', accidental: '', num: 0, rootNote: 'C'},
    {name: 'G Major / E minor', accidental: '#', num: 1, rootNote: 'G'},
    {name: 'D Major / B minor', accidental: '#', num: 2, rootNote: 'D'},
    {name: 'A Major / F# minor', accidental: '#', num: 3, rootNote: 'A'},
    {name: 'E Major / C# minor', accidental: '#', num: 4, rootNote: 'E'},
    {name: 'B Major / G# minor', accidental: '#', num: 5, rootNote: 'B'},
    {name: 'F# Major / D# minor', accidental: '#', num: 6, rootNote: 'F#'},
    {name: 'Db Major / Bb minor', accidental: 'b', num: 5, rootNote: 'Db'}
];

const solfegeSeries = ['do', 're', 'mi', 'fa', 'sol', 'la', 'ti'];
const noteSequence = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

let currentKeyIndex = 0;
let cycleInterval;
let answerTimeout;
let currentExercise = 'key-signature';
let selectedKeyIndices = [0, 1, 2, 3, 4, 5, 6, 7]; // All keys selected by default
let staffDuration = 5; // seconds
let answerDuration = 1; // seconds

function getMovableDo(key, note) {
    const rootIndex = noteSequence.indexOf(key.rootNote);
    const noteIndex = noteSequence.indexOf(note);
    const relativeSolfegeIndex = (noteIndex - rootIndex + 7) % 7;
    return solfegeSeries[relativeSolfegeIndex];
}

function generateExercise() {
    const key = keys[currentKeyIndex];
    let staff, note;

    if (currentExercise === 'key-signature') {
        staff = `X:1\nK:${key.name}\nL:1/4\n|:`;
        note = '';
    } else {
        // Generate a random note
        const randomNoteIndex = Math.floor(Math.random() * noteSequence.length);
        const randomNote = noteSequence[randomNoteIndex];
        const solfege = getMovableDo(key, randomNote);
        
        staff = `X:1\nK:${key.name}\nL:1/4\n[${randomNote}]`;
        note = solfege;
    }
    
    // Clear previous rendering
    document.getElementById("staff").innerHTML = '';
    document.getElementById("answer").textContent = '';
    
    // Render staff
    ABCJS.renderAbc("staff", staff);
    
    // Clear any existing answer timeout
    if (answerTimeout) {
        clearTimeout(answerTimeout);
    }
    
    // Set timeout to reveal answer
    answerTimeout = setTimeout(() => {
        const answerText = currentExercise === 'key-signature' 
            ? `Key: ${key.name}` 
            : `Note: ${note} (${note === 'do' ? 'root' : 'relative to do'})`;
        document.getElementById("answer").textContent = answerText;
    }, staffDuration * 1000);
    
    // Move to next selected key
    currentKeyIndex = getNextSelectedKeyIndex();
}

function changeExercise() {
    currentExercise = document.querySelector('input[name="exercise"]:checked').value;
    syncCheckboxesWithSelection();
    generateExercise();
}

function syncCheckboxesWithSelection() {
    // Update all checkboxes to match selectedKeyIndices
    keys.forEach((key, index) => {
        const checkbox = document.getElementById(`key-${index}`);
        checkbox.checked = selectedKeyIndices.includes(index);
    });
    updateAllKeysCheckbox();
}

function toggleKey(index) {
    const checkbox = document.getElementById(`key-${index}`);
    if (checkbox.checked) {
        // Add key if not already selected
        if (!selectedKeyIndices.includes(index)) {
            selectedKeyIndices.push(index);
            selectedKeyIndices.sort((a, b) => a - b);
        }
    } else {
        // Remove key from selection
        selectedKeyIndices = selectedKeyIndices.filter(i => i !== index);
    }
    
    // Update "All Keys" checkbox
    updateAllKeysCheckbox();
    
    // If current key is no longer selected, move to next selected key
    if (!selectedKeyIndices.includes(currentKeyIndex)) {
        moveToNextSelectedKey();
    }
}

function toggleAllKeys() {
    const allCheckbox = document.getElementById('key-all');
    const allSelected = allCheckbox.checked;
    
    // Update all individual key checkboxes
    keys.forEach((key, index) => {
        const checkbox = document.getElementById(`key-${index}`);
        checkbox.checked = allSelected;
    });
    
    // Update selected key indices
    if (allSelected) {
        selectedKeyIndices = keys.map((_, index) => index);
    } else {
        selectedKeyIndices = [];
    }
    
    // If no keys are selected, we need to handle this case
    if (selectedKeyIndices.length === 0) {
        document.getElementById("staff").innerHTML = '<p>Please select at least one key to practice</p>';
        document.getElementById("answer").textContent = '';
        clearInterval(cycleInterval);
        cycleInterval = null;
    } else {
        // Make sure current key is selected
        if (!selectedKeyIndices.includes(currentKeyIndex)) {
            moveToNextSelectedKey();
        }
        // Generate new exercise
        generateExercise();
        // Restart interval if it was cleared
        if (!cycleInterval) {
            restartCycleInterval();
        }
    }
}

function updateAllKeysCheckbox() {
    const allCheckbox = document.getElementById('key-all');
    const allSelected = selectedKeyIndices.length === keys.length;
    allCheckbox.checked = allSelected;
}

function moveToNextSelectedKey() {
    if (selectedKeyIndices.length === 0) return;
    
    // Find the next selected key index
    let nextIndex = selectedKeyIndices.findIndex(idx => idx > currentKeyIndex);
    if (nextIndex === -1) {
        // Wrap around to first selected key
        currentKeyIndex = selectedKeyIndices[0];
    } else {
        currentKeyIndex = selectedKeyIndices[nextIndex];
    }
}

function getNextSelectedKeyIndex() {
    if (selectedKeyIndices.length === 0) return 0;
    
    // Find current position in selected keys
    const currentPos = selectedKeyIndices.indexOf(currentKeyIndex);
    if (currentPos === -1) {
        // Current key not selected, return first selected key
        return selectedKeyIndices[0];
    }
    
    // Move to next selected key, wrap around if at end
    const nextPos = (currentPos + 1) % selectedKeyIndices.length;
    return selectedKeyIndices[nextPos];
}

function updateStaffDuration() {
    const slider = document.getElementById('staff-duration');
    staffDuration = parseFloat(slider.value);
    document.getElementById('staff-duration-value').textContent = `${staffDuration}s`;
    
    // Regenerate exercise with new timing
    if (selectedKeyIndices.length > 0) {
        generateExercise();
        restartCycleInterval();
    }
}

function updateAnswerDuration() {
    const slider = document.getElementById('answer-duration');
    answerDuration = parseFloat(slider.value);
    document.getElementById('answer-duration-value').textContent = `${answerDuration}s`;
    
    // Update cycle interval with new timing
    restartCycleInterval();
}

function restartCycleInterval() {
    if (cycleInterval) {
        clearInterval(cycleInterval);
    }
    if (selectedKeyIndices.length > 0) {
        const totalDuration = (staffDuration + answerDuration) * 1000; // Convert to milliseconds
        cycleInterval = setInterval(generateExercise, totalDuration);
    }
}

// Start cycling through keys automatically when page loads
window.onload = function() {
    // Initialize slider display values
    document.getElementById('staff-duration-value').textContent = `${staffDuration}s`;
    document.getElementById('answer-duration-value').textContent = `${answerDuration}s`;
    
    generateExercise(); // Initial exercise
    restartCycleInterval();
}
