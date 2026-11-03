import Link from "next/link";
import PolicyPage, { SUPPORT_EMAIL } from "@/components/legal/PolicyPage";

export const metadata = { title: "Return Policy — NutriNation" };

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Customer care"
      title="Return policy"
      intro="Dry fruits and nuts are food products, so for hygiene and safety we cannot take back opened packs. If something arrives damaged, wrong or not up to standard, we will make it right."
      updated="3 November 2026"
      current="/return-policy"
      sections={[
        {
          id: "eligible",
          heading: "What can be returned",
          body: (
            <>
              <p>You can request a return or replacement within <strong>7 days of delivery</strong> if:</p>
              <ul>
                <li>The pack arrived damaged, torn, or with a broken seal.</li>
                <li>You received the wrong product, weight or quantity.</li>
                <li>The product is past its best-before date on arrival.</li>
                <li>The product has a quality issue — for example it is rancid, mouldy, or infested.</li>
              </ul>
            </>
          ),
        },
        {
          id: "not-eligible",
          heading: "What cannot be returned",
          body: (
            <ul>
              <li>Opened or partially consumed packs, unless the issue is a quality defect described above.</li>
              <li>Change-of-mind returns on sealed food products.</li>
              <li>Personalised gift boxes and corporate hampers, unless damaged or incorrect.</li>
              <li>Requests raised more than 7 days after delivery.</li>
            </ul>
          ),
        },
        {
          id: "how",
          heading: "How to request a return",
          body: (
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-green font-semibold">{SUPPORT_EMAIL}</a> with your
                order number (it starts with <strong>NN-</strong>; find it under{" "}
                <Link href="/account/orders" className="text-brand-green font-semibold">Track orders</Link>).
              </li>
              <li>Attach clear photos of the product, the packaging and the shipping label.</li>
              <li>Keep the product and packaging until the request is resolved.</li>
            </ol>
          ),
        },
        {
          id: "pickup",
          heading: "Pickup and inspection",
          body: (
            <p>
              We review requests within 2 business days. Where a pickup is needed we arrange it at no cost to you. Once the
              return is approved you can choose a replacement (subject to stock) or a refund, handled under our{" "}
              <Link href="/refund-policy" className="text-brand-green font-semibold">refund policy</Link>.
            </p>
          ),
        },
        {
          id: "cancellations",
          heading: "Cancelling before dispatch",
          body: (
            <p>
              To cancel, contact us with your order number before the order is marked <strong>Shipped</strong> and we will
              cancel it free of charge. After dispatch the order can no longer be cancelled, but you can refuse a
              cash-on-delivery parcel at the door.
            </p>
          ),
        },
      ]}
    />
  );
}
