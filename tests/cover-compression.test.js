import test from 'node:test';
import assert from 'node:assert/strict';
import { compressCover } from '../src/utils/coverCompression.js';

test('cover validation distinguishes type and source size', async () => {
  await assert.rejects(compressCover({ type: 'text/plain', size: 20 }), /格式不支持/);
  await assert.rejects(compressCover({ type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 }), /超过 10MB/);
});

test('cover compressor distinguishes decoding and encoding errors and reduces dimensions', async () => {
  const old = { FileReader: globalThis.FileReader, Image: globalThis.Image, document: globalThis.document };
  let badImage = false;
  let badEncode = false;
  const dimensions = [];
  globalThis.FileReader = class {
    readAsDataURL() { this.result = 'data:image/jpeg;base64,AAAA'; queueMicrotask(() => this.onload()); }
  };
  globalThis.Image = class {
    naturalWidth = 2048;
    naturalHeight = 1152;
    set src(value) {
      assert.match(value, /^data:/);
    }
    decode() { return badImage ? Promise.reject(new Error('invalid image')) : Promise.resolve(); }
  };
  globalThis.document = { createElement: () => ({
    getContext: () => ({ drawImage() {} }),
    toBlob(callback) {
      dimensions.push(this.width);
      callback(badEncode ? null : { type: 'image/webp', size: this.width > 900 ? 300000 : 200000 });
    },
  }) };
  try {
    badImage = true;
    await assert.rejects(compressCover({ type: 'image/jpeg', size: 10 }), /解码失败/);
    badImage = false;
    badEncode = true;
    await assert.rejects(compressCover({ type: 'image/png', size: 10 }), /编码失败/);
    badEncode = false;
    const result = await compressCover({ type: 'image/webp', size: 10 });
    assert.ok(result.size <= 256 * 1024);
    assert.ok(dimensions.includes(1280) && dimensions.some(width => width < 1280));
  } finally {
    Object.assign(globalThis, old);
  }
});
