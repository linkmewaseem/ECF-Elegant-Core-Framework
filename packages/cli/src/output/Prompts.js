import readline from 'node:readline';

/**
 * Reusable Interactive CLI Prompts.
 */
export class Prompts {
  static async ask(question, defaultValue = '') {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const promptText = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;

    return new Promise((resolve) => {
      rl.question(promptText, (answer) => {
        rl.close();
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  static async confirm(question, defaultValue = true) {
    const hint = defaultValue ? '[Y/n]' : '[y/N]';
    const answer = await this.ask(`${question} ${hint}`);
    if (!answer) return defaultValue;
    return answer.toLowerCase().startsWith('y');
  }

  static async select(question, choices = [], defaultIndex = 0) {
    console.log(`\n\x1b[1m? ${question}\x1b[0m`);
    choices.forEach((choice, idx) => {
      const isDefault = idx === defaultIndex ? '*' : ' ';
      console.log(`  ${isDefault} ${idx + 1}) ${choice}`);
    });

    const answer = await this.ask(`Select option (1-${choices.length})`, String(defaultIndex + 1));
    const selectedIdx = parseInt(answer, 10) - 1;
    if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= choices.length) {
      return choices[defaultIndex];
    }
    return choices[selectedIdx];
  }
}
