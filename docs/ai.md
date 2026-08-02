# `@ecf/ai` — Enterprise AI Engine & LLM Platform Documentation

`@ecf/ai` is the official first-party enterprise AI engine for ECF (Enterprise Core Framework).

---

## 🚀 Quick Example

```js
import { AI } from "@ecf/ai";

// 1. Multi-Provider Chat
const res = await AI.chat("Explain dependency injection");

// 2. Vector Embeddings
const vector = await AI.embed("ECF Enterprise Framework");

// 3. Conversation Memory
const memory = AI.memory("session-100").addMessage("user", "What is my order state?");

// 4. Prompt Versioning
const promptText = AI.prompt("customer_support@v2", { user: "Jane" });
```

---

## 📄 License
MIT Licensed.
