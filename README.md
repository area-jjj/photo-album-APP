# 我的相册 APP

一个基于 React + TypeScript + IndexedDB 的本地相册应用。支持上传照片、添加备注、图集分类管理。

## 功能特性

- **上传照片**：拖拽或点击上传，支持 JPG/PNG/WebP/GIF/BMP
- **写备注**：点击照片，添加备注，自动保存
- **图集管理**：创建/切换图集，批量移动和删除照片
- **照片搜索**：按名称、备注内容、日期范围筛选
- **离线可用**：所有数据存储在浏览器 IndexedDB，无需联网

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS
- Zustand 状态管理
- IndexedDB 本地存储

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
