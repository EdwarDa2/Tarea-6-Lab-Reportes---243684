import { query } from '../../lib/db';
import { reporte1Queries } from '../queries/reporte1';

export interface ReporteFila {
  categoria: string;
  items_vendidos: number;
  ingreso_total: string;
}

export async function getGranTotal(): Promise<number> {
  const result = await query(reporte1Queries.getGranTotal);
  return Number(result.rows[0]?.gran_total || 0);
}

export async function getTotalItems(): Promise<number> {
  const result = await query(reporte1Queries.getTotalItems);
  return Number(result.rows[0]?.total || 0);
}

export async function getVentasPaginadas(
  limit: number, 
  offset: number
): Promise<ReporteFila[]> {
  const result = await query(reporte1Queries.getVentasPaginadas, [limit, offset]);
  return result.rows as ReporteFila[];
}