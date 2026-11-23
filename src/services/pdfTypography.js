import { Font } from '@react-pdf/renderer';

// Nonaktifkan pemotongan kata otomatis yang sering memicu loop di browser
Font.registerHyphenationCallback(word => [word]);


