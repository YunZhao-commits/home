import assert from "node:assert/strict";
import { test } from "node:test";
import { legacyRouteFromHash } from "../shared/legacy-route.js";
import { onRequest as shareMetadata } from "../functions/share/_middleware.js";
import { onRequest as sitemap } from "../functions/sitemap.xml.js";

const shell = `<!doctype html><html><head><title>Generic title</title>
<meta name="description" content="generic">
<meta property="og:title" content="generic"><meta property="og:description" content="generic">
<meta property="og:url" content="https://191607.xyz/"><meta property="og:type" content="website">
<meta property="og:image" content="https://191607.xyz/screenshots/main.jpg">
<meta name="twitter:title" content="generic"><meta name="twitter:description" content="generic">
<meta name="twitter:image" content="https://191607.xyz/screenshots/main.jpg">
<meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="https://191607.xyz/">
</head><body><div id="app"></div></body></html>`;

test("旧 hash 分享链接无损转换为可读路径，拒绝跨域形态", () => {
  assert.equal(legacyRouteFromHash("#/share?category=tools"), "/share?category=tools");
  assert.equal(legacyRouteFromHash("#/share/post-123?from=home#steps"), "/share/post-123?from=home#steps");
  assert.equal(legacyRouteFromHash("#/"), "/");
  assert.equal(legacyRouteFromHash("#section"), null);
  assert.equal(legacyRouteFromHash("#//evil.example/path"), null);
  assert.equal(legacyRouteFromHash("https://evil.example"), null);
});

test("分享详情返回按文章生成且已转义的社交预览元数据", async () => {
  const expectedId = "<script>alert(1)</script>";
  const db = {
    prepare(sql) {
      assert.match(sql, /status IN \('published', 'expired'\)/);
      return {
        bind(id) {
          assert.equal(id, expectedId);
          return { first: async () => ({
            id,
            title: '福利"><script>alert(1)</script>',
            summary: "适用条件与领取步骤说明",
            cover_url: "/api/media?id=" + "a".repeat(64),
          }) };
        },
      };
    },
  };
  const response = await shareMetadata({
    request: new Request(`https://191607.xyz/share/${encodeURIComponent(expectedId)}`),
    env: { DB: db },
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html; charset=utf-8", ETag: '"old"' } }),
  });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>福利&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt; \| Yunchu Studio 精选分享<\/title>/);
  assert.match(html, /name="description" content="适用条件与领取步骤说明"/);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /property="og:image" content="https:\/\/191607\.xyz\/api\/media\?id=a{64}"/);
  assert.match(html, /rel="canonical" href="https:\/\/191607\.xyz\/share\/%3Cscript%3Ealert\(1\)%3C%2Fscript%3E"/);
  assert.equal(response.headers.has("etag"), false);
});

test("分享列表和文章不存在时仍提供安全的通用元数据", async () => {
  const response = await shareMetadata({
    request: new Request("https://191607.xyz/share"),
    env: {},
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const html = await response.text();
  assert.match(html, /<title>精选分享 \| Yunchu Studio<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/191607\.xyz\/share"/);
});

test("动态站点地图包含已发布文章并对 XML 与 HTTP 方法做约束", async () => {
  const db = { prepare(sql) {
    assert.match(sql, /WHERE status = 'published'/);
    return { all: async () => ({ results: [
      { id: "member&deal", updated_at: "2026-11-08T12:00:00.000Z" },
      { id: "no-date", updated_at: "invalid-date" },
    ] }) };
  } };
  const response = await sitemap({ request: new Request("https://191607.xyz/sitemap.xml"), env: { DB: db } });
  const xml = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/xml/);
  assert.match(xml, /<loc>https:\/\/191607\.xyz\/share\/member%26deal<\/loc><lastmod>2026-11-08<\/lastmod>/);
  assert.doesNotMatch(xml, /no-date<\/loc><lastmod>/);
  assert.doesNotMatch(xml, /admin/);
  assert.equal((await sitemap({ request: new Request("https://191607.xyz/sitemap.xml", { method: "POST" }), env: { DB: db } })).status, 405);
});
