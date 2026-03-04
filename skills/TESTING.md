# Skills Testing Prompts

Use these prompts in the chat to verify each skill triggers correctly. Have relevant data already in your Excel sheet where noted.

**Sanity check**: Watch the browser console for `[Chat] Skills in prompt:` after each prompt to confirm the right skill was matched. If a skill doesn't trigger, use one of the exact trigger phrases from the table.

---

## Equity Research (6 skills)

| Skill | Test Prompt |
|-------|-------------|
| `catalyst-calendar` | "Build a catalyst calendar for my coverage universe" |
| `earnings-preview` | "Earnings preview for AAPL Q1 — what to watch" |
| `idea-generation` | "Screen for stocks — I have a list of names with P/E and revenue growth in columns A-D" |
| `model-update` | "Update my model with the new guidance numbers in row 5" |
| `morning-note` | "Write a morning note on the positions in this sheet" |
| `thesis-tracker` | "Build a thesis tracker for my positions" |

---

## Financial Analysis (7 skills)

| Skill | Test Prompt |
|-------|-------------|
| `3-statements` | "Build a 3-statement model from the financials in this sheet" |
| `check-model` | "Debug my model — the balance sheet isn't tying" |
| `comps-analysis` | "Build a comp table from the peer data in columns A-H" |
| `dcf-model` | "Build a DCF for the projections in this sheet — WACC is 10%" |
| `lbo-model` | "Model a buyout — entry at 8x EBITDA, 5x leverage, exit at 9x in year 5" |
| `financial-models` | "Price a call option: S=100, K=105, r=5%, σ=20%, T=1 year" |
| `stock-analysis` | "Analyze this stock — I have revenue, EBITDA, and comps multiples in columns A-F" |

---

## Quantitative (3 skills)

| Skill | Test Prompt |
|-------|-------------|
| `monte-carlo-simulation` | "Run a Monte Carlo simulation for AAPL over 30 days — μ=12%, σ=25%" |
| `portfolio-optimization` | "Build an efficient frontier for the 5 stocks in this sheet" |
| `fixed-income` | "What's the modified duration of a 5-year 4% coupon bond at 3.5% YTM?" |

---

## Investment Banking (5 skills)

| Skill | Test Prompt |
|-------|-------------|
| `buyer-list` | "Build a buyer list for this company — SaaS, $50M revenue, healthcare vertical" |
| `datapack-builder` | "Build a datapack from the financials in this sheet" |
| `deal-tracker` | "Set up a deal tracker for my current pipeline" |
| `merger-model` | "Build an accretion/dilution analysis — acquirer P/E 20x, target P/E 15x, 100% stock deal" |
| `dd-checklist` | "Kick off diligence for a B2B SaaS company — generate the DD checklist" |

---

## Private Equity (9 skills)

| Skill | Test Prompt |
|-------|-------------|
| `dd-meeting-prep` | "Prep me for a management meeting with Acme Corp — I have the CIM data in this sheet" |
| `deal-screening` | "Screen this deal against our criteria — data is in columns A-J" |
| `deal-sourcing` | "Build a deal sourcing target list — B2B SaaS, $5-20M EBITDA, Southeast" |
| `ic-memo` | "Write an IC memo for this deal — financials and deal terms are in this sheet" |
| `portfolio-monitoring` | "Review portfolio company performance vs budget — data is in columns A-G" |
| `returns-analysis` | "Build an IRR sensitivity table — entry 8x, leverage 4x, exit 8-10x, hold 3-5 years" |
| `unit-economics` | "Analyze unit economics for this SaaS business — ARR cohort data in columns A-F" |
| `value-creation-plan` | "Build a 100-day plan and EBITDA bridge — baseline EBITDA is $10M" |

---

## Wealth Management (7 skills)

| Skill | Test Prompt |
|-------|-------------|
| `client-report` | "Generate a quarterly client report for the portfolio in this sheet" |
| `client-review` | "Prep me for a quarterly review with John Smith — his holdings are in this sheet" |
| `financial-plan` | "Build a retirement projection — client is 45, $2M saved, wants to retire at 65" |
| `investment-proposal` | "Create an investment proposal for a new prospect — 60/40 portfolio, $500K" |
| `portfolio-rebalance` | "Check portfolio drift and generate rebalancing trades — target allocation in column E" |
| `tax-loss-harvesting` | "Find tax-loss harvesting opportunities in this sheet — show unrealized losses" |

---

## Total: 35 skills across 5 categories
