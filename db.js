import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const g = globalThis;
export const db = g.__db || (g.__db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) }));
export const rs = (n) => "Rs. " + Number(n).toLocaleString("en-PK");
export const eff = (p) => p.salePrice || p.price;
