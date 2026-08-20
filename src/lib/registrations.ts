import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { registrations, users } from "./schema";
import type { Registration, User } from "./schema";

export type { Registration };

export type RegistrationWithUser = {
  registration: Registration;
  user: User | null;
};

export async function getRegistrationsWithUsers(): Promise<
  RegistrationWithUser[]
> {
  return db
    .select({ registration: registrations, user: users })
    .from(registrations)
    .leftJoin(users, eq(registrations.userId, users.id))
    .orderBy(desc(registrations.startedAt));
}
