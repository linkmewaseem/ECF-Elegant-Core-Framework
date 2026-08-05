# Architecture Decision Record (ADR) — `@ecfjs/ai`

## Status
Approved & Implemented

## Context
ECF required a first-party, AI-native platform for integrating LLMs, embeddings, RAG pipelines, autonomous tool-calling agents, conversation memory, cost telemetry, safety moderation, and Model Context Protocol (MCP) tool abstractions across backend applications.

## Decisions

1. **Provider Driver Matrix**: Standardized drivers (`OpenAI`, `Anthropic`, `Gemini`, `Ollama`, `OpenRouter`, `Groq`, `Memory`, `Null`) exposing a unified capability matrix.
2. **Stateful Conversation Memory**: `ConversationMemory` isolates message history by conversation ID.
3. **Prompt Versioning**: `PromptRegistry` supports tagged template versions (`prompt@v1`, `prompt@v2`) with fallback.
4. **Modular RAG Stage Pipeline**: `RagPipeline` decouples Loader, Chunker, Embedder, VectorStore, Retriever, ReRanker, and Generator.
5. **Planner & Reflection Loop**: `AgentPlanner` provides structured multi-turn planning (`Planner ➔ Executor ➔ Memory ➔ Reflection`).
6. **Model Context Protocol (MCP)**: `McpManager` provides future-proof abstraction for connecting MCP tool servers.

## Consequences
Establishes ECF as a 10/10 AI-native enterprise framework.
