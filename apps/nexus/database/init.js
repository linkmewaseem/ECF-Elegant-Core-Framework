import { DB } from "@ecf/database";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initializeDatabase() {
    const migrationsPath = path.join(__dirname, "migrations");

    // 1. Run all pending database migrations via DB.migrator()
    await DB.migrator().run(migrationsPath);

    // 2. Seed initial product records if table is empty
    const count = await DB.table("products").count();

    if (count === 0) {
        const initialProducts = [
            { name: "Pro Studio Display 27\"", category: "Electronics", price: 1599.00, stock: 15, sku: "SKU-DISP-01", created_at: new Date().toISOString().split("T")[0] },
            { name: "Wireless Mechanical Keyboard", category: "Peripherals", price: 189.50, stock: 42, sku: "SKU-KB-99", created_at: new Date().toISOString().split("T")[0] },
            { name: "Ergonomic Precision Mouse", category: "Peripherals", price: 99.00, stock: 8, sku: "SKU-MS-88", created_at: new Date().toISOString().split("T")[0] },
            { name: "NVMe M.2 2TB SSD Drive", category: "Hardware", price: 210.00, stock: 65, sku: "SKU-SSD-02", created_at: new Date().toISOString().split("T")[0] },
            { name: "USB-C Multiport Dock 11-in-1", category: "Accessories", price: 129.99, stock: 4, sku: "SKU-DOCK-11", created_at: new Date().toISOString().split("T")[0] }
        ];

        for (const p of initialProducts) {
            await DB.table("products").insert(p);
        }
    }
}
