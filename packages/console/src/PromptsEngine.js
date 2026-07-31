import readline from "node:readline";

export class PromptsEngine {
  constructor(input = process.stdin, output = process.stdout) {
    this.input = input;
    this.output = output;
  }

  async ask(question, defaultValue = null) {
    const rl = readline.createInterface({
      input: this.input,
      output: this.output,
    });

    const promptText = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;

    return new Promise((resolve) => {
      rl.question(promptText, (answer) => {
        rl.close();
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async confirm(question, defaultValue = false) {
    const suffix = defaultValue ? " [Y/n]" : " [y/N]";
    const answer = await this.ask(`${question}${suffix}`);
    if (!answer) return defaultValue;
    return answer.toLowerCase().startsWith("y");
  }

  async choice(question, choices = [], defaultChoice = null) {
    this.output.write(`${question}\n`);
    choices.forEach((choice, index) => {
      this.output.write(`  [${index + 1}] ${choice}\n`);
    });

    const answer = await this.ask("Select option", defaultChoice ? choices.indexOf(defaultChoice) + 1 : 1);
    const index = parseInt(answer, 10) - 1;
    return choices[index] !== undefined ? choices[index] : choices[0];
  }
}

export default PromptsEngine;
