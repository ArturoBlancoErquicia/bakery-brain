
# Diseño del Sistema: Predicción de Ventas de Panaderías

## Resumen Ejecutivo

Este documento describe la arquitectura y el diseño de una aplicación web end-to-end para predecir las ventas diarias (D+1, D+7, D+28) para una cadena de 6 panaderías, gestionar el inventario y las órdenes de fabricación. La solución está diseñada para ser escalable, segura, mantenible y operada bajo principios de MLOps. Se detallan los componentes clave, desde la ingesta de datos hasta la interfaz de usuario, cubriendo requisitos funcionales y no funcionales, estrategias de datos, modelado, monitorización y seguridad.

## 1. Arquitectura (Lógica y Física)

### 1.1. Arquitectura Lógica

La arquitectura lógica se compone de los siguientes módulos principales:

*   **Ingesta de Datos**: Responsable de recolectar datos de diversas fuentes.
*   **ETL (Extract, Transform, Load)**: Procesa y transforma los datos crudos en formatos listos para análisis y entrenamiento.
*   **Feature Store**: Almacena y gestiona características (features) de manera centralizada para entrenamiento y servido de modelos.
*   **Gestión de Inventario**: Módulo para rastrear niveles de stock, puntos de reorden y alertas.
*   **Gestión de Órdenes de Fabricación**: Módulo para crear, seguir y completar órdenes de producción de artículos de panadería.
*   **Entrenamiento de Modelos (MLOps Pipeline)**: Orquesta el reentrenamiento, evaluación y versionado de modelos.
*   **Model Serving**: Expone los modelos entrenados a través de una API para predicciones.
*   **Frontend**: Interfaz de usuario web para visualización de predicciones, carga de datos, gestión de inventario y órdenes de fabricación.
*   **Monitorización y Alertas**: Observa la salud del sistema, la calidad de los datos y el rendimiento del modelo.

**Diagrama de Arquitectura Lógica (Mermaid):**
```mermaid
graph TD
    subgraph Fuentes de Datos
        FD1[Datos POS (Ventas Históricas)]
        FD2[Datos de Inventario (Inicial/Ajustes)]
        FD3[API de Clima]
        FD4[Datos de Foot-Traffic (Sensor/Externo)]
        FD5[Calendario de Eventos (Locales, Festivos)]
        FD6[Datos de Ingredientes (Existencias, Precios)]
        FD7[Carga Manual (Excel/CSV Históricos)]
        FD8[Órdenes de Fabricación (Estado)]
    end

    subgraph Ingesta de Datos
        Ingestor[Servicio de Ingesta / ETL Inicial (e.g., Cloud Functions, Scripts Python)]
        BucketRaw[Data Lake: Almacenamiento Crudo (e.g., Google Cloud Storage, AWS S3)]
    end

    subgraph ETL y Feature Engineering
        ETLProcess[Motor de ETL (e.g., Apache Spark, Google Dataflow, AWS Glue, Prefect/Airflow)]
        BucketProcessed[Data Lake: Almacenamiento Procesado (Parquet en GCS/S3)]
        FeatureStore[Feature Store (e.g., Vertex AI Feature Store, Feast, Hopsworks)]
    end

    subgraph Gestión de Datos Operacionales
        DBInventario[Base de Datos de Inventario (e.g., Firestore, Cloud SQL)]
        DBOrdenesFab[Base de Datos de Órdenes de Fabricación (e.g., Firestore, Cloud SQL)]
    end

    subgraph MLOps - Entrenamiento
        ModelTrainingPipeline[Pipeline de Entrenamiento de Modelos (e.g., Vertex AI Pipelines, Kubeflow Pipelines, MLflow Projects + Airflow)]
        ModelRegistry[Registro de Modelos (e.g., Vertex AI Model Registry, MLflow Model Registry)]
        ExperimentTracking[Seguimiento de Experimentos (e.g., Vertex AI Experiments, MLflow Tracking)]
    end

    subgraph MLOps - Servido de Modelos
        ModelServingAPI[API de Servido de Predicciones (e.g., Vertex AI Endpoint, FastAPI/Flask en Cloud Run/Kubernetes, AWS SageMaker Endpoint)]
        PredictionCache[Caché de Predicciones (e.g., Redis, Memorystore)]
    end

    subgraph Frontend y Autenticación
        WebApp[Aplicación Web Frontend (Next.js, React)]
        UserAuth[Servicio de Autenticación (e.g., Firebase Authentication, Auth0, Keycloak)]
    end

    subgraph Monitorización, Logging y Alertas
        MonitoringSystem[Sistema de Monitorización (e.g., Prometheus, Grafana, Google Cloud Monitoring, AWS CloudWatch)]
        AlertingSystem[Sistema de Alertas (e.g., Alertmanager, PagerDuty, Notificaciones Cloud)]
        LoggingSystem[Sistema de Logging Centralizado (e.g., ELK Stack, Google Cloud Logging, AWS CloudWatch Logs)]
    end

    FD1 --> Ingestor
    FD2 --> Ingestor
    FD3 --> Ingestor
    FD4 --> Ingestor
    FD5 --> Ingestor
    FD6 --> Ingestor
    FD7 --> Ingestor
    FD8 --> DBOrdenesFab // Estado de órdenes directamente a su BD
    Ingestor --> BucketRaw
    BucketRaw --> ETLProcess
    ETLProcess --> BucketProcessed
    ETLProcess --> FeatureStore
    ETLProcess --> DBInventario // Actualización de inventario tras ETL de ventas

    FeatureStore --> ModelTrainingPipeline
    BucketProcessed --> ModelTrainingPipeline
    ModelTrainingPipeline --> ModelRegistry
    ModelTrainingPipeline --> ExperimentTracking
    ModelRegistry --> ModelServingAPI

    ModelServingAPI --> PredictionCache
    PredictionCache -.-> WebApp
    ModelServingAPI --> WebApp
    WebApp --> UserAuth

    WebApp --> DBInventario // Consultas de stock
    WebApp --> DBOrdenesFab // Gestión de órdenes de fabricación

    DBOrdenesFab -- Actualización de stock al completar --> DBInventario

    ModelServingAPI --> MonitoringSystem
    ETLProcess --> MonitoringSystem
    Ingestor --> MonitoringSystem
    FeatureStore --> MonitoringSystem
    DBInventario --> MonitoringSystem
    DBOrdenesFab --> MonitoringSystem
    MonitoringSystem --> AlertingSystem

    ModelTrainingPipeline --> LoggingSystem
    ModelServingAPI --> LoggingSystem
    WebApp --> LoggingSystem
    Ingestor --> LoggingSystem
    ETLProcess --> LoggingSystem
```

### 1.2. Arquitectura Física (Ejemplo Cloud - Google Cloud Platform)

*   **Ingesta**: Cloud Functions, Pub/Sub.
*   **Data Lake**: Google Cloud Storage (GCS) para datos crudos y procesados (Parquet).
*   **ETL**: Dataflow (Apache Beam gestionado) o Dataproc (Spark gestionado). Orchestration con Cloud Composer (Airflow gestionado).
*   **Feature Store**: Vertex AI Feature Store.
*   **Bases de Datos Operacionales**:
    *   **Inventario y Órdenes de Fabricación**: Firestore (NoSQL, escalable) o Cloud SQL (PostgreSQL, para transacciones ACID si son complejas). La elección dependerá de la complejidad de las consultas y transacciones.
*   **Entrenamiento de Modelos**: Vertex AI Training con Vertex AI Pipelines para orquestación.
*   **Registro de Modelos**: Vertex AI Model Registry.
*   **Seguimiento de Experimentos**: Vertex AI Experiments.
*   **Model Serving**: Vertex AI Endpoints (para predicciones online) o Vertex AI Batch Predictions (para predicciones batch D+1, D+7, D+28).
*   **Frontend**: Next.js desplegado en Firebase Hosting o Cloud Run.
*   **Autenticación**: Firebase Authentication.
*   **Caché**: Memorystore for Redis.
*   **Monitorización, Logging, Alertas**: Cloud Monitoring, Cloud Logging, Pub/Sub para notificaciones.
*   **CI/CD**: Cloud Build, Artifact Registry.

### 1.3. Requisitos No Funcionales

*   **Rendimiento y Latencia**:
    *   **Predicciones Diarias (Batch D+1, D+7, D+28)**: Deben estar disponibles en el frontend y vía API antes de las 06:00 AM hora local de cada panadería.
    *   **Latencia Consulta Individual (Frontend)**: Para una predicción específica de un producto/tienda, la respuesta debe ser < 2 segundos (idealmente < 500ms si se usa caché).
    *   **Actualización de Stock (Post-venta/Post-fabricación)**: Debe reflejarse en el sistema en < 5 minutos.
    *   **Pipeline de ETL y Entrenamiento**: El pipeline completo de reentrenamiento (incluyendo ETL y feature engineering) no debe exceder las 4 horas para permitir actualizaciones diarias.
*   **Disponibilidad y Tolerancia a Fallos**:
    *   **SLA de Disponibilidad del Sistema**: 99.9% para el frontend y la API de predicciones.
    *   **Recuperación ante Desastres (DR)**:
        *   Infraestructura como Código (IaC) con Terraform o Cloud Deployment Manager para recrear el entorno en otra región.
        *   Backups regulares de bases de datos (Cloud SQL, Firestore) y snapshots del Data Lake (GCS).
        *   Modelos versionados y artefactos almacenados de forma redundante. RTO (Recovery Time Objective) < 8 horas, RPO (Recovery Point Objective) < 24 horas.
    *   **Continuidad del Negocio (BCP)**:
        *   Componentes críticos (API de serving, Frontend, DBs operacionales) desplegados en múltiples zonas de disponibilidad dentro de una región.
        *   Reintentos automáticos y colas de mensajes (Pub/Sub) para la ingesta de datos.
        *   Failover automático para bases de datos si es posible.

### 1.4. Usabilidad del Frontend

*   **Roles de Usuario**:
    1.  **Gerente de Panadería (Tienda)**: Acceso a su propia tienda o grupo de tiendas asignadas.
    2.  **Encargado de Producción**: Acceso a la gestión de órdenes de fabricación.
    3.  **Analista de Negocio / Planificador Central**: Acceso a todas las tiendas, métricas agregadas, configuración de modelos, gestión de inventario global.
    4.  **Administrador del Sistema**: Gestión de usuarios, configuración global, monitorización del sistema.
*   **Funcionalidades por Rol**:
    *   **Gerente de Panadería**:
        *   Visualizar predicciones de ventas (D+1, D+7, D+28) para productos de su tienda.
        *   Ver tendencias históricas de ventas y comparación con predicciones pasadas.
        *   Input de eventos locales o promociones específicas de su tienda.
        *   Visualizar alertas de stock de su tienda.
        *   Consultar estado de órdenes de fabricación destinadas a su tienda.
    *   **Encargado de Producción**:
        *   Crear nuevas órdenes de fabricación basadas en necesidades o sugerencias del sistema (derivadas de predicciones y stock bajo).
        *   Actualizar el estado de las órdenes de fabricación (Pendiente, En Progreso, Completada).
        *   Ver la lista de órdenes de fabricación, filtrar por estado, producto, tienda.
        *   Recibir alertas si los ingredientes para una orden son insuficientes (requiere integración con stock de ingredientes).
    *   **Analista de Negocio / Planificador Central**:
        *   Todas las funcionalidades del Gerente y Encargado de Producción, pero para todas las tiendas/global.
        *   Visualizar métricas de rendimiento del modelo (MAE, RMSE, MAPE) por tienda y globales.
        *   Acceder al módulo de carga de datos históricos.
        *   Ver análisis de explicabilidad del modelo.
        *   Gestionar niveles de inventario base, puntos de reorden globales.
    *   **Administrador del Sistema**:
        *   Gestión de cuentas de usuario y roles.
        *   Monitorizar la salud del sistema y los pipelines de MLOps.
        *   Configurar parámetros globales de la aplicación.
        *   Acceder a logs de auditoría.

## 2. Datos y Feature Store

### 2.1. Fuentes de Datos y Esquemas (Ejemplos)

*   **Datos de POS (Point of Sale)**:
    *   Esquema: `(transaction_id, timestamp, store_id, product_id, quantity_sold, price_unit, total_amount, promotion_applied_id)`
    *   Fuente: Exportaciones diarias/API del sistema POS de cada panadería. **Una vez procesados, estos datos de ventas deben utilizarse para actualizar los niveles de inventario en tiempo real o cuasi real.**
*   **Datos de Inventario (Productos Terminados)**:
    *   Esquema: `(snapshot_timestamp, store_id, product_id, product_name, current_stock, stock_unit, reorder_point, last_updated_by_order_id)`
    *   Fuente: Actualizaciones por ventas (decremento), finalización de órdenes de fabricación (incremento), o ajustes manuales.
*   **Datos de Órdenes de Fabricación**:
    *   Esquema: `(order_id, product_id, product_name, quantity_planned, quantity_produced, store_id_destination, status (pendiente, en_progreso, completada, cancelada), creation_date, completion_date, assigned_to)`
    *   Fuente: Módulo de gestión de órdenes de fabricación en el frontend.
*   **Datos de Clima**:
    *   Esquema: `(timestamp, location_coordinates/zip_code, temperature, precipitation, humidity, wind_speed, weather_condition_code)`
    *   Fuente: API meteorológica externa.
*   **Datos de Foot-Traffic**:
    *   Esquema: `(timestamp, store_id, foot_traffic_count)`
    *   Fuente: Sensores en tienda o datos agregados.
*   **Eventos (Locales, Festivos)**:
    *   Esquema: `(event_date_start, event_date_end, event_name, event_type, scope)`
    *   Fuente: Calendarios públicos, entrada manual.
*   **Datos de Ingredientes (Existencias/Precios)**:
    *   Esquema: `(timestamp, ingredient_id, ingredient_name, supplier_id, price_per_unit, stock_level_central_kitchen)`
    *   Fuente: Sistema de compras o entrada manual. **Importante para la planificación de la producción.**

### 2.2. Estrategia de Feature Engineering

(Sin cambios significativos respecto a la versión anterior, pero las features ahora también informarán la creación de órdenes de fabricación sugeridas)

### 2.3. Política de Retención de Datos

(Sin cambios significativos, pero ahora incluye datos de órdenes de fabricación)
*   **Datos de Órdenes de Fabricación**: Mínimo 2 años para análisis de eficiencia de producción, etc.

### 2.4. Calidad de Datos Continua

(Sin cambios significativos, pero ahora se aplica también a los datos de órdenes de fabricación e inventario)

## 3. Modelo de Forecasting y Pipeline MLOps

(Sin cambios significativos en esta sección, el modelo de forecasting sigue siendo central, pero sus salidas pueden ser inputs para sugerir órdenes de fabricación)

## 4. Evaluación y Monitorización

(Sin cambios significativos, pero se podrían añadir métricas operacionales para las órdenes de fabricación, como tiempo promedio de completitud, tasa de cumplimiento, etc.)

## 5. Gestión de Órdenes de Fabricación (Nuevo Módulo)

### 5.1. Propósito

Permitir la creación, seguimiento y finalización de órdenes para la producción de artículos de panadería. Estas órdenes, al completarse, incrementarán el stock de productos terminados en la tienda de destino. Las órdenes de fabricación pueden ser creadas manualmente o sugeridas por el sistema basándose en las previsiones de ventas y los niveles de stock actuales.

### 5.2. Funcionalidades Clave

*   **Creación de Órdenes**:
    *   **Manual**: Por el Encargado de Producción. El usuario introduce todos los detalles de la orden.
    *   **Sugerida (Determinada por Previsión de Ventas)**:
        *   El sistema analiza las predicciones de ventas y los niveles de stock actuales para cada producto y tienda.
        *   Si se proyecta que el stock de un producto caerá por debajo de su punto de reorden (considerando la demanda pronosticada para D+1, D+7), el sistema generará una sugerencia de orden de fabricación.
        *   Estas sugerencias incluirán el producto, la cantidad estimada necesaria (ajustable), la tienda de destino y una fecha de finalización objetivo.
        *   El Encargado de Producción revisa estas sugerencias, puede modificar cualquier campo (cantidad, fechas) y luego confirmar la sugerencia para convertirla en una orden de fabricación activa.
    *   Campos para una orden (manual o confirmada desde sugerencia): `product_id`, `product_name` (autocompletado), `quantity_to_produce`, `store_id_destination`, `target_completion_date`.
*   **Listado y Filtro de Órdenes**:
    *   Ver todas las órdenes con filtros por estado, producto, tienda, fecha.
    *   Columnas: `order_id`, `product_name`, `quantity`, `store_id`, `status`, `creation_date`, `expected_completion_date`.
*   **Actualización de Estado**:
    *   Cambiar estado de "Pendiente" a "En Progreso".
    *   Cambiar estado de "En Progreso" a "Completada".
        *   **Al marcar como "Completada"**:
            *   El sistema debe registrar la `quantity_produced` (puede ser igual o diferente a la planeada).
            *   **Actualizar el `current_stock` del `product_id` en la `store_id_destination` especificada en la base de datos de inventario.** Esta es una operación crítica.
            *   Registrar `completion_date`.
    *   Opción de "Cancelar" orden (con motivo).
*   **Detalles de la Orden**: Vista detallada de una orden específica.

### 5.3. Integración con Inventario

*   **Incremento de Stock**: Al completar una orden de fabricación, el stock del producto fabricado para la tienda destino se incrementa.
*   **Consumo de Ingredientes (Opcional Avanzado)**: Si se gestiona el stock de ingredientes, iniciar una orden podría "reservar" o, al completarse, "consumir" los ingredientes necesarios según la receta del producto. Esto está fuera del alcance inicial pero es una extensión lógica.

### 5.4. Interfaz de Usuario

*   Una nueva página dedicada a "Órdenes de Fabricación".
*   Formulario para crear/editar órdenes (soporta entrada manual y podría pre-llenarse con sugerencias del sistema).
*   Tabla o lista de tarjetas para visualizar las órdenes.
*   Botones de acción para cambiar estados.
*   (Opcional futuro) Sección de "Órdenes Sugeridas" donde el Encargado de Producción puede revisar, ajustar y confirmar las propuestas del sistema.

## 6. Documentación Técnica y Roles

### 6.1. Diagrama de Arquitectura (Mermaid)
El diagrama de arquitectura lógica se proporcionó en la sección 1.1 (actualizado para incluir Gestión de Inventario y Órdenes de Fabricación).

### 6.2. Tabla de Responsabilidades (RACI)

| Actividad/Entregable                      | Data Engineers | ML Engineers / Data Scientists | DevOps/MLOps Engineers | Product Owner/Analista Neg. | Gerentes Panadería | **Enc. Producción** |
| :---------------------------------------- | :------------: | :----------------------------: | :--------------------: | :-------------------------: | :----------------: | :-------------------: |
| **Definición de Requisitos**              |       R/A      |              R/A               |           C            |              A              |         C          |          C            |
| **Diseño de Arquitectura de Datos**       |       A        |               C                |           R            |              C              |         I          |          C            |
| **Desarrollo de Pipelines de Ingesta/ETL**|       A        |               R                |           S            |              C              |         I          |          I            |
| **Diseño y Gestión del Feature Store**    |       A        |               R                |           S            |              C              |         I          |          I            |
| **Investigación y Desarrollo de Modelos** |       C        |              A                 |           R            |              C              |         I          |          I            |
| **Desarrollo Pipeline Entrenamiento ML**  |       R        |              A                 |           S            |              I              |         I          |          I            |
| **Desarrollo API Model Serving**          |       R        |              A                 |           S            |              I              |         I          |          I            |
| **Desarrollo Módulo Inventario/Órd.Fab.**|       S        |               C                |           R            |              A              |         C          |          R            |
| **Desarrollo Frontend**                   |       I        |               I                |           A            |              A              |         C          |          C            |
| **Configuración CI/CD**                   |       C        |               C                |           A            |              I              |         I          |          I            |
| **Monitorización (Sistema y Modelo)**     |       R        |              R                 |           A            |              C              |         C          |          C            |
| **Gestión de Seguridad**                  |       R        |               C                |           A            |              C              |         I          |          I            |
| **Documentación Técnica**                 |       A        |              A                 |           A            |              R              |         I          |          R            |
| **Validación de Datos (Carga Manual)**    |       C        |               C                |           I            |              A              |         R          |          I            |
| **Uso y Feedback del Frontend**           |       I        |               I                |           I            |              R              |         A          |          A            |
| **Gestión de Órdenes de Fabricación**     |       I        |               I                |           I            |              C              |         C          |          A            |

*Leyenda: R = Responsible (Responsable de Hacer), A = Accountable (Responsable Final), C = Consulted (Consultado), I = Informed (Informado), S = Support (Soporte)*

### 6.3. Requisitos de Documentación Adicional

(Sin cambios significativos, pero la documentación del módulo de Órdenes de Fabricación y su API (si la tuviera backend) sería necesaria)

## 7. Stack Tecnológico y Despliegue CI/CD

(Sección renombrada desde la anterior "6." para mantener la numeración consistente)

### 7.1. Stack Tecnológico Propuesto

(Sin cambios significativos, pero las bases de datos operacionales (Firestore/Cloud SQL) ganan más importancia para Inventario y Órdenes de Fabricación)

### 7.2. Plan de Despliegue CI/CD

(Sin cambios significativos)

### 7.3. Plan de Mantenimiento y Soporte

(Sin cambios significativos)

## 8. Seguridad, Cumplimiento y Escalabilidad

(Sección renombrada desde la anterior "7.")

(Sin cambios significativos, pero el control de acceso para el módulo de órdenes de fabricación debe ser considerado)

## 9. Módulo de Carga de Datos Históricos (Excel/CSV)

(Sección renombrada desde la anterior "8.")

### 9.1. Interfaz de Usuario (UI)

*   Componente Drag-and-Drop y selector de tienda.
*   Plantilla Descargable:
    *   Columnas: `transaction_id, timestamp, store_id, product_id, quantity_sold, price_unit, total_amount, promotion_applied_id`.
*   Indicaciones Claras.

### 9.2. Asistente de Mapeo de Columnas
(Sin cambios)

### 9.3. Validación Automática de Datos

*   Validación de Esquema (incluyendo `store_id`).
*   **Validación de `store_id`**: Asegurar que el `store_id` en cada fila del CSV coincide con la tienda seleccionada en el formulario de carga.
*   Detección de Duplicados.
*   Reporte de Errores Detallado.
*   Umbral de Errores.

### 9.4. Procesamiento y Almacenamiento

*   Conversión a Parquet.
*   Versionado en Data Lake.
*   Integración con ETL: La nueva carga debe ser incorporada. **Los datos de ventas cargados deben usarse para ajustar los niveles de inventario.**

### 9.5. Disparador de Reentrenamiento (Automático Opcional)
(Sin cambios)

### 9.6. Gestión de Borrado/Actualización Masiva
(Sin cambios)
---
Este diseño es un punto de partida. Cada sección podría expandirse en documentos más detallados.

