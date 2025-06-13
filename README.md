# 🍸 Apple Liquid Glass 设计理念与前端实现解析

> 2025 年 WWDC 上，Apple 正式介绍了「Liquid Glass」液态玻璃视觉设计。与传统毛玻璃风格不同，它更具动态流动感、视觉张力和真实物理模拟感，成为 UI 设计语言的又一次演进。

## 什么是 Liquid Glass？

「Liquid Glass」是 Apple 提出的下一代界面设计语言核心特效之一。它试图模拟现实中玻璃在光照、压力、移动下的物理变形 —— 表现出液态感、弹性张力与微观粒子扰动。与过去 macOS 和 iOS 系统中广泛应用的毛玻璃（Frosted Glass）背景不同，它强调：

*   **流动性（Fluidity）** ：交互时表面仿佛液体在响应你的触碰。
*   **真实位移（Realistic Displacement）** ：像素级别的变形和折射。
*   **动态响应（Reactive Deformation）** ：响应用户拖动、悬浮、交互时的即刻反馈。
*   **空间层次感（Depth & Refraction）** ：不仅模糊背景，还加入光线弯曲、折射偏移。

## 效果图

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/04027c22e33d4620a71f5ae9faa80447~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Zuo5aSc5a-75pm05aSp:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTk0MzU5MjI4ODM5MTQ5NiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750421265&x-orig-sign=L7Fdo9uI8X%2F2uIMu2u6AqbcllVY%3D)

![1.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/747fa1747446402face617cf16b0dcff~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Zuo5aSc5a-75pm05aSp:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTk0MzU5MjI4ODM5MTQ5NiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750421265&x-orig-sign=UC89LzxrCdckV7jbnfFvbtWw7%2BM%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/785ee5149ee44beca31e14926b81f775~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Zuo5aSc5a-75pm05aSp:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTk0MzU5MjI4ODM5MTQ5NiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750421265&x-orig-sign=OqdWeB4CKArwfwUZwG2ojDJYFaI%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/957337cac0d141598eb13b3c6c48edb5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Zuo5aSc5a-75pm05aSp:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTk0MzU5MjI4ODM5MTQ5NiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750421265&x-orig-sign=rLyD19oZdogWfEaIPwSbYRKmkzI%3D)

## 苹果的实现原理简析

根据 Apple 官方技术文档（[Apple Developer: Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)），液态玻璃效果依赖以下底层技术栈：

| 技术                               | 用途                 |
| -------------------------------- | ------------------ |
| **Core Animation + Metal**       | 用于高性能的实时图像位移与模糊渲染  |
| **Displacement Mapping**         | 用色彩通道控制图像位移，模拟玻璃扰动 |
| **Blur Kernel + Refraction Map** | 背景模糊+折射贴图双通道叠加     |
| **Physics Simulation**           | 模拟玻璃受力下的形变、回弹和张力效果 |
| **Gaussian Blur + Color Shift**  | 构建光线流动的视觉微扰        |

## 纯前端如何实现 Liquid Glass？

我们可以借助浏览器的 SVG + Canvas + CSS `backdrop-filter` + `feDisplacementMap` 滤镜来近似实现 Liquid Glass 效果，尤其参考 Shu Ding 贡献的一段高度精巧的 JS 脚本。

### ✅ 源码解析

```js
// Vanilla JS 实现 Liquid Glass 液态玻璃效果
// 作者：Shu Ding（https://github.com/shuding/liquid-glass）
// 可直接复制粘贴进浏览器控制台运行

(function() {
  'use strict';

  // 如果已有 liquidGlass 实例，先销毁它
  if (window.liquidGlass) {
    window.liquidGlass.destroy();
    console.log('上一个液态玻璃效果已移除');
  }

  // 插值函数，用于平滑位移动画
  function smoothStep(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // 二维向量长度
  function length(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  // SDF（Signed Distance Function）计算圆角矩形形状
  function roundedRectSDF(x, y, width, height, radius) {
    const qx = Math.abs(x) - width + radius;
    const qy = Math.abs(y) - height + radius;
    return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
  }

  // 构造纹理位移目标
  function texture(x, y) {
    return { type: 't', x, y };
  }

  // 生成唯一 ID，用于 SVG Filter 命名
  function generateId() {
    return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
  }

  // Shader 主类
  class Shader {
    constructor(options = {}) {
      this.width = options.width || 100;
      this.height = options.height || 100;
      this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
      this.canvasDPI = 1;
      this.id = generateId();
      this.offset = 10; // 与视口边缘的间距

      this.mouse = { x: 0, y: 0 };
      this.mouseUsed = false;

      this.createElement(); // 创建 DOM 元素
      this.setupEventListeners(); // 设置事件
      this.updateShader(); // 首次绘制 shader
    }

    // 创建 SVG 滤镜 + DOM 容器
    createElement() {
      // 容器 div
      this.container = document.createElement('div');
      this.container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${this.width}px;
        height: ${this.height}px;
        overflow: hidden;
        border-radius: 150px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15);
        cursor: grab;
        backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
        z-index: 9999;
        pointer-events: auto;
      `;

      // SVG 滤镜容器
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('width', '0');
      this.svg.setAttribute('height', '0');
      this.svg.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9998;
      `;

      // SVG filter
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', `${this.id}_filter`);

      // feImage：使用 canvas 的像素图作为位移源
      this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
      this.feImage.setAttribute('id', `${this.id}_map`);
      this.feImage.setAttribute('width', this.width.toString());
      this.feImage.setAttribute('height', this.height.toString());

      // feDisplacementMap：SVG 的核心位移滤镜
      this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
      this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
      this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
      this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
      this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

      filter.appendChild(this.feImage);
      filter.appendChild(this.feDisplacementMap);
      defs.appendChild(filter);
      this.svg.appendChild(defs);

      // 隐藏 canvas，用作 feImage 的位图输入
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width * this.canvasDPI;
      this.canvas.height = this.height * this.canvasDPI;
      this.canvas.style.display = 'none';

      this.context = this.canvas.getContext('2d');
    }

    // 限制拖动位置不超出视口边界
    constrainPosition(x, y) {
      const minX = this.offset;
      const maxX = window.innerWidth - this.width - this.offset;
      const minY = this.offset;
      const maxY = window.innerHeight - this.height - this.offset;

      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      };
    }

    // 拖动、鼠标跟随等事件设置
    setupEventListeners() {
      let isDragging = false;
      let startX, startY, initialX, initialY;

      this.container.addEventListener('mousedown', (e) => {
        isDragging = true;
        this.container.style.cursor = 'grabbing';
        startX = e.clientX;
        startY = e.clientY;
        const rect = this.container.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          const newX = initialX + deltaX;
          const newY = initialY + deltaY;
          const constrained = this.constrainPosition(newX, newY);
          this.container.style.left = constrained.x + 'px';
          this.container.style.top = constrained.y + 'px';
          this.container.style.transform = 'none';
        }

        const rect = this.container.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) / rect.width;
        this.mouse.y = (e.clientY - rect.top) / rect.height;

        if (this.mouseUsed) this.updateShader();
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        this.container.style.cursor = 'grab';
      });

      window.addEventListener('resize', () => {
        const rect = this.container.getBoundingClientRect();
        const constrained = this.constrainPosition(rect.left, rect.top);
        this.container.style.left = constrained.x + 'px';
        this.container.style.top = constrained.y + 'px';
      });
    }

    // 每次更新 shader（用于重新生成 displacement 图像）
    updateShader() {
      const mouseProxy = new Proxy(this.mouse, {
        get: (target, prop) => {
          this.mouseUsed = true;
          return target[prop];
        }
      });

      this.mouseUsed = false;
      const w = this.width * this.canvasDPI;
      const h = this.height * this.canvasDPI;
      const data = new Uint8ClampedArray(w * h * 4);
      const rawValues = [];
      let maxScale = 0;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % w;
        const y = Math.floor(i / 4 / w);
        const pos = this.fragment({ x: x / w, y: y / h }, mouseProxy);
        const dx = pos.x * w - x;
        const dy = pos.y * h - y;
        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
        rawValues.push(dx, dy);
      }

      maxScale *= 0.5;

      let index = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = rawValues[index++] / maxScale + 0.5;
        const g = rawValues[index++] / maxScale + 0.5;
        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }

      this.context.putImageData(new ImageData(data, w, h), 0, 0);
      this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
      this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
    }

    appendTo(parent) {
      parent.appendChild(this.svg);
      parent.appendChild(this.container);
    }

    destroy() {
      this.svg.remove();
      this.container.remove();
      this.canvas.remove();
    }
  }

  // 启动 Liquid Glass 效果
  function createLiquidGlass() {
    const shader = new Shader({
      width: 300,
      height: 200,
      fragment: (uv, mouse) => {
        const ix = uv.x - 0.5;
        const iy = uv.y - 0.5;
        const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
        const scaled = smoothStep(0, 1, displacement);
        return texture(ix * scaled + 0.5, iy * scaled + 0.5);
      }
    });

    shader.appendTo(document.body);
    console.log('液态玻璃效果已创建，点击并拖动可交互。');

    window.liquidGlass = shader;
  }

  createLiquidGlass();
})();
```

### 🧠 液态玻璃实现核心技术

1.  **SVG 滤镜系统**：

    *   使用 `feDisplacementMap` 创建位移扭曲效果。
    *   位移图（Displacement Map）通过 RGB 通道影响 X/Y 坐标偏移。

2.  **Canvas 动态生成位移贴图**：

    *   使用 `<canvas>` 绘制图像数据，再用 `canvas.toDataURL()` 作为 `<feImage>` 的输入源。
    *   每帧通过 `fragment shader` 模拟计算位移映射关系。

3.  **Signed Distance Function (SDF)** ：

    *   用 SDF 描述矩形形状，并计算其边缘“软边缘”边界。

4.  **Mouse Proxy & 用户交互**：

    *   鼠标位移会触发 shader 更新，生成流体式玻璃位移动画。

5.  **性能控制与约束**：

    *   使用 DPI 缩放进行抗锯齿控制。
    *   限制容器拖动位置在视口内，避免遮挡。

### 🎮 最终视觉效果

该实现能达到以下视觉体验：

*   🫧 鼠标拖动时玻璃变形、回弹、折射背景
*   🎨 图像像素级偏移而非纯粹模糊
*   📸 可任意嵌入任意网页而不破坏布局
*   🧊 高度模块化，可随时销毁/重建

![2.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c473473bfa1b4853bf85d456645eba14~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Zuo5aSc5a-75pm05aSp:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTk0MzU5MjI4ODM5MTQ5NiJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1750421265&x-orig-sign=KkoVNAL6D4avNnsoIJ%2BHp8XfxGA%3D)

## 完整代码演示

<https://github.com/you-want/liquid-glass>

## 未来趋势与启示

Liquid Glass 所代表的，不仅是视觉上的新奇，更是人机交互走向更自然、更物理化的一个节点。它启示我们：

*   UI 设计可以 **模拟真实材料质感与物理规律**
*   **SVG + Canvas + CSS 滤镜** 在现代浏览器已足以实现复杂渲染
*   更富表现力的交互往往源于对底层图形 API 的深度理解

## 小结

Liquid Glass 让用户的每一次触碰不再是「点击」而是「扰动」。这是 Apple 带给 UI 世界的一次灵感革新。而我们作为前端开发者，正站在一个最好的时代 —— 可以用浏览器做到过去只有原生 GPU 能实现的视觉奇迹。

**后续我们前端页面设计会不会也流行起来？？? 苹果相关的设计开发会先执行起来...**

## 参考资料

1.  <https://developer.apple.com/documentation/technologyoverviews/liquid-glass>
2.  <https://github.com/you-want/liquid-glass>
3.  <https://github.com/shuding/liquid-glass>
4.  <https://github.com/kevinbism/liquid-glass-effect>
