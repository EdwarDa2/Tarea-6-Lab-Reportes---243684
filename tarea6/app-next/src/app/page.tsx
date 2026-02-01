import Link from 'next/link';

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard de Reportes</h1>
      <p>Sistema de Inteligencia de Negocios (PostgreSQL + Next.js)</p>

      <div style={{ marginTop: '30px', display: 'grid', gap: '15px' }}>
        
        <Link href="/reports/1">
          <div className="card">
            <h3 style={{ color: '#0070f3', marginTop: 0 }}>📊 Reporte 1: Ventas por Categoría</h3>
            <p>Ingresos y volumen de ventas por categoría de producto.</p>
          </div>
        </Link>

        <Link href="/reports/2">
          <div className="card">
            <h3 style={{ color: '#0070f3', marginTop: 0 }}>💎 Reporte 2: Clientes VIP</h3>
            <p>Segmentación de clientes basada en consumo histórico.</p>
          </div>
        </Link>

        <Link href="/reports/3">
          <div className="card">
            <h3 style={{ color: '#0070f3', marginTop: 0 }}>📦 Reporte 3: Stock Crítico</h3>
            <p>Alertas de inventario y salud del stock.</p>
          </div>
        </Link>

        <Link href="/reports/4">
          <div className="card">
            <h3 style={{ color: '#0070f3', marginTop: 0 }}>📅 Reporte 4: Finanzas Mensuales</h3>
            <p>Facturación y transacciones agrupadas por mes.</p>
          </div>
        </Link>

        <Link href="/reports/5">
          <div className="card">
            <h3 style={{ color: '#0070f3', marginTop: 0 }}>🏆 Reporte 5: Ranking de Compras</h3>
            <p>Historial detallado y ranking por cliente (Window Functions).</p>
          </div>
        </Link>

      </div>
    </main>
  );
}