import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Ensure SUPABASE_DATABASE_URL is set in your environment variables
// It should look like: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-PROJECT-REF].db.supabase.co:5432/postgres
const connectionString = process.env.SUPABASE_DATABASE_URL!;

if (!connectionString) {
  throw new Error('SUPABASE_DATABASE_URL environment variable is not set.');
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
