# WMS RFP Survey

**A guided 3PL discovery prototype for turning warehouse and fulfillment conversations into structured, reviewable requirements.**

## Product Overview
Operational discovery can easily become fragmented across calls, notes, and spreadsheets. WMS RFP Survey explores a guided workflow that captures the information needed to understand a 3PL customer's WMS + OXM requirements before solution design.

## The Problem
When discovery is inconsistent, important requirements can surface too late: warehouse setup, SKU characteristics, batch/expiry needs, inbound and outbound flows, integrations, workforce, volumes, and business goals. The prototype creates one repeatable path through those topics.

## Guided Workflow
1. Warehouse Setup
2. Customers
3. Users & Workforce
4. Inventory & Products
5. Inbound
6. Outbound
7. Integrations
8. Challenges & Goals
9. Review

## Core Features
- Opportunity/discovery dashboard
- Customer and contact capture
- Guided staged questionnaire
- Conditional follow-up questions
- Auto-save
- Save & Exit / Resume
- Draft and Completed statuses
- Progress tracking
- Review and edit
- Excel-compatible export

## Product Decisions
**Structure the conversation without scripting it.** The workflow creates coverage while still allowing free-text operational context.

**Show relevant questions only.** Conditional logic keeps the survey focused as requirements change.

**Support multi-session discovery.** Drafts persist locally so the user can resume a longer customer conversation.

**Make the output portable.** Export provides a practical bridge from discovery into existing review and solutioning workflows.

## Analytics & Privacy
GA4 tracks high-level product events including discovery start, stage completion, completion, and export. Customer identity/contact fields and free-text answers are not intentionally sent as analytics parameters.

## Tech Stack
HTML, CSS, vanilla JavaScript, browser Local Storage, Google Analytics 4, and client-side Excel-compatible export.

## Current Scope
The MVP is designed around **3PL WMS + OXM discovery** and stores records locally in the browser. It does not yet provide authentication, cloud persistence, collaboration, or CRM integration.

## Roadmap Opportunities
- Secure cloud records and team collaboration
- Multiple discovery templates
- CRM integration
- Fit-gap and risk flags
- Requirement summaries for solution design
- Approval and handover workflows

## About This Project
This prototype applies implementation and solution-consulting experience to a product problem: improving requirement quality where commercial discovery becomes operational solution design.

**Built by Hassan Mohamed Saber**
