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
let currentExercise = 'note';
let selectedKeyIndices = [0, 1, 2, 3, 4, 5, 6, 7]; // All keys selected by default
let staffDuration = 5; // seconds
let answerDuration = 5; // seconds
let includeLedgerLines = true;
let currentAnswer = ''; // Store the current answer for early reveal

function getMovableDo(key, note) {
    const rootIndex = noteSequence.indexOf(key.rootNote);
    const noteIndex = noteSequence.indexOf(note);
    const relativeSolfegeIndex = (noteIndex - rootIndex + 7) % 7;
    return solfegeSeries[relativeSolfegeIndex];
}

// Apply key signature accidentals to a plain note letter when showing note names.
function applyKeySignatureToNoteName(keyObj, noteName) {
    // Map of common key signatures to altered scale degrees
    const alterations = {
        'C': {},
        'G': {'F': '#'},
        'D': {'F': '#', 'C': '#'},
        'A': {'F': '#', 'C': '#', 'G': '#'},
        'E': {'F': '#', 'C': '#', 'G': '#', 'D': '#'},
        'B': {'F': '#', 'C': '#', 'G': '#', 'D': '#', 'A': '#'},
        'F#': {'F': '#', 'C': '#', 'G': '#', 'D': '#', 'A': '#', 'E': '#'},
        'Db': {'B': 'b', 'E': 'b', 'A': 'b', 'D': 'b', 'G': 'b'}
    };

    const map = alterations[keyObj.abcKey] || {};
    const acc = map[noteName];
    return acc ? `${noteName}${acc}` : noteName;
}

// Apply key signature accidentals to a plain note letter when showing note names.
function applyKeySignatureToNoteName(keyObj, noteName) {
    const keyName = keyObj.abcKey;
    const alterations = {
        'C': {},
        'G': {'F': '#'},
        'D': {'F': '#', 'C': '#'},
        'A': {'F': '#', 'C': '#', 'G': '#'},
        'E': {'F': '#', 'C': '#', 'G': '#', 'D': '#'},
        'B': {'F': '#', 'C': '#', 'G': '#', 'D': '#', 'A': '#'},
        'F#': {'F': '#', 'C': '#', 'G': '#', 'D': '#', 'A': '#', 'E': '#'},
        'Db': {'B': 'b', 'E': 'b', 'A': 'b', 'D': 'b', 'G': 'b'}
    };

    const map = alterations[keyName] || {};
    const accidental = map[noteName];
    return accidental ? `${noteName}${accidental}` : noteName;
}

function generateExercise() {
    const key = keys[currentKeyIndex];
    let staff, note;

    if (currentExercise === 'key-signature') {
        staff = `X:1\nK:${key.abcKey}\nL:1/4\n|:`;
        note = '';
    } else if (currentExercise === 'note' || currentExercise === 'note-name') {
        // Generate a random note
        // Standard range: C4 to B4 (middle C to B above)
        // Extended range: 3 ledger lines below (G3) to 3 ledger lines above (E6)

        let notes;
        if (includeLedgerLines) {
            // Range: D to B (4 ledger lines above and below)
            notes = [
                {abc: 'D,', name: 'D'}, {abc: 'E,', name: 'E'}, {abc: 'F,', name: 'F'}, {abc: 'G,', name: 'G'},
                {abc: 'A,', name: 'A'}, {abc: 'B,', name: 'B'},
                {abc: 'C', name: 'C'}, {abc: 'D', name: 'D'}, {abc: 'E', name: 'E'}, {abc: 'F', name: 'F'}, {abc: 'G', name: 'G'}, {abc: 'A', name: 'A'}, {abc: 'B', name: 'B'},
                {abc: 'c', name: 'C'}, {abc: 'd', name: 'D'}, {abc: 'e', name: 'E'}, {abc: 'f', name: 'F'}, {abc: 'g', name: 'G'}, {abc: 'a', name: 'A'}, {abc: 'b', name: 'B'},
                {abc: "c'", name: 'C'}, {abc: "d'", name: 'D'}, {abc: "e'", name: 'E'}, {abc: "f'", name: 'F'}, {abc: "g'", name: 'G'}, {abc: "a'", name: 'A'}, {abc: "b'", name: 'B'}
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
        // If exercise is "note-name" show the letter name with key signature applied, otherwise show solfege (movable Do)
        note = currentExercise === 'note-name'
            ? applyKeySignatureToNoteName(key, randomNoteObj.name)
            : solfege;
    }
    
    // Clear previous rendering
    document.getElementById("staff").innerHTML = '';
    document.getElementById("answer").textContent = '';
    
    // Store the answer that will be revealed
    currentAnswer = currentExercise === 'key-signature' 
        ? `Key: ${key.name}` 
        : `${note}`;
    
    // Render staff
    ABCJS.renderAbc("staff", staff, {
        scale: 2.5,
        add_classes: true,
        staffwidth: 100
    });
    
    // Clear any existing answer timeout
    if (answerTimeout) {
        clearTimeout(answerTimeout);
    }
    
    // Set timeout to reveal answer
    answerTimeout = setTimeout(() => {
        const answerElement = document.getElementById("answer");
        answerElement.textContent = currentAnswer;
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
    const wasEmpty = selectedKeyIndices.length === 0;
    
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
    
    // If we're adding keys after having none selected, restart the exercise
    if (wasEmpty && selectedKeyIndices.length > 0) {
        generateExercise();
        restartCycleInterval();
    } else if (selectedKeyIndices.length > 0) {
        // Regenerate exercise when keys change
        generateExercise();
        restartCycleInterval();
    } else if (selectedKeyIndices.length === 0) {
        // Stop when no keys are selected
        document.getElementById("staff").innerHTML = '<p>Please select at least one key to practice</p>';
        document.getElementById("answer").textContent = '';
        clearInterval(cycleInterval);
        cycleInterval = null;
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

function skipToNextCard() {
    const answerElement = document.getElementById('answer');
    const answerText = answerElement.textContent.trim();
    
    // If answer is not shown yet, reveal it
    if (!answerText) {
        if (answerTimeout) {
            clearTimeout(answerTimeout);
        }
        // Show the answer immediately
        answerElement.textContent = currentAnswer;
    } else {
        // Answer is already shown, advance to next card
        if (answerTimeout) {
            clearTimeout(answerTimeout);
        }
        generateExercise();
        restartCycleInterval();
    }
}

// Start cycling through keys automatically when page loads
window.onload = function() {
    // Sync UI with JavaScript defaults
    syncCheckboxesWithSelection();
    document.getElementById('include-ledger').checked = includeLedgerLines;
    document.querySelector('input[name="exercise"]:checked').value = currentExercise;
    document.querySelector(`input[name="exercise"][value="${currentExercise}"]`).checked = true;
    document.getElementById('staff-duration').value = staffDuration;
    document.getElementById('answer-duration').value = answerDuration;
    
    // Initialize slider display values
    document.getElementById('staff-duration-value').textContent = `${staffDuration}s`;
    document.getElementById('answer-duration-value').textContent = `${answerDuration}s`;
    
    // Space bar and tap to skip to next card
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !document.querySelector('.sidebar.active') && !document.querySelector('.about-modal.active')) {
            e.preventDefault();
            skipToNextCard();
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
    
    // Hamburger menu toggle + modal backdrop handling
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('modal-backdrop');

    if (menuToggle && sidebar && backdrop) {
        menuToggle.addEventListener('click', () => {
            const willOpen = !sidebar.classList.contains('active');
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');

            if (willOpen) {
                backdrop.classList.add('active');
                backdrop.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            } else {
                backdrop.classList.remove('active');
                backdrop.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });

        // Close when clicking the backdrop
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('active');
            menuToggle.classList.remove('active');
            backdrop.classList.remove('active');
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });

        // Close when pressing Escape (sidebar)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                menuToggle.classList.remove('active');
                backdrop.classList.remove('active');
                backdrop.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });

        // Sidebar close button (mobile): mirror backdrop behavior
        const sidebarCloseBtn = document.querySelector('.sidebar-close');
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', () => {
                sidebar.classList.remove('active');
                menuToggle.classList.remove('active');
                backdrop.classList.remove('active');
                backdrop.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        }
    }

    // About modal wiring
    const aboutLink = document.getElementById('about-link');
    const aboutModal = document.getElementById('about-modal');
    const aboutBackdrop = document.getElementById('about-backdrop');
    const aboutClose = document.getElementById('about-close');

    function openAbout(e) {
        if (e) e.preventDefault();
        if (!aboutModal) return;
        aboutModal.classList.add('active');
        aboutBackdrop.classList.add('active');
        aboutModal.setAttribute('aria-hidden', 'false');
        aboutBackdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeAbout() {
        if (!aboutModal) return;
        aboutModal.classList.remove('active');
        aboutBackdrop.classList.remove('active');
        aboutModal.setAttribute('aria-hidden', 'true');
        aboutBackdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (aboutLink && aboutModal && aboutBackdrop) {
        aboutLink.addEventListener('click', openAbout);
        aboutBackdrop.addEventListener('click', closeAbout);
        if (aboutClose) aboutClose.addEventListener('click', closeAbout);

        // Close about modal on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && aboutModal.classList.contains('active')) {
                closeAbout();
            }
        });
    }
    
    generateExercise(); // Initial exercise
    restartCycleInterval();
}
