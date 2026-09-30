import { request } from '@umijs/max';

export type AppReleaseManifest = {
  versionCode: number;
  versionName: string;
  bundledTasksRevision: string;
  forceUpdate: boolean;
  apkUrl: string;
  resourceBundleUrl: string;
  releaseNotes: string;
};

export type AppReleaseFileInfo = {
  filename: string;
  exists: boolean;
  sizeBytes: number;
  publicUrl: string;
};

export type AppReleaseInfo = {
  releasesDir: string;
  publicBaseUrl: string;
  versionJsonUrl: string;
  apkUrl: string;
  resourceBundleUrl: string;
  manifest: AppReleaseManifest;
  files: {
    apk: AppReleaseFileInfo;
    bundledTasks: AppReleaseFileInfo;
    manifest: AppReleaseFileInfo;
  };
};

export async function getAppReleaseInfo() {
  return request<API.BaseResponse<AppReleaseInfo>>('/admin/app-releases/info', {
    method: 'GET',
  });
}

export async function getAppReleaseManifest() {
  return request<API.BaseResponse<AppReleaseManifest>>('/admin/app-releases/manifest', {
    method: 'GET',
  });
}

export async function updateAppReleaseManifest(data: Partial<AppReleaseManifest>) {
  return request<API.BaseResponse<AppReleaseManifest>>('/admin/app-releases/manifest', {
    method: 'PUT',
    data,
  });
}

export async function uploadAppReleaseApk(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<API.BaseResponse<AppReleaseFileInfo>>('/admin/app-releases/upload/apk', {
    method: 'POST',
    data: formData,
  });
}

export async function uploadAppReleaseBundledTasks(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<API.BaseResponse<AppReleaseFileInfo>>('/admin/app-releases/upload/bundled-tasks', {
    method: 'POST',
    data: formData,
  });
}
