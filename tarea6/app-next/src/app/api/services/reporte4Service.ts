import { query } from '../../lib/db';
import { reporte4Queries } from '../queries/reporte4';

export interface ReporteMensual {
  mes_anio: string;
  transacciones: number;
  facturacion: string;
  iva_estimado: number;
}

export async function getReporteMensual(minVentas: number = 0): Promise<ReporteMensual[]> {
  const result = await query(reporte4Queries.getReporteMensual, [minVentas]);
  return result.rows as ReporteMensual[];
}