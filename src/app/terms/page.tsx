import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
          <header className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-primary">
              Terms of Service
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary">
              The rules for using OFFER-HUB.
            </h1>
            <p className="mt-4 text-base sm:text-lg font-light max-w-2xl mx-auto text-text-secondary">
              These Terms of Service explain what you can expect from OFFER-HUB
              and what we expect from you. Please read them carefully before
              using the platform.
            </p>
            <p className="mt-3 text-xs sm:text-sm font-light text-text-secondary">
              Last updated: February 25, 2026
            </p>
          </header>

          <div className="space-y-6">
            <section className="rounded-2xl bg-background shadow-raised p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-text-primary mb-3">
                1. Scope of Service
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                OFFER-HUB is a marketplace that connects independent
                professionals, teams, and businesses to discover, manage, and
                complete work using blockchain-backed agreements and payments.
                We provide tools for discovery, messaging, contract management,
                and transaction tracking, but we do not directly participate in
                or control the engagements between users.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                <li>
                  • We do not employ, manage, or supervise freelancers or
                  clients using the platform.
                </li>
                <li>
                  • We do not guarantee the quality, timing, legality, or
                  outcome of any project, deliverable, or payment.
                </li>
                <li>
                  • Any estimates, analytics, or recommendations provided in the
                  product are informational and not professional advice.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl bg-background shadow-raised p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-text-primary mb-3">
                2. User Responsibilities
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                To keep OFFER-HUB safe and reliable for everyone, you agree to
                use the platform responsibly and in compliance with all
                applicable laws and regulations.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                <li>
                  • Provide accurate, up-to-date information in your account and
                  project profiles.
                </li>
                <li>
                  • Maintain the confidentiality of your login credentials and
                  promptly notify us of any suspected unauthorized access.
                </li>
                <li>
                  • Use OFFER-HUB only for lawful purposes and never to engage
                  in fraud, harassment, abuse, money laundering, or other
                  prohibited activities.
                </li>
                <li>
                  • Respect the rights of other users and third parties,
                  including privacy, intellectual property, and contractual
                  commitments.
                </li>
                <li>
                  • Take full responsibility for negotiating, entering into, and
                  fulfilling any agreements you form through the platform.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl bg-background shadow-raised p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-text-primary mb-3">
                3. Intellectual Property
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                The OFFER-HUB platform, including its design, software,
                branding, and underlying technology, is owned by us or our
                licensors and is protected by copyright, trademark, and other
                intellectual property laws.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                <li>
                  • You retain ownership of any content, deliverables, or
                  materials you upload or create, subject to any separate
                  agreements you make with other users.
                </li>
                <li>
                  • By posting or uploading content to OFFER-HUB, you grant us a
                  limited, worldwide, non-exclusive license to host, display,
                  and process that content solely to operate and improve the
                  service.
                </li>
                <li>
                  • You may not copy, modify, distribute, reverse engineer, or
                  create derivative works of the platform except as expressly
                  permitted by law.
                </li>
                <li>
                  • All OFFER-HUB names, logos, and related marks are our
                  trademarks. You may not use them without our prior written
                  consent.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl bg-background shadow-raised p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-text-primary mb-3">
                4. Limitation of Liability
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                OFFER-HUB is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis. To the fullest extent permitted by law,
                we disclaim all warranties, whether express, implied, or
                statutory, including any implied warranties of merchantability,
                fitness for a particular purpose, and non-infringement.
              </p>
              <p className="mt-4 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                To the maximum extent allowed by applicable law, OFFER-HUB and
                its affiliates, officers, employees, and partners will not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, or for any loss of profits, revenue, data, or
                business opportunities, arising out of or in connection with
                your use of the platform.
              </p>
              <p className="mt-4 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                In all cases, our total aggregate liability for any claim
                related to the service will be limited to the greater of (a) the
                amount you paid to OFFER-HUB for use of the service in the
                twelve (12) months before the event giving rise to the claim, or
                (b) one hundred (100) US dollars.
              </p>
            </section>

            <section className="rounded-2xl bg-background shadow-raised p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-text-primary mb-3">
                5. Contact &amp; Questions
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                If you have any questions about these Terms of Service, or if
                you need to report a concern related to the platform, you can
                reach us at:
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                <li>
                  • General support:{" "}
                  <a
                    href="mailto:support@offerhub.io"
                    className="text-primary underline underline-offset-2"
                  >
                    support@offerhub.io
                  </a>
                </li>
                <li>
                  • Legal or compliance inquiries:{" "}
                  <a
                    href="mailto:legal@offerhub.io"
                    className="text-primary underline underline-offset-2"
                  >
                    legal@offerhub.io
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-sm sm:text-base font-light leading-relaxed text-text-secondary">
                By accessing or using OFFER-HUB, you confirm that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

