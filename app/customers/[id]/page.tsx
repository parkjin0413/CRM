import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomers, attachBusinessCardUrls } from '@/lib/customers/actions'
import { getContactLogs } from '@/lib/customers/contact-log-actions'
import { formatPhone } from '@/lib/customers/phone'
import { AppHeader } from '@/components/app-header'
import { SourceTag } from '@/components/source-tag'
import { FavoriteToggle } from '@/components/favorite-toggle'
import { DeleteCustomerButton } from '@/components/delete-customer-button'
import { ContactLogSection } from '@/components/contact-log-section'

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customers = await getCustomers()
  const customer = customers.find((c) => c.id === id)
  if (!customer) notFound()
  const [[withCard], logs] = await Promise.all([attachBusinessCardUrls([customer]), getContactLogs(customer.id)])

  return (
    <main className="mx-auto max-w-2xl p-6">
      <AppHeader
        title={customer.name}
        actions={
          <>
            <FavoriteToggle id={customer.id} initialValue={customer.isFavorite} />
            <Link href={`/customers/${customer.id}/edit`} className="btn-secondary">
              수정
            </Link>
            <DeleteCustomerButton id={customer.id} />
          </>
        }
      />

      <div className="card flex flex-col gap-5 p-6">
        <SourceTag value={customer.source} />

        {withCard.businessCardUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withCard.businessCardUrl}
            alt={`${customer.name} 명함`}
            className="max-w-full rounded-md border border-line object-contain sm:max-w-xs"
          />
        )}

        <dl className="grid grid-cols-[5rem_1fr] gap-y-2.5 text-sm">
          <dt className="text-ink-muted">소속</dt>
          <dd>{customer.company}</dd>

          <dt className="text-ink-muted">연락처</dt>
          <dd>
            <a href={`tel:${customer.phoneNormalized}`} className="btn-link font-mono">
              {formatPhone(customer.phoneNormalized)}
            </a>
          </dd>

          {customer.email && (
            <>
              <dt className="text-ink-muted">이메일</dt>
              <dd>
                <a href={`mailto:${customer.email}`} className="btn-link break-all">
                  {customer.email}
                </a>
              </dd>
            </>
          )}

          {customer.memo && (
            <>
              <dt className="text-ink-muted">메모</dt>
              <dd className="whitespace-pre-wrap">{customer.memo}</dd>
            </>
          )}

          <dt className="text-ink-muted">등록일</dt>
          <dd className="font-mono text-[13px] text-ink-muted">{formatDateTime(customer.createdAt)}</dd>

          <dt className="text-ink-muted">수정일</dt>
          <dd className="font-mono text-[13px] text-ink-muted">{formatDateTime(customer.updatedAt)}</dd>
        </dl>
      </div>

      <div className="mt-4">
        <ContactLogSection customerId={customer.id} initialLogs={logs} />
      </div>

      <Link href="/" className="btn-link mt-4 inline-block text-sm">
        ← 목록으로
      </Link>
    </main>
  )
}
