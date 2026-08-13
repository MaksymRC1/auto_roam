import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

// Map Neon's DATABASE_URL to Vercel's POSTGRES_URL if needed
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

const hasDb = !!process.env.POSTGRES_URL;

// Path to local file storage for local development fallback
const localDbPath = path.join(process.cwd(), 'local-db-journeys.json');

// Helper to initialize table if DB exists
async function initDb() {
  if (hasDb) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS journeys (
          id VARCHAR(10) PRIMARY KEY,
          route_data JSONB NOT NULL,
          anonymous_user_id VARCHAR(255),
          user_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Database table "journeys" verified/created successfully.');
    } catch (e) {
      console.error('Failed to initialize database table:', e);
    }
  } else {
    try {
      if (!fs.existsSync(localDbPath)) {
        fs.writeFileSync(localDbPath, JSON.stringify({}), 'utf8');
        console.log('Local fallback database created at:', localDbPath);
      }
    } catch (e) {
      console.error('Failed to create local database fallback file:', e);
    }
  }
}

// Trigger table verification/creation on import
initDb().catch(console.error);

export interface Journey {
  id: string;
  route_data: unknown;
  anonymous_user_id: string | null;
  user_id: string | null;
  created_at?: string;
}

export async function saveJourney(journey: Journey): Promise<void> {
  if (hasDb) {
    await sql`
      INSERT INTO journeys (id, route_data, anonymous_user_id, user_id)
      VALUES (
        ${journey.id}, 
        ${JSON.stringify(journey.route_data)}, 
        ${journey.anonymous_user_id}, 
        ${journey.user_id}
      )
      ON CONFLICT (id) DO UPDATE SET
        route_data = EXCLUDED.route_data,
        anonymous_user_id = EXCLUDED.anonymous_user_id,
        user_id = EXCLUDED.user_id;
    `;
  } else {
    let data: Record<string, Journey> = {};
    if (fs.existsSync(localDbPath)) {
      try {
        data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      } catch (e) {
        console.error('Error reading local fallback database:', e);
      }
    }
    data[journey.id] = {
      id: journey.id,
      route_data: journey.route_data,
      anonymous_user_id: journey.anonymous_user_id,
      user_id: journey.user_id,
      created_at: new Date().toISOString()
    };
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
  }
}

export async function getJourney(id: string): Promise<Journey | null> {
  if (hasDb) {
    try {
      const { rows } = await sql`
        SELECT id, route_data, anonymous_user_id, user_id, created_at 
        FROM journeys 
        WHERE id = ${id};
      `;
      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        route_data: rows[0].route_data,
        anonymous_user_id: rows[0].anonymous_user_id,
        user_id: rows[0].user_id,
        created_at: rows[0].created_at
      };
    } catch (e) {
      console.error(`Error fetching journey with ID ${id}:`, e);
      return null;
    }
  } else {
    if (!fs.existsSync(localDbPath)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      return data[id] || null;
    } catch (e) {
      console.error('Error parsing local fallback database:', e);
      return null;
    }
  }
}
