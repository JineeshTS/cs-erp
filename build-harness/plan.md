# Codilla.ai — Fully Atomized Production Roadmap

## PART 1: Production Recovery — DONE
- S134 committed (`60426d9`) and pushed to `origin/main`
- 16/16 services healthy, https://codilla.ai returning 200

---

## PART 2: ATOMIZED ROADMAP — 5 Tracks, ~85 Atomic Tasks

Each task below is the **smallest possible unit of work** — one file, one migration, one component, one function, one test. Tasks within a session are sequential (each depends on the prior). Sessions can be interleaved across tracks where dependencies allow.

---

## TRACK A: Multi-Provider AI Gateway (D-063)

### A1: Decision Node + DB Schema (2 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A1.1 | Create D-063 KG decision node | `knowledge-graph/decisions/D-063.json`, `_index.json` | Decision node with all 7 providers, 3 API families, routing logic spec |
| A1.2 | Migration 0028: `user_api_keys` table | New migration SQL + Drizzle schema in `ai-providers.ts` | Table: `id`, `user_id` (FK), `provider_id` (FK), `label`, `encrypted_key`, `key_prefix`, `is_active`, `is_default`, `last_used_at`, `expires_at`, `created_at`. Index on `(user_id, provider_id)`. Separate from platform `ai_provider_keys` |

### A2: User API Key CRUD Backend (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A2.1 | KG feature node F-273 | `knowledge-graph/features/F-273.json`, `_index.json` | Acceptance criteria for user key management |
| A2.2 | POST `/api/v1/user/api-keys` — add key | New route file | Accepts `{providerId, label, apiKey}`, encrypts with AES-256-GCM (reuse `crypto.ts`), inserts into `user_api_keys`, returns `{id, label, keyPrefix, provider}` |
| A2.3 | GET `/api/v1/user/api-keys` — list keys | Same route file | Returns all user's keys (decrypted=false, just metadata + prefix). Joined with `ai_providers` for display name |
| A2.4 | DELETE `/api/v1/user/api-keys/[keyId]` — remove key | New `[keyId]/route.ts` | Soft-delete or hard-delete. Verify ownership (`user_id` matches session) |
| A2.5 | POST `/api/v1/user/api-keys/[keyId]/test` — test connection | Same `[keyId]/route.ts` | Decrypt key, call `adapter.testConnection()`, return `{healthy, error, latencyMs}` |

### A3: User API Key Management UI (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A3.1 | `ApiKeyManager` component — list view | New component in `components/settings/` | Table of user's keys: provider icon, label, key prefix, status, last used. "Add Key" button |
| A3.2 | `AddKeyDialog` component — add form | Same or adjacent component | Modal: select provider (dropdown of 7), enter label, paste API key, "Test & Save" button |
| A3.3 | `TestKeyButton` component — connection test | Inline in `ApiKeyManager` | Calls `/api-keys/[id]/test`, shows green check / red X with latency |
| A3.4 | Wire into Settings page | `components/settings/` or existing settings route | Add "API Keys" tab/section to existing Settings page. Default provider selector |

### A4: Missing Provider Adapters (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A4.1 | KG feature node F-274 | `knowledge-graph/features/F-274.json` | Spec for Qwen + Grok adapters |
| A4.2 | `QwenAdapter` class | New `providers/qwen.ts` | OpenAI-compatible format (`/chat/completions`), `baseUrl: https://dashscope.aliyuncs.com/compatible-mode/v1`, slug: `qwen` |
| A4.3 | `GrokAdapter` class | New `providers/grok.ts` | OpenAI-compatible format, `baseUrl: https://api.x.ai/v1`, slug: `grok` |
| A4.4 | Register adapters in `registry.ts` | `lib/ai/registry.ts` | Add `qwen` and `grok` to adapter map. Seed `ai_providers` + `ai_models` rows for both |

### A5: Per-User callAI() Routing (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A5.1 | KG feature node F-275 | `knowledge-graph/features/F-275.json` | Routing logic spec: user key → platform key → credits |
| A5.2 | `getUserPreferredProvider()` helper | New in `lib/ai/registry.ts` or `lib/ai/user-provider.ts` | Query `user_api_keys` for user's default active key. Return `{providerSlug, modelId, encryptedKey}` or null |
| A5.3 | `resolveUserApiKey()` helper | Same file | Decrypt user's key, validate it exists and is active, return plain key. Fallback chain: user key → platform key |
| A5.4 | Extend `callAI()` options with `userId` routing | `lib/ai/client.ts` | New logic: if `userId` provided → try `getUserPreferredProvider()` → if found, use user's adapter+key → else use platform model+key and charge credits |
| A5.5 | Update `deductTokens()` for credit-mode billing | `lib/ai/client.ts` | Only deduct from `token_balances` when using platform keys (credits mode). Skip deduction when user provides own key. Log usage either way |

### A6: Credit Purchase Flow (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A6.1 | KG feature node F-276 | `knowledge-graph/features/F-276.json` | Credit purchase spec |
| A6.2 | `BuyCreditsDialog` component | New component in `components/billing/` | Amount selector (presets: ₹1K/₹10K/₹25K/₹50K), custom amount, currency display, "Pay with Razorpay" button |
| A6.3 | POST `/api/v1/billing/create-order` route | Existing or new route | Create Razorpay order, return `order_id`. Uses existing `razorpay.ts` + `razorpay_orders` table |
| A6.4 | POST `/api/v1/billing/verify-payment` route | Existing or new route | Verify Razorpay signature, credit tokens via `creditTokens()`, generate GST invoice via `invoices.ts` |
| A6.5 | `CreditBalance` header component | New component | Show current credit balance in app header. Real-time update after purchase |

### A7: Provider Dashboard + Usage Analytics (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| A7.1 | KG feature node F-277 | `knowledge-graph/features/F-277.json` | Dashboard spec |
| A7.2 | GET `/api/v1/user/usage-stats` route | New route | Aggregate from `ai_usage_logs`: per-provider token counts, cost, success rate, grouped by day/week/month |
| A7.3 | `UsageDashboard` component | New component in `components/settings/` | Charts: token usage over time (per provider), cost breakdown pie chart, success/error counts |
| A7.4 | Admin-only: all-users usage view | Extend dashboard or new admin route | Admin sees aggregate across all users. Top users by consumption. Provider health status |

**Track A Total: 29 atomic tasks across 7 groups**

---

## TRACK B: Chunked Document Reader (D-065)

### B1: Decision + DB Schema (2 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| B1.1 | Create D-065 KG decision node | `knowledge-graph/decisions/D-065.json`, `_index.json` | Chunk strategy: 10K tokens, 500-token overlap, tiktoken counting |
| B1.2 | Migration 0029: `document_chunks` table | New migration SQL + Drizzle schema | `id`, `document_id` (FK to uploaded docs), `chunk_index`, `content` (text), `token_count`, `embedding` (vector), `metadata` (JSONB), `created_at`. Index on `(document_id, chunk_index)` |

### B2: Document Chunker (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| B2.1 | KG feature node F-278 | `knowledge-graph/features/F-278.json` | Chunker spec with overlap and boundary rules |
| B2.2 | `chunkDocument()` utility function | New `lib/documents/chunker.ts` | Split text by paragraphs respecting sentence boundaries, count tokens with tiktoken, create chunks of ~10K tokens with 500-token overlap |
| B2.3 | `persistChunks()` DB helper | Same or adjacent file | Batch insert chunks into `document_chunks` table. Return chunk IDs |
| B2.4 | Wire chunker into document upload flow | Modify existing upload handler in `api/v1/projects/[projectId]/documents/` | After document text extraction → call `chunkDocument()` → `persistChunks()`. Fire-and-forget (non-blocking upload response) |

### B3: Atomic Requirement Extractor (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| B3.1 | KG feature node F-279 | `knowledge-graph/features/F-279.json` | Extractor spec: per-chunk AI call, structured output |
| B3.2 | `extractRequirementsFromChunk()` function | New `lib/documents/requirement-extractor.ts` | Takes chunk text → callAI() with extraction prompt → returns `{requirements: [{id, text, category, priority, source_chunk_id}]}` |
| B3.3 | Migration 0030: `extracted_requirements` table | New migration SQL + Drizzle schema | `id`, `project_id`, `document_id`, `chunk_id`, `requirement_text`, `category` (functional/non-functional/constraint), `priority`, `is_duplicate`, `duplicate_of_id`, `created_at` |
| B3.4 | `processAllChunks()` orchestrator | Same file or new | Iterate all chunks for a document, extract requirements, batch insert, run deduplication pass (fuzzy match on text similarity) |

### B4: Smart Intake Integration (3 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| B4.1 | KG feature node F-280 | `knowledge-graph/features/F-280.json` | Integration spec |
| B4.2 | Replace deep-read with chunk-read in Smart Intake | Modify `smart-intake.tsx` + backend route | Instead of reading entire document in AI context, load requirements from `extracted_requirements` table. Show as structured list |
| B4.3 | Requirements merge from multiple documents | Modify curation-ui or requirements route | When multiple docs uploaded, merge all extracted requirements, re-run deduplication across docs |

### B5: Large Document E2E (2 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| B5.1 | KG feature node F-281 | `knowledge-graph/features/F-281.json` | Test plan |
| B5.2 | E2E test: 100-page PDF through chunk pipeline | Test script or manual verification | Upload large PDF → verify chunks created → verify requirements extracted → verify Smart Intake shows them → verify no token limit errors |

**Track B Total: 15 atomic tasks across 5 groups**

---

## TRACK C: Strategic Decomposition (D-062)

### C1: DeepBlueprintAgent — DONE (S134)

### C2: Module Decomposer Agent (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| C2.1 | KG feature node F-269 | `knowledge-graph/features/F-269.json`, `_index.json` | Decomposer spec: 3-step process, input/output schemas |
| C2.2 | `DecompositionPlan` TypeScript type | New types in `lib/agents/fast/types.ts` or adjacent | `{global_tech: {...}, modules: [{id, name, features[], db_tables[], apis[], screens[], dependencies[]}], execution_groups: string[][]}` |
| C2.3 | Step 1: Atomic decomposition prompt | Inside `decomposer-agent.ts` | System prompt that breaks deep blueprint features into smallest atomic units (single-responsibility features) |
| C2.4 | Step 2+3: Module clustering + ordering prompt | Same agent file | Second prompt (or chained): cluster atoms by shared DB/API/screen/dependency/domain → create modules → topological sort by dependencies → produce execution_groups |
| C2.5 | Register `fast.decomposer` agent | `lib/agents/fast/index.ts` + new `decomposer-agent.ts` | Agent class extending `FastKgBaseSectionAgent`, registered with deps on `fast.deep_blueprint` |

### C3: Module-Scoped Cumulative Context (6 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| C3.1 | KG feature node F-270 | `knowledge-graph/features/F-270.json` | Context scoping spec |
| C3.2 | `buildModuleContext()` helper | New in `fast-pipeline-executor.ts` or `lib/agents/fast/context.ts` | Takes: module definition + prior intra-module agent outputs + cross-module summaries → returns bounded context object (~20-25K tokens) |
| C3.3 | `buildCrossModuleSummary()` helper | Same file | After each module completes, generate 1-paragraph summary of what it produced (tables, APIs, screens). Accumulate for subsequent modules |
| C3.4 | Rewire executor: module iteration loop | `fast-pipeline-executor.ts` | Replace flat KG agent loop with: `for each execution_group → for each module → run 7 KG agents with module-scoped context` |
| C3.5 | KG direct pass: type-based `contextNodes` filtering | `fast-pipeline-executor.ts` | Replace `buildPriorSectionsFromKgNodes()` bridge. Each code generator gets filtered KG nodes: db_code_gen gets only DB nodes, api_code_gen gets API+DB nodes, etc. (10 filter rules from D-062) |
| C3.6 | Remove `buildPriorSectionsFromKgNodes()` + 12 render helpers | `fast-pipeline-executor.ts` | Delete lines ~78-204 (the lossy bridge). ~130 lines removed |

### C4: Cross-Domain Validator Agent (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| C4.1 | KG feature node F-271 | `knowledge-graph/features/F-271.json` | Validator spec: 6 intra + 5 cross checks |
| C4.2 | `ValidatorAgent` class | New `validator-agent.ts` | Agent ID `fast.validator`, 16384 maxTokens, temp 0.1. Input: all KG nodes grouped by module. Output: `ValidationReport` with `verdict`, `issues[]`, `warnings[]` |
| C4.3 | Intra-module checks (6 rules) | Inside validator prompt | 1) Every API has DB table, 2) Every screen has route, 3) Every component referenced by screen, 4) Auth rules reference valid roles, 5) FK references exist, 6) No orphan entities |
| C4.4 | Cross-module checks (5 rules) | Inside validator prompt | 1) Cross-module FK refs exist, 2) Shared APIs consistent, 3) Auth scopes consistent, 4) No duplicate table names, 5) Module boundary integrity |

### C5: Module Execution Orchestrator (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| C5.1 | KG feature node F-272 | `knowledge-graph/features/F-272.json` | Orchestrator spec |
| C5.2 | `executeModuleChain()` function | New or in `fast-pipeline-executor.ts` | For one module: run 7 KG agents sequentially with cumulative context → persist KG nodes → return module output summary |
| C5.3 | `executeAllModules()` function | Same file | For all execution groups: run modules in dependency order (parallel within group, sequential across groups). Call `executeModuleChain()` per module |
| C5.4 | Post-module validation step | Same file | After all modules complete → run `fast.validator` → if verdict=fail, log warning (non-blocking per D-062). Store validation report in `fast_pipeline_runs.metadata` |
| C5.5 | Wire into `executeFastPipeline()` | `fast-pipeline-executor.ts` | Replace Phase 2b (flat KG loop) with: Phase 2a (deep blueprint) → Phase 2b (decompose) → Phase 2c (execute modules) → Phase 2d (validate) → Phase 3 (code gen with KG direct pass) |

### C6: UI Updates + E2E Test (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| C6.1 | KG feature node F-273-ui | `knowledge-graph/features/F-273-ui.json` | UI spec |
| C6.2 | Module progress display in CodillaFastPage | `codilla-fast-page.tsx` | Show: current module name, module X/Y progress, agent within module. Replace flat agent progress with hierarchical module→agent display |
| C6.3 | Validation report display | Same or new component | After pipeline completes, show validator verdict (pass/warnings/fail) with expandable issue list |
| C6.4 | E2E test: multi-module app generation | Manual or test script | Generate app with 3+ modules (e.g. "e-commerce with auth, products, orders") → verify modules decomposed correctly → verify KG nodes per module → verify code generates → verify deploys |

**Track C Total: 24 atomic tasks across 5 groups (C2-C6)**

---

## TRACK D: Template Module Library (D-064)

### D1: Decision + Schema (3 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D1.1 | Create D-064 KG decision node | `knowledge-graph/decisions/D-064.json`, `_index.json` | Template system architecture: format, versioning, matching, customization |
| D1.2 | Migration 0031: `module_templates` table | New migration SQL + Drizzle schema | `id`, `slug` (unique), `name`, `description`, `version`, `category` (auth/admin/billing/ai/cms/media/ecommerce/social), `kg_nodes` (JSONB — full KG node array), `dependencies` (JSONB — other template slugs), `product_types` (JSONB — which product types use this), `is_active`, `created_at`, `updated_at` |
| D1.3 | Template CRUD API routes | New `/api/internal/module-templates` routes | GET (list), GET by slug, POST (create/update), DELETE. Admin-only |

### D2: Auth Module Template (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D2.1 | KG feature node for Auth template | `knowledge-graph/features/` | Spec for auth template contents |
| D2.2 | Auth template: DB KG nodes | JSON data file or seed script | Tables: `users`, `sessions`, `password_resets`, `roles`, `permissions`, `user_roles`. Columns, types, constraints, indexes all pre-specified |
| D2.3 | Auth template: API KG nodes | Same | Routes: `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/me`. Methods, request/response schemas, auth rules |
| D2.4 | Auth template: Screen + Component KG nodes | Same | Screens: Login, Register, ForgotPassword, ResetPassword. Components: LoginForm, RegisterForm, AuthGuard, RoleGuard |
| D2.5 | Auth template: Flow + Tech KG nodes | Same | Flows: registration flow, login flow, password reset flow. Tech: bcrypt, JWT, httpOnly cookies |

### D3: Admin Module Template (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D3.1 | KG feature node for Admin template | `knowledge-graph/features/` | Spec |
| D3.2 | Admin template: DB KG nodes | JSON | Tables: `audit_logs`, `site_settings`, `admin_roles`. Activity logging schema |
| D3.3 | Admin template: API KG nodes | JSON | Routes: user CRUD, role management, settings CRUD, audit log query, dashboard stats |
| D3.4 | Admin template: Screen + Component KG nodes | JSON | Screens: AdminDashboard, UserManagement, RoleManagement, Settings, AuditLog. Components: DataTable, StatsCard, ActivityFeed |
| D3.5 | Admin template: Flow + Tech KG nodes | JSON | Flows: admin invite flow, role assignment flow. Tech: RBAC middleware, pagination, filtering |

### D4: Billing + Payments Template (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D4.1 | KG feature node for Billing template | `knowledge-graph/features/` | Spec |
| D4.2 | Billing template: DB KG nodes | JSON | Tables: `subscriptions`, `plans`, `invoices`, `payment_methods`, `transactions` |
| D4.3 | Billing template: API KG nodes | JSON | Routes: plan listing, subscribe, cancel, upgrade, invoice download, payment webhook |
| D4.4 | Billing template: Screen + Component KG nodes | JSON | Screens: PricingPage, BillingDashboard, InvoiceList, PaymentMethod. Components: PlanCard, SubscriptionStatus, InvoiceRow |
| D4.5 | Billing template: Flow + Tech KG nodes | JSON | Flows: subscription flow, payment flow, invoice generation. Tech: Razorpay/Stripe, webhook verification |

### D5: AI Chat + API Key Manager Template (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D5.1 | KG feature node for AI template | `knowledge-graph/features/` | Spec |
| D5.2 | AI template: DB KG nodes | JSON | Tables: `chat_sessions`, `chat_messages`, `user_ai_keys`, `ai_usage` |
| D5.3 | AI template: API KG nodes | JSON | Routes: chat send/stream, session CRUD, API key CRUD, usage stats |
| D5.4 | AI template: Screen + Component KG nodes | JSON | Screens: ChatInterface, ApiKeySettings, UsageDashboard. Components: ChatBubble, MessageInput, StreamingResponse, KeyManager |
| D5.5 | AI template: Flow + Tech KG nodes | JSON | Flows: chat flow (stream), key validation flow. Tech: SSE streaming, multi-provider routing |

### D6: CMS + Media Template (5 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D6.1 | KG feature node for CMS template | `knowledge-graph/features/` | Spec |
| D6.2 | CMS template: DB KG nodes | JSON | Tables: `pages`, `posts`, `categories`, `tags`, `media_files`, `menus` |
| D6.3 | CMS template: API KG nodes | JSON | Routes: page CRUD, post CRUD, category CRUD, media upload/delete, menu management |
| D6.4 | CMS template: Screen + Component KG nodes | JSON | Screens: PageEditor, PostList, MediaGallery, MenuBuilder. Components: RichTextEditor, MediaUploader, DragDropList |
| D6.5 | CMS template: Flow + Tech KG nodes | JSON | Flows: content publish flow, media upload flow. Tech: S3/MinIO, image optimization, slugification |

### D7: Template Matcher Agent (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D7.1 | KG feature node for Template Matcher | `knowledge-graph/features/` | Spec |
| D7.2 | `TemplateMatcherAgent` class | New agent file | Input: decomposed modules from `fast.decomposer`. For each module: compare against template library → score match (0-100) → if >80, use template → else mark for custom KG generation |
| D7.3 | `applyTemplate()` function | New or in executor | Copy template KG nodes into project, adjusting IDs and cross-references. Merge with module-specific customizations |
| D7.4 | Wire matcher into fast pipeline executor | `fast-pipeline-executor.ts` | After decomposition: run template matcher → for matched modules, skip 7-agent chain and use template nodes → for unmatched modules, run full chain |

### D8: Template Integration E2E (3 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| D8.1 | KG feature node for E2E test | `knowledge-graph/features/` | Test plan |
| D8.2 | E2E: generate e-commerce app with templates | Manual or script | App: "e-commerce with auth, admin, billing, products, orders" → auth/admin/billing should match templates (80% reuse) → products/orders go through full KG → verify all modules integrate |
| D8.3 | Measure reuse percentage | Analysis | Count: template-matched KG nodes vs total KG nodes. Target: ≥80% for standard app types |

**Track D Total: 40 atomic tasks across 8 groups**

---

## TRACK E: Retire 10-Stage Pipeline (D-066)

### E1: Decision + Gap Analysis (3 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| E1.1 | Create D-066 KG decision node | `knowledge-graph/decisions/D-066.json`, `_index.json` | Migration strategy: which 10-stage features map to Fast, which are gaps |
| E1.2 | Feature gap audit | Analysis document | Map all 10 stages to Fast equivalents: Ideation→SmartIntake, Validate→(part of blueprint), Define/Design/Plan→(decomposition+KG), Build→(code gen), Deploy→(same), Monitor→(TBD) |
| E1.3 | Migration path for existing projects | Analysis document | How to handle projects started with 10-stage: preserve documents, convert pipeline_runs to fast_pipeline_runs, redirect UI |

### E2: Route Migration (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| E2.1 | KG feature node for migration | `knowledge-graph/features/` | Spec |
| E2.2 | Redirect `/project/:id/builder` to Fast pipeline | Route/page modification | AppBuilderPage detects pipeline mode → if standard, show "Upgrade to Fast" or auto-redirect |
| E2.3 | Migration script for existing `pipeline_runs` | New script or migration | For each active project: create `fast_pipeline_runs` record, copy relevant state, set `pipeline_mode: 'fast'` |
| E2.4 | Remove standard pipeline UI entry points | Multiple page files | Remove "Standard Pipeline" option from UI. CodillaFastPage becomes the only pipeline page |

### E3: Dead Code Removal (4 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| E3.1 | KG feature node for cleanup | `knowledge-graph/features/` | Spec |
| E3.2 | Remove 10-stage workflow code | `temporal/worker/` workflows | Remove `executePipeline` (standard), `executeStage` (standard), `executeRedo` standard variants. Keep rebuild workflows |
| E3.3 | Remove unused standard agents | `lib/agents/` | Audit all 105+ agents — remove those only used by standard pipeline and not by Fast or Rebuild. Keep shared agents |
| E3.4 | Remove stale API routes | `app/api/` | Remove routes that only serve standard pipeline (stage execution triggers, standard progress endpoints). Keep shared routes |

### E4: Production Cutover (3 tasks)
| # | Task | File(s) | What Changes |
|---|------|---------|-------------|
| E4.1 | KG feature node for cutover | `knowledge-graph/features/` | Deployment plan |
| E4.2 | Production deployment + migration apply | Docker rebuild + migrate | Rebuild web+worker images, apply any pending migrations, restart 16 services |
| E4.3 | Smoke test: all user flows on Fast only | Manual verification | New project creation → Smart Intake → Fast pipeline → code gen → deploy → rebuild. Verify no 10-stage code paths remain |

**Track E Total: 14 atomic tasks across 4 groups**

---

## GRAND TOTALS

| Track | Groups | Atomic Tasks | Status |
|-------|--------|-------------|--------|
| A: Multi-Provider | 7 | 29 | Not started |
| B: Chunked Documents | 5 | 15 | Not started |
| C: Decomposition | 5 | 24 | C1 done (S134) |
| D: Templates | 8 | 40 | Not started |
| E: Retire 10-Stage | 4 | 14 | Not started |
| **TOTAL** | **29** | **122** | **~1 done** |

---

## DEPENDENCY GRAPH (Group Level)

```
A1 → A2 → A3 → A4 → A5 → A6 → A7
                 |
                 v
          B1 → B2 → B3 → B4 → B5

C1(DONE) → C2 → C3 → C4 → C5 → C6
                                |
                                v
                 D1 → D2 → D3 → D4 → D5 → D6 → D7 → D8
                                                       |
                                                       v
                                            E1 → E2 → E3 → E4
```

**Parallel tracks**: A and C can run simultaneously. B starts after A4. D starts after C5. E starts after D8.

---

## EXECUTION ORDER (Interleaved, Recommended)

| Order | Task Group | Track | Unblocked By |
|-------|-----------|-------|-------------|
| 1 | C2 (Module Decomposer) | C | C1 done |
| 2 | A1 (D-063 Decision + Schema) | A | Nothing |
| 3 | C3 (Module-Scoped Context) | C | C2 |
| 4 | A2 (User API Key CRUD) | A | A1 |
| 5 | C4 (Validator Agent) | C | C3 |
| 6 | A3 (API Key Management UI) | A | A2 |
| 7 | C5 (Module Orchestrator) | C | C4 |
| 8 | A4 (Missing Adapters) | A | A3 |
| 9 | C6 (UI + E2E) | C | C5 |
| 10 | A5 (callAI Routing) | A | A4 |
| 11 | A6 (Credit Purchase) | A | A5 |
| 12 | A7 (Provider Dashboard) | A | A6 |
| 13 | B1 (Chunk Decision + Schema) | B | A5 |
| 14 | B2 (Document Chunker) | B | B1 |
| 15 | B3 (Requirement Extractor) | B | B2 |
| 16 | B4 (Smart Intake Integration) | B | B3 |
| 17 | B5 (Large Doc E2E) | B | B4 |
| 18 | D1 (Template Decision + Schema) | D | C5 |
| 19 | D2 (Auth Template) | D | D1 |
| 20 | D3 (Admin Template) | D | D2 |
| 21 | D4 (Billing Template) | D | D3 |
| 22 | D5 (AI Template) | D | D4 |
| 23 | D6 (CMS Template) | D | D5 |
| 24 | D7 (Template Matcher) | D | D6 |
| 25 | D8 (Template E2E) | D | D7 |
| 26 | E1 (Retire Decision + Gap) | E | D8 |
| 27 | E2 (Route Migration) | E | E1 |
| 28 | E3 (Dead Code Removal) | E | E2 |
| 29 | E4 (Production Cutover) | E | E3 |

---

## METHODOLOGY RULES (Every Session)
1. **KG-FIRST**: Create KG node BEFORE any code
2. **ONE deliverable per session** — no batching
3. **READ 100% of production code** before modifying
4. **Specialized agents** with curated prompts
5. **Chain of Prompts / Chain of Thought** per KG node
6. **FLAG VIOLATIONS** immediately
