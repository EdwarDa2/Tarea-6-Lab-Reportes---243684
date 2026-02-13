import { query } from '../../lib/db';
import { reporte3Queries } from '../queries/reporte3';

export interface StockProducto {
  codigo: string;
  nombre: string;
  stock: number;
  total_historico_ventas: number;
  salud_inventario: string;
}

export async function getStockCritico(): Promise<StockProducto[]> {
  const result = await query(reporte3Queries.getStockCritico);
  return result.rows as StockProducto[];
}