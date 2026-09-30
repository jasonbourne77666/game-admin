import {
  getAppReleaseInfo,
  updateAppReleaseManifest,
  uploadAppReleaseApk,
  uploadAppReleaseBundledTasks,
  type AppReleaseInfo,
} from '@/services/app-releases';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { UploadProps } from 'antd';
import { Alert, Button, Col, Descriptions, Row, Typography, Upload, message } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type DownloadUrlQrProps = {
  title: string;
  url?: string;
  downloadName: string;
};

const DownloadUrlQr: React.FC<DownloadUrlQrProps> = ({ title, url, downloadName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${downloadName}-qrcode.png`;
    link.click();
  };

  if (!url) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
          {title}
        </Typography.Text>
        <Typography.Text type="secondary">暂无</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
        {title}
      </Typography.Text>
      <QRCodeCanvas value={url} size={160} ref={canvasRef} />
      <Typography.Text
        copyable
        style={{ display: 'block', marginTop: 8, fontSize: 12, wordBreak: 'break-all' }}
      >
        {url}
      </Typography.Text>
      <Button size="small" style={{ marginTop: 8 }} onClick={downloadQr}>
        下载二维码
      </Button>
    </div>
  );
};

function formatBytes(size: number) {
  if (!size) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

/** 仅提交后端 UpdateAppReleaseManifestDto 允许的字段（forbidNonWhitelisted） */
function buildManifestPayload(
  current: AppReleaseInfo['manifest'] | undefined,
  patch: {
    versionCode?: number;
    versionName?: string;
    bundledTasksRevision?: string;
    forceUpdate?: boolean;
    releaseNotes?: string;
  },
) {
  return {
    versionCode: Number(patch.versionCode ?? current?.versionCode ?? 1),
    versionName: String(patch.versionName ?? current?.versionName ?? ''),
    bundledTasksRevision: String(patch.bundledTasksRevision ?? current?.bundledTasksRevision ?? ''),
    forceUpdate: patch.forceUpdate ?? current?.forceUpdate ?? false,
    releaseNotes: String(patch.releaseNotes ?? current?.releaseNotes ?? ''),
  };
}

const AppReleasePage: React.FC = () => {
  const [info, setInfo] = useState<AppReleaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingApk, setUploadingApk] = useState(false);
  const [uploadingZip, setUploadingZip] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppReleaseInfo();
      if (res.code === 200) {
        setInfo(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
  });

  const apkUploadProps: UploadProps = {
    accept: '.apk',
    maxCount: 1,
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploadingApk(true);
      try {
        const res = await uploadAppReleaseApk(file as File);
        if (res.code === 200) {
          message.success('APK 上传成功');
          onSuccess?.(res.data);
          await reload();
        } else {
          onError?.(new Error(res.message || '上传失败'));
        }
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setUploadingApk(false);
      }
    },
  };

  const zipUploadProps: UploadProps = {
    accept: '.zip',
    maxCount: 1,
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploadingZip(true);
      try {
        const res = await uploadAppReleaseBundledTasks(file as File);
        if (res.code === 200) {
          message.success('routes.zip 上传成功');
          onSuccess?.(res.data);
          await reload();
        } else {
          onError?.(new Error(res.message || '上传失败'));
        }
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setUploadingZip(false);
      }
    },
  };

  return (
    <PageContainer title="App 发版" loading={loading}>
      {!info?.publicBaseUrl ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="服务端未配置 APP_PUBLIC_BASE_URL"
          description="请在 game-api .env 中设置 APP_PUBLIC_BASE_URL（如 http://192.168.3.192:3001），保存 manifest 时才能生成正确的下载地址。"
        />
      ) : null}

      <ProCard title="运行版检查地址" style={{ marginBottom: 16 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <DownloadUrlQr
              title="updateCheckUrl（version.json）"
              url={info?.versionJsonUrl}
              downloadName="version-json"
            />
          </Col>
          <Col xs={24} md={16}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="version.json">
                {info?.files.manifest.exists
                  ? formatBytes(info.files.manifest.sizeBytes)
                  : '未生成'}
              </Descriptions.Item>
              <Descriptions.Item label="说明">
                运行版通过此地址拉取清单，判断是否需要更新 APK 或线路资源。
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </ProCard>

      <ProCard title="APK 发版" style={{ marginBottom: 16 }} split="vertical">
        <ProCard colSpan={{ xs: 24, md: 10 }}>
          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="当前文件">
              {info?.files.apk.exists
                ? `fwjassistant.apk · ${formatBytes(info.files.apk.sizeBytes)}`
                : '未上传'}
            </Descriptions.Item>
          </Descriptions>
          <Upload {...apkUploadProps} headers={authHeader()}>
            <Button type="primary" loading={uploadingApk}>
              上传 APK
            </Button>
          </Upload>
          <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
            测试包产物在 `app/build/outputs/apk/beta/release/`，正式包在
            `app/build/outputs/apk/prod/release/`。
          </Typography.Paragraph>
          <DownloadUrlQr
            title="APK 下载"
            url={info?.files.apk.exists ? info.files.apk.publicUrl : undefined}
            downloadName="fwjassistant-apk"
          />
        </ProCard>
        <ProCard colSpan={{ xs: 24, md: 14 }} title="APK 版本信息">
          <ProForm
            key={`apk-${info?.manifest.versionCode ?? 'empty'}-${info?.manifest.versionName ?? ''}`}
            initialValues={{
              versionCode: info?.manifest.versionCode,
              versionName: info?.manifest.versionName,
              forceUpdate: info?.manifest.forceUpdate,
              releaseNotes: info?.manifest.releaseNotes,
            }}
            submitter={{
              searchConfig: { submitText: '保存 APK 版本信息' },
            }}
            onFinish={async (values) => {
              const res = await updateAppReleaseManifest(
                buildManifestPayload(info?.manifest, {
                  ...values,
                  bundledTasksRevision: info?.manifest.bundledTasksRevision,
                }),
              );
              if (res.code === 200) {
                message.success('APK 版本信息已保存');
                await reload();
                return true;
              }
              message.error(res.message || '保存失败');
              return false;
            }}
          >
            <ProFormDigit
              name="versionCode"
              label="versionCode"
              min={1}
              rules={[{ required: true }]}
              extra="须严格递增；运行版据此判断是否需要装新 APK"
            />
            <ProFormText name="versionName" label="versionName" rules={[{ required: true }]} />
            <ProFormSwitch name="forceUpdate" label="forceUpdate" />
            <ProFormTextArea name="releaseNotes" label="releaseNotes" fieldProps={{ rows: 3 }} />
          </ProForm>
        </ProCard>
      </ProCard>

      <ProCard title="线路资源（routes）热更" split="vertical">
        <ProCard colSpan={{ xs: 24, md: 10 }}>
          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="当前文件">
              {info?.files.bundledTasks.exists
                ? `routes.zip · ${formatBytes(info.files.bundledTasks.sizeBytes)}`
                : '未上传（可选）'}
            </Descriptions.Item>
          </Descriptions>
          <Upload {...zipUploadProps} headers={authHeader()}>
            <Button type="primary" loading={uploadingZip}>
              上传 routes.zip
            </Button>
          </Upload>
          <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
            在仓库根目录打包生成 `routes.zip` 后上传，用于线路资源热更，无需重装 APK。
          </Typography.Paragraph>
          <DownloadUrlQr
            title="资源包下载"
            url={info?.files.bundledTasks.exists ? info.files.bundledTasks.publicUrl : undefined}
            downloadName="routes"
          />
        </ProCard>
        <ProCard colSpan={{ xs: 24, md: 14 }} title="线路版本信息">
          <ProForm
            key={`routes-${info?.manifest.bundledTasksRevision ?? 'empty'}`}
            initialValues={{
              bundledTasksRevision: info?.manifest.bundledTasksRevision,
            }}
            submitter={{
              searchConfig: { submitText: '保存线路版本信息' },
            }}
            onFinish={async (values) => {
              const res = await updateAppReleaseManifest(
                buildManifestPayload(info?.manifest, values),
              );
              if (res.code === 200) {
                message.success('线路版本信息已保存');
                await reload();
                return true;
              }
              message.error(res.message || '保存失败');
              return false;
            }}
          >
            <ProFormText
              name="bundledTasksRevision"
              label="bundledTasksRevision"
              rules={[{ required: true }]}
              extra="与这次线路 zip 的版本号一致，例如打包时的日期时间"
            />
          </ProForm>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default AppReleasePage;
