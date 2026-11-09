import { Order, StoreSettings } from "@/types";
import { getIncludedGst } from "@/lib/store-settings";
import { SUPPORT_EMAIL } from "@/lib/support";

// jsPDF's built-in fonts have no ₹ glyph, so the PDF spells out the currency.
const rupees = (amount: number) =>
  `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function addressLines(order: Order) {
  const a = order.shippingAddress;
  return [
    a.name,
    a.street,
    ...(a.landmark ? [a.landmark] : []),
    `${a.city}, ${a.state} - ${a.pincode}`,
    `Phone: ${a.phone}`,
  ];
}

/** Builds the invoice in the browser and downloads it as a PDF. */
export async function downloadInvoice(order: Order, settings: StoreSettings) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 15;
  const right = 195;
  const bottom = 280;
  const columns = { qty: 130, rate: 160, amount: right };
  let y = 20;

  const nextPageIfNeeded = (height: number) => {
    if (y + height > bottom) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFont("helvetica", "bold").setFontSize(18).text(settings.storeName, left, y);
  doc.setFontSize(14).text("INVOICE", right, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(settings.supportEmail || SUPPORT_EMAIL, left, y);
  doc.text(`Invoice no: ${order.orderNumber}`, right, y, { align: "right" });
  y += 5;
  doc.text(`Date: ${order.date}`, right, y, { align: "right" });
  y += 5;
  doc.text(`Order status: ${order.status}`, right, y, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "bold").text("Bill to / Ship to", left, y);
  doc.setFont("helvetica", "normal");
  for (const line of addressLines(order)) {
    y += 5;
    doc.text(doc.splitTextToSize(line, 100)[0], left, y);
  }
  y += 10;

  const tableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.text("Item", left, y);
    doc.text("Qty", columns.qty, y, { align: "right" });
    doc.text("Rate", columns.rate, y, { align: "right" });
    doc.text("Amount", columns.amount, y, { align: "right" });
    y += 2;
    doc.line(left, y, right, y);
    y += 5;
    doc.setFont("helvetica", "normal");
  };

  tableHeader();
  for (const item of order.items) {
    const name: string[] = doc.splitTextToSize(`${item.name} (${item.weight})`, 105);
    const height = name.length * 4.5 + 2;
    if (y + height > bottom) {
      doc.addPage();
      y = 20;
      tableHeader();
    }
    doc.text(name, left, y);
    doc.text(String(item.quantity), columns.qty, y, { align: "right" });
    doc.text(rupees(item.price), columns.rate, y, { align: "right" });
    doc.text(rupees(item.price * item.quantity), columns.amount, y, { align: "right" });
    y += height;
  }

  nextPageIfNeeded(45);
  doc.line(left, y, right, y);
  y += 6;

  const totalRow = (label: string, value: string) => {
    doc.text(label, columns.rate, y, { align: "right" });
    doc.text(value, columns.amount, y, { align: "right" });
    y += 5.5;
  };

  totalRow("Subtotal", rupees(order.subtotal));
  if (order.discount > 0) {
    totalRow(order.couponCode ? `Coupon ${order.couponCode}` : "Discount", `- ${rupees(order.discount)}`);
  }
  totalRow("Delivery", order.deliveryFee === 0 ? "FREE" : rupees(order.deliveryFee));
  doc.setFont("helvetica", "bold").setFontSize(11);
  totalRow("Total", rupees(order.total));
  doc.setFont("helvetica", "normal").setFontSize(9);
  totalRow(`Includes GST at ${order.gstRate}%`, rupees(getIncludedGst(order.total, order.gstRate)));
  y += 4;

  doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, left, y);

  doc.save(`Invoice-${order.orderNumber}.pdf`);
}

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function packingSlipHtml(order: Order, settings: StoreSettings) {
  const rows = order.items
    .map(
      (item) => `<tr>
        <td class="check">&#9744;</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.weight)}</td>
        <td class="sku">${escapeHtml(item.sku)}</td>
        <td class="qty">${escapeHtml(item.quantity)}</td>
      </tr>`
    )
    .join("");
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const checklist = settings.enforcePackingChecklist
    ? `<p class="checklist">&#9744; Clean-room nitrogen flush inspected before dispatch &nbsp; Packed by: ____________</p>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Packing slip ${escapeHtml(order.orderNumber)}</title>
<style>
  @page { margin: 15mm; }
  body { font: 12px/1.5 Helvetica, Arial, sans-serif; color: #000; margin: 0; }
  h1 { font-size: 20px; margin: 0; }
  header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 8px; }
  .meta { text-align: right; }
  h2 { font-size: 12px; margin: 16px 0 4px; }
  address { font-style: normal; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border-bottom: 1px solid #999; padding: 6px 8px 6px 0; text-align: left; }
  tr { break-inside: avoid; }
  .check { width: 20px; font-size: 16px; }
  .sku { font-family: monospace; white-space: nowrap; }
  .qty { text-align: right; font-weight: bold; padding-right: 0; }
  .checklist { margin-top: 24px; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>Packing Slip</h1>
      <div>${escapeHtml(settings.storeName)}</div>
    </div>
    <div class="meta">
      <strong>${escapeHtml(order.orderNumber)}</strong><br>
      Date: ${escapeHtml(order.date)}<br>
      AWB: ${escapeHtml(order.trackingNumber ?? "-")}
    </div>
  </header>
  <h2>Ship to</h2>
  <address>${addressLines(order).map(escapeHtml).join("<br>")}</address>
  <table>
    <thead>
      <tr><th></th><th>Item</th><th>Pack</th><th>SKU</th><th class="qty">Qty</th></tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td></td><td colspan="3"><strong>Total units</strong></td><td class="qty">${units}</td></tr>
    </tfoot>
  </table>
  ${checklist}
</body>
</html>`;
}

/** Prints from a hidden frame, so the admin page itself stays out of the printout. */
export function printPackingSlip(order: Order, settings: StoreSettings) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;";
  frame.srcdoc = packingSlipHtml(order, settings);
  frame.onload = () => {
    const printWindow = frame.contentWindow;
    if (!printWindow) return;
    printWindow.addEventListener("afterprint", () => frame.remove());
    printWindow.focus();
    printWindow.print();
  };
  document.body.appendChild(frame);
}
