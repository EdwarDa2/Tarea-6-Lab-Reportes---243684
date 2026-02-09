DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles 
      WHERE  rolname = 'app_user') THEN
      CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_pass_123';
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE actividad_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

GRANT SELECT ON vw_ventas_categoria TO app_user;
GRANT SELECT ON vw_clientes_vip TO app_user;
GRANT SELECT ON vw_stock_critico TO app_user;
GRANT SELECT ON vw_reporte_mensual TO app_user;
GRANT SELECT ON vw_historial_ordenes TO app_user;

REVOKE ALL ON usuarios FROM app_user;
REVOKE ALL ON ordenes FROM app_user;
REVOKE ALL ON productos FROM app_user;