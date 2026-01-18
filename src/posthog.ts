
import posthog from 'posthog-js';

// Initialize PostHog
// Note: In production, these should be environment variables.
// For this Beta/Dev setup, we are hardcoding for simplicity as requested.
const POSTHOG_KEY = 'phc_J8H9ncvATA50mUjdku1EG7XslSE8lZYLbJ70KL6UiUE';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export const initPostHog = () => {
    if (typeof window !== 'undefined') {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            person_profiles: 'identified_only', // Better privacy default
            capture_pageview: false, // We will manually capture pageviews for React Router
        });
    }
};

export default posthog;
