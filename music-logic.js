// Music Theory Logic for Key Signature Trainer

import { keys, solfegeSeries, noteSequence, keySignatureAlterations, extendedRangeNotes, standardRangeNotes } from './data.js';

/**
 * Convert a note to its solfege equivalent (Movable Do)
 */
export function getMovableDo(key, note) {
    const rootIndex = noteSequence.indexOf(key.rootNote);
    const noteIndex = noteSequence.indexOf(note);
    const relativeSolfegeIndex = (noteIndex - rootIndex + 7) % 7;
    return solfegeSeries[relativeSolfegeIndex];
}

/**
 * Apply key signature accidentals to a plain note letter
 */
export function applyKeySignatureToNoteName(keyObj, noteName) {
    const map = keySignatureAlterations[keyObj.abcKey] || {};
    const accidental = map[noteName];
    return accidental ? `${noteName}${accidental}` : noteName;
}

/**
 * Generate the ABC notation staff for an exercise
 */
export function generateStaff(key, exerciseType, includeLedgerLines) {
    if (exerciseType === 'key-signature') {
        return `X:1\nK:${key.abcKey}\nL:1/4\n|:`;
    }
    
    // Generate a random note for note exercises
    const notes = includeLedgerLines ? extendedRangeNotes : standardRangeNotes;
    const randomNoteObj = notes[Math.floor(Math.random() * notes.length)];
    
    return `X:1\nK:${key.abcKey}\nL:1/4\n[${randomNoteObj.abc}]`;
}

/**
 * Generate the answer text for an exercise
 */
export function generateAnswer(key, exerciseType, noteName) {
    if (exerciseType === 'key-signature') {
        return `Key: ${key.name}`;
    }
    
    if (exerciseType === 'note-name') {
        return applyKeySignatureToNoteName(key, noteName);
    }
    
    // Default to solfege
    return getMovableDo(key, noteName);
}

/**
 * Get a random note object for the exercise
 */
export function getRandomNote(includeLedgerLines) {
    const notes = includeLedgerLines ? extendedRangeNotes : standardRangeNotes;
    return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Get the note name from a random note object
 */
export function getNoteNameFromRandomNote(randomNoteObj) {
    return randomNoteObj.name;
}