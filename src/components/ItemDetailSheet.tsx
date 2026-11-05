import { useEffect, useState } from 'react'
import type { Item } from '../data/types'
import { dowOf, parse } from '../lib/dates'
import { allDayProgress, itemContext, itemStatus, METRIC_FIELD, TEXT_VALUE } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { AllDayControl } from './AllDayGoals'
import { CategoryDot } from './CategoryDot'
import { FocusTimer } from './FocusTimer'
import { GroceryList } from './GroceryList'
import { WeeklyReview } from './WeeklyReview'
import { PhotoCapture } from './Photos'
import { PoopLogger } from './PoopLogger'
import { StatusTag } from './TaskRow'
import { Button } from './ui/button'
import { Sheet } from './ui/sheet'

const shortDate = (d: string) => parse(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-b-2 border-soft py-3 first:pt-0 last:border-b-0">
      <h3 className="cap m-0 mb-1 text-muted">{label}</h3>
      <div className="text-[15px]">{children}</div>
    </section>
  )
}

/** Spec §1 item detail panel: Why / What it fixes / How / Tip / Your context / Skip · Mark done. */
export function ItemDetailSheet({ item, date, onClose }: { item: Item | null; date: string; onClose: () => void }) {
  const log = useLog()
  const [text, setText] = useState('')
  const check = item ? log.checks[date]?.[item.code] : undefined
  useEffect(() => { setText(check?.value ?? '') }, [item?.code, date, check?.value])
  if (!item) return <Sheet open={false} onOpenChange={() => {}} title="">{null}</Sheet>

  const status = itemStatus(item, date, log.now, log, log.ctx)
  const ctx = itemContext(item, date, log, log.ctx)
  const isAllDay = item.section === 'allday'
  const metric = METRIC_FIELD[item.code]
  const note = item.dayNotes?.[dowOf(date)]
  const m = log.metrics[date] ?? {}

  const done = () => log.setCheck(date, item.code, { status: 'done', value: text || check?.value })
  const footer = isAllDay ? undefined : status === 'done' ? (
    <Button className="flex-1" onClick={() => log.setCheck(date, item.code, null)}>Undo done</Button>
  ) : (
    <>
      {status === 'skipped'
        ? <Button className="flex-1" onClick={() => log.setCheck(date, item.code, null)}>Undo skip</Button>
        : <Button className="flex-1" onClick={() => { log.setCheck(date, item.code, { status: 'skipped' }); onClose() }}>Skip</Button>}
      <Button variant="solid" className="flex-1" onClick={() => { done(); onClose() }}>Mark done</Button>
    </>
  )

  return (
    <Sheet
      open
      onOpenChange={o => !o && onClose()}
      title={item.title}
      subtitle={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoryDot category={item.category} />
          <span className="cap">{item.time}</span>
          <StatusTag status={status} />
        </div>
      }
      footer={footer}
    >
      <Block label="Why today">{item.detail.why}</Block>
      <Block label="What it fixes">{item.detail.fixes}</Block>
      <Block label="How to do it">
        {item.detail.how}
        {note && <p className="m-0 mt-2 border-l-4 border-yellow pl-2 font-bold">{note}</p>}
      </Block>
      <Block label="Tip">{item.detail.tip}</Block>

      {item.code === 'FOCUS' && <Block label="Focus check-in"><FocusTimer date={date} /></Block>}
      {item.code === 'REVIEW' && <Block label="This week"><WeeklyReview date={date} /></Block>}
      {item.code === 'PHOTO' && <Block label="Today's photos"><PhotoCapture date={date} /></Block>}
      {item.code === 'GROCERY' && <Block label="Shopping"><GroceryList date={date} /></Block>}
      {isAllDay && (
        <Block label="Today's target"><AllDayControl item={item} date={date} /></Block>
      )}
      {item.code === 'POOP' && <Block label="Log today"><PoopLogger date={date} /></Block>}
      {metric && (
        <Block label="Log today">
          <label className="flex items-center gap-2">
            <input
              type="number" inputMode="decimal" step={metric.step} min={0} aria-label={`${item.title} (${metric.unit})`}
              value={m[metric.key] as number | undefined ?? ''}
              onChange={e => {
                const v = e.target.value === '' ? undefined : Number(e.target.value)
                log.setMetric(date, metric.key, v as never)
                log.setCheck(date, item.code, v == null ? null : { status: 'done', value: `${v} ${metric.unit}` })
              }}
              className="w-28 border-2 border-ink bg-card px-2 py-1.5 font-mono text-ink"
            />
            <span className="cap">{metric.unit}</span>
          </label>
        </Block>
      )}
      {TEXT_VALUE.has(item.code) && (
        <Block label="Log today">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (text) done() }}>
            <input
              value={text} onChange={e => setText(e.target.value)}
              placeholder={item.code === 'BLOOD' ? 'HbA1c 5.4, Vit D 28…' : 'squat 12 kg x 12, push-up 10…'}
              aria-label={`Log for ${item.title}`}
              className="min-w-0 flex-1 border-2 border-ink bg-card px-2 py-1.5 font-mono text-sm text-ink"
            />
            <Button type="submit" disabled={!text}>Save</Button>
          </form>
        </Block>
      )}

      <Block label="Your context">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          <li>
            <b>{ctx.weekDone} of {ctx.weekDue}</b> {ctx.weekDue === 1 ? 'time' : 'times'} done this week
          </li>
          <li>Streak: <b>{ctx.streak}</b> {ctx.streak === 1 ? 'day' : 'days'} {ctx.streak >= 3 ? '🔥' : ''}</li>
          {ctx.last && <li>Last time ({shortDate(ctx.last.date)}): <b>{ctx.last.value}</b></li>}
          {isAllDay && <li>Today: <b>{allDayProgress(item, date, m, log.ctx).label}</b></li>}
        </ul>
      </Block>
    </Sheet>
  )
}
