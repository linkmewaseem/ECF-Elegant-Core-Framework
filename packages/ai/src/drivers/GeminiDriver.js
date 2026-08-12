import { BaseAiDriver } from './BaseAiDriver.js';

export class GeminiDriver extends BaseAiDriver {
  static MODEL_ALIASES = {
    '3.1 pro': 'gemini-3.1-pro-preview',
    '3.1-pro': 'gemini-3.1-pro-preview',
    'gemini-3.1-pro': 'gemini-3.1-pro-preview',
    'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-1.5-pro-latest': 'gemini-3.1-pro-preview',
    'gemini-pro': 'gemini-3.1-pro-preview',
    'gemini-3.6-flash': 'gemini-3.6-flash',
    'gemini-3.5-flash': 'gemini-3.5-flash',
    'gemini-2.5-flash': 'gemini-2.5-flash',
  };

  static FALLBACK_MODELS = [
    'gemini-3.1-pro-preview',
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-flash-latest',
    'gemini-pro-latest',
  ];

  resolveModelName(modelName) {
    const raw = modelName || (this.config && this.config.model) || 'gemini-3.1-pro-preview';
    return GeminiDriver.MODEL_ALIASES[raw] || raw;
  }

  sanitizeHistoryAndSystem(prompt, options = {}) {
    let systemText = options.system || options.systemInstruction || (this.config && this.config.systemPrompt) || '';
    const rawHistory = Array.isArray(options.history) ? options.history : [];

    const conversationTurns = [];

    for (const msg of rawHistory) {
      if (!msg) continue;
      const role = String(msg.role || '').toLowerCase();
      const content = String(msg.content || '').trim();

      if (role === 'system') {
        if (content) {
          systemText = systemText ? `${systemText}\n${content}` : content;
        }
        continue;
      }

      const geminiRole = (role === 'assistant' || role === 'model') ? 'model' : 'user';
      if (content) {
        conversationTurns.push({ role: geminiRole, parts: [{ text: content }] });
      }
    }

    // Append current prompt if it isn't already the last user message
    const lastTurn = conversationTurns[conversationTurns.length - 1];
    if (!lastTurn || lastTurn.role !== 'user' || lastTurn.parts[0]?.text !== prompt) {
      conversationTurns.push({ role: 'user', parts: [{ text: prompt }] });
    }

    // Enforce alternating user/model turns to satisfy Gemini API requirements
    const sanitizedContents = [];
    for (const turn of conversationTurns) {
      if (sanitizedContents.length === 0) {
        sanitizedContents.push(turn);
        continue;
      }

      const prevTurn = sanitizedContents[sanitizedContents.length - 1];
      if (prevTurn.role === turn.role) {
        // Merge consecutive turns with the same role into a single message
        const combinedText = `${prevTurn.parts[0].text}\n${turn.parts[0].text}`;
        prevTurn.parts[0].text = combinedText;
      } else {
        sanitizedContents.push(turn);
      }
    }

    // Ensure contents starts with a 'user' turn
    if (sanitizedContents.length > 0 && sanitizedContents[0].role === 'model') {
      sanitizedContents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    return {
      systemText,
      contents: sanitizedContents.length > 0 ? sanitizedContents : [{ role: 'user', parts: [{ text: prompt }] }]
    };
  }

  async chat(prompt, options = {}) {
    const apiKey = options.apiKey || (this.config && this.config.apiKey) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let model = this.resolveModelName(options.model);

    if (apiKey && process.env.NODE_ENV !== 'test') {
      const { systemText, contents } = this.sanitizeHistoryAndSystem(prompt, options);

      const requestBody = { contents };
      if (systemText) {
        requestBody.systemInstruction = { parts: [{ text: systemText }] };
      }

      const candidateModels = [model, ...GeminiDriver.FALLBACK_MODELS.filter(m => m !== model)];
      let lastError = null;

      for (const currentModel of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (!res.ok) {
            const errText = await res.text();
            lastError = new Error(`Google Gemini API Error (${res.status}): ${errText}`);
            if (res.status === 404 || res.status === 400) {
              // Try next fallback model if model not found or invalid
              continue;
            }
            throw lastError;
          }

          const data = await res.json();
          const candidateParts = data.candidates?.[0]?.content?.parts || [];
          let candidateText = candidateParts.map(p => p.text || '').filter(Boolean).join('\n').trim();

          if (!candidateText && data.candidates?.[0]?.finishReason) {
            candidateText = `[Response blocked by safety policy or finishReason: ${data.candidates[0].finishReason}]`;
          }

          const usageMeta = data.usageMetadata || {};

          return {
            text: candidateText,
            model: currentModel,
            usage: {
              promptTokens: usageMeta.promptTokenCount || 0,
              completionTokens: usageMeta.candidatesTokenCount || 0,
              totalTokens: usageMeta.totalTokenCount || 0,
            },
            raw: data
          };
        } catch (err) {
          lastError = err;
          if (err.message.includes('404') || err.message.includes('400')) {
            continue;
          }
          break;
        }
      }

      if (options.allowFallback) {
        return {
          text: `[Google ${model}] AI Response to: "${prompt}"`,
          model,
          usage: { promptTokens: 12, completionTokens: 20, totalTokens: 32 },
          error: lastError ? lastError.message : 'Unknown Gemini API Error'
        };
      }

      throw lastError || new Error(`Google Gemini API request failed for all candidate models.`);
    }

    return {
      text: `[Google ${model}] AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 12, completionTokens: 20, totalTokens: 32 },
    };
  }

  async *stream(prompt, options = {}) {
    const apiKey = options.apiKey || (this.config && this.config.apiKey) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const model = this.resolveModelName(options.model);

    if (apiKey && process.env.NODE_ENV !== 'test') {
      const { systemText, contents } = this.sanitizeHistoryAndSystem(prompt, options);
      const requestBody = { contents };
      if (systemText) {
        requestBody.systemInstruction = { parts: [{ text: systemText }] };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  yield textChunk;
                }
              } catch {
                // Ignore SSE JSON parse errors
              }
            }
          }
        }
        return;
      }
    }

    // Fallback stream simulation
    const chatRes = await this.chat(prompt, options);
    const words = (chatRes.text || '').split(' ');
    for (const word of words) {
      yield word + ' ';
    }
  }

  async embed(text, options = {}) {
    const apiKey = options.apiKey || (this.config && this.config.apiKey) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const model = options.embeddingModel || 'text-embedding-004';

    if (apiKey && process.env.NODE_ENV !== 'test') {
      const candidateModels = [model, 'text-embedding-004', 'embedding-001'];
      for (const curModel of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${curModel}:embedContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: `models/${curModel}`,
              content: { parts: [{ text }] }
            })
          });

          if (!res.ok) continue;

          const data = await res.json();
          if (data.embedding?.values) {
            return data.embedding.values;
          }
        } catch {
          continue;
        }
      }
    }

    return Array.from({ length: 768 }, (_, i) => Math.cos(i * 0.01));
  }
}

export default GeminiDriver;

