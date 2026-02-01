import { query } from '../../lib/db';
import Link from 'next/link';

interface StockProducto {
  codigo: string;
  nombre: string;
  stock: number;
  total_historico_ventas: number;
  salud_inventario: string;
}

async function getStockCritico() {
  const result = await query("SELECT * FROM vw_stock_critico ORDER BY stock ASC");
  return result.rows as StockProducto[];
}

export default async function Reporte3() {
  const productos = await getStockCritico();

  return (
    <main>
      <Link href="/" style={{ color: 'blue', marginBottom: '20px', display: 'block' }}>← Volver al Dashboard</Link>
      
      <h1>Reporte 3: Alerta de Stock</h1>
      <p>Productos con niveles bajos de inventario (Lógica CASE).</p>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Stock Actual</th>
            <th>Estado</th>
            <th>Ventas Históricas</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={i}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td style={{ fontWeight: 'bold' }}>{p.stock}</td>
              <td>
                <span style={{
                  color: p.salud_inventario === 'Agotado' ? 'red' : 
                         p.salud_inventario === 'Crítico' ? 'orange' : 'green',
                  fontWeight: 'bold'
                }}>
                  {p.salud_inventario}
                </span>
              </td>
              <td>{p.total_historico_ventas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}