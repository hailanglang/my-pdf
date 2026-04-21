import { useMemo, useState } from 'react'
import './ComplexObjectDemoPage.css'
import { ObjectTreeNode, Panel, StructuredCards} from './JsonView'
import type { JsonValue, Contact } from '../../types/complexObject'
import { isPlainObject, SAMPLE } from '../../utils/complexObj'


function ObjectTree({ data }: { data: JsonValue }) {
  console.log('ObjectTree',{data})
  return (
    <div className="object-tree">
      <ObjectTreeNode name={null} value={data} defaultOpen />
    </div>
  )
}

function ComplexObjectDemoPage() {
  const [record, setRecord] = useState<JsonValue>(SAMPLE)
  const jsonText = useMemo(() => JSON.stringify(record, null, 2), [record])

  const handleEdit = ({id, contact}: {id: string, contact: Contact}) => {
    setRecord(prev => ({...prev,
       contacts: prev.contacts.map((c) => c.id === id ? contact : c)}))
  }
  return (
    <main className="complex-object-page">
      <header className="complex-object-header">
        <h1 className="complex-object-title">复杂对象渲染</h1>
        <p className="complex-object-lead">
          同一份嵌套数据可以用多种方式呈现：左侧为可折叠的递归树（适合调试与浏览结构），右侧为按业务字段拆分的卡片视图；下方保留原始
          JSON 便于对照。
        </p>
      </header>

      <div className="complex-object-grid">
        <Panel title="递归树" description="数组与对象可展开/折叠，叶子节点显示类型着色后的标量。">
          <ObjectTree data={record} />
        </Panel>
        <Panel title="结构化卡片" description="手写映射：把嵌套字段渲染成标题、键值对与列表，而非通用树。">
          <StructuredCards data={record} onEdit={handleEdit} />
        </Panel>
      </div>

      <section className="complex-object-panel" style={{ marginTop: 22 }}>
        <div className="complex-object-panel-head">
          <h2>原始 JSON</h2>
          <p>序列化结果，用于与上方两种视图的字段一一对应。</p>
        </div>
        <div className="complex-object-panel-body">
          <pre className="complex-object-json">{jsonText}</pre>
        </div>
      </section>
    </main>
  )
}

export default ComplexObjectDemoPage
