import type { ReactNode } from 'react'
import './SvgPlaygroundPage.css'

type DemoBlockProps = {
  title: string
  description?: string
  code: string
  children: ReactNode
}

function DemoBlock({ title, description, code, children }: DemoBlockProps) {
  return (
    <section className="svg-demo-section">
      <h2>{title}</h2>
      {description ? <p className="svg-demo-desc">{description}</p> : null}
      <pre className="svg-demo-code">
        <code>{code.trim()}</code>
      </pre>
      <div className="svg-demo-frame">{children}</div>
    </section>
  )
}

function SvgPlaygroundPage() {
  return (
    <main className="svg-playground">
      <header className="svg-playground-header">
        <h1 className="svg-playground-title">SVG 常见用法示例</h1>
        <p className="svg-playground-lead">
          矢量图可缩放、体积小，适合图标、图表与简单插画。下列示例均为内联 SVG，可直接对照属性在页面中实验。
        </p>
      </header>

      <DemoBlock
        title="坐标系与 viewBox"
        description="viewBox=&quot;minX minY width height&quot; 定义用户坐标系；配合 width/height 实现任意缩放不失真。"
        code={`<svg width="200" height="80" viewBox="0 0 200 80">\n  <rect x="0" y="0" width="200" height="80" />\n</svg>`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 200 80" width="100%" height="80" aria-hidden>
          <rect className="svg-demo-grid-bg" x="100" y="0" width="200" height="80" rx="6" >123</rect>
          <text x="100" y="44" textAnchor="middle" className="svg-demo-label">
            200×80 用户单位
          </text>
        </svg>
      </DemoBlock>

      <DemoBlock
        title="基础图形"
        description="rect、circle、ellipse、line、polyline、polygon 是最常用的几何元素。"
        code={`<circle cx="40" cy="40" r="28" />\n<polyline points="10,60 30,40 50,55 70,25" fill="none" />`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 280 100" width="100%" height="100" aria-hidden>
          <rect x="8" y="18" width="56" height="40" rx="6" className="svg-demo-shape-a" />
          <circle cx="108" cy="48" r="26" className="svg-demo-shape-b" />
          <ellipse cx="188" cy="48" rx="20" ry="22" className="svg-demo-shape-c" />
          <line x1="238" y1="28" x2="268" y2="68" className="svg-demo-line" />
          <polyline
            points="20,88 40,72 72,88 104,62 136,88"
            fill="none"
            className="svg-demo-poly"
          />
        </svg>
      </DemoBlock>

      <DemoBlock
        title="描边与填充"
        description="fill 控制内部；stroke、stroke-width、stroke-linecap、stroke-linejoin 控制轮廓线表现。"
        code={`stroke="currentColor"\nstroke-width="4"\nstroke-linecap="round"\nstroke-linejoin="round"`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 240 90" width="100%" height="90" aria-hidden>
          <path
            d="M 20 70 L 60 20 L 100 70 Z"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
            strokeLinejoin="miter"
            className="svg-demo-stroke-cap"
          />
          <path
            d="M 130 70 L 170 20 L 210 70"
            fill="none"
            stroke="var(--text-h)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </DemoBlock>

      <DemoBlock
        title="linearGradient 与 radialGradient"
        description="在 defs 中定义渐变，通过 fill=&quot;url(#id)&quot; 引用。"
        code={`<defs>\n  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\n    <stop offset="0%" stop-color="#7c3aed" />\n    <stop offset="100%" stop-color="#22d3ee" />\n  </linearGradient>\n</defs>\n<rect fill="url(#g)" ... />`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 260 90" width="100%" height="90" aria-hidden>
          <defs>
            <linearGradient id="svg-demo-lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <radialGradient id="svg-demo-rg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
          </defs>
          <rect x="10" y="15" width="110" height="60" rx="10" fill="url(#svg-demo-lg)" />
          <circle cx="195" cy="45" r="32" fill="url(#svg-demo-rg)" />
        </svg>
      </DemoBlock>

      <DemoBlock
        title="path 与常用命令"
        description="M 移动、L 直线、Q 二次贝塞尔、Z 闭合。大写为绝对坐标，小写为相对。"
        code={`d="M 10 80 Q 52 10 95 80 T 180 80"`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 200 90" width="100%" height="90" aria-hidden>
          <path
            d="M 10 80 Q 52 10 95 80 T 180 80"
            fill="none"
            stroke="var(--text-h)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="10" cy="80" r="4" fill="#7c3aed" />
          <circle cx="95" cy="80" r="4" fill="#7c3aed" />
          <circle cx="180" cy="80" r="4" fill="#7c3aed" />
        </svg>
      </DemoBlock>

      <DemoBlock
        title="transform 组合"
        description="translate / rotate / scale 可写在 transform 属性中，从右到左依次应用（与矩阵乘法顺序一致）。"
        code={`<g transform="translate(60,45) rotate(-15) scale(1.1)">...</g>`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 200 90" width="100%" height="90" aria-hidden>
          <g transform="translate(100,45) rotate(-15) scale(1.15)">
            <rect x="-40" y="-22" width="80" height="44" rx="8" className="svg-demo-shape-a" />
            <text textAnchor="middle" y="6" className="svg-demo-label">
              group
            </text>
          </g>
        </svg>
      </DemoBlock>

      <DemoBlock
        title="symbol + use 复用"
        description="将图形放在 symbol 中，用 use 的 href 引用，适合图标系统。"
        code={`<symbol id="icon-check" viewBox="0 0 24 24">...</symbol>\n<use href="#icon-check" width="32" height="32" />`}
      >
        <svg className="svg-demo-canvas svg-demo-canvas--reuse" viewBox="0 0 220 64" width="100%" height="64" aria-hidden>
          <defs>
            <symbol id="svg-demo-check" viewBox="0 0 24 24">
              <path
                d="M5 12l5 5L20 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </symbol>
          </defs>
          <g transform="translate(36,32)" className="svg-demo-use-g">
            <use href="#svg-demo-check" width="28" height="28" x="-14" y="-14" />
          </g>
          <g transform="translate(110,32)" className="svg-demo-use-g svg-demo-use-g--accent">
            <use href="#svg-demo-check" width="36" height="36" x="-18" y="-18" />
          </g>
          <g transform="translate(184,32)" className="svg-demo-use-g svg-demo-use-g--muted">
            <use href="#svg-demo-check" width="44" height="44" x="-22" y="-22" />
          </g>
        </svg>
      </DemoBlock>

      <DemoBlock
        title="clipPath 裁剪"
        description="用 clipPath 限制可见区域，可做圆角头像、遮罩动画等。"
        code={`<defs>\n  <clipPath id="c"><circle cx="50" cy="50" r="40" /></clipPath>\n</defs>\n<rect clip-path="url(#c)" ... />`}
      >
        <svg className="svg-demo-canvas" viewBox="0 0 200 100" width="100%" height="100" aria-hidden>
          <defs>
            <linearGradient id="svg-demo-clip-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <clipPath id="svg-demo-clip-circle">
              <circle cx="100" cy="50" r="38" />
            </clipPath>
          </defs>
          <rect x="0" y="0" width="200" height="100" fill="var(--code-bg)" />
          <rect
            x="30"
            y="10"
            width="140"
            height="80"
            fill="url(#svg-demo-clip-fill)"
            clipPath="url(#svg-demo-clip-circle)"
          />
        </svg>
      </DemoBlock>

      <DemoBlock
        title="text 与 currentColor"
        description="SVG 内文字可用 text；color 会作为 currentColor 传给子元素，便于与 CSS 主题一致。"
        code={`<text x="0" y="20" fill="currentColor">标题</text>`}
      >
        <svg className="svg-demo-canvas svg-demo-canvas--text" viewBox="0 0 260 56" width="100%" height="56" aria-hidden>
          <text x="0" y="22" className="svg-demo-text-title">
            SVG 文本
          </text>
          <text x="0" y="46" className="svg-demo-text-sub">
            currentColor 随父级 color 变化
          </text>
        </svg>
      </DemoBlock>

      <DemoBlock
        title="用 CSS 驱动简单动画"
        description="对 SVG 元素写普通 CSS：例如旋转、描边偏移。复杂路径动画可配合 JS 或 GSAP。"
        code={`@keyframes spin { to { transform: rotate(360deg); } }\n.svg-loader { animation: spin 1.2s linear infinite; transform-origin: 50% 50%; }`}
      >
        <div className="svg-demo-anim-row">
          <svg className="svg-demo-loader" viewBox="0 0 48 48" width="48" height="48" aria-label="加载动画">
            <title>加载</title>
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke="var(--border)"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="90"
              strokeDashoffset="24"
              className="svg-demo-loader-arc"
            />
          </svg>
        </div>
      </DemoBlock>
    </main>
  )
}

export default SvgPlaygroundPage
