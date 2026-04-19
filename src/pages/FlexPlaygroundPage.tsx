import type { ReactNode } from 'react'
import './FlexPlaygroundPage.css'

type DemoBlockProps = {
  title: string
  description?: string
  code: string
  children: ReactNode
}

function DemoBlock({ title, description, code, children }: DemoBlockProps) {
  return (
    <section className="flex-demo-section">
      <h2>{title}</h2>
      {description ? <p className="flex-demo-desc">{description}</p> : null}
      <pre className="flex-demo-code">
        <code>{code.trim()}</code>
      </pre>
      <div className="flex-demo-frame">{children}</div>
    </section>
  )
}

function Item({ label, className }: { label: string; className?: string }) {
  return <span className={['flex-demo-item', className].filter(Boolean).join(' ')}>{label}</span>
}

function FlexPlaygroundPage() {
  return (
    <main className="flex-playground">
      <header className="flex-playground-header">
        <h1 className="flex-playground-title">CSS Flex 用法展示</h1>
        <p className="flex-playground-lead">
          下面每个区块都配有可运行的示例与对应的关键样式，便于对照理解 flex 容器与 flex 子项的常见属性。
        </p>
      </header>

      <DemoBlock
        title="容器基础：display 与 gap"
        description="在父元素上开启 flex，并用 gap 控制主轴方向的间距。"
        code={`.row {\n  display: flex;\n  gap: 12px;\n}`}
      >
        <div className="flex-demo-row flex-demo-row--basic">
          <Item label="1" />
          <Item label="2" />
          <Item label="3" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="flex-direction"
        description="决定主轴方向；column 时主轴为纵向。"
        code={`.col {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}`}
      >
        <div className="flex-demo-row flex-demo-row--column">
          <Item label="A" />
          <Item label="B" />
          <Item label="C" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="justify-content（主轴对齐）"
        description="在主轴上分配剩余空间；下方四行样式仅 justify-content 不同。"
        code={`.row {\n  display: flex;\n  justify-content: space-between;\n}`}
      >
        <div className="flex-demo-stack">
          <div className="flex-demo-row flex-demo-row--jc flex-demo-row--jc-start">
            <Item label="1" />
            <Item label="2" />
            <Item label="3" />
          </div>
          <div className="flex-demo-row flex-demo-row--jc flex-demo-row--jc-center">
            <Item label="1" />
            <Item label="2" />
            <Item label="3" />
          </div>
          <div className="flex-demo-row flex-demo-row--jc flex-demo-row--jc-between">
            <Item label="1" />
            <Item label="2" />
            <Item label="3" />
          </div>
          <div className="flex-demo-row flex-demo-row--jc flex-demo-row--jc-evenly">
            <Item label="1" />
            <Item label="2" />
            <Item label="3" />
          </div>
        </div>
        <p className="flex-demo-caption">依次：flex-start · center · space-between · space-evenly</p>
      </DemoBlock>

      <DemoBlock
        title="align-items（交叉轴对齐）"
        description="子项在交叉轴上的默认对齐方式；容器需有明确交叉轴尺寸才看得出 stretch 以外差异。"
        code={`.row {\n  display: flex;\n  align-items: center;\n  min-height: 88px;\n}`}
      >
        <div className="flex-demo-row flex-demo-row--ai flex-demo-row--ai-center">
          <Item label="短" />
          <Item label="更高" className="flex-demo-item--tall" />
          <Item label="短" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="flex-wrap 与 align-content"
        description="换行后，align-content 管理多根主轴线在交叉轴上的分布（需 flex-wrap: wrap）。"
        code={`.wrap {\n  display: flex;\n  flex-wrap: wrap;\n  align-content: space-between;\n  gap: 8px;\n  height: 120px;\n}`}
      >
        <div className="flex-demo-row flex-demo-row--wrap">
          <Item label="1" />
          <Item label="2" />
          <Item label="3" />
          <Item label="4" />
          <Item label="5" />
          <Item label="6" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="子项：flex 缩写"
        description="flex 是 flex-grow、flex-shrink、flex-basis 的缩写；常用 flex: 1 表示可伸展且基准为 0。"
        code={`.side { flex: 0 0 120px; }\n.main { flex: 1 1 auto; }`}
      >
        <div className="flex-demo-row flex-demo-row--flex123">
          <Item label="固定侧栏" className="flex-demo-item--sidebar" />
          <Item label="自适应主区域" className="flex-demo-item--main" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="order 与 align-self"
        description="order 改变视觉顺序；align-self 覆盖单个子项在交叉轴上的对齐。"
        code={`.b { order: -1; }\n.tall { align-self: flex-end; }`}
      >
        <div className="flex-demo-row flex-demo-row--order">
          <Item label="A" />
          <Item label="B（order:-1）" className="flex-demo-item--order" />
          <Item label="C" />
          <Item label="self-end" className="flex-demo-item--self-end" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="常见模式：顶栏布局"
        description="左侧一组链接，右侧操作区：justify-content: space-between + 子项内部再 flex。"
        code={`.bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}`}
      >
        <div className="flex-demo-bar">
          <div className="flex-demo-bar-left">
            <span className="flex-demo-pill">首页</span>
            <span className="flex-demo-pill">文档</span>
            <span className="flex-demo-pill">设置</span>
          </div>
          <div className="flex-demo-bar-right">
            <span className="flex-demo-pill flex-demo-pill--ghost">搜索</span>
            <span className="flex-demo-pill flex-demo-pill--accent">登录</span>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="常见模式：水平垂直居中"
        description="单轴居中用 justify-content + align-items；子项为块级时仍可被当作 flex item。"
        code={`.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 140px;\n}`}
      >
        <div className="flex-demo-row flex-demo-row--center-box">
          <div className="flex-demo-card">居中卡片</div>
        </div>
      </DemoBlock>
    </main>
  )
}

export default FlexPlaygroundPage
