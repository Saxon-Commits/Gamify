// Companion Evolution Mapping
// Maps base companion IDs to their evolved image paths

export const COMPANION_EVOLUTIONS: Record<string, string> = {
    'companion-data-serpent': '/evo companions/data serpent evo.png',
    'companion-digital-ghost': '/evo companions/digital ghost evo 1.png',
    'companion-floating-grimoire': '/evo companions/floating grimoire evo.png',
    'companion-holo-drone': '/evo companions/holo drone evo.png',
    'companion-medic-drone': '/evo companions/medic drone evo.png',
    'companion-pebble-golem': '/evo companions/pebble golem evolved.png',
    'companion-phoenix-hatchling': '/evo companions/phoenix evolved.png',
    'companion-void-whisp': '/evo companions/void whisp evo.png',
};

// Check if a companion has an evolution available
export const canEvolveCompanion = (companionId: string): boolean => {
    return companionId in COMPANION_EVOLUTIONS;
};

// Get evolved image path for a companion
export const getEvolvedImagePath = (companionId: string): string | null => {
    return COMPANION_EVOLUTIONS[companionId] || null;
};
