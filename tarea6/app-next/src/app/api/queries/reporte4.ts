export const reporte4Queries = {
  getReporteMensual: `
    SELECT * FROM vw_reporte_mensual 
    WHERE facturacion >= $1 
    ORDER BY mes_anio DESC
  `
};
