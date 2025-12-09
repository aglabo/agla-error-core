---
title: agla-error-core
description: @aglaboエコシステムのための標準化されたエラーハンドリングコアモジュール
---

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period  -->

[English](README.md) | 日本語

<!-- textlint-enable -->

## @aglabo/agla-error-core

@aglabo エコシステムのための標準化されたエラーハンドリングコアモジュール。

`@aglabo/agla-error-core`は、構造化されたエラーハンドリングを提供するライブラリです。
エラーコード、重要度レベル、コンテキスト情報を持つ統一的なエラー処理を可能にします。

## 機能

- **構造化されたエラーハンドリング** - `AglaError`クラスによる一貫したエラー表現
- **重要度レベル** - `FATAL`、`ERROR`、`WARNING`、`INFO`の 4段階
- **エラーチェーン** - ES2022 `Error.cause`を使用したエラー連鎖
- **クロスランタイムサポート** - Node.js、Deno、Bun に対応
- **TypeScript First** - 完全な型安全性
- **ゼロ依存** - 外部依存なし

## インストール

```bash
# pnpm
pnpm add @aglabo/agla-error-core

# npm
npm install @aglabo/agla-error-core

# yarn
yarn add @aglabo/agla-error-core

# bun
bun add @aglabo/agla-error-core

# deno (JSR)
import { AglaError } from "jsr:@aglabo/agla-error-core";

# deno (npm)
import { AglaError } from "npm:@aglabo/agla-error-core";
```

## クイックスタート

### 基本的な使い方

AglaError は抽象クラスのため、そのままでは使用できません。
まず独自のエラークラスを定義してから使用します。

```typescript
import { AG_ERROR_SEVERITY, AglaError } from '@aglabo/agla-error-core';

// カスタムエラークラスの定義
class ValidationError extends AglaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('ValidationError', message, {
      code: 'VALIDATION_FAILED',
      severity: AG_ERROR_SEVERITY.ERROR,
      context,
    });
  }
}

// エラーの使用
try {
  throw new ValidationError('Invalid email format', {
    field: 'email',
    value: 'invalid-email',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.toString());
    // => ValidationError: Invalid email format {"field":"email","value":"invalid-email"}

    console.log(error.toJSON());
    // => {
    //   errorType: 'ValidationError',
    //   message: 'Invalid email format',
    //   code: 'VALIDATION_FAILED',
    //   severity: 'error',
    //   context: { field: 'email', value: 'invalid-email' }
    // }
  }
}
```

### エラー重要度の使用

```typescript
import { AG_ERROR_SEVERITY, AG_isValidErrorSeverity } from '@aglabo/agla-error-core';

class DatabaseError extends AglaError {
  constructor(message: string, severity = AG_ERROR_SEVERITY.ERROR) {
    super('DatabaseError', message, {
      code: 'DB_ERROR',
      severity,
      timestamp: new Date(),
    });
  }
}

// 致命的エラー
const fatalError = new DatabaseError(
  'Connection pool exhausted',
  AG_ERROR_SEVERITY.FATAL,
);

// 警告レベルのエラー
const warningError = new DatabaseError(
  'Query slow response',
  AG_ERROR_SEVERITY.WARNING,
);

// 重要度の検証
if (AG_isValidErrorSeverity('error')) {
  // 有効
}
```

### エラーチェーン

```typescript
class NetworkError extends AglaError {
  constructor(message: string) {
    super('NetworkError', message, {
      code: 'NETWORK_ERROR',
      severity: AG_ERROR_SEVERITY.ERROR,
    });
  }
}

try {
  // 低レベルエラー
  throw new Error('Connection timeout');
} catch (lowLevelError) {
  // 高レベルエラーに連鎖
  const networkError = new NetworkError('Failed to fetch data');
  const chainedError = networkError.chain(lowLevelError as Error);

  console.log(chainedError.cause); // => Error: Connection timeout
}
```

## APIリファレンス

### `AglaError`

統一的なエラーハンドリングのための抽象基底クラス。

#### コンストラクタ

```typescript
constructor(
  errorType: string,
  message: string,
  options?: AglaErrorOptions | AglaErrorContext
)
```

#### プロパティ

| プロパティ | 型                               | 説明                     |
| ---------- | -------------------------------- | ------------------------ |
| errorType  | `string`                         | エラータイプ識別子       |
| message    | `string`                         | エラーメッセージ         |
| code       | `string \| undefined`            | エラーコード             |
| severity   | `AGT_ErrorSeverity \| undefined` | 重要度レベル             |
| timestamp  | `Date \| undefined`              | エラー作成タイムスタンプ |
| context    | `AglaErrorContext \| undefined`  | エラーコンテキスト情報   |
| cause      | `Error \| undefined`             | エラー原因 (ES2022標準)  |

#### メソッド

| メソッド            | 説明                                            |
| ------------------- | ----------------------------------------------- |
| toString()          | エラーを文字列形式で返す                        |
| toJSON()            | エラーをJSON形式で返す                          |
| chain(cause: Error) | エラーチェーンを作成 (新しいインスタンスを返す) |

### `AG_ERROR_SEVERITY`

エラー重要度レベルの定義。

```typescript
const AG_ERROR_SEVERITY = {
  FATAL: 'fatal', // 即座の対応が必要な致命的障害
  ERROR: 'error', // 正常な動作を妨げる実行時エラー
  WARNING: 'warning', // 調査すべき潜在的な問題
  INFO: 'info', // デバッグ用の情報メッセージ
} as const;
```

### `AG_isValidErrorSeverity(value: unknown): boolean`

値が有効な重要度レベルかどうかを検証する型ガード関数。

## 要件

- Node.js: >= 20.0.0
- Deno: 最新版
- Bun: 最新版
- TypeScript: >= 5.9

## ライセンス

MIT ライセンス - 詳細は[LICENSE](./LICENSE)を参照してください。

## 貢献

バグ報告や機能リクエストは[Issues](https://github.com/aglabo/agla-error-core/issues)で受け付けています。

プルリクエストも歓迎します。詳細は[CONTRIBUTING.md](./CONTRIBUTING.md)を参照してください。

## リンク

- [GitHubリポジトリ](https://github.com/aglabo/agla-error-core)
- [npmパッケージ](https://www.npmjs.com/package/@aglabo/agla-error-core)
- [Issue Tracker](https://github.com/aglabo/agla-error-core/issues)

---

Copyright (c) 2025 [atsushifx](https://github.com/atsushifx). Released under the MIT License.
