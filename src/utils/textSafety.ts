// @ts-ignore
import Filter from 'bad-words';

// Custom list of words to block or allow
// We can expand this list over time
const filter = new Filter();

// Optional: Remove words that might be false positives if needed
// filter.removeWords('some', 'friendly', 'word');

/**
 * Checks if text contains profanity.
 */
export const hasProfanity = (text: string): boolean => {
    if (!text) return false;
    return filter.isProfane(text);
};

/**
 * Cleans text by replacing profanity with asterisks.
 */
export const cleanText = (text: string): string => {
    if (!text) return text;
    try {
        return filter.clean(text);
    } catch (e) {
        console.error("Profanity filter error", e);
        return text; // Fallback to original if filter crashes
    }
};

/**
 * Validates text and throws if it contains profanity.
 * Useful for strict inputs like Usernames or Guild Names.
 */
export const validateTextStrict = (text: string, label: string = "Input") => {
    if (hasProfanity(text)) {
        throw new Error(`${label} contains inappropriate language.`);
    }
    return text.trim();
};
