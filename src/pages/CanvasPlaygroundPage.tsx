import { useEffect, useRef, useState } from 'react'
import './CanvasPlaygroundPage.css'

const MAX_DPR = 2

function CanvasPlaygroundPage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [canvasKey, setCanvasKey] = useState(0)
  const refresh = () => {
    // navigate('/canvas', {replace: true})
    setCanvasKey(canvasKey + 1)
    console.log('refresh', canvasKey)
  }
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const paint = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, MAX_DPR)
      const rect = wrap.getBoundingClientRect()
      const cssW = Math.max(1, Math.round(rect.width))
      const cssH = Math.max(1, Math.round(rect.height))

      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)

      const theme = getComputedStyle(wrap)
      const codeBg = theme.getPropertyValue('--code-bg').trim() || '#f4f3ec'
      const border = theme.getPropertyValue('--border').trim() || '#e5e4e7'

      ctx.fillStyle = codeBg
      ctx.fillRect(0, 0, cssW, cssH)

      ctx.strokeStyle = border
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, cssW - 1, cssH - 1)



      ctx.fillStyle = 'red'
      ctx.arc(100, 100, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = 'blue'
      ctx.arc(200, 200, 20, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.fillStyle = 'yellow'
      ctx.arc(300, 300, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#dc2626'
      ctx.fillRect(12, 12, 40, 40)
      console.log('paint')
    }


    paint()

  
  }, [])

  return (
    <main className="svg-playground">
      <header className="svg-playground-header">
        <h1 className="svg-playground-title">Canvas 示例</h1>
        <p className="canvas-playground-lead">
          使用 <code>ResizeObserver</code> 在容器尺寸变化时重设位图大小，并按 <code>devicePixelRatio</code>{' '}
          放大画布，使绘制坐标仍以 CSS 像素为单位。effect 的 cleanup 会 <code>disconnect</code>{' '}
          观察器，因此在 React Strict Mode 下开发环境 effect 执行两次时，不会留下重复的订阅。
        </p>
        <button onClick={refresh}>Refresh</button>
      </header>

      <div ref={wrapRef} className="canvas-demo-stage" key={canvasKey}>
        <canvas ref={canvasRef} />
      </div>

      <p className="canvas-demo-note">
        拖动窗口宽度可看到文案中的 CSS 尺寸变化；位图宽高约为 CSS 尺寸 × dpr（上限 {MAX_DPR}）。
      </p>
    </main>
  )
}

export default CanvasPlaygroundPage
