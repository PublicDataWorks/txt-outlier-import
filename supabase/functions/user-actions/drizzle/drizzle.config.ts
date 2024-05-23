import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: '.',
  schema: './schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    user: 'postgres',
    password: 'postgres',
    host: '',
    port: 5432,
    database: 'postgres',
  },
  verbose: true,
  strict: true,
})
