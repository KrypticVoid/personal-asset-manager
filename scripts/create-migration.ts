import * as fs from 'fs';
import * as path from 'path';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  process.exit(1);
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-T:]./g, '')
  .slice(0, 14);
const filename = `${timestamp}_${migrationName}.ts`;
const migrationsPath = path.join(__dirname, '../src/database/migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsPath)) {
  fs.mkdirSync(migrationsPath, { recursive: true });
}

const template = `import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code here
}

export async function down(db: Kysely<any>): Promise<void> {
  // Rollback code here
}
`;

fs.writeFileSync(path.join(migrationsPath, filename), template);
console.log(`Created migration: ${filename}`);
