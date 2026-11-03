import Link from "next/link";
import PolicyPage from "@/components/legal/PolicyPage";

export const metadata = { title: "Refund Policy — NutriNation" };

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Customer care"
      title="Refund policy"
      intro="When a refund is due, we send the money back to where it came from, as quickly as your bank allows."
      updated="3 November 2026"
      current="/refund-policy"
      sections={[
        {
          id: "when",
          heading: "When you get a refund",
          body: (
            <ul>
              <li>You cancelled the order before it was shipped.</li>
              <li>An approved return under our <Link href="/return-policy" className="text-brand-green font-semibold">return policy</Link> where you chose a refund over a replacement.</li>
              <li>We could not fulfil all or part of the order (for example, an item went out of stock).</li>
              <li>A prepaid parcel was lost or returned to us by the courier.</li>
            </ul>
          ),
        },
        {
          id: "amount",
          heading: "How much is refunded",
          body: (
            <>
              <p>
                You get back the amount you actually paid for the affected items, after any coupon discount. Delivery fees
                are refunded in full when the whole order is cancelled or the problem was our fault.
              </p>
              <p>For a partial refund, coupon discounts are shared out across the items in proportion to their price.</p>
            </>
          ),
        },
        {
          id: "timeline",
          heading: "How refunds are paid and how long they take",
          body: (
            <ul>
              <li><strong>UPI:</strong> back to the same UPI account, usually within 2–3 business days.</li>
              <li><strong>Credit / debit card:</strong> back to the same card, within 5–7 business days.</li>
              <li><strong>Net banking:</strong> back to the same bank account, within 5–7 business days.</li>
              <li><strong>Cash on delivery:</strong> by bank transfer or UPI to an account you share with us, within 5–7 business days of approval.</li>
            </ul>
          ),
        },
        {
          id: "status",
          heading: "Tracking your refund",
          body: (
            <p>
              Once a refund is processed, the order shows as <strong>Refunded</strong> under{" "}
              <Link href="/account/orders" className="text-brand-green font-semibold">Track orders</Link> and we email you a
              confirmation. If the money has not arrived after the times above, contact us with your order number and we will
              share the bank reference number.
            </p>
          ),
        },
        {
          id: "exceptions",
          heading: "Exceptions",
          body: (
            <p>
              We do not refund change-of-mind requests for food products that have already been delivered, or requests raised
              more than 7 days after delivery. We may refuse refunds where we see abuse, such as repeated claims without
              evidence.
            </p>
          ),
        },
      ]}
    />
  );
}
