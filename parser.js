/**
 * What Did I Miss? - WhatsApp Native Chat Parser
 * Specially optimized for WhatsApp exports (Android dash '-' and iOS bracket '[]' formats).
 * Filters auto-generated system notices (encryption keys, member updates, call events).
 * Detects native media placeholders (<image omitted>, <media omitted>, <attached: ...>)
 * and structures them for visual media cards and preview galleries.
 */

class ChatParser {
  constructor() {
    // Pure system notices to ignore entirely (never user conversation)
    this.systemNoticeSignatures = [
      /messages and calls are end-to-end encrypted/i,
      /end-to-end encrypted/i,
      /\bcreated group\b/i,
      /\bcreated this group\b/i,
      /\bjoined using (?:this group's|an) invite link\b/i,
      /\badded\s+["']?[^"']+["']?/i,
      /\bleft\b/i,
      /\bremoved\s+["']?[^"']+["']?/i,
      /\bchanged the subject to\b/i,
      /\bchanged the group description\b/i,
      /\bchanged this group's icon\b/i,
      /\bchanged the group settings\b/i,
      /\bsecurity code changed\b/i,
      /\bdisappearing messages\b/i,
      /\bpinned a message\b/i,
      /\bthis message was deleted\b/i,
      /\byou deleted this message\b/i,
      /\bmissed (?:group )?(?:voice|video) call\b/i,
      /\bstarted a call\b/i,
      /\bwaiting for this message/i
    ];

    // Primary chat format regex patterns
    // 1. WhatsApp iOS: [10/24/23, 10:30:15 AM] Alice: Message or [24/10/2023, 14:15:00] Alice: Message
    this.regexWhatsAppIos = /^\[(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s*(?:~\s*)?([^:\n]+?):\s*(.+)$/s;
    
    // 1b. WhatsApp iOS System Event (no author colon, e.g. [10/24/23, 10:30:00 AM] Messages and calls are end-to-end encrypted...)
    this.regexWhatsAppIosSystem = /^\[(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s*(.+)$/s;

    // 2. WhatsApp Android: 24/10/23, 14:15 - Alice: Message or 10/24/2023, 10:30 AM - Alice: Message
    this.regexWhatsAppAndroid = /^(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*([^:\n]+?):\s*(.+)$/s;

    // 2b. WhatsApp Android System Event (no author colon, e.g. 24/10/23, 14:15 - Messages and calls are end-to-end encrypted...)
    this.regexWhatsAppAndroidSystem = /^(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*(.+)$/s;

    // 3. Fallback generic format: [10:30 AM] Alice: Message or Alice: Message
    this.regexGeneric = /^(?:\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*)?([A-Za-z0-9_.\s-]{2,30}):\s*(.+)$/s;
  }

  /**
   * Normalize and sanitize raw line by stripping invisible unicode marks
   * (LTR/RTL marks, BOM) and converting narrow non-breaking spaces.
   */
  sanitizeLine(line) {
    if (!line) return '';
    return line
      .replace(/[\u200E\u200F\uFEFF]/g, '') // Strip LTR/RTL marks and BOM (common in iOS exports)
      .replace(/[\u202F\u00A0]/g, ' ')      // Standardize narrow and non-breaking spaces
      .trim();
  }

  /**
   * Determine if text content is an auto-generated system notification to ignore.
   */
  isSystemNotice(text) {
    if (!text) return true;
    const lower = text.toLowerCase().trim();
    return this.systemNoticeSignatures.some(regex => regex.test(lower));
  }

  /**
   * Detect and categorize WhatsApp media placeholders.
   */
  detectMedia(text, author, time) {
    if (!text) return null;
    const lower = text.toLowerCase().trim();

    // Image / Photo
    if (lower.includes('<media omitted>') || lower.includes('media omitted') ||
        lower.includes('<image omitted>') || lower.includes('image omitted') ||
        lower.includes('<photo omitted>') || lower.includes('photo omitted')) {
      const id = Math.floor(1000 + Math.random() * 9000);
      return {
        type: 'image',
        label: 'Photo Attachment',
        filename: `IMG_${id}.jpg`,
        author: author,
        time: time || 'Recent',
        customSrc: null
      };
    }

    // Video
    if (lower.includes('<video omitted>') || lower.includes('video omitted')) {
      const id = Math.floor(1000 + Math.random() * 9000);
      return {
        type: 'video',
        label: 'Video Clip',
        filename: `VID_${id}.mp4`,
        author: author,
        time: time || 'Recent',
        customSrc: null
      };
    }

    // Audio / Voice
    if (lower.includes('<audio omitted>') || lower.includes('audio omitted') || lower.includes('voice message')) {
      const id = Math.floor(1000 + Math.random() * 9000);
      return {
        type: 'audio',
        label: 'Voice Note',
        filename: `AUDIO_${id}.opus`,
        author: author,
        time: time || 'Recent',
        customSrc: null
      };
    }

    // Document / Attachment
    if (lower.includes('<document omitted>') || lower.includes('document omitted') ||
        lower.includes('<attached:') || lower.includes('[attached:')) {
      const nameMatch = text.match(/(?:<attached:|\[attached:)\s*([^>\]]+)(?:>|\])/i);
      const fname = nameMatch ? nameMatch[1].trim() : `DOC_${Math.floor(1000 + Math.random() * 9000)}.pdf`;
      return {
        type: 'document',
        label: 'Document',
        filename: fname,
        author: author,
        time: time || 'Recent',
        customSrc: null
      };
    }

    return null;
  }

  /**
   * Parse raw text into structured message objects.
   * @param {string} rawText 
   * @returns {Array<{id: number, author: string, time: string, date: string, text: string, raw: string, isMedia: boolean, media: Object|null}>}
   */
  parse(rawText) {
    if (!rawText || !rawText.trim()) return [];

    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    const messages = [];
    let currentMessage = null;
    let messageCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = this.sanitizeLine(lines[i]);
      if (!line) continue;

      // 1. WhatsApp iOS Format: [DD/MM/YY, HH:MM:SS] Name: Message
      let m = line.match(this.regexWhatsAppIos);
      if (m) {
        const textContent = m[4].trim();
        const author = m[3].trim();
        const time = m[2];
        const date = m[1];

        // If system notice (like encryption key), skip
        if (this.isSystemNotice(textContent)) {
          continue;
        }

        // Check for media
        const media = this.detectMedia(textContent, author, time);

        if (currentMessage) messages.push(currentMessage);
        currentMessage = {
          id: messageCounter++,
          date: date,
          time: time,
          author: author,
          text: textContent,
          raw: line,
          isMedia: !!media,
          media: media
        };
        continue;
      }

      // 1b. WhatsApp iOS System Event (e.g. encryption notice without colon)
      m = line.match(this.regexWhatsAppIosSystem);
      if (m) {
        const potentialSystemText = m[3].trim();
        if (this.isSystemNotice(potentialSystemText)) {
          continue;
        }
      }

      // 2. WhatsApp Android Format: DD/MM/YY, HH:MM - Name: Message
      m = line.match(this.regexWhatsAppAndroid);
      if (m) {
        const textContent = m[4].trim();
        const author = m[3].trim();
        const time = m[2];
        const date = m[1];

        if (this.isSystemNotice(textContent)) {
          continue;
        }

        const media = this.detectMedia(textContent, author, time);

        if (currentMessage) messages.push(currentMessage);
        currentMessage = {
          id: messageCounter++,
          date: date,
          time: time,
          author: author,
          text: textContent,
          raw: line,
          isMedia: !!media,
          media: media
        };
        continue;
      }

      // 2b. WhatsApp Android System Event (e.g. 24/10/23, 14:15 - Messages and calls are end-to-end encrypted...)
      m = line.match(this.regexWhatsAppAndroidSystem);
      if (m) {
        const potentialSystemText = m[3].trim();
        if (this.isSystemNotice(potentialSystemText)) {
          continue;
        }
      }

      // Standalone check: if entire line matches system notice, ignore
      if (this.isSystemNotice(line)) {
        continue;
      }

      // 3. Generic Format: Author: Message
      m = line.match(this.regexGeneric);
      if (m) {
        const potentialAuthor = m[2].trim();
        const lower = potentialAuthor.toLowerCase();
        const nonAuthors = ['note', 'todo', 'ps', 'http', 'https', 'tip', 'update', 'status', 'summary', 'decision', 'action item'];

        if (!nonAuthors.includes(lower) && potentialAuthor.length < 30) {
          const textContent = m[3].trim();
          if (!this.isSystemNotice(textContent)) {
            const time = m[1] || 'Recent';
            const media = this.detectMedia(textContent, potentialAuthor, time);

            if (currentMessage) messages.push(currentMessage);
            currentMessage = {
              id: messageCounter++,
              date: 'Today',
              time: time,
              author: potentialAuthor,
              text: textContent,
              raw: line,
              isMedia: !!media,
              media: media
            };
          }
          continue;
        }
      }

      // Continuation line of previous message
      if (currentMessage) {
        currentMessage.text += '\n' + line;
        currentMessage.raw += '\n' + line;
      }
    }

    if (currentMessage) {
      messages.push(currentMessage);
    }

    return messages;
  }

  /**
   * Extract all media items from messages.
   */
  getMediaItems(messages) {
    return messages
      .filter(m => m.isMedia && m.media)
      .map(m => m.media);
  }

  /**
   * Extract list of distinct participants.
   */
  getParticipants(messages) {
    const map = new Map();
    messages.forEach(msg => {
      const cleanAuthor = msg.author.trim();
      if (cleanAuthor && cleanAuthor.toLowerCase() !== 'participant') {
        map.set(cleanAuthor, (map.get(cleanAuthor) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Export for ES modules and global browser scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatParser;
} else if (typeof window !== 'undefined') {
  window.ChatParser = ChatParser;
}
