import { config } from "dotenv";
import pg from "pg";
const { Pool } = pg;

// Load environment variables from .env.local
config({ path: ".env.local" });

console.log("Attempting to connect to the database...");
console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "Yes" : "No");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not defined in your .env.local file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log("✅ Successfully connected to the database!");
    const res = await client.query("SELECT NOW()");
    console.log("🕒 Current time from database:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Error connecting to the database:");
    console.error(err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log("Connection pool closed.");
  }
}

testConnection();
