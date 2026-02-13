import Link from 'next/link';
import { getGranTotal, getTotalItems, getVentasPaginadas } from '../../api/services/reporte1Service';

export const dynamic = 'force-dynamic';
const ITEMS_PER_PAGE = 5; 

export default async function Reporte1({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const granTotal = await getGranTotal();
  const totalItems = await getTotalItems();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const ventas = await getVentasPaginadas(ITEMS_PER_PAGE, offset);

  return (
    <main>
      <Link href="/" style={{ color: 'blue', marginBottom: '20px', display: 'block' }}>
        ← Volver al Dashboard
      </Link>
      
      <h1>📊 Reporte 1: Ventas por Categoría</h1>

      <div style={{ 
        background: '#ecfdf5', 
        border: '1px solid #6ee7b7', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <span style={{ display: 'block', fontSize: '0.9rem', color: '#065f46' }}>
          Ingresos Totales (Global)
        </span>
        <strong style={{ fontSize: '1.5rem', color: '#059669' }}>
          ${granTotal.toFixed(2)}
        </strong>
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
          <Link href={`/reports/1?page=${currentPage - 1}`}>
            <button style={btnStyle}>⬅ Anterior</button>
          </Link>
        ) : (
          <button style={{...btnStyle, opacity: 0.5}} disabled>⬅ Anterior</button>
        )}

        <span>Página {currentPage} de {totalPages || 1}</span>

        {currentPage < totalPages ? (
          <Link href={`/reports/1?page=${currentPage + 1}`}>
            <button style={btnStyle}>Siguiente ➡</button>
          </Link>
        ) : (
          <button style={{...btnStyle, opacity: 0.5}} disabled>Siguiente ➡</button>
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
