# `@ecf/ai` — Enterprise AI Engine & LLM Platform

`@ecf/ai` is the official first-party enterprise AI engine for ECF (Enterprise Core Framework). It provides multi-provider LLM chat (`AI.chat()`), token streaming (`AI.stream()`), state-managed conversation memory (`AI.memory()`), structured output validation, versioned prompt templates (`AI.prompt("support@v2")`), dedicated `EmbeddingManager`, modular RAG pipeline (`AI.rag()`), post-retrieval `ReRanker`, code/markdown chunkers (`Chunk.code()`), provider failover fallback, cost & token telemetry, model registry (`AI.model("gpt-4o")`), AI middleware pipeline, semantic caching, strict tool calling, autonomous agent planner with reflection loops (`Planner ➔ Executor ➔ Memory ➔ Reflection`), AI safety & moderation (`AI.moderate()`), Model Context Protocol (MCP) abstraction (`AI.mcp()`), DevTools AI collector (`AiCollector`), testing fake (`AI.fake()`), and 8 provider drivers (`OpenAI`, `Anthropic`, `Gemini`, `Ollama`, `OpenRouter`, `Groq`, `Memory`, `Null`).

---

## 🌟 Key Capabilities

```js
import { AI } from "@ecf/ai";

// 1. Multi-Provider Chat & Streaming
const res = await AI.chat("Summarize enterprise security policies", { driver: "openai" });

// 2. State-Managed Conversation Memory
AI.memory("ticket-102").addMessage("user", "Hello").addMessage("assistant", "Hi there!");

// 3. Prompt Template Versioning
AI.registerPrompt("welcome", "Hello {{name}}, welcome to {{app}}!", "v2");
const text = AI.prompt("welcome@v2", { name: "Jane", app: "ECF" });

// 4. Modular RAG & ReRanker
const ragResult = await AI.rag().execute("How do I configure queues?", { topK: 3 });

// 5. Autonomous Tool-Calling Agent
const agent = AI.agent({
  tools: {
    getWeather: { description: "Fetch weather", execute: async ({ city }) => "Sunny 25C" }
  }
});
const output = await agent.run("Find weather in Tokyo");
```

---

## 📄 License
MIT Licensed.
