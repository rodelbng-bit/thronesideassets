import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

// Keep every admin page out of search results. robots.txt blocks crawling,
// but a blocked URL can still be listed if something links to it.
export const metadata: Metadata = noIndex;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
