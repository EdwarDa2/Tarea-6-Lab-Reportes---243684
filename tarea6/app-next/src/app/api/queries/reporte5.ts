export const reporte5Queries = {
  getTotalOrdenes: 'SELECT COUNT(*) as total FROM vw_historial_ordenes',
  
  getOrdenesPaginadas: `
    SELECT * FROM vw_historial_ordenes 
    ORDER BY created_at DESC, orden_ref ASC 
    LIMIT $1 OFFSET $2
  `
};