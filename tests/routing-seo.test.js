import assert from "node:assert/strict";
import { test } from "node:test";
import { legacyRouteFromHash } from "../shared/legacy-route.js";
import { onRequest as pageMetadata } from "../functions/_middleware.js";
import { onRequest as shareMetadata } from "../functions/share/_middleware.js";
import { onRequest as catchUnknownPath } from "../functions/[[path]].js";
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

test("常规页面返回有意义的搜索元数据，后台禁止搜索引擎收录", async () => {
  const home = await pageMetadata({
    request: new Request("https://191607.xyz/"),
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const homeHtml = await home.text();
  assert.match(homeHtml, /<title>Yunchu Studio \| 云初工作室<\/title>/);
  assert.match(homeHtml, /application\/ld\+json/);
  assert.match(homeHtml, /"@type":"WebSite"/);
  assert.match(homeHtml, /<noscript><main>/);
  assert.match(homeHtml, /在山与星之间，记录热爱，分享美好。/);

  const about = await pageMetadata({
    request: new Request("https://191607.xyz/about"),
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /<title>关于本站 \| Yunchu Studio<\/title>/);
  assert.match(aboutHtml, /name="description" content="了解 Yunchu Studio/);
  assert.match(aboutHtml, /rel="canonical" href="https:\/\/191607\.xyz\/about"/);

  const admin = await pageMetadata({
    request: new Request("https://191607.xyz/admin"),
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  assert.equal(admin.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(await admin.text(), /name="robots" content="noindex, nofollow"/);
});

test("首页 SEO 标题、描述与非脚本正文读取公开站点配置且正确转义", async () => {
  const db = {
    prepare(sql) {
      assert.match(sql, /site_settings/);
      return { first: async () => ({
        value: JSON.stringify({
          site_name: '<script>alert(1)</script>',
          site_cn: '云初测试站',
          tagline: '分享工具与资源',
          about_intro: '公开介绍文本',
          quote: '不可信内容 <img src=x onerror=alert(1)>',
        }),
      }) };
    },
  };
  const response = await pageMetadata({
    request: new Request("https://191607.xyz/"),
    env: { DB: db },
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const html = await response.text();
  assert.match(html, /<title>&lt;script&gt;alert\(1\)&lt;\/script&gt; \| 云初测试站<\/title>/);
  assert.match(html, /name="description" content="分享工具与资源\. 公开介绍文本"/);
  assert.match(html, /不可信内容 &lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
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
            content: "### 领取方式\n打开官方页面并按提示操作。\n\n不要输入无关个人信息。",
            category: "会员福利",
            link_type: "invite",
            link_url: "https://example.com/invite?ref=123&x=<unsafe>",
            disclosure: "使用邀请链接可能获得奖励。",
            status: "published",
            created_at: "2026-11-01T00:00:00.000Z",
            updated_at: "2026-11-08T00:00:00.000Z",
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
  assert.match(html, /<h1>福利&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/h1>/);
  assert.match(html, /打开官方页面并按提示操作。/);
  assert.match(html, /rel="nofollow noopener noreferrer"/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.equal(response.headers.has("etag"), false);
});

test("分享列表和文章不存在时仍提供安全的通用元数据", async () => {
  const response = await shareMetadata({
    request: new Request("https://191607.xyz/share"),
    env: {},
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const html = await response.text();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(html, /<title>精选分享 \| Yunchu Studio<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/191607\.xyz\/share"/);
  assert.match(html, /精选分享暂时无法加载/);
});

test("文章数据库故障返回 503，而不是把错误页面伪装成可索引的 200", async () => {
  const db = { prepare() { throw new Error("database offline"); } };
  const response = await shareMetadata({
    request: new Request("https://191607.xyz/share/post-1"), env: { DB: db },
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(await response.text(), /精选分享暂时无法加载/);
});

test("分享列表首屏带有可抓取的真实内容文本与站内详情链接", async () => {
  const db = { prepare(sql) {
    assert.match(sql, /SELECT id, title, summary, category, status FROM posts/);
    return { all: async () => ({ results: [
      { id: "member&deal", title: "会员福利", summary: "按步骤领取服务权益。", category: "会员", status: "published" },
    ] }) };
  } };
  const response = await shareMetadata({
    request: new Request("https://191607.xyz/share"), env: { DB: db },
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const html = await response.text();
  assert.match(html, /<h1>精选分享<\/h1>/);
  assert.match(html, /href="\/share\/member%26deal"/);
  assert.match(html, /按步骤领取服务权益。/);
});

test("不存在的分享文章返回真实 404，并设置 noindex", async () => {
  const db = { prepare() { return { bind() { return { first: async () => null }; } }; } };
  const response = await shareMetadata({
    request: new Request("https://191607.xyz/share/missing"), env: { DB: db },
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  const html = await response.text();
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(html, /这个页面暂时找不到/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});

test("未知前端路径返回真实 404，但合法前端路径保持 SPA 响应", async () => {
  const response = await catchUnknownPath({
    request: new Request("https://191607.xyz/not-a-real-route"),
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  assert.equal(response.status, 404);
  assert.match(await response.text(), /这个页面暂时找不到/);

  const valid = await catchUnknownPath({
    request: new Request("https://191607.xyz/about"),
    next: async () => new Response(shell, { headers: { "Content-Type": "text/html" } }),
  });
  assert.equal(valid.status, 200);
  assert.equal(await valid.text(), shell);
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
