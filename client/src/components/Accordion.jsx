import { useId, useState } from 'react'

// Single-open accordion. items: [{ title, body }]
export default function Accordion({ items, defaultOpen = 0, size = 'md' }) {
  const [open, setOpen] = useState(defaultOpen)
  const baseId = useId()
  const titleClass = size === 'lg' ? 'text-[17px] font-medium' : 'text-base font-bold'

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i
        const panelId = `${baseId}-panel-${i}`
        return (
          <div key={item.title} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={`flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left ${titleClass}`}
              >
                {item.title}
                <span aria-hidden="true" className="text-xl leading-none">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            <div id={panelId} hidden={!isOpen} className="pb-5 text-[15px] leading-relaxed text-muted">
              {item.body}
            </div>
          </div>
        )
      })}
    </div>
  )
}
