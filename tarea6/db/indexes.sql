-- ============================================
-- ÍNDICES ADICIONALES PARA REPORTES
-- ============================================

-- 1. Optimiza el JOIN entre orden_detalles y productos (Usado en View 1 y 3)
-- Explicación: Las FKs en tablas hijas siempre deben tener índice.
CREATE INDEX idx_orden_detalles_producto_id ON orden_detalles(producto_id);

-- 2. Optimiza el JOIN entre orden_detalles y ordenes (Usado implicitamente en joins complejos)
-- Explicación: Acelera el agrupamiento de detalles por orden.
CREATE INDEX idx_orden_detalles_orden_id ON orden_detalles(orden_id);

-- 3. Optimiza filtros por fecha (Usado en View 4 - Reporte Mensual)
-- Explicación: Acelera el TO_CHAR y filtros de rangos de fechas.
CREATE INDEX idx_ordenes_created_at ON ordenes(created_at);

-- 4. Optimiza el filtrado de usuarios activos o búsquedas por email
CREATE INDEX idx_usuarios_email_lower ON usuarios(LOWER(email));