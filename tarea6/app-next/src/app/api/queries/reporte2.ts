export const reporte2Queries = {
  getAllClientes: 'SELECT * FROM vw_clientes_vip ORDER BY gasto_historico DESC',
  
  getClientesByNivel: `
    SELECT * FROM vw_clientes_vip 
    WHERE nivel_cliente = $1 
    ORDER BY gasto_historico DESC
  `
};
