import {config} from "../../config/config.ts";
import {calculateFileMD5} from "../../utils/fileUtils.ts";

export class FileService {
  static async checkFile(token: string, md5: string) {
    const res = await fetch(`${config.base_url}/api/v1/chat/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({md5})
    });
    const data = await res.json();
    return data.id;
  }

  // 上传文件
  static async uploadFile(file: File, token: string): Promise<string> {
    const md5 = await calculateFileMD5(file);
    const file_id = FileService.checkFile(token, md5)
    if (file_id) {
      return file_id;
    }
    // 确定文件类别
    const getCategory = (fileName: string): string => {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'md'].includes(ext || '')) return 'document';
      if (['png', 'jpg', 'jpeg'].includes(ext || '')) return 'image';
      if (['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm'].includes(ext || '')) return 'media';
      return 'other';
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', getCategory(file.name));

    try {
      const response = await fetch(`${config.base_url}/api/v1/chat/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.code === 1 && result.data?.id) {
        return result.data.id;
      }
      throw new Error(result.msg || 'File upload failed');
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  };
}