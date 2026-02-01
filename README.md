# 📊 Tarea 6: Dashboard de Reportes (Next.js + PostgreSQL)

Este proyecto despliega una aplicación de BI que consume reportes SQL optimizados mediante una arquitectura segura de **Vistas**, **Roles** y **Docker**.

## 🧠 Justificación Técnica

### 1. Vistas (Lógica de Negocio y Abstracción)
Se implementaron 5 vistas para encapsular consultas complejas y entregar datos limpios al frontend:
* **`vw_ventas_categoria`:** Abstrae `JOINs` complejos y agrega totales financieros (`SUM`, `COUNT`) por categoría.
* **`vw_clientes_vip`:** Implementa lógica condicional (`CASE`) y filtros de grupo (`HAVING`) para segmentar clientes por nivel de lealtad.
* **`vw_stock_critico`:** Transforma datos numéricos en estados de negocio ('Crítico', 'Saludable') facilitando la toma de decisiones operativas.
* **`vw_reporte_mensual`:** Utiliza **CTEs** para organizar limpiamente la agregación temporal y el cálculo de impuestos.
* **`vw_historial_ordenes`:** Emplea **Window Functions** (`DENSE_RANK`) para clasificar compras eficientemente sin subconsultas costosas.

### 2. Índices (Optimización de Performance)
Se crearon índices estratégicos para evitar *Sequential Scans* en operaciones críticas:
* **FK Indexes (`producto_id`):** Esenciales para optimizar los `JOIN` entre tablas transaccionales y catálogos.
* **Date Index (`created_at`):** Acelera drásticamente las funciones de tiempo (`TO_CHAR`) y agrupamientos en el reporte mensual.
* **Function Index (`email`):** Optimiza la búsqueda de usuarios insensible a mayúsculas/minúsculas.

### 3. Roles y Seguridad
Se aplicó el principio de **Mínimo Privilegio** para blindar la base de datos:
* **Rol `app_user`:** Único usuario utilizado por la aplicación Next.js.
* **Restricciones:** Tiene `REVOKE ALL` sobre tablas físicas (evitando `INSERT`/`DELETE` directos) y solo posee `GRANT SELECT` sobre las Vistas específicas.
* **Beneficio:** Mitiga el impacto de ataques de inyección SQL, protegiendo la integridad histórica de los datos.

## 🚀 Ejecución Rápida

El proyecto cumple con el requisito de ejecución en un solo comando.

```bash
# 1. Levantar todo el entorno
docker compose up --build

# 2. Acceder a la web
# http://localhost:3000

# 3. Apagar
docker compose down