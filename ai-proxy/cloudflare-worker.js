/**
 * Cloudflare Worker：AI 模型请求代理
 *
 * 作用：绕过浏览器 CORS 限制，将前端的聊天请求转发到任意 OpenAI-compatible API。
 * 部署后，前端 Base URL 填写：
 *   https://<你的-worker域名>/v1?target=<目标 baseURL 的 URL 编码>
 * 例如 OpenAI：
 *   https://<你的-worker域名>/v1?target=https%3A%2F%2Fapi.openai.com%2Fv1
 *
 * 注意：此 Worker 只转发请求，不存储 API Key。Key 仍然由用户在前端填写并随请求发送。
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const target = url.searchParams.get('target')

    if (!target) {
      return new Response(
        JSON.stringify({ error: 'Missing ?target= parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // 构造目标 URL：保留 /v1/chat/completions 路径
    let pathname = url.pathname
    if (pathname === '/' || pathname === '/v1') {
      pathname = '/v1/chat/completions'
    }
    const targetURL = `${target.replace(/\/$/, '')}${pathname}`

    // 复制请求头，确保 Content-Type 和 Authorization 被转发
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.set('Content-Type', 'application/json')

    try {
      const response = await fetch(targetURL, {
        method: request.method,
        headers,
        body: request.body,
      })

      // 复制响应头，并添加 CORS 头
      const corsHeaders = new Headers(response.headers)
      corsHeaders.set('Access-Control-Allow-Origin', '*')
      corsHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      corsHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders })
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: corsHeaders,
      })
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Proxy error' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }
  },
}
