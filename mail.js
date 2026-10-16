import nodemailer from "nodemailer";
import { rs } from "./db";
export async function sendOrderMail(o) {
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  const lines = o.items.map(i => `- ${i.name}${i.label ? " (" + i.label + ")" : ""} x${i.qty} @ ${rs(i.unitPrice)}`).join("\n");
  const text = `Order #${o.id + 10000}\nDate: ${o.createdAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}\nCustomer: ${o.name}\nPhone: ${o.phone}\nEmail: ${o.email || "-"}\nAddress: ${o.address}, ${o.city}, ${o.province}\n\nItems:\n${lines}\n\nSubtotal: ${rs(o.subtotal)}\nDelivery: ${rs(o.delivery)}\nTotal COD: ${rs(o.total)}\nPayment: Cash on Delivery`;
  await t.sendMail({ from: process.env.GMAIL_USER, to: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER, subject: `New COD Order #${o.id + 10000} — Mobile Store`, text });
}
