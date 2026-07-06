import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig = {
  // 親ディレクトリに別の lockfile があってもこのプロジェクトをルートとして扱う
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),

  // GitHub Pages 向けの純静的書き出し。
  output: 'export',
  trailingSlash: true,

  // GH Pages には画像最適化エンドポイントが無い。
  images: { unoptimized: true },

  // repo 配下 (https://<user>.github.io/choho/) に置くため CI で `/choho` を注入。
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
