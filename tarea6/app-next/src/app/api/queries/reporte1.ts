export const reporte1Queries = {
  getGranTotal: 'SELECT SUM(ingreso_total) as gran_total FROM vw_ventas_categoria',
  
  getTotalItems: 'SELECT COUNT(*) as total FROM vw_ventas_categoria',
  
  getVentasPaginadas: `
    SELECT * FROM vw_ventas_categoria 
    ORDER BY ingreso_total DESC 
    LIMIT $1 OFFSET $2
  `
};