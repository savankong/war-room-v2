import postgres from 'postgres';
import { exec } from 'child_process';
import { promisify } from 'util';
const execP = promisify(exec);

const { stdout } = await execP(
  'netlify database connect --query "SELECT 1" 2>&1 | head -1',
  { cwd: '/Users/savankong/Desktop/WarRoom.io/war-room-v2-site' }
);
const portMatch = stdout.match(/localhost:(\d+)/);
if (!portMatch) { console.error('Could not get port:', stdout); process.exit(1); }
const port = portMatch[1];
console.log('Tunnel port:', port);

const sql = postgres(`postgres://localhost:${port}/postgres`, { max: 3, prepare: false });
const result = await sql`SELECT COUNT(*) FROM orgs`;
console.log('Current orgs count:', result[0].count);
await sql.end();
