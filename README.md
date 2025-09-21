# Vue3 源码解析

> 深入学习Vue3源码实现，从零开始构建一个简化版的Vue3框架

## 📖 项目简介

本项目是一个Vue3源码学习项目，通过手写实现Vue3的核心功能来深入理解其内部原理。项目采用Monorepo架构，使用pnpm workspace管理多个包，模拟Vue3的模块化设计。

## 🏗️ 项目架构

```
Vue3_code/
├── packages/
│   ├── shared/          # 共享工具函数
│   ├── reactivity/      # 响应式系统
│   ├── runtime-core/    # 运行时核心
│   └── runtime-dom/     # DOM运行时
├── scripts/             # 构建脚本
└── README.md
```

## 📦 核心模块

### 🔧 @vue/shared
- 提供Vue3中使用的通用工具函数
- 包含类型判断、ShapeFlags等基础功能

### ⚡ @vue/reactivity
- **响应式系统核心实现**
- `reactive()` - 创建响应式对象
- `ref()` - 创建响应式引用
- `computed()` - 计算属性
- `effect()` - 副作用函数
- `watch()` - 监听器

### 🎯 @vue/runtime-core
- **运行时核心模块**
- 虚拟DOM (Virtual DOM) 实现
- 组件系统
- 渲染器 (Renderer)
- 调度器 (Scheduler)
- 最长递增子序列算法 (用于diff优化)

### 🌐 @vue/runtime-dom
- **DOM平台相关实现**
- DOM节点操作
- 属性补丁 (patchProp)
- 事件处理
- 样式处理

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
# 构建reactivity模块
pnpm dev

# 构建指定模块
node scripts/dev.js [模块名] -f [格式]
```

### 构建格式
- `esm` - ES模块格式
- `cjs` - CommonJS格式
- `global` - 全局变量格式

## 💡 核心特性实现

### 响应式系统
- 基于Proxy的响应式实现
- 依赖收集和触发机制
- 计算属性和监听器
- 批量更新和调度优化

### 虚拟DOM
- 虚拟节点 (VNode) 创建和比较
- Diff算法优化
- 最长递增子序列算法
- 高效的DOM更新策略

### 组件系统
- 组件实例管理
- Props和Slots处理
- Setup函数支持
- 生命周期钩子

### 渲染器
- 跨平台渲染抽象
- DOM操作封装
- 事件系统
- 样式处理

## 🛠️ 技术栈

- **TypeScript** - 类型安全
- **ESBuild** - 快速构建
- **pnpm** - 包管理
- **Monorepo** - 多包管理

## 📚 学习目标

通过这个项目，你将学习到：

1. **Vue3响应式原理** - 深入理解Proxy和依赖收集机制
2. **虚拟DOM实现** - 掌握VNode和Diff算法
3. **组件系统设计** - 理解组件实例和生命周期
4. **渲染器架构** - 学习跨平台渲染抽象
5. **Monorepo管理** - 掌握多包项目管理

## 🔍 代码结构

### 响应式系统核心
```typescript
// packages/reactivity/src/reactive.ts
export function reactive(target) {
  return createReactiveObject(target)
}

// packages/reactivity/src/effect.ts  
export function effect(fn, options?) {
  // 副作用函数实现
}
```

### 虚拟DOM核心
```typescript
// packages/runtime-core/src/createVnode.ts
export function createVnode(type, props, children?) {
  // 虚拟节点创建
}

// packages/runtime-core/src/renderer.ts
export function createRenderer(renderOptions) {
  // 渲染器实现
}
```

## 📖 学习建议

1. 从`@vue/shared`开始，了解基础工具函数
2. 深入学习`@vue/reactivity`响应式系统
3. 研究`@vue/runtime-core`虚拟DOM实现
4. 最后学习`@vue/runtime-dom`平台相关代码

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个学习项目！

## 📄 许可证

ISC License

---

> 这个项目仅用于学习目的，帮助理解Vue3的内部实现原理
