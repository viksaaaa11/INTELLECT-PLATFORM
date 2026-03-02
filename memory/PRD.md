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
- **AI**: GPT-4o via Emergent Integrations
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
- Auth, Companies, Users, Leads, CRM, Deals, Wallet, Admin Panel
- Marketplace with property cards
- Subscription plans (Standard, Pro, Enterprise)
- Background images throughout the app

### Phase 1 Expansion - Completed (March 2, 2026)

#### Image Gallery (5-6 photos per property)
- [x] Properties have images array with 5-6 photos
- [x] Carousel navigation on cards (arrows, dots)
- [x] Fullscreen image viewer with thumbnails
- [x] Photo count badge on cards

#### Financial Calculators
- [x] **Mortgage Calculator** - Monthly payments, total interest, loan breakdown
- [x] **ROI Calculator** - Gross/net yield, payback period, monthly income
- [x] **Expenses Calculator** - DLD 4%, registration, agent commission, NOC, DEWA

#### AI Assistant (GPT-4o)
- [x] Chat interface with history
- [x] GPT-powered responses about Dubai real estate
- [x] Session management
- [x] Suggested questions
- [x] 24/7 consultation capability

**Tests**: Backend 97%, Frontend 85%, Overall 85%

## Prioritized Backlog

### P0 - Critical (Phase 2 - Next Sprint)
- [ ] Личный кабинет инвестора (портфель, доходность, документы, календарь)
- [ ] Система рейтингов и отзывов (агенты, застройщики)

### P1 - High Priority (Phase 3)
- [ ] Реферальная программа (бонусы, партнёрская для блогеров)
- [ ] Платные размещения для застройщиков (Premium листинги 500-2000 AED)
- [ ] Broker Marketplace (запросы между брокерами)
- [ ] Internal Chat для сделок

### P2 - Medium Priority
- [ ] Комиссия с транзакций (1-3%)
- [ ] Escrow-сервис для безопасных сделок
- [ ] Юридическое сопровождение сделки
- [ ] Оценка недвижимости
- [ ] Ипотечный брокер (партнёрство с банками)

### P3 - Low Priority
- [ ] Mobile app (Flutter/React Native)
- [ ] Multi-language support
- [ ] Facebook Lead Ads webhook
- [ ] WhatsApp Cloud API

## Next Action Items
1. Личный кабинет инвестора (портфель недвижимости)
2. Система рейтингов и отзывов
3. Реферальная программа
4. Premium листинги для застройщиков

## Technical Notes
- New users start with 1000 AED wallet balance
- EMERGENT_LLM_KEY configured for GPT-4o
- Properties seeded with 6 sample listings + 5-6 photos each
- Calculators use UAE-specific fees (DLD 4%, etc.)
