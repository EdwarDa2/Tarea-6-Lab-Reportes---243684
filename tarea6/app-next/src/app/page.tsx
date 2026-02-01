import { query } from './lib/db';

// 1. Definimos la forma de los datos (El "Contrato")
interface ReporteFila {
  categoria: string;
  total_productos: number; // Postgres devuelve esto como string a veces, pero lo convertiremos
  total_ventas: string;
}

async function getVentasPorCategoria() {
  const result = await query('SELECT * FROM vw_ventas_categoria ORDER BY total_ventas DESC');
  // Le decimos a TypeScript que el resultado cumple con nuestro contrato
  return result.rows as ReporteFila[];
}

export default async function Home() {
  const ventas = await getVentasPorCategoria();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📊 Reporte 1: Ventas por Categoría</h1>
      <p>Datos obtenidos en tiempo real desde PostgreSQL</p>
      
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#333', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Categoría</th>
            <th style={{ padding: '10px' }}>Total Productos</th>
            <th style={{ padding: '10px' }}>Ingresos Totales ($)</th>
          </tr>
        </thead>
        <tbody>
          {/* Ahora 'fila' ya no marcará error porque sabe qué propiedades tiene */}
          {ventas.map((fila, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px' }}>{fila.categoria}</td>
              <td style={{ padding: '10px' }}>{fila.total_productos}</td>
              <td style={{ padding: '10px' }}>
                ${Number(fila.total_ventas).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}