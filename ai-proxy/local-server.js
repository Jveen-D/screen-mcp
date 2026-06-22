/**
 * 本地开发代理服务器
 *
 * 用法：
 *   node ai-proxy/local-server.js
 * 默认监听 http://localhost:3456
 *
 * 前端 Base URL 填写：
 *   http://localhost:3456/v1?target=<目标 baseURL 的 URL 编码>
 * 例如 OpenAI：
 *   http://localhost:3456/v1?target=https%3A%2F%2Fapi.openai.com%2Fv1
 */

const http = require('node:http')
const https = require('node:https')
const url = require('node:url')

const PORT = process.env.PORT || 3456

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)
  const target = parsed.query.target

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, anthropic-version')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (!target) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Missing ?target= parameter' }))
    return
  }

  let pathname = parsed.pathname
  if (pathname === '/' || pathname === '/v1') {
    pathname = '/v1/chat/completions'
  }
  // 避免 target 以 /v1 结尾且 pathname 以 /v1 开头时重复
  if (target.endsWith('/v1') && pathname.startsWith('/v1')) {
    pathname = pathname.slice(3)
  }
  const targetURL = new URL(`${target.replace(/\/$/, '')}${pathname}`)
  const client = targetURL.protocol === 'https:' ? https : http

  const proxyReq = client.request(
    {
      hostname: targetURL.hostname,
      port: targetURL.port || (targetURL.protocol === 'https:' ? 443 : 80),
      path: targetURL.pathname + targetURL.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetURL.hostname,
      },
    },
    proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res, { end: true })
    },
  )

  proxyReq.on('error', error => {
    console.error('Proxy error:', error.message)
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error.message }))
  })

  req.pipe(proxyReq, { end: true })
})

server.listen(PORT, () => {
  console.log(`AI proxy server running at http://localhost:${PORT}`)
  console.log(`Example baseURL: http://localhost:${PORT}/v1?target=https%3A%2F%2Fapi.kimi.com%2Fcoding%2Fv1`)
})
