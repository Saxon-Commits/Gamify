export const OFFERINGS = [
    {
        id: 'deep-focus',
        title: 'Deep Focus Session',
        description: 'Eliminate all distractions - Use the Grindstone Timer to focus for 60 minutes. Notifications off, phone on silent, no tab or app switching.',
        category: 'habit' as const,
        price: 25,
        rewards: {
            gold: 50,
            xp: 120
        },
        benefits: 'Focus sessions can dramatically improve productivity and help you enter a flow state. The Grindstone Timer will help you maintain discipline!',
        imageUrl: '/images/quest_cards/quest_card_background_10.jpg'
    },
    {
        id: 'determination',
        title: 'Determination',
        description: 'Choose one task that you are avoiding and commit to finishing it now. Tip: Use the Grindstone timer to block distractions and focus on completion.',
        category: 'todo' as const,
        price: 25,
        rewards: {
            gold: 50,
            xp: 120
        },
        benefits: 'Tackling avoided tasks head-on builds mental resilience and creates momentum. The hardest step is starting!',
        imageUrl: '/images/quest_cards/quest_card_background_7.jpg'
    },
    {
        id: 'introspection',
        title: 'Introspection',
        description: 'Practice daily journaling - Individuals who practice journaling can benefit from improved mental health, increased self-awareness, goal setting and clarity, and improved memory and processing.',
        category: 'habit' as const,
        price: 25,
        rewards: {
            gold: 50,
            xp: 120
        },
        benefits: 'Journaling can benefit you with improved mental health, increased self-awareness, goal setting and clarity, and improved memory and processing.',
        imageUrl: '/images/quest_cards/quest_card_background_5.jpg'
    },
    {
        id: 'book-worm',
        title: 'Book Worm',
        description: 'Read 30 minutes a day - Reading can strengthen the brain, reduce stress, improve focus and concentration, boost memory, increase empathy, and enhance critical thinking skills.',
        category: 'habit' as const,
        price: 25,
        rewards: {
            gold: 50,
            xp: 120
        },
        benefits: 'Reading strengthens the brain, reduces stress, improves focus and concentration, boosts memory, increases empathy, and enhances critical thinking skills.',
        imageUrl: '/images/quest_cards/quest_card_background_4.jpg'
    }
];
