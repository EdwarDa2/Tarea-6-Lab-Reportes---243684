# Tarea 6: Dashboard de Reportes

> Aplicación de Inteligencia de Negocios (BI) con Next.js + PostgreSQL, que consume reportes SQL optimizados mediante una arquitectura segura de Vistas, Roles y Docker.

---

## Inicio Rápido

El proyecto usa **Docker Compose** para orquestar la base de datos y la aplicación web con un solo comando.

### 1. Configurar variables de entorno

```bash
# Crea el archivo .env basado en el ejemplo proporcionado
cp .env.example .env
```

> Asegúrate de configurar `DATABASE_URL` antes de continuar.

### 2. Levantar el entorno

```bash
docker compose up --build
```

### 3. Acceder a la aplicación

| Servicio           | URL / Puerto      |
|--------------------|-------------------|
| Web Dashboard      | http://localhost:3000 |
| Base de datos      | Puerto `5432` (interno) |

### 4. Apagar

```bash
docker compose down
```

---

## Arquitectura y Vistas SQL

Se implementaron **5 vistas** para encapsular consultas complejas y entregar datos limpios al frontend.

| Vista | Reporte | Descripción |
|---|---|---|
| `vw_ventas_categoria` | Reporte 1 | Abstrae JOINs complejos y agrega totales financieros (`SUM`, `COUNT`) por categoría. |
| `vw_clientes_vip` | Reporte 2 | Implementa lógica condicional (`CASE`) y filtros de grupo (`HAVING`) para segmentar clientes por nivel de lealtad: Platino, Oro y Estándar. |
| `vw_stock_critico` | Reporte 3 | Transforma datos numéricos en estados de negocio (`'Crítico'`, `'Saludable'`), facilitando decisiones operativas. |
| `vw_reporte_mensual` | Reporte 4 | Utiliza CTEs para organizar la agregación temporal por mes/año y el cálculo de impuestos. |
| `vw_historial_ordenes` | Reporte 5 | Emplea Window Functions (`DENSE_RANK` / `ROW_NUMBER`) para clasificar el ranking de compras de cada cliente sin subconsultas costosas. |

---

## Decisiones Técnicas (Trade-offs)

### Lógica en SQL vs Next.js

**Decisión:** Se delegó el 100% de la lógica de agregación y filtrado a PostgreSQL mediante Vistas.

**Por qué:** PostgreSQL es significativamente más eficiente procesando millones de filas que JavaScript. Traer datos crudos a Next.js para ejecutar `.filter()` o `.reduce()` habría incrementado la latencia y el consumo de memoria del contenedor.

---

### Server-Side Rendering (Dynamic)

**Decisión:** Uso de `export const dynamic = 'force-dynamic'` en todas las rutas.

**Por qué:** Los reportes requieren datos en tiempo real. La generación estática (SSG) no es viable para un dashboard operativo donde una venta reciente debe reflejarse al instante.

---

### Pool de Conexiones

**Decisión:** Uso de `pg.Pool` en lugar de conexiones individuales.

**Por qué:** Mantiene conexiones vivas y listas para reutilizarse, reduciendo el overhead del handshake TCP en cada petición HTTP.

---

## Evidencia de Performance (`EXPLAIN ANALYZE`)

### Evidencia 1 — Filtrado Optimizado por Texto

```
GroupAggregate  (cost=0.43..16.63 rows=1 width=290) (actual time=0.012..0.013 rows=0 loops=1)
  Group Key: c.nombre
  ->  Nested Loop  (cost=0.43..16.60 rows=1 width=238) (actual time=0.012..0.012 rows=0 loops=1)
        ->  Nested Loop  (cost=0.29..16.34 rows=1 width=222) (actual time=0.012..0.012 rows=0 loops=1)
              ->  Index Scan using categorias_nombre_key on categorias c  (cost=0.15..8.17 rows=1 width=222) (actual time=0.011..0.011 rows=0 loops=1)
                    Index Cond: ((nombre)::text = 'Electronics'::text)
              ->  Index Scan using idx_productos_categoria_id on productos p  (cost=0.14..8.16 rows=1 width=8) (never executed)
                    Index Cond: (categoria_id = c.id)
        ->  Index Scan using idx_orden_detalles_producto_id on orden_detalles od  (cost=0.14..0.25 rows=1 width=24) (never executed)
              Index Cond: (producto_id = p.id)
Planning Time: 0.172 ms
Execution Time: 0.064 ms

```

**Análisis:** Al filtrar por categoría ('Electronics'), la base de datos utiliza un Index Scan en `categorias_nombre_key` en lugar de leer toda la tabla. Esto reduce drásticamente el tiempo de búsqueda (0.064 ms) al ir directamente al registro deseado.

---

### Evidencia 2 — Agregación Eficiente con JOINs

```
HashAggregate  (cost=19.31..19.50 rows=4 width=290) (actual time=0.091..0.094 rows=3 loops=1)
  Group Key: c.nombre
  Filter: (sum(od.subtotal) > '100'::numeric)
  Batches: 1  Memory Usage: 24kB
  ->  Nested Loop  (cost=1.40..19.23 rows=11 width=238) (actual time=0.060..0.072 rows=11 loops=1)
        ->  Hash Join  (cost=1.25..13.01 rows=11 width=24) (actual time=0.049..0.054 rows=11 loops=1)
              Hash Cond: (p.id = od.producto_id)
              ->  Seq Scan on productos p  (cost=0.00..11.20 rows=120 width=8) (actual time=0.016..0.018 rows=16 loops=1)
              ->  Hash  (cost=1.11..1.11 rows=11 width=24) (actual time=0.015..0.016 rows=11 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 9kB
                    ->  Seq Scan on orden_detalles od  (cost=0.00..1.11 rows=11 width=24) (actual time=0.004..0.005 rows=11 loops=1)
        ->  Index Scan using categorias_pkey on categorias c  (cost=0.15..0.56 rows=1 width=222) (actual time=0.001..0.001 rows=1 loops=11)
              Index Cond: (id = p.categoria_id)
Planning Time: 3.274 ms
Execution Time: 0.296 ms

```

**Análisis:** Para calcular totales complejos, PostgreSQL utiliza un Hash Join para combinar productos y detalles de orden eficientemente en memoria, seguido de un `HashAggregate` para sumar los subtotales. Además, sigue aprovechando el índice primario de categorías (`categorias_pkey`) para el JOIN final.

---

## Modelo de Seguridad (Threat Model)

### Prevención de SQL Injection

- Se utilizan exclusivamente **consultas parametrizadas** (`$1`, `$2`) en el cliente de Node.js.
- Los inputs del usuario (filtros, paginación) son validados con **Zod** antes de llegar a la base de datos.

### Gestión de Secretos

- No hay credenciales hardcodeadas en el código fuente.
- La conexión se realiza mediante variables de entorno (`DATABASE_URL`) inyectadas por Docker desde un archivo `.env` excluido del repositorio (`.gitignore`).

### Principio de Mínimo Privilegio

- La aplicación web se conecta usando el rol `app_user`.
- Este usuario tiene permisos estrictamente limitados:

```sql
GRANT SELECT ON ALL VIEWS TO app_user;
```

- **No tiene permisos** de `INSERT`, `UPDATE`, `DELETE` ni acceso directo a las tablas base (`users`, `products`), protegiendo la integridad de los datos ante un posible compromiso del frontend.

---

## Anexo: Estructura de Base de Datos

Evidencia de las vistas SQL creadas en el proyecto (salida del comando `\dv`):

```
actividad_db=# \dv
              List of relations
 Schema |         Name          | Type |  Owner
--------+-----------------------+------+----------
 public | vw_clientes_vip       | view | postgres
 public | vw_historial_ordenes  | view | postgres
 public | vw_reporte_mensual    | view | postgres
 public | vw_stock_critico      | view | postgres
 public | vw_ventas_categoria   | view | postgres
(5 rows)
```

Las 5 vistas están correctamente registradas en el esquema `public` y son accesibles por el rol `app_user` con permisos de solo lectura.

---

## Bitácora de IA

Se utilizó asistencia de IA para acelerar el desarrollo en los siguientes puntos.

### Prompts clave utilizados

- `"Optimizar Docker Compose para red interna entre Next.js y Postgres"`
- `"Generar query SQL con Window Functions para ranking de clientes"`
- `"Cómo configurar Pool de pg en Next.js 15 con App Router"`

### Validación y correcciones aplicadas

| Problema | Corrección |
|---|---|
| La IA sugirió hardcodear la URL de conexión en `docker-compose.yml`. | Se modificó la configuración para leer `DATABASE_URL` desde el archivo `.env`, cumpliendo las mejores prácticas de seguridad. |
| Sintaxis incorrecta en Window Functions. | Se corrigió para asegurar compatibilidad con la versión específica de PostgreSQL usada en Docker. |