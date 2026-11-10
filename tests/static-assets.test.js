import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';

test('背景轮换只请求存在且已压缩的本地图片', async () => {
  const source = await readFile(new URL('../src/components/Background.vue', import.meta.url), 'utf8');
  const match = source.match(/const availableImages\s*=\s*\[([^\]]+)\]/);
  assert.ok(match, '背景轮换列表应明确列出资源编号');
  assert.doesNotMatch(source, /background[01]\.jpg|api\.vvhan\.com/);

  const imageIds = [...match[1].matchAll(/\d+/g)].map((entry) => Number(entry[0]));
  assert.ok(imageIds.length > 0);
  for (const id of imageIds) {
    const path = new URL(`../public/images/background${id}.jpg`, import.meta.url);
    const file = await stat(path);
    assert.ok(file.isFile(), `背景图片 background${id}.jpg 必须存在`);
    assert.ok(file.size < 300 * 1024, `背景图片 background${id}.jpg 应小于 300KB`);
  }
});

test('首页主背景与多尺寸 favicon 保持在体积目标内', async () => {
  const hero = await stat(new URL('../public/images/hero-starry-lake.webp', import.meta.url));
  const favicon = await stat(new URL('../public/images/icon/favicon.ico', import.meta.url));
  const iconData = await readFile(new URL('../public/images/icon/favicon.ico', import.meta.url));
  assert.ok(hero.size < 300 * 1024, '首页主背景 WebP 应小于 300KB');
  assert.ok(favicon.size < 50 * 1024, 'favicon 应小于 50KB');
  assert.equal(iconData.readUInt16LE(0), 0, 'ICO 保留字段应为 0');
  assert.equal(iconData.readUInt16LE(2), 1, '图标类型应为 ICO');
  assert.ok(iconData.readUInt16LE(4) >= 3, 'favicon 应包含多个尺寸');
});

test('社交入口只渲染已配置的有效链接', async () => {
  const source = await readFile(new URL('../src/components/SocialLinks.vue', import.meta.url), 'utf8');
  assert.match(source, /<nav v-if="socialLinks\.length"/);
  assert.match(source, /\.filter\(item\s*=>\s*Boolean\(item\.url\)\)/);
  assert.doesNotMatch(source, /链接尚未配置|is-unconfigured/);
});
