import Image from "next/image";

const company = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const social = [
  { label: "Instagram", href: "https://www.instagram.com/thronesideassets" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/throneside-assets",
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-mark.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <p className="font-display text-lg text-paper">
              Throneside Assets
            </p>
          </div>
          <p className="mt-3 max-w-xs text-sm text-paper-dim">
            Vetted property deals delivered to you, every week.
          </p>
        </div>

        <div>
          <p className="ledger-figure text-xs text-brass-bright">COMPANY</p>
          <ul className="mt-4 space-y-2">
            {company.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="ledger-figure text-xs text-brass-bright">SOCIAL</p>
          <ul className="mt-4 space-y-2">
            {social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t rule px-6 py-6 text-center text-xs text-paper-dim">
        © {new Date().getFullYear()} Throneside Assets. All rights reserved.
      </div>
    </footer>
  );
}
