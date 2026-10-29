// The quote story every transport runs, so the checks can be the same.
//
// The use case is the Agent Emailing Server's interop test (tools/interop.mjs
// in https://github.com/Agent-Emailing/agent-emailing-server), unchanged. A
// buyer's purchasing agent (example.org) asks a supplier's sales agent
// (example.com) for a quote:
//
//   1. request: a parts list as CSV, a budget of up to 500.00 USD
//   2. respond, needs your input: two items have a 3-week lead time; is a
//      split delivery fine?
//   3. request, the answer, on the same task: yes
//   4. respond, done: the quote as a PDF, the price and the delivery dates
//
// Then a forged quote: the fourth message with its price raised after
// signing. The buyer must refuse it.
import { createHash } from "node:crypto";

export const OFFERING = "request-quote";
export const OFFERING_NAME = "Request a quote";
export const HANDLES = { buyer: "Purchasing.buyer@example.org", supplier: "Sales.supplier@example.com" };
export const ACTS_FOR = { buyer: "the purchasing desk at example.org", supplier: "the sales desk at example.com" };

export const CSV = Buffer.from([
  "part_number,description,quantity",
  "BR-6204,Ball bearing 6204,40",
  "SH-1220,Steel shaft 12 x 200 mm,20",
  "GB-0410,Gearbox 4:1,4",
  "CP-0032,Coupling 32 mm,8",
  "",
].join("\n"), "utf8");

/** A one-page PDF of plain text lines, written by hand (PDF 1.4, Helvetica). */
function pdf(lines) {
  const esc = (s) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const content = `BT /F1 11 Tf 72 740 Td 15 TL ${lines.map((l) => `(${esc(l)}) Tj T*`).join(" ")} ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(out, "latin1")); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

export const QUOTE_TEXT = "Quote Q-2026-1029: 412.50 USD for all four items. Items BR-6204 and SH-1220 ship on 2026-11-06; GB-0410 and CP-0032 ship on 2026-11-20.";
export const PDF = pdf([
  "Quote Q-2026-1029", "From: the sales desk at example.com", "To: the purchasing desk at example.org", "",
  "BR-6204  Ball bearing 6204        40   3.10   124.00",
  "SH-1220  Steel shaft 12 x 200 mm  20   4.25    85.00",
  "GB-0410  Gearbox 4:1               4  42.50   170.00",
  "CP-0032  Coupling 32 mm            8   4.1875  33.50", "",
  "Total: 412.50 USD", "Delivery: BR-6204 and SH-1220 on 2026-11-06; GB-0410 and CP-0032 on 2026-11-20 (split delivery).",
]);

export const ASK_TEXT = "Please quote the parts in the attached list, delivered to our plant in Denver.";
export const ASK_INPUT = { parts_list: "parts-list.csv", deliver_to: "Denver, CO" };
export const QUESTION = "Two items, GB-0410 and CP-0032, have a 3-week lead time. Is a split delivery fine?";
export const ANSWER_TEXT = "Yes, a split delivery is fine.";
export const ANSWER_INPUT = { split_delivery: true };
export const QUOTE_OUTPUT = {
  quote_id: "Q-2026-1029",
  total: "412.50 USD",
  deliveries: [{ items: ["BR-6204", "SH-1220"], date: "2026-11-06" }, { items: ["GB-0410", "CP-0032"], date: "2026-11-20" }],
};
export const PRICE = { amount_micro: 412_500_000, currency: "USD" };
export const BUDGET_CEILING = { amount_micro: 500_000_000, currency: "USD" };

export const sha256hex = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const FILES = { request: { name: "parts-list.csv", media_type: "text/csv", bytes: CSV }, done: { name: "quote-Q-2026-1029.pdf", media_type: "application/pdf", bytes: PDF } };

/** The forged quote: the same envelope with its price raised after signing. */
export function forge(env) {
  return JSON.parse(JSON.stringify(env).split("412.50 USD").join("4125.00 USD").split("412500000").join("4125000000"));
}
