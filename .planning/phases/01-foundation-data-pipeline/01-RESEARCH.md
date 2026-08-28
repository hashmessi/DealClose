# Phase 1: Foundation & Data Pipeline - Research

## Overview
This phase sets up the fundamental building blocks of the DealClose application, incorporating Next.js 14, Xano, and SerpApi.

## Architecture
- **Frontend**: Next.js 14 App Router. Needs tailwindcss configuration.
- **Backend API**: The Next.js API routes (`/api/serpapi`, `/api/deals`) will proxy requests to SerpApi and Xano to hide API keys.
- **Database**: Xano. We will use `fetch` to interact with Xano's REST API.

## APIs
- **SerpApi**: We'll use the Google Search API or Zillow API provided by SerpApi to fetch property data. Specifically, a search query for the property address to fetch real estate listings.
- **Xano**: We need a REST endpoint to create a deal in the `deals` table.

## Dependencies
- Next.js 14
- TailwindCSS
- Lucide React (for icons)

## Validation Architecture
- Ensure Xano table exists and can accept POST requests.
- Verify SerpApi returns results for a known demo address within 5 seconds.
- Test error boundaries for invalid addresses.
