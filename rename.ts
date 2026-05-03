import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function run() {
  await db.execute(sql`ALTER TABLE users RENAME COLUMN username TO email;`);
  console.log("Renamed column username to email.");
  process.exit(0);
}
run().catch(console.error);
