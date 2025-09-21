export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Use modern Clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      return new Promise((resolve, reject) => {
        if (document.execCommand("copy")) {
          resolve()
        } else {
          reject(new Error("Copy command failed"))
        }
        document.body.removeChild(textArea)
      })
    }
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error)
    throw error
  }
}
