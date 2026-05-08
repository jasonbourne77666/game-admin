export const PASSWORD_REG = /^[0-9a-zA-Z]{6,16}$/;
import { UploadFile } from 'antd';

// 文件名
function getFileName(url: string) {
  const strArr = url.split('/');
  return strArr[strArr.length - 1];
}
// list格式
function getUrl(url: string): UploadFile {
  return {
    uid: new Date().getTime() + url,
    name: getFileName(url),
    status: 'done',
    // filename,
    url,
  };
}

export function getFileList(options: string) {
  if (!options) {
    return [];
  }
  if (typeof options === 'string') {
    return [getUrl(options)];
  }

  return [];
}

// 获取url
export function getImageUrl(list: string) {
  if (!(Array.isArray(list) && list.length)) {
    return '';
  }
  return list?.[0]?.url || '';
}
