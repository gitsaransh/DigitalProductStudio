# Technical Design Document (TDD) - Phase 2 Enterprise Architecture

## 1. Enterprise System Architecture & Data Source Layer

```mermaid
graph TD
    UI[Dashboard UI - React + Vite] -->|Fetch Provenanced Metrics| MS[Metrics Service - src/services/metrics_service.py]
    MS -->|Query Metric Key| DSL[Data Source Layer Abstraction - src/datasources/]
    DSL -->|Live API Provider| LAP[Live APIs - Etsy, Gumroad, Lemon, Shopify]
    DSL -->|Database Provider| DBP[Internal DB - SQLite WAL + FTS5]
    DSL -->|AI Model Provider| AMP[AI Models - Agent Swarm & Scoring]
    DSL -->|Manual Input Provider| MIP[Manual Input - Brand Config & Targets]
    DSL -->|Demo Sandbox Provider| DSP[Demo Provider - Isolated Sandbox]
```

## 2. Decoupled Metrics Pipeline & Provenance Attribution

Every metric returned by `MetricsService` incorporates a mandatory `data_source` tag and provenance structure:
- **`LIVE_API`**: Real-time connected platform metrics (Etsy API v3, Gumroad API v2).
- **`INTERNAL_DB`**: Metrics computed directly from local SQLite WAL catalog records.
- **`AI_MODEL` / `ESTIMATED`**: Scores generated algorithmically by the AI Agent Swarm.
- **`MANUAL_INPUT`**: Values defined directly by user configuration.
- **`NOT_CONNECTED`**: Clean real-world state when an external API or sales channel is unlinked.

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    PRODUCTS {
        string id PK
        string sku UK
        string title
        string lifecycle_state
        string file_hash
        float base_price
        string created_at
    }
    INTELLIGENCE_SCORES {
        string product_id FK
        int quality_score
        int seo_score
        int profit_score
        int confidence_score
    }
    MARKETPLACE_LISTINGS {
        string product_id FK
        string marketplace PK
        string external_id
        string status
        string listing_url
    }
    LIFECYCLE_HISTORY {
        string product_id FK
        string from_state
        string to_state
        string timestamp
        string actor
    }
    PRODUCTS ||--|| INTELLIGENCE_SCORES : has
    PRODUCTS ||--o{ MARKETPLACE_LISTINGS : publishes
    PRODUCTS ||--o{ LIFECYCLE_HISTORY : tracks
```
