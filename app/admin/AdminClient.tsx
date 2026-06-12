'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Pagination from '@/app/components/Pagination';

/* ── helpers ─────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function fmtMoney(v: string | number | null) {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  if (!n || isNaN(n)) return '—';
  if (n>=1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n>=1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n>=1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

type Tab = 'orgs' | 'contacts' | 'contracts' | 'ind-companies' | 'ind-people';
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
}: {
  type: Tab; item: any; orgs: any[]; isNew: boolean;
  onClose(): void; onSave(data: any): void; onDelete(): void;
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
                <input className="adm-input" value={form.organization_type ?? form.type ?? ''} onChange={e => set('organization_type', e.target.value)} placeholder="Command, Agency…" />
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
                <input className="adm-input" value={form.loc ?? ''} onChange={e => set('loc', e.target.value)} placeholder="City, State" />
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
              <input className="adm-input" value={form.title ?? ''} onChange={e => set('title', e.target.value)} placeholder="Commanding Officer, Program Manager…" />
            </div>
            <div className="adm-fg2">
              <div className="adm-fg">
                <label>Gov Organization</label>
                <OrgPicker value={form.org_id ?? ''} onChange={v => set('org_id', v || null)} orgs={orgs} />
              </div>
              <div className="adm-fg">
                <label>Industry Company</label>
                <input className="adm-input" value={form.org_full ?? ''} onChange={e => set('org_full', e.target.value)} placeholder="LOCKHEED MARTIN CORPORATION" />
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
              <input className="adm-input" value={Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags ?? '')} onChange={e => set('tags', e.target.value)} placeholder="INDUSTRY, cyber, acquisition" />
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
              <input className="adm-input" value={form.recipient ?? ''} onChange={e => set('recipient', e.target.value)} placeholder="LOCKHEED MARTIN CORPORATION" />
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
                <input className="adm-input" value={form.set_aside ?? ''} onChange={e => set('set_aside', e.target.value)} placeholder="SDVOSB, 8(a)…" />
              </div>
              <div className="adm-fg">
                <label>NAICS Code</label>
                <input className="adm-input" value={form.naics ?? ''} onChange={e => set('naics', e.target.value)} />
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

/* ── Industry data hook ───────────────────────────────────────────── */
function useIndustryData() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [contractAgg, setContractAgg] = useState<Record<string, any>>({});
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/industry-companies').then(r => r.json()),
      fetch('/api/industry').then(r => r.json()),
      fetch('/api/admin/industry-people').then(r => r.json()),
    ]).then(([comp, agg, ppl]) => {
      setCompanies(Array.isArray(comp) ? comp : []);
      const map: Record<string, any> = {};
      if (Array.isArray(agg)) agg.forEach((a: any) => { map[a.name] = a; });
      setContractAgg(map);
      setPeople(Array.isArray(ppl) ? ppl : []);
      setLoading(false);
    });
  }, []);

  return { companies, setCompanies, contractAgg, people, setPeople, loading };
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function AdminClient({ orgs, contacts, contracts, stats }: Props) {
  const [tab, setTab]       = useState<Tab>('orgs');
  const [search, setSearch] = useState('');

  /* Gov filters */
  const [noOrgFilter,  setNoOrgFilter]  = useState(false);
  const [inboxFilter,  setInboxFilter]  = useState(false);
  const [branchFilter, setBranchFilter] = useState('All');

  /* Pagination */
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [tab, search, noOrgFilter, inboxFilter, branchFilter]);

  /* Edit / Add / Delete state */
  const [editItem,     setEditItem]     = useState<any | null>(null);
  const [editType,     setEditType]     = useState<Tab>('orgs');
  const [isNew,        setIsNew]        = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; id: string; name: string } | null>(null);

  /* Industry edit state */
  const [editCompany,    setEditCompany]    = useState<any | null>(null);
  const [isNewCompany,   setIsNewCompany]   = useState(false);
  const [deleteCompany,  setDeleteCompany]  = useState<{ id: string; name: string } | null>(null);

  /* Local mutable copies (optimistic updates) */
  const [localOrgs,      setLocalOrgs]      = useState(orgs);
  const [localContacts,  setLocalContacts]  = useState(contacts);
  const [localContracts, setLocalContracts] = useState(contracts);

  /* Industry data */
  const { companies, setCompanies, contractAgg, people, setPeople, loading: indLoading } = useIndustryData();

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

  const filteredPeople = useMemo(() => {
    if (!search.trim()) return people;
    const q = search.toLowerCase();
    return people.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.org_full?.toLowerCase().includes(q)
    );
  }, [people, search]);

  /* Paged lists */
  const pagedOrgs      = filteredOrgs.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedContacts  = filteredContacts.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedContracts = filteredContracts.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedCompanies = filteredCompanies.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pagedPeople    = filteredPeople.slice((page-1)*PER_PAGE, page*PER_PAGE);

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

  const govContactCount = localContacts.filter((c: any) => !(Array.isArray(c.tags) ? c.tags.includes('INDUSTRY') : false)).length;

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
        {navItem('ind-companies', 'Companies',   companies.length,  '#7c4dbc')}
        {navItem('ind-people',    'Executives',  people.length,     '#c8502d')}

        <div className="adm-nav-section" style={{ marginTop: 24 }}>EXPORTS</div>
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
                    <th /><th>Organization</th><th>Branch</th><th>Type</th>
                    <th>Lvl</th><th>Contacts</th><th>Contracts</th><th>Active</th>
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
                    <th /><th>Person</th><th>Title</th><th>Organization</th><th>Tier</th><th>Inbox</th>
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
                    <th /><th>Title</th><th>Type</th><th>Value</th><th>Recipient</th><th>Organization</th><th>Source</th>
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
        {(tab === 'ind-companies' || tab === 'ind-people') && (
          indLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono', fontSize: 12 }}>Loading…</div>
          ) : (
            <>
              <div className="adm-toolbar">
                <input
                  className="adm-search"
                  placeholder={tab === 'ind-companies' ? 'Search companies…' : 'Search executives…'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div style={{ marginLeft: 'auto' }}>
                  {tab === 'ind-companies' && (
                    <button className="adm-btn primary" onClick={() => { setIsNewCompany(true); setEditCompany({}); }}>
                      + Add Company
                    </button>
                  )}
                  {tab === 'ind-people' && (
                    <button className="adm-btn primary" onClick={() => { setEditType('contacts'); setEditItem({ tags: ['INDUSTRY'] }); setIsNew(true); }}>
                      + Add Executive
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
                      <th /><th>Company</th><th>Ticker</th><th>HQ</th><th>Execs</th><th>Contracts</th><th>Total Awarded</th>
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

              {/* IND PEOPLE */}
              {tab === 'ind-people' && (
                <div className="adm-table-wrap">
                  <div className="adm-count">{filteredPeople.length} executives</div>
                  <table className="adm-table">
                    <thead><tr>
                      <th /><th>Name</th><th>Title</th><th>Company</th><th>LinkedIn</th><th>Photo</th>
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
      </div>

      {/* ── Gov edit panel ── */}
      {editItem !== null && (
        <EditPanel
          type={editType}
          item={editItem}
          orgs={localOrgs}
          isNew={isNew}
          onClose={() => setEditItem(null)}
          onSave={updated => {
            handleSave(updated);
            /* also refresh ind-people list if editing an industry exec */
            if (editType === 'contacts' && (Array.isArray(updated.tags) ? updated.tags.includes('INDUSTRY') : false)) {
              setPeople(prev => isNew ? [updated, ...prev] : prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
            }
          }}
          onDelete={() => setDeleteTarget({ type: editType, id: editItem.id, name: editItem.name ?? editItem.title ?? editItem.id })}
        />
      )}

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
    </div>
  );
}
