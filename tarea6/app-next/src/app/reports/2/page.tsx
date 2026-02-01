import { query } from '../../lib/db';
import Link from 'next/link';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const filterSchema = z.object({
  nivel: z.enum(['Platino', 'Oro', 'Estandar']).optional(),
});

interface ClientVip {
  nombre: string;
  email: string;
  total_ordenes: number;
  gasto_historico: string;
  nivel_cliente: string;
}

export default async function Reporte2({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string }>;
}) {
  const params = await searchParams;
  const parsed = filterSchema.safeParse(params);
  const nivelSeleccionado = parsed.success ? parsed.data.nivel : undefined;

  let clientes: ClientVip[] = [];
  
  if (nivelSeleccionado) {
    const result = await query(
      "SELECT * FROM vw_clientes_vip WHERE nivel_cliente = $1 ORDER BY gasto_historico DESC",
      [nivelSeleccionado]
    );
    clientes = result.rows as ClientVip[];
  } else {
    const result = await query("SELECT * FROM vw_clientes_vip ORDER BY gasto_historico DESC");
    clientes = result.rows as ClientVip[];
  }

  return (
    <main>
      <Link href="/" style={{ color: 'blue', marginBottom: '20px', display: 'block' }}>← Volver al Dashboard</Link>
      
      <h1>💎 Reporte 2: Clientes VIP</h1>
      
      <div style={{ 
        background: '#fef3c7', 
        border: '1px solid #fcd34d', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'inline-block' 
      }}>
        <span style={{ display: 'block', fontSize: '0.9rem', color: '#92400e' }}>
          Clientes Encontrados ({nivelSeleccionado || 'Todos'})
        </span>
        <strong style={{ fontSize: '1.5rem', color: '#b45309' }}>{clientes.length}</strong>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <form style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>Filtrar por Nivel:</label>
          
          <select 
            name="nivel" 
            defaultValue={nivelSeleccionado || ''}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
          >
            <option value="">-- Ver Todos --</option>
            <option value="Platino">Platino (&gt; $1000)</option>
            <option value="Oro">Oro ($500 - $1000)</option>
            <option value="Estandar">Estándar (&lt; $500)</option>
          </select>

          <button type="submit" style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Aplicar
          </button>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Email</th>
            <th>Nivel</th>
            <th>Total Gastado</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? (
            clientes.map((c, i) => (
              <tr key={i}>
                <td>{c.nombre}</td>
                <td>{c.email}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    background: c.nivel_cliente === 'Platino' ? '#e5e7eb' : 
                                c.nivel_cliente === 'Oro' ? '#fef3c7' : '#fff',
                    fontWeight: 'bold',
                    border: '1px solid #ccc'
                  }}>
                    {c.nivel_cliente}
                  </span>
                </td>
                <td>${Number(c.gasto_historico).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                No hay clientes con este nivel.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}