export async function downloadPage(url: string, jinaKey: string) {
  const requestUrl =
    url ||
    "https://r.jina.ai/https://alexlazar.dev/how-to-develop-ai-powered-products-effectively/"
  const headers = {
    Authorization: `Bearer ${jinaKey}`,
    "X-No-Cache": "true"
  }

  try {
    const response = await fetch(requestUrl, { headers })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.text()
  } catch (error) {
    console.error("Error downloading page:", error)
    throw error
  }
}
