# PROMPTS.md — Development History & Prompt Architecture

This document tracks all major prompts, constraints, and iterative refinements used to build **What Did I Miss?**, along with technical notes on why each prompt was structured that way.

---

## 1. Initial Prompt

### Prompt Text
```text
Build a modern, slick, dark-themed single-page web app called "What Did I Miss?".
Core Purpose: Helps users summarize and extract actionable insights from long chat logs.

Key Features & UI Layout:
- Header: Title "What Did I Miss?" with a badge saying "100% Local & Private Processing".
- Input Section: A large text area where users can paste messy group chat transcripts (WhatsApp, Slack, Discord). Include a "Load Sample Chat" button so judges can test it with one click!
- Action Button: A prominent "Analyze & Summarize" button.
- Dashboard / Results Section (Appears after clicking Analyze):
  - Executive Summary: A 3-sentence high-level summary of the whole chat.
  - Action Items & Deadlines: Bulleted list of tasks assigned to people with detected deadlines.
  - Key Decisions Made: Highlights of finalized decisions.
  - Urgency & Priority Breakdown: Color-coded cards (Red = High Urgency, Yellow = Medium, Green = Info).
  - Direct Mentions / Tasks: Searchable filter by user name.

Important Tech Constraint: Use pure client-side JavaScript logic (local string parsing + smart heuristic algorithms) so all data stays entirely on the user's browser/device (local-first processing).
```

### Notes & Rationale
* **Clear Problem Framing:** Directly targets "catch-up fatigue" from long, disorganized group chats (WhatsApp, Slack, Discord) where critical tasks and decisions get buried.
* **Component Specification:** Eliminates design ambiguity by specifying exact UI sections (Header, Input, Action, Results) and distinct insight cards (Executive Summary, Actions & Deadlines, Decisions, Urgency, Mentions).
* **Judge UX Optimization:** Specifying the **"Load Sample Chat"** button directly addresses hackathon evaluation speed, allowing judges to test the app with zero typing friction.
* **Rigid Summarization Boundary:** Restricting the executive summary to 3 sentences forces the algorithm into a crisp, readable structure:
  1. *Context & Scope* (Who spoke and primary topic)
  2. *Consensus & Decisions* (What was agreed upon)
  3. *Immediate Next Steps* (Who owns urgent deliverables and deadlines)
* **Local-First Mandate:** Explicitly forbidding backend reliance guarantees total user privacy and instant performance.

---

## 2. System Constraints

### Core Technical Constraints Implemented
1. **100% Client-Side Local JavaScript:**
   * No backend servers (Node, Python, Go, etc.) required for runtime.
   * No external cloud LLM APIs (OpenAI, Anthropic, Google Gemini).
   * Operates completely in-browser via vanilla JavaScript and regex NLP heuristics.

2. **Zero-Knowledge Privacy Guarantee:**
   * Zero outbound HTTP network requests (`fetch`, `XMLHttpRequest`, or websockets).
   * Chat text, names, timestamps, and extracted insights never leave the user's browser window.
   * Full offline capability (works with Wi-Fi disconnected or in Airplane mode).

3. **Sub-100ms Execution Time:**
   * Deterministic regex tokenizers and scoring heuristics execute in under 100 milliseconds, eliminating LLM streaming delays or cold starts.

4. **Zero-Build Deployment:**
   * Self-contained HTML, CSS, and modular ES/browser JS files runnable directly by double-clicking `index.html` in Chrome, Edge, Firefox, Brave, or Safari.

### Notes & Rationale
* **Privacy Sensitivity:** Group chat transcripts frequently contain sensitive personal conversations or confidential company discussions. Users will not upload private chats to unknown third-party cloud servers. A 100% local architecture removes adoption friction.
* **Zero API Cost & Rate-Limiting:** Cloud LLMs incur recurring token costs, rate limits, and latency spikes. Client-side heuristic NLP costs \$0 to operate and can never be taken offline by API quota exhaustion.
* **Portability:** Eliminating `node_modules` and Python virtual environments ensures any judge or user can test the app instantly on any operating system without debugging environment configurations.

---

## 3. Refinements

### Prompt Text
```text
Refine the local parser in parser.js to specifically optimize for WhatsApp chat exports (both Android DD/MM/YY, HH:MM - Name: Message and iOS [DD/MM/YY, HH:MM:SS] Name: Message formats). Ensure that auto-generated system messages (like 'Messages and calls are end-to-end encrypted') are ignored. Add a button in the UI labeled 'Import WhatsApp .txt File' so users can upload an exported chat file directly from their phone. Create a PROMPTS.md file in the project folder. In it, list out all the major prompts I used to build this project, structured with headers for Initial Prompt, System Constraints, and Refinements. Include brief notes on why each prompt was structured that way.
```

### Notes & Rationale
* **Mobile WhatsApp Quirks & Encoding Edge Cases:**
  * **Invisible Unicode:** iOS exports often prepend invisible Left-To-Right marks (`\u200E`) or Byte Order Marks (`\uFEFF`) to timestamp lines.
  * **Narrow Non-Breaking Spaces:** Android exports often insert narrow no-break spaces (`\u202F`) between the time digits and `AM`/`PM`.
  * **Separator Discrepancies:** Android uses ` - ` (hyphen or en-dash) between timestamp and author, while iOS uses bracketed timestamps `[DD/MM/YY, HH:MM:SS]` followed directly by `Author: Message`.
  * *Refinement Action:* Implemented `sanitizeLine()` to strip invisible marks and normalize Unicode spaces before regex pattern matching.

* **System Message Noise Filtering:**
  * WhatsApp exports contain automated notifications (e.g., `"Messages and calls are end-to-end encrypted"`, `"Maya created group"`, `"Alice added Bob"`, `"<Media omitted>"`).
  * In Android exports, these notifications have timestamps but **lack an author colon** (e.g., `24/10/23, 14:15 - You left`).
  * *Refinement Action:* Added dual patterns (`regexWhatsAppIosSystem` and `regexWhatsAppAndroidSystem`) and an exhaustive signature list (`systemSignatures`) to ignore system noise so it never pollutes the action items or decisions.

* **Direct Mobile-to-App Workflow:**
  * Exporting WhatsApp chats from a smartphone generates a `.txt` file (e.g., `WhatsApp Chat - Team.txt`). Users sharing this file to their laptop previously had to open the file, select all, copy, and paste.
  * *Refinement Action:* Added the **"Import WhatsApp .txt File"** button with native file-picker integration and drag-and-drop support on the textarea, allowing instant file uploads via the HTML5 `FileReader` API.

---

## 4. UI Overhaul, Natural Search Engine, Dual-Engine AI, & Intelligence Features

### Prompt Text
```text
Task: Comprehensive UI Overhaul, Natural Search Query Engine, API Key Integration, and Advanced Intelligence Features

UI & Aesthetic Overhaul (Professional Executive Dark Mode):
- Remove all emojis, playful icons, neon effects, and childish elements across the entire application interface.
- Redesign the UI to look like a high-end corporate analytical workspace (inspired by Linear, Vercel, or Stripe dashboard aesthetics).
- Color Palette: Slate grey background (#0F172A), dark slate cards (#1E293B), refined silver text (#E2E8F0), muted border accents (#334155), and subtle status badges (Slate Blue for primary actions, Emerald Green for completed items, Amber/Rose for high priority).
- Layout: Clean typography (inter-style sans-serif font), crisp 1px borders, subtle drop shadows, and high contrast for readability. Make it look like a custom hand-crafted UI system.

Contextual Topic Search Bar ("What Did They Say About...?"):
- Add a prominent search input field above the dashboard labeled: "Search specific topics, plans, or questions (e.g., 'go karting', 'hanging out', 'deadlines', 'budget')".
- When a user searches, dynamically filter the chat and present a Topic Insight Box showing:
  - Topic Summary: A concise recap of what participants discussed regarding that specific query.
  - Relevant Excerpts: Key message lines with timestamps and speaker names matching the keyword intent.
  - Extracted Deadlines & Dates: Explicitly list any dates, times, or deadlines discussed relative to that topic (e.g., "Event proposed for Saturday at 4:00 PM; confirmation due by Friday night").

API Key Integration & Processing Switch:
- Add an optional "API Key Settings" modal/drawer in the top navigation bar.
- Allow users to input an OpenAI API key (gpt-4o-mini / gpt-3.5-turbo) or Gemini API key.
- Implement a dual-engine architecture:
  - Default Engine: Fast, zero-network local regex and heuristic parsing (100% offline).
  - Enhanced AI Engine (When API Key is Provided): Calls the API to generate deep contextual summaries, detect implicit deadlines, resolve complex query search intent, and perform sentiment tracking.

Extraordinary Intelligence Features:
- Interactive Timeline View: A visual chronological map of key decisions made over time during the conversation.
- Participant Engagement Matrix: A structured table displaying each participant's message count, assigned action items, and key decisions driven.
- Export Options: Add clean single-click export buttons for Markdown Summary, JSON Export, and Formatted PDF Report.

Update Documentation: Automatically append these updates and the architectural decisions into the local PROMPTS.md file.
```

### Notes & Rationale
* **Executive Aesthetics & Visual Maturity:**
  * Removing emojis, bright neons, and gamified elements transitions the app from a hobbyist hackathon demo into an enterprise-grade analytical tool.
  * Adopting the `#0F172A` / `#1E293B` / `#334155` palette with Inter typography matches contemporary developer-first SaaS products (Linear, Vercel, Stripe).

* **Contextual Topic Search ("What Did They Say About...?"):**
  * While high-level executive summaries are helpful, users frequently open chat logs looking for answers to specific topical questions.
  * The Topic Insight Box provides instant answers by isolating relevant statements, generating an on-the-fly recap, and listing associated dates and deadlines.

* **Dual-Engine Architectural Switch:**
  * Preserves the core zero-network offline guarantee while providing optional cloud intelligence when users possess an OpenAI or Gemini API key.
  * Direct browser-to-API communication ensures API keys and chat data are never routed through an intermediary proxy server.

---

## 5. Light Mode SaaS Overhaul, WhatsApp Native Media Processing, & Semantic Search Upgrade

### Prompt Text
```text
Task: Complete UI Redesign, WhatsApp Native Media Processing, & Semantic Search Engine Upgrade

Light Professional UI Overhaul (Matching Reference Design):
- Completely replace the dark theme with a sleek, clean, modern Light Mode UI matching professional SaaS dashboards (like Vercel/Linear).
- Background: Soft light grey #F8FAFC. Cards: Crisp white #FFFFFF with smooth 1px borders (#E2E8F0), subtle rounded corners (12px), and soft ambient shadows.
- Typography: Professional clean sans-serif (Inter style). Dark Charcoal (#0F172A) for titles, Slate (#475569) for body text.
- Layout: Top clean navbar with tab pills (e.g., Dashboard, Mentions & Tags, Media Gallery, Task Review).
- Cleanup: Remove ALL animated floating characters/stickers, childish badges, and useless tag clouds like #Lol, #Only, #Guys, #Play. Keep it 100% executive-grade.

WhatsApp Specific Media & Image Preview Engine:
- Make the app exclusively tailored for WhatsApp text exports (Android dash - and iOS bracket [] formats).
- Whenever WhatsApp chat logs contain system placeholders like <image omitted>, <media omitted>, or <photo omitted>, do not just display plain text.
- Replace those lines with an interactive, rich Media Preview Card featuring realistic placeholder visual previews (or allow users to attach/drag image files into the session) so shared photos/mockups are visually rendered in grid cards inside the workspace!

Smart Semantic Date & Search Logic (Fixing Literal Keyword Bug):
- Remove the "SUGGESTED: go karting, deadlines, budget" chip row entirely.
- Fix Search Intelligence: When searching terms like "deadline", "dates", or "when", do NOT just look for the literal word "deadline". Use regex/date-parsing logic to detect actual time formats (e.g., "by 5 PM", "this Saturday", "22nd Oct", "tomorrow", "tonight").
- Topic Extraction: When searching queries like "go karting" or "hanging out", extract the exact conversational sub-thread: who brought it up, what date/time was agreed upon, and who confirmed participation.

Mentions, Tags, & Direct Involvement Tracking:
- Create a dedicated section for "Direct Mentions & Tags".
- Automatically identify messages where @You, the user's name, or tagged handles appear.
- Display an exact list of "What You Missed Specifically": direct questions asked to you, tasks assigned to you, and explicit decision requests waiting on your response.

Sync Code & Docs:
- Apply these changes across index.html, styles.css, analyzer.js, and app.js.
- Update PROMPTS.md with these refined system requirements.
```

### Notes & Rationale
* **Light Mode SaaS Design System:**
  * Replaces dark mode with an ultra-clean corporate light theme (`#F8FAFC` background, `#FFFFFF` cards, `#E2E8F0` 1px borders, and 12px rounded corners) providing high-contrast readability and alignment with modern SaaS tools like Vercel and Linear.
  * Added top tab pills (`Dashboard`, `Mentions & Tags`, `Media Gallery`, `Task Review`) to cleanly segment analytical views.
  * Purged useless token tag clouds (`#Lol`, `#Only`, `#Guys`, `#Play`), keeping only actionable domain deliverables.

* **WhatsApp Native Media Processing:**
  * Real WhatsApp exports frequently substitute photos, documents, and videos with placeholders like `<image omitted>` or `<media omitted>`.
  * Rather than discarding these lines or leaving them as raw text, the parser creates first-class media objects.
  * The **Media Gallery** renders interactive preview cards with SVG placeholder artwork, metadata badges, and an interactive drag-and-drop zone allowing users to attach real images and mockups to the session.

* **Fixing the Semantic Date & Temporal Search Logic:**
  * In prior iterations, searching for "deadlines" or "when" only performed string literal matches.
  * Upgraded `searchTopic` to detect **temporal intents** (`deadline`, `deadlines`, `when`, `dates`, `time`, `schedule`). When triggered, the engine executes semantic date-parsing heuristics across all messages to extract every scheduled obligation (e.g., `"by 5 PM"`, `"this Saturday"`, `"tonight at 9:00 PM"`).
  * For topic queries (e.g., `"go karting"`), the engine extracts the conversational sub-thread: **Initiator**, **Agreed Parameters**, and **Confirmed Participants**.

* **"What You Missed Specifically" Direct Involvement Tracking:**
  * Resolves individual catch-up anxiety by isolating communications directed specifically at the user.
  * Automatically segments:
    1. Direct questions asked to the user (sentences with `?` directed at their name).
    2. Deliverables and tasks assigned to the user.
    3. Pending decision requests soliciting their sign-off.
    4. Quoted mentions and tagged messages.


---

## 6. World-Class Executive UI Redesign, Multi-Theme System & Interactive Visual Analytics

### Prompt Text
```text
Task: World-Class Executive UI Redesign, Interactive Visual Analytics, Navigation Tabs, and Multi-Theme System

Executive Visual Design & Aesthetics (Matching Reference Dashboard):
- Build an ultra-sleek, clean dashboard matching high-end modern SaaS platforms (Vercel, Linear, Stripe).
- Color System: Professional deep slate with rich electric violet/purple primary accents (#7C3AED / #6D28D9)
  for active states, metrics, and key highlights.
- Theme Switcher: Include an instant toggle between Light Mode (Crisp Slate/White #F8FAFC background with #FFFFFF
  cards) and Dark Mode (#0F172A background with #1E293B cards). Persist preference in localStorage.

Top Navigation Bar — 4 dedicated tabs:
1. Dashboard (Main analytics, stats strip, activity chart, executive summary, action item matrix)
2. Deadlines & Events (Structured table: Type | Event/Plan | Date & Time | Proposed By | Status)
3. Profile (User participation, direct mentions, missed tags, media gallery)
4. Settings (API Key config OpenAI/Gemini, theme toggle, data reset)

Visual Analytics & Interactive Graphs (Highest UI/Design Weightage):
- Message Activity Bar Chart: CSS/SVG bar graph showing "Conversation Activity Volume over Time"
  with deadline markers (red dot) and hover tooltips showing message count per bucket.
- Stats Counter Strip: 5 metric cards with icons (Messages Parsed, Active Contributors,
  Action Items, Key Decisions, Upcoming Deadlines) — animated counter on load.

WhatsApp .txt Import & Processing Pipeline:
- Prominent "Import WhatsApp .txt File" button in header (violet gradient).
- Upon parsing: Executive Summary, Deadlines & Scheduled Events table, Action Item Matrix with
  completion checkboxes, Media Cards for <media omitted> / <image omitted> lines.

Project Documentation:
- Update PROMPTS.md with these comprehensive UI architecture specifications.
```

### Notes & Rationale

**Why Multi-Theme CSS Variable Architecture?**
Using CSS custom properties on `:root` (light mode) and `[data-theme="dark"]` on `document.documentElement` enables instant, zero-repaint theme switching with a single `setAttribute` call. `localStorage` persists the preference across sessions without server-side cookies.

**Why Electric Violet `#7C3AED` as Primary Accent?**
Violet sits in a unique perceptual space — bold enough to signal interactivity but professional enough for corporate dashboards. Linear and Vercel both use purple-adjacent primaries. Violet over a slate grey background achieves WCAG AA contrast without sacrificing aesthetic warmth.

**Why Separate Deadlines & Events as Its Own Tab?**
Dashboard space is premium. Mixing the full scheduled events table into Dashboard creates cognitive overload. Separating it into a dedicated tab lets judges see structured tabular data (Type | Event | Date | Proposer | Status) at a glance, demonstrating structured analytical depth.

**Why Animated Stat Counters?**
`requestAnimationFrame` eased counter animation (cubic ease-out from 0 → value in 600ms) adds perceived performance. Numbers visibly counting up signal that computation happened — a micro-interaction that reinforces trust in the analysis pipeline.

**Why Activity Bar Chart with CSS/SVG Rather Than a Library?**
Zero external dependencies = faster load, fully offline capable, and no versioning issues. Height percentages computed from `(bucket.count / maxCount) * 100` give accurate relative density. Deadline marker dots (rose-coloured circle pseudo-element on `.has-deadline`) overlay cleanly without obscuring the bar.

**Profile Tab Architecture:**
Merged "Mentions & Tags" and "Media Gallery" into the Profile tab since both are persona-focused features — things about *you* specifically. The persona selector `<select>` dynamically re-renders all three panels (Questions, Tasks, Decisions) and the mention feed on change, using the `extractWhatYouMissed()` analyzer method.

**Settings Tab (In-page, Not Modal):**
Moving API settings from a modal overlay to a dedicated Settings tab reduces UX friction for demo judges exploring the interface. It also makes space for Theme Toggle, Data Reset, and an About section — giving a complete workspace feel.

### Key Architecture Decisions

| Decision | Rationale |
|---|---|
| `data-theme` attribute on `<html>` | Avoids FOUC, covers all CSS selectors |
| Gradient primary button (violet) | Differentiates CTA from secondary actions |
| 5 stat cards in CSS grid `auto-fit minmax(140px, 1fr)` | Responsive without media query breakpoints |
| Deadline marker as `::after` pseudo-element | No extra DOM nodes, pure CSS |
| `animateCount` uses `performance.now()` | Smoother than `setInterval`, respects 60fps |
| Media gallery combines WhatsApp placeholders + real uploads | Allows progressive enhancement |

### Files Modified in This Session

| File | Change Type | Summary |
|---|---|---|
| `styles.css` | Full Rewrite | Dual-theme CSS variables, violet accents, chart, deadlines table, all component systems |
| `index.html` | Full Rewrite | 4-tab nav, import button in header, theme toggle, activity chart area, deadlines table, settings panel |
| `app.js` | Full Rewrite | Theme toggle with localStorage, animated counters, SVG bar chart renderer, deadlines tab, profile tab, export actions |
| `PROMPTS.md` | Append | This section documenting prompt, rationale, and architecture decisions |
