
# Diseño del Sistema: Predicción de Ventas de Panaderías

## Resumen Ejecutivo

Este documento describe la arquitectura y el diseño de una aplicación web end-to-end para predecir las ventas diarias (D+1, D+7, D+28) para una cadena de 6 panaderías. La solución está diseñada para ser escalable, segura, mantenible y operada bajo principios de MLOps. Se detallan los componentes clave, desde la ingesta de datos hasta la interfaz de usuario, cubriendo requisitos funcionales y no funcionales, estrategias de datos, modelado, monitorización y seguridad.

## 1. Arquitectura (Lógica y Física)

### 1.1. Arquitectura Lógica

La arquitectura lógica se compone de los siguientes módulos principales:

*   **Ingesta de Datos**: Responsable de recolectar datos de diversas fuentes.
*   **ETL (Extract, Transform, Load)**: Procesa y transforma los datos crudos en formatos listos para análisis y entrenamiento.
*   **Feature Store**: Almacena y gestiona características (features) de manera centralizada para entrenamiento y servido de modelos.
*   **Entrenamiento de Modelos (MLOps Pipeline)**: Orquesta el reentrenamiento, evaluación y versionado de modelos.
*   **Model Serving**: Expone los modelos entrenados a través de una API para predicciones.
*   **Frontend**: Interfaz de usuario web para visualización de predicciones, carga de datos y gestión.
*   **Monitorización y Alertas**: Observa la salud del sistema, la calidad de los datos y el rendimiento del modelo.

**Diagrama de Arquitectura Lógica (Mermaid):**
```mermaid
graph TD
    subgraph Fuentes de Datos
        FD1[Datos POS (Ventas Históricas)]
        FD2[Datos de Inventario]
        FD3[API de Clima]
        FD4[Datos de Foot-Traffic (Sensor/Externo)]
        FD5[Calendario de Eventos (Locales, Festivos)]
        FD6[Datos de Ingredientes (Existencias, Precios)]
        FD7[Carga Manual (Excel/CSV Históricos)]
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
    Ingestor --> BucketRaw
    BucketRaw --> ETLProcess
    ETLProcess --> BucketProcessed
    ETLProcess --> FeatureStore
    FeatureStore --> ModelTrainingPipeline
    BucketProcessed --> ModelTrainingPipeline
    ModelTrainingPipeline --> ModelRegistry
    ModelTrainingPipeline --> ExperimentTracking
    ModelRegistry --> ModelServingAPI
    ModelServingAPI --> PredictionCache
    PredictionCache -.-> WebApp  // Predicciones cacheadas
    ModelServingAPI --> WebApp   // Predicciones en tiempo real (si es necesario)
    WebApp --> UserAuth
    ModelServingAPI --> MonitoringSystem
    ETLProcess --> MonitoringSystem
    Ingestor --> MonitoringSystem
    FeatureStore --> MonitoringSystem
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
*   **Entrenamiento de Modelos**: Vertex AI Training con Vertex AI Pipelines para orquestación.
*   **Registro de Modelos**: Vertex AI Model Registry.
*   **Seguimiento de Experimentos**: Vertex AI Experiments.
*   **Model Serving**: Vertex AI Endpoints (para predicciones online) o Vertex AI Batch Predictions (para predicciones batch D+1, D+7, D+28).
*   **Frontend**: Next.js desplegado en Firebase Hosting o Cloud Run.
*   **Autenticación**: Firebase Authentication.
*   **Base de Datos Operacional (si es necesaria para el frontend)**: Firestore o Cloud SQL (PostgreSQL).
*   **Caché**: Memorystore for Redis.
*   **Monitorización, Logging, Alertas**: Cloud Monitoring, Cloud Logging, Pub/Sub para notificaciones.
*   **CI/CD**: Cloud Build, Artifact Registry.

### 1.3. Requisitos No Funcionales

*   **Rendimiento y Latencia**:
    *   **Predicciones Diarias (Batch D+1, D+7, D+28)**: Deben estar disponibles en el frontend y vía API antes de las 06:00 AM hora local de cada panadería.
    *   **Latencia Consulta Individual (Frontend)**: Para una predicción específica de un producto/tienda, la respuesta debe ser < 2 segundos (idealmente < 500ms si se usa caché).
    *   **Pipeline de ETL y Entrenamiento**: El pipeline completo de reentrenamiento (incluyendo ETL y feature engineering) no debe exceder las 4 horas para permitir actualizaciones diarias.
*   **Disponibilidad y Tolerancia a Fallos**:
    *   **SLA de Disponibilidad del Sistema**: 99.9% para el frontend y la API de predicciones.
    *   **Recuperación ante Desastres (DR)**:
        *   Infraestructura como Código (IaC) con Terraform o Cloud Deployment Manager para recrear el entorno en otra región.
        *   Backups regulares de bases de datos (Cloud SQL, Firestore) y snapshots del Data Lake (GCS).
        *   Modelos versionados y artefactos almacenados de forma redundante. RTO (Recovery Time Objective) < 8 horas, RPO (Recovery Point Objective) < 24 horas.
    *   **Continuidad del Negocio (BCP)**:
        *   Componentes críticos (API de serving, Frontend) desplegados en múltiples zonas de disponibilidad dentro de una región.
        *   Reintentos automáticos y colas de mensajes (Pub/Sub) para la ingesta de datos.
        *   Failover automático para bases de datos si es posible.

### 1.4. Usabilidad del Frontend

*   **Roles de Usuario**:
    1.  **Gerente de Panadería (Tienda)**: Acceso a su propia tienda o grupo de tiendas asignadas.
    2.  **Analista de Negocio / Planificador Central**: Acceso a todas las tiendas, métricas agregadas y configuración de modelos.
    3.  **Administrador del Sistema**: Gestión de usuarios, configuración global, monitorización del sistema.
*   **Funcionalidades por Rol**:
    *   **Gerente de Panadería**:
        *   Visualizar predicciones de ventas (D+1, D+7, D+28) para productos de su tienda.
        *   Ver tendencias históricas de ventas y comparación con predicciones pasadas.
        *   Input de eventos locales o promociones específicas de su tienda (que podrían influir en el modelo).
        *   Visualizar alertas de stock (si se integra esta funcionalidad).
    *   **Analista de Negocio / Planificador Central**:
        *   Todas las funcionalidades del Gerente, pero para todas las tiendas.
        *   Visualizar métricas de rendimiento del modelo (MAE, RMSE, MAPE) por tienda y globales.
        *   Comparar rendimiento de diferentes versiones de modelos (si aplica A/B testing).
        *   Acceder al módulo de carga de datos históricos.
        *   Ver análisis de explicabilidad del modelo (qué factores influyen en las predicciones).
        *   Potencialmente, ajustar umbrales o parámetros globales del sistema de predicción (con supervisión).
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
*   **Datos de Inventario**:
    *   Esquema: `(snapshot_timestamp, store_id, product_id, current_stock, stock_unit)`
    *   Fuente: Sistema de gestión de inventario (si existe) o reportes manuales.
*   **Datos de Clima**:
    *   Esquema: `(timestamp, location_coordinates/zip_code, temperature, precipitation, humidity, wind_speed, weather_condition_code)`
    *   Fuente: API meteorológica externa (e.g., OpenWeatherMap, AccuWeather).
*   **Datos de Foot-Traffic**:
    *   Esquema: `(timestamp, store_id, foot_traffic_count)`
    *   Fuente: Sensores en tienda (si existen) o datos agregados de proveedores externos.
*   **Eventos (Locales, Festivos)**:
    *   Esquema: `(event_date_start, event_date_end, event_name, event_type (festivo_nacional, local, deportivo), scope (nacional, store_id_specific))`
    *   Fuente: Calendarios públicos, entrada manual por analistas o gerentes.
*   **Datos de Ingredientes (Existencias/Precios)**:
    *   Esquema: `(timestamp, ingredient_id, ingredient_name, supplier_id, price_per_unit, stock_level_bakery_x)`
    *   Fuente: Sistema de compras o entrada manual. Puede ser más relevante para optimización de stock que para predicción de ventas directamente, pero puede influir en la disponibilidad de productos.

### 2.2. Estrategia de Feature Engineering

*   **Características de Tiempo**:
    *   Derivadas del `timestamp`: Hora del día, día de la semana, día del mes, día del año, semana del año, mes, trimestre, año.
    *   Indicadores de fin de semana, inicio/fin de mes.
*   **Características de Estacionalidad**:
    *   Componentes de Fourier para modelar ciclos anuales, semanales.
    *   Indicadores de temporada (verano, invierno, etc.).
*   **Lags (Valores Retrasados)**:
    *   Ventas pasadas (e.g., lag 1 día, 7 días, 28 días) para el mismo producto/tienda.
    *   Promedios móviles de ventas (e.g., promedio de 7 días, 28 días).
*   **Interacciones entre Fuentes**:
    *   `ventas_en_dia_lluvioso`, `ventas_durante_evento_local`.
    *   Impacto del precio de un ingrediente clave en las ventas de productos relacionados.
*   **Características Específicas del Producto/Tienda**:
    *   Categoría del producto.
    *   Antigüedad del producto.
    *   Ubicación de la tienda (urbana, rural, centro comercial).
    *   Promedio histórico de ventas del producto en esa tienda.
*   **Características de Eventos/Promociones**:
    *   Indicador booleano de si hay un evento/promoción.
    *   Días hasta/desde el próximo evento/promoción.
    *   Tipo de promoción.
*   **Gestión**: Las features se calcularán en el pipeline ETL y se almacenarán en el Feature Store. Se versionarán y se documentará su lógica de creación. Se buscará la reutilización entre modelos.

### 2.3. Política de Retención de Datos

*   **Data Lake (Raw y Processed)**:
    *   Datos crudos: Mínimo 5 años para análisis históricos y reentrenamientos completos. Considerar políticas de archivado a almacenamiento más frío después de 2 años.
    *   Datos procesados (listos para Feature Store/Entrenamiento): Mínimo 3 años.
*   **Feature Store**:
    *   Valores de features para entrenamiento: Mínimo 3 años (consistente con datos procesados).
    *   Valores de features para inferencia online: Depende de la ventana máxima de lags requerida por el modelo (e.g., últimos 60-90 días).
*   **Cumplimiento**: Asegurar que las políticas de retención cumplen con RGPD y otras regulaciones aplicables. Anonimizar o pseudonimizar datos personales si es posible en etapas tempranas.

### 2.4. Calidad de Datos Continua

*   **Monitorización en la Ingesta**:
    *   Validación de esquemas (tipos de datos, campos requeridos).
    *   Detección de anomalías (e.g., ventas negativas, precios fuera de rango).
    *   Chequeo de valores faltantes y estrategias de imputación (o alertas si el % es alto).
    *   Alertas por datos tardíos o faltantes de fuentes críticas.
*   **Validación en ETL/Feature Engineering**:
    *   Uso de librerías como `Great Expectations` o `Deequ` (para Spark) para definir expectativas sobre los datos y validar lotes.
    *   Chequeos de consistencia entre tablas/fuentes.
    *   Monitorización de la distribución de features clave para detectar drift.
*   **Reportes de Calidad**: Dashboards visualizando métricas de calidad de datos, número de errores, etc.
*   **Proceso de Remediación**: Definir quién es responsable de investigar y corregir problemas de calidad de datos.

## 3. Modelo de Forecasting y Pipeline MLOps

### 3.1. Modelo Propuesto

*   **Elección Principal: Temporal Fusion Transformer (TFT)**
    *   **Justificación**: TFT es un modelo basado en atención diseñado específicamente para forecasting de series temporales multivariadas y multi-horizonte. Es capaz de capturar relaciones complejas a corto y largo plazo, incorporar variables estáticas (covariates específicas de tienda/producto), variables dinámicas conocidas a futuro (eventos, promociones) y variables dinámicas observadas en el pasado. Su arquitectura permite interpretabilidad (ver pesos de atención). Para 6 panaderías, la granularidad es manejable.
*   **Alternativas a Considerar (si TFT es muy complejo o los datos son limitados inicialmente)**:
    *   **Prophet (Facebook)**: Bueno para series temporales con fuerte estacionalidad y efectos de festivos. Más simple de implementar.
    *   **DeepAR/N-BEATS/LSTMs**: Otros modelos de deep learning para series temporales. Pueden requerir más datos o tuning.
    *   **Modelos Estadísticos Clásicos (ARIMA, SARIMA, Exponential Smoothing)**: Como baseline o para productos con series muy cortas/ruidosas.
*   **Estrategia**: Comenzar con TFT si los datos y recursos lo permiten. Tener Prophet o un modelo más simple como baseline robusto.

### 3.2. Pipeline de Entrenamiento y Actualización

1.  **Disparador (Trigger)**: Programado (e.g., diariamente después de la ingesta y ETL) o por evento (e.g., carga de nuevos datos históricos significativos).
2.  **Extracción de Datos**: Obtener los últimos datos procesados del Data Lake y features del Feature Store.
3.  **Preprocesamiento y Feature Engineering Adicional**: Específico para el modelo (e.g., escalado, encoding).
4.  **División de Datos**: Train/Validation/Test, asegurando la separación temporal (e.g., validación con el último año, test con los últimos 3 meses).
5.  **Entrenamiento del Modelo**: Entrenar el modelo (o varios candidatos) usando los datos de entrenamiento.
6.  **Evaluación del Modelo**: Evaluar en el conjunto de validación usando las métricas definidas (MAE, RMSE, MAPE). Comparar con el modelo en producción.
7.  **Registro del Modelo**: Si el nuevo modelo supera al actual (o cumple criterios mínimos), versionarlo y registrarlo en el Model Registry con sus métricas, artefactos y linaje.
8.  **Despliegue (Opcional automático o manual)**: Desplegar el modelo a un entorno de staging o directamente a producción (si la confianza es alta y hay rollback).

### 3.3. Estrategia de Experimentación y A/B Testing

*   **Seguimiento de Experimentos**: Usar herramientas como MLflow Tracking o Vertex AI Experiments para registrar parámetros, código, datos y métricas de cada ejecución de entrenamiento.
*   **Gestión de Versiones de Modelos**: El Model Registry almacenará todas las versiones de modelos entrenados.
*   **Pruebas A/B (Shadow Mode o Canary Release)**:
    *   **Shadow Mode**: Desplegar el nuevo modelo junto al modelo en producción. El nuevo modelo recibe tráfico real pero sus predicciones no se usan para decisiones, solo se registran y comparan con las del modelo actual y los valores reales.
    *   **Canary Release**: Desviar un pequeño porcentaje del tráfico de predicciones (e.g., 5-10%, o para una tienda específica) al nuevo modelo. Monitorizar su rendimiento de cerca. Si es satisfactorio, aumentar gradualmente el tráfico.
*   **Criterios de Promoción**: Definir umbrales de mejora en métricas clave y estabilidad para promover un modelo de staging a producción.

### 3.4. Explicabilidad del Modelo (XAI)

*   **Necesidad**: Sí, es importante para que los Gerentes de Panadería y Analistas entiendan qué factores impulsan las predicciones (e.g., ¿la promoción X aumentó las ventas? ¿El mal clima las disminuyó?). Ayuda a generar confianza y a identificar posibles problemas en el modelo o los datos.
*   **Herramientas/Técnicas**:
    *   Para TFT: Se pueden analizar los pesos de atención de las variables y los lags temporales.
    *   Modelos agnósticos: SHAP (SHapley Additive exPlanations) o LIME (Local Interpretable Model-agnostic Explanations) pueden aplicarse si se usan otros tipos de modelos.
    *   Visualizaciones de la importancia de las features.
*   **Implementación**: Integrar visualizaciones de XAI en el frontend para predicciones específicas.

### 3.5. Model Versioning y Lineage

*   **Model Versioning**: Cada modelo entrenado y registrado debe tener un número de versión único. El Model Registry (e.g., MLflow, Vertex AI) se encargará de esto.
*   **Lineage Tracking**:
    *   **Datos**: Registrar qué versiones de datasets (del Data Lake/Feature Store) se usaron para entrenar cada modelo.
    *   **Código**: Versionar el código de entrenamiento (repositorio Git, commit hash).
    *   **Parámetros**: Registrar los hiperparámetros usados.
    *   **Métricas**: Asociar las métricas de evaluación a la versión del modelo.
    *   Herramientas como MLflow o las capacidades integradas de Vertex AI Pipelines pueden ayudar a capturar este linaje.

### 3.6. Estrategia de Rollback

*   **Mecanismo**: El Model Serving API debe poder cambiar rápidamente a una versión anterior estable del modelo registrada en el Model Registry.
*   **Triggers para Rollback**:
    *   Degradación significativa de las métricas del modelo en producción.
    *   Aumento de errores en la API de serving.
    *   Comportamiento anómalo o inesperado detectado por los usuarios.
    *   Alta tasa de fallos en el pipeline de predicción.
*   **Proceso**:
    1.  Alerta generada por el sistema de monitorización o reporte manual.
    2.  Investigación rápida para confirmar el problema.
    3.  Decisión de rollback (puede ser automatizada para ciertos fallos críticos).
    4.  Actualización de la configuración del endpoint de Model Serving para apuntar a la versión anterior estable.
    5.  Monitorizar para confirmar la estabilización.
    6.  Análisis post-mortem del modelo fallido.

## 4. Evaluación y Monitorización

### 4.1. Métricas de Evaluación del Modelo

*   **MAE (Mean Absolute Error)**: `(1/n) * Σ|actual - predicted|`. Intuitivo, en las mismas unidades que las ventas.
*   **RMSE (Root Mean Squared Error)**: `sqrt((1/n) * Σ(actual - predicted)^2)`. Penaliza más los errores grandes.
*   **MAPE (Mean Absolute Percentage Error)**: `(1/n) * Σ|(actual - predicted) / actual| * 100`. Útil para comparar errores entre productos/tiendas con diferentes volúmenes de ventas. Cuidado con valores actuales cercanos a cero.
*   **wMAPE (weighted MAPE)**: Ponderado por el volumen de ventas para dar más importancia a productos/tiendas clave.
*   **Métricas de Sesgo (Bias)**: `(1/n) * Σ(actual - predicted)`. Para ver si el modelo tiende a sobreestimar o subestimar.
*   **Evaluación por horizonte**: Calcular métricas separadas para D+1, D+7, D+28.

### 4.2. Monitorización de Deriva del Modelo

*   **Data Drift (Deriva de Datos)**:
    *   Monitorizar la distribución estadística de las features de entrada al modelo y compararla con la distribución de los datos de entrenamiento.
    *   Métricas como Population Stability Index (PSI), Kolmogorov-Smirnov test.
    *   Alertar si la deriva supera umbrales predefinidos.
*   **Concept Drift (Deriva del Concepto / Model Drift)**:
    *   Monitorizar el rendimiento del modelo (MAE, RMSE, etc.) en datos recientes (ground truth).
    *   Si las métricas de rendimiento se degradan consistentemente con el tiempo, puede indicar que las relaciones subyacentes que el modelo aprendió han cambiado.
    *   Esto es una señal para reentrenar el modelo, posiblemente con una nueva arquitectura o features.
*   **Herramientas**: Vertex AI Model Monitoring, MLflow con plugins, librerías Python como `evidently.ai` o `Alibi Detect`.

### 4.3. Métricas Operacionales

*   **API de Model Serving**:
    *   Latencia de inferencia (promedio, percentiles p95, p99).
    *   Tasa de errores (HTTP 5xx, 4xx).
    *   RPS (Requests Per Second) / Throughput.
*   **Recursos de Cómputo**:
    *   Uso de CPU, memoria, GPU (si aplica) para los servicios de ingesta, ETL, entrenamiento y serving.
    *   Uso de disco.
*   **Pipelines de MLOps**:
    *   Tasa de éxito/fallo de los pipelines de ETL y entrenamiento.
    *   Duración de los pipelines.
    *   Uso de recursos por ejecución del pipeline.
*   **Salud de Microservicios**: Uptime, estado de los pods/contenedores.
*   **Saturación del Sistema**: Longitud de colas de mensajes, conexiones a base de datos.

### 4.4. Sistema de Alertas

*   **Canales de Notificación**: Email, Slack, PagerDuty (para alertas críticas).
*   **Niveles de Severidad**:
    *   **CRITICAL**: Requiere atención inmediata (e.g., API de serving caída, fallo completo del pipeline de entrenamiento diario).
    *   **WARNING**: Requiere atención, pero no inmediata (e.g., degradación leve del modelo, aumento de latencia, data drift detectado).
    *   **INFO**: Notificaciones informativas (e.g., pipeline de entrenamiento completado con éxito).
*   **Responsables**:
    *   **Equipo MLOps/DevOps**: Alertas CRITICAL y WARNING relacionadas con infraestructura, pipelines, API de serving.
    *   **Científicos de Datos/Analistas**: Alertas WARNING relacionadas con rendimiento del modelo, data drift, calidad de datos.
    *   **Gerentes/Usuarios de Negocio**: Informes resumidos, no alertas técnicas directas (a menos que sea una funcionalidad específica del frontend).
*   **Configuración**: Alertas basadas en umbrales para métricas clave. Incluir contexto en la alerta (qué falló, cuándo, enlace a dashboards).

## 5. Documentación Técnica y Roles

### 5.1. Diagrama de Arquitectura (Mermaid)
El diagrama de arquitectura lógica se proporcionó en la sección 1.1.

### 5.2. Tabla de Responsabilidades (RACI)

| Actividad/Entregable                      | Data Engineers | ML Engineers / Data Scientists | DevOps/MLOps Engineers | Product Owner/Analista Neg. | Gerentes Panadería |
| :---------------------------------------- | :------------: | :----------------------------: | :--------------------: | :-------------------------: | :----------------: |
| **Definición de Requisitos**              |       R/A      |              R/A               |           C            |              A              |         C          |
| **Diseño de Arquitectura de Datos**       |       A        |               C                |           R            |              C              |         I          |
| **Desarrollo de Pipelines de Ingesta/ETL**|       A        |               R                |           S            |              C              |         I          |
| **Diseño y Gestión del Feature Store**    |       A        |               R                |           S            |              C              |         I          |
| **Investigación y Desarrollo de Modelos** |       C        |              A                 |           R            |              C              |         I          |
| **Desarrollo Pipeline Entrenamiento ML**  |       R        |              A                 |           S            |              I              |         I          |
| **Desarrollo API Model Serving**          |       R        |              A                 |           S            |              I              |         I          |
| **Desarrollo Frontend**                   |       I        |               I                |           R            |              A              |         C          |
| **Configuración CI/CD**                   |       C        |               C                |           A            |              I              |         I          |
| **Monitorización (Sistema y Modelo)**     |       R        |              R                 |           A            |              C              |         C          |
| **Gestión de Seguridad**                  |       R        |               C                |           A            |              C              |         I          |
| **Documentación Técnica**                 |       A        |              A                 |           A            |              R              |         I          |
| **Validación de Datos (Carga Manual)**    |       C        |               C                |           I            |              A              |         R          |
| **Uso y Feedback del Frontend**           |       I        |               I                |           I            |              R              |         A          |

*Leyenda: R = Responsible (Responsable de Hacer), A = Accountable (Responsable Final), C = Consulted (Consultado), I = Informed (Informado), S = Support (Soporte)*

### 5.3. Requisitos de Documentación Adicional

*   **Diagramas de Bajo Nivel**: Diagramas de secuencia para flujos críticos (e.g., flujo de predicción, flujo de reentrenamiento). Diagramas de componentes para microservicios.
*   **READMEs Detallados para el Código**: Para cada repositorio/módulo, explicando su propósito, configuración, cómo ejecutarlo localmente, dependencias, y scripts clave.
*   **Guías de Operación y Soporte (Runbooks)**:
    *   Procedimientos para tareas comunes de mantenimiento.
    *   Guías de troubleshooting para problemas conocidos.
    *   Procedimientos de escalado.
    *   Procedimientos de DR y rollback.
*   **Manuales de Usuario para el Frontend**:
    *   Guías específicas por rol de usuario, explicando cómo usar cada funcionalidad.
    *   FAQ y glosario de términos.
*   **Documentación de APIs**: Especificaciones OpenAPI/Swagger para todas las APIs expuestas.
*   **Diccionario de Datos y Features**: Descripción de cada campo en el Data Lake y cada feature en el Feature Store (origen, tipo, descripción, lógica de cálculo).

## 6. Stack Tecnológico y Despliegue CI/CD

### 6.1. Stack Tecnológico Propuesto

*   **Lenguajes de Programación**:
    *   **Python**: Para Ingesta, ETL, Feature Engineering, Entrenamiento de Modelos, API de Serving (con FastAPI/Flask).
    *   **JavaScript/TypeScript**: Para el Frontend (Next.js, React).
    *   **SQL**: Para consultas y transformaciones en DWH/Data Lake.
*   **Librerías Clave (Python)**:
    *   Pandas, NumPy, Scikit-learn (preprocesamiento, modelos baseline).
    *   PyTorch o TensorFlow (para TFT y otros modelos de Deep Learning).
    *   Pytorch Forecasting (si se usa TFT).
    *   MLflow (tracking, registry, projects).
    *   FastAPI/Flask (para API de serving).
    *   Apache Spark (PySpark) o Apache Beam (para ETL a gran escala).
    *   Great Expectations (calidad de datos).
*   **Servicios Cloud (Ejemplo GCP, análogos en AWS/Azure)**:
    *   **Computación**: Cloud Run, Cloud Functions, Kubernetes Engine (GKE), Vertex AI Custom Training.
    *   **Almacenamiento**: Google Cloud Storage (Data Lake), Filestore (para artefactos compartidos).
    *   **Bases de Datos**: Cloud SQL (PostgreSQL/MySQL), Firestore, BigQuery (Data Warehouse y motor de consulta).
    *   **MLOps**: Vertex AI (Pipelines, Training, Prediction, Feature Store, Model Registry, Experiments, Model Monitoring).
    *   **Mensajería**: Pub/Sub.
    *   **Orquestación**: Cloud Composer (Airflow).
    *   **Redes**: VPC, Load Balancing.
    *   **Seguridad**: IAM, Secret Manager, Security Command Center.
*   **Frontend**: Next.js, React, ShadCN UI (o similar), Tailwind CSS, Recharts/Nivo (para visualizaciones).
*   **Contenedorización**: Docker.
*   **Infraestructura como Código (IaC)**: Terraform.

### 6.2. Plan de Despliegue CI/CD

*   **Repositorios de Código**: Git (e.g., GitHub, GitLab, Cloud Source Repositories).
*   **Herramientas CI/CD**: Cloud Build (GCP), Jenkins, GitLab CI, GitHub Actions.
*   **Fases del Pipeline CI (Integración Continua)**:
    1.  **Commit de Código**: Desarrollador hace push a una rama de feature.
    2.  **Build**: Se compila el código, se construyen artefactos/contenedores Docker.
    3.  **Test**: Pruebas unitarias, pruebas de integración, linting, análisis estático de código.
    4.  **Merge**: Si las pruebas pasan, se hace merge a la rama principal (develop/main).
*   **Fases del Pipeline CD (Despliegue Continuo/Entrega Continua)**:
    1.  **Despliegue a Staging/QA**: Se despliega la nueva versión a un entorno de pruebas.
    2.  **Pruebas en Staging**: Pruebas E2E, pruebas de aceptación de usuario (UAT). Pruebas de rendimiento del modelo (shadow/canary).
    3.  **Aprobación (Manual/Automática)**: Para el despliegue a producción.
    4.  **Despliegue a Producción**: Usando estrategias como Blue/Green, Canary.
    5.  **Monitorización Post-Despliegue**: Vigilar métricas para detectar problemas tempranos.
    6.  **Rollback (si es necesario)**: Plan para revertir a la versión anterior.
*   **Pipelines Específicos**:
    *   CI/CD para la aplicación Frontend.
    *   CI/CD para los microservicios de backend (Ingesta, API Serving).
    *   CD para los pipelines de ML (Vertex AI Pipelines / Kubeflow Pipelines): versionado de definiciones de pipeline, ejecución automática en cambios.

### 6.3. Plan de Mantenimiento y Soporte

*   **Actualizaciones de Librerías y Dependencias**: Programar revisiones periódicas (e.g., trimestrales) para actualizar dependencias (Python, JS, OS de contenedores) y aplicar parches de seguridad.
*   **Parches de Seguridad**: Monitorizar vulnerabilidades (e.g., CVEs) y aplicar parches críticos de forma prioritaria.
*   **Soporte para Resolución de Bugs**:
    *   Sistema de ticketing (e.g., Jira, Trello) para reportar y rastrear bugs.
    *   Definir SLAs para la resolución de bugs según severidad.
    *   Equipo de soporte N1/N2 o rotación on-call para problemas en producción.
*   **Refactorización y Deuda Técnica**: Asignar tiempo en sprints para refactorizar código y abordar deuda técnica.
*   **Monitorización de Costos Cloud**: Revisiones periódicas para optimizar el uso de recursos y costos.
*   **Actualización de Modelos**: Reentrenamiento regular según lo definido por la estrategia de MLOps. Evaluación de la necesidad de rediseñar el modelo si el rendimiento se degrada persistentemente.

## 7. Seguridad, Cumplimiento y Escalabilidad

### 7.1. Seguridad

*   **Controles de Acceso (RBAC - Role-Based Access Control)**:
    *   Implementar autenticación robusta para todas las interfaces (Frontend, APIs). (e.g., Firebase Auth, OAuth2/OIDC).
    *   Autorización basada en roles para limitar el acceso a funcionalidades y datos según el rol del usuario (Gerente, Analista, Admin).
    *   Principio de mínimo privilegio para cuentas de servicio y usuarios.
*   **Cifrado**:
    *   **En Tránsito**: HTTPS/TLS para todas las comunicaciones (Frontend a Backend, entre microservicios, a APIs externas).
    *   **En Reposo**: Cifrado a nivel de almacenamiento para Data Lake (GCS/S3), bases de datos (Cloud SQL, Firestore), Feature Store, y artefactos de modelos. Usar claves gestionadas por el cliente (CMEK) si es necesario.
*   **Gestión de Secretos**:
    *   Almacenar credenciales, claves API, y contraseñas de bases de datos en un servicio de gestión de secretos (e.g., Google Secret Manager, HashiCorp Vault, AWS Secrets Manager).
    *   No hardcodear secretos en el código o archivos de configuración.
    *   Rotación regular de secretos.
*   **Auditoría y Logging de Seguridad**:
    *   Registrar eventos de autenticación (logins exitosos/fallidos), cambios de autorización, accesos a datos sensibles, y acciones administrativas.
    *   Centralizar logs de seguridad para monitorización y análisis.
    *   Alertas por actividades sospechosas.
*   **Seguridad de Red**:
    *   Uso de VPCs, firewalls, subredes privadas para aislar componentes.
    *   Limitar la exposición pública de servicios solo a lo necesario (e.g., Frontend, API Gateway).
*   **Seguridad de Contenedores**:
    *   Escaneo de vulnerabilidades en imágenes Docker.
    *   Uso de imágenes base seguras y actualizadas.
    *   Configuraciones de seguridad para Kubernetes (si se usa).

### 7.2. Cumplimiento (RGPD - Reglamento General de Protección de Datos)

*   **Inventario de Datos Personales**: Identificar qué datos procesados son personales (e.g., si los datos de POS contienen información del cliente, IPs de usuarios del frontend). Las ventas agregadas y datos de producto no suelen serlo.
*   **Base Legal para el Procesamiento**: Asegurar que existe una base legal para procesar cualquier dato personal.
*   **Minimización de Datos**: Recolectar y procesar solo los datos personales estrictamente necesarios.
*   **Anonimización/Pseudonimización**: Aplicar estas técnicas donde sea posible para reducir riesgos (e.g., pseudonimizar IDs de clientes si se usan).
*   **Derechos de los Sujetos de Datos**:
    *   **Derecho al Olvido**: Si se almacenan datos personales de clientes, tener un proceso para eliminarlos bajo solicitud. Esto puede ser complejo si afecta a datos históricos de entrenamiento. Se debe evaluar el impacto.
    *   **Portabilidad de Datos**: Capacidad de exportar datos personales de un usuario si se solicita.
*   **Transferencias Internacionales de Datos**: Asegurar cumplimiento si los datos se almacenan o procesan fuera de la UE.
*   **Evaluación de Impacto de Protección de Datos (DPIA)**: Realizar una DPIA si el procesamiento implica alto riesgo para los derechos y libertades.
*   **Documentación**: Mantener registros de las actividades de procesamiento.
*   **Seguridad por Diseño y por Defecto**: Integrar la protección de datos en todas las fases del diseño y desarrollo.

### 7.3. Escalabilidad

*   **Horizontal Scaling**:
    *   **Frontend y API de Serving**: Usar servicios gestionados que auto-escalen (Cloud Run, GKE con HPA, Vertex AI Endpoints con autoescalado).
    *   **ETL y Entrenamiento**: Motores como Spark o Dataflow están diseñados para escalar horizontalmente. Vertex AI Training permite configurar el tipo y número de máquinas.
*   **Bases de Datos**: Elegir soluciones que ofrezcan réplicas de lectura, sharding o sean inherentemente escalables (e.g., Firestore, BigQuery).
*   **Data Lake**: GCS/S3 son altamente escalables.
*   **Feature Store**: Soluciones como Vertex AI Feature Store están diseñadas para escalar.
*   **Arquitectura Asíncrona**: Usar colas de mensajes (Pub/Sub) para desacoplar servicios y manejar picos de carga en la ingesta.
*   **Caching**: Implementar caché para predicciones frecuentes y datos del frontend para reducir la carga en los sistemas backend.
*   **Monitorización del Rendimiento**: Identificar cuellos de botella y planificar la capacidad.

## 8. Módulo de Carga de Datos Históricos (Excel/CSV)

### 8.1. Interfaz de Usuario (UI)

*   **Componente Drag-and-Drop**: Permitir al usuario (Analista de Negocio) arrastrar y soltar archivos Excel (.xlsx) o CSV.
*   **Plantilla Descargable**:
    *   Proporcionar un botón para descargar una plantilla (Excel/CSV) con las columnas esperadas y ejemplos de formato.
    *   La plantilla debe especificar claramente los tipos de datos esperados (fecha, número, texto) y el formato (e.g., AAAA-MM-DD para fechas).
*   **Indicaciones Claras**: Instrucciones sobre el tamaño máximo del archivo, formatos aceptados, y cómo preparar los datos.

### 8.2. Asistente de Mapeo de Columnas

*   **Flexibilidad**: Si el archivo cargado no sigue exactamente la plantilla, el asistente permitirá al usuario mapear las columnas de su archivo a las columnas requeridas por el sistema.
    *   El sistema intentará un automapeo basado en los nombres de las columnas.
    *   El usuario podrá corregir o completar el mapeo.
    *   Opción para ignorar columnas extra en el archivo del usuario.
*   **Previsualización**: Mostrar una pequeña muestra de los datos cargados con el mapeo aplicado antes de la validación completa.

### 8.3. Validación Automática de Datos

*   **Validación de Esquema**:
    *   Comprobar que todas las columnas requeridas están presentes (o mapeadas).
    *   Validar tipos de datos (e.g., que una columna de fecha contenga fechas válidas, que una columna de cantidad sea numérica).
    *   Chequear rangos válidos (e.g., ventas no negativas, fechas no futuras para datos históricos).
*   **Detección de Duplicados**: Verificar si los datos cargados (e.g., por `store_id`, `product_id`, `timestamp`) ya existen en el sistema para evitar duplicación. Permitir al usuario decidir cómo manejar duplicados (ignorar, sobrescribir - con precaución).
*   **Reporte de Errores Detallado**:
    *   Si la validación falla, mostrar un informe claro al usuario:
        *   Número total de filas procesadas y filas con errores.
        *   Listado de errores específicos, indicando la fila, columna y el tipo de error (e.g., "Fila 50, Columna 'FechaVenta': Formato de fecha inválido, se esperaba AAAA-MM-DD").
        *   Permitir descargar un archivo con solo las filas erróneas y una columna adicional explicando el error, para facilitar la corrección.
*   **Umbral de Errores**: Posibilidad de configurar un umbral de errores aceptable (e.g., si <1% de las filas tienen errores menores, permitir la carga parcial o marcarlos para revisión).

### 8.4. Procesamiento y Almacenamiento

*   **Conversión a Parquet**: Una vez validados los datos, se convierten a formato Parquet (columnar, eficiente para análisis).
*   **Versionado en Data Lake**: Los archivos Parquet se almacenan en una ubicación específica del Data Lake (e.g., `gs://bucket/processed_data/manual_uploads/YYYY/MM/DD/file_v1.parquet`).
    *   Cada carga genera una nueva versión o un nuevo conjunto de archivos.
    *   Metadatos de la carga (quién cargó, cuándo, nombre original del archivo, resultado de validación) se almacenan también.
*   **Integración con ETL**: La nueva carga debe ser incorporada por el siguiente ciclo ETL para actualizar el Feature Store. **Es crucial que, en un sistema de producción, los datos de ventas cargados (especialmente si representan ventas recientes) también se utilicen para ajustar los niveles de inventario correspondientes a los productos vendidos en cada tienda.**

### 8.5. Disparador de Reentrenamiento (Automático Opcional)

*   **Opción de Aprobación**: Después de una carga exitosa, el sistema podría preguntar al Analista si desea disparar un reentrenamiento del modelo con los nuevos datos.
*   **Gatillo Automático (Condicional)**:
    *   Si la cantidad de nuevos datos históricos es significativa (e.g., >10% de los datos existentes o un periodo largo).
    *   El sistema puede estar configurado para un reentrenamiento automático o para marcar el modelo como "necesita reentrenamiento" para el próximo ciclo programado.
*   **Consideración**: El reentrenamiento completo puede ser costoso. Se debe evaluar la frecuencia y el impacto de los nuevos datos.

### 8.6. Gestión de Borrado/Actualización Masiva

*   **Necesidad**: Considerar si los usuarios necesitarán eliminar o actualizar lotes de datos históricos cargados previamente (e.g., si se cargó un archivo incorrecto).
*   **Impacto**:
    *   La eliminación/actualización de datos históricos requerirá que el modelo sea reentrenado, ya que su base de conocimiento ha cambiado.
    *   Puede ser complejo asegurar la consistencia si los datos ya se usaron en features o modelos.
*   **Implementación (Cautelosa)**:
    *   **Soft Delete**: Marcar los datos como "borrados" en lugar de eliminarlos físicamente, para permitir auditoría y reversión.
    *   **Versionado**: Las cargas de datos son inmutables. Una "actualización" es una nueva carga que reemplaza o anula una anterior.
    *   **Interfaz Segura**: Estas operaciones deben ser restringidas a roles con privilegios (Analista Senior, Admin) y requerir confirmación.
    *   **Reentrenamiento Obligatorio**: Después de un borrado/actualización masiva, el sistema debe forzar o recomendar fuertemente un reentrenamiento del modelo.
    *   **Auditoría**: Todas estas operaciones deben ser auditadas.
---
Este diseño es un punto de partida. Cada sección podría expandirse en documentos más detallados.
