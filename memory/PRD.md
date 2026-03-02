# Dubai Real Estate SaaS Platform - PRD

## Original Problem Statement
Создание SaaS платформы для агентств недвижимости Дубая с функциями:
- CRM для брокеров
- Продажа лидов
- Marketplace между брокерами
- Управление сделками
- Внутренний чат
- Кошелёк и платежи
- Multi-company (каждое агентство отдельно)

## Architecture
- **Frontend**: React 19 + Shadcn UI + Tailwind CSS
- **Backend**: FastAPI + Python 3
- **Database**: MongoDB (Motor async driver)
- **Auth**: JWT Authentication
- **Design**: Dark theme with gold accents (Luxury Real Estate branding)

## User Personas
1. **Agent** - Брокер недвижимости, покупает лиды, работает с клиентами
2. **Team Manager** - Управляет командой агентов
3. **Company Admin** - Администратор агентства
4. **Super Admin** - Администратор платформы

## Core Requirements (Static)
- Multi-tenant architecture (company_id isolation)
- JWT authentication (email + password)
- Role-based access control
- Wallet system for lead purchases
- Deal pipeline management
- CRM with notes functionality

## What's Been Implemented

### Phase 1 MVP - Completed (March 2, 2026)

#### Backend (FastAPI)
- [x] Auth: Register, Login, JWT tokens
- [x] Companies CRUD (Super Admin only)
- [x] Users management with roles
- [x] Leads CRUD + purchase flow
- [x] Clients CRM with notes
- [x] Deals pipeline (viewing → offer → booking → closed)
- [x] Wallet with transactions (top-up, debit)
- [x] Dashboard API with metrics
- [x] Admin stats endpoint
- [x] **Marketplace Properties API**
- [x] **Subscription Plans API** (Standard, Pro, Enterprise)

#### Frontend (React)
- [x] Auth pages (Login, Register)
- [x] Layout with sidebar navigation
- [x] Dashboard with metrics and charts + Dubai skyline background
- [x] Leads table with purchase flow + background image
- [x] Clients CRM with notes sidebar
- [x] Deals pipeline (Kanban view) + background image
- [x] **Marketplace** - Property cards with images, filters, search
- [x] **Wallet** - Balance card, Club Membership (3 plans), Transactions
- [x] Admin panel (Companies, Users, Leads upload)

#### Design
- [x] Dark theme (#050505 background)
- [x] Gold accents (#D4AF37)
- [x] Manrope + Inter fonts
- [x] Luxury real estate branding
- [x] **Background images on all key pages** (Dubai skyline, properties)
- [x] **Property images in Marketplace cards**

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Broker Marketplace (requests & offers between brokers)
- [ ] Internal chat for deals

### P1 - High Priority
- [ ] CSV bulk lead upload
- [ ] Lead assignment within teams
- [ ] Commission calculations
- [ ] Real payment gateway (Stripe)

### P2 - Medium Priority
- [ ] Firebase push notifications
- [ ] Facebook Lead Ads webhook
- [ ] WhatsApp Cloud API integration
- [ ] AI lead scoring

### P3 - Low Priority
- [ ] Mobile app (Flutter/React Native)
- [ ] Advanced analytics
- [ ] Multi-language support

## Next Action Items
1. Implement Broker Marketplace (broker requests & offers)
2. Add Internal Chat for deals
3. Integrate Stripe for real payments
4. CSV import for bulk lead creation

## Technical Notes
- New users start with 1000 AED wallet balance
- Leads become unavailable after purchase
- All data is company-isolated (multi-tenant)
- Subscription plans: Standard (550 AED), Pro (900 AED), Enterprise (1500 AED)
- 6 sample properties seeded automatically
