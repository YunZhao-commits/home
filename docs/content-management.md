# Yunchu Studio 内容管理

## 日常发帖

打开 `https://191607.xyz/#/admin`，使用 Cloudflare Pages 加密变量 `ADMIN_PASSWORD` 中配置的站长密码登录。新增、编辑、发布、下架、恢复、分类和站点文字设置都直接写入 D1；**日常内容修改无需 Git 提交或重新部署**。访客只读公开列表与详情。

文章支持草稿、发布、已结束、下架和回收站。删除操作是可恢复的软删除；从回收站可恢复为草稿。含邀请链接的文章应填写清楚披露说明。封面限 PNG/JPEG/WebP，浏览器自动缩到 1280×900、256KB 内后存入 D1。

## 当前 Cloudflare D1 升级

数据库控制台执行 `functions/catalog_schema.sql` 中的语句前，先运行 `PRAGMA table_info(posts);`：如果已存在 `cover_url`，跳过那条 `ALTER TABLE`；其他 `CREATE TABLE IF NOT EXISTS` 与默认分类 `INSERT OR IGNORE` 可重复执行。此迁移不删除或重建 `posts`、`page_views` 及其现有数据。当前生产库已完成此升级。

以后新建空数据库，应运行完整的 `functions/schema.sql`。`catalog_schema.sql` 只用于已经存在旧版 `posts` 表的数据库。

## 本地检查

运行 `npm run test:content` 检查鉴权、草稿/发布/下架/恢复、分类管理、站点设置、封面上传、非法输入和公开 API。测试只创建内存数据库及本地测试数据，不连接生产 D1。
