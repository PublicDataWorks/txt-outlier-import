import postgres from 'postgres'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export const isTesting = Deno.env.get('ENV') === 'testing'

const config = {
  prepare: false,
  ssl: isTesting ? undefined : { rejectUnauthorized: true },
}

const client = postgres(Deno.env.get('DB_POOL_URL')!, config)
const supabase: PostgresJsDatabase = drizzle(client)

export default supabase
