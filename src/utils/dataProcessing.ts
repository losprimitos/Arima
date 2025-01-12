// src/utils/dataProcessing.ts

export async function parseCSV(
  file: File,
  delimiter: string = ','
): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text
          .split('\n')
          .map((row) => row.trim())
          .filter((row) => row.length > 0)
          .map((row) => row.split(delimiter).map((col) => col.trim()));
        resolve(rows);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
}
