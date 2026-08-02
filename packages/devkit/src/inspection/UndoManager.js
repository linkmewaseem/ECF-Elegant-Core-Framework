import fs from 'node:fs';

/**
 * Undo History Manager (ecf undo).
 * Reverses recent code generator write operations.
 */
export class UndoManager {
  static #history = [];

  static record(filePath, action) {
    UndoManager.#history.push({ filePath, action, time: Date.now() });
  }

  static undo() {
    if (UndoManager.#history.length === 0) return null;
    const last = UndoManager.#history.pop();
    if (last.action === 'CREATED' && fs.existsSync(last.filePath)) {
      fs.unlinkSync(last.filePath);
    }
    return last;
  }
}

export default UndoManager;
