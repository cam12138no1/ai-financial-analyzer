import pdf from 'pdf-parse'
import * as XLSX from 'xlsx'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF document')
  }
}

export async function extractTextFromExcel(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    let text = ''
    
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      text += `\n\n=== ${sheetName} ===\n\n`
      text += XLSX.utils.sheet_to_txt(sheet)
    })
    
    return text
  } catch (error) {
    console.error('Excel parsing error:', error)
    throw new Error('Failed to parse Excel document')
  }
}

export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer)
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return extractTextFromExcel(buffer)
  } else if (mimeType.startsWith('text/')) {
    return buffer.toString('utf-8')
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`)
  }
}
