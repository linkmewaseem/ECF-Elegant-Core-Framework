import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { AudioProcessor, FFmpegDriver } from '../../src/index.js';

describe('@ecfjs/media — AudioProcessor Unit Tests', () => {
  test('Fluent options builder for audio normalization, trim, merge, waveform & spectrogram', () => {
    const driver = new FFmpegDriver({ mockMode: true });
    const audio = new AudioProcessor(driver, 'sample.mp3');

    audio
      .normalize(-14)
      .trim(5, 30)
      .merge(['intro.mp3', 'outro.mp3'])
      .waveform('json')
      .spectrogram();

    const opts = audio.getOptions();
    assert.equal(opts.normalizeOpts.targetLoudness, -14);
    assert.equal(opts.trimOpts.startSec, 5);
    assert.equal(opts.mergeFiles.length, 2);
    assert.equal(opts.waveformOpts.format, 'json');
    assert.ok(opts.spectrogramOpts);
  });

  test('AudioProcessor process execution pipeline', async () => {
    const driver = new FFmpegDriver({ mockMode: true });
    const audio = new AudioProcessor(driver, 'input.mp3');

    audio
      .normalize()
      .trim(0, 15)
      .waveform('json');

    const res = await audio.process('./tmp/audio-output');

    assert.ok(res.outputs.normalize);
    assert.ok(res.outputs.trim);
    assert.ok(res.outputs.waveform);
    assert.equal(res.outputs.waveform.data.peaks.length > 0, true);
  });
});
