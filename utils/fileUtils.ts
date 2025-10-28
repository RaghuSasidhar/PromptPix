
/**
 * Converts a File object to a Base64 encoded string, stripping the data URL prefix.
 * @param file The file to convert.
 * @returns A promise that resolves with the Base64 string.
 */
export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result is in the format "data:[<mediatype>];base64,<data>"
      // We only need the <data> part.
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

/**
 * Converts a File object to a full data URL string.
 * @param file The file to convert.
 * @returns A promise that resolves with the full data URL string.
 */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
