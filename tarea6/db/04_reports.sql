-- ============================================
-- REPORTE 1: Ventas por Categoría
-- Requisitos: GROUP BY, SUM (Agregada), Campo Calculado
-- Grain: Una fila por categoría.
-- ============================================
CREATE OR REPLACE VIEW vw_ventas_categoria AS
SELECT 
    c.nombre AS categoria,
    COUNT(od.id) AS items_vendidos,
    SUM(od.subtotal) AS ingreso_total,
    -- Campo calculado: Precio promedio real de venta
    COALESCE(SUM(od.subtotal) / NULLIF(COUNT(od.id), 0), 0) AS ticket_promedio_item
FROM categorias c
JOIN productos p ON c.id = p.categoria_id
JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY c.nombre;

-- VERIFY: SELECT * FROM vw_ventas_categoria;

-- ============================================
-- REPORTE 2: Clientes VIP (Con HAVING)
-- Requisitos: HAVING, COUNT, CASE, JOIN
-- Grain: Una fila por usuario.
-- ============================================
CREATE OR REPLACE VIEW vw_clientes_vip AS
SELECT 
    u.nombre,
    u.email,
    COUNT(o.id) AS total_ordenes,
    SUM(o.total) AS gasto_historico,
    -- Uso de CASE significativo para clasificar cliente
    CASE 
        WHEN SUM(o.total) > 1000 THEN 'Platino'
        WHEN SUM(o.total) BETWEEN 500 AND 1000 THEN 'Oro'
        ELSE 'Estandar'
    END AS nivel_cliente
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
WHERE o.status IN ('pagado', 'enviado', 'entregado') -- Solo ventas reales
GROUP BY u.id, u.nombre, u.email
HAVING SUM(o.total) > 0; -- Filtro sobre agregación

-- VERIFY: SELECT * FROM vw_clientes_vip WHERE nivel_cliente = 'Platino';

-- ============================================
-- REPORTE 3: Análisis de Stock Crítico (Con CASE)
-- Requisitos: CASE, GROUP BY, HAVING
-- Grain: Una fila por producto.
-- ============================================
CREATE OR REPLACE VIEW vw_stock_critico AS
SELECT 
    p.codigo,
    p.nombre,
    p.stock,
    SUM(od.cantidad) AS total_historico_ventas,
    -- Campo calculado: Ratio de rotación (Stock vs Ventas)
    CASE 
        WHEN p.stock = 0 THEN 'Agotado'
        WHEN p.stock < 20 THEN 'Crítico'
        WHEN p.stock < 50 THEN 'Bajo'
        ELSE 'Saludable'
    END AS salud_inventario
FROM productos p
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.codigo, p.nombre, p.stock
HAVING p.stock < 100; -- Mostrar solo productos con stock menor a 100

-- VERIFY: SELECT * FROM vw_stock_critico ORDER BY stock ASC;

-- ============================================
-- REPORTE 4: Reporte Mensual (Con CTE)
-- Requisitos: CTE (WITH), DATE Functions
-- Grain: Una fila por mes/año.
-- ============================================
CREATE OR REPLACE VIEW vw_reporte_mensual AS
WITH ventas_mensuales AS (
    SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS mes_anio,
        COUNT(id) as transacciones,
        SUM(total) as facturacion
    FROM ordenes
    WHERE status != 'cancelado'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
)
SELECT 
    mes_anio,
    transacciones,
    facturacion,
    -- Campo calculado: Impuesto estimado (16%)
    (facturacion * 0.16) AS iva_estimado
FROM ventas_mensuales;

-- VERIFY: SELECT * FROM vw_reporte_mensual;

-- ============================================
-- REPORTE 5: Historial de Órdenes (Window Function)
-- Requisitos: Window Function (DENSE_RANK), Explicit Columns (No SELECT *)
-- Grain: Una fila por orden.
-- ============================================
CREATE OR REPLACE VIEW vw_historial_ordenes AS
SELECT 
    o.id AS orden_ref,
    u.nombre AS cliente,
    o.total,
    o.created_at,
    -- Window Function: Ranking de las compras más caras POR cliente
    DENSE_RANK() OVER (PARTITION BY o.usuario_id ORDER BY o.total DESC) as ranking_gasto_cliente
FROM ordenes o
JOIN usuarios u ON o.usuario_id = u.id
WHERE o.status != 'cancelado';

-- VERIFY: SELECT * FROM vw_historial_ordenes WHERE ranking_gasto_cliente = 1;