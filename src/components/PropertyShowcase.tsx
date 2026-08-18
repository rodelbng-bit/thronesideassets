import Image from "next/image";

// Stock photography for illustration only — not live listings or real
// deal data. See AGENTS.md: don't invent real deal data.
const properties = [
  {
    image:
      "https://images.unsplash.com/photo-1633694705199-bc1e0a87c97a?w=1200&q=80&auto=format&fit=crop",
    type: "2-bed conversion",
    area: "Zone 2, East London",
  },
  {
    image:
      "https://images.unsplash.com/photo-1676680071181-0a0b45968d23?w=1200&q=80&auto=format&fit=crop",
    type: "Purpose-built block",
    area: "Zone 1, Central London",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=1200&q=80&auto=format&fit=crop",
    type: "Ex-local authority flat",
    area: "Zone 3, South London",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595846265893-f433f6cca81d?w=1200&q=80&auto=format&fit=crop",
    type: "Victorian conversion",
    area: "Zone 2, North London",
  },
  {
    image:
      "https://images.unsplash.com/photo-1716576587284-691abcf83267?w=1200&q=80&auto=format&fit=crop",
    type: "New-build apartment",
    area: "Zone 2, East London",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595848463742-764e6b5c11d2?w=1200&q=80&auto=format&fit=crop",
    type: "1-bed apartment",
    area: "Zone 3, West London",
  },
];

export default function PropertyShowcase() {
  return (
    <section className="border-b rule bg-ink-soft">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          THE DEALS WE SOURCE
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-paper md:text-5xl">
          A sense of what lands on the deal sheet.
        </h2>
        <p className="mt-4 max-w-xl text-paper-dim">
          Illustrative examples of the property types we source across
          London — not current live listings.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.image}
              className="overflow-hidden rounded-lg border rule bg-ink"
            >
              <div className="relative aspect-4/3 w-full">
                <Image
                  src={property.image}
                  alt={`${property.type} in ${property.area}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-paper">{property.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
