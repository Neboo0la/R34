import axios from 'axios'

// Credentials — stored in .env.local (gitignored), never committed
const USER_ID = import.meta.env.VITE_R34_USER_ID ?? ''
const API_KEY  = import.meta.env.VITE_R34_API_KEY  ?? ''

// Always route through the /api Vite proxy (no env fallback ambiguity)
// No custom Accept header — it triggers CORS preflight which rule34 doesn't handle
const client = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// Attach credentials to every outgoing request when available
client.interceptors.request.use((config) => {
  if (USER_ID) config.params = { ...config.params, user_id: USER_ID }
  if (API_KEY)  config.params = { ...config.params, api_key:  API_KEY  }
  return config
})

// ── Simple TTL cache ────────────────────────────────────────────
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function getCached(key) {
  const e = cache.get(key)
  if (!e) return null
  if (Date.now() - e.ts > CACHE_TTL) { cache.delete(key); return null }
  return e.data
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
  if (cache.size > 300) cache.delete(cache.keys().next().value)
}

// ── Retry with exponential back-off ────────────────────────────
async function withRetry(fn, retries = 3, baseDelay = 800) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, baseDelay * 2 ** i))
    }
  }
}

// ── Normalise posts response ────────────────────────────────────
// Rule34 returns a plain array OR { post: [...] } (XML-style JSON)
function normalisePosts(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.post)) return data.post
  if (data && data.post) return [data.post]
  return []
}

// ── API methods ─────────────────────────────────────────────────

/** @param {{ tags?: string, pid?: number, limit?: number, id?: number|null }} opts */
async function getPosts({ tags = '', pid = 0, limit = 40, id = null } = {}) {
  const params = { page: 'dapi', s: 'post', q: 'index', json: 1, limit, pid }
  if (tags) params.tags = tags
  if (id != null) params.id = id

  const key = JSON.stringify(params)
  const hit = getCached(key)
  if (hit) return hit

  const data = await withRetry(async () => {
    const res = await client.get('/index.php', { params })

    // If we got HTML back (Cloudflare challenge / error page) treat as empty
    if (typeof res.data === 'string') {
      console.warn('[r34Api] received HTML instead of JSON — proxy may be blocked')
      return []
    }

    return normalisePosts(res.data)
  })

  setCache(key, data)
  return data
}

async function getPost(id) {
  return getPosts({ id })
}

async function autocomplete(q) {
  if (!q || q.trim().length < 2) return []

  const key = `ac:${q}`
  const hit = getCached(key)
  if (hit) return hit

  try {
    const data = await withRetry(async () => {
      const res = await client.get('/autocomplete.php', { params: { q } })
      if (typeof res.data === 'string') return []
      return Array.isArray(res.data) ? res.data : []
    }, 2, 400)
    setCache(key, data)
    return data
  } catch {
    return []
  }
}

async function getTags({ name = '', limit = 100, id = null } = {}) {
  const params = { page: 'dapi', s: 'tag', q: 'index', json: 1, limit }
  if (name) params.name = name
  if (id != null) params.id = id

  const key = `tags:${JSON.stringify(params)}`
  const hit = getCached(key)
  if (hit) return hit

  try {
    const res = await client.get('/index.php', { params })
    const data = Array.isArray(res.data) ? res.data : [].concat(res.data?.tag ?? [])
    setCache(key, data)
    return data
  } catch {
    return []
  }
}

function getTrendingTags() {
  return [
    { name: 'animated',           label: 'Animated',         count: 82000 },
    { name: 'solo',               label: 'Solo',              count: 74000 },
    { name: 'absurdres',          label: 'Absurd Res',        count: 68000 },
    { name: 'highres',            label: 'High Res',          count: 61000 },
    { name: 'large_breasts',      label: 'Large Breasts',     count: 57000 },
    { name: 'blonde_hair',        label: 'Blonde Hair',       count: 52000 },
    { name: 'dark_hair',          label: 'Dark Hair',         count: 47000 },
    { name: 'red_hair',           label: 'Red Hair',          count: 43000 },
    { name: 'elf',                label: 'Elf',               count: 38000 },
    { name: 'catgirl',            label: 'Cat Girl',          count: 34000 },
    { name: 'maid',               label: 'Maid',              count: 29000 },
    { name: 'schoolgirl_uniform', label: 'Schoolgirl',        count: 25000 },
    { name: 'nurse',              label: 'Nurse',             count: 22000 },
    { name: 'outdoor',            label: 'Outdoor',           count: 19000 },
    { name: 'duo',                label: 'Duo',               count: 16000 },
    { name: 'group',              label: 'Group',             count: 13000 },
    { name: 'looking_at_viewer',  label: 'Looking at Viewer', count: 11000 },
    { name: 'smile',              label: 'Smile',             count:  9500 },
    { name: 'blush',              label: 'Blush',             count:  8000 },
    { name: 'swimsuit',           label: 'Swimsuit',          count:  6500 }
  ].map((t, i) => ({ ...t, rank: i + 1 }))
}

export const r34Api = { getPosts, getPost, autocomplete, getTags, getTrendingTags }
export default r34Api
