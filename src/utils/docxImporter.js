import * as mammoth from 'mammoth'

/**
 * Converts a .docx File object into semantic HTML and metadata
 * @param {File} file - .docx file from file input
 * @returns {Promise<{ html: string, rawText: string, messages: Array }>}
 */
export async function convertDocxToHtml(file) {
  if (!file) throw new Error('File tidak ditemukan')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result
        if (!arrayBuffer) {
          throw new Error('Gagal membaca isi file Word')
        }

        const options = {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => p > em:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
            "u => u",
            "strike => s",
          ],
        }

        const result = await mammoth.convertToHtml({ arrayBuffer }, options)
        const rawTextResult = await mammoth.extractRawText({ arrayBuffer })

        if (result.messages && result.messages.length > 0) {
          console.warn('Mammoth conversion warnings:', result.messages)
        }

        resolve({
          html: result.value || '<p></p>',
          rawText: rawTextResult.value || '',
          messages: result.messages || []
        })
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  })
}
