/**
 * What Did I Miss? - Analytical Heuristic & NLP Intelligence Engine
 * Semantic search engine, conversational sub-thread extraction,
 * temporal/deadline reasoning, direct involvement tracking ("What You Missed"),
 * and executive summarization.
 */

class ChatAnalyzer {
  constructor() {
    this.actionKeywords = [
      'will', 'going to', 'need to', 'needs to', 'have to', 'must', 'should',
      'can you', 'could you', 'please', 'take care of', 'handle', 'fix',
      'deploy', 'prepare', 'send', 'review', 'create', 'update', 'submit',
      'write', 'check', 'push', 'finish', 'complete', 'test', 'schedule',
      'assigned to', 'action item', 'todo', 'task', 'coordinate', 'collect',
      'process', 'distribute', 'execute', 'book'
    ];

    this.decisionKeywords = [
      'decided', 'deciding', 'agreed', 'agree on', 'let us go with', 'lets go with',
      'let us proceed with', 'moving forward with', 'settled on', 'consensus',
      'approved', 'confirmed', 'final call', 'resolution', 'we will use',
      'concluded', 'picked', 'selected', 'plan is to', 'direction is'
    ];

    this.highUrgencyTerms = [
      'asap', 'urgent', 'urgently', 'critical', 'emergency', 'blocker', 'blocking',
      'production', 'broken', 'immediately', 'p0', 'p1', 'sev 1', 'sev-1',
      'deadline today', 'tonight', 'eod today', 'by eod', 'by cob', 'breaking',
      'fatal', 'hotfix', 'disruption'
    ];

    this.mediumUrgencyTerms = [
      'tomorrow', 'soon', 'review', 'follow up', 'reminder', 'pending',
      'next step', 'waiting on', 'feedback', 'qa', 'testing', 'this week',
      'by friday', 'draft', 'check in', 'sync', 'rehearsal', 'milestone'
    ];

    // Temporal patterns for explicit deadlines, dates, and times
    this.deadlinePatterns = [
      /\b(?:by|before|at|until)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))\b/i,
      /\b(?:by|before|until|due)\s+(today|tonight|tomorrow(?:\s+(?:morning|afternoon|evening|night|eod|cob))?|eod|cob|end of day)\b/i,
      /\b(by\s+eod|by\s+cob|tonight|by\s+tomorrow|by\s+end of day)\b/i,
      /\b(?:by|before|until|on|scheduled for)\s+((?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:morning|afternoon|evening|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?)\b/i,
      /\b(?:in|within)\s+(\d+\s+(?:hours?|hrs?|days?|mins?|minutes?))\b/i,
      /\b(?:by|before|on|due)\s+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?)\b/i
    ];

    // Temporal query intent triggers (when user searches for dates/timing rather than literal words)
    this.temporalIntents = [
      'deadline', 'deadlines', 'date', 'dates', 'when', 'time', 'timing',
      'schedule', 'due', 'calendar', 'cutoff', 'when is', 'what time', 'milestone', 'milestones'
    ];
  }

  /**
   * Run full analytics pipeline.
   */
  analyze(messages) {
    if (!messages || messages.length === 0) {
      return this.emptyResult();
    }

    const participants = this.extractParticipants(messages);
    const actionItems = this.extractActionItems(messages, participants);
    const decisions = this.extractDecisions(messages, participants);
    const timeline = this.generateDecisionTimeline(messages, decisions);
    const engagementMatrix = this.generateEngagementMatrix(messages, participants, actionItems, decisions);
    const urgencyBreakdown = this.extractUrgencyBreakdown(messages, actionItems, decisions);
    const executiveSummary = this.generateExecutiveSummary(messages, participants, decisions, actionItems);
    const topics = this.extractTopTopics(messages);
    const activityChartData = this.generateActivityChartData(messages);
    const scheduledEvents = this.extractDeadlinesAndEvents(messages);

    return {
      stats: {
        totalMessages: messages.length,
        totalParticipants: participants.length,
        totalActions: actionItems.length,
        totalDecisions: decisions.length,
        upcomingDeadlinesCount: scheduledEvents.length,
        highUrgencyCount: urgencyBreakdown.high.length,
        mediumUrgencyCount: urgencyBreakdown.medium.length,
        lowUrgencyCount: urgencyBreakdown.low.length
      },
      executiveSummary,
      actionItems,
      decisions,
      timeline,
      engagementMatrix,
      urgencyBreakdown,
      participants,
      topics,
      activityChartData,
      scheduledEvents
    };
  }

  emptyResult() {
    return {
      stats: {
        totalMessages: 0,
        totalParticipants: 0,
        totalActions: 0,
        totalDecisions: 0,
        upcomingDeadlinesCount: 0,
        highUrgencyCount: 0,
        mediumUrgencyCount: 0,
        lowUrgencyCount: 0
      },
      executiveSummary: {
        sentence1: "No transcript records available for analytical processing.",
        sentence2: "Please load a sample WhatsApp transcript or import a file above.",
        sentence3: "The local processing engine will generate executive deliverables upon ingestion.",
        tldr: "No active record loaded.",
        topics: []
      },
      actionItems: [],
      decisions: [],
      timeline: [],
      engagementMatrix: [],
      urgencyBreakdown: { high: [], medium: [], low: [] },
      participants: [],
      topics: [],
      activityChartData: [],
      scheduledEvents: []
    };
  }

  /**
   * Message Activity Bar Chart Data Generation
   * Aggregates conversation progression into chronological intervals with message density & deadline counts.
   */
  generateActivityChartData(messages) {
    if (!messages || messages.length === 0) return [];
    
    const numBuckets = Math.min(8, Math.max(5, Math.ceil(messages.length / 3)));
    const bucketSize = Math.max(1, Math.ceil(messages.length / numBuckets));
    const buckets = [];

    for (let i = 0; i < messages.length; i += bucketSize) {
      const slice = messages.slice(i, i + bucketSize);
      const startMsg = slice[0];
      const endMsg = slice[slice.length - 1];
      
      const label = startMsg.time && startMsg.time !== 'Recent' 
        ? startMsg.time.replace(/:\d{2}(?=\s|$)/, '')
        : `Step ${Math.floor(i / bucketSize) + 1}`;

      let deadlineCount = 0;
      slice.forEach(m => {
        if (this.detectDeadline(m.text)) deadlineCount++;
      });

      buckets.push({
        label: label,
        timeSpan: `${startMsg.time || ''} - ${endMsg.time || ''}`,
        messageCount: slice.length,
        deadlineCount: deadlineCount,
        leadSpeaker: startMsg.author
      });
    }

    const maxMsgs = Math.max(...buckets.map(b => b.messageCount), 1);
    buckets.forEach(b => {
      b.percentage = Math.round((b.messageCount / maxMsgs) * 100);
      b.heightRatio = Math.max(18, b.percentage);
    });

    return buckets;
  }

  /**
   * Deadlines & Scheduled Events Card Extraction
   * Structures detected dates, event plans (outings, meetups, submissions), and target times.
   */
  extractDeadlinesAndEvents(messages) {
    const events = [];
    const seen = new Set();
    let id = 1;

    messages.forEach(msg => {
      const deadline = this.detectDeadline(msg.text);
      if (deadline) {
        let eventName = "Scheduled Event";
        const lower = msg.text.toLowerCase();

        if (lower.includes('karting') || lower.includes('go kart')) eventName = "Go Karting Activity";
        else if (lower.includes('cabin') || lower.includes('pine valley') || lower.includes('venue')) eventName = "Pine Valley Venue Booking";
        else if (lower.includes('deposit') || lower.includes('venmo') || lower.includes('payment')) eventName = "Deposit & Payment Cutoff";
        else if (lower.includes('figma') || lower.includes('design') || lower.includes('tokens')) eventName = "Figma Design Tokens Delivery";
        else if (lower.includes('demo') || lower.includes('rehearsal') || lower.includes('dry run')) eventName = "Demo Rehearsal & Dry Run";
        else if (lower.includes('hotfix') || lower.includes('deploy') || lower.includes('patch')) eventName = "Production Hotfix Deployment";
        else if (lower.includes('transport') || lower.includes('drive') || lower.includes('carpool')) eventName = "Charter Departure Logistics";
        else if (lower.includes('agenda') || lower.includes('presentation')) eventName = "Presentation Agenda Distribution";
        else if (lower.includes('headcount') || lower.includes('confirm')) eventName = "Headcount Confirmation Due";
        else if (lower.includes('benchmark') || lower.includes('latency') || lower.includes('load')) eventName = "API Benchmark Verification";
        else {
          const words = msg.text.split(/\s+/).slice(0, 4).join(' ');
          eventName = words.replace(/[-*•:]/g, '').trim();
        }

        const timeMatch = msg.text.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\b/);
        const targetTime = timeMatch ? timeMatch[0] : (deadline.includes('PM') || deadline.includes('AM') ? deadline : 'By End of Day');

        let targetDate = deadline;
        const dayMatch = msg.text.match(/\b(?:today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
        if (dayMatch) targetDate = dayMatch[0].charAt(0).toUpperCase() + dayMatch[0].slice(1).toLowerCase();

        const dedupKey = `${eventName}_${deadline}`.toLowerCase();
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          
          let status = 'Scheduled';
          if (lower.includes('tonight') || lower.includes('today') || lower.includes('asap') || lower.includes('critical')) {
            status = 'Immediate Priority';
          } else if (lower.includes('decided') || lower.includes('agreed') || lower.includes('confirmed')) {
            status = 'Confirmed Plan';
          }

          events.push({
            id: id++,
            event: eventName,
            date: targetDate,
            targetTime: targetTime,
            deadlinePhrase: deadline,
            proposer: msg.author,
            status: status,
            quote: msg.text
          });
        }
      }
    });

    return events;
  }

  /**
   * Participant Extraction
   */
  extractParticipants(messages) {
    const counts = {};
    messages.forEach(msg => {
      const author = msg.author.trim();
      if (author && author.toLowerCase() !== 'participant') {
        counts[author] = (counts[author] || 0) + 1;
      }
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / messages.length) * 100),
      initials: this.getInitials(name),
      monogramColor: this.generateMonogramColor(name)
    }));
  }

  /**
   * Action Items and Deliverable Extraction
   */
  extractActionItems(messages, participants) {
    const actionItems = [];
    const seenTasks = new Set();
    let actionId = 1;

    messages.forEach(msg => {
      const sentences = this.splitIntoSentences(msg.text);

      sentences.forEach(sentence => {
        const text = sentence.trim();
        if (text.length < 8) return;

        const lower = text.toLowerCase();
        let isAction = false;

        for (const kw of this.actionKeywords) {
          if (lower.includes(kw)) {
            if (!lower.startsWith('i had') && !lower.includes('yesterday we fixed')) {
              isAction = true;
              break;
            }
          }
        }

        if (/^(?:todo|action item|task|next step)\s*:/i.test(text)) {
          isAction = true;
        }

        if (isAction) {
          const assignee = this.detectAssignee(text, msg.author, participants);
          const deadline = this.detectDeadline(text);
          const urgency = this.classifyUrgency(text);
          const cleanedText = this.cleanTaskSentence(text);

          const normalizedKey = cleanedText.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!seenTasks.has(normalizedKey) && cleanedText.length > 5) {
            seenTasks.add(normalizedKey);
            actionItems.push({
              id: actionId++,
              text: cleanedText,
              rawText: text,
              assignee: assignee || 'Unassigned',
              author: msg.author,
              deadline: deadline || 'Unspecified',
              hasDeadline: !!deadline,
              urgency: urgency,
              completed: false,
              time: msg.time || 'Recent'
            });
          }
        }
      });
    });

    return actionItems;
  }

  /**
   * Key Decisions and Consensus Extraction
   */
  extractDecisions(messages, participants) {
    const decisions = [];
    const seen = new Set();
    let decId = 1;

    messages.forEach(msg => {
      const sentences = this.splitIntoSentences(msg.text);

      sentences.forEach(sentence => {
        const text = sentence.trim();
        if (text.length < 10) return;

        const lower = text.toLowerCase();
        let isDecision = false;
        let matchedMarker = '';

        for (const kw of this.decisionKeywords) {
          if (lower.includes(kw)) {
            isDecision = true;
            matchedMarker = kw;
            break;
          }
        }

        if (isDecision) {
          const cleanedDecision = this.cleanDecisionSentence(text);
          const key = cleanedDecision.toLowerCase().replace(/[^a-z0-9]/g, '');

          if (!seen.has(key) && cleanedDecision.length > 8) {
            seen.add(key);
            decisions.push({
              id: decId++,
              decision: cleanedDecision,
              rawText: text,
              champion: msg.author,
              time: msg.time || 'Recent',
              marker: matchedMarker,
              impact: this.estimateDecisionImpact(cleanedDecision)
            });
          }
        }
      });
    });

    return decisions;
  }

  /**
   * Decision Timeline
   */
  generateDecisionTimeline(messages, decisions) {
    return decisions.map((dec, idx) => ({
      sequence: idx + 1,
      time: dec.time,
      champion: dec.champion,
      decision: dec.decision,
      impact: dec.impact,
      phase: `Milestone ${idx + 1}`
    }));
  }

  /**
   * Participant Engagement Matrix
   */
  generateEngagementMatrix(messages, participants, actionItems, decisions) {
    return participants.map(p => {
      const assigned = actionItems.filter(a => a.assignee.toLowerCase() === p.name.toLowerCase());
      const driven = decisions.filter(d => d.champion.toLowerCase() === p.name.toLowerCase());
      const score = (p.count * 1.5) + (assigned.length * 3.0) + (driven.length * 4.5);

      let role = 'Contributor';
      if (driven.length >= 2) role = 'Decision Driver';
      else if (assigned.length >= 2) role = 'Task Lead';
      else if (p.percentage > 25) role = 'Facilitator';

      return {
        name: p.name,
        initials: p.initials,
        monogramColor: p.monogramColor,
        messageCount: p.count,
        sharePercentage: p.percentage,
        assignedActionCount: assigned.length,
        assignedActions: assigned.map(a => a.text),
        decisionsDrivenCount: driven.length,
        decisionsDriven: driven.map(d => d.decision),
        engagementScore: Math.round(score),
        primaryRole: role
      };
    }).sort((a, b) => b.engagementScore - a.engagementScore);
  }

  /**
   * Smart Semantic Date & Search Logic (Fixing Literal Keyword Bug)
   * Resolves temporal intents ("deadlines", "when", "dates") and extracts
   * exact conversational sub-threads for topic inquiries (initiator, agreed parameters, confirmations).
   */
  searchTopic(messages, query) {
    if (!query || !query.trim() || !messages || messages.length === 0) {
      return null;
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. Check if user is asking a Temporal Query ("deadline", "dates", "when", "schedule")
    const isTemporalQuery = this.temporalIntents.some(term => cleanQuery.includes(term));

    if (isTemporalQuery) {
      return this.extractTemporalScheduleOverview(messages, query);
    }

    // 2. Specific Topic / Plan Query (e.g., "go karting", "hanging out", "budget", "venue", "figma")
    return this.extractConversationalSubthread(messages, query);
  }

  /**
   * Temporal Schedule Synthesis across all messages with dates/times
   */
  extractTemporalScheduleOverview(messages, originalQuery) {
    const scheduledItems = [];
    const seenSnippets = new Set();
    const allDetectedDates = new Set();

    messages.forEach(msg => {
      const deadline = this.detectDeadline(msg.text);
      if (deadline) {
        allDetectedDates.add(deadline);
        const snippetKey = msg.text.substring(0, 40).toLowerCase();
        if (!seenSnippets.has(snippetKey)) {
          seenSnippets.add(snippetKey);
          scheduledItems.push({
            author: msg.author,
            time: msg.time,
            deadline: deadline,
            text: msg.text,
            highlightedText: this.highlightDates(msg.text)
          });
        }
      }
    });

    if (scheduledItems.length === 0) {
      return {
        query: originalQuery,
        isTemporal: true,
        matchCount: 0,
        summary: "No explicit dates, deadlines, or time commitments were detected in the conversation log.",
        excerpts: [],
        deadlines: []
      };
    }

    const summaryText = `Found ${scheduledItems.length} explicit time commitments and milestones across the conversation. Key upcoming deadlines include: ${Array.from(allDetectedDates).slice(0, 4).join(', ')}.`;

    return {
      query: originalQuery,
      isTemporal: true,
      matchCount: scheduledItems.length,
      summary: summaryText,
      subthread: {
        initiator: scheduledItems[0].author,
        agreedParameters: Array.from(allDetectedDates).join(' • '),
        confirmations: `${scheduledItems.length} temporal obligations recorded`,
        status: 'Scheduled Milestones'
      },
      excerpts: scheduledItems.slice(0, 8),
      deadlines: Array.from(allDetectedDates)
    };
  }

  /**
   * Conversational Sub-Thread Extraction for Topics (Initiator, Agreed Parameters, Confirmations)
   */
  extractConversationalSubthread(messages, query) {
    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2);

    const subthreadMessages = [];
    const involvedParticipants = new Set();
    const confirmedParticipants = new Set();
    const subthreadDates = new Set();

    messages.forEach(msg => {
      const textLower = msg.text.toLowerCase();
      let matches = textLower.includes(cleanQuery);

      if (!matches && queryTokens.length > 0) {
        const matchesCount = queryTokens.filter(t => textLower.includes(t)).length;
        if (matchesCount >= Math.min(2, queryTokens.length)) {
          matches = true;
        }
      }

      if (matches) {
        subthreadMessages.push(msg);
        involvedParticipants.add(msg.author);

        // Check for confirmation words in proximity
        if (/\b(?:agreed|confirmed|fits|count me in|good option|proceed|decided|yes|deal)\b/i.test(msg.text)) {
          confirmedParticipants.add(msg.author);
        }

        const deadline = this.detectDeadline(msg.text);
        if (deadline) subthreadDates.add(deadline);
      }
    });

    if (subthreadMessages.length === 0) {
      return {
        query: query,
        isTemporal: false,
        matchCount: 0,
        summary: `No discussions found matching "${query}". Try searching for specific activities, venues, or deliverables.`,
        excerpts: [],
        deadlines: []
      };
    }

    const initiator = subthreadMessages[0].author;
    const initiatorText = subthreadMessages[0].text;
    const confirmationsList = confirmedParticipants.size > 0 
      ? Array.from(confirmedParticipants).join(', ')
      : Array.from(involvedParticipants).join(', ');

    let agreedParams = "Parameters discussed";
    if (subthreadDates.size > 0) {
      agreedParams = Array.from(subthreadDates).join('; ');
    } else {
      agreedParams = this.truncate(initiatorText, 90);
    }

    const summaryText = `${initiator} initiated the discussion regarding "${query}". Agreed parameters: ${agreedParams}. Confirmed participants: ${confirmationsList}.`;

    const excerpts = subthreadMessages.slice(0, 8).map(m => ({
      author: m.author,
      time: m.time || 'Recent',
      text: m.text,
      highlightedText: this.highlightQueryTerms(m.text, queryTokens.concat([cleanQuery]))
    }));

    return {
      query: query,
      isTemporal: false,
      matchCount: subthreadMessages.length,
      summary: summaryText,
      subthread: {
        initiator: initiator,
        agreedParameters: agreedParams,
        confirmations: confirmationsList,
        status: confirmedParticipants.size > 0 ? 'Confirmed & Agreed' : 'Proposed / In Review'
      },
      excerpts: excerpts,
      deadlines: Array.from(subthreadDates)
    };
  }

  /**
   * "Direct Mentions & Tags" - What You Missed Specifically
   * Extracts direct questions asked to the user, tasks assigned to them,
   * and pending decision requests.
   */
  extractWhatYouMissed(messages, userName, actionItems, decisions) {
    if (!userName || !messages) {
      return {
        userName: '',
        questions: [],
        tasks: [],
        decisionRequests: [],
        directMentions: []
      };
    }

    const target = userName.toLowerCase().trim();
    const questions = [];
    const tasks = actionItems.filter(a => a.assignee.toLowerCase().includes(target));
    const decisionRequests = [];
    const directMentions = [];

    messages.forEach(msg => {
      const lower = msg.text.toLowerCase();
      const isTargetAuthor = msg.author.toLowerCase() === target;

      // Check if message mentions target or tags @target
      const mentionsTarget = lower.includes(target) || lower.includes(`@${target}`);

      if (mentionsTarget && !isTargetAuthor) {
        directMentions.push({
          author: msg.author,
          time: msg.time,
          text: msg.text
        });

        // 1. Check for Direct Questions asked to target
        if (msg.text.includes('?')) {
          const sentences = this.splitIntoSentences(msg.text);
          sentences.forEach(s => {
            if (s.includes('?') && (s.toLowerCase().includes(target) || s.toLowerCase().includes('you'))) {
              questions.push({
                author: msg.author,
                time: msg.time,
                question: s.trim()
              });
            }
          });
        }

        // 2. Check for Decisions waiting on target
        if (/\b(?:what do you think|can you confirm|do we|should we|approve|sign off|waiting on)\b/i.test(msg.text)) {
          decisionRequests.push({
            author: msg.author,
            time: msg.time,
            request: msg.text.trim()
          });
        }
      }
    });

    return {
      userName: userName,
      questions: questions,
      tasks: tasks,
      decisionRequests: decisionRequests,
      directMentions: directMentions
    };
  }

  highlightQueryTerms(text, tokens) {
    if (!tokens || tokens.length === 0) return text;
    let result = text;
    tokens.forEach(token => {
      if (token && token.length > 2) {
        const regex = new RegExp(`(${this.escapeRegex(token)})`, 'gi');
        result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
      }
    });
    return result;
  }

  highlightDates(text) {
    let result = text;
    for (const pat of this.deadlinePatterns) {
      result = result.replace(pat, '<mark class="search-highlight">$&</mark>');
    }
    return result;
  }

  extractUrgencyBreakdown(messages, actionItems, decisions) {
    const breakdown = { high: [], medium: [], low: [] };

    actionItems.forEach(item => {
      if (item.urgency === 'high') {
        breakdown.high.push({
          id: `task-${item.id}`,
          type: 'action',
          title: item.text,
          detail: `Owner: ${item.assignee} ${item.hasDeadline ? `• Due: ${item.deadline}` : ''}`,
          author: item.author,
          badge: 'High Priority',
          level: 'high',
          time: item.time
        });
      } else if (item.urgency === 'medium') {
        breakdown.medium.push({
          id: `task-${item.id}`,
          type: 'action',
          title: item.text,
          detail: `Owner: ${item.assignee} ${item.hasDeadline ? `• Due: ${item.deadline}` : ''}`,
          author: item.author,
          badge: 'Scheduled',
          level: 'medium',
          time: item.time
        });
      } else {
        breakdown.low.push({
          id: `task-${item.id}`,
          type: 'action',
          title: item.text,
          detail: `Owner: ${item.assignee}`,
          author: item.author,
          badge: 'Operational',
          level: 'low',
          time: item.time
        });
      }
    });

    decisions.forEach(dec => {
      breakdown.low.push({
        id: `dec-${dec.id}`,
        type: 'decision',
        title: dec.decision,
        detail: `Champion: ${dec.champion}`,
        author: dec.champion,
        badge: 'Agreement',
        level: 'low',
        time: dec.time
      });
    });

    return breakdown;
  }

  generateExecutiveSummary(messages, participants, decisions, actionItems) {
    if (messages.length === 0) {
      return {
        sentence1: "No communication logs provided for processing.",
        sentence2: "Please load a transcript or upload a file.",
        sentence3: "The local analytical engine will generate insights automatically.",
        tldr: "No active record.",
        topics: []
      };
    }

    const totalMsgs = messages.length;
    const topParticipants = participants.slice(0, 3).map(p => p.name).join(', ');
    const otherCount = Math.max(0, participants.length - 3);
    const participantClause = otherCount > 0 
      ? `${topParticipants}, and ${otherCount} other${otherCount > 1 ? 's' : ''}`
      : topParticipants || 'the participants';

    const topKeywords = this.extractTopTopics(messages);
    const topicSummary = topKeywords.slice(0, 3).join(', ');

    let s1 = topicSummary 
      ? `Across ${totalMsgs} WhatsApp messages, ${participantClause} discussed ${topicSummary}.`
      : `The conversation between ${participantClause} involved ${totalMsgs} exchanges coordinating project status and upcoming priorities.`;

    let s2 = "";
    if (decisions.length > 0) {
      const topDecision = decisions[0].decision;
      s2 = `Key consensus was reached to ${this.lowerFirst(topDecision)}${decisions.length > 1 ? `, alongside ${decisions.length - 1} further confirmed agreement${decisions.length > 2 ? 's' : ''}` : ''}.`;
    } else {
      s2 = `Participants aligned on operational objectives and validated logistical arrangements.`;
    }

    let s3 = "";
    const highAction = actionItems.find(a => a.urgency === 'high') || actionItems[0];
    if (highAction) {
      const dueInfo = highAction.hasDeadline ? ` (${highAction.deadline})` : '';
      s3 = `Immediate next steps require ${highAction.assignee} to ${this.lowerFirst(highAction.text)}${dueInfo}, with ${actionItems.length} total deliverables tracked.`;
    } else if (actionItems.length > 0) {
      s3 = `A total of ${actionItems.length} actionable deliverables are actively scheduled across participants for execution.`;
    } else {
      s3 = `No active operational blockers were identified, and team members remain on standby.`;
    }

    const tldr = topKeywords.length > 0 
      ? `Discussion prioritized ${topKeywords.slice(0, 2).join(' & ')} with ${actionItems.length} tracked task${actionItems.length === 1 ? '' : 's'}.`
      : `Record includes ${totalMsgs} messages and ${actionItems.length} tracked tasks.`;

    return {
      sentence1: s1,
      sentence2: s2,
      sentence3: s3,
      fullText: `${s1} ${s2} ${s3}`,
      tldr,
      topics: topKeywords
    };
  }

  detectAssignee(sentence, author, participants) {
    for (const p of participants) {
      const atRegex = new RegExp(`@${this.escapeRegex(p.name)}\\b`, 'i');
      if (atRegex.test(sentence)) return p.name;
    }

    for (const p of participants) {
      const nameCallRegex = new RegExp(`^${this.escapeRegex(p.name)}[,:]?\\s+(?:can you|please|will|could|should|needs? to)`, 'i');
      if (nameCallRegex.test(sentence)) return p.name;
    }

    if (/\b(?:i will|i'll|i am going to|i'm going to|let me|i can take|i'll handle|on it)\b/i.test(sentence)) {
      return author;
    }

    for (const p of participants) {
      if (p.name.toLowerCase() !== author.toLowerCase()) {
        const mentionsRegex = new RegExp(`\\b${this.escapeRegex(p.name)}\\b`, 'i');
        if (mentionsRegex.test(sentence)) return p.name;
      }
    }

    if (/\b(?:will|taking|handling|pushing|fixing|sending|deploying)\b/i.test(sentence)) {
      return author;
    }

    return 'Unassigned';
  }

  detectDeadline(sentence) {
    for (const pattern of this.deadlinePatterns) {
      const match = sentence.match(pattern);
      if (match) return match[1] || match[0];
    }
    return null;
  }

  classifyUrgency(text) {
    const lower = text.toLowerCase();
    for (const term of this.highUrgencyTerms) {
      if (lower.includes(term)) return 'high';
    }
    for (const term of this.mediumUrgencyTerms) {
      if (lower.includes(term)) return 'medium';
    }
    return 'low';
  }

  cleanTaskSentence(text) {
    let cleaned = text
      .replace(/^(?:todo|action item|task|next step)\s*:\s*/i, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^(?:hey|hi|hello|team|everyone)[,!]?\s*/i, '')
      .replace(/^(?:okay|ok|sure|alright|so)[,!]?\s*/i, '')
      .replace(/^(?:[A-Za-z0-9_.\s]+)[,:]\s*(?:can you|could you|please)\s*/i, '')
      .replace(/^(?:can you|could you|please)\s*/i, '')
      .trim();

    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  }

  cleanDecisionSentence(text) {
    let cleaned = text
      .replace(/^(?:decision|agreed|confirmed|resolved)\s*:\s*/i, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^(?:so|okay|well|looks like|i think)\s+/i, '')
      .trim();

    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  }

  splitIntoSentences(text) {
    if (!text) return [];
    return text
      .split(/(?<=[.!?\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * High-value topic keywords only (ignoring useless chatter like #Lol, #Only, #Guys, #Play)
   */
  extractTopTopics(messages) {
    const stopwords = new Set([
      'the', 'and', 'to', 'of', 'a', 'in', 'that', 'is', 'for', 'it', 'with', 'as',
      'was', 'on', 'at', 'by', 'this', 'have', 'from', 'or', 'you', 'we', 'are',
      'be', 'they', 'what', 'so', 'can', 'will', 'just', 'all', 'there', 'if', 'not',
      'me', 'my', 'your', 'our', 'us', 'good', 'sure', 'yeah', 'yes', 'no', 'ok',
      'well', 'about', 'get', 'like', 'think', 'would', 'then', 'also', 'some',
      'now', 'see', 'did', 'done', 'here', 'need', 'let', 'guys', 'only', 'play',
      'team', 'hey', 'hello', 'lol', 'omg', 'thanks', 'cool', 'nice', 'morning'
    ]);

    const freq = {};
    messages.forEach(msg => {
      // Exclude media tag texts from topic keywords
      if (msg.isMedia) return;
      const words = msg.text.toLowerCase().match(/\b[a-z]{4,20}\b/g) || [];
      words.forEach(w => {
        if (!stopwords.has(w)) {
          freq[w] = (freq[w] || 0) + 1;
        }
      });
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  estimateDecisionImpact(text) {
    const lower = text.toLowerCase();
    if (lower.includes('architecture') || lower.includes('database') || lower.includes('migration') || lower.includes('hotfix') || lower.includes('rollback')) {
      return 'Critical Architecture';
    }
    if (lower.includes('budget') || lower.includes('venue') || lower.includes('pricing') || lower.includes('cost')) {
      return 'Commercial / Budget';
    }
    return 'Operational Agreement';
  }

  getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  generateMonogramColor(name) {
    const colors = [
      '#475569', '#334155', '#2563EB', '#0D9488',
      '#059669', '#D97706', '#E11D48', '#4F46E5', '#64748B'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  truncate(str, max) {
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  lowerFirst(str) {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatAnalyzer;
} else if (typeof window !== 'undefined') {
  window.ChatAnalyzer = ChatAnalyzer;
}
