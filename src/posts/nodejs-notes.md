---
title: Node.js 学习笔记
date: 2026-11-15
category: 学习记录
description: Node.js 与 Electron 学习笔记，涵盖模块化、异步编程、文件与网络、子进程、窗口管理、IPC、安全、自动升级和应用打包。
keywords: [Node.js, Electron, JavaScript, npm, 文件操作, 子进程, IPC, 自动升级, 应用打包]
---

## 运行环境与版本管理

### 运行环境

Node\.js 是一个在浏览器之外运行 JavaScript 的环境

```Plain Text
const name = 'DeskKit';

console.log(`欢迎使用 ${name}`);
```

在终端执行`node app.js`

输出：`欢迎使用 DeskKit`

- `node`：负责执行代码的程序。

- `app.js`：需要执行的 JavaScript 文件。

**整个执行过程**

1. 终端找到 Node\.js 程序。

2. 启动一个 Node\.js 进程。

3. Node\.js 读取 `app.js`，通过内部的 V8 引擎执行代码。

4. 执行 `console.log`，在终端输出内容。

5. 没有需要继续处理的工作，进程结束。

除了执行 JavaScript，Node\.js 还提供文件、网络、进程等能力

```JavaScript
import { readFileSync } from 'node:fs';
//假设 message.txt 内容是这是 DeskKit 的第一条消息
//readFileSync(...)，这是 Node.js 提供的文件读取能力
//执行到 readFileSync 时，Node.js 会通过底层能力读取文件，将文本返回给 content，然后继续输出
const content = readFileSync('./message.txt', 'utf8');
//输出这是 DeskKit 的第一条消息
console.log(content);
```

V8 负责执行 JavaScript，Node\.js 提供访问文件、网络等系统资源的接口

### 版本管理

```Plain Text
//当前版本： v22.23.1
console.log('当前版本：', process.version);
//程序位置： /某个安装目录/bin/node
console.log('程序位置：', process.execPath);
```

- `process.version`：运行当前程序的 Node\.js 版本。

- `process.execPath`：这个 Node\.js 程序所在的位置。

## 包管理与package\.json

### 包管理

“包”就是别人封装好的代码。包管理工具负责**安装、更新、删除这些依赖，以及管理版本**。

常见工具：npm、pnpm、Yarn。npm 通常随 Node\.js 一起安装。

### package\.json

项目的配置清单，记录**项目名称、脚本、依赖和运行环境要求**

```JSON
{
  "name": "deskkit",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/index.js"
  },
  "engines": {
    "node": ">=22"
  }
}
```

- `name`：包名。

- `version`：项目版本，不是 Node\.js 版本。

- `private`：设为 `true`，防止误发布到 npm，不影响 Git 上传。

- `type`：设为 `module`，让 `.js` 文件按 ESM 模块解析。

- `scripts`：常用命令的快捷入口。

- `engines`：声明支持的 Node\.js 版本，不会自动切换版本。

#### 两种依赖

1. `dependencies`：运行时需要的依赖，程序运行需要，例如 `axios`。

2. `devDependencies`：开发、检查、构建时需要的依赖，开发、测试、构建需要，例如 `eslint`。

#### 运行脚本

```Plain Text
npm start          # 执行 scripts.start
npm run build      # 执行 scripts.build，前提是已定义
```

例如上面的 `npm start` 实际执行`node src/index.js`

#### 三个文件／目录的关系

|名称|作用|通常提交 Git？|
|---|---|---|
|package\.json|声明配置与依赖版本范围|是|
|package\-lock\.json|锁定 npm 依赖树的具体版本|是|
|node\_modules/|实际安装的依赖文件|否|

区分安装锁文件

|锁文件|对应工具|安装命令|
|---|---|---|
|package\-lock\.json|npm|npm install|
|yarn\.lock|Yarn|yarn install|
|pnpm\-lock\.yaml|pnpm|pnpm install|

## 全局对象与 process

### 全局对象

Node\.js 中的 `console`、`process` 等可以直接使用，不需要 `import`

`globalThis` 是访问全局对象的标准入口

```Plain Text
console.log(globalThis.console === console); // true
console.log(globalThis.process === process); // true
```

ESM（ESM 是 JavaScript 的标准模块化方式，全称是 ECMAScript Modules； 简单说：把代码拆到多个文件，用 `export` 导出，用 `import` 引入）文件中声明的变量属于当前模块，不会自动成为全局属性

```Plain Text
const appName = 'DeskKit';

console.log(appName);            // 'DeskKit'
console.log(globalThis.appName); // undefined
```

共享数据优先使用 `export`、`import`，不要随意往全局对象上添加属性

### process

用来获取和控制**当前这次运行的 Node\.js 进程**

|API|作用|
|---|---|
|process\.version|Node\.js 版本|
|process\.execPath|Node\.js 可执行文件路径|
|process\.platform|操作系统，macOS 为 `darwin`|
|process\.cwd\(\)|当前工作目录，不一定是脚本所在目录|
|**process\.argv**|**启动参数数组**|
|process\.env|环境变量|
|process\.exitCode|程序最终的退出码|
|process\.on\(\)|监听退出信号|

#### 启动参数：`process.argv`

```Bash
//运行
node src/process-demo.js hello
```

```Bash
process.argv[0] // Node.js 程序路径
process.argv[1] // 入口文件路径
process.argv[2] // 'hello'
```

自定义参数从下标 `2` 开始，值是字符串；未传入时为 `undefined`

#### 环境变量：`process.env`

用于从外部传入配置

```Bash
const downloadDir =process.env.DESKKIT_DOWNLOAD_DIR ?? './downloads';

//终端运行
DESKKIT_DOWNLOAD_DIR=./my-files node src/process-demo.js hello

//输出
process.env.DESKKIT_DOWNLOAD_DIR // './my-files'
process.argv[2]                 // 'hello'
```

这种写法只为本次命令设置环境变量，不会永久修改配置

注意：

- 环境变量的值是字符串，未设置时为 `undefined`。

- `??` 只在左侧为 `null` 或 `undefined` 时使用默认值，空字符串不会触发。

- 字符串 `'false'` 仍是真值，布尔配置需要明确转换：

`const debug = process.env.DESKKIT_DEBUG === 'true';`

#### 退出码：`process.exitCode`

通常 `0` 表示成功，非 `0` 表示失败

```JavaScript
const url = process.argv[2];

if (!url) {
  console.error('缺少下载地址');
  process.exitCode = 1;
} else {
  console.log('收到下载地址：', url);
}

console.log('参数检查结束');
```

两种情况都会打印“参数检查结束”，因为：

- `console.error()` 只输出错误信息，不会自动设置失败退出码。

- `process.exitCode = 1` 标记最终失败，**不会立即停止后续代码**。

- `process.exit(1)` 会强制结束进程，可能中断尚未完成的工作，应谨慎使用。

```Bash
node src/process-demo.js

//查看上一条命令的退出码，需要紧接着执行
echo $?
```

#### 退出码与 `&&`

```Bash
node src/process-demo.js && echo "准备开始下载"
```

`&&` 只在前一条命令退出码为 `0` 时执行后面的命令。

**程序内部可以继续执行，终端则在程序结束后，根据退出码决定是否执行下一步。**

#### process\.on\(\)：监听退出信号

在终端运行程序时按 `Ctrl+C`，通常会发送 `SIGINT` 信号。

可以监听这个信号，在退出前做清理：

```JavaScript
const timer = setInterval(() => {
  console.log('任务运行中……');
}, 1000);

process.on('SIGINT', () => {
  console.log('收到停止信号，正在清理');

  clearInterval(timer);
  process.exitCode = 0;
});
```

执行过程：

1. 程序启动，每秒输出一次日志。

2. 用户按下 `Ctrl+C`。

3. `SIGINT` 的监听函数执行。

4. 清除定时器。

5. 如果没有其他需要继续处理的工作，程序自然退出。

**注意：**注册 `SIGINT` 监听后，不能再假定程序会按默认行为立即退出。你需要负责停止任务、关闭连接等清理工作。

## 模块化

将不同职责的代码拆到独立文件，通过**导出和导入**共享函数、变量等，便于维护和复用。

### CommonJS

使用 `module.exports` 导出，`require()` 导入。

```JavaScript
function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

module.exports = { formatSize };
```

```Plain Text
const { formatSize } = require('./format.cjs');

console.log(formatSize(2048)); // 2.0 KB
```

`require()` 获取的是模块的 `module.exports`

也可以直接导出函数：`module.exports = formatSize;`

对应直接接收，不需要解构：`const formatSize = require('./format.cjs');`

**exports 的注意事项**

`exports` 初始时与 `module.exports` 指向同一个对象

```Plain Text
exports.formatSize = formatSize; // ✅ 添加导出属性

exports = { formatSize };       // ❌ 只改变局部变量的指向

//替换整个导出内容时，用：
module.exports = { formatSize };
```

### ESM

使用 `export` 导出，`import` 导入

#### 命名导出

```JavaScript
// format.js
export function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export const APP_NAME = 'DeskKit';

//每个 export 都会增加对应的导出，**后面的不会覆盖前面的**。也可以统一导出：
export { formatSize, APP_NAME };
```

```Plain Text
import { formatSize, APP_NAME } from './format.js';

//导入时允许改名：
import { formatSize as formatFileSize } from './format.js';
```

#### 默认导出

```JavaScript
export default function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```

导入不加花括号，本地名称可以自定义

```Plain Text
import sizeFormatter from './format.js';
```

一个模块可以有多个命名导出，但只能有一个默认导出。

#### 关于 `export const`

```Plain Text
//这里的 = 是声明时的初始化，export 只是将常量导出。
export const APP_NAME = 'DeskKit';

APP_NAME = 'OtherApp'; // ❌ const 初始化后不能重新赋值
```

### 模块执行时机

```JavaScript
// format.mjs
console.log('format 模块初始化');

export function formatSize(bytes) {
  console.log('formatSize 函数执行');

  return `${(bytes / 1024).toFixed(1)} KB`;
}

// index.mjs
import { formatSize } from './format.mjs';

console.log('入口开始');

console.log(formatSize(2048));
console.log(formatSize(4096));


//输出
format 模块初始化
入口开始
formatSize 函数执行
2.0 KB
formatSize 函数执行
4.0 KB
```

- 导入模块时，会执行模块的顶层代码。

- 函数内部的代码，只有调用函数时才执行。

- 正常情况下，同一模块被重复加载会复用缓存，不会反复执行顶层代码。

因此，避免在模块顶层直接启动下载、连接设备等操作；应导出函数，由调用方决定何时执行。

### Node\.js 如何判断模块类型

|文件或配置|模块类型|
|---|---|
|`.cjs`|CommonJS|
|`.mjs`|ESM|
|`.js`，所属 `package.json` 设置 `"type": "module"`|ESM|
|`.js`，所属 `package.json` 设置 `"type": "commonjs"`|CommonJS|

建议明确设置 `type`，不要依赖隐式判断。

原生 Node\.js ESM 的相对导入需要写完整文件名：`import { formatSize } from './format.js';`

**三类路径**

```JavaScript
import dayjs from 'dayjs';                    // 第三方包
import { readFile } from 'node:fs/promises';  // Node.js 内置模块
import { formatSize } from './format.js';    // 自己的文件
```

### 静态导入与动态导入

```Plain Text
// 静态导入：放在模块顶层，声明依赖
import { formatSize } from './format.js';
```

这里的花括号是命名导入语法，**不是对象解构**。

```JavaScript
async function showFileSize(bytes) {
  const { formatSize } = await import('./format.js');

  console.log(formatSize(bytes));
}

showFileSize(2048);
```

这里才是对模块导出对象进行解构，适合按需加载。

执行过程：

1. 调用 `showFileSize`。

2. `import()` 发起模块加载，返回 Promise。

3. `await` 等待模块可用。

4. 获得模块的导出对象。

5. 取出 `formatSize` 并调用。

## 异步编程与事件循环

### 同步、异步与阻塞

**同步执行**：当前操作执行完，再执行后面的代码。

**异步操作**：发起操作后，不必一直占用主线程等待，结果准备好后再处理。

**主线程阻塞**：JavaScript 长时间占着主线程，其他代码和回调无法执行。

```JavaScript
//这里不是“休息两秒”，而是不停检查时间，持续占用主线程。
const start = Date.now();

while (Date.now() - start < 2000) {}

console.log('结束'); // 约 2 秒后输出
```

### Promise：表示异步操作的最终结果、

Promise 有三种状态，从等待变成成功或失败后，状态不可再改变

|状态|含义|
|---|---|
|pending|等待中|
|fulfilled|成功|
|rejected|失败|

```JavaScript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('下载完成');
  }, 1000);
});

promise.then((result) => {
  console.log(result);
});
```

- `resolve(结果)`：通常用于提交成功结果。

- `reject(错误)`：让 Promise 失败。

- `.then()`：注册处理结果的回调。

- `.catch()`：处理失败。

**注意**

- `new Promise()` 的执行器**立即同步执行**。

- `resolve()` 不等于 `return`，不会停止当前函数。

- 若 `resolve()` 接收另一个 Promise，会跟随它的最终状态。

- Promise 不一定要调用 `resolve`；可以失败，也可以一直等待。

### async：让函数返回 Promise

```JavaScript
async function run() {
  console.log('开始');

  const result = await new Promise((resolve) => {
    setTimeout(() => resolve('完成'), 1000);
  });

  console.log(result);
}

run();
console.log('其他事情');

//输出
开始
其他事情
完成
```

`await` 暂停的是当前函数的后续执行，**不是整个主线程**。等待完成后，后续代码通过微任务恢复执行。

异步失败可以用 `try/catch` 处理

```Plain Text
try {
  const result = await someAsyncTask();
} catch (error) {
  console.error(error);
}
```

### 微任务与宏任务

|类型|示例|
|---|---|
|微任务|Promise 的 `.then()` 回调、`await` 后的恢复执行、`queueMicrotask()`|
|通常称为宏任务的回调|`setTimeout()`、`setInterval()`、`setImmediate()` 的回调|

Node\.js 实际按不同事件循环阶段处理这些回调，并不是只有一个统一的“宏任务队列”。

可以理解为：当前代码执行完，到达微任务检查点时，先清空微任务，再继续后续任务。

```JavaScript
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');

//输出
A
D
C
B
```

**注意：**

- 微任务不会打断正在执行的代码。

- `setTimeout(fn, 0)` 不代表立即执行。

- 不断产生微任务，也可能让定时器、I/O 回调迟迟得不到执行机会。

### 异步代码也可能阻塞程序

给函数加上 `async`，不会自动把其中的计算放到后台。

```JavaScript
async function heavyTask() {
  const start = Date.now();

  while (Date.now() - start < 2000) {
    // 模拟占用 JavaScript 线程的计算
  }

  console.log('计算结束');
}

setTimeout(() => {
  console.log('定时器执行');
}, 0);

heavyTask();

console.log('后续代码');

//程序会先忙碌大约 2 秒，再输出
计算结束
后续代码
定时器执行
```

原因是：

- `async` 函数在遇到第一个 `await` 前，仍然同步执行。

- 这个循环一直占用 JavaScript 线程。

- 定时器即使已经满足时间条件，也只能等待。

把循环放进 `new Promise()` 也不能解决，因为执行器同样立即执行。

所以要区分：

- **I/O 等待**：主要是在等磁盘、网络等完成工作，主线程可以先做别的。优先使用异步接口，让主线程在等待期间继续做其他事。

- **大量 CPU 计算**：主线程自己正在干活，不能靠加 `async/await` 就变得不阻塞。可能需要分段处理、Worker 线程或子进程。

异步能避免主线程干等 I/O；CPU 计算仍需要线程实际执行，不能靠 Promise 或 async/await 自动消除阻塞。

### 多个异步任务：串行还是并发

假设需要读取两个互不依赖的文件。

#### 串行：第一个结束，再开始第二个

```JavaScript
import { readFile } from 'node:fs/promises';

async function loadFiles() {
  const config = await readFile('./config.json', 'utf8');
  const history = await readFile('./history.json', 'utf8');

  return { config, history };
}
//执行顺序
开始读配置 → 配置读取完成 → 开始读历史 → 历史读取完成
```

#### 并发：先发起两个读取，再一起等待

```JavaScript
import { readFile } from 'node:fs/promises';

//两个 readFile() 都会先被调用，然后等待它们全部成功。
async function loadFiles() {
  const [config, history] = await Promise.all([
    readFile('./config.json', 'utf8'),
    readFile('./history.json', 'utf8'),
  ]);

  return { config, history };
}
```

**注意**

- 返回结果按照传入顺序排列，不是按完成顺序。

- 任意一个任务失败，`Promise.all()` 就会拒绝，但**不会自动取消其他任务**。

**任务互相依赖时使用串行；任务彼此独立时，可以考虑并发。**

并发也不等于可以无限发起任务。下载大量文件时，通常需要限制同时运行的数量。

### Node\.js 特有的两个名字

后续看项目代码时，还可能遇到：

```Plain Text
//放入 Node.js 专门的 next-tick 队列，在相应检查点优先处理。
process.nextTick(callback);
//在事件循环的 check 阶段执行回调：登记回调，等事件循环走到 **check 阶段**再执行，不是立即插队。
setImmediate(callback);
```

## 事件机制与定时器

### 事件机制

#### 事件机制的作用

**一个模块宣布“某件事发生了”，其他模块监听并处理。**

例如下载完成后，日志、历史记录、通知模块分别响应。下载模块不必直接调用它们。

```JavaScript
import { EventEmitter } from 'node:events';

const events = new EventEmitter();

events.on('download:complete', (file) => {
  console.log('记录日志：', file);
});

events.on('download:complete', (file) => {
  console.log('显示通知：', file);
});

events.emit('download:complete', 'demo.zip');

//输出
记录日志： demo.zip
显示通知： demo.zip
```

- `on()`：注册监听函数。

- `emit()`：触发事件，并向监听函数传递参数。

- 监听函数就是 **callback（回调函数）**。

#### 事件和直接调用函数怎么选？

如果某一件事情明确要去做，可以直接调用函数，如果需要多个事情去分别响应，那么就可以使用事件

|场景|选择|
|---|---|
|明确让某个函数完成工作，并获取结果|直接调用函数|
|一件事发生后，多个模块分别响应|使用事件|

```Plain Text
// 明确调用并获取结果
const text = formatSize(2048);

// 宣布事情发生，由监听者响应
events.emit('download:complete', file);
```

#### on、once 与 off

**`on()`****：持续监听**

```Plain Text
events.on('progress', handleProgress);
```

每次触发 `progress`，都会调用 `handleProgress`。

**`once()`****：只响应注册后的第一次事件**

```JavaScript
events.once('complete', () => {
  console.log('只提醒一次');
});

events.emit('complete'); // 响应
events.emit('complete'); // 不再响应
```

触发一次后，监听器自动移除。注册之前的事件不会补发。

**`off()`****：移除监听**

```Plain Text
function handleProgress(value) {
  console.log(value);
}

events.on('progress', handleProgress);
events.off('progress', handleProgress);
```

移除时必须传入**同一个函数引用**，重新写一个相同内容的箭头函数不行。

#### EventEmitter 默认同步执行

```JavaScript
events.on('test', () => {
  console.log('监听函数');
});

console.log('开始');
events.emit('test');
console.log('结束');

//输出
开始
监听函数
结束
```

监听函数默认按注册顺序同步调用。

事件机制不等于异步，多名监听者也不等于并行执行。监听函数中的耗时计算仍会阻塞主线程。

#### 事件不会自动保存历史

```Plain Text
emitter.emit('completed', 'demo.zip');

emitter.on('completed', (filename) => {
  console.log(filename);
});
```

这段代码不会输出文件名，因为监听注册得太晚。

**EventEmitter 通知的是事件发生当时的监听者，不会自动把过去的事件补发给新监听者。**

如果页面打开时需要知道“任务已经完成”，就不能只依赖事件，还需要保存任务状态：

```Plain Text
const task = {
  status: 'completed',
  filename: 'demo.zip',
};
```

可以这样区分：

- **状态**：现在是什么情况。

- **事件**：刚刚发生了什么。

### 定时器

#### **`setTimeout()`****：安排一次回调**

```Plain Text
const timer = setTimeout(() => {
  console.log('稍后执行');
}, 1000);

//取消
clearTimeout(timer);
```

#### **`setInterval()`****：按间隔重复安排回调**

```Plain Text
const timer = setInterval(() => {
  console.log('刷新进度');
}, 1000);

//停止
clearInterval(timer);
```

#### **`setImmediate()`****：在 check 阶段执行回调**

```Plain Text
//它不是立即插队执行，也不能笼统保证它与 setTimeout(..., 0) 的固定先后顺序。
setImmediate(() => {
  console.log('当前代码结束后，等 check 阶段执行');
});
```

#### **定时器若未清除会让程序一直运行**

在 Node\.js 中，普通的活动定时器默认会让事件循环保持运行。

```Plain Text
setInterval(() => {
  console.log('运行中');
}, 1000);
```

即使入口文件其他代码执行完了，这个程序也不会自然结束，因为还有定时器需要处理。

如果某个定时器只是可有可无的后台任务，可以使用：

```Plain Text
const timer = setTimeout(() => {
  console.log('后台提示');
}, 5000);

timer.unref();
```

`unref()` 表示：不要仅仅因为这个定时器，就让进程继续运行。

它不等于取消定时器。如果还有其他工作保持进程运行，定时器仍可能执行；如果没有，程序可以直接退出，回调可能根本不会执行。

## 文件与目录操作（fs）

### fs 的作用

`fs` 是 Node\.js 内置的文件系统模块，用于读写文件、创建目录、复制、移动和删除等操作，不需要额外安装。

常用异步接口：

```Plain Text
import {
  readFile,     // 读取内容
  writeFile,    // 写入内容，默认覆盖
  appendFile,   // 末尾追加
  mkdir,        // 创建目录
  readdir,      // 查看目录内容
  stat,         // 获取文件信息
  copyFile,     // 复制文件
  rename,       // 重命名或移动
  unlink,       // 删除文件
  rm,           // 删除路径，可递归删除目录
} from 'node:fs/promises';
```

这些方法返回 Promise，可以配合 `await` 使用。

### 读取文件

```Plain Text
const content = await readFile('./data/config.json', 'utf8');

console.log(content);
```

- `'utf8'`：按文本解码，返回字符串。

- 不指定编码：返回 `Buffer`。

- 读取失败：Promise 被拒绝，`await` 会抛出错误。

**`await`**** 让当前函数等待结果，不会因为等待文件读取而阻塞主线程。同步方法 ****`readFileSync()`**** 则会阻塞。**

### 写入文件

```Plain Text
await writeFile('./data/message.txt', '你好，DeskKit', 'utf8');
```

默认行为：

- 文件不存在：创建文件。

- 文件已存在：覆盖原内容。

- 父目录不存在：通常会失败，不会自动补齐目录。

追加内容使用：

```Python
import { appendFile } from 'node:fs/promises';

await appendFile('./data/message.txt', '\n新增一条记录', 'utf8');
```

### 查看文件信息

读取内容用 `readFile()`；只想了解文件大小、修改时间等信息，可以使用 `stat()`。

```JavaScript
import { stat } from 'node:fs/promises';

const info = await stat('./message.txt');

console.log('是否为文件：', info.isFile());
console.log('是否为目录：', info.isDirectory());
console.log('大小：', info.size);
console.log('修改时间：', info.mtime);
```

### 创建目录

```Plain Text
await mkdir('./data/downloads', { recursive: true });
```

`recursive: true` 表示逐级创建缺少的父目录。

- 目标已经是目录：通常不会因存在而报错。

- 目标位置是同名普通文件：仍会失败。

- 不会清空已有目录，也不会把普通文件转换成目录。

### 查看目录内容

```Plain Text
const entries = await readdir('./data', {
  withFileTypes: true,
});

for (const entry of entries) {
  console.log(entry.name, entry.isDirectory());
}
```

`withFileTypes: true` 返回包含类型信息的条目，可通过以下方法判断类型。不加该选项时，通常返回名称数组。

```Plain Text
entry.isFile();      // 是否为文件
entry.isDirectory(); // 是否为目录
```

### 复制、移动与删除

#### 复制文件

```Plain Text
await copyFile(
  './data/config.json',
  './data/config.backup.json',
);
```

- 第一个参数：源文件。

- 第二个参数：目标文件。

- 目标不存在时创建，已存在时默认覆盖。

- 源文件内容不变。

#### 重命名或移动

```Plain Text
import { rename } from 'node:fs/promises';

//重命名
await rename('./data/temp.txt', './data/result.txt');
//移动文件
await rename('./data/result.txt', './archive/result.txt');
```

目标父目录需要存在。跨文件系统移动可能失败，不能把 `rename()` 当成适用于所有位置的通用移动方案。

还要注意：目标存在时可能被替换，行为也受文件类型、平台等影响，不要默认它会保护已有文件。

#### 删除

```Plain Text
//删除文件
await unlink('./data/temp.txt');
//删除文件，也可以用来删除目录
await rm('./data/message.txt');

//删除整个目录
await rm('./data/temp', {
  recursive: true,
  force: true,
});
```

- `recursive: true`：连同子目录和文件一起删除。

- `force: true`：忽略路径不存在的情况，不代表忽略所有错误。

递归删除要先确认目标路径，避免误删。

### 保存与读取 JSON 配置

假设有一个配置对象：

```Plain Text
const config = {
  downloadDir: './downloads',
  maxConcurrent: 3,
};
```

对象不能直接作为 JSON 文本写入，需要先转换：

```JavaScript
import { mkdir, writeFile, readFile } from 'node:fs/promises';

await mkdir('./data', { recursive: true });

const config = {
  downloadDir: './downloads',
  maxConcurrent: 3,
};


const text = JSON.stringify(config, null, 2);

await writeFile('./data/config.json', text, 'utf8');

const savedText = await readFile('./data/config.json', 'utf8');
const savedConfig = JSON.parse(savedText);

console.log(savedConfig.maxConcurrent);

//输出
3
```

`JSON.stringify(config, null, 2)`：

- `config`：需要转换的数据。

- `null`：不额外筛选或转换属性。

- `2`：每层缩进两个空格，方便阅读。

执行过程：

1. 创建配置目录。

2. 用 `JSON.stringify()` 把对象转换成文本。

3. 用 `writeFile()` 保存文本。

4. 用 `readFile()` 读回文本。

5. 用 `JSON.parse()` 将文本转换为 JavaScript 数据。

6. 读取配置字段。

`readFile()` 读取文本，`JSON.parse()` 才将 JSON 文本转为 JavaScript 数据。

注意：能成功解析 JSON，不代表字段就一定正确。比如 `maxConcurrent` 可能被手动改成字符串，真实项目还需要验证配置内容。

### 错误处理

```JavaScript
try {
  const content = await readFile('./data/config.json', 'utf8');
  const config = JSON.parse(content);

  console.log(config);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('文件或路径不存在');
  } else {
    throw error;
  }
}
```

这里的处理逻辑是：

- 配置不存在：可以理解为首次启动，返回默认配置。

- 没有权限、JSON 损坏等其他问题：继续抛出，不悄悄忽略。

常见错误

|错误|含义|
|---|---|
|ENOENT|文件或路径不存在|
|EACCES|权限不足|
|EEXIST|目标已存在，当前操作不允许|
|SyntaxError|例如 JSON 文本格式不合法|

**不要把所有读取失败都当成“文件不存在”。否则真正的问题会被默认值掩盖。**

### 不要同时随意写同一个文件

```JavaScript
// 不建议这样并发覆盖同一个文件
await Promise.all([
  writeFile('./config.json', '{"theme":"dark"}'),
  writeFile('./config.json', '{"theme":"light"}'),
]);
```

不要指望“写在后面的调用一定最终生效”，还可能出现不可靠的写入结果。

写同一个配置文件时，通常需要按顺序执行；更完整的配置管理还会涉及写入队列、临时文件替换等机制。

另外，`readFile()` 会把整个文件读入内存。读取大视频、巨大压缩包时，通常应该使用流，而不是一次性读取全部内容。

## 路径与系统信息（path、os）

### 两个模块的作用

- **`path`**：拼接、解析和处理路径字符串。

- **`os`**：获取操作系统信息，如临时目录、用户目录等。

```Bash
import path from 'node:path';
import os from 'node:os';
```

**处理路径不等于操作文件。**`path` 不会创建目录，也不会检查文件是否存在。

### 路径

```Java
//data/Downloads/demo.zip
path.join('data', 'downloads', 'demo.zip');
// 拼接路径，分隔符随操作系统变化

//当前工作目录/data/config.json
path.resolve('data', 'config.json');
// 根据当前工作目录等参数，生成绝对路径

// 以下结果以 macOS/Linux 为例
path.basename('/data/demo.zip'); // 最后一个路径部分 'demo.zip'
path.dirname('/data/demo.zip');  // 所在目录 '/data'
path.extname('/data/demo.zip');  // 扩展名，包含点 '.zip'
```

- `join()`：拼接并规范化路径，不保证结果是绝对路径。

- `resolve()`：生成绝对路径；相对部分可能以 `process.cwd()` 为基准。

执行过程：

1. 接收多个路径片段。

2. 按当前平台规则连接。

3. 规范化多余的分隔符、`.` 和 `..` 等部分，这里的 `..` 表示回到上一级。

4. 返回路径字符串。

|需求|使用|
|---|---|
|把多个路径片段连接起来|path\.join\(\)|
|根据路径片段确定一个绝对路径|path\.resolve\(\)|

不要认为 `resolve()` 只是“更高级的 join”，两者处理绝对路径片段的规则不同。

#### 工作目录与代码文件所在目录

**相对于当前工作目录**

```Bash
await readFile('./defaults.json', 'utf8');

//从 **process.cwd()** 出发找文件，当前路径
console.log(process.cwd());
```

通常是启动程序时终端所在的目录，不会因为执行了子目录里的脚本而自动改变。

**相对于当前代码文件**

```Bash
const fileUrl = new URL('./defaults.json', import.meta.url);

await readFile(fileUrl, 'utf8');
```

- `import.meta.url`：当前 ESM 模块文件的 URL。

- `new URL()`：以当前模块为基准，解析相对地址。

- 不受终端启动位置影响。

#### path\.parse：一次拆出路径信息

如果要同时获取多个部分，可以使用

```Bash
const info = path.parse('/Users/demo/Downloads/report.pdf');

console.log(info);

//输出
{
  root: '/',
  dir: '/Users/demo/Downloads',
  base: 'report.pdf',
  ext: '.pdf',
  name: 'report'
}
```

其中：

- `root`：根路径。

- `dir`：目录。

- `base`：包含扩展名的文件名。

- `ext`：扩展名。

- `name`：不包含最后一个扩展名的文件名。

#### URL、pathname 与本地路径

```Bash
const url = new URL('https://example.com/files/demo.zip?name=test');

console.log(url.pathname); // '/files/demo.zip'
```

`pathname` 是 URL 的路径部分，不包含域名和查询参数。

对于本地文件，**不要直接把 ****`.pathname`**** 当成通用文件路径**：它可能带有 `%20` 等编码，Windows 格式也存在差异。

需要路径字符串时：

```Bash
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

console.log(filename);
console.log(dirname);

//类似输出
/projects/deskkit/src/index.js
/projects/deskkit/src
```

读取文件时，也可以直接给 `readFile()` 传入 `file:` URL 对象。

#### POSIX 与 Windows 路径规则（跨平台路径）

默认 `path` 根据运行系统选择规则

```Bash
path.join('data', 'downloads', 'demo.zip');

//结果示例
macOS/Linux：data/downloads/demo.zip
Windows：   data\downloads\demo.zip
```

明确使用 POSIX 规则

```Bash
path.posix.join('data', 'downloads', 'demo.zip');
// 所有系统上都得到 'data/downloads/demo.zip'
```

- `path.posix`：按 POSIX （**是一套操作系统接口标准**，先把它理解为 **macOS、Linux 常用的路径规则**即可）路径规则处理。

- `path.win32`：按 Windows 路径规则处理。

- 当前电脑的实际文件路径，通常使用默认 `path`。

### 获取系统信息（OS）

#### 常见接口

```SQL
console.log('操作系统：', os.platform());
console.log('架构：', os.arch());
console.log('用户主目录：', os.homedir());
console.log('临时目录：', os.tmpdir());

//输出因电脑而异，例如：
操作系统： darwin
架构： arm64
用户主目录： /Users/demo
临时目录： /var/folders/.../T
```

|接口|示例结果|含义|
|---|---|---|
|os\.platform\(\)|darwin、win32、linux|当前平台|
|os\.arch\(\)|arm64、x64|当前 Node\.js 二进制的架构|
|os\.homedir\(\)|/Users/demo|当前用户的主目录|
|os\.tmpdir\(\)|/var/folders/\.\.\./T|系统临时目录|

`os.arch()` 不一定等于物理 CPU 架构。例如通过兼容层运行另一种架构的 Node\.js，看到的可能是该 Node\.js 程序的架构。

#### 创建独立临时目录

假设任务需要保存一个中间文件，可以使用系统临时目录

```Bash
import { mkdtemp } from 'node:fs/promises';

const dir = await mkdtemp(
  path.join(os.tmpdir(), 'deskkit-'),
);

//如果打印输出
/tmp/deskkit-aB3xYz
```

执行过程：

1. `os.tmpdir()` 获取临时目录。

2. `path.join()` 拼出目录名前缀。

3. `mkdtemp()` 添加随机后缀，并真正创建目录。

4. 返回新目录的路径。

#### 获取内存和并行能力

可以通过 `os` 观察系统资源

```JavaScript
import os from 'node:os';

const totalGB = os.totalmem() / 1024 ** 3;
const freeGB = os.freemem() / 1024 ** 3;

console.log('总内存：', totalGB.toFixed(1), 'GB');
console.log('空闲内存：', freeGB.toFixed(1), 'GB');

//availableParallelism() 提供可用并行度的估计，不会自动让代码多线程执行。
console.log('建议可用并行度：', os.availableParallelism());
```

#### 不要写死用户目录

不同电脑的用户名、系统和目录设置可能不同，固定路径换台电脑就可能失效。应根据运行环境获取合适的目录。

```Bash
// 不推荐：只适用于特定电脑
const configDir = '/Users/demo/deskkit-data';
```

**普通 Node\.js：根据当前用户生成路径**

```JavaScript
import path from 'node:path';
import os from 'node:os';

const configDir = path.join(os.homedir(), '.deskkit');
```

- `os.homedir()`：获取当前用户的主目录。

- `path.join()`：拼出该目录下的 `.deskkit` 路径。

- 这里只生成路径，不会创建目录。

```Bash
//例如
用户 A：/Users/userA/.deskkit
用户 B：/Users/userB/.deskkit
```

Electron：优先获取系统约定的目录

```Bash
app.getPath('userData');  // 应用配置和数据目录
app.getPath('downloads'); // 系统下载目录

//不要假定下载目录一定是，因为用户可能修改过下载位置
path.join(os.homedir(), 'Downloads');
```

## 二进制数据与编码（Buffer）

### Buffer

**Buffer 是 Node\.js 中用来存放二进制数据的对象。**

我们平时看到的是文字、图片、文件，但计算机存储和传输的都是字节。Buffer 就是装这些字节的容器。

可以先把它理解为：**一个专门存放字节的数组，每个元素的值是 ****`0～255`****。**

```C++
//根据已有的数据，创建一个 Buffer
const buffer = Buffer.from('ABC');

console.log(buffer);    // <Buffer 41 42 43>
console.log(buffer[0]);  // 65
console.log(buffer.length); // 3
```

- `41` 是十六进制，等于十进制的 `65`。

- `65` 是字符 `A` 对应的编码值。

- `ABC` 在 UTF\-8 编码下占 3 个字节。

`Buffer` 是 Node\.js 的全局对象，可以直接使用

### 编码

规定“文字如何转换成字节”。解码则是把字节还原成文字。

```C++
const buffer = Buffer.from('你好', 'utf8');

console.log(buffer);
// <Buffer e4 bd a0 e5 a5 bd>

console.log(buffer.toString('utf8'));
// 你好
```

执行过程

1. `Buffer.from()` 按 UTF\-8 编码把文字转换成字节。

2. Buffer 保存这些字节。

3. `toString()` 按 UTF\-8 解码，把字节还原为文字。

这两处的默认编码都是 `utf8`，

注意：**Buffer 本身保存的是字节，不会记住你使用了什么文字编码。** 解码规则用错，就可能出现乱码。

### 创建和操作 Buffer

**从已有数据创建**

```Plain Text
const buffer = Buffer.from([65, 66, 67]);

console.log(buffer.toString()); // ABC
```

这里直接提供字节的数值，而不是先提供文字。

**创建指定大小的空间**

```Plain Text
const buffer = Buffer.alloc(3);

console.log(buffer); // <Buffer 00 00 00>

buffer[0] = 65;
buffer[1] = 66;
buffer[2] = 67;

console.log(buffer.toString()); // ABC
```

`Buffer.alloc(3)` 创建 3 个字节的空间，初始值都是 `0`。

**创建后长度固定，可以修改里面的字节，但不能像普通数组那样 ****`push()`**** 扩容。**

- 读取文本：可以指定 `utf8`，直接得到字符串。

- 读取图片、压缩包等二进制文件：保留 Buffer，不要随意转成字符串。

## 流与管道（Stream）

Stream（流）是一种**分块读取或写入数据**的方式。

处理大文件时，不必把整个文件一次性放进内存，而是读取一部分、处理一部分。

- `readFile()`：读取完整文件后，再得到数据。

- 读取流：分多次得到数据，每次得到一块（chunk）。

流适用于文件下载、文件复制、音视频传输等场景。

### 四种流

|类型|作用|常见例子|
|---|---|---|
|Readable（可读流）|读取数据|文件读取流|
|Writable（可写流）|写入数据|文件写入流|
|Duplex（双工流）|既能读，也能写|网络 Socket|
|Transform（转换流）<br>|读取原文件 → 转换数据→ 写入文件<br>|压缩、解压|

### 可读流：分块读取文件

```JavaScript
import { createReadStream } from 'node:fs';

const readable = createReadStream('./hello.txt');

readable.on('data', (chunk) => {
  console.log('收到一块数据：', chunk);
});

readable.on('end', () => {
  console.log('数据读取完毕');
});

readable.on('error', (error) => {
  console.error('读取失败：', error.message);
});
```

执行过程：

1. 创建文件读取流。

2. 监听 `data` 后，流开始持续提供数据。

3. 每读取一块数据，触发一次 `data`。

4. 数据读取完毕，触发 `end`。

默认情况下，文件读取流中的 `chunk` 是 **Buffer**。指定编码后，可以得到字符串

```Plain Text
const readable = createReadStream('./hello.txt', {
  encoding: 'utf8',
  
  //可以通过 highWaterMark 调整内部缓冲阈值
  highWaterMark: 4,
});
```

一块数据不等于一行文字，也不一定是一条完整消息。

### 可写流：分次写入文件

```JavaScript
import { createWriteStream } from 'node:fs';

const writable = createWriteStream('./output.txt');

writable.on('finish', () => {
  console.log('写入完成');
});

writable.on('error', (error) => {
  console.error('写入失败：', error.message);
});

writable.write('第一行\n');
writable.write('第二行\n');
writable.end();
```

- `write()`：提交一块需要写入的数据。

- `end()`：表示不会再写入新数据，开始收尾。

- `finish`：调用 `end()` 后，已提交的数据全部处理完毕。

**`end()`**** 不表示立即写完，也不能在调用后继续 ****`write()`****。**

注意：`createWriteStream()` 默认会覆盖原文件。需要追加时使用

```Plain Text
const writable = createWriteStream('./output.txt', {
  flags: 'a',
});
```

### 背压与 drain

数据产生得快，接收方处理得慢，需要让发送方放慢速度，这种协调叫背压。

例如：网络下载很快，但磁盘写入较慢。如果不断堆积数据，会占用越来越多的内存。

**write\(\) 的返回值**

```Plain Text
const canContinue = writable.write(chunk);
```

|返回值|含义|
|---|---|
|`true`|当前可以继续写入|
|`false`|缓冲数据达到阈值，应该暂停后续写入|

**`false`**** 不表示这次写入失败，这块数据已经被接收，不要重复写。**

`highWaterMark` 是触发背压的缓冲阈值，不是严格的内存上限。

**drain 事件**

`drain` 表示：**此前因缓冲积压而暂停写入，现在可以继续写了。**

```Plain Text
const canContinue = writable.write(chunk);

if (!canContinue) {
  writable.once('drain', () => {
    console.log('可以继续写后面的数据了');
  });
}
```

这段代码仅展示监听方式。真正暂停数据来源、恢复后续写入，还需要相应的控制逻辑。

**`drain`**** 不是“整个文件写完了”；写入结束看 ****`finish`****。**

### pipe\(\)：把流连接起来

`pipe()` 可以把可读流的数据交给可写流。

```JavaScript
import { createReadStream, createWriteStream } from 'node:fs';

const readable = createReadStream('./source.txt');
const writable = createWriteStream('./copy.txt');

readable.pipe(writable);
```

执行过程：

1. 从源文件读取一块数据。

2. 把这块数据交给目标文件的可写流。

3. 如果写入跟不上，自动暂停读取。

4. 缓冲压力缓解后，自动恢复。

5. 源流读取结束后，默认结束目标可写流。

因此，使用 `pipe()` 通常不需要手动处理 `write()` 返回值和 `drain`。

但 **`pipe()`**** 不会替你统一处理所有错误，也不保证出错后完整清理相关流。**

### pipeline\(\)：统一处理完成和错误

实际处理多个流时，通常更推荐 `pipeline()`

```JavaScript
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

try {
  await pipeline(
    createReadStream('./source.txt'),
    createWriteStream('./copy.txt'),
  );

  console.log('复制完成');
} catch (error) {
  console.error('复制失败：', error.message);
}
```

`pipeline()` 会：

- 连接各个流。

- 自动处理背压。

- 在出错时销毁相关流。

- 全部完成后让 Promise 成功，失败时让 Promise 拒绝。

注意：**失败时不会自动删除已经写入的部分文件。**

### 常见事件

|事件|常见所属流|含义|
|---|---|---|
|`data`|可读流|收到一块数据|
|`end`|可读流|数据已读取完毕|
|`drain`|可写流|可以恢复后续写入|
|`finish`|可写流|结束写入后，已提交数据处理完毕|
|`error`|两者|发生错误|
|`close`|两者|流已关闭，底层资源已释放|

`close` 不等于成功，因为出错后也可能关闭。

## HTTP 请求与文件下载

### HTTP 请求

客户端向服务器请求资源，服务器返回响应。例如：

- 请求接口，获取 JSON 数据。

- 请求网页，获取 HTML。

- 请求下载地址，获取文件内容。

Node\.js 可以使用内置的 `fetch()` 发起请求。

### 发起请求、读取响应

```JavaScript
const response = await fetch('https://example.com');

if (!response.ok) {
  throw new Error(`请求失败：HTTP ${response.status}`);
}

const text = await response.text();

console.log(text);
```

执行过程：

1. `fetch()` 发起请求。

2. 收到响应状态和响应头，得到 `response`。

3. 检查 HTTP 状态是否成功。

4. `response.text()` 读取完整响应体，转换为字符串。

**`fetch()`**** 返回时，不代表响应内容已经全部下载完成。**

**常用响应属性**

|属性|作用||
|---|---|---|
|response\.status|HTTP 状态码，例如 `200`、`404`|请求处理结果|
|response\.ok|状态码是否在 `200～299` 范围||
|response\.headers|响应头|描述返回的数据|
|response\.body|响应体的可读流|实际返回的内容|

**读取响应头：**

```Bash
console.log(response.headers.get('content-type'));
//示例  text/html; charset=utf-8
console.log(response.headers.get('content-length'));
//示例  "1256"
```

`content-length` 可能不存在，不能假设每次都能提前知道文件大小。

### 读取不同内容

|方法|结果|适用场景|
|---|---|---|
|response\.text\(\)|字符串|文本、HTML|
|response\.json\(\)|解析后的 JavaScript 值|JSON 接口|
|response\.arrayBuffer\(\)|ArrayBuffer|完整读取二进制内容|
|response\.body|可读流|分块处理、文件下载|

读取 JSON：

```JavaScript
const response = await fetch('https://example.com/api/info');

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();
console.log(data);
```

同一个响应体通常只能消费一次，不能先调用 `text()`，再调用 `json()` 读取同一份内容。

### 下载小文件：完整读取后保存

```JavaScript
import { writeFile } from 'node:fs/promises';

const response = await fetch('https://example.com');

if (!response.ok) {
  throw new Error(`下载失败：HTTP ${response.status}`);
}

//ArrayBuffer 可以先理解为 JavaScript 中存放原始字节的一种容器。
//这里通过 Buffer.from()，转换成我们已经学过的 Node.js Buffer。
const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

await writeFile('./page.html', buffer);

console.log('保存完成');
```

执行过程：

1. 请求资源。

2. 把完整响应体读入内存。

3. 转换成 Node\.js 的 Buffer。

4. 写入本地文件。

二进制文件不要先转换成普通字符串，否则可能损坏数据。

### 下载大文件：用流保存

```JavaScript
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const response = await fetch('https://example.com');

if (!response.ok) {
  throw new Error(`下载失败：HTTP ${response.status}`);
}

if (!response.body) {
  throw new Error('响应中没有可读取的内容');
}

await pipeline(
  Readable.fromWeb(response.body),
  createWriteStream('./page.html'),
);

console.log('下载完成');
```

这里新增了一个转换：

```Bash
Readable.fromWeb(response.body)
```

- 因为 `fetch()` 的 `response.body` 是 **Web 可读流**，这里把它转换成 Node\.js 可读流，再交给 `pipeline()`。

- `pipeline()` 负责连接流、处理背压，并在出错时清理相关流。

注意：

- 默认会覆盖同名文件。

- 父目录需要提前存在。

- 下载失败时，可能留下不完整的文件，`pipeline()` 不会自动删除它。

### 请求超时与取消

使用 `AbortController`，可以主动取消请求。

```JavaScript
const controller = new AbortController();

const timer = setTimeout(() => {
  controller.abort();
}, 3_000);

try {
  const response = await fetch('https://example.com', {
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  console.log(text);
} catch (error) {
  console.error('请求失败或已取消：', error.message);
} finally {
  clearTimeout(timer);
}
```

|代码|作用|
|---|---|
|`new AbortController()`|创建取消控制器|
|`signal: controller.signal`|让请求接收取消通知|
|`controller.abort()`|发出取消通知|

执行顺序

1. 创建控制器。

2. 启动 3 秒定时器，代码继续向下执行。

3. 发起请求，并传入取消信号。

4. 等待响应、读取内容。

5. 成功或失败后，都清除定时器。

**3 秒内完成：** 清除定时器，不再执行取消。

**超过 3 秒还没完成：** 定时器调用 `abort()`，中止尚未完成的请求或响应体读取，通常产生 `AbortError`。

`await` 不会阻止定时器运行。

计时从调用 `setTimeout()` 开始。

事件循环繁忙时，回调可能晚于 3 秒执行。

不传 `signal`，这个控制器就不能取消该请求。

### 请求失败区分

|层次|例子|如何发现|
|---|---|---|
|网络层|断网、DNS 失败、连接失败|`fetch()` 抛出错误|
|HTTP 层|`404`、`500`|检查 `response.ok`、`status`|
|内容层|返回的不是合法 JSON|`response.json()` 抛出错误|
|文件层|目录不存在、无权限、磁盘空间不足|文件写入或 `pipeline()` 抛出错误|

HTTP 错误状态时，**`fetch()`**** 默认不会因此抛错**，需要主动判断：

```Bash
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
```

**因此：请求得到了响应，不等于业务请求成功。**

## 子进程与系统命令（child\_process）

`child_process` 是 Node\.js 内置模块，用来**启动其他程序，并管理它们的输入、输出和运行状态**。

例如调用 Git、执行 Python 脚本，或者启动另一个 Node\.js 程序。被调用的程序需要已经安装。

- **父进程**：发起调用的进程。

- **子进程**：被启动的新进程。

子进程有独立的内存，不能直接读取父进程的 JavaScript 变量。双方通过参数、环境变量、输入输出或 IPC 消息交换信息。

异步启动子进程不会一直阻塞父进程，但也不代表任务一定更快，因为创建进程和通信都有开销。

### 标准输入输出

|通道|名称|作用|
|---|---|---|
|`stdin`|标准输入|向程序提供数据|
|`stdout`|标准输出|输出正常结果|
|`stderr`|标准错误输出|输出错误、警告、进度等诊断信息|

```Bash
console.log('正常结果');   // 通常写入 stdout
console.error('错误信息'); // 通常写入 stderr
```

**`stderr`**** 有内容不一定表示失败。** 判断是否成功，还需要结合退出码。

### spawn：启动程序，分块处理输出

```JavaScript
import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['--version']);

child.stdout.setEncoding('utf8');

child.stdout.on('data', (text) => {
  console.log('收到输出：', text);
});

child.stderr.setEncoding('utf8');

child.stderr.on('data', (text) => {
  console.error('诊断信息：', text);
});

child.on('error', (error) => {
  console.error('子进程错误：', error.message);
});

child.on('close', (code, signal) => {
  console.log('退出码：', code);
  console.log('终止信号：', signal);
});
```

```Bash
//参数与返回值
spawn(程序, 参数数组, 可选配置);
//例如
spawn('git', ['log', '-3', '--oneline']);
//相当于执行
git log -3 --oneline
```

`spawn()` 返回 `ChildProcess` 对象，不是 Promise，因此：

```Bash
await spawn('git', ['--version']);
```

不能等待子进程执行完成。

**输出也是流**

默认情况下，`child.stdout` 和 `child.stderr` 是可读流：

- `data` 事件默认提供 Buffer。

- `setEncoding('utf8')` 后提供字符串。

- 一块数据不一定是一整行。

- 设置编码可以正确处理跨块的 UTF\-8 字符。

### stdio：决定输入输出接到哪里

默认 pipe：父进程可以读取输出

```Bash
const child = spawn(process.execPath, ['--version']);

child.stdout.on('data', (chunk) => {
  console.log(chunk.toString());
});
```

Node\.js 创建管道，父进程通过 `child.stdout` 获取输出，再决定打印、过滤还是保存。

**inherit：直接沿用父进程的输入输出**

```JavaScript
const child = spawn(process.execPath, ['--version'], {
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(error.message);
});

//此时：
child.stdout; // null
//不能再使用：
child.stdout.on('data', callback);
**//原因是：没有额外创建供父进程读取的输出管道。终端能显示内容，不代表父进程的 JavaScript 代码拿到了内容。**
```

如果父进程连接着终端，子进程输出就直接显示在同一个终端。

选择方式：

- 需要在代码中处理输出：使用默认的 `'pipe'`。

- 只需要直接显示输出：使用 `'inherit'`。

`inherit` 不一定指向终端；父进程输出如果被重定向到文件，子进程也会沿用那个去向。

### 判断执行是否成功

error：启动等过程发生错误

常见原因：

- 程序不存在。

- 工作目录不存在。

- 没有执行权限。

```Bash
child.on('error', (error) => {
  console.error(error.code, error.message);
});
```

退出码：程序运行后的结果

通常约定：

- `0`：成功。

- 非 `0`：失败，具体含义由程序决定。

- 被信号终止：退出码通常为 `null`，查看 `signal`。

**对 ****`spawn()`**** 而言，非零退出码不会自动触发 ****`error`**** 事件。**

#### exit 和 close

|事件|含义|
|---|---|
|`exit`|子进程已经退出，但输出流可能还未关闭|
|`close`|子进程结束，相关标准输入输出流也已关闭|

如果要等输出接收结束，通常监听 `close`。

启动失败后也可能继续触发 `close`，实际封装时要避免重复处理失败。

### exec：执行整条 Shell 命令，收集输出

```JavaScript
import { exec } from 'node:child_process';

exec('node --version', (error, stdout, stderr) => {
  if (error) {
    console.error('执行失败：', error.message);
    return;
  }

  console.log('完整输出：', stdout);

  if (stderr) {
    console.error('诊断信息：', stderr);
  }
});
```

特点：

- 传入整条命令字符串。

- 默认通过 Shell 执行。

- 内部收集输出，结束后通过回调提供。

- 默认的 `stdout`、`stderr` 是字符串。

- 非零退出码通常会体现为回调中的 `error`。

#### Shell 的作用

Shell 是命令解释器，负责理解 `&&`、`|`、`>` 等语法。

```Bash
exec('node --version && git --version', callback);
```

`&&` 表示第一条命令成功后，再执行第二条。

不同系统的 Shell 语法可能不同，`exec()` 默认使用的 Shell 也不一定是当前终端使用的那个。

#### maxBuffer

`exec()` 会把输出收集到内存，并设置容量上限 `maxBuffer`。

输出超过限制时，子进程会被终止，并产生错误。

因此：

- 少量输出、需要 Shell 语法：适合 `exec()`。

- 长时间运行、大量输出：通常使用 `spawn()`。

`exec()` 也能监听实时输出，但**内部仍然会收集输出，仍受 ****`maxBuffer`**** 限制**。

### execFile：直接执行程序，收集输出

```JavaScript
import { execFile } from 'node:child_process';

execFile(
  process.execPath,
  ['--version'],
  (error, stdout, stderr) => {
    if (error) {
      console.error('执行失败：', error.message);
      return;
    }

    console.log('完整输出：', stdout);
  },
);
```

它结合了两方面的特点：

- 像 `spawn()`：程序与参数分开传递，默认不启动 Shell。

- 像 `exec()`：执行完后，在回调中拿到收集好的输出。

它也受 `maxBuffer` 限制，不适合无限收集大量输出。

**使用 async/await**

```JavaScript
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

try {
  const { stdout } = await execFileAsync(
    process.execPath,
    ['--version'],
  );

  console.log(stdout);
} catch (error) {
  console.error('执行失败：', error.message);
}
```

`promisify()` 将这里的回调 API 转换成 Promise API，使 `await` 可以等待执行完成。

#### cwd：子进程的工作目录

```JavaScript
execFile(
  'git',
  ['status', '--short'],
  { cwd: '/你的项目绝对路径' },
  (error, stdout) => {
    if (error) {
      console.error(error.message);
      return;
    }

    console.log(stdout);
  },
);
```

相当于在指定目录下执行命令，但不会改变父进程的 `process.cwd()`。

#### env：传递环境变量

```JavaScript
const child = spawn(
  process.execPath,
  //这里的 -e 表示执行后面的 JavaScript 字符串。
  ['-e', 'console.log(process.env.APP_MODE)'],
  {
    env: {
      ...process.env,
      APP_MODE: 'development',
    },
    stdio: 'inherit',
  },
);

child.on('error', (error) => {
  console.error(error.message);
});
```

`...process.env`用于保留父进程已有的环境变量，再补充或覆盖指定变量。

不指定 `env`：默认继承父进程环境。

指定 `env`：使用提供的环境对象，不会自动帮你合并全部原有变量。

### fork：启动 Node\.js 子进程并传递消息

`fork()` 专门用于启动 Node\.js 模块，并建立 IPC 消息通道。

它不是创建线程，也不会让父子进程共享 JavaScript 内存。

父进程 `parent.js`：

```JavaScript
import { fork } from 'node:child_process';

const child = fork(
  new URL('./worker.js', import.meta.url),
);

child.on('message', (message) => {
  console.log('收到结果：', message);
});

child.on('error', (error) => {
  console.error(error.message);
});

child.send({ a: 2, b: 3 });
```

子进程 `worker.js`：

```Bash
process.on('message', (message) => {
  process.send(
    { result: message.a + message.b },
    () => {
      process.disconnect();
    },
  );
});

//运行：
node parent.js
//收到：
收到结果： { result: 5 }
```

**通信方法**

|位置|发送消息|接收消息|
|---|---|---|
|父进程|`child.send()`|`child.on('message', ...)`|
|子进程|`process.send()`|`process.on('message', ...)`|

消息通过序列化传递，不是共享同一个对象。这里发送结束后断开 IPC 通道，没有其他待处理任务时，子进程可以自然退出。

### API 选择总结

|API|默认使用 Shell|输出处理方式|主要用途|
|---|---|---|---|
|`spawn()`|否|流式处理|长任务、持续或大量输出|
|`exec()`|是|收集后通过回调返回|需要 Shell 语法、输出较少|
|`execFile()`|否|收集后通过回调返回|执行指定程序，获取少量结果|
|`fork()`|否|默认继承输出，另有 IPC 通道|Node\.js 进程间协作|

持续处理输出：`spawn()`。

调用程序并获取最终结果：优先考虑 `execFile()`。

确实需要 Shell 语法：`exec()`。

启动 Node\.js 模块并交换消息：`fork()`。

## 错误处理与日志调试

**三个概念**

|概念|解决的问题|
|---|---|
|错误处理|失败后怎么办：恢复、提示、向上传递或结束任务|
|日志记录|留下执行过程和错误信息|
|调试|观察变量和执行过程，定位错误原因|

### Error 与 throw

#### Error：描述错误

```C++
const error = new Error('读取失败');

console.log(error.message); // 错误说明
console.log(error.name);    // 错误类型
console.log(error.stack);   // 错误描述与调用堆栈
```

常见属性：

- `message`：错误说明。

- `name`：错误类型名称，如 `Error`、`TypeError`。

- `stack`：定位错误的调用堆栈。

- `code`：部分 Node\.js 错误提供的错误码，如 `ENOENT`，不是所有错误都有。

- `cause`：创建错误时指定的原始原因。

#### throw：抛出错误

```JavaScript
function divide(a, b) {
  if (b === 0) {
    throw new Error('除数不能为 0');
  }

  return a / b;
}
```

执行到 `throw` 后：

1. 当前执行路径中断，不再执行后续语句。

2. 错误沿调用关系向外传递。

3. 寻找能够处理它的 `catch`。

**`new Error()`**** 只是创建对象，****`throw`**** 才会抛出错误。** 推荐抛出 `Error` 对象，而不是字符串，以保留堆栈。

### try、catch、finally

```JavaScript
try {
  const result = divide(10, 0);
  console.log('计算成功：', result);
} catch (error) {
  console.error('计算失败：', error.message);
} finally {
  console.log('本次计算结束');
}
```

|部分|作用|
|---|---|
|`try`|执行可能失败的操作|
|`catch`|接收并处理异常|
|`finally`|执行清理、收尾工作|

**注意：**

- 抛错后会跳过 `try` 中剩余语句。

- 处理结束后，不会回到抛错位置继续执行。

- 成功提示应放在成功路径中，不能在失败后仍报告成功。

- `finally` 适合关闭资源、清除定时器。

- 避免在 `finally` 中使用 `return`，它可能覆盖返回值或掩盖错误。

- 强制终止进程等情况，不能保证 `finally` 执行。

### 异步错误的处理

#### Promise：使用 \.catch\(\)

```JavaScript
import { readFile } from 'node:fs/promises';

readFile('./hello.txt', 'utf8')
  .then((text) => {
    console.log(text);
  })
  .catch((error) => {
    console.error('读取失败：', error.message);
  });
```

前面的 Promise 拒绝，以及 `.then()` 回调中抛出的异常，都可以传到后面的 `.catch()`。

#### async/await：配合 try\.\.\.catch

```JavaScript
try {
  const text = await readFile('./hello.txt', 'utf8');
  console.log(text);
} catch (error) {
  console.error('读取失败：', error.message);
}
```

`await` 会让 Promise 的拒绝在当前位置表现为异常。

**下面的写法无法捕获之后发生的读取失败：**

```Bash
try {
  readFile('./hello.txt', 'utf8'); // 没有 await 或 .catch()
} catch (error) {
  console.error(error);
}
```

原则：每个可能失败的 Promise 都应有明确的错误处理路径。

#### 定时器：外层 catch 抓不到未来回调的异常

```JavaScript
try {
  setTimeout(() => {
    throw new Error('定时任务失败');
  }, 1000);
} catch (error) {
  // 抓不到回调中抛出的这个错误
}
```

原因：回调执行时，外层 `try` 已经结束。

应在回调内部处理可能抛出的同步异常：

```JavaScript
setTimeout(() => {
  try {
    JSON.parse('不是合法 JSON');
  } catch (error) {
    console.error('解析失败：', error.message);
  }
}, 1000);
```

判断能否捕获错误，要看执行时机和错误传递方式，不能只看代码嵌套位置。

### 不同 API 的错误入口

|API 形式|错误处理方式|
|---|---|
|同步调用|`try...catch`|
|Promise|`.catch()`|
|`async/await`|`await` 配合 `try...catch`|
|传统回调|检查回调第一个参数|
|事件、流|监听 `error`|
|Promise 版 `pipeline()`|`await` 配合 `try...catch`|

**回调：错误优先**

```JavaScript
import { readFile } from 'node:fs';

readFile('./hello.txt', 'utf8', (error, text) => {
  if (error) {
    console.error(error.message);
    return;
  }

  console.log(text);
});
```

处理错误后使用 `return`，避免继续执行成功逻辑。

**事件、流：监听 error**

```JavaScript
import { createReadStream } from 'node:fs';

const stream = createReadStream('./hello.txt');

stream.on('error', (error) => {
  console.error('读取失败：', error.message);
});
```

Node\.js 的 `EventEmitter` 触发 `error` 时，如果没有对应监听器，会抛出异常，可能导致进程退出。

### 捕获之后如何处理？

#### 能恢复：提供合理替代结果

```JavaScript
import { readFile } from 'node:fs/promises';

async function loadSettings() {
  try {
    const text = await readFile('./settings.json', 'utf8');
    return JSON.parse(text);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { theme: 'light' };
    }

    throw error;
  }
}
```

处理规则：

- 文件不存在：使用默认配置。

- 格式错误、权限不足等：继续抛出，不掩盖问题。

#### 处理不了：向上传递

```Bash
throw error;
```

保留原来的错误对象和堆栈。如果只是捕获后原样抛出，没有其他工作，通常可以省略这一层 `catch`。

#### 补充背景：保留 cause

```Bash
throw new Error('加载配置失败', {
  cause: error,
});
```

外层错误描述当前任务，`cause` 保留底层原因，避免只剩一句模糊的“操作失败”。

### 日志记录

**常用方法**

```JavaScript
console.log('开始处理');   // 普通信息
console.warn('使用默认值'); // 警告
console.error('处理失败'); // 错误
```

`console.log()` 通常写入标准输出。

`console.warn()`、`console.error()` 通常写入标准错误输出。

这些方法不会自动将日志保存为文件。

**有效日志应包含什么？**

- 时间。

- 日志级别。

- 正在执行的操作。

- 必要的上下文，如任务标识。

- 错误信息和堆栈。

在 `catch` 中可以这样记录：

```Go
console.error(JSON.stringify({
  time: new Date().toISOString(),
  level: 'error',
  action: 'load-settings',
  message: error.message,
  code: error.code,
  stack: error.stack,
}));
```

直接 `JSON.stringify(error)` 往往无法保留 `message`、`stack` 等信息，所以需要显式取出字段。

**日志注意事项**

- 不记录密码、令牌、私钥等秘密。

- 不把所有错误都压缩成一句“失败了”。

- 不在每一层重复记录同一个错误。

- 面向用户的提示应清晰，面向排查的日志应保留必要细节。

### 错误堆栈与断点调试

#### 阅读堆栈

```Bash
SyntaxError: ...
    at JSON.parse (<anonymous>)
    at parseConfig (.../index.js:2:15)
    at start (.../index.js:6:3)
```

阅读顺序：

1. 看第一行的错误类型和说明。

2. 找第一个属于自己代码的位置。

3. 根据行号、列号定位语句。

4. 沿调用关系查看传入的数据。

#### 断点调试

在代码中设置暂停位置：

```Bash
const total = price * count;

debugger;

console.log(total);

//以调试模式启动：
node --inspect-brk index.js
```

连接调试器后，可以：

- 查看当前变量。

- 查看调用栈。

- 单步执行。

- 进入函数内部。

- 在异常抛出时暂停。

`--inspect-brk` 会在用户代码开始前暂停。调试端口应保持本地访问，不要随意暴露到公网。

### 顶层错误处理

普通命令行脚本可以在入口统一处理任务失败：

```JavaScript
async function main() {
  // 执行任务，失败时向外抛出
}

main().catch((error) => {
  console.error('任务失败：', error);
  process.exitCode = 1;
});
```

`process.exitCode = 1` 表示设置失败退出码，待没有其他工作维持进程运行时自然退出，不会立刻强制结束。

全局的 `uncaughtException`、`unhandledRejection` 属于最后兜底机制，**不能代替正常的错误处理，也不能保证出错后继续运行是安全的。**

```JavaScript
process.on('uncaughtException', (error) => {
  // 最后兜底
});

process.on('unhandledRejection', (reason) => {
  // 发现没有处理的 Promise 拒绝
});
```

它们分别涉及：

- 没有被捕获的异常。

- 没有及时被处理的 Promise 拒绝。

这类机制更适合最后的诊断和受控退出策略；正常业务错误仍应在明确的位置处理。具体退出行为还会受到 Node\.js 配置和监听器设置影响。

## Electron 应用生命周期与窗口管理

Electron 可以让我们使用 **HTML、CSS、JavaScript 构建桌面应用**。

它主要结合了：

- **Chromium**：负责显示网页界面。

- **Node\.js**：提供文件、进程等系统操作能力。

- **Electron API**：管理桌面窗口、应用菜单、托盘等。

需要先区分两个概念：

- **应用**：整个程序。

- **窗口**：应用中的一个界面。

一个应用可以拥有多个窗口，也可以在没有窗口时继续运行。

### 主进程与渲染进程

|类型|主要职责|
|---|---|
|主进程|管理应用生命周期、创建窗口、执行系统操作|
|渲染进程|展示页面、响应用户交互|

#### 主进程

Electron 启动时，会执行 `package.json` 中 `main` 指向的入口文件：

```Bash
{
  "type": "module",
  "main": "main.js",
  "scripts": {
  //electron .：让 Electron 启动当前目录的应用。
    "start": "electron ."
  }
}
```

主进程通过 Electron API 管理应用：

```Bash
const { app, BrowserWindow } = require('electron');
```

#### 渲染进程

窗口加载的 HTML、React 页面运行在渲染进程中。

在默认及推荐的安全配置下，页面不能直接调用 Node\.js 的 `fs` 等模块。需要通过 preload 暴露受控接口，再使用 IPC 请求主进程执行相关操作。

### 应用生命周期

**常见流程**

```Bash
启动主进程-->Electron 初始化完成-->创建窗口、加载页面-->用户操作、关闭窗口-->根据平台与程序逻辑决定是否退出
```

#### app\.whenReady\(\)：等待初始化完成

```Bash
app.whenReady().then(() => {
  createWindow();
});
```

`whenReady()` 返回 Promise，Electron 初始化完成后兑现。

**窗口应当在应用 ready 后创建。** 很多 Electron API 也需要在此之后使用。

#### window\-all\-closed：所有窗口都关闭了

```Bash
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

`process.platform` 常见值：

|值|系统|
|---|---|
|`darwin`|macOS|
|`win32`|Windows|
|`linux`|Linux|

这段代码实现常见的桌面行为：

- Windows、Linux：所有窗口关闭后，退出应用。

- macOS：所有窗口关闭后，应用仍可保持运行。

**关闭所有窗口与退出应用，不是同一件事。**

#### activate：应用被重新激活

macOS 用户点击 Dock 中的应用图标时，可能触发 `activate`

```Bash
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

这里先判断是否还有窗口，没有才创建，避免每次激活都重复开窗。

#### 退出相关事件

正常调用 `app.quit()` 时，主要过程通常是

```Bash
before-quit-->尝试关闭所有窗口-->will-quit-->quit
```

|事件|含义|
|---|---|
|`before-quit`|开始尝试退出，可阻止退出|
|`will-quit`|窗口已关闭，即将退出，可阻止退出|
|`quit`|应用正在退出，不能再取消|

**注意：**

- 调用 `app.quit()` 的退出流程通常不会触发 `window-all-closed`。

- 强制终止、系统关机等情况下，不能保证所有退出事件都触发。

### 创建与加载窗口

#### 创建 BrowserWindow

```YAML
const win = new BrowserWindow({
  width: 1000,
  height: 700,
  minWidth: 600,
  minHeight: 400,
  title: '我的应用',
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
  },
});
```

常见配置

|配置|作用|
|---|---|
|`width`、`height`|窗口初始宽高|
|`minWidth`、`minHeight`|窗口最小宽高|
|`resizable`|是否允许调整大小|
|`show`|创建后是否立即显示|
|`title`|初始窗口标题，页面标题可能影响它|
|`webPreferences`|页面运行环境与安全设置|

推荐的安全配置含义：

- `nodeIntegration: false`：不让普通页面直接使用 Node\.js。

- `contextIsolation: true`：隔离 preload 与页面的 JavaScript 上下文。

- `sandbox: true`：对渲染进程启用沙箱限制。

#### 加载本地页面

```Bash
win.loadFile('index.html');
```

#### 加载 URL

```Bash
win.loadURL('http://localhost:5173');
```

开发时常加载本地开发服务器，打包后通常加载构建出的本地页面。

`loadFile()` 和 `loadURL()` 都返回 Promise，可以处理加载失败

```Bash
win.loadFile('index.html').catch((error) => {
  console.error('页面加载失败：', error);
});
```

加载远程内容时，应严格限制权限、导航和窗口创建行为，不能把不可信页面当成本地可信代码。

### 窗口生命周期与事件

#### ready\-to\-show：准备显示

```Bash
const win = new BrowserWindow({
  show: false,
});

win.once('ready-to-show', () => {
  win.show();
});

win.loadFile('index.html');
```

先隐藏窗口，等页面完成初步渲染、可以显示后再展示，可以减少打开时的闪白。

注意：

- `ready-to-show` 不代表业务数据全部加载完成。

- 它与页面加载完成不是同一个概念。

- `once()` 只监听一次，适合这种一次性行为。

#### close：窗口即将关闭

```Bash
win.on('close', (event) => {
  if (hasUnsavedChanges) {
    event.preventDefault();
  }
});
```

`hasUnsavedChanges` 代表应用自己维护的“是否存在未保存内容”状态。

`close` 阶段可以调用 `event.preventDefault()` 阻止关闭，例如等待用户确认是否放弃未保存内容。

不能仅靠在监听器里写 `await` 来暂停关闭流程；需要先明确阻止关闭，再处理后续确认逻辑。

#### closed：窗口已经关闭

```Bash
win.on('closed', () => {
  mainWindow = null;
});
```

窗口已销毁后：

- 不能再通过旧对象操作窗口。

- 应清理保存的窗口引用。

- 清理与该窗口绑定的定时器、监听等资源。

**常见事件对照**

|事件|所属对象|含义|
|---|---|---|
|`ready-to-show`|`BrowserWindow`|页面已完成初步渲染，可以显示|
|`did-finish-load`|`win.webContents`|页面完成加载，不等于业务初始化完成|
|`focus` / `blur`|`BrowserWindow`|获得 / 失去焦点|
|`close`|`BrowserWindow`|尝试关闭，可以阻止|
|`closed`|`BrowserWindow`|已经关闭并销毁|

### 常见窗口操作

```Go
win.show();        // 显示
win.hide();        // 隐藏
win.focus();       // 获取焦点
win.minimize();    // 最小化
win.maximize();    // 最大化
win.unmaximize();  // 取消最大化
win.restore();     // 从最小化恢复
win.close();       // 请求正常关闭
```

hide、close、destroy 的区别

|方法|行为|
|---|---|
|`hide()`|隐藏窗口，窗口和页面仍然存在|
|`close()`|请求关闭，会走可被阻止的关闭流程|
|`destroy()`|强制销毁窗口，绕过正常的关闭确认流程|

因此：

- 隐藏后可以直接 `show()`。

- 关闭并销毁后，需要重新创建窗口。

- 通常优先使用 `close()`，不要随意用 `destroy()` 绕过保存确认。

**操作前也可以判断：**

```Bash
if (mainWindow && !mainWindow.isDestroyed()) {
  mainWindow.show();
}
```

### BrowserWindow 与 webContents

可以把一个窗口分为两层：

- **BrowserWindow**：外面的桌面窗口。

- **webContents**：窗口里面运行的网页内容。

```Bash
win.setTitle('新标题');          // 操作窗口
win.webContents.reload();       // 重新加载页面
win.webContents.openDevTools(); // 打开页面开发者工具
```

页面加载事件监听在 `webContents` 上

```Bash
win.webContents.on('did-finish-load', () => {
  console.log('页面加载完成');
});
```

**窗口大小、显示、关闭找 ****`BrowserWindow`****；页面加载、导航、开发者工具找 ****`webContents`****。**

### 完整基础示例

**主进程代码**

```JavaScript
import { app, BrowserWindow } from 'electron';

let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow = win;

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  win.loadFile('index.html').catch((error) => {
    console.error('页面加载失败：', error);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

执行顺序：

1. Electron 启动主进程。

2. 应用初始化完成后创建窗口。

3. 窗口加载本地页面。

4. 页面准备显示时，显示窗口。

5. 窗口关闭后清理引用。

6. Windows、Linux 在所有窗口关闭后退出。

7. macOS 保持运行，重新激活且没有窗口时创建新窗口。

## 窗口与视图容器（BrowserWindow、webContents、WebContentsView、webview）

- **窗口**：操作系统中的桌面窗口，可以移动、缩放、最小化、关闭。

- **视图**：窗口中承载内容的一块区域。

- **网页内容**：这块区域里加载的 HTML、CSS、JavaScript。

例如一个应用左边显示导航页面，右边显示内容页面：

```Bash
桌面窗口
├── 左侧视图：导航网页
└── 右侧视图：内容网页
```

一个窗口不一定只包含一份网页。

|名称|作用|
|---|---|
|`BrowserWindow`|自带网页内容的桌面窗口|
|`webContents`|控制一份网页内容，如加载、导航、通信|
|`BaseWindow`|不自动附带网页内容的桌面窗口|
|`WebContentsView`|承载网页内容、可以放入窗口的原生视图|
|`<webview>`|写在页面中的特殊标签，用于嵌入独立网页内容|

注意：**`webContents`**** 不是额外的一块可见区域，而是网页内容的控制对象。**

### BrowserWindow：自带网页的窗口

适合一个窗口主要展示一份页面的场景。

```JavaScript
import { app, BrowserWindow } from 'electron';

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.loadFile('index.html');
});
```

**关系**

```Bash
BrowserWindow（桌面窗口）
└── 自带的网页内容
    └── webContents（控制这份网页）
```

**常见窗口操作**

```Bash
win.show();      // 显示
win.hide();      // 隐藏
win.minimize();  // 最小化
win.close();     // 请求关闭
```

**窗口操作由 ****`BrowserWindow`**** 负责，网页操作通常由 ****`webContents`**** 负责。**

### webContents：网页的控制器

**通过窗口取得：****`const contents = win.webContents;`**

常见操作

```Bash
contents.loadURL('https://example.com'); // 加载网页
contents.reload();                      // 刷新网页
contents.openDevTools();                // 打开开发者工具
contents.send('task:progress', 50);      // 向网页发送 IPC 消息
```

监听页面加载

```JavaScript
contents.on('did-start-loading', () => {
  console.log('开始加载');
});

contents.on('did-finish-load', () => {
  console.log('加载完成');
});

contents.on('render-process-gone', (_event, details) => {
  console.error('渲染进程退出：', details.reason);
});
```

需要注意：

- `did-finish-load` 不代表业务接口请求全部完成。

- 多份独立网页内容，各自拥有对应的 `webContents`。

- 给某个 `webContents` 发消息，不等于给所有窗口广播。

可以把 `webContents` 理解成：每份网页各自配备的遥控器，控制加载、刷新、导航和通信。

### BaseWindow：不自带网页的窗口

`BaseWindow` 提供桌面窗口，但不会自动创建网页内容。

```Bash
import { BaseWindow } from 'electron';

const win = new BaseWindow({
  width: 1000,
  height: 700,
});
```

以上代码需要在 `app.whenReady()` 之后执行。

它有一个用于容纳子视图的根视图：`win.contentView`

```Bash
BaseWindow（桌面窗口）
└── contentView（根视图容器）
    ├── 子视图 A
    └── 子视图 B
```

### WebContentsView：放进窗口的网页视图

#### 创建视图

```JavaScript
import { WebContentsView } from 'electron';

const view = new WebContentsView({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
  },
});
```

#### 添加到窗口

```Bash
win.contentView.addChildView(view);
```

#### 设置位置和大小

```Bash
view.setBounds({
  x: 0,            //相对于父视图左上角的横向位置
  y: 0,            //相对于父视图左上角的纵向位置
  width: 300,      //视图宽度
  height: 600,     //视图高度
});
```

#### 加载页面

```Bash
view.webContents.loadURL('https://example.com');
```

```Bash
BaseWindow
└── contentView
    └── WebContentsView
        └── webContents
            └── 控制加载的网页
```

**`WebContentsView`**** 不是 DOM 元素，不能用页面里的 Flex、Grid 或 CSS 直接布局它。** 它在窗口中的位置通常由主进程通过 `setBounds()` 管理，视图内部的网页再使用 CSS 布局。

### 多个视图与 resize

例如左边导航、右边内容

```Bash
BaseWindow
└── contentView
    ├── navigationView
    │   └── 导航网页
    └── contentView
        └── 内容网页
```

布局代码：

```Bash
function layoutViews() {
  const [width, height] = win.getContentSize();
  const sidebarWidth = Math.min(240, width);

  navigationView.setBounds({
    x: 0,
    y: 0,
    width: sidebarWidth,
    height,
  });

  pageView.setBounds({
    x: sidebarWidth,
    y: 0,
    width: width - sidebarWidth,
    height,
  });
}

layoutViews();

win.on('resize', layoutViews);
```

这里：

- `getContentSize()`：获取窗口内容区域的大小。

- `resize`：窗口大小发生变化时触发。

- `layoutViews()`：重新计算各视图的位置和尺寸。

**只设置一次大小，窗口缩放后，视图不会自动按你设想的左右比例重新布局。**

### 移除视图不等于销毁网页

从窗口移除：`win.contentView.removeChildView(view);`

它表示：不再把这个视图放在当前容器中显示。

但并不等于其网页内容已经关闭。

如果不再使用，需要管理对应 `webContents` 的生命周期：

```Bash
if (!view.webContents.isDestroyed()) {
  view.webContents.close();
}
```

特别注意：**关闭 ****`BaseWindow`**** 时，添加进去的 ****`WebContentsView`**** 的 ****`webContents`**** 不会自动全部销毁，需要主动清理。**

否则，界面虽然不见了，相关网页资源仍可能存活。

如果页面存在未保存内容，还要单独设计确认关闭逻辑，不能只考虑资源释放。

### BaseWindow \+ WebContentsView 示例

以下示例使用支持这两个 API 的现代 Electron 版本，主进程采用 ESM，`package.json` 设置 `"type": "module"`。

```JavaScript
import {
  app,
  BaseWindow,
  WebContentsView,
} from 'electron';

function createWindow() {
  const win = new BaseWindow({
    width: 1000,
    height: 700,
  });

  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.contentView.addChildView(view);

  function layout() {
    const [width, height] = win.getContentSize();

    view.setBounds({
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  layout();
  win.on('resize', layout);

  view.webContents.loadFile('index.html').catch((error) => {
    console.error('页面加载失败：', error);
  });

  win.on('closed', () => {
    if (!view.webContents.isDestroyed()) {
      view.webContents.close();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BaseWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

执行顺序：

1. 等待应用初始化。

2. 创建不自带网页的窗口。

3. 创建网页视图。

4. 把视图添加到窗口。

5. 设置视图尺寸并加载页面。

6. 窗口缩放时更新布局。

7. 窗口关闭后清理网页内容。

`BrowserWindow` 也可以通过 `contentView` 添加额外视图，并非只有 `BaseWindow` 才能容纳 `WebContentsView`。

### BrowserView：旧的网页视图方案

旧代码中可能看到：

```Bash
const view = new BrowserView();

win.setBrowserView(view);
```

`BrowserView` 是旧方案，**从 Electron 29 开始被弃用，推荐迁移到 ****`WebContentsView`**。

|旧方案|新方案|
|---|---|
|`BrowserView`|`WebContentsView`|
|`win.setBrowserView()` / `addBrowserView()`|`win.contentView.addChildView()`|
|`win.removeBrowserView()`|`win.contentView.removeChildView()`|

迁移不只是修改类名，还需要检查布局、层级和资源清理。

### `<webview>`：网页里面嵌入网页

`<webview>` 是 Electron 提供的特殊页面标签。

主进程需要允许webviewTag开启：

```YAML
const win = new BrowserWindow({
  webPreferences: {
    webviewTag: true,
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
  },
});
```

页面中可以写

```Bash
<webview
  src="https://example.com"
  style="width: 100%; height: 500px;"
></webview>
```

关系

```Bash
BrowserWindow
└── 外层网页
    └── <webview>
        └── 独立的内嵌网页内容
```

区别：

`WebContentsView`：主进程创建和布局的原生视图。

`<webview>`：写在网页中的特殊标签，布局通过页面管理。

`<webview>` 不是普通 `div`，内嵌内容有独立的 `webContents`。

## preload 与上下文隔离

**preload 是 Electron 在加载页面时执行的预加载脚本，用来给页面提供受控的能力。**

它不是主进程代码，而是运行在渲染进程中的特殊脚本。

三种代码的职责：

|代码|执行位置|主要职责|
|---|---|---|
|主进程代码|主进程|创建窗口、管理应用、执行系统操作|
|preload|渲染进程的预加载环境|为页面提供指定接口|
|页面脚本|渲染进程的页面环境|显示界面、处理用户交互|

可以先理解为：主进程管理应用，页面负责界面，preload 负责提供连接两者的接口。

注意：原生 ESM preload 是异步加载的，在没有内容的页面等场景中存在时序差异，不能认为它一定会同步执行完毕后页面才开始运行。

### 配置 preload

在主进程创建窗口时配置

```JavaScript
import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';

const preloadPath = fileURLToPath(
  new URL('./preload.mjs', import.meta.url),
);

const win = new BrowserWindow({
  webPreferences: {
  //表示告诉 Electron：这个窗口使用哪个预加载脚本。这里需要提供**绝对文件路径**。
    preload: preloadPath,
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false,
  },
});
```

为什么使用 `.mjs`？

因为这里使用的是**原生 ESM preload：**`import { contextBridge } from 'electron';`

Electron 对 preload 有专门规则：

- 原生 ESM 支持需要 Electron 28 及以上版本。

- ESM preload 必须使用 `.mjs`。

- preload 不会因为 `package.json` 设置 `"type": "module"`，就把 `.js` 当成 ESM。

- 原生 ESM preload 需要关闭渲染进程沙箱。

### 三个配置的作用

```YAML
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: false,
}
```

|配置|含义|
|---|---|
|`nodeIntegration: false`|不向普通页面开放 Node\.js 集成|
|`contextIsolation: true`|隔离 preload 与页面的 JavaScript 环境|
|`sandbox: false`|不对该渲染进程启用沙箱，允许原生 ESM preload 运行|

#### Node\.js 集成

表示普通页面不能直接使用 Node\.js 的 `require('node:fs')` 等能力。

它限制的是页面，不等于 preload 也完全没有 Node\.js 能力。

#### 上下文隔离

表示 preload 和页面各自使用独立的 JavaScript 全局环境，避免页面直接修改 preload 所在环境里的对象。

#### 沙箱

表示利用操作系统的安全机制，限制渲染进程直接操作系统资源。沙箱中的 preload 也只有有限的 Node\.js 风格 API，没有完整 Node\.js 环境。

可以这样区分：

> 上下文隔离管“页面和 preload 如何隔开”；沙箱管“渲染进程能直接使用哪些系统能力”。
> 
> 

### contextBridge：把指定接口交给页面

开启上下文隔离时，通过 `contextBridge` 暴露接口：

```Bash
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('appInfo', {
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,
});
```

```Bash
console.log(window.appInfo.electronVersion);
console.log(window.appInfo.nodeVersion);
```

**exposeInMainWorld 的含义：**`contextBridge.exposeInMainWorld(名字, 接口对象);`

表示：将指定接口，以这个名字提供给页面的主世界。

```Bash
//第一个参数可以自定义
contextBridge.exposeInMainWorld('myApp', {
  message: '你好',
});
//页面就使用
console.log(window.myApp.message);
```

### 运行环境版本与应用版本

|获取方式|表示什么|
|---|---|
|`process.versions.electron`|Electron 的版本|
|`process.versions.node`|Node\.js 的版本|
|`process.versions.chrome`|Chromium 的版本|
|`app.getVersion()`|应用自身的版本|

应用自身的版本通常来自应用 `package.json`

```Bash
{
  "version": "1.2.0"
}
```

`app.getVersion()` 属于主进程 API。preload 若要通过这个 API 查询版本，需要使用 IPC 请求主进程执行。

### 通过 preload 和 IPC 调用主进程

以“查询应用版本”为例

```Bash
页面调用 window.appAPI.getVersion()
                ↓
preload 使用 ipcRenderer.invoke()
                ↓
主进程的 ipcMain.handle() 处理请求
                ↓
将版本号返回页面
```

#### 主进程：注册处理器

```Bash
import { app, ipcMain } from 'electron';

ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});
```

`'app:get-version'` 是通道名，可以自定义，但两端必须一致。

#### preload：提供固定接口

```JavaScript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
  getVersion: () => {
  //渲染进程向主进程发一个请求，并等待主进程返回结果
    return ipcRenderer.invoke('app:get-version');
  },
});
```

#### 页面：调用接口

```JavaScript
try {
  const version = await window.appAPI.getVersion();
  console.log('应用版本：', version);
} catch (error) {
  console.error('查询版本失败：', error);
}
```

`ipcRenderer.invoke()` 返回 Promise，因此页面可以使用 `await` 等待结果。

**页面不需要直接接触 ****`ipcRenderer`****，只需要知道有哪些接口可以调用。**

### 不要暴露万能 invoke

不推荐

```Bash
contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  },
});
```

因为页面可以自行选择通道

```Bash
window.api.invoke('app:get-version');
window.api.invoke('file:delete', '/某个路径');
```

它不能凭空创造主进程能力，但可以尝试调用所有已注册且未限制来源的对应处理器，接口范围过大。

更合适的方式是按功能暴露

主进程仍应检查请求来源；接收参数的接口还要验证参数、路径和操作权限

### 完整基础示例

```Bash
项目目录/
├── package.json
├── main.js
├── preload.mjs
├── renderer.js
└── index.html
```

#### package\.json 关键配置

```JSON
{
  "type": "module",
  "main": "main.js",
  "version": "1.0.0",
  "scripts": {
    "start": "electron ."
  }
}
```

#### main\.js

```JavaScript
import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';

let mainWindow = null;

const preloadPath = fileURLToPath(
  new URL('./preload.mjs', import.meta.url),
);

const htmlPath = fileURLToPath(
  new URL('./index.html', import.meta.url),
);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow = win;

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  win.loadFile(htmlPath).catch((error) => {
    console.error('页面加载失败：', error);
  });
}

app.whenReady().then(() => {
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### preload\.mjs

```JavaScript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
  getVersion: () => {
    return ipcRenderer.invoke('app:get-version');
  },
});
```

#### renderer\.js

```JavaScript
const button = document.querySelector('#version-button');
const result = document.querySelector('#result');

button.addEventListener('click', async () => {
  try {
    const version = await window.appAPI.getVersion();
    result.textContent = `应用版本：${version}`;
  } catch (error) {
    result.textContent = '获取版本失败';
    console.error(error);
  }
});
```

#### index\.html

```HTML
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>preload 示例</title>
  </head>
  <body>
    <button id="version-button">查询版本</button>
    <p id="result"></p>

    <script type="module" src="./renderer.js"></script>
  </body>
</html>
```

运行：`npm start`

点击按钮后，页面通过 preload 请求主进程，显示应用版本。

## 进程间通信（IPC、MessagePort）

**IPC（Inter\-Process Communication）就是进程间通信，让不同进程交换消息和数据。**

Electron 中：

- **主进程**：管理应用、窗口，执行系统操作。

- **渲染进程**：展示页面、响应用户交互。

- **preload**：运行在渲染进程中，向页面提供受控接口，不是独立进程。

不同进程不能直接访问对方的 JavaScript 变量，需要通过通信传递信息。

```Bash
页面 → preload → IPC → 主进程
页面 ← preload ← IPC ← 主进程
```

`contextBridge` 与 IPC 的区别：

- **contextBridge**：把 preload 中的指定接口提供给页面。

- **IPC**：让渲染进程与主进程通信。

### 常见通信方式

|需求|发送端|接收端|
|---|---|---|
|渲染进程请求主进程，并等待结果|`ipcRenderer.invoke()`|`ipcMain.handle()`|
|渲染进程通知主进程，不自动等待返回值|`ipcRenderer.send()`|`ipcMain.on()`|
|主进程向页面推送消息|`webContents.send()`|`ipcRenderer.on()`|
|建立专用消息通道，持续双向通信|`MessagePort.postMessage()`|对应端口的消息监听|

### 请求与响应：invoke / handle

适合“请求一个结果”的操作，例如查询版本、读取配置。

#### 主进程注册处理器

```Bash
import { app, ipcMain } from 'electron';

//收到 'app:get-version' 请求后，执行函数，并返回结果。
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});
```

#### preload 暴露接口

```JavaScript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
  getVersion: () => {
    return ipcRenderer.invoke('app:get-version');
  },
});
```

#### 页面调用

```JavaScript
try {
  const version = await window.appAPI.getVersion();
  console.log('应用版本：', version);
} catch (error) {
  console.error('查询失败：', error.message);
}
```

执行过程：

1. 页面调用 `getVersion()`。

2. preload 发出 IPC 请求。

3. 主进程执行对应的处理器。

4. 返回值通过 IPC 传回。

5. 页面中的 Promise 成功，得到版本号。

#### 关键点

- `invoke()` 返回 Promise。

- 通道名可以自定义，但两端必须一致。

- `handle()` 可以返回普通值，也可以返回 Promise。

- 处理器抛错或返回的 Promise 拒绝，请求方可以用 `catch` 接住。

- 没有返回值时，请求方得到 `undefined`。

- 同一个通道不能重复注册多个 `handle()`。

### 传递参数

**主进程**

```JavaScript
ipcMain.handle('math:add', (event, a, b) => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('参数必须是有限数字');
  }

  return a + b;
});
```

**preload**

```Bash
contextBridge.exposeInMainWorld('calculator', {
  add: (a, b) => {
    return ipcRenderer.invoke('math:add', a, b);
  },
});
```

**页面**

```Bash
const result = await window.calculator.add(2, 3);

console.log(result); // 5


//参数对应
ipcRenderer.invoke('math:add', 2, 3);

ipcMain.handle('math:add', (event, a, b) => {
  // a = 2，b = 3
});
```

`event` 是 Electron 自动提供的事件对象，包含请求来源等信息，不需要页面自己传。

### 单向通知：send / on

适合“告诉主进程发生了一件事”，不需要直接取得处理结果。

**主进程**

```JavaScript
import { ipcMain } from 'electron';

ipcMain.on('page:ready', (event, data) => {
  console.log('页面已准备好：', data);
});
```

**preload**

```Bash
contextBridge.exposeInMainWorld('appAPI', {
  notifyReady: () => {
    ipcRenderer.send('page:ready', {
      time: Date.now(),
    });
  },
});
```

**页面**

```Bash
window.appAPI.notifyReady();
```

**注意：**

```Bash
ipcMain.on('page:ready', () => {
  return '收到';
});
```

这里的 `return` **不会自动传回发送方**。

需要直接等待返回结果时，用 `invoke()` / `handle()` 更合适。

### 主进程推送消息

适合进度更新、状态变化等主动通知。

**主进程发送**

假设 `win` 是目标窗口：

```Bash
//这里发送的进度是 30。
win.webContents.send('task:progress', 30);
```

**preload 提供订阅接口**

```JavaScript
contextBridge.exposeInMainWorld('tasks', {
  onProgress: (callback) => {
    const listener = (_event, progress) => {
      callback(progress);
    };

    ipcRenderer.on('task:progress', listener);

    return () => {
      ipcRenderer.removeListener('task:progress', listener);
    };
  },
});
```

**页面开始监听**

```Bash
const stopListening = window.tasks.onProgress((progress) => {
  console.log('当前进度：', progress);
});
```

这行代码已经调用了 `onProgress()`：

1. 立即注册监听。

2. 将返回的“取消监听函数”保存到 `stopListening`。

3. 后续收到消息时，执行页面传入的回调。

不再需要时：`stopListening();`

**取消监听不等于取消任务，只是不再接收这些进度消息。**

**为什么包一层 listener？**

```Bash
const listener = (_event, progress) => {
  callback(progress);
};
```

只把业务数据交给页面，不暴露 Electron 的事件对象。

`_event` 的下划线只是命名习惯，表示这个参数没有使用。

**为什么保存 listener？**

移除监听需要提供**注册时的同一个函数对象**：

```Bash
ipcRenderer.removeListener('task:progress', listener);
```

重新写一个内容相同的箭头函数，是另一个函数对象，不能移除原监听。

### 在 React 中清理监听

```JavaScript
useEffect(() => {
  const stopListening = window.tasks.onProgress((progress) => {
    setProgress(progress);
  });

  return () => {
    stopListening();
  };
}, []);
```

对应关系：

- 组件挂载：订阅。

- 收到消息：更新状态。

- 组件卸载：取消订阅。

不清理可能导致重复回调、无效更新和资源不能及时释放。

推送通常不会为尚未注册的监听器保留历史消息，因此应先订阅，再启动需要观察的任务。

### MessagePort 

MessagePort 是消息通道的一端，可以持续发送和接收消息。

它不是 `8080` 那种网络端口，而是一个通信对象。

创建一对端口：

```Bash
import { MessageChannelMain } from 'electron';

const { port1, port2 } = new MessageChannelMain();
```

两端已经互相连接：`port1 ←──── 双向通信 ────→ port2`

可以把它们理解成一对对讲机：

- 一端发送，另一端接收。

- 两边都能发送。

- 可以把其中一端转交给其他执行环境。

适合独立会话、持续双向消息等场景，但不是用了它就一定更快。

### 建立主进程与 preload 的端口连接

下面先由 preload 发请求，主进程再创建端口并转交一端，避免在接收方尚未准备好时发送。

#### 主进程创建并转交端口

```JavaScript
import { ipcMain, MessageChannelMain } from 'electron';

ipcMain.on('channel:connect', (event) => {
  const frame = event.senderFrame;

  if (!frame) {
    return;
  }

  const { port1, port2 } = new MessageChannelMain();

  port1.on('message', (messageEvent) => {
    console.log('主进程收到：', messageEvent.data);

    port1.postMessage({
      type: 'reply',
      text: '消息已收到',
    });
  });

  port1.on('close', () => {
    console.log('消息连接已关闭');
  });

  port1.start();

  frame.postMessage(
    'channel:connected' // 通道名
    null                // 普通消息数据，这里没有
    [port2]             // 转交的端口列表
  );
});
```

`event.senderFrame` 指向发起请求的页面框架，因此回复会发送回对应的请求方。

这是通信机制示例；实际应用还应验证请求来源，并管理重复连接和端口清理。

#### preload 接收并使用端口

```JavaScript
import { ipcRenderer } from 'electron';

ipcRenderer.once('channel:connected', (event) => {
  const [port] = event.ports;

  if (!port) {
    return;
  }

  port.onmessage = (messageEvent) => {
    console.log('preload 收到：', messageEvent.data);

    // 示例只交流一次，收到回复后结束通信
    port.close();
  };

  port.postMessage({
    type: 'hello',
    text: '主进程你好',
  });
});

// 先注册接收监听，再请求建立连接
ipcRenderer.send('channel:connect');
```

执行过程：

1. preload 注册端口接收监听。

2. preload 请求建立连接。

3. 主进程创建 `port1`、`port2`。

4. 主进程保留 `port1`，把 `port2` 转交给 preload。

5. preload 通过收到的端口发送消息。

6. 主进程接收并回复。

7. preload 收到回复后关闭端口。

端口被转交后，发送方不再使用转交出去的那个端口，继续使用自己保留的一端。

#### event\.ports 是什么？

```Bash
const [port] = event.ports;
```

`event.ports` 是**这次消息一起转交过来的端口列表**。

这段数组解构相当于：`const port = event.ports[0];`

- `event.ports`：事件提供的属性。

- `port`：自己定义的变量名。

- 没有转交端口时，第一个元素是 `undefined`。

注意不同接收方式的数据位置：

```Bash
// 普通 Electron IPC
ipcRenderer.on('some-channel', (event, data) => {
  // 普通数据在 data
  // 转交的端口在 event.ports
});

// MessagePort 消息
port.onmessage = (event) => {
  // 普通数据在 event.data
};
```

#### onmessage、start、close 分别做什么？

**postMessage\(\)：发送消息**

```Bash
port.postMessage({ text: '你好' });
```

数据会发送到相连的另一端。

**onmessage：设置收到消息后的处理函数**

```Bash
port.onmessage = (event) => {
  console.log(event.data);
};
```

`onmessage` 是属性，不是需要主动调用的方法。端口收到消息后，系统会调用这个函数。

在 Web `MessagePort` 上，设置 `onmessage` 会自动开始派发消息。

**start\(\)：开始派发收到的消息**

Electron 主进程的 `MessagePortMain`：

```Bash
port1.on('message', (event) => {
  console.log(event.data);
});

port1.start();
```

Web `MessagePort` 使用事件监听器时：

```Bash
port.addEventListener('message', (event) => {
  console.log(event.data);
});

port.start();
```

`start()` 不是启动进程，也不是发送消息，而是：

> 开始把接收到的消息交给监听函数处理。
> 
> 

在尚未启动时，收到的消息可以先排队。

**close\(\)：结束通信**

```Bash
port.close();
```

关闭的是当前 `port` 指向的这一端，同时断开这对端口的通信连接。

如果 preload 关闭它持有的端口，主进程的 `MessagePortMain` 会收到 `close` 事件：

```Bash
port1.on('close', () => {
  console.log('连接已断开');
});
```

区别：

- `port.close()`：主动关闭。

- `port1.on('close', ...)`：监听关闭通知。

**就像 preload 挂断电话，主进程得知电话断了。** 不需要主进程再调用一次 `close()`，连接才算断开。

#### handle 不要随着窗口反复注册

`ipcMain` 属于主进程，不属于某个窗口。

同一个通道不能重复注册多个 `handle()` 处理器。通常在应用初始化时注册一次，而不是每次创建窗口都注册。

需要移除时：

```Bash
ipcMain.removeHandler('app:get-version');
```

## 本地存储与配置管理

本地存储，就是把数据保存到用户电脑上，让应用关闭后数据仍然存在。

配置管理，就是管理应用的设置：读取、校验、修改、保存和升级兼容。

例如：

```Bash
{
  theme: 'dark',
  volume: 80,
  downloadPath: '/某个下载目录'
}
```

内存变量与本地存储的区别

|位置|特点|
|---|---|
|JavaScript 变量|通常随进程结束而消失|
|本地文件、数据库等|应用退出后仍可保留，下次启动可以读取|

注意：本地持久化不等于永久不丢失，用户删除、磁盘故障等仍可能导致数据丢失。

**常见存储方式**

|方式|适用场景|注意事项|
|---|---|---|
|JSON 文件|应用配置、少量结构化数据|需要自行处理校验、写入失败和并发|
|`localStorage`|页面侧少量简单设置|同步 API，只保存字符串，受页面来源影响|
|IndexedDB|页面侧较多结构化数据|异步 API，可使用事务|
|SQLite 等数据库|大量记录、查询、关联数据|需要额外的数据库接入|
|`electron-store` 等库|简化应用配置读写|是第三方库，不是 Electron 内置 API|

不建议把密码、令牌等敏感信息直接写入普通 JSON 或 `localStorage`；应结合系统凭据存储等专门方案。

### 配置文件放置位置

Electron 通常使用应用的 `userData` 目录

```JavaScript
import { app } from 'electron';
import path from 'node:path';

await app.whenReady();

const settingsPath = path.join(
  app.getPath('userData'),
  'settings.json',
);
```

其中：

- `app.getPath('userData')`：取得当前应用的用户数据目录。

- `path.join()`：拼接文件路径。

- `settings.json`：自己定义的配置文件名。

选择这里的原因：

- 不依赖启动程序时的工作目录。

- 与应用安装目录分开。

- 适合保存当前用户的应用数据。

**不要默认把可写配置放在源码目录或安装目录中。** 打包后可能位于只读资源包中，或者没有写入权限。

### 配置的基本流程

```Bash
应用启动
    ↓
读取配置文件
    ↓
解析 JSON
    ↓
校验并补齐配置
    ↓
提供给应用使用

用户修改设置
    ↓
校验新值
    ↓
保存文件
    ↓
保存成功后返回结果
```

需要区分：

- **解析**：文件是不是合法 JSON。

- **校验**：里面的数据是否符合应用要求。

```Bash
//例如
{
  "volume": "很大"
}
//这是合法 JSON，但不是合法的音量配置。
```

### 默认配置与 normalizeSettings

#### 默认配置

```Bash
const defaultSettings = {
  theme: 'light',
  volume: 50,
};
```

用于首次运行，或补齐旧配置缺少的字段。

#### 规范化配置

```JavaScript
function normalizeSettings(value) {
  const settings =
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
      ? value
      : {};

  return {
    theme: settings.theme === 'dark' ? 'dark' : 'light',

    volume: Number.isFinite(settings.volume)
      ? Math.max(0, Math.min(100, settings.volume))
      : defaultSettings.volume,
  };
}
```

它会：

- 检查输入是否是普通配置对象形态。

- 将主题限制为 `light` 或 `dark`。

- 将有效数值音量限制在 `0～100`。

- 缺少有效音量时使用默认值。

- 只返回应用认识的字段。

**`normalizeSettings`**** 是自己定义的函数，不是 Electron 内置 API。**

### 读取配置文件

```JavaScript
import { readFile } from 'node:fs/promises';

async function loadSettings(settingsPath) {
  try {
    const text = await readFile(settingsPath, 'utf8');
    const settings = JSON.parse(text);

    return normalizeSettings(settings);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { ...defaultSettings };
    }

    throw error;
  }
}
```

执行过程：

1. 读取文件，得到字符串。

2. 使用 `JSON.parse()` 转成 JavaScript 值。

3. 规范化配置。

4. 返回可使用的配置对象。

**为什么只处理 ENOENT？**

`ENOENT` 表示文件或路径不存在。首次运行时没有配置文件，可以返回默认值。

但其他错误不能都当成“首次运行”：

|情况|处理思路|
|---|---|
|配置文件不存在|使用默认值|
|JSON 格式损坏|报告错误，按策略保留损坏文件并恢复|
|没有读取权限|提示或记录错误|
|配置字段缺失|补默认值|
|字段类型或范围错误|纠正或拒绝，取决于规则|

**不能因为读取失败，就悄悄覆盖掉原配置。**

另外，这个读取函数返回默认值时，并不会自动创建配置文件。

### 保存配置文件

基础写法：

```JavaScript
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function saveSettings(settingsPath, settings) {
  const normalized = normalizeSettings(settings);

  await mkdir(path.dirname(settingsPath), {
    recursive: true,
  });

  const text = JSON.stringify(
      settings, // 要转换的数据
      null,     // 不做额外筛选或转换
      2,        // 缩进两个空格
  );

  await writeFile(settingsPath, text, 'utf8');

  return normalized;
}
```

执行过程：

1. 规范化配置。

2. 确保父目录存在。

3. 把对象转换为 JSON 字符串。

4. 写入文件。

5. 成功后返回实际保存的配置。

这里是**完整配置保存**。如果只传：`{ theme: 'dark' }`

没有提供的音量会恢复默认值，而不是保留旧值。部分更新需要先读取现有配置，再合并允许修改的字段。

### 页面读写配置

推荐由主进程统一管理配置，页面通过 preload 和 IPC 调用。

```Bash
页面 → preload → IPC → 主进程 → 配置文件
```

**主进程**

假设已经准备好 `settingsPath` 和上述读写函数：

```Bash
ipcMain.handle('settings:get', () => {
  return loadSettings(settingsPath);
});

ipcMain.handle('settings:save', async (_event, settings) => {
  return saveSettings(settingsPath, settings);
});
```

**preload**

```JavaScript
contextBridge.exposeInMainWorld('settingsAPI', {
  get: () => ipcRenderer.invoke('settings:get'),

  save: (settings) => {
    return ipcRenderer.invoke('settings:save', settings);
  },
});
```

**页面**

```JavaScript
try {
  const settings = await window.settingsAPI.get();

  const saved = await window.settingsAPI.save({
    ...settings,
    theme: 'dark',
  });

  console.log('保存成功：', saved);
} catch (error) {
  console.error('配置操作失败：', error.message);
}
```

注意：

- 配置路径由主进程决定，不让页面任意指定写入位置。

- 主进程必须检查请求来源和配置内容。

- 写入成功之后，才向页面报告保存成功。

- 上述代码展示基础流程，未解决并发更新问题。

### 并发写入：多个操作互相覆盖

并发写入就是多个保存操作在时间上重叠，都在修改同一个文件。

原配置：

```Bash
{
  theme: 'light',
  volume: 50,
}
```

两个操作都读到旧值：

```Bash
A：改主题 → 保存 { theme: 'dark',  volume: 50 }
B：改音量 → 保存 { theme: 'light', volume: 80 }
```

如果 B 最后写入，A 的主题修改就丢失了。

真正重叠的文件写入还可能产生不确定结果，不能保证只是最后一次完整覆盖。

**Node\.js 单线程为什么仍有这个问题？**

因为文件操作是异步的：

```Bash
const first = writeFile(filePath, contentA);
const second = writeFile(filePath, contentB);

await Promise.all([first, second]);
```

第二次操作开始时，第一次不一定完成。

#### 处理思路

- 由主进程集中管理配置。

- 给更新操作排队。

- 页面提交需要修改的字段，而不是反复提交过期的整份配置。

- 将“读取最新值 → 合并修改 → 保存”作为一个整体协调。

**主进程集中管理，不代表自动消除了并发。** 多个异步 IPC 处理仍然可能交错。

**写到一半失败怎么办？**

直接写：`await writeFile(settingsPath, text, 'utf8');`

默认会覆盖目标文件。如果过程中发生异常，可能留下不完整内容。

一种常见改进是：

```Bash
先写临时文件
      ↓
写入完成
      ↓
用临时文件替换正式文件
```

这称为“原子替换”思路：尽量让正式文件呈现完整旧版本或完整新版本，而不是半份内容。

但需要注意：

- 临时文件通常应与目标文件位于同一文件系统。

- 替换行为受平台和文件系统影响。

- 不自动解决并发覆盖。

- 不等于保证断电后数据绝不丢失，严格持久化还涉及落盘同步等问题。

**并发协调解决“谁先保存”，原子替换解决“不要暴露半份文件”，是两个不同的问题。**

### 配置版本与迁移

应用升级后，配置结构可能变化。

```Bash
//例如旧版本：
{
  "version": 1,
  "darkMode": true
}
//新版本：
{
  "version": 2,
  "theme": "dark"
}
```

需要根据旧版本转换：

```Bash
function migrateSettings(settings) {
  if (settings.version === 1) {
    return {
      version: 2,
      theme: settings.darkMode ? 'dark' : 'light',
    };
  }

  return settings;
}
```

这里的版本号是**配置结构版本**，不一定等于应用版本。

常见读取流程：`读取文件 → 解析 JSON → 检查配置版本 → 迁移 → 校验 → 使用`

迁移时要考虑：

- 保留仍然有效的旧设置。

- 对未知的新版本配置，避免盲目降级覆盖。

- 迁移失败时保留原文件。

- 是否需要备份和回滚。

## Socket、命名管道与 SSE

|方式|大白话|常见用途|
|---|---|---|
|TCP Socket|两个程序建立连接，双方持续说话|网络服务、设备通信|
|命名管道 / Unix 域 Socket|同一台电脑上的进程走“内部专线”|桌面应用与后台辅助进程通信|
|SSE|客户端订阅，服务端通过 HTTP 持续发通知|任务进度、实时日志、消息推送|

注意：

- Socket 是一类通信接口，本节重点学习 **TCP Socket**。

- Node\.js 在 Windows 上通常通过命名管道实现这类本机通信，在 macOS、Linux 上使用 Unix 域 Socket。

- SSE 是建立在 HTTP 上的事件推送机制，不是另一种与 TCP 同层的传输协议。

- TCP Socket 不等于 WebSocket，普通浏览器页面不能直接使用 Node\.js 的 `net` 模块。

### TCP Socket：建立双向连接

可以把 TCP 连接理解为两个程序之间的一通电话：

```Bash
客户端                         服务端
   │────── 请求建立连接 ──────→│
   │←────── 连接建立成功 ─────→│
   │────── 发送数据 ──────────→│
   │←────── 返回数据 ──────────│
```

双方建立连接后，都可以发送和接收数据。

通常通过下面的信息找到服务器：`IP 地址 + 端口号`

例如：`127.0.0.1:4000`

- `127.0.0.1`：本机回环地址。

- `4000`：服务监听的端口。

#### 创建 TCP 服务端

```JavaScript
import net from 'node:net';

const server = net.createServer((socket) => {
  console.log('有客户端连接');

  socket.setEncoding('utf8');

  socket.on('data', (text) => {
    console.log('收到客户端数据：', text);
  });

  socket.on('end', () => {
    console.log('客户端结束了发送');
  });

  socket.on('close', () => {
    console.log('连接已关闭');
  });

  socket.on('error', (error) => {
    console.error('连接错误：', error.message);
  });

  socket.write('你好，客户端\n');
});

server.on('error', (error) => {
  console.error('服务端错误：', error.message);
});

server.listen(4000, '127.0.0.1', () => {
  console.log('服务已监听 127.0.0.1:4000');
});
```

**两个对象的职责**

|对象|作用|
|---|---|
|`server`|监听连接，接待客户端|
|`socket`|代表与某个客户端建立的一条连接|

每个客户端连接进来，服务端回调都会得到对应的 `socket`。

**多个客户端连接，不是共用同一个 socket。**

#### 创建 TCP 客户端

```JavaScript
import net from 'node:net';

const client = net.createConnection({
  host: '127.0.0.1',
  port: 4000,
});

client.setEncoding('utf8');

client.on('connect', () => {
  console.log('连接成功');
  client.write('你好，服务端\n');
});

client.on('data', (text) => {
  console.log('收到服务端数据：', text);
});

client.on('close', () => {
  console.log('连接已关闭');
});

client.on('error', (error) => {
  console.error('连接失败或通信错误：', error.message);
});
```

**connect 是谁触发的？**

```Bash
client.on('connect', () => {
  // ...
});
```

这段代码只是**注册监听**。

`net.createConnection()` 发起连接，底层连接成功后，**Node\.js 自动触发 ****`connect`**** 事件**，然后调用你注册的函数。

手动触发事件也不能代替真正建立网络连接。

执行顺序：

```Plain Text
createConnection() 发起连接-->底层连接成功-->Node.js 触发 connect-->执行监听函数
```

#### 发送、接收与关闭连接

**发送数据**

`socket.write('hello');`

可以发送字符串或 Buffer。

`write()` 是把数据交给发送缓冲区，不代表对方应用已经收到并处理完成。

**接收数据:**

```Bash
socket.on('data', (chunk) => {
  // 处理收到的数据
});
```

**正常结束发送**

`socket.end('最后一条消息\n');`

表示先发送剩余数据，再结束当前这一端的发送方向。

TCP 有两个传输方向；`end` 表示对方结束发送，不等于任何情况下整条连接都已立即完全关闭。完整关闭看 `close`。

**立即销毁连接**

`socket.destroy();`

用于错误处理等需要直接终止连接的场景，未发送完的数据可能丢失。

**停止服务监听**

`server.close();`

停止接受新连接，但不会自动把所有现有连接立即断开。

#### TCP 不会自动划分消息

这是 TCP 通信最重要的注意事项之一。

```Bash
//发送端：
socket.write('hello');
socket.write('world');

//接收端可能收到：
一次收到：helloworld

//也可能收到：
第一次：hel
第二次：lowo
第三次：rld
```

TCP 保证同一连接中传输字节的顺序，但不保留每次 `write()` 的消息边界。

因此：

```Bash
socket.on('data', (chunk) => {
  // 一个 chunk 不一定是一条完整消息
});
```

#### 常见的消息划分方案

- 每条消息以换行符结束。

- 消息前面附带长度。

- 使用固定长度消息。

#### 换行分隔 JSON 的简单示例

```Bash
//发送端：
socket.write(
  JSON.stringify({
    type: 'progress',
    percent: 50,
  }) + '\n',
);
```

```JavaScript
//接收端：
socket.setEncoding('utf8');

let buffer = '';

socket.on('data', (text) => {
  buffer += text;

  let index = buffer.indexOf('\n');

  while (index !== -1) {
    const line = buffer.slice(0, index);
    buffer = buffer.slice(index + 1);

    if (line.length > 0) {
      try {
        const message = JSON.parse(line);
        console.log('完整消息：', message);
      } catch (error) {
        console.error('消息格式错误：', error.message);
      }
    }

    index = buffer.indexOf('\n');
  }
});
```

这里的 `buffer` 是自己命名的字符串变量，不是 Node\.js 的 `Buffer` 对象。

处理思路：

1. 收到的数据先追加保存。

2. 找到换行符，说明有一条完整消息。

3. 取出消息并解析。

4. 未收完整的部分留到下一次继续处理。

正式使用还要限制消息大小，避免对方一直不发送换行符，导致内存不断增长。

### 命名管道与 Unix 域 Socket

它们常用于同一台电脑上的进程通信。

```Bash
同一台电脑
├── 桌面应用进程
│       ↕ 本机通信通道
└── 后台辅助进程
```

在 Node\.js 中仍然可以使用 `net`，主要区别是连接地址不再是 IP 和 TCP 端口，而是一个路径或管道名。

#### 不同系统的地址

```Bash
const address =
  process.platform === 'win32'
    ? '\\\\.\\pipe\\my-app-demo'
    : '/tmp/my-app-demo.sock';
```

- Windows：命名管道名。

- macOS、Linux：Unix 域 Socket 路径。

其中反斜杠在 JavaScript 字符串中需要转义，所以源码里会出现多个 `\`。

#### 服务端

```JavaScript
import net from 'node:net';

const address =
  process.platform === 'win32'
    ? '\\\\.\\pipe\\my-app-demo'
    : '/tmp/my-app-demo.sock';

const server = net.createServer((socket) => {
  socket.on('error', (error) => {
    console.error('连接错误：', error.message);
  });

  socket.end('本机服务已连接\n');
});

server.on('error', (error) => {
  console.error('服务错误：', error.message);
});

server.listen(address, () => {
  console.log('本机服务已启动');
});
```

#### 客户端

```JavaScript
import net from 'node:net';

const address =
  process.platform === 'win32'
    ? '\\\\.\\pipe\\my-app-demo'
    : '/tmp/my-app-demo.sock';

const client = net.createConnection(address);

client.setEncoding('utf8');

client.on('data', (text) => {
  console.log(text);
});

client.on('error', (error) => {
  console.error('连接失败：', error.message);
});
```

#### 注意事项

- 双方使用同一个地址。

- Unix Socket 的父目录需要存在。

- 进程异常退出后，Unix Socket 文件可能残留，影响下次启动。

- 清理前必须确认路径归属和是否仍有服务使用，不能随意删除。

- 本机通信也需要权限控制，不能认为“同一台电脑上的请求就一定可信”。

- 这里使用的流式通信同样需要考虑消息边界。

### SSE：服务端持续推送事件

SSE（Server\-Sent Events）让服务端通过一个持续的 HTTP 响应，向客户端发送事件。

```Bash
客户端：“我要订阅进度”
           ↓ HTTP 请求
服务端保持响应不结束
           ↓
       进度 10%
           ↓
       进度 50%
           ↓
       任务完成
```

适合：

- 下载、构建等任务进度。

- 实时日志。

- 服务通知。

- 持续生成的文本。

SSE 这条连接主要用于**服务端向客户端推送**。客户端要提交或取消任务，通常另外发 HTTP 请求。

#### SSE 服务端示例

```JavaScript
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url !== '/events') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });

  res.flushHeaders();

  let percent = 0;

  const timer = setInterval(() => {
    percent += 10;

    res.write('event: progress\n');
    res.write(`data: ${JSON.stringify({ percent })}\n\n`);

    if (percent >= 100) {
      clearInterval(timer);

      res.write('event: done\n');
      res.write('data: {}\n\n');

      res.end();
    }
  }, 1000);

  res.on('close', () => {
    clearInterval(timer);
  });
});

server.on('error', (error) => {
  console.error('服务错误：', error.message);
});

server.listen(3000, '127.0.0.1', () => {
  console.log('SSE 服务已启动');
});
```

这里模拟每秒增加 10% 的进度。

**`/events`**** 是什么？**

它是接口路径，不是固定名称。

完整地址：

```Bash
http://127.0.0.1:3000/events
└────────── 服务地址 ─────┘└路径┘
```

可以改成 `/progress`，但客户端地址也要对应修改。

**`Content-Type`**** 的作用**

`'Content-Type': 'text/event-stream'`

告诉客户端：这是 SSE 事件流，不是普通 HTML 或 JSON 响应。

**`flushHeaders()`**** 的作用**

`res.flushHeaders();`

这是 Node\.js HTTP 响应对象自带的方法。

作用是：立即发送响应头，不等第一段响应体。

它不会结束连接，也不会发送业务事件。

**为什么清理定时器？**

```Bash
res.on('close', () => {
  clearInterval(timer);
});
```

客户端断开后，不应继续为这个已经关闭的响应生成进度消息。

#### SSE 消息格式

一条事件可以写成：

```Bash
event: progress
data: {"percent":50}
```

最后需要有一个空行，所以代码中是：

```Bash
res.write('event: progress\n');
res.write('data: {"percent":50}\n\n');
```

字段说明：

|字段|作用|
|---|---|
|`event`|事件名称|
|`data`|事件数据，按文本传输|
|`id`|事件标识，可辅助断线续传|
|`retry`|建议客户端重连等待时间，单位毫秒|

**progress 在哪里指定？**

就在服务端发送的：`event: progress`

`event:` 是协议字段，`progress` 是自己定义的事件名。

如果没有 `event:`，默认作为 `message` 事件派发。

JSON 不是 SSE 强制要求，只是常用的数据格式。发送 JSON 后，客户端需要自己解析。

#### SSE 客户端：EventSource

下面代码运行在浏览器或 Electron 页面环境中：

```JavaScript
const source = new EventSource(
  'http://127.0.0.1:3000/events',
);

source.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);

  console.log('进度：', data.percent);
});

source.addEventListener('done', () => {
  console.log('任务完成');

  source.close();
});

source.onerror = () => {
  console.log('连接异常，可能正在等待重连');
};
```

页面与服务地址不同源时，需要服务端正确配置 CORS，并满足页面的 CSP 等限制；上面的服务端示例没有开放跨域权限。

**事件名必须对应**

```Bash
服务端：event: progress
                ↓
客户端：addEventListener('progress', ...)
```

没有命名事件时，可以用：

```Bash
source.onmessage = (event) => {
  console.log(event.data);
};
```

**close\(\)：停止订阅**

```Bash
source.close();
```

会关闭当前 EventSource，并停止它的自动重连。

注意：这里只是停止接收，是否取消服务端真正执行的任务，需要另外设计。

#### SSE 的重连与心跳

**自动重连**

`EventSource` 通常会在连接意外断开后自动尝试重连。

因此：`res.end();`

结束服务端响应，**不等于客户端知道“业务任务完成，不要再连”**。

示例中通过发送 `done`，让客户端主动调用：`source.close();`来明确结束订阅。

**重连不等于自动恢复全部消息**

服务端可以发送：

```Bash
id: 42
event: progress
data: {"percent":50}

```

重连时，浏览器可通过 `Last-Event-ID` 告诉服务端上次接收的事件标识。

但服务端仍需要保存或重建事件，才能补发。**仅设置 ****`id`**** 不会自动实现历史消息恢复。**

**心跳**

长时间没有事件时，可以发送注释行：res\.write\(': heartbeat\\n\\n'\);

客户端不会把它当成普通业务事件。

心跳有助于减少空闲超时，但不能保证所有代理都保留连接。部署时还需要检查代理缓冲、连接超时等配置。

### 背压与资源清理

TCP Socket 和 HTTP 响应都可能出现“生产数据比接收方处理得快”的情况。

```Bash
const canContinue = socket.write(data);
//或者
const canContinue = res.write(data);
```

返回 `false` 表示应暂停继续提交数据，等待 `drain` 后再继续，不代表这次数据没被接收。

处理大量消息时，需要考虑背压和队列上限。

不同对象的结束方式：

|对象|方法|作用|
|---|---|---|
|TCP Socket|`end()`|发送剩余数据后结束发送方向|
|TCP Socket|`destroy()`|直接销毁连接|
|TCP / 本机服务|`server.close()`|停止接受新连接|
|HTTP 响应|`res.end()`|结束本次响应|
|EventSource|`source.close()`|关闭订阅并停止自动重连|

## HID 设备通信与数据解析

**HID（Human Interface Device，人机接口设备）是一类与人进行交互的设备规范。**

常见设备包括：

- 键盘、鼠标。

- 游戏手柄。

- 部分触控笔、控制面板。

- 使用自定义 HID 协议的硬件设备。

注意：

- HID 不只用于键盘和鼠标，也可以传输自定义数据。

- USB 设备不一定是 HID 设备。

- HID 可以通过 USB、蓝牙等方式连接，能否访问取决于系统和库的支持。

可以把 HID 通信理解为：程序与设备按照约定格式交换一包包字节，从中识别按键、状态或控制指令。

### Node\.js 访问 HID

Node\.js 没有内置通用 HID 访问模块，通常需要第三方库，例如：

```Bash
import HID from 'node-hid';
```

`node-hid` 底层依赖原生代码与系统接口，不是单纯的 JavaScript 库。

常见流程：枚举设备\-\-\>识别目标设备和接口\-\-\>打开设备\-\-\>接收报告 / 发送报告\-\-\>按协议解析数据\-\-\>结束时关闭设备

下面使用 `node-hid` 常见的同步打开 API 演示。安装版本不同，可用接口可能存在差异。

### 枚举设备：查看有哪些 HID 接口

```YAML
import HID from 'node-hid';

const devices = HID.devices();

for (const device of devices) {
  console.log({
    vendorId: device.vendorId,
    productId: device.productId,
    product: device.product,
    serialNumber: device.serialNumber,
    path: device.path,
    usagePage: device.usagePage,
    usage: device.usage,
  });
}
```

**常见字段**

|字段|含义|
|---|---|
|`vendorId` / VID|厂商标识|
|`productId` / PID|产品标识|
|`product`|产品名称，可能不存在|
|`serialNumber`|序列号，可能不存在|
|`path`|库用于打开该设备接口的系统路径|
|`usagePage`、`usage`|描述接口用途|
|`interface`|接口编号，是否提供取决于平台等因素|

- VID：哪家厂商。

- PID：这家厂商的哪种产品。

```Bash
//例如
const vendorId = 0x1234;
const productId = 0x5678;
```

**同型号的多个设备可能有相同 VID、PID，一台设备也可能枚举出多个 HID 接口。** 因此不能只凭 VID、PID 就保证找到了唯一正确接口。

### 识别并打开设备

下面的 VID、PID 只是示例，需要替换为真实设备的信息：

```JavaScript
import HID from 'node-hid';

const candidates = HID.devices().filter((device) => {
  return (
    device.vendorId === 0x1234 &&
    device.productId === 0x5678
  );
});

if (candidates.length !== 1 || !candidates[0].path) {
  throw new Error('未找到唯一目标接口，需要进一步筛选');
}

const device = new HID.HID(candidates[0].path);
```

实际可能需要进一步通过以下信息筛选：

- 序列号。

- Usage Page、Usage。

- 接口编号。

- 设备协议说明。

**path 的作用**

`new HID.HID(deviceInfo.path);`

表示打开枚举结果中指定的接口。

它不是普通业务文件路径，也不适合长期写死在配置里。设备重新插拔后，路径可能变化，应重新枚举。

**枚举成功不代表打开成功**

打开失败可能因为：

- 没有访问权限。

- 设备已经拔出。

- 接口被系统或其他程序占用。

- 选择了错误接口。

键盘、鼠标等系统输入设备尤其可能受到限制，不应为了实验随意抢占正在使用的输入设备。

### 接收设备数据

打开设备后，可以监听数据：

```JavaScript
device.on('data', (data) => {
  console.log('收到字节：', data);
  console.log('十六进制：', data.toString('hex'));
});

device.on('error', (error) => {
  console.error('设备通信失败：', error.message);
});
```

`data` 通常是 Buffer，里面是原始字节。

例如：`data.toString('utf8');`

在协议说明之前，这只是四个字节。不能直接猜测它们代表什么。

**不要随意按文字解码**

`data.toString('utf8');`

只有设备协议规定这些字节是 UTF\-8 文本时，才适合这样处理。

大部分设备报告是二进制结构，更常通过字节位置和数值来解析。

### HID Report：设备交换的数据报告

HID 通常以 **Report（报告）** 为单位交换数据。

常见三类：

|类型|常见用途|
|---|---|
|Input Report|设备向程序报告按键、状态等|
|Output Report|程序向设备发送控制数据|
|Feature Report|查询或设置设备配置等功能数据|

**Report ID**

Report ID 是用来区分报告格式的编号。

同一个设备可能有不同类型的报告：

```Bash
Report ID 1 → 按键状态
Report ID 2 → 电量状态
```

但不是所有设备都使用非零 Report ID。

**报告长度、Report ID 和字段位置，需要依据设备描述符、协议文档及库的 API 约定确定。** 不能认为所有设备的第一个接收字节都是 Report ID。

**和 TCP 数据块的区别**

TCP 是连续字节流，需要自己划分消息。

HID 的底层通信有报告边界，读取接口通常围绕报告交付数据。但一条业务消息仍可能跨多个报告，需要按设备协议重组。

### 按协议解析数据

假设协议明确规定收到以下四个字节：

|偏移|长度|含义|
|---|---|---|
|`0`|1 字节|Report ID，值为 `0x01`|
|`1`|1 字节|状态码|
|`2`|2 字节|无符号数值，小端格式|

下面是模拟数据，不代表某个真实设备协议：

```Bash
const data = Buffer.from([
  0x01,
  0x02,
  0x34,
  0x12,
]);
```

解析

```JavaScript
function parseReport(data) {
  if (data.length !== 4) {
    throw new Error('报告长度不正确');
  }

  const reportId = data[0];

  if (reportId !== 0x01) {
    throw new Error('不支持的报告类型');
  }

  return {
    reportId,
    status: data[1],
    value: data.readUInt16LE(2),
  };
}

console.log(parseReport(data));
```

结果

```Bash
{
  reportId: 1,
  status: 2,
  value: 4660,
}
```

**readUInt16LE\(2\) **

拆开看：

- `read`：读取。

- `UInt`：无符号整数，不表示负数。

- `16`：16 位，即两个字节。

- `LE`：小端字节序。

- `2`：从 Buffer 偏移 2 开始读取，即第三个字节。

**什么是大小端？**

两个字节：`34 12`

小端 `LE`：低位字节在前，表示 `0x1234`，十进制是 `4660`。

大端 `BE`：高位字节在前，表示 `0x3412`，十进制是 `13330`。

对应方法

```Bash
data.readUInt16LE(2);
data.readUInt16BE(2);
```

**大小端必须按协议选择，不能看哪个结果“比较合理”就用哪个。**

### 解析位标志

设备可能把多个开关状态放进同一个字节。

假设协议规定：

```Bash
第 0 位：按钮 A 是否按下
第 1 位：按钮 B 是否按下
第 2 位：是否正在充电
```

模拟数据：`const flags = 0b00000101;`

`0b` 表示二进制数字写法，从右往左依次是第 0、1、2 位。

解析

```Bash
const buttonA = (flags & 0b00000001) !== 0;
const buttonB = (flags & 0b00000010) !== 0;
const charging = (flags & 0b00000100) !== 0;
```

结果

```Bash
buttonA  // true
buttonB  // false
charging // true
```

这里的 `&` 是按位与，用来检查指定的位是不是 `1`。

### 发送设备报告

以 `node-hid` 的 `write()` 为例：

```Bash
device.write([
  0x00, // API 要求的 Report ID
  0x01, // 以下是示意业务字节
  0x02,
]);
```

重要规则：

- `write()` 的第一个字节是 Report ID。

- 不使用编号报告的设备，通常也需要在这里提供 `0x00`。

- 后面的字段、总长度和是否需要补零，都由设备协议和库约定决定。

**这只是参数形状示例，不要直接向未知设备发送这些字节。** 指令可能触发重置、模式切换等真实操作。

**Feature Report**

常见 API 形式：

```Bash
device.sendFeatureReport(reportBytes);

const result = device.getFeatureReport(
  reportId,
  reportLength,
);
```

查询或设置什么功能、长度是否包含 Report ID，应按库文档和设备协议确认。

**写成功不等于设备执行成功**

`write()` 成功返回，通常只能说明数据已按 API 的方式写出，不能保证设备已经完成业务操作。

需要确认执行结果时，应依据协议等待：

- 应答报告。

- 状态变化。

- 错误码。

- 超时结果。

### 错误处理与关闭设备

解析错误和设备错误是两回事：

```JavaScript
device.on('data', (data) => {
  try {
    const result = parseReport(data);
    console.log(result);
  } catch (error) {
    console.error('报告解析失败：', error.message);
  }
});

device.on('error', (error) => {
  console.error('设备连接错误：', error.message);
});
```

不要只在打开设备的外面写 `try...catch`，就以为能捕获之后事件回调里的所有错误。

不再使用时：`device.close();`

关闭后不要继续读写。应用还应统一管理关闭状态，避免不同退出路径重复操作同一个句柄。

**设备拔出后怎么办？**

常见恢复流程：

```Bash
发现断开或通信失败
        ↓
标记为未连接，停止发送
        ↓
清理旧连接和待处理请求
        ↓
设备重新出现后重新枚举
        ↓
重新选择接口并打开
```

可以先使用适度间隔的枚举检测，也可以接入系统设备变化通知；不要用高频全量枚举代替正常的数据接收。

### Electron 中HID执行位置

通常把 HID 访问放在主进程或专门的辅助进程中：

```Bash
页面：显示设备状态、响应按钮
                ↓
preload：提供限定的接口
                ↓ IPC
主进程 / 辅助进程：打开设备、收发和解析报告
                ↓
           HID 设备
```

好处：

- 不把设备控制权限直接交给页面。

- 集中管理连接和指令。

- 便于处理断开、重连和窗口关闭。

- 避免不同页面重复打开同一接口。

耗时或可能阻塞的设备操作，不应长期阻塞 Electron 主进程；可以选择库提供的异步 API，或放到辅助进程处理。

另外，`node-hid` 属于原生模块，运行在 Electron 时需要关注 Electron 版本、操作系统、CPU 架构和原生二进制兼容性。

## 原生模块与 Electron ABI

**原生模块是使用 C、C\+\+、Rust 等语言开发，编译后供 Node\.js 调用的模块。**

它通常用来完成：

- 调用操作系统接口。

- 访问 HID 等硬件设备。

- 使用已有的 C/C\+\+ 库。

- 执行适合原生实现的计算任务。

普通 JavaScript 模块直接执行 JS 代码，原生模块则需要加载编译后的二进制文件。

```Bash
JavaScript 代码-->原生模块-->操作系统接口 / 硬件 / 原生库
```

注意：**“原生模块”不等于“Node\.js 内置模块”。** `fs` 是内置模块；`node-hid` 是包含原生实现的第三方依赖。

### `.node` 文件

`.node` 文件是 Node\.js 可以加载的原生二进制模块，不是 JavaScript 源文件。

例如

```Bash
某个依赖包/
├── index.js          ← JavaScript 封装
└── build/
    └── Release/
        └── addon.node ← 编译后的原生模块
```

JavaScript 封装负责加载 `.node` 文件，再提供方便调用的 API。

因此我们可能只写：`import HID from 'node-hid';`

但底层实际上还会加载原生文件。

### 为什么需要 JavaScript 封装？

因为原生模块的底层接口可能不适合直接使用。封装层可以提供：

- 参数处理。

- Promise 或事件接口。

- 不同平台的二进制文件选择。

- 更友好的错误信息。

### ABI是什么

ABI（Application Binary Interface）叫作应用二进制接口，规定编译后的程序之间如何配合。

|概念|关注点|
|---|---|
|API|源码层面怎么调用：函数名、参数、返回值|
|ABI|编译后的二进制如何连接和交互|

底层 `.node` 模块如何与 Node\.js 的运行时配合，则涉及 ABI。

具体是：API 是“这个功能怎么用”，ABI 是“编译好的零件能不能装到这个运行环境里”。

### 为什么 Electron 要特别考虑 ABI？

Electron 自带 Node\.js，不是直接使用电脑上安装的那个 Node\.js。

```Bash
终端执行 node
└── 使用本机安装的 Node.js

启动 Electron
└── 使用 Electron 内置的 Node.js 运行环境
```

一个原生模块能在终端 Node\.js 中加载，不代表它一定能在 Electron 中加载。

Electron 的二进制接口和构建条件可能与普通 Node\.js 不同。对于依赖这些接口的原生模块，需要使用适配 Electron 的二进制产物。

即使看到相同的 Node\.js 版本号，也不能仅凭这一点判断兼容。

### 哪些因素影响兼容性？

|因素|例子|
|---|---|
|运行时与 ABI|普通 Node\.js、Electron|
|操作系统|Windows、macOS、Linux|
|CPU 架构|x64、arm64|
|系统库和运行库|Linux 的 glibc / musl、Windows 运行库|
|原生依赖|需要的 DLL、动态库、驱动是否存在|

例如：`macOS arm64 的 addon.node`不能直接拿去给：`Windows x64 的应用`使用。

**同一个 npm 包，可以根据运行环境安装不同的 ****`.node`**** 文件。**

判断 CPU 架构时，要看运行应用的进程架构，不只是电脑硬件架构。例如 Apple Silicon 上运行的 x64 Electron，需要与 x64 进程兼容的模块。

### 为什么升级后旧模块可能加载不了？

```Bash
//假设原生模块按旧环境编译：
旧 Electron + 对应 ABI
          ↓ 编译
      addon.node
//升级后：
新 Electron + 新的 ABI
          ↓ 加载旧文件
       可能不兼容
```

此时 JavaScript 代码可能没有改变，但加载 `.node` 时就失败了。

典型错误可能包含：

```Bash
was compiled against a different Node.js version
NODE_MODULE_VERSION ...
```

含义是：这个模块编译时对应的二进制接口版本，与当前运行环境要求的不一致。

但不能把所有原生模块错误都归为 ABI 问题。架构错误、动态库缺失、文件没打包进去，也可能导致加载失败。

### 所有原生模块升级后都要重编译吗？

**不是，要看它使用哪种接口。**

包括一些使用 NAN 的模块。

这类模块往往与运行时版本关系更紧密，升级 Node\.js 或 Electron 后，可能需要重新编译。

**使用 Node\-API**

Node\-API 是 Node\.js 提供的稳定原生接口，过去常被称为 N\-API。

它的目标是减少模块对具体 Node\.js、V8 版本的依赖。

```Bash
原生模块
    ↓
稳定的 Node-API
    ↓
不同版本的 Node.js / Electron
```

在满足所需 Node\-API 版本等条件时，同一个二进制文件通常可以跨多个运行时版本复用。

但它不代表：

- Windows 文件可以直接用于 macOS。

- x64 文件可以直接用于 arm64。

- 外部动态库也自动兼容。

- 模块混用的不稳定接口也得到兼容保证。

**Node\-API 减少的是运行时 ABI 变化带来的影响，不是消除所有平台差异。**

### 原生模块是怎么安装好的？

**路线一：下载预编译文件**

```Bash
安装 npm 包
    ↓
判断运行时、系统、架构等条件
    ↓
下载匹配的二进制文件
```

优点是安装快，通常不需要本机准备完整编译环境。

但前提是依赖维护者提供了匹配的产物。

**路线二：从源码编译**

```Bash
安装 npm 包
    ↓
没有匹配的预编译文件，或被要求源码构建
    ↓
使用本机编译工具生成 .node 文件
```

### node\-gyp

**`node-gyp`**** 是 Node\.js 原生模块常用的构建工具。**

它负责根据构建描述生成平台工程并调用编译工具，但它本身不是 C\+\+ 编译器。

模块中可能出现：`binding.gyp`

这个文件描述需要编译哪些源码、如何链接依赖等。

可以这样理解：

```Bash
binding.gyp：编译说明
      ↓
node-gyp：组织构建过程
      ↓
平台编译器：真正编译和链接
      ↓
生成 addon.node
```

并非所有原生模块都使用 `node-gyp`，也可能使用 CMake、Rust 等其他构建体系。

### Electron 中的 rebuild 

**rebuild 就是根据目标 Electron 环境，重新构建原生依赖。**

它不是重新编译 Electron 本身。

常见工具是 `@electron/rebuild`。在项目已安装该工具的前提下，例如：`npx electron-rebuild -f -w node-hid`

含义：

- `-f`：强制重建。

- `-w node-hid`：限定重建这个依赖。

- 默认通常根据项目安装的 Electron 确定目标版本。

也可以通过工具参数指定目标版本、架构，具体应与最终应用保持一致。

注意：

- rebuild 会修改原生依赖产物，不是只读检查。

- 如果模块源码不支持目标 Electron，重建也可能失败。

- 如果已有兼容的预编译文件，不一定需要重建。

- 不要把普通 Node\.js 环境下的 `npm rebuild`，直接等同于针对 Electron 的重建。

使用 electron\-builder 时，也可以按项目流程使用其原生依赖安装、重建能力，避免不同工具反复覆盖产物。

### 查看运行环境

在**实际 Electron 主进程中**打印：

```Bash
console.log({
  electron: process.versions.electron,
  node: process.versions.node,
  modules: process.versions.modules,
  napi: process.versions.napi,
  platform: process.platform,
  arch: process.arch,
});
```

|字段|含义|
|---|---|
|`electron`|当前 Electron 版本|
|`node`|Electron 内置的 Node\.js 版本|
|`modules`|传统 Node\.js 原生模块 ABI 版本标识|
|`napi`|当前运行时支持的 Node\-API 版本|
|`platform`|当前操作系统|
|`arch`|当前进程架构|

如果在终端普通 Node\.js 中打印，得到的是终端运行时的信息，`electron` 通常为 `undefined`。

**ABI 标识匹配只是检查的一部分，不代表系统库、架构等条件一定全部满足。**

### 打包时要注意的

原生模块不能当普通 JS 打包

esbuild 等工具不能把 `.node` 二进制文件变成普通 JavaScript。

通常需要：

- 将相应依赖设置为外部依赖。

- 确保原生文件被复制或安装到发布包。

- 保留模块所需的目录结构和动态库。

**ASAR 不是加密**

Electron 常把应用资源打包进 `app.asar`。

原生模块及相关动态库通常需要解包，或确保打包工具正确处理其真实文件访问需求。electron\-builder 等工具具有相关自动处理能力，但仍要检查产物。

**开发成功不等于发布成功**

开发环境可能有：

- 本机编译工具。

- 尚未包含进安装包的依赖文件。

- 开发机特有的运行库。

因此必须在实际目标系统、目标架构的打包应用中验证。

跨平台构建也不代表自动能够跨平台编译所有原生模块。

## 失败恢复与日志诊断

**失败恢复：操作出错后，让应用回到可以继续工作的状态。**

**日志诊断：记录关键过程，帮助判断哪里出错、为什么出错。**

例如：

- 下载断开：清理残留数据，让用户重试。

- 设备拔出：停止发送指令，重新连接。

- 页面崩溃：提示用户并重新加载。

- 配置损坏：保留原文件，按规则恢复默认配置。

与普通错误处理的区别：`catch` 负责接住错误，失败恢复负责决定接下来怎么办。

|错误类型|例子|常见处理|
|---|---|---|
|临时故障|网络超时、服务暂时不可用|有限次数重试|
|输入错误|地址格式错误、配置值非法|提示用户修改|
|权限问题|无权访问文件或设备|提示处理权限|
|资源问题|磁盘已满、文件被占用|解决资源问题后重试|
|数据损坏|配置文件不是合法 JSON|保留现场，按策略恢复|
|程序缺陷|空对象访问、错误状态转换|记录诊断信息，修复代码|

**重试不是通用修复方法。** 地址写错、磁盘已满时，反复执行通常没有帮助。

### 失败恢复的基本流程

```Bash
发现失败
    ↓
记录错误与任务上下文
    ↓
停止当前操作、清理资源
    ↓
判断能否安全重试
    ├── 可以：有限次数重试
    └── 不可以：提示用户或结束任务
    ↓
恢复可操作状态
```

恢复时要同时考虑三个方面：

- **资源**：连接、文件句柄、定时器是否释放。

- **状态**：任务是否仍错误地显示“处理中”。

- **界面**：用户是否知道失败，能否重试或取消。

例如任务失败后，应结束加载状态，而不是让按钮永久不可点击。

### 用明确的状态描述任务

不要只用一个 `isLoading` 表示整个任务。可以定义：`let status = 'idle';`

常见状态：

|状态|含义|
|---|---|
|`idle`|尚未开始|
|`running`|正在执行|
|`retrying`|等待重试|
|`succeeded`|已成功|
|`failed`|已失败|
|`cancelled`|用户已取消|

```JavaScript
//简单示例
async function runTask() {
  if (status === 'running') {
    return;
  }

  status = 'running';

  try {
    await performTask();
    status = 'succeeded';
  } catch (error) {
    status = 'failed';
    console.error('任务失败：', error);
  }
}
```

这里的 `performTask()` 代表实际业务操作。

**状态要反映真实结果。** 捕获错误后，不能仍然把任务标记为成功。

正式设计重试、取消时，还要防止重复启动，以及旧任务的结果覆盖新任务状态。

### 有限重试与退避

**为什么要限制次数？**

无限重试可能：

- 持续占用资源。

- 给服务端增加压力。

- 掩盖持续故障。

- 让用户一直等待。

因此需要明确：

- 哪些错误允许重试。

- 最多尝试多少次。

- 每次间隔多久。

- 如何取消。

**退避是什么意思？**

退避就是：连续失败时，隔更久再试。

```Bash
//例如：
第一次失败 → 等 1 秒
第二次失败 → 等 2 秒
第三次失败 → 等 4 秒
```

避免故障期间不断密集请求。

**基础重试函数**

```JavaScript
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

async function retry(
  task,
  {
    maxAttempts = 3,
    shouldRetry = () => false,
  } = {},
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;

      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }

      const waitMs = 1000 * 2 ** (attempt - 1);

      console.warn('任务准备重试', {
        attempt,
        waitMs,
        message: error.message,
      });

      await delay(waitMs);
    }
  }
}
```

说明：

- `maxAttempts: 3` 表示总共最多执行三次，不是失败后额外重试三次。

- `shouldRetry()` 根据错误判断是否重试。

- 成功时立即返回。

- 不可重试或次数耗尽时向外抛错。

- 默认不重试，避免对未知操作盲目重复执行。

这是基础示例，假设参数有效；实际还应增加取消、总耗时限制，必要时加入随机等待，避免大量客户端同时重试。

### 重试前先确认：操作会不会重复产生副作用？

```Bash
//例如：
客户端发送“创建订单”
        ↓
服务端已创建成功
        ↓
返回结果时网络断开
```

客户端看到失败，不代表服务端没执行。

如果直接重试，可能重复创建订单。这就涉及**幂等性**：同一个操作重复执行，不会产生额外的重复效果。

常见处理方式：

- 为请求生成唯一任务标识。

- 服务端识别重复请求。

- 重试前查询原操作状态。

- 使用协议提供的请求序号或幂等键。

**超时不等于没执行，重试不等于继续上次执行。**

设备控制、升级、删除、支付等操作尤其需要谨慎。

### 超时与取消

**超时**

```Bash
//限制一次操作最多等待多久：
const response = await fetch(url, {
  signal: AbortSignal.timeout(10_000),
});
```

这会在超时后中止尚未完成的请求或响应体读取。

但是，不是所有 API 都支持同样的取消机制。

**取消**

用户主动取消时，通常应：

- 停止后续重试。

- 中止支持取消的正在执行的操作。

- 清理定时器和监听。

- 将状态标记为 `cancelled`。

取消不应该被误判成“网络失败”，然后又自动重试。

**Promise\.race 不会自动停止底层任务**

```Bash
await Promise.race([
  performTask(),
  timeoutPromise,
]);
```

即使超时 Promise 先结束，`performTask()` 仍可能继续执行。

所以要区分：

- 不再等待结果。

- 真正停止操作。

后者需要底层支持取消、关闭连接等机制。

### 失败后清理资源

|资源|清理方式示例|
|---|---|
|定时器|`clearTimeout()`、`clearInterval()`|
|事件监听|`removeListener()`|
|MessagePort|`close()`|
|HID 连接|`device.close()`|
|网络连接|按场景使用 `end()` 或 `destroy()`|
|文件句柄|`close()`|
|临时文件|确认归属后按策略删除或保留|

可以使用 `finally` 保证正常控制流程中的收尾：

```JavaScript
const timer = setInterval(() => {
  console.log('任务仍在运行');
}, 1000);

try {
  await performTask();
} finally {
  clearInterval(timer);
}
```

注意：

- 清理失败不能轻易掩盖原始业务错误。

- 多条错误路径可能重复触发清理，应避免重复关闭造成新错误。

- 强制结束进程、断电时，不能保证 `finally` 执行。

### 常见恢复场景

**下载失败**

恢复时需要考虑：

- 未完成文件是否单独保存为临时文件。

- 是否支持断点续传。

- 文件内容是否完整。

- 重试是否覆盖了用户原有文件。

```Bash
//常见策略
下载到临时文件
      ↓
完成并验证
      ↓
替换正式目标
```

断点续传需要服务端支持，还要确认远端文件没有改变，不能简单地把新数据一直追加到旧文件后面。

**设备断开**

```Bash
发现断开
    ↓
停止发送，结束待处理请求
    ↓
清理旧连接
    ↓
设备重新出现后重新枚举
    ↓
重新打开并初始化
```

重新连接成功，不代表设备还保持之前的状态，需要按协议确认。

**配置文件损坏**

不要直接忽略错误并覆盖原文件。

可选择：

1. 记录错误。

2. 保留损坏文件供排查。

3. 告知用户。

4. 按明确策略使用默认配置或备份。

备份也可能包含敏感信息，需要控制权限和保留周期。

### Electron 页面失败的诊断

#### **页面加载失败**

```Bash
win.webContents.on(
  'did-fail-load',
  (_event, errorCode, errorDescription, url, isMainFrame) => {
    if (!isMainFrame) {
      return;
    }

    console.error('主页面加载失败', {
      errorCode,
      errorDescription,
    });
  },
);
```

需要区分：

- 主页面失败还是子框架失败。

- 网络故障还是主动取消导航。

- 本地资源缺失还是远端不可用。

例如 `ERR_ABORTED` 可能与导航被取消有关，不能见到事件就立即无限刷新。

#### 渲染进程退出

```Bash
win.webContents.on('render-process-gone', (_event, details) => {
  console.error('渲染进程已退出', {
    reason: details.reason,
    exitCode: details.exitCode,
  });
});
```

它可以帮助发现崩溃、内存不足或进程被终止等情况。

恢复时应根据原因决定：

- 提供重新加载按钮。

- 有限次数自动恢复。

- 保存诊断信息。

- 重复崩溃时停止自动重启。

**重新加载页面可能丢失未保存的内存数据。**

#### 页面无响应

```JavaScript
win.on('unresponsive', () => {
  console.warn('窗口无响应');
});

win.on('responsive', () => {
  console.log('窗口恢复响应');
});
```

无响应不一定等于崩溃，也可能是长时间同步计算。不要刚检测到就立即强制销毁。

### 日志应该记录什么？

一条有用的错误日志应能回答：什么时候，哪个任务，进行到哪一步，发生了什么错误？

|字段|用途|
|---|---|
|`time`|发生时间|
|`level`|日志级别|
|`action`|正在执行的操作|
|`taskId`|关联同一任务|
|`attempt`|当前尝试次数|
|`durationMs`|操作耗时|
|`code`|稳定的错误标识|
|`message`|错误说明|
|`stack`|调用堆栈|

```YAML
//示例：
console.error(JSON.stringify({
  time: new Date().toISOString(),
  level: 'error',
  action: 'download',
  taskId: 'task-001',
  attempt: 2,
  code: error.code,
  message: error.message,
  stack: error.stack,
}));
```

这里的 `error` 是错误处理位置收到的对象。

**同一个任务的开始、重试和结束日志，应使用同一个任务标识，才能串起来看。**

### 日志级别与本地文件管理

**常见级别**

|级别|内容|
|---|---|
|`debug`|详细调试过程|
|`info`|启动、完成、状态切换等正常事件|
|`warn`|异常但暂时可以继续，如准备重试|
|`error`|操作失败，需要关注|

`console.log()`、`console.error()` 不会自动提供完整的文件日志管理。

可以自行写文件，也可以使用 `electron-log` 等第三方库。

长期记录文件日志需要考虑：

- 文件大小上限。

- 按日期或大小轮换。

- 最长保留时间。

- 磁盘空间不足。

- 日志写入本身失败。

不要让日志无限增长，也不要因为日志写入失败，再反复记录同一个日志错误，形成循环。

### 日志安全与错误传递

#### 不记录敏感信息

避免直接打印：

- 密码、令牌、私钥。

- 完整认证请求头。

- 带签名或凭据的 URL。

- 不必要的个人文件内容和设备标识。

#### 保留原始错误

补充业务背景时，可以使用 `cause`：

```Bash
throw new Error('读取配置失败', {
  cause: error,
});
```

但日志格式化时需要明确处理 `cause`，不能假设序列化会自动完整保存它。

#### 不要重复记录同一个错误

底层负责抛出，中间层补充必要背景，最终负责处理的边界统一记录，避免一个故障被打印多遍。

#### 区分用户提示与诊断日志

给用户：`下载失败，请检查网络后重试。`

给开发者的日志则保留任务标识、错误码、失败阶段等必要细节。

## 自动升级与状态机

自动升级，就是应用检查新版本、下载更新，并在合适的时候安装。

常见流程

```Bash
检查版本 → 发现新版本 → 下载更新 → 下载完成 → 安装并重启
```

“自动升级”不一定表示全程不询问用户。可以设计为：

- 自动检查，手动下载。

- 自动下载，用户选择何时安装。

- 在退出应用时安装。

**下载完成不等于安装完成，安装完成也不等于新版本已经正常启动。**

**自动升级需要的东西**

|部分|作用|
|---|---|
|当前应用版本|判断当前安装的版本|
|更新元数据|描述新版本、更新包地址、校验信息等|
|更新包|实际安装或替换的文件|
|更新服务端|托管更新元数据和更新包|
|客户端更新器|检查、下载、校验并安排安装|

更新器再根据发布信息判断有没有可用的新版本。

### 版本号比较

```Bash
//常见版本格式：
主版本号.次版本号.修订号
//例如：
1.2.3
//不能直接比较字符串
'1.10.0' > '1.9.0' // 不是可靠的版本判断方式
```

应使用遵循版本规则的比较工具或更新器自身的版本判断逻辑。

除了版本号，还要匹配：

- 操作系统。

- CPU 架构。

- 发布渠道，如稳定版、测试版。

- 安装包类型。

- 是否允许降级。

**版本更高，不代表这个更新包就适合当前应用。**

### Electron 中常见的更新工具

|工具|来源|说明|
|---|---|---|
|`autoUpdater`|Electron 内置|使用平台相关的更新机制，支持情况有平台限制|
|`electron-updater`|第三方库|常与 electron\-builder 配合，支持多种更新目标|

两者虽然都可能使用 `autoUpdater` 这个变量名，但不是同一个实现，不能混用所有配置和 API。

```Bash
// Electron 内置
import { autoUpdater } from 'electron';

// 第三方 electron-updater
import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;
```

真实更新通常需要匹配的打包产物、发布配置和平台条件，不能只靠开发环境运行成功来证明。

### 更新过程由主进程管理

建议职责划分

```Bash
页面
├── 显示新版本信息
├── 显示下载进度
└── 提供下载、重试、安装按钮
         ↓ preload + IPC
主进程
├── 调用更新器
├── 管理更新状态
├── 校验操作是否允许
└── 协调退出与安装
```

页面不应该任意指定更新包下载地址，也不应直接拿到所有更新器能力。

### 状态机

**状态机就是：明确任务现在处于什么状态，以及这个状态下允许发生什么。**

例如：

- 正在检查时，不重复检查。

- 正在下载时，不重复启动下载。

- 下载完成前，不允许安装。

- 出错后，按失败阶段决定如何重试。

如果只用几个布尔值：

```Bash
isChecking
isDownloading
isDownloaded
hasError

//可能出现互相矛盾的组合：
isDownloading = true;
isDownloaded = true;
hasError = true;
```

状态机可以用一个明确的状态表达当前阶段，减少这种混乱。

#### 定义更新状态

以下状态名由应用自己定义，不是 Electron 固定要求：

|状态|含义|
|---|---|
|`idle`|尚未检查|
|`checking`|正在检查|
|`available`|发现可用更新|
|`upToDate`|当前没有可用更新|
|`downloading`|正在下载|
|`downloaded`|更新已准备好，可以安装|
|`installing`|已请求进入安装流程|
|`failed`|当前更新操作失败|

**典型转换：**

```Bash
idle / upToDate
      │ 检查
      ▼
  checking
      ├── 没有更新 ──→ upToDate
      ├── 发现更新 ──→ available
      └── 检查失败 ──→ failed

  available
      │ 下载
      ▼
 downloading
      ├── 下载失败 ──→ failed
      └── 下载完成 ──→ downloaded
                          │ 确认安装
                          ▼
                      installing
```

`failed` 最好同时记录失败阶段：

```Bash
{
  status: 'failed',
  failedAt: 'downloading',
  message: '网络连接中断',
}
```

这样才能知道应该重新检查，还是重新下载。

#### 状态机的四个组成部分

|概念|含义|示例|
|---|---|---|
|状态|现在处于哪一步|`downloaded`|
|事件|发生了什么|用户点击安装|
|条件|能否执行这个变化|更新包已准备好|
|动作|需要做什么|调用安装方法|

```Bash
//例如
当前状态：downloaded
事件：用户点击安装
条件：没有需要阻止退出的未保存任务
动作：请求退出并安装
新状态：installing
```

给变量赋值不等于已经建立了状态机，还需要约束允许的转换。

#### 一个简单的状态转换实现

```JavaScript
const transitions = {
  idle: {
    CHECK: 'checking',
  },
  upToDate: {
    CHECK: 'checking',
  },
  checking: {
    FOUND: 'available',
    NOT_FOUND: 'upToDate',
    FAIL: 'failed',
  },
  available: {
    DOWNLOAD: 'downloading',
    CHECK: 'checking',
  },
  downloading: {
    COMPLETE: 'downloaded',
    FAIL: 'failed',
  },
  downloaded: {
    INSTALL: 'installing',
  },
  installing: {
    FAIL: 'failed',
  },
  failed: {
    CHECK: 'checking',
  },
};

let status = 'idle';

function transition(event) {
  const nextStatus = transitions[status]?.[event];

  if (!nextStatus) {
    throw new Error(
      `状态 ${status} 不允许处理事件 ${event}`,
    );
  }

  status = nextStatus;
  console.log('当前状态：', status);
}
```

使用

```Java
transition('CHECK');    // checking
transition('FOUND');    // available
transition('DOWNLOAD');// downloading
transition('COMPLETE');// downloaded
```

如果在 `checking` 时安装：`transition('INSTALL');`

就会被拒绝。

这是演示用的转换表，实际项目需要增加取消、重试条件、错误上下文等。

### 更新器的常见事件

`electron-updater` 常见事件：

|事件|含义|
|---|---|
|`checking-for-update`|开始检查更新|
|`update-available`|发现可用更新|
|`update-not-available`|没有可用更新|
|`download-progress`|下载进度变化|
|`update-downloaded`|更新下载完成、准备好安装|
|`error`|更新过程中发生错误|

这些事件是更新器提供的。

而 `checking`、`available` 等状态，是应用根据事件维护的业务状态。

`更新器事件 → 应用更新状态 → 通知页面刷新`

#### 基础更新调用示例

以下是独立的 API 用法示例，不是上面状态机的完整接入代码。

```JavaScript
import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;

// 由应用决定什么时候下载、安装
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('checking-for-update', () => {
  console.log('正在检查更新');
});

autoUpdater.on('update-available', (info) => {
  console.log('发现版本：', info.version);
});

autoUpdater.on('update-not-available', () => {
  console.log('没有可用更新');
});

autoUpdater.on('download-progress', (progress) => {
  console.log('下载百分比：', progress.percent);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('更新准备完成：', info.version);
});

autoUpdater.on('error', (error) => {
  console.error('更新失败：', error);
});
```

在应用就绪、更新配置有效时检查：

```Bash
try {
  await autoUpdater.checkForUpdates();
} catch (error) {
  // 处理这次调用的失败，避免未处理的 Promise 拒绝
}
```

发现更新后下载：`await autoUpdater.downloadUpdate();`

确认更新准备好，并完成退出前的检查后：`autoUpdater.quitAndInstall();`

注意：

- 仅安装库、写下这些代码，还不能完成真实更新。

- 需要正确的发布地址、更新元数据和匹配的安装包。

- `error` 事件与方法的 Promise 拒绝可能对应同一次失败，应避免重复提示。

- `quitAndInstall()` 是发起退出安装，不是等待返回“安装成功”。

### 安装前为什么还要确认？

安装通常需要退出应用。

退出前应检查：

- 是否有未保存内容。

- 是否有重要任务尚未结束。

- 是否需要关闭设备、连接和后台进程。

- 用户是否同意现在重启。

还要留意“关闭窗口只是隐藏到托盘”的逻辑：

```Bash
win.on('close', (event) => {
  event.preventDefault();
  win.hide();
});
```

如果不区分普通关窗与升级退出，可能阻碍安装流程。

**升级退出需要与应用已有的退出、保存和资源清理逻辑协调。**

### 失败恢复

|失败阶段|处理思路|
|---|---|
|检查失败|保持旧版本正常运行，允许稍后重试|
|下载失败|提示失败，按更新器能力重新下载或续传|
|校验失败|不允许安装，重新获取可信更新|
|安装启动失败|记录日志，提供重试或手动安装入口|
|新版本启动失败|需要单独设计回滚或恢复方案|

注意：

- 自动升级工具不等于自动拥有业务回滚能力。

- 回滚程序文件也不一定能回滚配置或数据库。

- 重启后不能只相信保存的 `downloaded` 状态，必须重新确认更新包是否仍然有效。

- 不要为了让更新成功而关闭签名、完整性或来源校验。

### 真实升级需要验证的地方

#### 发布侧

- 更新元数据是否指向正确文件。

- 包是否匹配系统、架构和发布渠道。

- 哈希、签名等验证信息是否有效。

- 平台需要的签名、公证等条件是否满足。

#### 客户端侧

- 已安装的旧版本能否发现新版本。

- 下载进度和失败提示是否正确。

- 断网后能否按设计恢复。

- 未下载完成时是否禁止安装。

- 安装退出是否被托盘逻辑阻止。

- 新版本能否启动，用户数据是否保留。

**完整验证是：安装旧版本 → 检查 → 下载 → 安装 → 启动新版本。**

模拟触发几个事件、页面显示“下载成功”，不能替代真实升级验证。

## 构建脚本与应用打包

先区分四个动作：

|动作|含义|
|---|---|
|开发运行|启动开发环境，方便修改和调试|
|构建|把源码转换成运行所需的代码和资源|
|打包|把代码、资源、依赖与 Electron 运行时组装成桌面应用|
|发布|将安装包、更新信息等交付给用户或上传到分发平台|

常见流程：

```Bash
源码
 ↓ 构建
可运行的 JavaScript、HTML、CSS 等
 ↓ 打包
桌面应用及安装包
 ↓ 发布
用户下载、安装
```

构建成功不等于打包成功，打包成功也不等于应用已经发布。

**为什么需要构建？**

如果项目直接使用普通 JavaScript 和 HTML，有些文件不需要编译。

但实际项目通常会使用：

- TypeScript。

- React JSX。

- Sass 等样式语言。

- 路径别名。

- 多个模块和静态资源。

运行环境不能直接理解全部源码写法，需要构建工具处理。

```Bash
**//例如：**
TypeScript → JavaScript
JSX → 浏览器能够执行的 JavaScript
Sass → CSS
多个源码模块 → 整理后的输出文件
```

构建还可能执行：

- 代码压缩。

- 资源复制。

- 环境配置替换。

- Source Map 生成。

**构建是根据目标运行环境整理代码，不只是压缩文件。**

### Electron 要区分三种构建目标

|部分|运行环境|构建时关注什么|
|---|---|---|
|主进程|Electron 的 Node\.js 环境|Node\.js API、模块格式、外部依赖|
|preload|Electron 预加载环境|沙箱限制、模块格式、接口暴露|
|页面|Chromium 浏览器环境|HTML、CSS、JS、资源路径|

常见工具分工：

- Vite：经常用于页面开发和构建。

- esbuild、Rollup、Webpack：可以用于不同入口的转换和打包。

- electron\-builder：组装桌面应用、生成分发产物。

工具的职责不是绝对固定的，要看项目配置。

### package\.json 中的 scripts

`scripts` 用来给命令起名字，方便统一执行。

```JSON
{
  "scripts": {
    "dev": "vite",
    "build:renderer": "vite build",
    "build:electron": "node scripts/build-electron.mjs",
    "build": "npm run build:electron && npm run build:renderer",
    "pack": "npm run build && electron-builder --dir",
    "dist": "npm run build && electron-builder"
  }
}

//执行：npm run build
//就会运行对应的命令。
```

**名字可以自定义**

`build`、`pack`、`dist` 是常见命名习惯，不是 Electron 强制规定。

真正执行什么，取决于右侧命令。

**`&&`**** 的含义**

`npm run build:electron && npm run build:renderer`

表示：前一条命令成功后，才执行后一条。

如果第一步以非零退出码结束，第二步不会继续。

**为什么不用写 node\_modules 的完整路径？**

运行 npm scripts 时，npm 会将本项目的 `node_modules/.bin` 加入命令查找路径。

因此，项目安装了对应工具后，可以直接写：

```Bash
{
  "scripts": {
    "build:renderer": "vite build"
  }
}
```

不需要为了使用它而全局安装 Vite。

### 单独的构建脚本

命令比较简单时，直接写在 `scripts` 中即可。

如果需要：

- 构建多个入口。

- 根据平台选择配置。

- 复制资源。

- 校验文件是否存在。

- 统一处理失败。

就可以编写独立的 Node\.js 脚本。

```Bash
//例如：
scripts/
└── build-electron.mjs
```

它本身是一个 Node\.js 程序，运行在开发机或 CI 构建环境中，不是应用页面代码。

**一个 esbuild 示例**

假设项目已安装 esbuild：

```JavaScript
// scripts/build-electron.mjs
import { build } from 'esbuild';

try {
  await build({
    entryPoints: ['src/main/index.ts'],
    outfile: 'dist/main/index.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    external: ['electron'],
  });

  console.log('主进程构建完成');
} catch (error) {
  console.error('主进程构建失败：', error);
  process.exitCode = 1;
}
```

|配置|作用|
|---|---|
|`entryPoints`|源码入口|
|`outfile`|输出文件位置|
|`bundle: true`|将可打包的依赖整合进产物|
|`platform: 'node'`|面向 Node\.js 类运行环境|
|`format: 'cjs'`|输出 CommonJS 格式|
|`external: ['electron']`|不把 Electron API 模块打进产物，运行时提供|

这里的构建脚本是 ESM，源码也可以使用 `import/export`，但输出格式是 CommonJS。

**构建脚本的模块格式、源码语法、产物格式，是三个不同的问题。**

另外，esbuild 转换 TypeScript 不等于完成类型检查。需要时应单独执行：`tsc --noEmit`

### 把某些依赖设为 external

`external` 表示：这个依赖不放进当前 JavaScript bundle，保留到运行时加载。

常见对象包括：

- `electron`。

- 某些原生模块。

- 必须保持独立目录结构的依赖。

例如：`external: ['electron', 'node-hid']`

但要注意：

**不打进 JS bundle，不等于发布时不需要它。**

- `electron` 由最终应用的 Electron 运行时提供。

- `node-hid` 等第三方依赖仍需要被正确放入应用包，并匹配目标平台和 ABI。

### 构建后的目录应该明确

一个示意结构

```Bash
项目目录/
├── src/
│   ├── main/
│   ├── preload/
│   └── renderer/
├── scripts/
├── dist/
│   ├── main/
│   │   └── index.cjs
│   ├── preload/
│   │   └── index.cjs
│   └── renderer/
│       ├── index.html
│       └── assets/
├── release/
└── package.json
```

其中：

- `src`：开发源码。

- `dist`：构建产物。

- `release`：桌面应用、安装包等分发产物。

这些目录名都可以自定义。

主入口应指向构建后的文件：

```Bash
{
  "main": "dist/main/index.cjs"
}
```

Electron 启动的是 `main` 指向的文件，不会因为存在 TypeScript 源码就自动编译它。

### 开发环境和打包后的加载方式

开发时，页面通常由开发服务器提供：`win.loadURL('``http://localhost:5173``');`

打包后，用户电脑上通常没有这个开发服务器，应加载应用携带的文件：`win.loadFile(rendererPath);`

常见判断：

```Bash
if (app.isPackaged) {
  win.loadFile(rendererPath);
} else {
  win.loadURL('http://localhost:5173');
}
```

其中：

- `app.isPackaged` 判断应用是否处于打包状态。

- `rendererPath` 应指向实际产物中的 HTML 文件。

注意：**打包状态不等于测试环境或生产环境。** 测试渠道也可以是打包应用。

**开发时和打包后，目录结构可能不同。**

例如源码中的：`src/renderer/index.html`，构建后变成：`dist/renderer/index.html`

需要区分几个路径来源：

|路径 API|含义|
|---|---|
|`process.cwd()`|当前工作目录，不一定是应用目录|
|`import.meta.url`|当前 ESM 模块的位置|
|`app.getAppPath()`|应用代码根路径，可能位于 ASAR 中|
|`process.resourcesPath`|应用资源目录|
|`app.getPath('userData')`|当前应用的用户数据目录|

用途要分开：

- HTML、图标等程序资源：从应用资源位置加载。

- 用户配置、历史记录：写入 `userData` 等可写目录。

- 不要默认向安装目录或 `app.asar` 内写入配置。

页面资源也要检查 URL 路径。比如使用 Vite 构建并通过 `file://` 加载时，常需要配置适合的相对资源路径：

```Bash
export default {
  base: './',
};
```

具体还要结合页面路由和资源加载方式判断。

### 使用 electron\-builder 打包

electron\-builder 是第三方打包工具，不是 Electron 自带模块。

```JSON
//一个基础配置示例：
{
  "name": "sample-app",
  "version": "1.0.0",
  "main": "dist/main/index.cjs",
  "build": {
    "appId": "com.example.sample",
    "productName": "SampleApp",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "asar": true,
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    }
  }
}
```

主要字段：

|字段|作用|
|---|---|
|`appId`|应用标识，发布后应保持稳定|
|`productName`|产品显示名称|
|`directories.output`|分发产物目录|
|`files`|应用文件的包含规则|
|`asar`|是否将应用代码等资源归档|
|`win.target`|Windows 分发目标|
|`mac.target`|macOS 分发目标|

electron\-builder 还会按照配置和自身规则收集生产依赖。原生模块、额外资源等需要结合实际产物检查，不能只看 `files` 就断定全部齐全。

**两种常见命令**

生成可运行的应用目录，便于本地检查，不生成最终安装器。

```Bash
electron-builder --dir
```

按配置生成对应平台的分发产物。

```Bash
electron-builder
```

不要同时启动多个构建任务写入同一输出目录，以免产物互相覆盖。

### ASAR 

**ASAR 是 Electron 常用的应用资源归档格式。**

可以把它理解为：把很多应用文件整理进一个 `app.asar` 文件中，方便分发。

但它：

- 不是加密。

- 不代表代码无法被读取。

- 通常不能按普通可写目录使用。

- 某些原生文件或外部程序需要放在归档外。

#### extraResources

用于把资源复制到应用资源目录中：

```JSON
{
  "build": {
    "extraResources": [
      {
        "from": "resources/helper",
        "to": "helper"
      }
    ]
  }
}
```

运行时可以定位：

```Bash
import path from 'node:path';

const helperPath = path.join(
  process.resourcesPath,
  'helper',
);
```

#### asarUnpack

用于指定哪些应用文件需要解包到 ASAR 外：

```Bash
{
  "build": {
    "asarUnpack": [
      "**/*.node"
    ]
  }
}
```

打包工具可能自动处理部分原生模块，但实际依赖的动态库、辅助程序和路径仍需验证。

### dependencies 与 devDependencies

|分类|通常放什么|
|---|---|
|`dependencies`|应用运行时仍需要加载的依赖|
|`devDependencies`|构建、开发、测试工具|

例如：

- `electron`、`electron-builder`、TypeScript 通常放在 `devDependencies`。

- 运行时外部加载的 `node-hid` 等通常放在 `dependencies`。

Electron 虽然通常是开发依赖，但打包工具会将 Electron 运行时组装进最终桌面应用。

是否需要单独携带某个依赖，还取决于它是否已进入构建产物，以及打包工具的收集规则。

### 平台、架构与原生模块

打包时要明确目标：

```Bash
操作系统：Windows / macOS / Linux
CPU 架构：x64 / arm64
分发格式：NSIS / DMG / AppImage 等
```

含有原生模块时，还要检查：

- 二进制是否匹配目标架构。

- 是否匹配 Electron ABI 或所需 Node\-API。

- 动态库是否齐全。

- 辅助程序是否具有执行权限。

- 相关文件是否进入发布包。

**不能认为在一台电脑上运行一次打包命令，就一定能产出所有系统可用的应用。**

跨平台构建、签名和原生编译都有具体限制。

### 代码签名与 macOS 公证

#### 代码签名

用于证明发布者身份，并帮助系统检测签名后内容是否被修改。

它不能保证应用没有漏洞，也不是给 JavaScript 源码加密。

#### macOS 公证

Apple 对提交的软件进行相关检查，并提供公证结果，配合签名帮助应用通过系统分发检查。

注意：

- 签名证书、密码等属于敏感信息。

- 不应提交到 Git。

- 应通过安全的本机凭据或 CI 密钥管理注入。

- 测试包能启动，不代表正式分发、签名、公证流程全部通过。


