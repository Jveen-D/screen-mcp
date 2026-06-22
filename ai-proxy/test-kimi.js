/**
 * 测试 Kimi Code API 连通性
 *
 * 用法：
 *   node ai-proxy/test-kimi.js
 *
 * 需要把下面的 API_KEY 替换成你的 Kimi Code API Key
 */

const https = require('node:https')

const API_KEY = '你的KimiCodeApiKey'

if (API_KEY === '你的KimiCodeApiKey') {
  console.error('请先修改本文件里的 API_KEY 变量')
  process.exit(1)
}

function request(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      },
      res => {
        let data = ''
        res.on('data', chunk => {
          data += chunk
        })
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data })
        })
      },
    )
    req.on('error', reject)
    req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  const tests = [
    {
      name: 'OpenAI 兼容 /v1/chat/completions',
      hostname: 'api.kimi.com',
      path: '/coding/v1/chat/completions',
      body: {
        model: 'kimi-for-coding',
        messages: [{ role: 'user', content: 'hello' }],
        stream: false,
      },
    },
    {
      name: 'Anthropic 兼容 /v1/messages',
      hostname: 'api.kimi.com',
      path: '/coding/v1/messages',
      body: {
        model: 'kimi-for-coding',
        messages: [{ role: 'user', content: 'hello' }],
        max_tokens: 1024,
      },
    },
    {
      name: 'OpenAI 兼容 /chat/completions（不带 /v1）',
      hostname: 'api.kimi.com',
      path: '/coding/chat/completions',
      body: {
        model: 'kimi-for-coding',
        messages: [{ role: 'user', content: 'hello' }],
        stream: false,
      },
    },
  ]

  for (const test of tests) {
    console.log(`\n=== ${test.name} ===`)
    try {
      const result = await request(test.hostname, test.path, test.body)
      console.log(`Status: ${result.status}`)
      console.log(`Response: ${result.body.slice(0, 500)}`)
    } catch (error) {
      console.error(`Error: ${error.message}`)
    }
  }
}

main()
