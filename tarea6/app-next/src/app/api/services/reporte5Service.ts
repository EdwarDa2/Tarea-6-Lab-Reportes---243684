import { query } from '../../lib/db';
import { reporte5Queries } from '../queries/reporte5';

export interface HistorialOrden {
  orden_ref: number;
  cliente: string;
  total: string;
  created_at: Date;
  ranking_gasto_cliente: number;
}

export async function getTotalOrdenes(): Promise<number> {
  const result = await query(reporte5Queries.getTotalOrdenes);
  return Number(result.rows[0]?.total || 0);
}

export async function getOrdenesPaginadas(
  limit: number,
  offset: number
): Promise<HistorialOrden[]> {
  const result = await query(reporte5Queries.getOrdenesPaginadas, [limit, offset]);
  return result.rows as HistorialOrden[];
}