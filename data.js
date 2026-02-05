// Data and Constants for Key Signature Trainer

// Key signatures data
export const keys = [
    {name: 'C Major / A minor', abcKey: 'C', accidental: '', num: 0, rootNote: 'C'},
    {name: 'G Major / E minor', abcKey: 'G', accidental: '#', num: 1, rootNote: 'G'},
    {name: 'D Major / B minor', abcKey: 'D', accidental: '#', num: 2, rootNote: 'D'},
    {name: 'A Major / F# minor', abcKey: 'A', accidental: '#', num: 3, rootNote: 'A'},
    {name: 'E Major / C# minor', abcKey: 'E', accidental: '#', num: 4, rootNote: 'E'},
    {name: 'B Major / G# minor', abcKey: 'B', accidental: '#', num: 5, rootNote: 'B'},
    {name: 'F# Major / D# minor', abcKey: 'F#', accidental: '#', num: 6, rootNote: 'F'},
    {name: 'Db Major / Bb minor', abcKey: 'Db', accidental: 'b', num: 5, rootNote: 'D'}
];

// Solfege series (Movable Do)
export const solfegeSeries = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

// Note sequence
export const noteSequence = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Key signature alterations for note name application
export const keySignatureAlterations = {
    'C': {},
    'G': {'F': '#'},
    'D': {'F': '#', 'C': '#'},
    'A': {'F': '#', 'C': '#', 'G': '#'},
    'E': {'F': '#', 'C': '#', 'G': '#', 'D': '#'},
    'B': {'F': '#', 'C': '#', 'G': '#', 'D': '#', 'A': '#'},
    'F#': {'F': '#', 'C': '#', 'G': '#', 'D': '#', 'A': '#', 'E': '#'},
    'Db': {'B': 'b', 'E': 'b', 'A': 'b', 'D': 'b', 'G': 'b'}
};

// Note ranges for exercises
export const extendedRangeNotes = [
    {abc: 'D,', name: 'D'}, {abc: 'E,', name: 'E'}, {abc: 'F,', name: 'F'}, {abc: 'G,', name: 'G'},
    {abc: 'A,', name: 'A'}, {abc: 'B,', name: 'B'},
    {abc: 'C', name: 'C'}, {abc: 'D', name: 'D'}, {abc: 'E', name: 'E'}, {abc: 'F', name: 'F'}, {abc: 'G', name: 'G'}, {abc: 'A', name: 'A'}, {abc: 'B', name: 'B'},
    {abc: 'c', name: 'C'}, {abc: 'd', name: 'D'}, {abc: 'e', name: 'E'}, {abc: 'f', name: 'F'}, {abc: 'g', name: 'G'}, {abc: 'a', name: 'A'}, {abc: 'b', name: 'B'},
    {abc: "c'", name: 'C'}, {abc: "d'", name: 'D'}, {abc: "e'", name: 'E'}, {abc: "f'", name: 'F'}, {abc: "g'", name: 'G'}, {abc: "a'", name: 'A'}, {abc: "b'", name: 'B'}
];

export const standardRangeNotes = [
    {abc: 'C', name: 'C'}, {abc: 'D', name: 'D'}, {abc: 'E', name: 'E'}, {abc: 'F', name: 'F'}, {abc: 'G', name: 'G'}, {abc: 'A', name: 'A'}, {abc: 'B', name: 'B'}
];

// Default configuration
export const DEFAULTS = {
    currentKeyIndex: 0,
    currentExercise: 'note',
    selectedKeyIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    staffDuration: 5,
    answerDuration: 5,
    includeLedgerLines: true
};