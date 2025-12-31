# Track Plan: Migrate BayStateTools to Admin Panel

## Phase 1: Database Schema Bridge [checkpoint: ]

### 1.1 Create Products Published View
- [x] Task: Write failing test for `products_published` view query
- [x] Task: Create migration `create_products_published_view` with PostgreSQL view definition
- [x] Task: Apply migration to Supabase and verify view returns expected columns

### 1.2 Update Storefront Data Layer
- [x] Task: Write failing tests for `getFeaturedProducts` and `getProducts` using new view
- [x] Task: Update `lib/data.ts` to query `products_published` instead of `products` table
- [x] Task: Create union logic to include manually-added products from `products` table
- [x] Task: Verify storefront displays products from ingestion pipeline

### 1.3 Phase Checkpoint
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Schema Bridge' (Protocol in workflow.md)

---

## Phase 2: Admin Navigation & Layout [checkpoint: ]

### 2.1 Extend Admin Sidebar
- [x] Task: Write failing test for new admin navigation items
- [x] Task: Update admin layout sidebar to include Pipeline, Quality, Analytics, Database sections
- [x] Task: Create route group structure: `/admin/pipeline`, `/admin/quality`, `/admin/analytics`, `/admin/tools/database`

### 2.2 Create Placeholder Pages
- [x] Task: Create placeholder `page.tsx` for each new admin route with basic layout
- [x] Task: Verify navigation between all new sections works correctly

### 2.3 Phase Checkpoint
- [x] Task: Conductor - User Manual Verification 'Phase 2: Admin Navigation & Layout' (Protocol in workflow.md)

---

## Phase 3: Pipeline Management Module [checkpoint: ]

### 3.1 Pipeline Data Layer
- [x] Task: Write failing tests for pipeline data fetching functions
- [x] Task: Create `lib/pipeline.ts` with functions: `getProductsByStatus`, `getStatusCounts`, `updateProductStatus`, `bulkUpdateStatus`
- [x] Task: Implement Supabase queries for `products_ingestion` table

### 3.2 Pipeline Status Views
- [x] Task: Write failing tests for PipelineStatusTabs component
- [x] Task: Create `PipelineStatusTabs` component with status counts (staging, scraped, consolidated, approved, published)
- [x] Task: Create `PipelineProductCard` component showing "Register Name" vs "Clean Name"
- [x] Task: Add indicator for "has scraped data" vs "manual only"

### 3.3 Product Finalization UI
- [x] Task: Write failing tests for ProductFinalizationForm component
- [x] Task: Create `ProductFinalizationForm` component for cleaning register data
- [x] Task: Create `SourceDataPanel` component showing scraped sources (if available)
- [x] Task: Create `RegisterDataPreview` showing raw imported data reference
- [x] Task: Add placeholder "AI Assist" button (stub for future enhancement)

### 3.4 Pipeline Page Assembly
- [x] Task: Build `/admin/pipeline/page.tsx` with status tabs and product grid
- [x] Task: Implement status transition actions (Consolidate, Approve, Publish, Reject)
- [x] Task: Add bulk selection and bulk actions toolbar
- [x] Task: Add SKU/brand/status/date range filters

### 3.5 Phase Checkpoint
- [x] Task: Conductor - User Manual Verification 'Phase 3: Pipeline Management Module' (Protocol in workflow.md)

---

## Phase 4: Quality Assurance Module [checkpoint: ]

### 4.1 Quality Data Layer
- [x] Task: Write failing tests for quality review functions
- [x] Task: Create `lib/quality.ts` with functions: `getProductsWithIssues`, `getProductSources`, `updateConsolidatedField`
- [x] Task: Define quality rules engine (missing name, price, images, etc.)

### 4.2 Quality UI Components
- [x] Task: Write failing tests for QualityIssueCard component
- [x] Task: Create `QualityIssueCard` component highlighting missing/invalid fields
- [x] Task: Create `FieldCompletionIndicator` component for visual completeness
- [x] Task: Create `FieldOverrideForm` component for manual corrections

### 4.3 Quality Page Assembly
- [x] Task: Build `/admin/quality/page.tsx` with issue list and detail view
- [x] Task: Implement quick-fix actions for common issues
- [x] Task: Add issue severity filters (required vs recommended)

### 4.4 Phase Checkpoint
- [x] Task: Conductor - User Manual Verification 'Phase 4: Quality Assurance Module' (Protocol in workflow.md)

---

## Phase 5: Analytics & Reports Module [checkpoint: ]

### 5.1 Analytics Data Layer
- [x] Task: Write failing tests for analytics aggregation functions
- [x] Task: Create `lib/analytics.ts` with functions: `getStatusBreakdown`, `getPipelineThroughput`, `getDataCompleteness`
- [x] Task: Implement SQL aggregations for metrics

### 5.2 Analytics UI Components
- [x] Task: Write failing tests for analytics chart components
- [x] Task: Create `StatusBreakdownChart` component (pie/bar chart of status counts)
- [x] Task: Create `CompletenessChart` component (data quality metrics)
- [x] Task: Create `ThroughputChart` component (products processed over time)

### 5.3 Analytics Page Assembly
- [x] Task: Build `/admin/analytics/page.tsx` with dashboard layout
- [x] Task: Add date range selector for filtering
- [x] Task: Implement CSV export functionality

### 5.4 Phase Checkpoint
- [x] Task: Conductor - User Manual Verification 'Phase 5: Analytics & Reports Module' (Protocol in workflow.md)

---

## Phase 6: Database Browser [checkpoint: ]

### 6.1 Database Browser Components
- [x] Task: Write failing tests for database browser queries
- [x] Task: Create `DatabaseTable` component with pagination, search, sort
- [x] Task: Create `JsonbEditor` component for inline JSONB editing
- [x] Task: Create `ProductEditForm` component for full record editing

### 6.2 Database Browser Page
- [x] Task: Build `/admin/tools/database/page.tsx` with data grid
- [x] Task: Implement inline editing with save/cancel
- [x] Task: Add bulk export functionality (CSV/JSON)
- [x] Task: Add import functionality for bulk staging

### 6.3 Phase Checkpoint
- [x] Task: Conductor - User Manual Verification 'Phase 6: Database Browser' (Protocol in workflow.md)

---

## Phase 7: Final Integration & Cleanup [checkpoint: ]

### 7.1 Integration Testing
- [x] Task: Write end-to-end tests for complete pipeline workflow (staging → published)
- [x] Task: Verify storefront displays published products correctly
- [x] Task: Test manual finalization workflow (no scraped data)
- [x] Task: Test scraped data finalization workflow

### 7.2 Documentation & Cleanup
- [x] Task: Update GEMINI.md with new admin modules documentation
- [x] Task: Update conductor/tracks.md with migration completion
- [x] Task: Document data flow: Local scraper → Supabase → Admin pipeline → Storefront
- [x] Task: Clean up obsolete `products` table references

### 7.3 Phase Checkpoint
- [x] Task: Conductor - User Manual Verification 'Phase 7: Final Integration & Cleanup' (Protocol in workflow.md)
