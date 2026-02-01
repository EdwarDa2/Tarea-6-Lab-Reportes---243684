import { query } from '../../lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 5;

interface HistorialOrden {
  orden_ref: number;
  cliente: string;
  total: string;
  created_at: Date;
  ranking_gasto_cliente: number;
}

export default async function Reporte5({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const countResult = await query('SELECT COUNT(*) as total FROM vw_historial_ordenes');
  const totalItems = Number(countResult.rows[0]?.total || 0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const text = `
    SELECT * FROM vw_historial_ordenes 
    ORDER BY created_at DESC, orden_ref ASC 
    LIMIT $1 OFFSET $2
  `;
  const result = await query(text, [ITEMS_PER_PAGE, offset]);
  const ordenes = result.rows as HistorialOrden[];

  return (
    <main>
      <Link href="/" style={{ color: 'blue', marginBottom: '20px', display: 'block' }}>← Volver al Dashboard</Link>
      
      <h1>🏆 Reporte 5: Historial y Ranking</h1>
      
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <span style={{ display: 'block', fontSize: '0.9rem', color: '#0c4a6e' }}>Total de Órdenes Procesadas</span>
        <strong style={{ fontSize: '1.5rem', color: '#0284c7' }}>{totalItems}</strong>
      </div>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Orden #</th>
            <th>Fecha</th>
            <th>Total Compra</th>
            <th>Ranking Cliente</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length > 0 ? (
            ordenes.map((o, i) => (
              <tr key={i}>
                <td>{o.cliente}</td>
                <td>#{o.orden_ref}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>
                  {o.ranking_gasto_cliente === 1 ? '🥇 Mayor Compra' : `#${o.ranking_gasto_cliente}`}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                No hay más resultados en esta página.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
        
        {currentPage > 1 ? (
          <Link href={`/reports/5?page=${currentPage - 1}`}>
            <button style={btnStyle}>⬅ Anterior</button>
          </Link>
        ) : (
          <button style={{ ...btnStyle, opacity: 0.5, cursor: 'not-allowed' }} disabled>⬅ Anterior</button>
        )}

        <span style={{ fontWeight: 'bold' }}>
          Página {currentPage} de {totalPages || 1}
        </span>

        {currentPage < totalPages ? (
          <Link href={`/reports/5?page=${currentPage + 1}`}>
            <button style={btnStyle}>Siguiente ➡</button>
          </Link>
        ) : (
          <button style={{ ...btnStyle, opacity: 0.5, cursor: 'not-allowed' }} disabled>Siguiente ➡</button>
        )}
      </div>
    </main>
  );
}

const btnStyle = {
  padding: '8px 16px',
  background: '#333',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};