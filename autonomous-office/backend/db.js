import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

const DATA_DIR = process.env.DB_DIR || join(process.cwd(), 'data');
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, 'office.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

export default db;
