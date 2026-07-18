import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { SectionContainer } from '../components/SectionContainer';
import type { Account } from '../content/types';

/** 계좌 한 건: 역할/이름, 은행+번호, 복사/카카오페이 버튼. */
function AccountRow({ account }: { account: Account }) {
  const [copied, setCopied] = useState(false);

  function copyNumber() {
    const text = `${account.bank} ${account.number}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => setCopied(false),
    );
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid #efe9e2' }} data-testid="account-row">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--color-muted)' }}>
            {account.role && <span style={{ marginRight: 6 }}>{account.role}</span>}
            <strong style={{ color: 'var(--color-text)' }}>{account.holder}</strong>
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: 4 }}>
            {account.bank} {account.number}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={copyNumber}
            data-testid="copy-button"
            style={{
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {copied ? '복사됨' : '복사'}
          </button>
          {account.kakaoPayUrl && (
            <a
              href={account.kakaoPayUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#ffeb00',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.8rem',
                textAlign: 'center',
                color: '#3a1d1d',
                textDecoration: 'none',
              }}
            >
              카카오페이
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** 접었다 펴는 계좌 패널(신랑측/신부측). */
function AccountPanel({ label, accounts }: { label: string; accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #e5ddd4', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid="account-panel-toggle"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f7f2ec',
          border: 'none',
          padding: '14px 16px',
          fontSize: '0.95rem',
          color: 'var(--color-muted)',
          cursor: 'pointer',
        }}
      >
        <span>{label}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ⌄
        </span>
      </button>
      {open && <div style={{ padding: '0 16px' }}>{accounts.map((a, i) => <AccountRow key={i} account={a} />)}</div>}
    </div>
  );
}

/** FR-12: 마음 전하실 곳(계좌/카카오페이) — 아코디언. */
export function GiftSection() {
  const { gift } = useContent();
  return (
    <SectionContainer id="gift" title="마음 전하실 곳">
      {gift.message && (
        <p
          style={{ textAlign: 'center', whiteSpace: 'pre-line', color: 'var(--color-muted)', marginBottom: 20 }}
        >
          {gift.message}
        </p>
      )}
      <div data-testid="gift">
        <AccountPanel label="신랑측 계좌번호" accounts={gift.groomAccounts} />
        <AccountPanel label="신부측 계좌번호" accounts={gift.brideAccounts} />
      </div>
    </SectionContainer>
  );
}
