import { Pool } from 'pg';

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  connectionString = 'postgres://postgres:postgres@localhost:5432/actividad_db';
}



const pool = new Pool({
  connectionString,
});

export const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('❌ Error ejecutando query:', text);
    throw error;
  }
};