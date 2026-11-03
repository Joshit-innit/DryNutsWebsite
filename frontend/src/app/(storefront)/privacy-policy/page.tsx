import PolicyPage, { SUPPORT_EMAIL } from "@/components/legal/PolicyPage";

export const metadata = { title: "Privacy Policy — NutriNation" };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Your data"
      title="Privacy policy"
      intro="This explains what personal data NutriNation Foods Pvt. Ltd. collects when you shop with us, why, and the choices you have. We process data in line with India's Digital Personal Data Protection Act, 2023."
      updated="3 November 2026"
      current="/privacy-policy"
      sections={[
        {
          id: "collect",
          heading: "What we collect",
          body: (
            <ul>
              <li><strong>Account details:</strong> your name, email address and a securely hashed password.</li>
              <li><strong>Order details:</strong> delivery name, phone number, address and PIN code, the items you bought and the payment method you chose.</li>
              <li><strong>Messages:</strong> anything you send us through the contact form or by email.</li>
              <li><strong>Reviews:</strong> product reviews you choose to post, shown publicly with your name.</li>
            </ul>
          ),
        },
        {
          id: "payments",
          heading: "Payment information",
          body: (
            <p>
              We do not store card numbers, UPI PINs or net-banking credentials. Payments are handled by our payment partners,
              who are responsible for processing that data securely.
            </p>
          ),
        },
        {
          id: "use",
          heading: "How we use your data",
          body: (
            <ul>
              <li>To process, ship and support your orders, including returns and refunds.</li>
              <li>To run your account and keep it secure.</li>
              <li>To reply when you contact us.</li>
              <li>To understand overall sales so we can improve the store. We use order totals for this, not individual profiles.</li>
              <li>To send newsletters, only if you sign up for them. You can unsubscribe at any time.</li>
            </ul>
          ),
        },
        {
          id: "sharing",
          heading: "Who we share it with",
          body: (
            <>
              <p>We never sell your personal data. We share only what is needed with:</p>
              <ul>
                <li>Courier partners, who receive your delivery name, phone number and address.</li>
                <li>Payment partners, to process your payment.</li>
                <li>Our hosting and database providers, who store data on our behalf.</li>
                <li>Authorities, where the law requires it.</li>
              </ul>
            </>
          ),
        },
        {
          id: "storage",
          heading: "Browser storage",
          body: (
            <p>
              We keep your shopping cart in your browser&apos;s local storage so it is still there when you come back. Your
              sign-in session is kept in session storage and is cleared when you close the browser. We do not use advertising
              or cross-site tracking cookies.
            </p>
          ),
        },
        {
          id: "retention",
          heading: "How long we keep it",
          body: (
            <p>
              We keep account data while your account is active. Order records are kept for as long as tax and accounting
              law requires, currently up to 8 years. Contact messages are deleted after 2 years.
            </p>
          ),
        },
        {
          id: "rights",
          heading: "Your rights",
          body: (
            <p>
              You can ask to see, correct or delete your personal data, or withdraw consent for marketing. Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-green font-semibold">{SUPPORT_EMAIL}</a> with the
              subject &ldquo;Privacy request&rdquo;. We respond within 30 days. Some order records must be kept for legal
              reasons even after you delete your account.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes to this policy",
          body: (
            <p>We will update the date at the top of this page when the policy changes, and email account holders about significant changes.</p>
          ),
        },
      ]}
    />
  );
}
