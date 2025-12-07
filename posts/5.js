window.loadPost({
    id: 5,
    title: "交互式3D土星",
    date: "2025-12-07",
    category: "Web & Graphics",
    summary: "这是一个基于 Three.js 和 MediaPipe 打造的实时3D粒子系统。通过手势识别控制土星环的聚合与扩散。",
    content: `
## Saturn Aeternum - 永恒土星

这是一个融合了 **WebGL (Three.js)** 图形技术与 **MediaPipe** 计算机视觉技术的实验性项目。

### 核心特性
- **25,000+ 粒子模拟**: 使用大量 GPU 实例渲染的土星环，每一颗粒子都遵循开普勒定律运行。
- **手势引力控制**: 
    - **张开手掌 (Zoom)**: 摄像机推进，感受近距离的混沌美学。
    - **捏合手指 (Shrink)**: 摄像机拉远，观察宏观的稳定轨道。
- **混沌物理引擎**: 当观测距离过近时，粒子会受到布朗运动和高频噪声的影响，打破原有的规律，呈现出“不知庐山真面目”的混沌感。
- **大气光学渲染**: 使用自定义 Shader 模拟星球大气层的散射效果。

<div style="text-align: center; margin: 40px 0;">
    <a href="particles.html" class="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 no-underline">
        🚀 启动沉浸体验
    </a>
    <p class="text-sm text-gray-500 mt-2">提示：需要摄像头权限 • 推荐使用电脑端体验</p>
</div>

### 技术实现
为了在网页端实现数万粒子的流畅渲染，我们放弃了传统的 Sprite 对象，转而在 \`BufferGeometry\` 层面直接操作顶点数据。混沌效果的触发并非简单的贴图替换，而是基于观察者距离对粒子速度向量场进行的实时扰动。

\`\`\`javascript
// 核心物理逻辑简化
if (distance < chaosThreshold) {
    // 混沌模式：叠加高频噪声
    position.add(noiseVector.multiplyScalar(chaosFactor));
} else {
    // 稳定模式：遵循引力轨道
    angle += Math.sqrt(G / radius) * delta;
}
\`\`\`
    `
});
