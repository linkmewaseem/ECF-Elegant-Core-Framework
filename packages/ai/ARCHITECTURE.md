# `@ecfjs/ai` — Architecture & Stability Freeze Document

> **STABLE — v1.0.0 | API LOCKED**  
> This document records the final architecture of `@ecfjs/ai`.  
> **No breaking changes** will be made to any public API, driver interface, or agent planner contract without a new major version (`v2.x.x`).

---

## 1. Package Identity

| Property    | Value                                       |
|-------------|---------------------------------------------|
| Package     | `@ecfjs/ai`                                 |
| Version     | `1.0.0` (Stable)                            |
| Milestone   | ECF Milestone 20                            |
| Author      | Muhammad Waseem                             |
| License     | MIT                                         |
| Node.js     | `>= 22`                                     |
| Module Type | ESM (`"type": "module"`)                    |
| Status      | 🟢 **PRODUCTION STABLE — API LOCKED**       |

---

## 2. Monorepo Dependency Graph

```
@ecfjs/contracts
    │
@ecfjs/core
    │
@ecfjs/support
    │
@ecfjs/ai (Milestone 20)
```

**Hard dependencies:** `@ecfjs/contracts`, `@ecfjs/core`, `@ecfjs/support`

---

## 3. Directory Structure

```
packages/ai/src/
├── drivers/
│   ├── BaseAiDriver.js       # Abstract base driver contract
│   ├── OpenAiDriver.js       # OpenAI driver
│   ├── AnthropicDriver.js    # Anthropic Claude driver
│   ├── GeminiDriver.js       # Google Gemini driver
│   ├── OllamaDriver.js       # Local Ollama LLM driver
│   ├── OpenRouterDriver.js   # OpenRouter multi-model driver
│   ├── GroqDriver.js         # Groq fast LLaMA driver
│   ├── MemoryAiDriver.js     # In-memory mock driver
│   └── NullAiDriver.js       # Silent null driver
│
├── memory/
│   └── ConversationMemory.js # Per-session chat history state
│
├── prompts/
│   └── PromptRegistry.js     # Versioned prompt template engine
│
├── embeddings/
│   ├── EmbeddingManager.js   # Vector embedding manager
│   └── Chunker.js            # Code & markdown text chunker
│
├── rag/
│   ├── RagPipeline.js        # Complete RAG pipeline
│   └── ReRanker.js           # Vector relevance re-ranker
│
├── agents/
│   ├── AgentPlanner.js       # Autonomous agent reflection planner
│   └── ToolRegistry.js       # Dynamic tool registry for agents
│
├── mcp/
│   └── McpManager.js         # Model Context Protocol connector
│
├── testing/
│   └── AiFake.js             # Testing fake & assertions
│
├── facades/
│   └── AiFacade.js           # `AI` static facade
│
├── AiManager.js              # Central AI IoC manager ("ai")
└── AiServiceProvider.js      # IoC Service Provider registration
```

---

## 4. Public API Surface (Locked at v1.0.0)

| Facade Method                             | Return Type            | Description                                  |
|-------------------------------------------|------------------------|----------------------------------------------|
| `AI.chat(prompt, options)`                | `Promise<ChatResult>`  | Executes chat completion via active driver   |
| `AI.stream(prompt, options)`              | `AsyncIterable<string>`| Streams response token chunks                |
| `AI.embed(text, options)`                 | `Promise<number[]>`    | Generates vector embeddings                  |
| `AI.memory(conversationId)`               | `ConversationMemory`   | Resolves stateful conversation memory session|
| `AI.agent(options)`                       | `AgentPlanner`         | Creates an autonomous agent planner instance |
| `AI.rag(options)`                         | `RagPipeline`          | Resolves RAG document search pipeline        |
| `AI.registerPrompt(name, template, ver)`  | `AiManager`            | Registers versioned prompt template          |
| `AI.prompt(nameWithVer, vars)`            | `string`               | Renders prompt template with variables       |
| `AI.mcp(serverName)`                      | `Promise<McpClient>`   | Connects to Model Context Protocol server    |
| `AI.fake()`                               | `AiFake`               | Activates in-memory AI testing fake          |

---

## 5. Test Suite Verification

- **Package Unit Tests**: 14/14 tests pass across 5 test suites.
- **App Real-Time Integration**: 9/9 real-time integration tests pass cleanly in `apps/testapp`.

---

## 6. Stability Policy

> **This package is STABLE. API is LOCKED.**

- ✅ Bug fixes → patch version (`1.0.x`)  
- ✅ New optional features (non-breaking) → minor version (`1.x.0`)  
- ❌ Any breaking API change → requires major version (`2.0.0`) + migration guide  

---

*Architecture Freeze — August 2026 | Muhammad Waseem*
