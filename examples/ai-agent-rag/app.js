import { AI } from '@ecfjs/ai';

export async function askSupportBot(question) {
  const memory = AI.memory('session-user-1').addMessage('user', question);
  const ragResult = await AI.rag().execute(question, {
    documents: [
      'ECF Refund Policy: Customers get 30 days money-back guarantee.',
      'ECF Shipping Policy: Express shipping takes 2 business days.',
    ],
    driver: 'memory',
  });

  memory.addMessage('assistant', ragResult.answer);
  return { question, answer: ragResult.answer, history: memory.getHistory() };
}
