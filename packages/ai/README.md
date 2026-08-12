# `@ecfjs/ai` — Enterprise AI & LLM Engine

> **Stable Release — v1.0.0**  
> This package is production-ready and API-locked. No breaking changes will be made to public APIs without a major version increment.

`@ecfjs/ai` is the official artificial intelligence platform for the ECF (Enterprise Core Framework) ecosystem. It delivers multi-driver LLM orchestration (OpenAI, Anthropic, Gemini, Groq, Ollama, OpenRouter, Memory, Null), streaming response tokenization, vector embedding generation, RAG document search pipelines, autonomous agent planners with tool registries, Model Context Protocol (MCP) server connectors, versioned prompt registries, and testing fakes.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Supported Drivers](#supported-drivers)
- [Basic Usage — `AI` Facade](#basic-usage--ai-facade)
- [Streaming Token Responses](#streaming-token-responses)
- [Vector Embeddings](#vector-embeddings)
- [Autonomous Agent Planner](#autonomous-agent-planner)
- [RAG (Retrieval-Augmented Generation) Pipeline](#rag-retrieval-augmented-generation-pipeline)
- [Conversation Memory](#conversation-memory)
- [Versioned Prompt Templates](#versioned-prompt-templates)
- [Testing — AI Fake](#testing--ai-fake)
- [API Reference](#api-reference)
- [License](#license)

---

## Features

- 🤖 **Multi-Driver LLM Support**: Native drivers for OpenAI, Anthropic, Gemini, Groq, Ollama, OpenRouter, Memory, and Null.
- ⚡ **Streaming Token Responses**: Async iterable token streaming (`AI.stream()`).
- 📐 **Vector Embeddings**: Text-to-vector embedding generation (`AI.embed()`).
- 🤖 **Autonomous Agent Engine**: Reflective agent planner with dynamic `ToolRegistry` tool execution (`AI.agent()`).
- 📚 **RAG Pipeline**: Document loader, chunker, vector store, retriever, and re-ranker pipeline (`AI.rag()`).
- 💾 **Stateful Conversation Memory**: Per-session message history management (`AI.memory(id)`).
- 📝 **Prompt Template Registry**: Versioned prompt template rendering (`AI.registerPrompt()` & `AI.prompt()`).
- 🔌 **Model Context Protocol (MCP)**: Dynamic MCP server connector (`AI.mcp()`).
- 🧪 **Testing Fake**: `AI.fake()`, `assertChatted()`, `assertEmbedded()`.

---

## Installation

```bash
# Included by default in ECF workspace
npm install @ecfjs/ai
```

---

## Configuration

Create `config/ai.js` in your application:

```javascript
export default {
    driver: process.env.AI_DRIVER || "openai",

    openai: {
        apiKey: process.env.OPENAI_API_KEY || null,
        model: process.env.OPENAI_MODEL || "gpt-4o",
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || null,
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || null,
        model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
    },
    ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: process.env.OLLAMA_MODEL || "llama3",
    },
    groq: {
        apiKey: process.env.GROQ_API_KEY || null,
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
    },
};
```

---

## Basic Usage — `AI` Facade

```javascript
import { AI } from "@ecfjs/ai";

// Chat with default driver
const res = await AI.chat("Explain microservices architecture.");
console.log(res.text);

// Chat with specific driver & model override
const geminiRes = await AI.chat("Summarize codebase.", {
    driver: "gemini",
    model: "gemini-1.5-pro"
});
```

---

## Streaming Token Responses

```javascript
for await (const chunk of AI.stream("Write a Python script for web scraping.")) {
    process.stdout.write(chunk);
}
```

---

## Vector Embeddings

```javascript
const vector = await AI.embed("Enterprise Core Framework AI Engine");
console.log("Vector dimensions:", vector.length); // 1536
```

---

## Autonomous Agent Planner

```javascript
const agent = AI.agent();

// Register dynamic tool
agent.tools.register("get_user_stats", "Fetches active user metrics", async (args) => {
    return { activeUsers: 1420, systemStatus: "Healthy" };
});

const result = await agent.run("Fetch active user metrics and verify system status");
console.log("Agent Output:", result.output);
```

---

## RAG Pipeline

```javascript
const rag = AI.rag();

const documents = [
    "ECF Framework supports SSR, ORM, Mail, and AI.",
    "ECF AI package includes 8 multi-model LLM drivers.",
    "Unrelated document about cooking recipes."
];

const res = await rag.execute("What features are supported in ECF?", { documents });
console.log("Answer:", res.answer);
```

---

## Testing — AI Fake

```javascript
import { AI } from "@ecfjs/ai";

const fakeAi = AI.fake();

await AI.chat("Hello AI engine", { driver: "openai" });
await AI.embed("Embedding text", { driver: "openai" });

fakeAi.assertChatted("Hello AI engine");
fakeAi.assertEmbedded("Embedding text");
```

---

## License

MIT — © Muhammad Waseem
