/**
 * What Did I Miss? - Dual-Engine AI Integration
 * Optional client-side integration for OpenAI (gpt-4o-mini / gpt-3.5-turbo)
 * and Google Gemini (gemini-1.5-flash / gemini-2.0-flash).
 * Keys are stored exclusively in the user's browser localStorage.
 * Seamless fallback to local heuristic engine on any error.
 */

class AIEngine {
  constructor() {
    this.storageKey = 'wdim_ai_config';
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read AI config from localStorage', e);
    }
    return {
      enabled: false,
      provider: 'openai', // 'openai' | 'gemini'
      apiKey: '',
      model: 'gpt-4o-mini'
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save AI config to localStorage', e);
    }
    return this.config;
  }

  clearConfig() {
    this.config = {
      enabled: false,
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o-mini'
    };
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Could not remove AI config', e);
    }
    return this.config;
  }

  isReady() {
    return !!(this.config.enabled && this.config.apiKey && this.config.apiKey.trim().length > 5);
  }

  /** Compatibility alias used by app.js */
  isEnabled() { return this.isReady(); }

  enable() { this.saveConfig({ enabled: true }); }

  disable() { this.saveConfig({ enabled: false }); }

  configure(provider, model, apiKey) {
    this.saveConfig({ provider: provider || 'openai', model: model || 'gpt-4o-mini', apiKey: apiKey || '' });
  }

  /**
   * Merge AI-generated insights into the local analysis result.
   * Called by app.js when AI Engine is enabled.
   */
  async enhance(rawText, localResult) {
    if (!this.isReady()) return localResult;
    try {
      const messages = localResult.participants ? [] : [];
      // Build a lightweight message list from rawText for AI
      const lines = rawText.split('\n').filter(l => l.trim()).slice(0, 100);
      const aiData = await this.analyzeWithAI(lines.map((l, i) => ({ time: '', author: 'Speaker', text: l })));
      if (aiData && aiData.executiveSummary) {
        return { ...localResult, executiveSummary: { ...localResult.executiveSummary, ...aiData.executiveSummary } };
      }
    } catch (e) {
      console.warn('AI enhance error, falling back to local:', e.message);
    }
    return localResult;
  }

  /**
   * Run deep contextual analysis via OpenAI or Gemini
   */
  async analyzeWithAI(messages) {
    if (!this.isReady()) {
      throw new Error('AI Engine is not configured or disabled.');
    }

    const transcriptExcerpt = messages
      .slice(0, 80) // Limit to 80 messages for prompt efficiency
      .map(m => `[${m.time || ''}] ${m.author}: ${m.text}`)
      .join('\n');

    const systemPrompt = `You are an elite corporate intelligence analyst. Analyze the provided chat transcript and output ONLY a valid JSON object matching this exact schema:
{
  "executiveSummary": {
    "sentence1": "Context: Who spoke and core focus across messages",
    "sentence2": "Consensus: Major decision or agreement reached",
    "sentence3": "Next Steps: Immediate deliverables and deadlines",
    "tldr": "One sentence executive summary",
    "topics": ["topic1", "topic2", "topic3"]
  },
  "actionItems": [
    {
      "text": "Specific task deliverable",
      "assignee": "Name of assigned person or Unassigned",
      "deadline": "Detected date or time, or Unspecified",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "decisions": [
    {
      "decision": "Decision reached",
      "champion": "Name of person who finalized or championed it",
      "impact": "Critical Architecture" | "Commercial / Budget" | "Operational Agreement"
    }
  ]
}`;

    const userPrompt = `Analyze this group communication transcript:\n\n${transcriptExcerpt}`;

    if (this.config.provider === 'openai') {
      return await this.callOpenAI(systemPrompt, userPrompt);
    } else {
      return await this.callGemini(systemPrompt, userPrompt);
    }
  }

  /**
   * Natural Language Topic Query ("What Did They Say About...?")
   */
  async queryTopicWithAI(messages, query) {
    if (!this.isReady()) {
      throw new Error('AI Engine is not configured or disabled.');
    }

    const transcriptExcerpt = messages
      .slice(0, 100)
      .map(m => `[${m.time || ''}] ${m.author}: ${m.text}`)
      .join('\n');

    const systemPrompt = `You are a precision research assistant. The user wants to know what was discussed about a specific topic: "${query}".
Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 sentences synthesizing exactly what participants decided, argued, or stated regarding the query",
  "deadlines": ["List of any explicit or implicit dates/times/deadlines related to this topic"],
  "excerpts": [
    {
      "author": "Speaker name",
      "time": "Time string",
      "text": "Exact relevant quote from chat"
    }
  ]
}`;

    const userPrompt = `Transcript:\n${transcriptExcerpt}\n\nUser Question/Topic: "${query}"`;

    if (this.config.provider === 'openai') {
      return await this.callOpenAI(systemPrompt, userPrompt);
    } else {
      return await this.callGemini(systemPrompt, userPrompt);
    }
  }

  /**
   * OpenAI Chat Completions API
   */
  async callOpenAI(systemPrompt, userPrompt) {
    const model = this.config.model || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content);
  }

  /**
   * Google Gemini REST API
   */
  async callGemini(systemPrompt, userPrompt) {
    const model = this.config.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey.trim()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Gemini returned an empty response.');
    }
    return JSON.parse(textContent);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIEngine;
} else if (typeof window !== 'undefined') {
  window.AIEngine = AIEngine;
}
