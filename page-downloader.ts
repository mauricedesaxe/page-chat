import { NodeHtmlMarkdown } from "node-html-markdown"

export async function downloadPage(tabId: number) {
  if (!tabId) {
    throw new Error("No tab ID provided")
  }

  try {
    const [{ result: html }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.documentElement.outerHTML
    })

    const markdown = await convertHtmlToMarkdown(html)

    return markdown
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
