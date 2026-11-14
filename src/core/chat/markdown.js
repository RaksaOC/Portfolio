// Bot answers are markdown: marked (GFM, line breaks) -> DOMPurify -> innerHTML. Tables get a scroll wrapper
// and links open in a new tab.
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export function renderMarkdown(text) {
  const html = marked.parse(text || '')
  return DOMPurify.sanitize(html)
    .replace(/<table>/g, '<div class="chat-md-table"><table>')
    .replace(/<\/table>/g, '</table></div>')
}
