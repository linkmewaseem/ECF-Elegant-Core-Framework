import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { FFmpegDriver } from '../../src/index.js';

describe('@ecf/media — FFmpegDriver Unit Tests', () => {
  test('FFmpegDriver mock execution mode', async () => {
    const driver = new FFmpegDriver({ mockMode: true });
    assert.equal(driver.isMockMode, true);

    const transcodeRes = await driver.transcode('in.mp4', './tmp/test-video.mp4', 'mp4');
    assert.equal(transcodeRes.mock, true);

    const thumbRes = await driver.extractThumbnail('in.mp4', './tmp/test-thumb.jpg', 2, '320x240');
    assert.equal(thumbRes.mock, true);

    const hlsRes = await driver.generateHls('in.mp4', './tmp/hls-out');
    assert.ok(hlsRes.masterPath);

    const wfRes = await driver.generateWaveform('in.mp3', './tmp/waveform.json');
    assert.ok(wfRes.data);
  });
});
