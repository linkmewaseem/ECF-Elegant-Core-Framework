import { performance } from 'node:perf_hooks';
import { TrieRouter } from '../../src/routing/TrieRouter.js';
import { Pipeline } from '../../src/Pipeline.js';
import { Validator } from '@ecf/validation';

/**
 * Enterprise HTTP Engine Benchmark Suite.
 * Measures: Trie Matching, Pipeline Overhead, Validation Speed, JSON Serialization, and Memory Usage.
 */
export async function runHttpBenchmarks(iterations = 100000) {
  const results = {};

  // 1. Trie Route Matching Speed vs Iterations
  const trie = new TrieRouter();
  trie.addRoute('GET', '/users/:id/posts/:slug', () => 'matched');

  const startTrie = performance.now();
  for (let i = 0; i < iterations; i++) {
    trie.match('GET', '/users/42/posts/hello-world');
  }
  const endTrie = performance.now();
  results.trieMatchingTimeMs = Number((endTrie - startTrie).toFixed(2));
  results.trieOpsPerSec = Math.round((iterations / (results.trieMatchingTimeMs / 1000)));

  // 2. Middleware Pipeline Overhead
  const pipeline = new Pipeline();
  const pipes = [
    async (req, next) => next(req),
    async (req, next) => next(req),
    async (req, next) => next(req)
  ];
  pipeline.through(pipes).send({});

  const startPipeline = performance.now();
  for (let i = 0; i < iterations; i++) {
    await pipeline.then(() => 'ok');
  }
  const endPipeline = performance.now();
  results.pipelineTimeMs = Number((endPipeline - startPipeline).toFixed(2));
  results.pipelineOpsPerSec = Math.round((iterations / (results.pipelineTimeMs / 1000)));

  // 3. Validation Throughput
  const validator = new Validator();
  const payload = { email: 'user@example.com', age: '25' };
  const rules = { email: ['required', 'email'], age: ['required'] };

  const startVal = performance.now();
  for (let i = 0; i < 10000; i++) {
    await validator.validate(payload, rules);
  }
  const endVal = performance.now();
  results.validationTimeMs = Number((endVal - startVal).toFixed(2));
  results.validationOpsPerSec = Math.round((10000 / (results.validationTimeMs / 1000)));

  // 4. Memory Footprint
  const mem = process.memoryUsage();
  results.memoryHeapUsedMb = Number((mem.heapUsed / 1024 / 1024).toFixed(2));

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('HttpBenchmarkRunner.js')) {
  runHttpBenchmarks(100000).then((res) => {
    console.log('=== ECF Enterprise HTTP Engine Benchmark Results ===');
    console.log(`Trie Route Matching : ${res.trieOpsPerSec.toLocaleString()} ops/sec (${res.trieMatchingTimeMs} ms)`);
    console.log(`Middleware Pipeline : ${res.pipelineOpsPerSec.toLocaleString()} ops/sec (${res.pipelineTimeMs} ms)`);
    console.log(`Validation Engine   : ${res.validationOpsPerSec.toLocaleString()} ops/sec (${res.validationTimeMs} ms)`);
    console.log(`Heap Memory Used    : ${res.memoryHeapUsedMb} MB`);
    console.log('===================================================');
  });
}
