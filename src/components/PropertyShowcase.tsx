import Image from "next/image";

// Stock photography for illustration only — not live listings or real
// deal data. See AGENTS.md: don't invent real deal data.
const properties = [
  {
    image:
      "https://images.unsplash.com/photo-1633694705199-bc1e0a87c97a?w=1200&q=80&auto=format&fit=crop",
    type: "Conversion properties",
  },
  {
    image:
      "https://images.unsplash.com/photo-1676680071181-0a0b45968d23?w=1200&q=80&auto=format&fit=crop",
    type: "Purpose-built blocks",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=1200&q=80&auto=format&fit=crop",
    type: "Ex-local authority flats",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595846265893-f433f6cca81d?w=1200&q=80&auto=format&fit=crop",
    type: "Victorian conversions",
  },
  {
    image:
      "https://images.unsplash.com/photo-1716576587284-691abcf83267?w=1200&q=80&auto=format&fit=crop",
    type: "New-build apartments",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595848463742-764e6b5c11d2?w=1200&q=80&auto=format&fit=crop",
    type: "New-build apartments",
  },
];

export default function PropertyShowcase() {
  return (
    <section className="border-b rule bg-ink-soft">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="reveal">
          <p className="eyebrow">The deals we source</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold text-paper md:text-5xl">
            A sense of what lands on the{" "}
            <span className="font-accent font-normal text-brass">
              deal sheet.
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-paper-dim">
            Illustrative examples of the property types we source across
            Manchester and Leeds — not current live listings.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.image}
              className="card-lift reveal group overflow-hidden rounded-2xl border rule bg-ink"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden">
                <Image
                  src={property.image}
                  alt={`Illustrative example of ${property.type.toLowerCase()}, the kind we source in Manchester and Leeds`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent"
                />
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brass" />
                <p className="text-sm font-medium text-paper">
                  {property.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
