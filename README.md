# What Did I Miss? — Executive WhatsApp Intelligence Workspace

> **An enterprise-grade analytical workspace for WhatsApp group chat catch-up, decision mapping, native media processing, and semantic search.**  
> Built with a **Dual-Engine Architecture**: 100% offline local heuristics by default, with optional client-side OpenAI and Google Gemini API integration.

---

## Workspace Capabilities

### 1. Light Mode Executive Design
- **SaaS Corporate Aesthetic:** Styled after modern developer platforms (Vercel / Linear light mode).
- **Palette:** Soft light grey background (`#F8FAFC`), crisp white cards (`#FFFFFF`), smooth 1px borders (`#E2E8F0`), and 12px rounded corners with ambient drop shadows.
- **Top Tab Pills Navigation:**
  - `Dashboard`: Executive summaries, decision timelines, engagement matrix, and urgency breakdown.
  - `Mentions & Tags`: Personalized direct involvement tracking ("What You Missed Specifically").
  - `Media Gallery`: WhatsApp visual media cards with interactive preview placeholders and image attachment.
  - `Task Review`: Action items review with urgency filters and completion tracking.
- **Zero Distractions:** Zero emojis, zero neon glows, and zero childish tags (`#Lol`, `#Only`, etc.).

### 2. WhatsApp Native Media & Image Preview Engine
- **Media Placeholder Detection:** Whenever WhatsApp chat logs contain placeholders like `<image omitted>`, `<media omitted>`, `<photo omitted>`, `<video omitted>`, or `<document omitted>`, the engine generates first-class interactive media cards.
- **Interactive Visual Preview Cards:** Displays realistic preview artwork, metadata badges (filename, sender, timestamp), and media types.
- **Session Image Upload & Drag-and-Drop:** Users can drop real image files directly into the workspace to render shared mockups and photos alongside their chat data.

### 3. Smart Semantic Date & Temporal Search Logic
- **Fixed Literal Keyword Matching:** When querying terms like `"deadline"`, `"deadlines"`, `"dates"`, `"when"`, or `"schedule"`, the engine uses regex date-parsing logic to detect actual temporal commitments (`"by 5 PM"`, `"this Saturday"`, `"22nd Oct"`, `"tomorrow"`, `"tonight"`), providing a synthesized temporal schedule overview.
- **Conversational Sub-Thread Extraction:** For topic queries (e.g., *"go karting"*, *"venue"*, *"budget"*), the engine extracts:
  - **Initiator:** Who first proposed the topic.
  - **Agreed Parameters:** Dates, times, rates, or locations discussed.
  - **Confirmations & Participants:** Who approved or confirmed participation.
  - **Status:** *Confirmed & Agreed* vs *Proposed / In Review*.
  - **Relevant Excerpts:** Quoted lines with matched keyword highlighting.

### 4. Direct Mentions, Tags & "What You Missed Specifically"
- **Persona Selector:** Select any participant to inspect their personalized catch-up obligations.
- **Direct Questions Asked to You:** Isolates interrogative sentences directed at the selected user.
- **Tasks Assigned to You:** Surfaces deliverables specifically assigned to the user with deadlines.
- **Decisions Waiting on You:** Flags consensus requests or sign-offs soliciting user input.
- **Direct Mentions:** Surfaces all messages where `@user` or their name is tagged.

### 5. Dual-Engine Processing Architecture
- **Default Engine (Local & Offline):** Sub-100ms deterministic regex parsing, sentence tokenization, TextRank scoring, and temporal extraction. 100% offline, zero network requests, zero API costs.
- **Enhanced AI Engine (Optional):** When an **OpenAI** (`gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`) or **Google Gemini** (`gemini-1.5-flash`, `gemini-2.0-flash`) API key is configured in settings:
  - Dispatches requests directly from the user's browser to the provider endpoint.
  - Generates deep contextual summaries and answers complex topic inquiries.
  - Keys are saved exclusively in the browser's local storage.

### 6. Chronological Decision Timeline & Engagement Matrix
- **Decision Timeline:** Maps key consensus milestones chronologically over the duration of the conversation with timestamps, champions, and impact ratings.
- **Engagement Matrix:** Quantitative table analyzing team contributions:
  - Participant name & monogram
  - Primary role tag (*Decision Driver*, *Task Lead*, *Facilitator*, *Contributor*)
  - Message volume and percentage share progress bar
  - Count of assigned deliverables and driven decisions
  - Composite Activity Score

### 7. Multi-Format Executive Exports
- **Markdown Summary:** Copies and downloads formatted Markdown reports.
- **JSON Export:** Downloads complete structured analysis datasets (`.json`).
- **Formatted PDF Report:** Triggers print dialog with custom `@media print` rules for clean, paginated PDF reports.

---

## File Structure

```
├── index.html       # Semantic HTML5 light mode workspace layout with tab navigation
├── styles.css       # Light mode SaaS stylesheet (Vercel/Linear inspired, 12px corners)
├── app.js           # Workspace controller, tab router, media processing, semantic search
├── analyzer.js      # Semantic temporal logic, sub-thread extraction, mentions tracking
├── aiEngine.js      # Client-side OpenAI & Google Gemini API service
├── parser.js        # WhatsApp native parser (iOS brackets & Android dash, media detector)
├── samples.js       # Pre-loaded WhatsApp sample transcripts with media placeholders
├── PROMPTS.md       # Complete development history, prompts, constraints, and notes
└── README.md        # Technical workspace documentation
```

---

## Quickstart

Double-click `index.html` or open it directly in any modern browser (Chrome, Edge, Firefox, Brave, Safari). No installation or build steps required.
