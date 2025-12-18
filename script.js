const keys = [
    {name: 'C Major / A minor', abcKey: 'C', accidental: '', num: 0, rootNote: 'C'},
    {name: 'G Major / E minor', abcKey: 'G', accidental: '#', num: 1, rootNote: 'G'},
    {name: 'D Major / B minor', abcKey: 'D', accidental: '#', num: 2, rootNote: 'D'},
    {name: 'A Major / F# minor', abcKey: 'A', accidental: '#', num: 3, rootNote: 'A'},
    {name: 'E Major / C# minor', abcKey: 'E', accidental: '#', num: 4, rootNote: 'E'},
    {name: 'B Major / G# minor', abcKey: 'B', accidental: '#', num: 5, rootNote: 'B'},
    {name: 'F# Major / D# minor', abcKey: 'F#', accidental: '#', num: 6, rootNote: 'F'},
    {name: 'Db Major / Bb minor', abcKey: 'Db', accidental: 'b', num: 5, rootNote: 'D'}
];

const solfegeSeries = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];
const noteSequence = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

let currentKeyIndex = 0;
let cycleInterval;
let answerTimeout;
let currentExercise = 'key-signature';
let selectedKeyIndices = [0, 1, 2, 3, 4, 5, 6, 7]; // All keys selected by default
let staffDuration = 5; // seconds
let answerDuration = 5; // seconds
let includeLedgerLines = false;

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
        staff = `X:1\nK:${key.abcKey}\nL:1/4\n|:`;
        note = '';
    } else {
        // Generate a random note
        // Standard range: C4 to B4 (middle C to B above)
        // Extended range: 3 ledger lines below (G3) to 3 ledger lines above (E6)
        
        let notes;
        if (includeLedgerLines) {
            notes = [
                {abc: 'G,', name: 'G'}, {abc: 'A,', name: 'A'}, {abc: 'B,', name: 'B'},
                {abc: 'C', name: 'C'}, {abc: 'D', name: 'D'}, {abc: 'E', name: 'E'}, {abc: 'F', name: 'F'}, {abc: 'G', name: 'G'}, {abc: 'A', name: 'A'}, {abc: 'B', name: 'B'},
                {abc: 'c', name: 'C'}, {abc: 'd', name: 'D'}, {abc: 'e', name: 'E'}, {abc: 'f', name: 'F'}, {abc: 'g', name: 'G'}, {abc: 'a', name: 'A'}, {abc: 'b', name: 'B'},
                {abc: "c'", name: 'C'}, {abc: "d'", name: 'D'}, {abc: "e'", name: 'E'}
            ];
        } else {
            // Standard range C4 to B4
            notes = [
                {abc: 'C', name: 'C'}, {abc: 'D', name: 'D'}, {abc: 'E', name: 'E'}, {abc: 'F', name: 'F'}, {abc: 'G', name: 'G'}, {abc: 'A', name: 'A'}, {abc: 'B', name: 'B'}
            ];
        }

        const randomNoteObj = notes[Math.floor(Math.random() * notes.length)];
        const solfege = getMovableDo(key, randomNoteObj.name);
        
        staff = `X:1\nK:${key.abcKey}\nL:1/4\n[${randomNoteObj.abc}]`;
        note = solfege;
    }
    
    // Clear previous rendering
    document.getElementById("staff").innerHTML = '';
    document.getElementById("answer").textContent = '';
    
    // Render staff
    ABCJS.renderAbc("staff", staff, {
        scale: 3.0,
        add_classes: true,
        staffwidth: 100
    });
    
    // Clear any existing answer timeout
    if (answerTimeout) {
        clearTimeout(answerTimeout);
    }
    
    // Set timeout to reveal answer
    answerTimeout = setTimeout(() => {
        const answerText = currentExercise === 'key-signature' 
            ? `Key: ${key.name}` 
            : `${note}`;
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

function toggleLedgerLines() {
    includeLedgerLines = document.getElementById('include-ledger').checked;
    generateExercise();
    restartCycleInterval();
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
    
    // Hamburger menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
    
    generateExercise(); // Initial exercise
    restartCycleInterval();
}
