import { query } from '../../lib/db';
import { reporte2Queries } from '../queries/reporte2';

export interface ClientVip {
  nombre: string;
  email: string;
  total_ordenes: number;
  gasto_historico: string;
  nivel_cliente: string;
}

export type NivelCliente = 'Platino' | 'Oro' | 'Estandar';

export async function getClientesVip(nivel?: NivelCliente): Promise<ClientVip[]> {
  if (nivel) {
    const result = await query(reporte2Queries.getClientesByNivel, [nivel]);
    return result.rows as ClientVip[];
  } else {
    const result = await query(reporte2Queries.getAllClientes);
    return result.rows as ClientVip[];
  }
}