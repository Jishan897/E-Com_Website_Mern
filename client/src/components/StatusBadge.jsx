import { ORDER_STATUS_LABELS } from '../utils/format'

const STYLES = {
  placed: 'bg-concrete text-ink',
  confirmed: 'bg-[#E6EEFF] text-[#1D3F8F]',
  packed: 'bg-[#FFF1D6] text-[#7A4A00]',
  shipped: 'bg-[#E6EEFF] text-[#1D3F8F]',
  delivered: 'bg-[#E3F4E8] text-ok',
  cancelled: 'bg-[#FBEAE9] text-sale',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${STYLES[status] ?? STYLES.placed}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  )
}
