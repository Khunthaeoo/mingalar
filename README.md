# MingalarMate — Taiwan Student Guide

> **A welcoming, beginner-friendly starter guide for Myanmar and international students studying and living in Taiwan.**

---

## 1. Project Overview

**MingalarMate** is an AI-powered multilingual information and community platform designed to assist prospective, incoming, and enrolled international students in Taiwan (with an initial focus on Myanmar students at National Chi Nan University - NCNU). Combining *"Mingalar"* (မင်္ဂလာ), the traditional Myanmar greeting of goodwill, with *"Mate"*, meaning companion, the project bridges language, living, and administrative barriers.

* **Project Type:** Full-Stack Multilingual Platform (Frontend + FastAPI + Supabase + Groq RAG)
* **Primary Audience:** Myanmar students and international scholars in Taiwan
* **Deployment Target:** Frontend on GitHub Pages / Static Server, Backend on FastAPI
* **Current Status:** Version 2.0 (Phases 2 through 6 fully built and verified)

---

## 2. Platform Architecture & Capabilities

MingalarMate now operates as a complete, decoupled system:

```text
MingalarMate/
├── index.html                      # Landing page with Auth & AI Assistant integration
├── pages/
│   ├── information-center.html     # Phase 3: Searchable & categorized student guides
│   ├── study-in-taiwan.html        # Academic pathways, admissions, scholarships
│   ├── living-in-taiwan.html       # ARC, NHI healthcare, SIM, housing, transit
│   ├── part-time-jobs.html         # Ministry of Labor work permits & legal guidelines
│   ├── about.html                  # Project background, NCNU focus, roadmap
│   └── admin.html                  # Phase 6: Admin metrics, PDF uploader, feedback
├── assets/
│   ├── css/style.css               # Shared Taiwan-inspired responsive stylesheet
│   ├── js/
│   │   ├── main.js                 # Mobile navigation & base interactions
│   │   ├── auth.js                 # Phase 2: Supabase Auth & profile management
│   │   └── chat.js                 # Phase 5: Floating Multilingual AI RAG Assistant
│   └── images/                     # Local SVG illustrations & topic badges
└── backend/
    ├── app/
    │   ├── main.py                 # FastAPI application & CORS configuration
    │   ├── config.py               # Environment variables loader
    │   ├── routers/
    │   │   ├── auth.py             # User signup, login, session
    │   │   ├── profiles.py         # Profile & language preference updates
    │   │   ├── articles.py         # Phase 3: Article search, filter & CMS
    │   │   ├── documents.py        # Phase 4: PDF processing & vector indexing
    │   │   ├── chat.py             # Phase 5: AI RAG chat & feedback endpoints
    │   │   └── admin.py            # Phase 6: Platform metrics & feedback review
    │   └── services/
    │       ├── supabase_client.py  # Supabase client singleton
    │       ├── embedding_service.py# 768-dim vector embedding generator
    │       ├── pdf_processor.py    # PyMuPDF text extractor & chunker
    │       └── rag_service.py      # Groq LLM inference + pgvector RAG
    ├── schema.sql                  # Supabase PostgreSQL & pgvector schema
    ├── seed_articles.sql           # Initial baseline articles seed script
    ├── requirements.txt            # Python dependencies
    └── .env.example                # Environment variable configuration template
```

> [!NOTE]
> MingalarMate is an independent educational and informational project. It is **not** an official government agency, university administration office, immigration consultancy, or employment broker.

---

## 2. Five Required Website Pages

The Version 1 website comprises exactly five structured pages:

1. **`index.html` (Home)**
   * Welcoming hero banner and project introduction.
   * Direct navigation cards to all core information guides.
   * High-level 4-step student roadmap (Admissions → Visa → Arrival & ARC → Work Permits).
   * Independent project disclaimer.

2. **`pages/study-in-taiwan.html` (Study in Taiwan)**
   * Overview of comprehensive universities vs. universities of science and technology.
   * Fall and Spring intake admission timelines.
   * Document preparation and authentication checklist.
   * Taiwan MOE, university, and ICDF scholarship overviews.
   * Direct links to official Ministry of Education and Study in Taiwan portals.

3. **`pages/living-in-taiwan.html` (Living in Taiwan)**
   * Alien Resident Certificate (ARC) legal requirements and National Immigration Agency (NIA) links.
   * National Health Insurance (NHI) enrollment guidelines.
   * Prepaid airport SIM cards vs. student telecom contracts.
   * On-campus dormitories vs. off-campus private rentals.
   * Public transit overview (EasyCard, MRT, TRA, THSR, YouBike).
   * Convenience store services and typhoon/earthquake safety essentials.

4. **`pages/part-time-jobs.html` (Part-time Jobs)**
   * Crucial legal warning regarding the Employment Service Act.
   * Mandatory Work Permit requirement issued by the Workforce Development Agency (Ministry of Labor).
   * Strict 20-hour weekly work limit during regular semesters.
   * Step-by-step EZ Work Taiwan online application workflow.
   * Safe student employment tips, campus assistantships, and scam warning signs.

5. **`pages/about.html` (About MingalarMate)**
   * Mission, meaning behind the name, and student community focus.
   * Statement of independence and responsible information policy.
   * Version 1 static scope and future roadmap (Burmese & Traditional Chinese translations, mentorship, campus directory).

---

## 3. Technology Stack & Constraints

In strict accordance with `AGENTS.md`:

* **Semantic HTML5:** Clean, accessible markup with landmark regions (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`), logical headings (`h1`–`h4`), and descriptive `alt` texts.
* **Vanilla CSS3:** Single shared stylesheet located at `assets/css/style.css`.
  * CSS Custom Properties in `:root` representing a warm palette inspired by Taiwan (brick-red terracotta, mountain jade, cream neutrals).
  * System font stack (zero external or paid web fonts).
  * Fully responsive across mobile (<768px), tablet (768px–992px), and desktop (>992px) viewports without horizontal scroll.
* **Vanilla JavaScript:** Single shared script located at `assets/js/main.js`.
  * Handles accessible mobile navigation hamburger toggling (`aria-expanded`, keyboard escape support).
  * No external libraries, frameworks, build steps, or tracking scripts.
  * Site remains completely readable and functional even if JavaScript is disabled.
* **Relative Paths:** Strict relative URL paths throughout (e.g. `assets/...` from root, `../assets/...` and `../index.html` from `pages/`) ensuring complete compatibility with GitHub Pages repository sub-paths.

---

## 4. File and Directory Structure

```text
MingalarMate/
├── AGENTS.md
├── README.md
├── index.html
├── pages/
│   ├── study-in-taiwan.html
│   ├── living-in-taiwan.html
│   ├── part-time-jobs.html
│   └── about.html
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── images/
        ├── logo.svg
        ├── hero-illustration.svg
        ├── study-icon.svg
        ├── living-icon.svg
        ├── work-icon.svg
        └── about-icon.svg
```

---

## 5. Local Preview Instructions

You can preview the website locally using any standard web browser:

### Option A: Direct Browser Opening
1. Double-click or open `index.html` directly in your web browser (Chrome, Edge, Firefox, Safari).
2. Browse through the navigation links to explore the nested pages in `pages/`.

### Option B: Local Static HTTP Server (Recommended)
Using Python (available on most developer machines):
```bash
# Navigate to the repository root
cd "d:/Generative AI/MingalarMate"

# Run a lightweight local HTTP server
python -m http.server 8000
```
Open your browser and visit: `http://localhost:8000/`

---

## 6. GitHub Pages Deployment Instructions

When ready to publish to GitHub Pages:

1. **Initialize Git & Commit:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of MingalarMate v1.0 website"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   * Go to your repository on GitHub.
   * Navigate to **Settings** → **Pages** (under the "Code and automation" section).
   * Under **Build and deployment**:
     * **Source:** Select `Deploy from a branch`.
     * **Branch:** Select `main` and folder `/ (root)`.
     * Click **Save**.
   * GitHub Pages will generate your live URL within 1–2 minutes:
     `https://<your-username>.github.io/<your-repo-name>/`

---

## 7. Asset Licensing & Attribution

* All vector icons (`logo.svg`, `study-icon.svg`, `living-icon.svg`, `work-icon.svg`, `about-icon.svg`) and illustrations (`hero-illustration.svg`) were crafted specifically for MingalarMate. They are SVG-based, stored locally within `assets/images/`, and distributed under the same open repository terms.
* No external commercial stock photos or proprietary fonts are required.

---

## 8. Verified Official Resources

* **Study in Taiwan:** [https://www.studyintaiwan.org](https://www.studyintaiwan.org)
* **Ministry of Education (MOE):** [https://english.moe.gov.tw](https://english.moe.gov.tw)
* **National Immigration Agency (NIA):** [https://www.immigration.gov.tw](https://www.immigration.gov.tw)
* **Ministry of Labor (MOL):** [https://www.mol.gov.tw](https://www.mol.gov.tw)
* **EZ Work Taiwan (Foreign Student Work Permits):** [https://ezwp.wda.gov.tw](https://ezwp.wda.gov.tw)
* **Bureau of Consular Affairs (BOCA):** [https://www.boca.gov.tw](https://www.boca.gov.tw)

---

*Last reviewed: November 2026*
