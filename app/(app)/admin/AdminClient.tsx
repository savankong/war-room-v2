'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Pagination from '@/app/components/Pagination';

/* ── Combobox — free-text input with dropdown of existing values ──── */
function Combobox({ value, onChange, options, placeholder, className }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; className?: string;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(q)).slice(0, 40);
  }, [options, query]);

  function select(v: string) { onChange(v); setQuery(v); setOpen(false); }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        className={className ?? 'adm-input'}
        value={query}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && (filtered.length > 0 || (query && !options.includes(query))) && (
        <div className="adm-combo-drop">
          {filtered.map(o => (
            <button key={o} className="adm-combo-item" onMouseDown={() => select(o)}>{o}</button>
          ))}
          {query && !options.includes(query) && (
            <button className="adm-combo-item adm-combo-new" onMouseDown={() => select(query)}>
              + Add &quot;{query}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function roleColor(role: string) { return role === 'admin' ? '#7c3aed' : role === 'viewer' ? '#6b7280' : '#2563B8'; }
function SortTh({ field, label, sort, onSort, style }: {
  field: string; label: string;
  sort: { field: string; dir: 'asc' | 'desc' } | null;
  onSort: (f: string) => void;
  style?: React.CSSProperties;
}) {
  const active = sort?.field === field;
  return (
    <th style={style} className={`adm-sort-th${active ? ' active' : ''}`} onClick={() => onSort(field)}>
      {label}
      <span className="adm-sort-icon">
        {active ? (sort!.dir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
      </span>
    </th>
  );
}

function fmtMoney(v: string | number | null) {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  if (!n || isNaN(n)) return '—';
  if (n>=1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n>=1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n>=1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

type Tab = 'orgs' | 'contacts' | 'contracts' | 'ind-companies' | 'ind-people' | 'ind-subs' | 'ind-signals' | 'users';
const SIGNAL_TYPES = ['Opportunity','Award','Budget'];
const SOURCES      = ['sam_gov','usaspending','manual'];
const BRANCHES     = ['Army','Navy','Air Force','Marine Corps','Space Force','OSD','Joint','DHS','Other'];
const PER_PAGE = 50;

interface Props {
  orgs: any[];
  contacts: any[];
  contracts: any[];
  stats: { orgCount: number; contactCount: number; contractCount: number; activeOrgs: number };
}

/* ── Delete confirmation ─────────────────────────────────────────── */
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm(): void; onCancel(): void }) {
  return (
    <div className="adm-modal-bg" onClick={onCancel}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-title">Delete "{name}"?</div>
        <div className="adm-modal-body">This action cannot be undone.</div>
        <div className="adm-modal-actions">
          <button className="adm-btn ghost" onClick={onCancel}>Cancel</button>
          <button className="adm-btn danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── OrgPicker ────────────────────────────────────────────────────── */
function OrgPicker({ value, onChange, orgs }: { value: string; onChange(v: string): void; orgs: any[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = orgs.find(o => o.id === value);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return orgs.slice(0, 30);
    const lq = q.toLowerCase();
    return orgs.filter(o => o.name?.toLowerCase().includes(lq)).slice(0, 30);
  }, [orgs, q]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="adm-input"
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => { setOpen(o => !o); setQ(''); }}
      >
        <span style={{ color: selected ? 'var(--ink)' : 'var(--ink-3)' }}>
          {selected ? selected.name : '— None —'}
        </span>
        <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>▾</span>
      </div>
      {open && (
        <div className="adm-picker-drop">
          <input
            className="adm-input" autoFocus
            placeholder="Search org…"
            value={q} onChange={e => setQ(e.target.value)}
            style={{ margin: '6px 8px', width: 'calc(100% - 16px)' }}
          />
          <div className="adm-picker-opt" onClick={() => { onChange(''); setOpen(false); }}>— None —</div>
          {filtered.map(o => (
            <div
              key={o.id}
              className={'adm-picker-opt' + (o.id === value ? ' on' : '')}
              onClick={() => { onChange(o.id); setOpen(false); }}
            >
              <div style={{ fontWeight: 500, fontSize: 13 }}>{o.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{o.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PhotoField ───────────────────────────────────────────────────── */
function PhotoField({ value, onChange, shape = 'circle', label = 'Photo URL' }: {
  value: string; onChange(v: string): void; shape?: 'circle' | 'square'; label?: string;
}) {
  return (
    <div className="adm-fg">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {value ? (
          <img
            src={value} alt=""
            style={{
              width: 48, height: 48, objectFit: 'cover', flexShrink: 0,
              borderRadius: shape === 'circle' ? '50%' : 6,
              border: '1px solid var(--card-border)',
            }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: 48, height: 48, flexShrink: 0, borderRadius: shape === 'circle' ? '50%' : 6,
            background: 'var(--canvas)', border: '1px dashed var(--card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--ink-3)',
          }}>📷</div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            className="adm-input"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder="https://…"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{ alignSelf: 'flex-start', fontSize: 11, color: 'var(--red, #c8502d)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >✕ Remove photo</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── EditPanel (gov orgs, contacts, contracts) ───────────────────── */
function EditPanel({
  type, item, orgs, isNew,
  onClose, onSave, onDelete,
  opts = {},
}: {
  type: Tab; item: any; orgs: any[]; isNew: boolean;
  onClose(): void; onSave(data: any): void; onDelete(): void;
  opts?: Record<string, string[]>;
}) {
  const [form, setForm] = useState<Record<string,any>>({ ...item });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const apiType = type === 'contracts' ? 'signals' : type;
    const url = isNew ? `/api/admin/${apiType}` : `/api/admin/${apiType}/${item.id}`;
    const res = await fetch(url, { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      onSave({ ...form, id: isNew ? json.id : item.id });
    } else {
      alert('Save failed: ' + (await res.text()));
    }
  }

  const typeLabel = type === 'orgs' ? 'Organization' : type === 'contacts' ? 'Person' : 'Signal';

  return (
    <div className="adm-panel-bg" onClick={onClose}>
      <div className="adm-panel" onClick={e => e.stopPropagation()}>
        <div className="adm-panel-hd">
          <div>
            <div className="adm-panel-type">{isNew ? `New ${typeLabel}` : `Edit ${typeLabel}`}</div>
            <div className="adm-panel-name">{form.name || form.full_name || form.title || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isNew && <button className="adm-btn danger sm" onClick={onDelete}>Delete</button>}
            <button className="adm-panel-x" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="adm-panel-body">

          {/* ── ORG FIELDS ── */}
          {type === 'orgs' && <>
            <div className="adm-fg">
              <label>Sector</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => set('organization_type', form._prev_gov_type ?? 'command')}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6, border: '1.5px solid',
                    borderColor: form.organization_type !== 'sbir_company' ? 'var(--teal)' : 'var(--border)',
                    background: form.organization_type !== 'sbir_company' ? 'color-mix(in srgb, var(--teal) 12%, transparent)' : 'none',
                    color: form.organization_type !== 'sbir_company' ? 'var(--teal)' : 'var(--ink-3)',
                    fontFamily: 'IBM Plex Mono', fontSize: 11, fontWeight: 700, letterSpacing: '1px', cursor: 'pointer',
                  }}
                >GOVERNMENT</button>
                <button
                  type="button"
                  onClick={() => { set('_prev_gov_type', form.organization_type !== 'sbir_company' ? (form.organization_type ?? 'command') : form._prev_gov_type); set('organization_type', 'sbir_company'); }}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6, border: '1.5px solid',
                    borderColor: form.organization_type === 'sbir_company' ? '#c8502d' : 'var(--border)',
                    background: form.organization_type === 'sbir_company' ? 'color-mix(in srgb, #c8502d 12%, transparent)' : 'none',
                    color: form.organization_type === 'sbir_company' ? '#c8502d' : 'var(--ink-3)',
                    fontFamily: 'IBM Plex Mono', fontSize: 11, fontWeight: 700, letterSpacing: '1px', cursor: 'pointer',
                  }}
                >INDUSTRY</button>
              </div>
            </div>
            <div className="adm-fg">
              <label>Full Name *</label>
              <input className="adm-input" value={form.name ?? ''} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Air Force Materiel Command" />
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Abbreviation</label>
                <input className="adm-input" value={form.abbreviation ?? ''} onChange={e => set('abbreviation', e.target.value)} placeholder="AFMC" />
              </div>
              <div className="adm-fg">
                <label>Branch</label>
                <select className="adm-input" value={form.branch ?? ''} onChange={e => set('branch', e.target.value)}>
                  <option value="">— None —</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Organization Type</label>
                <Combobox value={form.organization_type ?? form.type ?? ''} onChange={v => set('organization_type', v)} options={opts.org_types ?? []} placeholder="Command, Agency…" />
              </div>
              <div className="adm-fg">
                <label>Hierarchy Level</label>
                <input className="adm-input" type="number" min={0} max={5} value={form.abs_hierarchy_level ?? ''} onChange={e => set('abs_hierarchy_level', e.target.value ? Number(e.target.value) : null)} placeholder="0–5" />
              </div>
            </div>
            <div className="adm-fg">
              <label>Parent Organization</label>
              <OrgPicker value={form.parent_id ?? ''} onChange={v => set('parent_id', v || null)} orgs={orgs} />
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Location</label>
                <Combobox value={form.loc ?? ''} onChange={v => set('loc', v)} options={opts.locations ?? []} placeholder="City, State" />
              </div>
              <div className="adm-fg">
                <label>Website</label>
                <input className="adm-input" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="adm-fg">
              <label>Description</label>
              <textarea className="adm-input" rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="adm-fg">
              <label>Active</label>
              <label className="adm-toggle">
                <input type="checkbox" checked={form.is_active ?? true} onChange={e => set('is_active', e.target.checked)} />
                <span className="adm-toggle-track"><span className="adm-toggle-thumb" /></span>
                <span>{form.is_active ?? true ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </>}

          {/* ── CONTACT FIELDS ── */}
          {type === 'contacts' && <>
            <PhotoField value={form.photo_url ?? ''} onChange={v => set('photo_url', v)} />
            <div className="adm-fg">
              <label>Full Name *</label>
              <input className="adm-input" value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="First Last" />
            </div>
            <div className="adm-fg">
              <label>Title / Role</label>
              <Combobox value={form.title ?? ''} onChange={v => set('title', v)} options={opts.titles ?? []} placeholder="Commanding Officer, Program Manager…" />
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Gov Organization</label>
                <OrgPicker value={form.org_id ?? ''} onChange={v => set('org_id', v || null)} orgs={orgs} />
              </div>
              <div className="adm-fg">
                <label>Industry Company</label>
                <Combobox value={form.org_full ?? ''} onChange={v => set('org_full', v)} options={opts.companies ?? []} placeholder="LOCKHEED MARTIN CORPORATION" />
              </div>
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Email</label>
                <input className="adm-input" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="name@company.com" />
              </div>
              <div className="adm-fg">
                <label>Phone</label>
                <input className="adm-input" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>LinkedIn URL</label>
                <input className="adm-input" value={form.linkedin ?? ''} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
              </div>
              <div className="adm-fg">
                <label>Seniority Tier (lower = more senior)</label>
                <input className="adm-input" type="number" value={form.hierarchy_order ?? ''} onChange={e => set('hierarchy_order', e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>
            <div className="adm-fg">
              <label>Tags (comma-separated)</label>
              <Combobox
                value={Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags ?? '')}
                onChange={v => set('tags', v)}
                options={opts.tags ?? []}
                placeholder="INDUSTRY, cyber, acquisition"
              />
            </div>
            <div className="adm-fg">
              <label>Shared Mailbox / Inbox Only</label>
              <label className="adm-toggle">
                <input type="checkbox" checked={form.is_inbox ?? false} onChange={e => set('is_inbox', e.target.checked)} />
                <span className="adm-toggle-track"><span className="adm-toggle-thumb" /></span>
                <span style={{ color: form.is_inbox ? 'var(--amber)' : 'var(--ink-3)' }}>
                  {form.is_inbox ? 'Inbox Only' : 'Real Person'}
                </span>
              </label>
            </div>
          </>}

          {/* ── CONTRACT/SIGNAL FIELDS ── */}
          {type === 'contracts' && <>
            <div className="adm-fg">
              <label>Title *</label>
              <input className="adm-input" value={form.title ?? ''} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Signal Type</label>
                <select className="adm-input" value={form.signal_type ?? ''} onChange={e => set('signal_type', e.target.value)}>
                  <option value="">— None —</option>
                  {SIGNAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="adm-fg">
                <label>Source</label>
                <select className="adm-input" value={form.source ?? ''} onChange={e => set('source', e.target.value)}>
                  <option value="">— None —</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Value / Ceiling ($)</label>
                <input className="adm-input" type="number" value={form.value ?? ''} onChange={e => set('value', e.target.value)} />
              </div>
              <div className="adm-fg">
                <label>Award Amount ($)</label>
                <input className="adm-input" type="number" value={form.award_amt ?? ''} onChange={e => set('award_amt', e.target.value)} />
              </div>
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Award Date</label>
                <input className="adm-input" type="date" value={form.award_date ? String(form.award_date).slice(0,10) : ''} onChange={e => set('award_date', e.target.value)} />
              </div>
              <div className="adm-fg">
                <label>Response Deadline</label>
                <input className="adm-input" type="date" value={form.deadline ?? ''} onChange={e => set('deadline', e.target.value)} />
              </div>
            </div>
            <div className="adm-fg">
              <label>Awarding Organization</label>
              <OrgPicker value={form.org_id ?? ''} onChange={v => set('org_id', v || null)} orgs={orgs} />
            </div>
            <div className="adm-fg">
              <label>Recipient Company</label>
              <Combobox value={form.recipient ?? ''} onChange={v => set('recipient', v)} options={opts.recipients ?? []} placeholder="LOCKHEED MARTIN CORPORATION" />
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>POC Name</label>
                <input className="adm-input" value={form.poc ?? ''} onChange={e => set('poc', e.target.value)} />
              </div>
              <div className="adm-fg">
                <label>POC Email</label>
                <input className="adm-input" type="email" value={form.poc_email ?? ''} onChange={e => set('poc_email', e.target.value)} />
              </div>
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Set-Aside</label>
                <Combobox value={form.set_aside ?? ''} onChange={v => set('set_aside', v)} options={opts.set_asides ?? []} placeholder="SDVOSB, 8(a)…" />
              </div>
              <div className="adm-fg">
                <label>NAICS Code</label>
                <Combobox value={form.naics ?? ''} onChange={v => set('naics', v)} options={opts.naics ?? []} placeholder="541330, 336411…" />
              </div>
            </div>
            <div className="adm-fg">
              <label>Description</label>
              <textarea className="adm-input" rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
            </div>
          </>}
        </div>

        <div className="adm-panel-foot">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : (isNew ? 'Create' : 'Save changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CompanyEditPanel ─────────────────────────────────────────────── */
function CompanyEditPanel({ item, isNew, onClose, onSave, onDelete }: {
  item: any; isNew: boolean;
  onClose(): void; onSave(data: any): void; onDelete(): void;
}) {
  const [form, setForm] = useState<Record<string, any>>({ ...item });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const url = isNew ? '/api/admin/industry-companies' : `/api/admin/industry-companies/${item.id}`;
    const res = await fetch(url, { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      onSave({ ...form, id: isNew ? json.id : item.id });
    } else {
      alert('Save failed: ' + (await res.text()));
    }
  }

  return (
    <div className="adm-panel-bg" onClick={onClose}>
      <div className="adm-panel" onClick={e => e.stopPropagation()}>
        <div className="adm-panel-hd">
          <div>
            <div className="adm-panel-type">{isNew ? 'New Company' : 'Edit Company'}</div>
            <div className="adm-panel-name">{form.name || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isNew && <button className="adm-btn danger sm" onClick={onDelete}>Delete</button>}
            <button className="adm-panel-x" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="adm-panel-body">
          <PhotoField value={form.logo_url ?? ''} onChange={v => set('logo_url', v)} shape="square" label="Logo URL" />
          <div className="adm-fg">
            <label>Display Name *</label>
            <input className="adm-input" value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Lockheed Martin" />
          </div>
          <div className="adm-fg">
            <label>Legal Name (matches contracts recipient)</label>
            <input className="adm-input" value={form.legal_name ?? ''} onChange={e => set('legal_name', e.target.value)} placeholder="LOCKHEED MARTIN CORPORATION" />
          </div>
          <div className="adm-fg2">
            <div className="adm-fg">
              <label>Ticker</label>
              <input className="adm-input" value={form.ticker ?? ''} onChange={e => set('ticker', e.target.value)} placeholder="LMT" />
            </div>
            <div className="adm-fg">
              <label>Founded</label>
              <input className="adm-input" value={form.founded ?? ''} onChange={e => set('founded', e.target.value)} placeholder="1995" />
            </div>
          </div>
          <div className="adm-fg2">
            <div className="adm-fg">
              <label>Headquarters</label>
              <input className="adm-input" value={form.headquarters ?? ''} onChange={e => set('headquarters', e.target.value)} placeholder="Bethesda, MD" />
            </div>
            <div className="adm-fg">
              <label>Employees</label>
              <input className="adm-input" value={form.employees ?? ''} onChange={e => set('employees', e.target.value)} placeholder="114,000" />
            </div>
          </div>
          <div className="adm-fg">
            <label>Website</label>
            <input className="adm-input" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://www.lockheedmartin.com" />
          </div>
          <div className="adm-fg">
            <label>Description</label>
            <textarea className="adm-input" rows={4} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
        <div className="adm-panel-foot">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : (isNew ? 'Create' : 'Save changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SubCompanyEditPanel ──────────────────────────────────────────── */
function SubCompanyEditPanel({ item, isNew, onClose, onSave, onDelete, allSubs }: {
  item: any; isNew: boolean; allSubs: any[];
  onClose(): void; onSave(data: any): void; onDelete(): void;
}) {
  const [form, setForm] = useState<Record<string, any>>({ ...item });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const url = isNew ? '/api/admin/sub-companies' : `/api/admin/sub-companies/${item.id}`;
    const res = await fetch(url, { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      onSave({ ...form, id: isNew ? json.id : item.id });
    } else {
      alert('Save failed: ' + (await res.text()));
    }
  }

  return (
    <div className="adm-panel-bg" onClick={onClose}>
      <div className="adm-panel" onClick={e => e.stopPropagation()}>
        <div className="adm-panel-hd">
          <div>
            <div className="adm-panel-type">{isNew ? 'New Subcontractor' : 'Edit Subcontractor'}</div>
            <div className="adm-panel-name">{form.name || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isNew && <button className="adm-btn danger sm" onClick={onDelete}>Delete</button>}
            <button className="adm-panel-x" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="adm-panel-body">
          <PhotoField value={form.logo_url ?? ''} onChange={v => set('logo_url', v)} shape="square" label="Logo URL" />
          <div className="adm-fg">
            <label>Display Name *</label>
            <input className="adm-input" value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="General Atomics" />
          </div>
          <div className="adm-fg">
            <label>Legal Name (matches sub_awards.sub_name)</label>
            {isNew ? (
              <select className="adm-input" value={form.legal_name ?? ''} onChange={e => {
                const v = e.target.value;
                set('legal_name', v);
                if (!form.name) set('name', v.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()).replace(/\bLlc\b/g,'LLC').replace(/\bInc\b/g,'Inc.').replace(/\bCorp\b/g,'Corp.'));
              }}>
                <option value="">— pick a sub from awards data —</option>
                {allSubs.map((s: any) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            ) : (
              <input className="adm-input" value={form.legal_name ?? ''} onChange={e => set('legal_name', e.target.value)} placeholder="GENERAL ATOMICS AERONAUTICAL SYSTEMS INC." />
            )}
          </div>
          <div className="adm-fg2">
            <div className="adm-fg">
              <label>Headquarters</label>
              <input className="adm-input" value={form.headquarters ?? ''} onChange={e => set('headquarters', e.target.value)} placeholder="San Diego, CA" />
            </div>
            <div className="adm-fg">
              <label>Website</label>
              <input className="adm-input" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://www.ga.com" />
            </div>
          </div>
          <div className="adm-fg">
            <label>Description</label>
            <textarea className="adm-input" rows={4} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
        <div className="adm-panel-foot">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" onClick={save} disabled={saving || (!form.name?.trim() || !form.legal_name?.trim())}>
            {saving ? 'Saving…' : (isNew ? 'Create' : 'Save changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Industry data hook ───────────────────────────────────────────── */
function useIndustryData() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [contractAgg, setContractAgg] = useState<Record<string, any>>({});
  const [people, setPeople] = useState<any[]>([]);
  const [subCompanies, setSubCompanies] = useState<any[]>([]);
  const [allSubAwards, setAllSubAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p: Promise<any>) => p.catch(() => []);
    Promise.all([
      safe(fetch('/api/admin/industry-companies').then(r => r.json())),
      safe(fetch('/api/industry').then(r => r.json())),
      safe(fetch('/api/admin/industry-people').then(r => r.json())),
      safe(fetch('/api/admin/sub-companies').then(r => r.json())),
      safe(fetch('/api/industry/subs').then(r => r.json())),
    ]).then(([comp, agg, ppl, subs, subsAgg]) => {
      setCompanies(Array.isArray(comp) ? comp : []);
      const map: Record<string, any> = {};
      if (Array.isArray(agg)) agg.forEach((a: any) => { map[a.name] = a; });
      setContractAgg(map);
      setPeople(Array.isArray(ppl) ? ppl : []);
      setSubCompanies(Array.isArray(subs) ? subs : []);
      setAllSubAwards(Array.isArray(subsAgg) ? subsAgg : []);
      setLoading(false);
    });
  }, []);

  return { companies, setCompanies, contractAgg, people, setPeople, subCompanies, setSubCompanies, allSubAwards, loading };
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function AdminClient({ orgs, contacts, contracts, stats }: Props) {
  const [tab, setTab]       = useState<Tab>('orgs');
  const [search, setSearch] = useState('');

  /* Gov filters */
  const [noOrgFilter,  setNoOrgFilter]  = useState(false);
  const [inboxFilter,  setInboxFilter]  = useState(false);
  const [branchFilter, setBranchFilter] = useState('All');

  /* Industry people filters */
  const [indTierFilter,    setIndTierFilter]    = useState('All');
  const [indCompanyFilter, setIndCompanyFilter] = useState('All');

  /* Pagination */
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [tab, search, noOrgFilter, inboxFilter, branchFilter, indTierFilter, indCompanyFilter]);

  /* Sorting */
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null);
  useEffect(() => setSort(null), [tab]);
  function toggleSort(field: string) {
    setSort(s => s?.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' });
    setPage(1);
  }
  function sortList<T>(list: T[]): T[] {
    if (!sort) return list;
    return [...list].sort((a: any, b: any) => {
      let av = a[sort.field] ?? '';
      let bv = b[sort.field] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /* Edit / Add / Delete state */
  const [editItem,     setEditItem]     = useState<any | null>(null);
  const [editType,     setEditType]     = useState<Tab>('orgs');
  const [isNew,        setIsNew]        = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; id: string; name: string } | null>(null);

  /* Industry edit state */
  const [editCompany,    setEditCompany]    = useState<any | null>(null);
  const [isNewCompany,   setIsNewCompany]   = useState(false);
  const [deleteCompany,  setDeleteCompany]  = useState<{ id: string; name: string } | null>(null);

  /* Sub-company edit state */
  const [editSubCo,     setEditSubCo]     = useState<any | null>(null);
  const [isNewSubCo,    setIsNewSubCo]    = useState(false);
  const [deleteSubCo,   setDeleteSubCo]   = useState<{ id: string; name: string } | null>(null);

  /* Local mutable copies (optimistic updates) */
  const [localOrgs,      setLocalOrgs]      = useState(orgs);
  const [localContacts,  setLocalContacts]  = useState(contacts);
  const [localContracts, setLocalContracts] = useState(contracts);

  /* Industry data */
  const { companies, setCompanies, contractAgg, people, setPeople, subCompanies, setSubCompanies, allSubAwards, loading: indLoading } = useIndustryData();

  /* Platform users */
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers).catch(() => {});
  }, []);
  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) setUsers(u => u.filter(x => x.id !== id));
  }

  /* USASpending sync */
  const [syncRunning, setSyncRunning]   = useState(false);
  const [syncPage,    setSyncPage]      = useState(0);
  const [syncTotal,   setSyncTotal]     = useState(0);
  const [syncDone,    setSyncDone]      = useState(false);
  const [syncError,   setSyncError]     = useState<string | null>(null);
  const syncAbort = useRef(false);

  async function startSync() {
    syncAbort.current = false;
    setSyncRunning(true); setSyncDone(false); setSyncError(null);
    setSyncPage(0); setSyncTotal(0);

    const base = '/api/sync-usaspending?token=warroom-seed-2026&startDate=2023-01-01&endDate=2026-06-15';
    let url = base + '&page=1';

    while (url && !syncAbort.current) {
      try {
        const res = await fetch(url);
        if (!res.ok) { setSyncError(`HTTP ${res.status}`); break; }
        const d = await res.json();
        if (d.error) { setSyncError(d.error); break; }
        setSyncPage(p => p + 1);
        setSyncTotal(t => t + (d.inserted ?? 0));
        if (!d.hasNext || !d.nextUrl) { setSyncDone(true); break; }
        url = d.nextUrl;
        await new Promise(r => setTimeout(r, 300)); // small delay between pages
      } catch (e: any) {
        setSyncError(e.message ?? 'Network error');
        break;
      }
    }
    setSyncRunning(false);
  }

  /* Branches for org filter */
  const branches = useMemo(() =>
    ['All', ...Array.from(new Set(localOrgs.map((o:any) => o.branch).filter(Boolean))).sort()],
    [localOrgs]
  );

  /* Filtered lists — gov people excludes INDUSTRY-tagged contacts */
  const filteredOrgs = useMemo(() => localOrgs.filter((o: any) => {
    const q = search.toLowerCase();
    return (!q || o.name?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q))
        && (branchFilter === 'All' || o.branch === branchFilter);
  }), [localOrgs, search, branchFilter]);

  const filteredContacts = useMemo(() => localContacts.filter((c: any) => {
    if (Array.isArray(c.tags) ? c.tags.includes('INDUSTRY') : false) return false;
    if (c.org_type === 'sbir_company') return false;
    const q = search.toLowerCase();
    return (!q || c.name?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q) || c.org_full?.toLowerCase().includes(q))
        && (!noOrgFilter || !c.org_id)
        && (!inboxFilter || c.is_inbox);
  }), [localContacts, search, noOrgFilter, inboxFilter]);

  const filteredContracts = useMemo(() => localContracts.filter((c: any) => {
    const q = search.toLowerCase();
    return !q || c.title?.toLowerCase().includes(q) || c.recipient?.toLowerCase().includes(q);
  }), [localContracts, search]);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => c.name?.toLowerCase().includes(q) || c.legal_name?.toLowerCase().includes(q));
  }, [companies, search]);

  const indTierOptions = useMemo(() => {
    const tiers = new Set<number>();
    people.forEach((p: any) => { if (p.hierarchy_order != null) tiers.add(p.hierarchy_order); });
    return ['All', ...[...tiers].sort((a, b) => a - b).map(String)];
  }, [people]);

  const indCompanyOptions = useMemo(() => {
    const cos = new Set<string>();
    people.forEach((p: any) => { if (p.org_full) cos.add(p.org_full); });
    return ['All', ...[...cos].sort()];
  }, [people]);

  const filteredPeople = useMemo(() => {
    let list = people as any[];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.org_full?.toLowerCase().includes(q)
      );
    }
    if (indTierFilter !== 'All') list = list.filter(p => String(p.hierarchy_order) === indTierFilter);
    if (indCompanyFilter !== 'All') list = list.filter(p => p.org_full === indCompanyFilter);
    return list;
  }, [people, search, indTierFilter, indCompanyFilter]);

  const filteredSubCompanies = useMemo(() => {
    if (!search.trim()) return subCompanies;
    const q = search.toLowerCase();
    return subCompanies.filter(s => s.name?.toLowerCase().includes(q) || s.legal_name?.toLowerCase().includes(q));
  }, [subCompanies, search]);

  /* Paged lists — sorted then paged */
  const pagedOrgs         = sortList(filteredOrgs).slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedContacts     = sortList(filteredContacts).slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedContracts    = sortList(filteredContracts).slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedCompanies    = sortList(filteredCompanies).slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedPeople       = sortList(filteredPeople).slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedSubCompanies = sortList(filteredSubCompanies).slice((page-1)*PER_PAGE, page*PER_PAGE);
  const sortedUsers       = sortList(users);

  /* Gov open-edit helpers */
  function openEdit(type: Tab, item: any) { setEditType(type); setEditItem(item); setIsNew(false); }
  function openAdd(type: Tab) { setEditType(type); setEditItem({}); setIsNew(true); }

  /* Gov save */
  function handleSave(updated: any) {
    if (editType === 'orgs') setLocalOrgs(prev => isNew ? [updated, ...prev] : prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    else if (editType === 'contacts') setLocalContacts(prev => isNew ? [updated, ...prev] : prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    else if (editType === 'contracts') setLocalContracts(prev => isNew ? [updated, ...prev] : prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    setEditItem(null);
  }

  /* Gov delete */
  async function handleDelete() {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const url = `/api/admin/${type === 'contracts' ? 'signals' : type}/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      if (type === 'orgs')      setLocalOrgs(p => p.filter(o => o.id !== id));
      if (type === 'contacts')  setLocalContacts(p => p.filter(c => c.id !== id));
      if (type === 'contracts') setLocalContracts(p => p.filter(c => c.id !== id));
    }
    setDeleteTarget(null);
    setEditItem(null);
  }

  function navItem(key: Tab, label: string, count: number | null, color: string) {
    return (
      <button
        key={key}
        className={`adm-nav-item${tab === key ? ' active' : ''}`}
        onClick={() => { setTab(key); setSearch(''); setNoOrgFilter(false); setInboxFilter(false); }}
      >
        <span className="adm-nav-dot" style={{ background: color }} />
        <span className="adm-nav-label">{label}</span>
        {count != null && <span className="adm-nav-count">{Number(count).toLocaleString()}</span>}
      </button>
    );
  }

  const govContactCount = localContacts.filter((c: any) => {
    if (Array.isArray(c.tags) ? c.tags.includes('INDUSTRY') : false) return false;
    if (c.org_type === 'sbir_company') return false;
    return true;
  }).length;

  return (
    <div className="adm-layout">

      {/* ── Left nav ── */}
      <div className="adm-nav">
        <div className="adm-nav-hdr">
          <Link href="/" className="adm-nav-back">← War Room</Link>
          <div className="adm-nav-title">Admin</div>
        </div>

        <div className="adm-nav-section">GOVERNMENT</div>
        {navItem('orgs',      'Organizations',    stats.orgCount,    'var(--navy)')}
        {navItem('contacts',  'People',           govContactCount,   'var(--teal)')}
        {navItem('contracts', 'Contracts',        stats.contractCount, 'var(--amber)')}

        <div className="adm-nav-section" style={{ marginTop: 16 }}>INDUSTRY</div>
        {navItem('ind-companies', 'Companies',      companies.length,    '#7c4dbc')}
        {navItem('ind-people',    'People',         people.length,       '#c8502d')}
        {navItem('ind-signals',   'Signals',        stats.contractCount, '#e67e22')}
        {navItem('ind-subs',      'Subcontractors', subCompanies.length, '#1d6b8a')}

        <div className="adm-nav-section" style={{ marginTop: 16 }}>PLATFORM</div>
        {navItem('users', 'Users', users.length, '#2563B8')}

        <div className="adm-nav-section" style={{ marginTop: 24 }}>SYNC</div>
        <div style={{ padding: '8px 16px 12px' }}>
          {!syncRunning ? (
            <button className="adm-export-btn primary" style={{ display:'block', width:'100%', textAlign:'center', marginBottom: 6 }} onClick={startSync}>
              ↻ Sync USASpending
            </button>
          ) : (
            <button className="adm-export-btn primary" style={{ display:'block', width:'100%', textAlign:'center', marginBottom: 6, color:'#B71C1C', borderColor:'#B71C1C' }}
              onClick={() => { syncAbort.current = true; }}>
              ■ Stop Sync
            </button>
          )}
          {(syncRunning || syncTotal > 0 || syncDone || syncError) && (
            <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: 'var(--ink-3)', lineHeight: 1.6 }}>
              {syncRunning && <div style={{ color: 'var(--teal)' }}>● Running · page {syncPage}</div>}
              {syncDone   && <div style={{ color: 'var(--teal)' }}>✓ Complete</div>}
              {syncError  && <div style={{ color: '#B71C1C' }}>✗ {syncError}</div>}
              {syncTotal > 0 && <div>{syncTotal.toLocaleString()} contracts synced</div>}
            </div>
          )}
        </div>

        <div className="adm-nav-section" style={{ marginTop: 8 }}>EXPORTS</div>
        {(['orgs','contacts','contracts'] as const).map(t => (
          <a key={t} href={`/api/admin/export?type=${t}`} download className="adm-export-btn">
            ↓ Export {t === 'orgs' ? 'Orgs' : t === 'contacts' ? 'Contacts' : 'Contracts'} CSV
          </a>
        ))}
      </div>

      {/* ── Main ── */}
      <div className="adm-main">

        {/* ── GOV TABS ── */}
        {(tab === 'orgs' || tab === 'contacts' || tab === 'contracts') && (
          <>
            <div className="adm-toolbar">
              <input
                className="adm-search"
                placeholder={`Search ${tab}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {tab === 'orgs' && (
                <select className="adm-filter" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
                  {branches.map(b => <option key={b}>{b}</option>)}
                </select>
              )}
              {tab === 'contacts' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label className="adm-check">
                    <input type="checkbox" checked={noOrgFilter} onChange={e => setNoOrgFilter(e.target.checked)} />
                    No Org Assigned
                  </label>
                  <label className="adm-check">
                    <input type="checkbox" checked={inboxFilter} onChange={e => setInboxFilter(e.target.checked)} />
                    Inbox Only
                  </label>
                </div>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <a href={`/api/admin/export?type=${tab}`} download className="adm-export-btn">↓ CSV</a>
                <button className="adm-btn primary" onClick={() => openAdd(tab)}>
                  + Add {tab === 'orgs' ? 'Org' : tab === 'contacts' ? 'Person' : 'Signal'}
                </button>
              </div>
            </div>

            {/* ORGS */}
            {tab === 'orgs' && (
              <div className="adm-table-wrap">
                <div className="adm-count">{filteredOrgs.length} organizations</div>
                <table className="adm-table">
                  <thead><tr>
                    <th />
                    <SortTh field="name"           label="Organization" sort={sort} onSort={toggleSort} />
                    <SortTh field="branch"         label="Branch"       sort={sort} onSort={toggleSort} />
                    <SortTh field="organization_type" label="Type"      sort={sort} onSort={toggleSort} />
                    <SortTh field="abs_hierarchy_level" label="Lvl"     sort={sort} onSort={toggleSort} style={{ width: 50 }} />
                    <SortTh field="contact_count"  label="Contacts"     sort={sort} onSort={toggleSort} style={{ width: 80 }} />
                    <SortTh field="contract_count" label="Contracts"    sort={sort} onSort={toggleSort} style={{ width: 80 }} />
                    <th>Active</th>
                  </tr></thead>
                  <tbody>
                    {pagedOrgs.map((o: any) => (
                      <tr key={o.id}>
                        <td>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="adm-link-btn" onClick={() => openEdit('orgs', o)}>Edit</button>
                            <Link href={`/org/${o.id}`} className="adm-link">View →</Link>
                          </div>
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="adm-av" style={{ background: colorFor(o.name) }}>{initials(o.name)}</div>
                            <div>
                              <div className="adm-cell-primary">{o.name}</div>
                              <div className="adm-cell-sub">{o.id}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="adm-badge">{o.branch ?? '—'}</span></td>
                        <td className="adm-cell-sub">{o.type ?? '—'}</td>
                        <td className="adm-cell-num">{o.abs_hierarchy_level ?? '—'}</td>
                        <td className="adm-cell-num">{o.contacts}</td>
                        <td className="adm-cell-num">{o.contracts}</td>
                        <td>
                          <span className={`adm-status ${o.is_active ? 'active' : 'inactive'}`}>
                            {o.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination total={filteredOrgs.length} page={page} perPage={PER_PAGE} onChange={setPage} />
              </div>
            )}

            {/* CONTACTS (gov only) */}
            {tab === 'contacts' && (
              <div className="adm-table-wrap">
                <div className="adm-count">
                  {filteredContacts.length.toLocaleString()} people
                  {noOrgFilter && <span className="adm-filter-tag">No org assigned</span>}
                  {inboxFilter  && <span className="adm-filter-tag amber">Inbox only</span>}
                </div>
                <table className="adm-table">
                  <thead><tr>
                    <th />
                    <SortTh field="name"            label="Person"       sort={sort} onSort={toggleSort} />
                    <SortTh field="title"           label="Title"        sort={sort} onSort={toggleSort} />
                    <SortTh field="org_full"        label="Organization" sort={sort} onSort={toggleSort} />
                    <SortTh field="hierarchy_order" label="Tier"         sort={sort} onSort={toggleSort} style={{ width: 60 }} />
                    <th style={{ width: 60 }}>Inbox</th>
                  </tr></thead>
                  <tbody>
                    {pagedContacts.map((c: any) => (
                      <tr key={c.id}>
                        <td><button className="adm-link-btn" onClick={() => openEdit('contacts', c)}>Edit</button></td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            {c.photo_url
                              ? <img src={c.photo_url} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }} />
                              : <div className="adm-av" style={{ background: colorFor(c.name) }}>{initials(c.name)}</div>
                            }
                            <div className="adm-cell-primary">{c.name}</div>
                          </div>
                        </td>
                        <td className="adm-cell-sub" style={{ maxWidth:200 }}>{c.title ?? '—'}</td>
                        <td>
                          {c.org_id
                            ? <Link href={`/org/${c.org_id}`} className="adm-link">{c.org_full ?? c.org_id}</Link>
                            : <span className="adm-cell-sub" style={{ color:'var(--amber)' }}>Unassigned</span>}
                        </td>
                        <td className="adm-cell-num">{c.hierarchy_order ?? '—'}</td>
                        <td>
                          {c.is_inbox
                            ? <span className="adm-badge" style={{ color:'#b45309', borderColor:'#b45309', background:'rgba(245,158,11,.08)' }}>Inbox</span>
                            : <span className="adm-cell-sub">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination total={filteredContacts.length} page={page} perPage={PER_PAGE} onChange={setPage} />
              </div>
            )}

            {/* CONTRACTS */}
            {tab === 'contracts' && (
              <div className="adm-table-wrap">
                <div className="adm-count">{filteredContracts.length.toLocaleString()} contracts (showing first 2,000)</div>
                <table className="adm-table">
                  <thead><tr>
                    <th />
                    <SortTh field="title"       label="Title"        sort={sort} onSort={toggleSort} />
                    <SortTh field="signal_type" label="Type"         sort={sort} onSort={toggleSort} style={{ width: 100 }} />
                    <SortTh field="value"       label="Value"        sort={sort} onSort={toggleSort} style={{ width: 110 }} />
                    <SortTh field="recipient"   label="Recipient"    sort={sort} onSort={toggleSort} />
                    <SortTh field="org_id"      label="Organization" sort={sort} onSort={toggleSort} />
                    <SortTh field="source"      label="Source"       sort={sort} onSort={toggleSort} style={{ width: 90 }} />
                  </tr></thead>
                  <tbody>
                    {pagedContracts.map((c: any) => {
                      const tc = c.signal_type==='Opportunity'?'var(--teal)':c.signal_type==='Award'?'#283a6b':'var(--amber)';
                      return (
                        <tr key={c.id}>
                          <td><button className="adm-link-btn" onClick={() => openEdit('contracts', c)}>Edit</button></td>
                          <td className="adm-cell-primary" style={{ maxWidth:240 }}>{c.title}</td>
                          <td>{c.signal_type && <span className="adm-badge" style={{ color:tc, borderColor:tc }}>{c.signal_type}</span>}</td>
                          <td className="adm-cell-num" style={{ color:tc }}>{fmtMoney(c.value ?? c.award_amt)}</td>
                          <td className="adm-cell-sub" style={{ maxWidth:180 }}>{c.recipient ?? '—'}</td>
                          <td>
                            {c.org_id
                              ? <Link href={`/org/${c.org_id}`} className="adm-link" style={{ fontSize:12 }}>{c.org_id}</Link>
                              : <span className="adm-cell-sub">—</span>}
                          </td>
                          <td><span className="adm-badge">{c.source?.replace('_','.')}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination total={filteredContracts.length} page={page} perPage={PER_PAGE} onChange={setPage} />
              </div>
            )}
          </>
        )}

        {/* ── INDUSTRY TABS ── */}
        {tab === 'ind-signals' && (() => {
          const totalSignals = Object.values(contractAgg as Record<string, any>)
            .reduce((s: number, a: any) => s + (a.contract_count || 0), 0);
          const filtered = filteredContracts;
          const paged = sortList(filtered).slice((page - 1) * PER_PAGE, page * PER_PAGE);
          return (
            <>
              <div className="adm-toolbar">
                <input className="adm-search" placeholder="Search signals…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                <button className="adm-export-btn primary" onClick={() => openAdd('contracts')}>+ Add Signal</button>
              </div>
              <div className="adm-count">{totalSignals.toLocaleString()} total signals · {filtered.length.toLocaleString()} shown (first 2,000 loaded)</div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr>
                    <th />
                    <SortTh field="title"       label="Title"        sort={sort} onSort={toggleSort} />
                    <SortTh field="signal_type" label="Type"         sort={sort} onSort={toggleSort} style={{ width: 100 }} />
                    <SortTh field="value"       label="Value"        sort={sort} onSort={toggleSort} style={{ width: 110 }} />
                    <SortTh field="recipient"   label="Recipient"    sort={sort} onSort={toggleSort} />
                    <SortTh field="org_id"      label="Organization" sort={sort} onSort={toggleSort} />
                    <SortTh field="source"      label="Source"       sort={sort} onSort={toggleSort} style={{ width: 90 }} />
                  </tr></thead>
                  <tbody>
                    {paged.map((c: any) => {
                      const tc = c.signal_type === 'Opportunity' ? 'var(--teal)' : c.signal_type === 'Award' ? '#283a6b' : 'var(--amber)';
                      return (
                        <tr key={c.id}>
                          <td><button className="adm-link-btn" onClick={() => openEdit('contracts', c)}>Edit</button></td>
                          <td className="adm-cell-primary" style={{ maxWidth: 240 }}>{c.title}</td>
                          <td>{c.signal_type && <span className="adm-badge" style={{ color: tc, borderColor: tc }}>{c.signal_type}</span>}</td>
                          <td className="adm-cell-num" style={{ color: tc }}>{fmtMoney(c.value ?? c.award_amt)}</td>
                          <td className="adm-cell-sub" style={{ maxWidth: 180 }}>{c.recipient ?? '—'}</td>
                          <td>
                            {c.org_id
                              ? <Link href={`/org/${c.org_id}`} className="adm-link" style={{ fontSize: 12 }}>{c.org_id}</Link>
                              : <span className="adm-cell-sub">—</span>}
                          </td>
                          <td><span className="adm-badge">{c.source?.replace('_', '.')}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </>
          );
        })()}

        {(tab === 'ind-companies' || tab === 'ind-people' || tab === 'ind-subs') && (
          indLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono', fontSize: 12 }}>Loading…</div>
          ) : (
            <>
              <div className="adm-toolbar">
                <input
                  className="adm-search"
                  placeholder={tab === 'ind-companies' ? 'Search companies…' : tab === 'ind-subs' ? 'Search subcontractors…' : 'Search people…'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {tab === 'ind-people' && (<>
                  <select className="adm-filter" value={indTierFilter} onChange={e => setIndTierFilter(e.target.value)}>
                    {indTierOptions.map(t => <option key={t}>{t === 'All' ? 'All Tiers' : `Tier ${t}`}</option>)}
                  </select>
                  <select className="adm-filter" value={indCompanyFilter} onChange={e => setIndCompanyFilter(e.target.value)}>
                    <option value="All">All Companies</option>
                    {indCompanyOptions.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </>)}
                <div style={{ marginLeft: 'auto' }}>
                  {tab === 'ind-companies' && (
                    <button className="adm-btn primary" onClick={() => { setIsNewCompany(true); setEditCompany({}); }}>
                      + Add Company
                    </button>
                  )}
                  {tab === 'ind-people' && (
                    <button className="adm-btn primary" onClick={() => { setEditType('contacts'); setEditItem({ tags: ['INDUSTRY'] }); setIsNew(true); }}>
                      + Add Person
                    </button>
                  )}
                  {tab === 'ind-subs' && (
                    <button className="adm-btn primary" onClick={() => { setIsNewSubCo(true); setEditSubCo({}); }}>
                      + Add Subcontractor
                    </button>
                  )}
                </div>
              </div>

              {/* IND COMPANIES */}
              {tab === 'ind-companies' && (
                <div className="adm-table-wrap">
                  <div className="adm-count">{filteredCompanies.length} companies</div>
                  <table className="adm-table">
                    <thead><tr>
                      <th />
                      <SortTh field="name"          label="Company"       sort={sort} onSort={toggleSort} />
                      <SortTh field="ticker"        label="Ticker"        sort={sort} onSort={toggleSort} style={{ width: 80 }} />
                      <SortTh field="headquarters"  label="HQ"            sort={sort} onSort={toggleSort} />
                      <SortTh field="exec_count"    label="Execs"         sort={sort} onSort={toggleSort} style={{ width: 70 }} />
                      <SortTh field="award_count"   label="Contracts"     sort={sort} onSort={toggleSort} style={{ width: 90 }} />
                      <SortTh field="total_value"   label="Total Awarded" sort={sort} onSort={toggleSort} style={{ width: 120 }} />
                    </tr></thead>
                    <tbody>
                      {pagedCompanies.map((c: any) => {
                        const agg = contractAgg[c.legal_name ?? ''] ?? {};
                        return (
                          <tr key={c.id}>
                            <td><button className="adm-link-btn" onClick={() => { setIsNewCompany(false); setEditCompany(c); }}>Edit</button></td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                {c.logo_url
                                  ? <img src={c.logo_url} alt="" style={{ width:28, height:28, borderRadius:4, objectFit:'contain' }} />
                                  : <div className="adm-av" style={{ background: colorFor(c.name), fontSize:10, width:28, height:28 }}>{initials(c.name)}</div>
                                }
                                <div>
                                  <div className="adm-cell-primary">{c.name}</div>
                                  {c.legal_name && <div className="adm-cell-sub" style={{ fontSize:10 }}>{c.legal_name}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="adm-cell-sub">{c.ticker ?? '—'}</td>
                            <td className="adm-cell-sub">{c.headquarters ?? '—'}</td>
                            <td className="adm-cell-num">{c.exec_count ?? 0}</td>
                            <td className="adm-cell-num">{agg.contract_count ? Number(agg.contract_count).toLocaleString() : '—'}</td>
                            <td className="adm-cell-num" style={{ color:'var(--teal)', fontWeight:600 }}>{agg.total_value ? fmtMoney(agg.total_value) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination total={filteredCompanies.length} page={page} perPage={PER_PAGE} onChange={setPage} />
                </div>
              )}

              {/* IND SUBS */}
              {tab === 'ind-subs' && (
                <div className="adm-table-wrap">
                  <div className="adm-count">{filteredSubCompanies.length} subcontractors enriched · {allSubAwards.length} total in awards data</div>
                  <table className="adm-table">
                    <thead><tr>
                      <th />
                      <SortTh field="name"        label="Subcontractor" sort={sort} onSort={toggleSort} />
                      <SortTh field="headquarters" label="HQ"           sort={sort} onSort={toggleSort} />
                      <SortTh field="website"     label="Website"       sort={sort} onSort={toggleSort} />
                      <SortTh field="prime_count" label="Primes"        sort={sort} onSort={toggleSort} style={{ width: 70 }} />
                      <SortTh field="total_value" label="Total Value"   sort={sort} onSort={toggleSort} style={{ width: 110 }} />
                    </tr></thead>
                    <tbody>
                      {pagedSubCompanies.map((s: any) => {
                        const agg = allSubAwards.find((a: any) => a.name === s.legal_name) ?? {};
                        return (
                          <tr key={s.id}>
                            <td><button className="adm-link-btn" onClick={() => { setIsNewSubCo(false); setEditSubCo(s); }}>Edit</button></td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                {s.logo_url
                                  ? <img src={s.logo_url} alt="" style={{ width:28, height:28, borderRadius:4, objectFit:'contain' }} />
                                  : <div className="adm-av" style={{ background: colorFor(s.name), fontSize:10, width:28, height:28 }}>{initials(s.name)}</div>
                                }
                                <div>
                                  <div className="adm-cell-primary">{s.name}</div>
                                  {s.legal_name && <div className="adm-cell-sub" style={{ fontSize:10 }}>{s.legal_name}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="adm-cell-sub">{s.headquarters ?? '—'}</td>
                            <td className="adm-cell-sub">{s.website ? <a href={s.website} target="_blank" rel="noreferrer" className="adm-link">↗</a> : '—'}</td>
                            <td className="adm-cell-num">{agg.prime_count ?? s.prime_count ?? '—'}</td>
                            <td className="adm-cell-num" style={{ color:'var(--teal)', fontWeight:600 }}>{agg.total_value ? fmtMoney(agg.total_value) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination total={filteredSubCompanies.length} page={page} perPage={PER_PAGE} onChange={setPage} />
                </div>
              )}

              {/* IND PEOPLE */}
              {tab === 'ind-people' && (
                <div className="adm-table-wrap">
                  <div className="adm-count">{filteredPeople.length} people</div>
                  <table className="adm-table">
                    <thead><tr>
                      <th />
                      <SortTh field="name"            label="Name"    sort={sort} onSort={toggleSort} />
                      <SortTh field="title"           label="Title"   sort={sort} onSort={toggleSort} />
                      <SortTh field="org_full"        label="Company" sort={sort} onSort={toggleSort} />
                      <SortTh field="hierarchy_order" label="Tier"    sort={sort} onSort={toggleSort} style={{ width: 60 }} />
                      <th>LinkedIn</th>
                      <th>Photo</th>
                    </tr></thead>
                    <tbody>
                      {pagedPeople.map((p: any) => (
                        <tr key={p.id}>
                          <td>
                            <button className="adm-link-btn" onClick={() => { setEditType('contacts'); setEditItem(p); setIsNew(false); }}>Edit</button>
                          </td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              {p.photo_url
                                ? <img src={p.photo_url} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }} />
                                : <div className="adm-av" style={{ background:colorFor(p.name), fontSize:10, width:28, height:28 }}>{initials(p.name)}</div>
                              }
                              <div className="adm-cell-primary">{p.name}</div>
                            </div>
                          </td>
                          <td className="adm-cell-sub" style={{ maxWidth:220 }}>{p.title ?? '—'}</td>
                          <td className="adm-cell-sub">{p.org_full ?? '—'}</td>
                          <td className="adm-cell-num" style={{ fontSize:11, color:'var(--ink-3)' }}>
                            {p.hierarchy_order != null ? `T${p.hierarchy_order}` : '—'}
                          </td>
                          <td>
                            {p.linkedin
                              ? <a href={p.linkedin} target="_blank" rel="noreferrer" className="adm-link" style={{ fontSize:11 }}>↗ LI</a>
                              : <span className="adm-cell-sub">—</span>}
                          </td>
                          <td>
                            {p.photo_url
                              ? <span style={{ color:'var(--teal)', fontSize:11 }}>✓</span>
                              : <span className="adm-cell-sub">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination total={filteredPeople.length} page={page} perPage={PER_PAGE} onChange={setPage} />
                </div>
              )}
            </>
          )
        )}
        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <>
          <div className="adm-toolbar">
            <div className="adm-count">{users.length} registered users</div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }} />
                  <SortTh field="full_name"  label="Name"         sort={sort} onSort={toggleSort} />
                  <SortTh field="email"      label="Email"        sort={sort} onSort={toggleSort} />
                  <SortTh field="company"    label="Organization" sort={sort} onSort={toggleSort} />
                  <th style={{ width: 80 }}>Admin</th>
                  <SortTh field="created_at" label="Joined"       sort={sort} onSort={toggleSort} style={{ width: 140 }} />
                  <SortTh field="last_login" label="Last sign-in" sort={sort} onSort={toggleSort} style={{ width: 140 }} />
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div className="adm-av" style={{ background: u.is_admin ? '#7c3aed' : 'var(--navy)', fontSize: 11, width: 30, height: 30 }}>
                        {(u.full_name ?? u.email)?.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td><div className="adm-cell-primary">{u.full_name ?? '—'}</div></td>
                    <td className="adm-cell-sub">{u.email}</td>
                    <td className="adm-cell-sub">{u.company ?? '—'}</td>
                    <td>
                      <button
                        className="adm-link-btn"
                        style={{ color: u.is_admin ? '#7c3aed' : 'var(--ink-3)', fontWeight: u.is_admin ? 700 : 400 }}
                        onClick={async () => {
                          const res = await fetch('/api/admin/users', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: u.id, is_admin: !u.is_admin }),
                          });
                          if (res.ok) setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_admin: !u.is_admin } : x));
                        }}
                      >
                        {u.is_admin ? '✓ Admin' : 'Make Admin'}
                      </button>
                    </td>
                    <td className="adm-cell-sub">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td className="adm-cell-sub">{u.last_login ? new Date(u.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</td>
                    <td>
                      <button
                        className="adm-link-btn"
                        style={{ color: '#B71C1C' }}
                        onClick={() => deleteUser(u.id, u.full_name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

      </div>

      {/* ── Gov edit panel ── */}
      {editItem !== null && (() => {
        const unique = (arr: (string | null | undefined)[]) =>
          [...new Set(arr.filter(Boolean) as string[])].sort();

        const editOpts: Record<string, string[]> = {
          titles:     unique(localContacts.map((c: any) => c.title)),
          companies:  unique(companies.map((c: any) => c.legal_name ?? c.name)),
          tags:       unique(localContacts.flatMap((c: any) => Array.isArray(c.tags) ? c.tags : (c.tags ? [c.tags] : []))),
          org_types:  unique(localOrgs.map((o: any) => o.organization_type ?? o.type)),
          locations:  unique(localOrgs.map((o: any) => o.loc)),
          recipients: unique(localContracts.map((c: any) => c.recipient)),
          set_asides: unique(localContracts.map((c: any) => c.set_aside)),
          naics:      unique(localContracts.map((c: any) => c.naics)),
        };

        return (
          <EditPanel
            type={editType}
            item={editItem}
            orgs={localOrgs}
            isNew={isNew}
            opts={editOpts}
            onClose={() => setEditItem(null)}
            onSave={updated => {
              handleSave(updated);
              if (editType === 'contacts' && (Array.isArray(updated.tags) ? updated.tags.includes('INDUSTRY') : false)) {
                setPeople(prev => isNew ? [updated, ...prev] : prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
              }
            }}
            onDelete={() => setDeleteTarget({ type: editType, id: editItem.id, name: editItem.name ?? editItem.title ?? editItem.id })}
          />
        );
      })()}

      {/* ── Company edit panel ── */}
      {editCompany !== null && (
        <CompanyEditPanel
          item={editCompany}
          isNew={isNewCompany}
          onClose={() => setEditCompany(null)}
          onSave={updated => {
            setCompanies(prev => isNewCompany ? [updated, ...prev] : prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
            setEditCompany(null);
          }}
          onDelete={() => setDeleteCompany({ id: editCompany.id, name: editCompany.name })}
        />
      )}

      {/* ── Sub-company edit panel ── */}
      {editSubCo !== null && (
        <SubCompanyEditPanel
          item={editSubCo}
          isNew={isNewSubCo}
          allSubs={allSubAwards}
          onClose={() => setEditSubCo(null)}
          onSave={updated => {
            setSubCompanies(prev => isNewSubCo ? [updated, ...prev] : prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
            setEditSubCo(null);
          }}
          onDelete={() => setDeleteSubCo({ id: editSubCo.id, name: editSubCo.name })}
        />
      )}

      {/* ── Delete confirmations ── */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {deleteCompany && (
        <DeleteModal
          name={deleteCompany.name}
          onConfirm={async () => {
            const res = await fetch(`/api/admin/industry-companies/${deleteCompany.id}`, { method: 'DELETE' });
            if (res.ok) setCompanies(prev => prev.filter(c => c.id !== deleteCompany.id));
            setDeleteCompany(null);
            setEditCompany(null);
          }}
          onCancel={() => setDeleteCompany(null)}
        />
      )}
      {deleteSubCo && (
        <DeleteModal
          name={deleteSubCo.name}
          onConfirm={async () => {
            const res = await fetch(`/api/admin/sub-companies/${deleteSubCo.id}`, { method: 'DELETE' });
            if (res.ok) setSubCompanies(prev => prev.filter(s => s.id !== deleteSubCo.id));
            setDeleteSubCo(null);
            setEditSubCo(null);
          }}
          onCancel={() => setDeleteSubCo(null)}
        />
      )}
    </div>
  );
}
