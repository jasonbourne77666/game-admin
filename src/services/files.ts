// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /admin/files/upload */
export async function uploadFile(file: File, options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/admin/files/upload', {
    method: 'POST',
    data: {
      file,
    },
    ...(options || {}),
  });
}

// 获取文件 /admin/files/:fileName
export async function getFile(fileName: string, options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/admin/files/' + fileName, {
    method: 'GET',
    ...(options || {}),
  });
}
