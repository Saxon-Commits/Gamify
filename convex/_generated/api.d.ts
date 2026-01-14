/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as documents from "../documents.js";
import type * as gameState from "../gameState.js";
import type * as guildChat from "../guildChat.js";
import type * as guilds from "../guilds.js";
import type * as http from "../http.js";
import type * as pay from "../pay.js";
import type * as storeUser from "../storeUser.js";
import type * as users from "../users.js";
import type * as vitality from "../vitality.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  gameState: typeof gameState;
  guildChat: typeof guildChat;
  guilds: typeof guilds;
  http: typeof http;
  pay: typeof pay;
  storeUser: typeof storeUser;
  users: typeof users;
  vitality: typeof vitality;
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
