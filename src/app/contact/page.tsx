import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">GET IN TOUCH</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Book a call with our UK team.
        </h1>
        <p className="mt-4 text-paper-dim">
          Tell us a bit about what you&apos;re looking to invest in, and
          we&apos;ll be in touch to find out how we can source your next
          deal.
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
