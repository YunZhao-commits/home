export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. 让数据库里的 count 数字 +1
    await env.DB.prepare(
      "UPDATE page_views SET count = count + 1 WHERE id = 1"
    ).run();

    // 2. 把更新后的数字查出来
    const result = await env.DB.prepare(
      "SELECT count FROM page_views WHERE id = 1"
    ).first();

    // 3. 把结果打包成 JSON 发给前端
    return Response.json({ count: result.count });
  } catch (error) {
    // 如果出错，返回错误信息（防止接口死掉）
    return Response.json({ error: error.message }, { status: 500 });
  }
}
