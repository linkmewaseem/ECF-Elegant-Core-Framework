import { performance } from 'node:perf_hooks';
import Lexer from '../../src/compiler/Lexer.js';
import Parser from '../../src/compiler/Parser.js';
import Optimizer from '../../src/compiler/Optimizer.js';
import CodeGenerator from '../../src/compiler/CodeGenerator.js';

/**
 * Enterprise View Engine Benchmark Suite.
 * Measures Lexer Tokenization, AST Parsing, Optimization, and Code Generator Throughput.
 */
export function runViewBenchmarks(iterations = 50000) {
  const sampleTemplate = `
    <div class="user-card">
      <h2>{{ user.name }}</h2>
      @if(user.isAdmin)
        <span class="badge">Admin</span>
      @else
        <span class="badge">User</span>
      @endif

      <ul>
        @for(user.items as item)
          <li>{{ item.name }} - \${{ item.price }}</li>
        @endfor
      </ul>
    </div>
  `;

  const results = {};

  // 1. Lexer Tokenization
  const lexer = new Lexer();
  const startLex = performance.now();
  for (let i = 0; i < iterations; i++) {
    lexer.lex(sampleTemplate);
  }
  const endLex = performance.now();
  results.lexerTimeMs = Number((endLex - startLex).toFixed(2));
  results.lexerOpsPerSec = Math.round((iterations / (results.lexerTimeMs / 1000)));

  // 2. Compiler Pipeline (Lex + Parse + Optimize + CodeGen)
  const parser = new Parser();
  const optimizer = new Optimizer();
  const codeGen = new CodeGenerator();

  const startPipeline = performance.now();
  for (let i = 0; i < iterations; i++) {
    const tokens = lexer.lex(sampleTemplate);
    const rawAst = parser.parse(tokens);
    const optAst = optimizer.optimize(rawAst);
    codeGen.generate(optAst);
  }
  const endPipeline = performance.now();
  results.compilerPipelineTimeMs = Number((endPipeline - startPipeline).toFixed(2));
  results.compilerOpsPerSec = Math.round((iterations / (results.compilerPipelineTimeMs / 1000)));

  // 3. Memory Footprint
  const mem = process.memoryUsage();
  results.memoryHeapUsedMb = Number((mem.heapUsed / 1024 / 1024).toFixed(2));

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('ViewBenchmarkRunner.js')) {
  const res = runViewBenchmarks(50000);
  console.log('=== ECF Enterprise View Engine Benchmark Results ===');
  console.log(`Lexer Tokenization  : ${res.lexerOpsPerSec.toLocaleString()} ops/sec (${res.lexerTimeMs} ms)`);
  console.log(`AST Compiler Pipeline: ${res.compilerOpsPerSec.toLocaleString()} ops/sec (${res.compilerPipelineTimeMs} ms)`);
  console.log(`Heap Memory Used    : ${res.memoryHeapUsedMb} MB`);
  console.log('===================================================');
}
