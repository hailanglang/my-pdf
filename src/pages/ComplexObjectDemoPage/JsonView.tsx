import { isPlainObject } from '../../utils/complexObj'
import type { JsonValue, JsonPrimitive, Contact } from '../../types/complexObject'
import { useState, useMemo, type ReactNode, Fragment, useEffect } from 'react'

function previewLabel(value: JsonValue): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return `Array(${value.length})`
    if (isPlainObject(value)) return `Object(${Object.keys(value).length})`
    return String(value)
}

function PrimitiveView({ value }: { value: JsonPrimitive }) {
    if (value === null) return <span className="object-tree-null">null</span>
    if (typeof value === 'boolean')
        return <span className="object-tree-boolean">{value ? 'true' : 'false'}</span>
    if (typeof value === 'number') return <span className="object-tree-number">{value}</span>
    return <span className="object-tree-string">&quot;{value}&quot;</span>
}


export function Panel({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <section className="complex-object-panel">
            <div className="complex-object-panel-head">
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
            <div className="complex-object-panel-body">{children}</div>
        </section>
    )
}

export function ObjectTreeNode({
    name,
    value,
    defaultOpen = true,
}: {
    name: string | null
    value: JsonValue
    defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    const expandable = Array.isArray(value) || isPlainObject(value)
    const childKeys = useMemo(() => {
        if (Array.isArray(value)) return value.map((_, i) => String(i))
        if (isPlainObject(value)) return Object.keys(value)
        return []
    }, [value])

    return (
        <div className="object-tree-node">
            <div className="object-tree-row">
                <button
                    type="button"
                    className="object-tree-toggle"
                    aria-expanded={expandable ? open : undefined}
                    onClick={() => expandable && setOpen((v) => !v)}
                    disabled={!expandable}
                    aria-label={expandable ? (open ? '折叠' : '展开') : undefined}
                >
                    {expandable ? (open ? '−' : '+') : '·'}
                </button>
                {name !== null ? (
                    <>
                        <span className="object-tree-key">{name}</span>
                        <span className="object-tree-colon">:</span>
                    </>
                ) : null}
                {!expandable ? (
                    <span className="object-tree-primitive">
                        <PrimitiveView value={value as JsonPrimitive} />
                    </span>
                ) : !open ? (
                    <span className="object-tree-preview">{previewLabel(value)}</span>
                ) : Array.isArray(value) ? (
                    <span className="object-tree-preview">[</span>
                ) : (
                    <span className="object-tree-preview">{'{'}</span>
                )}
            </div>
            {expandable && open ? (
                <div className="object-tree-children">
                    {childKeys.map((key) => (
                        <ObjectTreeNode
                            key={key}
                            name={key}
                            value={
                                Array.isArray(value)
                                    ? (value[Number(key)] as JsonValue)
                                    : (value as Record<string, JsonValue>)[key]!
                            }
                            defaultOpen={false}
                        />
                    ))}
                    <div className="object-tree-row">
                        <button type="button" className="object-tree-toggle" disabled aria-hidden>
                            ·
                        </button>
                        <span className="object-tree-preview">{Array.isArray(value) ? ']' : '}'}</span>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export function StructuredCards({ data, onEdit }: { data: JsonValue, onEdit: ({ id, contact }: { id: string, contact: Contact }) => void }) {
    const stats = isPlainObject(data.stats) ? data.stats : null
    const tags = Array.isArray(data.tags) ? (data.tags as JsonPrimitive[]).filter((t) => typeof t === 'string') : []
    const contacts = Array.isArray(data.contacts) ? data.contacts : []
    const metadata = isPlainObject(data.metadata) ? data.metadata : null
    const [isEditings, setIsEditing] = useState<Record<string, boolean>>({})
    const [editedContacts, setEditedContacts] = useState<Contact | null>(null)

    console.log({ data })
    useEffect(() => {
        const editing = Object.fromEntries(contacts.map((c) => [c.id, false]))
        console.log(editing)
        setIsEditing(editing)
    }, [data])

    const handleChange = (value: string) => {
        const contact = JSON.parse(value) as Contact
        setEditedContacts(contact)
    }
    const handleEdit = (contact: Contact) => {
        const isEditing = isEditings[contact.id]
        if (!isEditing) setEditedContacts(contact)
        else {
            console.log('save')
            console.log({ editedContacts, contact })
            onEdit({ id: contact.id, contact: editedContacts })
            // setIsEditing((prev) => ({ ...prev, [contact.id]: !isEditing }))
        }
        setIsEditing((prev) => ({ ...prev, [contact.id]: !isEditing }))

    }

    return (
        <article className="object-card-root">
            <h2 className="object-card-title">{typeof data.name === 'string' ? data.name : '未命名'}</h2>
            <p className="object-card-meta">
                ID：<strong>{typeof data.id === 'string' ? data.id : '—'}</strong>
                {typeof data.active === 'boolean' ? (
                    <>
                        {' '}
                        · 状态：<strong>{data.active ? '启用' : '停用'}</strong>
                    </>
                ) : null}
            </p>

            {stats ? (
                <section className="object-card-section">
                    <h3>统计</h3>
                    <dl className="object-card-kv">
                        {Object.entries(stats).map(([k, v]) => (
                            <Fragment key={k}>
                                <dt>{k}</dt>
                                <dd>{typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}</dd>
                            </Fragment>
                        ))}
                    </dl>
                </section>
            ) : null}

            {tags.length > 0 ? (
                <section className="object-card-section">
                    <h3>标签</h3>
                    <div className="object-card-tags">
                        {tags.map((t) => (
                            <span key={t} className="object-card-tag">
                                {t}
                            </span>
                        ))}
                    </div>
                </section>
            ) : null}

            {contacts.length > 0 ? (
                <section className="object-card-section">
                    <h3>联系人</h3>
                    <ul className="object-card-list">
                        {contacts.map((c: Contact, i) => {
                            if (!isPlainObject(c)) return <li key={i}>（无效项）</li>
                            const prefs = isPlainObject(c.prefs) ? c.prefs : null
                            return (
                                <li key={c.id} style={{ position: 'relative' }}>
                                    <button onClick={() => handleEdit(c)}
                                        style={{ position: 'absolute', left: '8px' }}>{isEditings[c.id] ? '保存' : '编辑'}</button>
                                    {isEditings[c.id] ? (
                                        <textarea
                                            style={{ width: '60%', height: '100%' }}
                                            onChange={(e) => handleChange(e.target.value)}
                                            value={JSON.stringify(editedContacts)} />
                                    ) : <div className="object-card-nested">
                                        <div className="object-card-nested-title">
                                            {typeof c.role === 'string' ? c.role : '角色未知'}
                                        </div>
                                        <dl className="object-card-kv">
                                            <dt>email</dt>
                                            <dd>{typeof c.email === 'string' ? c.email : '—'}</dd>
                                            {prefs ? (
                                                <>
                                                    <dt>prefs</dt>
                                                    <dd>{JSON.stringify(prefs)}</dd>
                                                </>
                                            ) : null}
                                        </dl>
                                    </div>}

                                </li>
                            )
                        })}
                    </ul>
                </section>
            ) : null}

            {metadata ? (
                <section className="object-card-section">
                    <h3>元数据</h3>
                    <dl className="object-card-kv">
                        {Object.entries(metadata).map(([k, v]) => (
                            <Fragment key={k}>
                                <dt>{k}</dt>
                                <dd>{typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}</dd>
                            </Fragment>
                        ))}
                    </dl>
                </section>
            ) : null}
        </article>
    )
}
