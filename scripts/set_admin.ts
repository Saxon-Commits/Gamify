

// This script is intended to be run via `npx convex run scripts/set_admin`
// However, since we added a safe "bootstrap" mutation, the user can just run THAT.

import { api } from "../convex/_generated/api";

const setAdmin = async () => {
    // This is a placeholder. The actual action is performed by the user invoking the mutation
    // from the dashboard or a temporary UI button, OR by running this file with a client.

    // For now, let's guide the user to the easiest path:
    console.log("To become admin:");
    console.log("1. Ensure no other admins exist (this is a safety check).");
    console.log("2. Run this mutation from your Convex Dashboard or Browser Console:");
    console.log("   await useMutation(api.admin.bootstrapAdmin)()");

    // Ideally we would execute it here if we had the context, but scripts/ environment
    // is tricky without full auth context of the specific user.
}
// Logic to run if executed directly
console.log("Use the 'bootstrapAdmin' mutation in convex/admin.ts to claim superuser status!");

