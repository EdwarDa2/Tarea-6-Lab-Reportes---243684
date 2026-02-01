import { query } from '../../lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
const ITEMS_PER_PAGE = 5; 

interface ReporteFila {
  categoria: string;
  items_vendidos: number;
  ingreso_total: string;
}

export default async function Reporte1({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const kpiResult = await query('SELECT SUM(ingreso_total) as gran_total FROM vw_ventas_categoria');
  const granTotal = Number(kpiResult.rows[0]?.gran_total || 0);

  const countResult = await query('SELECT COUNT(*) as total FROM vw_ventas_categoria');
  const totalItems = Number(countResult.rows[0]?.total || 0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const text = `
    SELECT * FROM vw_ventas_categoria 
    ORDER BY ingreso_total DESC 
    LIMIT $1 OFFSET $2
  `;
  const result = await query(text, [ITEMS_PER_PAGE, offset]);
  const ventas = result.rows as ReporteFila[];

  return (
    <main>
      <Link href="/" style={{ color: 'blue', marginBottom: '20px', display: 'block' }}>← Volver al Dashboard</Link>
      
      <h1>📊 Reporte 1: Ventas por Categoría</h1>

      <div style={{ 
        background: '#ecfdf5', 
        border: '1px solid #6ee7b7', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <span style={{ display: 'block', fontSize: '0.9rem', color: '#065f46' }}>Ingresos Totales (Global)</span>
        <strong style={{ fontSize: '1.5rem', color: '#059669' }}>${granTotal.toFixed(2)}</strong>
      </div>

      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Items Vendidos</th>
            <th>Ingreso Total</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((fila, index) => (
            <tr key={index}>
              <td>{fila.categoria}</td>
              <td>{fila.items_vendidos}</td>
              <td>${Number(fila.ingreso_total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {currentPage > 1 ? (
          <Link href={`/reports/1?page=${currentPage - 1}`}><button style={btnStyle}>⬅ Anterior</button></Link>
        ) : <button style={{...btnStyle, opacity: 0.5}} disabled>⬅ Anterior</button>}

        <span>Página {currentPage} de {totalPages || 1}</span>

        {currentPage < totalPages ? (
          <Link href={`/reports/1?page=${currentPage + 1}`}><button style={btnStyle}>Siguiente ➡</button></Link>
        ) : <button style={{...btnStyle, opacity: 0.5}} disabled>Siguiente ➡</button>}
      </div>
    </main>
  );
}

const btnStyle = { padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };