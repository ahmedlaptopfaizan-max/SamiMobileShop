import { db } from "./db";
// Atomic: only the call that flips status to Cancelled restores stock, so concurrent cancels restore exactly once.
export async function setOrderStatus(id, st) {
  if (!["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].includes(st)) return false;
  return db.$transaction(async (tx) => {
    const r = await tx.order.updateMany({ where: { id, status: { not: "Cancelled" } }, data: { status: st } });
    if (r.count !== 1) return false;
    if (st === "Cancelled") for (const i of await tx.orderItem.findMany({ where: { orderId: id } })) {
      if (i.variantId) await tx.productVariant.update({ where: { id: i.variantId }, data: { stock: { increment: i.qty } } });
      await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } }); }
    return true; });
}
