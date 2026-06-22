/**
 * Vercel Edge Function：AI 模型请求代理
 *
 * 部署路径：/api/ai-proxy
 * 前端 Base URL 填写：
 *   https://<你的-vercel域名>/api/ai-proxy/v1?target=<目标 baseURL 的 URL 编码>
 * 例如 OpenAI：
 *   https://<你的-vercel域名>/api/ai-proxy/v1?target=https%3A%2F%2Fapi.openai.com%2Fv1
 *
 * 部署方式：在 Vercel 项目里创建 api/ai-proxy.ts（或 .js），Vercel 会自动识别 Edge Runtime。
 */

import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: NextRequest) {
  const url = new URL(request.url)
  const target = url.searchParams.get('target')

  if (!target) {
    return new Response(
      JSON.stringify({ error: 'Missing ?target= parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let pathname = url.pathname.replace('/api/ai-proxy', '')
  if (pathname === '' || pathname === '/v1') {
    pathname = '/v1/chat/completions'
  }
  const targetURL = `${target.replace(/\/$/, '')}${pathname}`

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('Content-Type', 'application/json')

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const response = await fetch(targetURL, {
      method: request.method,
      headers,
      body: request.body,
    })

    const corsHeaders = new Headers(response.headers)
    corsHeaders.set('Access-Control-Allow-Origin', '*')
    corsHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    corsHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
}
