// backend/src/env.ts
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../../.env') })
// Resolves to backend/.env regardless of where Node is run from