import { NodeHtmlMarkdown } from "node-html-markdown"

export async function downloadPage(tabId: number) {
  if (!tabId) {
    throw new Error("No tab ID provided")
  }

  try {
    // Get page HTML content
    const [{ result: html }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.documentElement.outerHTML
    })

    // Get page metadata
    const [{ result: metadata }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return {
          title: document.title,
          url: window.location.href,
          description: document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content"),
          keywords: document
            .querySelector('meta[name="keywords"]')
            ?.getAttribute("content"),
          author: document
            .querySelector('meta[name="author"]')
            ?.getAttribute("content")
        }
      }
    })

    const markdown = await convertHtmlToMarkdown(html)

    // Combine metadata with content
    const contentWithMetadata = `
# ${metadata.title}
URL: ${metadata.url}
${metadata.description ? `\nDescription: ${metadata.description}` : ""}
${metadata.author ? `\nAuthor: ${metadata.author}` : ""}
${metadata.keywords ? `\nKeywords: ${metadata.keywords}` : ""}

---

${markdown}
`.trim()

    return contentWithMetadata
  } catch (error) {
    console.error("Error downloading page:", error)
    throw error
  }
}

// Helper function to convert HTML to markdown
async function convertHtmlToMarkdown(html: string): Promise<string> {
  // Configure the converter
  const nhm = new NodeHtmlMarkdown({
    bulletMarker: "*",
    codeBlockStyle: "fenced",
    useInlineLinks: true,
    maxConsecutiveNewlines: 2
  })

  // Convert HTML to markdown
  return nhm.translate(html)
}
