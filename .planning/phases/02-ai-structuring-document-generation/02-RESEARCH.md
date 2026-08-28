# Phase 2: AI Structuring + Document Generation - Research

## Overview
Phase 2 transforms unstructured SerpApi market intelligence into a structured legal offer document using GPT-4o and Nutrient DWS / PDF generation.

## Technical Architecture

### 1. OpenAI GPT-4o Integration
- Package: `openai` npm package.
- System prompt instructs GPT-4o to analyze property market data, determine fair offer price, earnest money, closing cost allocations, and assign confidence scores (0-100%) to each extracted field.
- Uses `response_format: { type: "json_object" }` or structured outputs.

### 2. Nutrient DWS PDF Generation
- Nutrient DWS API / PDF Kit generation:
  - Consumes structured JSON from GPT-4o.
  - Applies branching logic (e.g. Include financing contingency clause if `contingency_financing` is true).
  - Calculates closing costs breakdown (buyer vs seller).
  - Outputs a PDF document URL/stream.

### 3. Xano Metadata Persistence
- Updates Xano deal record with `structured_deal_data`, `doc_url`, and sets status to `draft_complete`.

## Validation Architecture
- Verify GPT-4o returns valid JSON containing required deal keys and confidence scores.
- Verify at least 2 fields are tagged with confidence < 85% for human review routing.
- Verify PDF is generated and renderable inline in an iframe or viewer element.
