import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'lynx.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Profile data table
      db.run(`
        CREATE TABLE IF NOT EXISTS profile_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          bio TEXT,
          avatar TEXT,
          social_links TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Links table
      db.run(`
        CREATE TABLE IF NOT EXISTS links (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          url TEXT,
          icon TEXT,
          type TEXT DEFAULT 'link',
          text_items TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Theme configuration table
      db.run(`
        CREATE TABLE IF NOT EXISTS theme_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          primary_color TEXT DEFAULT '#007bff',
          background_color TEXT DEFAULT '#ffffff',
          text_color TEXT DEFAULT '#000000',
          button_style TEXT DEFAULT 'rounded',
          full_config TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Add full_config column if it doesn't exist (for existing databases)
          db.run(`
            ALTER TABLE theme_config ADD COLUMN full_config TEXT
          `, (alterErr) => {
            // Ignore error if column already exists
          });
          
          // Insert default theme if none exists
          db.get('SELECT COUNT(*) as count FROM theme_config', (err, row) => {
            if (!err && row.count === 0) {
              db.run(`
                INSERT INTO theme_config (primary_color, background_color, text_color, button_style)
                VALUES ('#007bff', '#ffffff', '#000000', 'rounded')
              `);
            }
          });
          resolve();
        }
      });
    });
  });
};

// Database query helpers
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;
