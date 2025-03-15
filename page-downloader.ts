export async function downloadPage(url: string, jinaKey: string) {
  if (!url) {
    throw new Error("No URL provided")
  }
  const requestUrl = `https://r.jina.ai/${url}`
  const headers = {
    Authorization: `Bearer ${jinaKey}`,
    "X-Engine": "browser",
    "X-No-Cache": "true",
    "X-Return-Format": "markdown",
    "X-With-Images-Summary": "true",
    "X-With-Links-Summary": "true"
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
