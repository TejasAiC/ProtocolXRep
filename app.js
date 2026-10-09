/**
 * What Did I Miss? — Executive Workspace Application Controller v3.0
 * Multi-Theme (Light/Dark), 4-Tab Navigation (Dashboard, Deadlines & Events, Profile, Settings)
 * Activity Bar Chart, Deadlines Table, Action Item Matrix, Media Cards
 * WhatsApp .txt Import, Semantic Topic & Temporal Search
 */

(function () {
  'use strict';

  // ── Module Instances ─────────────────────────────────────────────────────
  const parser   = new ChatParser();
  const analyzer = new ChatAnalyzer();
  const aiEngine = new AIEngine();

  // ── Application State ────────────────────────────────────────────────────
  const state = {
    rawText:         '',
    parsedMessages:  [],
    analysisResult:  null,
    activeTab:       'dashboard',
    selectedPersona: '',
    uploadedImages:  [],     // { id, dataUrl, name } — user-attached real images
    completedTasks:  new Set(),
    activeTopicQuery: '',
    theme:           localStorage.getItem('wdim_theme') || 'light'
  };

  // ── DOM References ───────────────────────────────────────────────────────
  const el = {
    // Ingestion
    chatInput:            document.getElementById('chatInput'),
    charCount:            document.getElementById('charCount'),
    lineCount:            document.getElementById('lineCount'),
    analyzeBtn:           document.getElementById('analyzeBtn'),
    clearBtn:             document.getElementById('clearBtn'),
    importWhatsAppBtn:    document.getElementById('importWhatsAppBtn'),
    whatsappFileInput:    document.getElementById('whatsappFileInput'),

    // Tabs
    tabPills: document.querySelectorAll('.tab-pill[data-tab]'),
    tabViews: {
      dashboard: document.getElementById('tabDashboard'),
      deadlines: document.getElementById('tabDeadlines'),
      profile:   document.getElementById('tabProfile'),
      settings:  document.getElementById('tabSettings')
    },

    // Engine status
    engineIndicatorDot:   document.getElementById('engineIndicatorDot'),
    engineStatusText:     document.getElementById('engineStatusText'),
    engineBadgeTag:       document.getElementById('engineBadgeTag'),

    // Theme toggles
    themeToggleBtn:        document.getElementById('themeToggleBtn'),
    settingsThemeToggleBtn:document.getElementById('settingsThemeToggleBtn'),
    settingsThemeLabel:    document.getElementById('settingsThemeLabel'),

    // Settings
    openSettingsBtn:      document.getElementById('openSettingsBtn'),
    apiProviderSelect:    document.getElementById('apiProviderSelect'),
    apiModelSelect:       document.getElementById('apiModelSelect'),
    apiKeyInput:          document.getElementById('apiKeyInput'),
    enableAiCheckbox:     document.getElementById('enableAiCheckbox'),
    saveApiKeyBtn:        document.getElementById('saveApiKeyBtn'),
    clearApiKeyBtn:       document.getElementById('clearApiKeyBtn'),
    resetDataBtn:         document.getElementById('resetDataBtn'),

    // Sample preset buttons
    sampleBtns: document.querySelectorAll('.sample-btn[data-sample]'),

    // Topic Search
    topicSearchInput:         document.getElementById('topicSearchInput'),
    topicInsightBox:          document.getElementById('topicInsightBox'),
    insightQueryLabel:        document.getElementById('insightQueryLabel'),
    subthreadStatusBadge:     document.getElementById('subthreadStatusBadge'),
    subthreadMetaBar:         document.getElementById('subthreadMetaBar'),
    subthreadInitiator:       document.getElementById('subthreadInitiator'),
    subthreadParams:          document.getElementById('subthreadParams'),
    subthreadConfirmations:   document.getElementById('subthreadConfirmations'),
    insightSummaryText:       document.getElementById('insightSummaryText'),
    insightDeadlinesBar:      document.getElementById('insightDeadlinesBar'),
    insightDeadlinesTags:     document.getElementById('insightDeadlinesTags'),
    insightExcerptsContainer: document.getElementById('insightExcerptsContainer'),
    clearSearchTopicBtn:      document.getElementById('clearSearchTopicBtn'),

    // Dashboard — Stats
    statMessages:     document.getElementById('statMessages'),
    statParticipants: document.getElementById('statParticipants'),
    statActions:      document.getElementById('statActions'),
    statDecisions:    document.getElementById('statDecisions'),
    statUrgent:       document.getElementById('statUrgent'),

    // Dashboard — Activity Chart
    activityChartArea:  document.getElementById('activityChartArea'),
    chartEmptyState:    document.getElementById('chartEmptyState'),
    chartXLabels:       document.getElementById('chartXLabels'),

    // Dashboard — Executive Summary
    summarySentence1: document.getElementById('summarySentence1'),
    summarySentence2: document.getElementById('summarySentence2'),
    summarySentence3: document.getElementById('summarySentence3'),
    summaryTldr:      document.getElementById('summaryTldr'),
    summaryTopics:    document.getElementById('summaryTopics'),
    copySummaryBtn:   document.getElementById('copySummaryBtn'),

    // Dashboard — Action Items
    actionItemsList:  document.getElementById('actionItemsList'),
    actionTaskCount:  document.getElementById('actionTaskCount'),
    copyActionsBtn:   document.getElementById('copyActionsBtn'),

    // Dashboard — Decisions
    decisionsList:    document.getElementById('decisionsList'),
    decisionsCount:   document.getElementById('decisionsCount'),
    copyDecisionsBtn: document.getElementById('copyDecisionsBtn'),

    // Dashboard — Timeline
    timelineTrack:    document.getElementById('timelineTrack'),
    timelineCountTag: document.getElementById('timelineCountTag'),

    // Dashboard — Matrix
    matrixTableBody:  document.getElementById('matrixTableBody'),

    // Dashboard — Urgency
    highUrgencyCards: document.getElementById('highUrgencyCards'),
    medUrgencyCards:  document.getElementById('medUrgencyCards'),
    lowUrgencyCards:  document.getElementById('lowUrgencyCards'),
    highCountBadge:   document.getElementById('highCountBadge'),
    medCountBadge:    document.getElementById('medCountBadge'),
    lowCountBadge:    document.getElementById('lowCountBadge'),

    // Dashboard — Export
    exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),
    exportJsonBtn:     document.getElementById('exportJsonBtn'),
    exportPdfBtn:      document.getElementById('exportPdfBtn'),

    // Deadlines & Events Tab
    deadlinesTableBody:     document.getElementById('deadlinesTableBody'),
    deadlinesEventCount:    document.getElementById('deadlinesEventCount'),
    deadlinesTimelineTrack: document.getElementById('deadlinesTimelineTrack'),
    deadlineTabBadge:       document.getElementById('deadlineTabBadge'),
    copyDeadlinesBtn:       document.getElementById('copyDeadlinesBtn'),

    // Profile Tab — Mentions
    userPersonaSelect:     document.getElementById('userPersonaSelect'),
    userPersonaStats:      document.getElementById('userPersonaStats'),
    missedQuestionsList:   document.getElementById('missedQuestionsList'),
    missedQuestionsCount:  document.getElementById('missedQuestionsCount'),
    missedTasksList:       document.getElementById('missedTasksList'),
    missedTasksCount:      document.getElementById('missedTasksCount'),
    missedDecisionsList:   document.getElementById('missedDecisionsList'),
    missedDecisionsCount:  document.getElementById('missedDecisionsCount'),
    missedMentionsList:    document.getElementById('missedMentionsList'),

    // Profile Tab — Media Gallery
    mediaDropzone:    document.getElementById('mediaDropzone'),
    mediaUploadInput: document.getElementById('mediaUploadInput'),
    mediaGrid:        document.getElementById('mediaGrid'),
    mediaTotalCount:  document.getElementById('mediaTotalCount'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // ════════════════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ════════════════════════════════════════════════════════════════════════
  function init() {
    applyTheme(state.theme, false);
    setupThemeToggle();
    setupTabNavigation();
    setupInputListeners();
    setupSampleButtons();
    setupTopicSearch();
    setupMediaDropzone();
    setupExportActions();
    setupApiSettings();
    updateEngineStatusDisplay();

    // Load default WhatsApp iOS preset on startup
    loadSample('whatsapp_retreat', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  THEME SYSTEM
  // ════════════════════════════════════════════════════════════════════════
  function applyTheme(theme, save = true) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (save) localStorage.setItem('wdim_theme', theme);

    // Update Settings tab label
    if (el.settingsThemeLabel) {
      el.settingsThemeLabel.textContent = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  function toggleTheme() {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`);
  }

  function setupThemeToggle() {
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (el.settingsThemeToggleBtn) {
      el.settingsThemeToggleBtn.addEventListener('click', toggleTheme);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TAB NAVIGATION
  // ════════════════════════════════════════════════════════════════════════
  function setupTabNavigation() {
    el.tabPills.forEach(pill => {
      pill.addEventListener('click', () => switchTab(pill.getAttribute('data-tab')));
    });
  }

  function switchTab(tabKey) {
    state.activeTab = tabKey;

    el.tabPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-tab') === tabKey));

    Object.keys(el.tabViews).forEach(key => {
      if (el.tabViews[key]) el.tabViews[key].classList.toggle('active', key === tabKey);
    });

    // Refresh tab-specific content when switching
    if (state.analysisResult) {
      if (tabKey === 'profile')   renderProfileTab();
      if (tabKey === 'deadlines') renderDeadlinesTab();
    }

    // Navigate to settings tab if settings button clicked in header
    if (tabKey === 'settings') loadApiSettingsFromStorage();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INPUT & INGESTION
  // ════════════════════════════════════════════════════════════════════════
  function setupInputListeners() {
    el.chatInput.addEventListener('input', updateInputStats);

    el.clearBtn.addEventListener('click', () => {
      el.chatInput.value = '';
      updateInputStats();
      el.topicInsightBox.classList.remove('active');
      el.topicSearchInput.value = '';
      showToast('Transcript cleared');
    });

    el.analyzeBtn.addEventListener('click', runAnalysis);

    // WhatsApp File Upload
    if (el.importWhatsAppBtn && el.whatsappFileInput) {
      el.importWhatsAppBtn.addEventListener('click', () => el.whatsappFileInput.click());

      el.whatsappFileInput.addEventListener('change', e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
          el.chatInput.value = event.target.result;
          updateInputStats();
          showToast(`Imported: ${file.name}`);
          runAnalysis();
        };
        reader.onerror = () => showToast('Failed to read transcript file.');
        reader.readAsText(file, 'UTF-8');
        el.whatsappFileInput.value = '';
      });
    }

    // Drag-and-drop on Textarea
    el.chatInput.addEventListener('dragover', e => {
      e.preventDefault();
      el.chatInput.style.borderColor = 'var(--border-focus)';
    });
    el.chatInput.addEventListener('dragleave', () => {
      el.chatInput.style.borderColor = '';
    });
    el.chatInput.addEventListener('drop', e => {
      e.preventDefault();
      el.chatInput.style.borderColor = '';
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          el.chatInput.value = event.target.result;
          updateInputStats();
          showToast(`Loaded: ${file.name}`);
          runAnalysis();
        };
        reader.readAsText(file, 'UTF-8');
      }
    });
  }

  function updateInputStats() {
    const text = el.chatInput.value;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    el.charCount.textContent = `${chars.toLocaleString()} characters`;
    el.lineCount.textContent = `${lines.toLocaleString()} lines`;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SAMPLE PRESET BUTTONS
  // ════════════════════════════════════════════════════════════════════════
  function setupSampleButtons() {
    el.sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.sampleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadSample(btn.getAttribute('data-sample'), true);
      });
    });
  }

  function loadSample(key, autoAnalyze) {
    if (typeof SAMPLE_CHATS === 'undefined') return;
    const sample = SAMPLE_CHATS[key];
    if (!sample) return;

    el.chatInput.value = typeof sample === 'string' ? sample : (sample.text || '');
    updateInputStats();
    if (autoAnalyze) {
      showToast(`Loaded preset: ${key}`);
      runAnalysis();
    } else {
      runAnalysis();
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MAIN ANALYSIS PIPELINE
  // ════════════════════════════════════════════════════════════════════════
  async function runAnalysis() {
    const rawText = el.chatInput.value.trim();
    if (!rawText) {
      showToast('Paste a WhatsApp transcript or load a sample first.');
      return;
    }

    state.rawText = rawText;
    el.analyzeBtn.disabled = true;
    el.analyzeBtn.textContent = 'Analyzing...';

    try {
      // Parse messages
      const messages = parser.parse(rawText);
      state.parsedMessages = messages;

      if (!messages || messages.length === 0) {
        showToast('No valid WhatsApp messages detected. Check the format.');
        return;
      }

      // Run local heuristic analysis
      let result = analyzer.analyze(messages);

      // If AI Engine is enabled, enhance
      if (aiEngine.isEnabled()) {
        try {
          result = await aiEngine.enhance(rawText, result);
        } catch (e) {
          console.warn('AI enhancement failed, using local result:', e.message);
        }
      }

      state.analysisResult = result;

      // Render all dashboard components
      renderAllDashboard(result);
      renderActivityBarChart(result.activityChartData);

      // Populate deadlines tab badge
      const evtCount = (result.scheduledEvents || []).length;
      if (el.deadlineTabBadge) {
        el.deadlineTabBadge.textContent = evtCount;
        el.deadlineTabBadge.style.display = evtCount > 0 ? 'inline-flex' : 'none';
      }

      // If current tab is not dashboard, update accordingly
      if (state.activeTab === 'deadlines') renderDeadlinesTab();
      if (state.activeTab === 'profile')   renderProfileTab();

      showToast(`Analyzed ${messages.length} messages from ${result.stats.totalParticipants} participants`);

    } catch (err) {
      console.error('Analysis error:', err);
      showToast('Analysis encountered an error. Check console for details.');
    } finally {
      el.analyzeBtn.disabled = false;
      el.analyzeBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        Analyze &amp; Summarize`;
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DASHBOARD RENDERING
  // ════════════════════════════════════════════════════════════════════════
  function renderAllDashboard(result) {
    renderStats(result.stats);
    renderExecutiveSummary(result.executiveSummary);
    renderActionItems(result.actionItems);
    renderDecisions(result.decisions);
    renderTimeline(result.timeline);
    renderEngagementMatrix(result.engagementMatrix);
    renderUrgencyBreakdown(result.urgencyBreakdown);
    populatePersonaSelector(result.participants);
  }

  function renderStats(stats) {
    animateCount(el.statMessages,     stats.totalMessages);
    animateCount(el.statParticipants, stats.totalParticipants);
    animateCount(el.statActions,      stats.totalActions);
    animateCount(el.statDecisions,    stats.totalDecisions);
    animateCount(el.statUrgent,       stats.upcomingDeadlinesCount || 0);
  }

  function animateCount(element, targetVal) {
    if (!element) return;
    const start = parseInt(element.textContent) || 0;
    const dur = 600;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(start + (targetVal - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderExecutiveSummary(summary) {
    if (!summary) return;
    el.summarySentence1.textContent = summary.sentence1 || '';
    el.summarySentence2.textContent = summary.sentence2 || '';
    el.summarySentence3.textContent = summary.sentence3 || '';

    const tldr = summary.tldr || '';
    el.summaryTldr.innerHTML = `<strong>TL;DR:</strong> ${esc(tldr)}`;

    el.summaryTopics.innerHTML = (summary.topics || [])
      .map(t => `<span class="topic-tag">${esc(t)}</span>`)
      .join('');
  }

  function renderActionItems(items) {
    if (!el.actionItemsList) return;
    el.actionTaskCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
      el.actionItemsList.innerHTML = '<div class="empty-state">No action items detected in this transcript.</div>';
      return;
    }

    el.actionItemsList.innerHTML = items.map(item => {
      const done = state.completedTasks.has(item.id);
      const urgencyClass = item.urgency === 'high' ? 'high' : item.urgency === 'medium' ? 'medium' : 'low';
      const urgencyLabel = item.urgency === 'high' ? 'High' : item.urgency === 'medium' ? 'Medium' : 'Info';
      return `
        <div class="action-item-row${done ? ' completed' : ''}" data-id="${item.id}">
          <input type="checkbox" class="action-checkbox" ${done ? 'checked' : ''} data-task-id="${item.id}" />
          <div class="action-content">
            <div class="action-text">${esc(item.text)}</div>
            <div class="action-meta">
              <span class="action-assignee">${svgIcon('user')} ${esc(item.assignee)}</span>
              ${item.hasDeadline ? `<span class="action-deadline">${svgIcon('clock')} ${esc(item.deadline)}</span>` : ''}
              <span class="priority-badge ${urgencyClass}">${urgencyLabel}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    // Checkbox listeners
    el.actionItemsList.querySelectorAll('.action-checkbox').forEach(cb => {
      cb.addEventListener('change', e => {
        const id = parseInt(e.target.getAttribute('data-task-id'));
        if (e.target.checked) state.completedTasks.add(id);
        else state.completedTasks.delete(id);
        const row = e.target.closest('.action-item-row');
        if (row) row.classList.toggle('completed', e.target.checked);
      });
    });
  }

  function renderDecisions(decisions) {
    if (!el.decisionsList) return;
    el.decisionsCount.textContent = `${decisions.length} decision${decisions.length !== 1 ? 's' : ''}`;

    if (decisions.length === 0) {
      el.decisionsList.innerHTML = '<div class="empty-state">No key decisions detected.</div>';
      return;
    }

    el.decisionsList.innerHTML = decisions.map(dec => `
      <div class="decision-card">
        <div class="decision-text">${esc(dec.decision)}</div>
        <div class="decision-meta">
          <span class="decision-champion">${svgIcon('user')} ${esc(dec.champion)}</span>
          <span style="color:var(--text-dim); font-size:0.68rem;">${esc(dec.time)}</span>
          <span class="impact-badge">${esc(dec.impact)}</span>
        </div>
      </div>`).join('');
  }

  function renderTimeline(timeline) {
    if (!el.timelineTrack) return;
    el.timelineCountTag.textContent = `${timeline.length} Milestone${timeline.length !== 1 ? 's' : ''}`;

    if (timeline.length === 0) {
      el.timelineTrack.innerHTML = '<div class="empty-state">No timeline milestones identified.</div>';
      return;
    }

    el.timelineTrack.innerHTML = timeline.map(node => `
      <div class="timeline-node">
        <div class="timeline-dot">${node.sequence}</div>
        <div class="timeline-content">
          <div class="timeline-phase">${esc(node.phase)}</div>
          <div class="timeline-decision-text">${esc(node.decision)}</div>
          <div class="timeline-champion">${esc(node.champion)}</div>
          <div class="timeline-time">${esc(node.time)}</div>
        </div>
      </div>`).join('');
  }

  function renderEngagementMatrix(matrix) {
    if (!el.matrixTableBody) return;

    if (!matrix || matrix.length === 0) {
      el.matrixTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No participant data available.</td></tr>';
      return;
    }

    const maxScore = Math.max(...matrix.map(m => m.engagementScore), 1);

    el.matrixTableBody.innerHTML = matrix.map(p => {
      const barPct = Math.round((p.engagementScore / maxScore) * 100);
      const monoStyle = `background:${p.monogramColor || '#7C3AED'};`;
      return `
        <tr>
          <td>
            <div class="participant-cell">
              <span class="participant-monogram" style="${monoStyle}">${esc(p.initials)}</span>
              <span class="participant-name">${esc(p.name)}</span>
            </div>
          </td>
          <td><span class="role-badge">${esc(p.primaryRole)}</span></td>
          <td>${p.messageCount} <span style="color:var(--text-dim); font-size:0.7rem;">(${p.sharePercentage}%)</span></td>
          <td>${p.assignedActionCount}</td>
          <td>${p.decisionsDrivenCount}</td>
          <td>
            <div class="score-bar">
              <div class="score-bar-track">
                <div class="score-bar-fill" style="width:${barPct}%;"></div>
              </div>
              <span class="score-val">${p.engagementScore}</span>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function renderUrgencyBreakdown(breakdown) {
    if (!breakdown) return;
    renderUrgencyCards(el.highUrgencyCards, breakdown.high, el.highCountBadge);
    renderUrgencyCards(el.medUrgencyCards,  breakdown.medium, el.medCountBadge);
    renderUrgencyCards(el.lowUrgencyCards,  breakdown.low, el.lowCountBadge);
  }

  function renderUrgencyCards(container, items, badge) {
    if (!container) return;
    if (badge) badge.textContent = items.length;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state">None identified.</div>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="urgency-card">
        <div class="urgency-card-title">${esc(item.title)}</div>
        <div class="urgency-card-detail">${esc(item.detail)}</div>
      </div>`).join('');
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ACTIVITY BAR CHART
  // ════════════════════════════════════════════════════════════════════════
  function renderActivityBarChart(chartData) {
    if (!el.activityChartArea) return;

    if (!chartData || chartData.length === 0) {
      el.activityChartArea.innerHTML = '<div class="chart-empty">Analyze a transcript to render activity chart</div>';
      if (el.chartXLabels) el.chartXLabels.innerHTML = '';
      return;
    }

    const maxCount = Math.max(...chartData.map(b => b.count), 1);

    // Build bars inside chart area
    const barsHtml = `
      <div class="chart-gridlines">
        <div class="chart-gridline"></div>
        <div class="chart-gridline"></div>
        <div class="chart-gridline"></div>
        <div class="chart-gridline"></div>
      </div>
      <div class="chart-bars-container" id="chartBarsInner">
        ${chartData.map((bucket, i) => {
          const heightPct = Math.max(Math.round((bucket.count / maxCount) * 100), 2);
          const hasDeadline = bucket.deadlineCount > 0;
          const tooltipText = `${bucket.label}: ${bucket.count} msg${bucket.count !== 1 ? 's' : ''}${hasDeadline ? ` | ${bucket.deadlineCount} deadline${bucket.deadlineCount !== 1 ? 's' : ''}` : ''}`;
          return `
            <div class="chart-bar-group">
              <div class="chart-tooltip">${esc(tooltipText)}</div>
              <div class="chart-bar${hasDeadline ? ' has-deadline' : ''}" style="height:${heightPct}%;"></div>
            </div>`;
        }).join('')}
      </div>`;

    el.activityChartArea.innerHTML = barsHtml;
    if (el.chartEmptyState) el.chartEmptyState.remove();

    // X-axis labels
    if (el.chartXLabels) {
      el.chartXLabels.innerHTML = chartData.map(bucket => `
        <div style="flex:1; text-align:center; font-size:0.58rem; color:var(--text-dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${esc(bucket.label)}
        </div>`).join('');
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DEADLINES & EVENTS TAB
  // ════════════════════════════════════════════════════════════════════════
  function renderDeadlinesTab() {
    const result = state.analysisResult;
    if (!result) return;

    const events = result.scheduledEvents || [];
    if (el.deadlinesEventCount) el.deadlinesEventCount.textContent = `${events.length} item${events.length !== 1 ? 's' : ''}`;

    if (!el.deadlinesTableBody) return;

    if (events.length === 0) {
      el.deadlinesTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No deadlines or scheduled events detected.</td></tr>';
    } else {
      el.deadlinesTableBody.innerHTML = events.map(evt => {
        const typeClass = evt.type === 'event' ? 'event' : evt.type === 'meeting' ? 'meeting' : 'deadline';
        const typeLabel = evt.type || 'Deadline';
        const statusClass = (evt.status || '').toLowerCase().includes('confirm') ? 'confirmed' :
                            (evt.status || '').toLowerCase().includes('pending') ? 'pending' : 'proposed';
        return `
          <tr>
            <td><span class="event-type-badge ${typeClass}">${esc(typeLabel)}</span></td>
            <td style="font-weight:500; color:var(--text-primary);">${esc(evt.plan || evt.event || evt.description || '—')}</td>
            <td style="font-size:0.78rem; color:var(--status-rose); font-weight:600;">${esc(evt.date || evt.detectedDate || '—')} ${evt.time ? '@ ' + esc(evt.time) : ''}</td>
            <td style="color:var(--accent-violet); font-size:0.78rem;">${esc(evt.proposer || evt.author || '—')}</td>
            <td><span class="event-status-badge ${statusClass}">${esc(evt.status || 'Proposed')}</span></td>
          </tr>`;
      }).join('');
    }

    // Deadlines timeline (reuse timeline data)
    if (el.deadlinesTimelineTrack) {
      const timeline = result.timeline || [];
      if (timeline.length === 0) {
        el.deadlinesTimelineTrack.innerHTML = '<div class="empty-state">No milestones to display.</div>';
      } else {
        el.deadlinesTimelineTrack.innerHTML = timeline.slice(0, 8).map(node => `
          <div class="timeline-node">
            <div class="timeline-dot">${node.sequence}</div>
            <div class="timeline-content">
              <div class="timeline-phase">${esc(node.phase)}</div>
              <div class="timeline-decision-text">${esc(node.decision)}</div>
              <div class="timeline-champion">${esc(node.champion)}</div>
              <div class="timeline-time">${esc(node.time)}</div>
            </div>
          </div>`).join('');
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PROFILE TAB (Mentions & Tags + Media)
  // ════════════════════════════════════════════════════════════════════════
  function populatePersonaSelector(participants) {
    if (!el.userPersonaSelect || !participants) return;
    const options = participants.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('');
    el.userPersonaSelect.innerHTML = `<option value="">Select participant...</option>${options}`;

    el.userPersonaSelect.addEventListener('change', () => {
      state.selectedPersona = el.userPersonaSelect.value;
      renderProfileTab();
    });
  }

  function renderProfileTab() {
    const result = state.analysisResult;
    if (!result) return;

    const persona = state.selectedPersona || el.userPersonaSelect.value;
    if (!persona) {
      clearMissedPanels();
      renderMediaGallery();
      return;
    }

    const missed = analyzer.extractWhatYouMissed(
      state.parsedMessages,
      persona,
      result.actionItems,
      result.decisions
    );

    // Stats line
    if (el.userPersonaStats) {
      el.userPersonaStats.textContent =
        `${missed.directMentions.length} mention${missed.directMentions.length !== 1 ? 's' : ''} • ${missed.questions.length} question${missed.questions.length !== 1 ? 's' : ''} • ${missed.tasks.length} task${missed.tasks.length !== 1 ? 's' : ''}`;
    }

    // Direct Questions
    renderMissedList(el.missedQuestionsList, el.missedQuestionsCount,
      missed.questions.map(q => ({ author: q.author, time: q.time, text: q.question })));

    // Assigned Tasks
    renderMissedList(el.missedTasksList, el.missedTasksCount,
      missed.tasks.map(t => ({ author: t.author || t.assignee, time: t.time, text: t.text })));

    // Decision Requests
    renderMissedList(el.missedDecisionsList, el.missedDecisionsCount,
      missed.decisionRequests.map(d => ({ author: d.author, time: d.time, text: d.request })));

    // All Direct Mentions
    if (el.missedMentionsList) {
      if (missed.directMentions.length === 0) {
        el.missedMentionsList.innerHTML = '<div class="empty-state">No direct mentions found for this participant.</div>';
      } else {
        el.missedMentionsList.innerHTML = missed.directMentions.map(m => `
          <div class="missed-item-card">
            <div class="missed-item-author">${esc(m.author)} <span style="color:var(--text-dim); font-weight:400;">• ${esc(m.time)}</span></div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">${esc(m.text)}</div>
          </div>`).join('');
      }
    }

    renderMediaGallery();
  }

  function renderMissedList(container, badge, items) {
    if (!container) return;
    if (badge) badge.textContent = items.length;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state">None found.</div>';
      return;
    }
    container.innerHTML = items.map(item => `
      <div class="missed-item-card" style="margin:0.35rem;">
        <div class="missed-item-author">${esc(item.author || '—')} <span style="color:var(--text-dim); font-weight:400;">• ${esc(item.time || '')}</span></div>
        <div style="font-size:0.8rem; color:var(--text-secondary);">${esc(item.text)}</div>
      </div>`).join('');
  }

  function clearMissedPanels() {
    [el.missedQuestionsList, el.missedTasksList, el.missedDecisionsList, el.missedMentionsList].forEach(c => {
      if (c) c.innerHTML = '<div class="empty-state">Select a participant above to inspect.</div>';
    });
    [el.missedQuestionsCount, el.missedTasksCount, el.missedDecisionsCount].forEach(b => {
      if (b) b.textContent = '0';
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MEDIA GALLERY
  // ════════════════════════════════════════════════════════════════════════
  function setupMediaDropzone() {
    if (!el.mediaDropzone || !el.mediaUploadInput) return;

    el.mediaDropzone.addEventListener('click', () => el.mediaUploadInput.click());

    el.mediaUploadInput.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = ev => {
          state.uploadedImages.push({ id: Date.now() + Math.random(), dataUrl: ev.target.result, name: file.name });
          renderMediaGallery();
        };
        reader.readAsDataURL(file);
      });
      el.mediaUploadInput.value = '';
    });

    el.mediaDropzone.addEventListener('dragover', e => {
      e.preventDefault();
      el.mediaDropzone.style.borderColor = 'var(--accent-violet)';
    });
    el.mediaDropzone.addEventListener('dragleave', () => {
      el.mediaDropzone.style.borderColor = '';
    });
    el.mediaDropzone.addEventListener('drop', e => {
      e.preventDefault();
      el.mediaDropzone.style.borderColor = '';
      const files = Array.from(e.dataTransfer.files || []);
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = ev => {
          state.uploadedImages.push({ id: Date.now() + Math.random(), dataUrl: ev.target.result, name: file.name });
          renderMediaGallery();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function renderMediaGallery() {
    if (!el.mediaGrid) return;

    // Gather WhatsApp <media omitted> placeholders from parsed messages
    const mediaMessages = state.parsedMessages.filter(m => m.isMedia);

    // Combine placeholder cards with user-uploaded real images
    const uploadedIdx = {}; // map index to real image
    state.uploadedImages.forEach((img, i) => { uploadedIdx[i] = img; });

    const totalCount = mediaMessages.length + state.uploadedImages.length;
    if (el.mediaTotalCount) el.mediaTotalCount.textContent = `${totalCount} File${totalCount !== 1 ? 's' : ''}`;

    if (totalCount === 0) {
      el.mediaGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No media detected. WhatsApp &lt;image omitted&gt; tags will appear here.</div>';
      return;
    }

    // Real uploaded images
    const realCards = state.uploadedImages.map((img, i) => `
      <div class="media-card">
        <div class="media-card-preview">
          <img src="${img.dataUrl}" alt="${esc(img.name)}" />
          <span class="media-type-label">Image</span>
        </div>
        <div class="media-card-info">
          <div class="media-card-sender">${esc(img.name)}</div>
          <div class="media-card-time">Attached locally</div>
        </div>
      </div>`).join('');

    // Placeholder cards for omitted media
    const placeholderCards = mediaMessages.map((m, i) => {
      const typeLabel = m.mediaType === 'video' ? 'Video' : m.mediaType === 'audio' ? 'Audio' : m.mediaType === 'document' ? 'Doc' : 'Photo';
      const gradients = [
        'linear-gradient(135deg,#F5F3FF 0%,#EFF6FF 100%)',
        'linear-gradient(135deg,#FFF1F2 0%,#FDF4FF 100%)',
        'linear-gradient(135deg,#ECFDF5 0%,#F0FEFE 100%)',
        'linear-gradient(135deg,#FFFBEB 0%,#FFF7F0 100%)'
      ];
      const grad = gradients[i % gradients.length];
      const mediaIconPath = typeLabel === 'Video'
        ? '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>'
        : typeLabel === 'Audio'
        ? '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>'
        : typeLabel === 'Doc'
        ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>'
        : '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>';

      return `
        <div class="media-card">
          <div class="media-card-preview" style="background:${grad};">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-violet)" stroke-width="1.5">
              ${mediaIconPath}
            </svg>
            <span class="media-type-label">${typeLabel}</span>
          </div>
          <div class="media-card-info">
            <div class="media-card-sender">${esc(m.author)}</div>
            <div class="media-card-time">${esc(m.time || 'Recent')}</div>
          </div>
        </div>`;
    }).join('');

    el.mediaGrid.innerHTML = realCards + placeholderCards;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TOPIC SEARCH (Semantic + Temporal)
  // ════════════════════════════════════════════════════════════════════════
  function setupTopicSearch() {
    if (!el.topicSearchInput) return;

    let debounceTimer;
    el.topicSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = el.topicSearchInput.value.trim();
        if (!query) {
          el.topicInsightBox.classList.remove('active');
          state.activeTopicQuery = '';
          return;
        }
        if (!state.parsedMessages || state.parsedMessages.length === 0) {
          showToast('Analyze a transcript first before searching.');
          return;
        }
        runTopicSearch(query);
      }, 400);
    });

    if (el.clearSearchTopicBtn) {
      el.clearSearchTopicBtn.addEventListener('click', () => {
        el.topicSearchInput.value = '';
        el.topicInsightBox.classList.remove('active');
        state.activeTopicQuery = '';
      });
    }
  }

  function runTopicSearch(query) {
    const result = analyzer.searchTopic(state.parsedMessages, query);
    if (!result) {
      showToast('No results found for that query.');
      return;
    }

    state.activeTopicQuery = query;
    el.insightQueryLabel.textContent = `"${query}"`;
    el.topicInsightBox.classList.add('active');

    // Status badge
    if (result.isTemporal) {
      el.subthreadStatusBadge.textContent = 'Temporal Schedule Overview';
      el.subthreadStatusBadge.style.background = 'var(--status-amber-subtle)';
      el.subthreadStatusBadge.style.color = 'var(--status-amber)';
      el.subthreadMetaBar.style.display = 'none';
    } else {
      el.subthreadStatusBadge.textContent = result.subthread && result.subthread.status ? result.subthread.status : 'Extracted Thread';
      el.subthreadStatusBadge.style.background = '';
      el.subthreadStatusBadge.style.color = '';
      el.subthreadMetaBar.style.display = 'flex';

      if (result.subthread) {
        el.subthreadInitiator.textContent   = result.subthread.initiator || '—';
        el.subthreadParams.textContent      = result.subthread.agreedParameters || '—';
        el.subthreadConfirmations.textContent = result.subthread.confirmations || '—';
      }
    }

    // Summary
    el.insightSummaryText.textContent = result.summary || 'No summary available.';

    // Deadline tags
    const deadlines = result.deadlines || [];
    if (deadlines.length > 0) {
      el.insightDeadlinesBar.style.display = 'flex';
      el.insightDeadlinesTags.innerHTML = deadlines.map(d =>
        `<span class="deadline-chip">${esc(d)}</span>`).join('');
    } else {
      el.insightDeadlinesBar.style.display = 'none';
    }

    // Excerpts
    const excerpts = result.excerpts || [];
    if (excerpts.length === 0) {
      el.insightExcerptsContainer.innerHTML = '<div class="empty-state">No matching message excerpts found.</div>';
    } else {
      el.insightExcerptsContainer.innerHTML = excerpts.map(ex => `
        <div class="excerpt-card">
          <div class="excerpt-meta">${esc(ex.author)} &nbsp;•&nbsp; ${esc(ex.time)}</div>
          <div>${ex.highlightedText || esc(ex.text)}</div>
        </div>`).join('');
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  COPY & EXPORT ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  function setupExportActions() {
    if (el.copySummaryBtn) {
      el.copySummaryBtn.addEventListener('click', () => {
        const s = state.analysisResult && state.analysisResult.executiveSummary;
        if (s) copyText(`${s.sentence1} ${s.sentence2} ${s.sentence3}\n\nTL;DR: ${s.tldr}`);
      });
    }

    if (el.copyActionsBtn) {
      el.copyActionsBtn.addEventListener('click', () => {
        const items = state.analysisResult && state.analysisResult.actionItems || [];
        const md = items.map(i => `- [ ] **${i.assignee}**: ${i.text}${i.hasDeadline ? ` _(due: ${i.deadline})_` : ''}`).join('\n');
        copyText(md || 'No action items.');
      });
    }

    if (el.copyDecisionsBtn) {
      el.copyDecisionsBtn.addEventListener('click', () => {
        const items = state.analysisResult && state.analysisResult.decisions || [];
        const md = items.map(d => `- ${d.decision} _(${d.champion})_`).join('\n');
        copyText(md || 'No decisions.');
      });
    }

    if (el.copyDeadlinesBtn) {
      el.copyDeadlinesBtn.addEventListener('click', () => {
        const events = state.analysisResult && state.analysisResult.scheduledEvents || [];
        const md = events.map(e => `| ${e.type || 'Deadline'} | ${e.plan || e.event || '—'} | ${e.date || '—'} | ${e.proposer || '—'} | ${e.status || '—'} |`).join('\n');
        const header = '| Type | Event | Date | Proposed By | Status |\n|---|---|---|---|---|';
        copyText(events.length ? `${header}\n${md}` : 'No events.');
      });
    }

    if (el.exportMarkdownBtn) {
      el.exportMarkdownBtn.addEventListener('click', () => {
        const r = state.analysisResult;
        if (!r) return showToast('No analysis data to export.');
        const content = buildMarkdownExport(r);
        downloadFile('wdim-report.md', content, 'text/markdown');
      });
    }

    if (el.exportJsonBtn) {
      el.exportJsonBtn.addEventListener('click', () => {
        const r = state.analysisResult;
        if (!r) return showToast('No analysis data to export.');
        downloadFile('wdim-report.json', JSON.stringify(r, null, 2), 'application/json');
      });
    }

    if (el.exportPdfBtn) {
      el.exportPdfBtn.addEventListener('click', () => {
        showToast('Opening print dialog for PDF export...');
        setTimeout(() => window.print(), 300);
      });
    }
  }

  function buildMarkdownExport(r) {
    const now = new Date().toLocaleString();
    const s = r.executiveSummary;
    const lines = [
      `# What Did I Miss? — Executive Report`,
      `*Generated: ${now}*\n`,
      `## Executive Summary`,
      `${s.sentence1}`,
      `${s.sentence2}`,
      `${s.sentence3}`,
      `\n> **TL;DR:** ${s.tldr}\n`,
      `## Statistics`,
      `| Metric | Value |`,
      `|---|---|`,
      `| Messages Parsed | ${r.stats.totalMessages} |`,
      `| Participants | ${r.stats.totalParticipants} |`,
      `| Action Items | ${r.stats.totalActions} |`,
      `| Key Decisions | ${r.stats.totalDecisions} |`,
      `| Upcoming Deadlines | ${r.stats.upcomingDeadlinesCount} |\n`,
      `## Action Items`,
      ...r.actionItems.map(i => `- [ ] **${i.assignee}**: ${i.text}${i.hasDeadline ? ` *(${i.deadline})*` : ''}`),
      `\n## Key Decisions`,
      ...r.decisions.map(d => `- ${d.decision} *(${d.champion})*`),
    ];
    return lines.join('\n');
  }

  // ════════════════════════════════════════════════════════════════════════
  //  API SETTINGS
  // ════════════════════════════════════════════════════════════════════════
  function setupApiSettings() {
    // Navigate to settings tab on header button click
    if (el.openSettingsBtn) {
      el.openSettingsBtn.addEventListener('click', () => switchTab('settings'));
    }

    if (el.saveApiKeyBtn) {
      el.saveApiKeyBtn.addEventListener('click', saveApiSettings);
    }
    if (el.clearApiKeyBtn) {
      el.clearApiKeyBtn.addEventListener('click', () => {
        localStorage.removeItem('wdim_api_key');
        localStorage.removeItem('wdim_api_provider');
        localStorage.removeItem('wdim_ai_enabled');
        if (el.apiKeyInput) el.apiKeyInput.value = '';
        if (el.enableAiCheckbox) el.enableAiCheckbox.checked = false;
        aiEngine.disable();
        updateEngineStatusDisplay();
        showToast('API key cleared.');
      });
    }
    if (el.resetDataBtn) {
      el.resetDataBtn.addEventListener('click', () => {
        state.parsedMessages = [];
        state.analysisResult = null;
        state.completedTasks.clear();
        state.uploadedImages = [];
        if (el.chatInput) { el.chatInput.value = ''; updateInputStats(); }
        if (el.topicInsightBox) el.topicInsightBox.classList.remove('active');
        showToast('Workspace reset.');
      });
    }
    loadApiSettingsFromStorage();
  }

  function saveApiSettings() {
    const provider = el.apiProviderSelect && el.apiProviderSelect.value;
    const model    = el.apiModelSelect && el.apiModelSelect.value;
    const key      = el.apiKeyInput && el.apiKeyInput.value.trim();
    const enabled  = el.enableAiCheckbox && el.enableAiCheckbox.checked;

    if (key) localStorage.setItem('wdim_api_key', key);
    if (provider) localStorage.setItem('wdim_api_provider', provider);
    if (model) localStorage.setItem('wdim_api_model', model);
    localStorage.setItem('wdim_ai_enabled', enabled ? 'true' : 'false');

    if (enabled && key) {
      aiEngine.configure(provider, model, key);
      aiEngine.enable();
    } else {
      aiEngine.disable();
    }
    updateEngineStatusDisplay();
    showToast(enabled && key ? 'AI Engine enabled.' : 'Settings saved (Local Engine active).');
  }

  function loadApiSettingsFromStorage() {
    const key      = localStorage.getItem('wdim_api_key') || '';
    const provider = localStorage.getItem('wdim_api_provider') || 'openai';
    const model    = localStorage.getItem('wdim_api_model') || 'gpt-4o-mini';
    const enabled  = localStorage.getItem('wdim_ai_enabled') === 'true';

    if (el.apiKeyInput && key) el.apiKeyInput.value = key;
    if (el.apiProviderSelect) el.apiProviderSelect.value = provider;
    if (el.apiModelSelect) el.apiModelSelect.value = model;
    if (el.enableAiCheckbox) el.enableAiCheckbox.checked = enabled;

    if (enabled && key) {
      aiEngine.configure(provider, model, key);
      aiEngine.enable();
    }
  }

  function updateEngineStatusDisplay() {
    const isAI = aiEngine.isEnabled();
    if (el.engineIndicatorDot) {
      el.engineIndicatorDot.className = 'indicator-dot ' + (isAI ? 'ai' : 'active');
    }
    if (el.engineStatusText) {
      el.engineStatusText.textContent = isAI ? 'AI Engine (Online)' : 'Local Engine';
    }
    if (el.engineBadgeTag) {
      el.engineBadgeTag.textContent = isAI ? 'GPT / Gemini' : 'Regex / NLP';
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TOAST NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════════════
  function showToast(message, duration = 3000) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  UTILITIES
  // ════════════════════════════════════════════════════════════════════════
  function esc(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard.');
    }).catch(() => {
      showToast('Copy failed. Try selecting text manually.');
    });
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function svgIcon(name) {
    const icons = {
      user:  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      clock: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    };
    return icons[name] || '';
  }

  // ════════════════════════════════════════════════════════════════════════
  //  BOOT
  // ════════════════════════════════════════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
