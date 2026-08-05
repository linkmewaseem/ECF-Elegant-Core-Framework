import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { VideoProcessor, FFmpegDriver } from '../../src/index.js';

describe('@ecfjs/media — VideoProcessor Unit Tests', () => {
  test('Fluent options builder for video transcoding, thumbnails, sprites & HLS', () => {
    const driver = new FFmpegDriver({ mockMode: true });
    const video = new VideoProcessor(driver, 'sample.mp4');

    video
      .transcode('mp4', { bitrate: '2.5M' })
      .thumbnail(5, '1280x720')
      .sprite(10, '160x90')
      .hls({ segmentDuration: 10 })
      .dash()
      .adaptiveBitrate(['1080p', '720p', '480p']);

    const opts = video.getOptions();
    assert.equal(opts.transcodeFormat, 'mp4');
    assert.equal(opts.thumbnailOpts.atSec, 5);
    assert.equal(opts.spriteOpts.intervalSec, 10);
    assert.ok(opts.hlsOpts);
    assert.ok(opts.dashOpts);
    assert.equal(opts.adaptiveBitrateOpts.resolutions.length, 3);
  });

  test('VideoProcessor process execution pipeline', async () => {
    const driver = new FFmpegDriver({ mockMode: true });
    const video = new VideoProcessor(driver, 'input.mp4');

    video
      .transcode('mp4')
      .thumbnail(2)
      .sprite()
      .hls();

    const res = await video.process('./tmp/video-output');

    assert.ok(res.outputs.transcode);
    assert.ok(res.outputs.thumbnail);
    assert.ok(res.outputs.sprite);
    assert.ok(res.outputs.hls);
    assert.equal(res.outputs.transcode.mock, true);
  });
});
