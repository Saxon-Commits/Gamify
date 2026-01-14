import { ALL_COSMETIC_ITEMS, STARTER_AVATARS } from '../../src/utils/CosmeticsData';

export const AVAILABLE_AVATARS = [
    ...STARTER_AVATARS.map(s => ({ id: s.id, path: s.imageUrl, name: s.name, requiredItemId: s.id })),
    ...ALL_COSMETIC_ITEMS.filter(i => i.type === 'AVATAR' && !STARTER_AVATARS.some(s => s.id === i.id)).map(i => ({ id: i.id, path: i.imageUrl || '', name: i.name, requiredItemId: i.id }))
];

export const MASTERY_AVATARS = [
    { id: 'avatar_scribe_master', path: '/avatars/mastery/scribe_master.png' },
    { id: 'avatar_master_blacksmith', path: '/avatars/mastery/master_blacksmith.png' },
    { id: 'avatar_master_bounty_hunter', path: '/avatars/mastery/master_bounty_hunter.png' }
];
