import Seo from "../components/Seo";

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <Seo
        title="Privacy Policy"
        description="Read how HI-TECH collects, uses, stores, and protects customer and subscriber information."
        canonicalPath="/privacy-policy"
      />

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: March 25, 2026</p>

        <div className="mt-8 space-y-8 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
            <p className="mt-2">
              We may collect personal information you provide directly, including your
              name, email address, phone number, shipping address, account details,
              order history, and any details you submit through contact forms, checkout,
              account registration, or the Notify Me subscription form.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
            <p className="mt-2">
              We use your information to process orders, provide customer support,
              manage your account, send service-related updates, respond to requests,
              improve the website, prevent fraud, and send promotional emails such as
              offers, coupons, and product updates when you subscribe to them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Notify Me and Marketing Emails</h2>
            <p className="mt-2">
              If you subscribe through the Notify Me button, your email address may be
              used to send welcome messages and future updates about new offers, sales,
              and coupons from HI-TECH. You should only subscribe with an email address
              you control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Payment and Order Data</h2>
            <p className="mt-2">
              Payments are handled through third-party payment providers. We do not
              store full payment card details on our own systems. We may retain order
              identifiers, transaction references, and purchase information needed for
              order fulfillment, accounting, and customer support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Sharing of Information</h2>
            <p className="mt-2">
              We may share information with trusted service providers that help us run
              the store, such as payment, delivery, email, hosting, and analytics
              providers. We may also disclose information when required by law or when
              necessary to protect our rights, customers, or systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Data Retention</h2>
            <p className="mt-2">
              We keep personal information only as long as needed for the purposes
              described in this policy, including order management, customer support,
              legal compliance, fraud prevention, and business recordkeeping.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Security</h2>
            <p className="mt-2">
              We use reasonable technical and organizational measures to protect your
              information. However, no website or storage system can be guaranteed to be
              completely secure, so you should also use strong passwords and protect
              access to your own devices and email account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Your Rights</h2>
            <p className="mt-2">
              Depending on applicable law, you may have rights to request access,
              correction, deletion, or limitation of your personal data. You may also
              request that we stop sending promotional communications linked to your
              subscription.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Third-Party Links and Services</h2>
            <p className="mt-2">
              Our website may link to external services such as payment providers, maps,
              WhatsApp, or social media platforms. Their privacy practices are governed
              by their own policies, not this one.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">10. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time to reflect service,
              legal, or operational changes. The latest version will always be posted on
              this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">11. Contact</h2>
            <p className="mt-2">
              If you have questions about privacy or how your information is handled,
              please contact HI-TECH at
              {" "}
              <a
                href="mailto:info@hitechcinisello.it"
                className="text-blue-700 hover:text-blue-900 underline"
              >
                info@hitechcinisello.it
              </a>
              {" "}
              or visit Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
