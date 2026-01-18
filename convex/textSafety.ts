// @ts-ignore
// const Filter = require("bad-words");
// const filter = new Filter();

export const cleanText = (text: string): string => {
    return text; // Temporarily disabled for debugging
    /*
    if (!text) return text;
    try {
        return filter.clean(text);
    } catch (e) {
        return text;
    }
    */
};

export const hasProfanity = (text: string): boolean => {
    return false;
};
