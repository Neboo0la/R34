/**
 * Shared utilities for working with Rule34 post objects.
 */

export function usePostUtils() {
  function isVideo(post) {
    return post?.file_url?.match(/\.(mp4|webm|ogv)$/i) !== null
  }

  function isGif(post) {
    return post?.file_url?.match(/\.gif$/i) !== null
  }

  function getMediaType(post) {
    if (isVideo(post)) return 'video'
    if (isGif(post)) return 'gif'
    return 'image'
  }

  function parseTags(post) {
    if (!post?.tags) return []
    return post.tags.split(' ').filter(Boolean)
  }

  function getArtistTags(post) {
    return parseTags(post).filter(t => t.includes('(artist)') || t.startsWith('artist:'))
  }

  function formatScore(score) {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
    return String(score ?? 0)
  }

  function formatResolution(post) {
    if (!post?.width || !post?.height) return ''
    return `${post.width}×${post.height}`
  }

  function getRatingLabel(rating) {
    const map = { s: 'Safe', q: 'Questionable', e: 'Explicit', 'explicit': 'Explicit', 'safe': 'Safe', 'questionable': 'Questionable' }
    return map[rating?.toLowerCase()] ?? rating ?? ''
  }

  function getRatingColor(rating) {
    const r = rating?.toLowerCase()
    if (r === 's' || r === 'safe') return 'text-green-400'
    if (r === 'q' || r === 'questionable') return 'text-yellow-400'
    return 'text-red-400'
  }

  function getFileExt(post) {
    const url = post?.file_url ?? ''
    return url.split('.').pop()?.toUpperCase() ?? ''
  }

  return {
    isVideo, isGif, getMediaType, parseTags, getArtistTags,
    formatScore, formatResolution, getRatingLabel, getRatingColor, getFileExt
  }
}
