import Seo from "../components/Seo";
import Footer from "../components/Footer";

export default function TermsOfService() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col w-full py-0 px-0">
      <Seo
        title="Terms of Service"
        description="Read the Terms of Service for using the HI-TECH website, products, repairs, and support services."
        canonicalPath="/terms-of-service"
      />

      <div className="flex-1 w-full bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: March 25, 2026</p>

        <div className="mt-8 space-y-8 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By using the HI-TECH website, placing an order, subscribing to updates,
              or requesting repair or support services, you agree to these Terms of
              Service. If you do not agree, please do not use the website or our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Services We Provide</h2>
            <p className="mt-2">
              HI-TECH offers electronics, accessories, promotional offers, coupons,
              repair-related support, and customer service information. Product
              availability, pricing, discounts, and service scope may change at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Product Information and Pricing</h2>
            <p className="mt-2">
              We work to keep product descriptions, prices, images, and stock levels
              accurate. However, errors may occasionally occur. We reserve the right to
              correct pricing or listing mistakes, update information, limit quantities,
              or cancel affected orders when necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Orders and Payments</h2>
            <p className="mt-2">
              Orders are subject to acceptance and availability. Payment must be
              completed through an approved checkout method before shipment or service
              confirmation. We may refuse or cancel an order if fraud, misuse, pricing
              issues, or technical errors are detected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Shipping, Returns, and Repairs</h2>
            <p className="mt-2">
              Delivery timelines are estimates and may vary. Return eligibility,
              warranty coverage, and repair timelines depend on the product, condition,
              and applicable store policy. Physical damage, liquid damage, unauthorized
              repairs, or misuse may affect warranty or repair eligibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Offers, Coupons, and Promotions</h2>
            <p className="mt-2">
              Promotional offers and coupons are available for limited periods and may
              include minimum spend, product restrictions, or expiration dates. Unless
              explicitly stated, promotions cannot be combined and have no cash value.
              We may modify or withdraw promotions at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. User Accounts and Notify Me Subscriptions</h2>
            <p className="mt-2">
              You are responsible for providing accurate account or subscription
              information. You must not use false details, interfere with the website,
              attempt unauthorized access, or misuse promotional systems. We may suspend
              access or remove subscriptions that appear abusive or fraudulent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Intellectual Property</h2>
            <p className="mt-2">
              All website content, branding, text, graphics, product presentation, and
              software elements belong to HI-TECH or its licensors unless stated
              otherwise. You may not copy, reuse, distribute, or exploit website content
              without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Limitation of Liability</h2>
            <p className="mt-2">
              To the extent permitted by law, HI-TECH is not liable for indirect,
              incidental, or consequential damages arising from use of the website,
              delayed delivery, temporary downtime, third-party payment failures, or use
              of products beyond their intended purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">10. Changes to These Terms</h2>
            <p className="mt-2">
              We may update these Terms of Service from time to time. Updated versions
              become effective when posted on this page. Continued use of the website or
              services after changes means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">11. Contact</h2>
            <p className="mt-2">
              For questions about these terms, please contact HI-TECH at
              {" "}
              <a
                href="mailto:info@hitechcinisello.it"
                className="text-blue-700 hover:text-blue-900 underline"
              >
                info@hitechcinisello.it
              </a>
              {" "}
              or visit us at Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.
            </p>
          </section>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
