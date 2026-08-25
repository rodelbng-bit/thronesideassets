import { redirect } from "next/navigation";
import Image from "next/image";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewThemeItemForm from "@/components/NewThemeItemForm";
import ThemeItemActiveToggle from "@/components/ThemeItemActiveToggle";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, themeItems, themeEnum } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminThemeRoomPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(user?.email)) {
    redirect("/members");
  }

  const items = await db.select().from(themeItems);
  const itemsByTheme = new Map(
    themeEnum.enumValues.map((theme) => [
      theme,
      items.filter((i) => i.theme === theme),
    ])
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Theme Room catalog.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Items added here show up in the Theme Room style browser for that
          category. Cheapest price is resolved live from the shopping-price
          API — the search keywords below drive that lookup.
        </p>

        <div className="mt-10 max-w-2xl">
          <NewThemeItemForm />
        </div>

        <div className="mt-16 space-y-12">
          {themeEnum.enumValues.map((theme) => (
            <div key={theme}>
              <h2 className="font-display text-2xl text-paper">
                {theme[0].toUpperCase() + theme.slice(1)}
              </h2>
              {itemsByTheme.get(theme)!.length === 0 ? (
                <p className="mt-3 text-sm text-paper-dim">No items yet.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {itemsByTheme.get(theme)!.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border rule bg-ink-soft p-3"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-md">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-2 text-sm text-paper">{item.name}</p>
                      <p className="text-xs text-paper-dim">{item.category}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={
                            item.active
                              ? "text-xs text-brass-bright"
                              : "text-xs text-paper-dim"
                          }
                        >
                          {item.active ? "Active" : "Inactive"}
                        </span>
                        <ThemeItemActiveToggle
                          itemId={item.id}
                          initialActive={item.active}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
