/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as documents from "../documents.js";
import type * as domainMigration from "../domainMigration.js";
import type * as gameState from "../gameState.js";
import type * as grindstone from "../grindstone.js";
import type * as guildChat from "../guildChat.js";
import type * as guilds_admin from "../guilds/admin.js";
import type * as guilds_bounties from "../guilds/bounties.js";
import type * as guilds_common from "../guilds/common.js";
import type * as guilds_general from "../guilds/general.js";
import type * as guilds_invites from "../guilds/invites.js";
import type * as guilds_members from "../guilds/members.js";
import type * as guilds_projects from "../guilds/projects.js";
import type * as http from "../http.js";
import type * as pay from "../pay.js";
import type * as rewards from "../rewards.js";
import type * as storeUser from "../storeUser.js";
import type * as textSafety from "../textSafety.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  documents: typeof documents;
  domainMigration: typeof domainMigration;
  gameState: typeof gameState;
  grindstone: typeof grindstone;
  guildChat: typeof guildChat;
  "guilds/admin": typeof guilds_admin;
  "guilds/bounties": typeof guilds_bounties;
  "guilds/common": typeof guilds_common;
  "guilds/general": typeof guilds_general;
  "guilds/invites": typeof guilds_invites;
  "guilds/members": typeof guilds_members;
  "guilds/projects": typeof guilds_projects;
  http: typeof http;
  pay: typeof pay;
  rewards: typeof rewards;
  storeUser: typeof storeUser;
  textSafety: typeof textSafety;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
