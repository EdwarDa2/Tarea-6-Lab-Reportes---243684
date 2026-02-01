import { query } from '../../lib/db';
import Link from 'next/link';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const filterSchema = z.object({
  min: z.coerce.number().min(0).optional().default(0),
});

interface ReporteMensual {
  mes_anio: string;
  transacciones: number;
  facturacion: string;
  iva_estimado: number;
}

export default async function Reporte4({
  searchParams,
}: {
  searchParams: Promise<{ min?: string }>;
}) {
  const params = await searchParams;
  const parsed = filterSchema.safeParse(params);
  const minVentas = parsed.success ? parsed.data.min : 0;

  const text = `
    SELECT * FROM vw_reporte_mensual 
    WHERE facturacion >= $1 
    ORDER BY mes_anio DESC
  `;
  
  const result = await query(text, [minVentas]);
  const datos = result.rows as ReporteMensual[];

  return (
    <main>
      <Link href="/" style={{ color: 'blue', marginBottom: '20px', display: 'block' }}>← Volver al Dashboard</Link>
      
      <h1>📅 Reporte 4: Desempeño Mensual</h1>
      
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <form style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor="min" style={{ fontWeight: 'bold' }}>Filtrar ventas mínimas ($):</label>
          <input 
            type="number" 
            name="min" 
            defaultValue={minVentas}
            placeholder="Ej: 500"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Filtrar
          </button>
          
          {minVentas > 0 && (
            <Link href="/reports/4" style={{ color: 'red', fontSize: '0.9rem' }}>
              Borrar filtro
            </Link>
          )}
        </form>
        
        {parsed.success && minVentas > 0 && (
          <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'green' }}>
            ✅ Mostrando meses con facturación superior a <strong>${minVentas}</strong>
          </p>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Mes / Año</th>
            <th>Total Transacciones</th>
            <th>Facturación Total</th>
            <th>IVA Estimado (16%)</th>
          </tr>
        </thead>
        <tbody>
          {datos.length > 0 ? (
            datos.map((d, i) => (
              <tr key={i}>
                <td>{d.mes_anio}</td>
                <td>{d.transacciones}</td>
                <td>${Number(d.facturacion).toFixed(2)}</td>
                <td>${Number(d.iva_estimado).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No hay meses que cumplan con este criterio de ventas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}