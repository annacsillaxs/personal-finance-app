import { cache } from "react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { User } from "@/lib/db/schema";

/**
 * The auth seam.
 *
 * Every service takes a `userId`, and every caller gets it from here. Today
 * that means "the seeded demo user". In Phase 9 the body of this function
 * becomes a real session lookup and *nothing else in the app changes* — if it
 * turns out something else does need to change, this layer leaked.
 *
 * `cache()` dedupes the lookup across a single server render, so ten Server
 * Components asking who the user is costs one query.
 */
export const getCurrentUser = cache(async (): Promise<User> => {
  const [user] = await db.select().from(users).limit(1);

  if (!user) {
    throw new Error(
      "No user in the database. Run `npm run db:seed` to create the demo user.",
    );
  }

  return user;
});

export async function getCurrentUserId(): Promise<string> {
  return (await getCurrentUser()).id;
}
