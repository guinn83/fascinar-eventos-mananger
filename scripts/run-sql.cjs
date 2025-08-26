const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run(filePath) {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL environment variable');
    process.exit(2);
  }
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error('SQL file not found:', abs);
    process.exit(2);
  }
  const sql = fs.readFileSync(abs, 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    // Execute the full SQL file as a single query; Postgres supports multiple statements
    const res = await client.query(sql);
    if (res && res.command) {
      console.log('[OK]', res.command);
    }
    // If the SQL produces rows (selects), print them
    if (res && res.rows && res.rows.length) {
      console.log('[ROWS]', JSON.stringify(res.rows, null, 2));
    }
  } catch (err) {
    console.error('SQL execution error:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node run-sql.cjs path/to/file.sql');
  process.exit(2);
}
run(arg).catch(err => { console.error(err); process.exit(1); });
