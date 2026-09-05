"use client";

import { useLang } from "@/lib/i18n/context";
import { LANGUAGES, LANG_CODES } from "@/lib/i18n/dictionary";
import { BLACKLIST_SOURCE } from "@/lib/core/blacklist";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, lang, setLang } = useLang();

  return (
    <>
      <header className="sihat-rise">
        <h1 className="text-hero-sm font-light text-ink">{t.settings.title}</h1>
      </header>

      {/* ---- 语言 ---- */}
      <Section title={t.settings.language} hint={t.settings.languageHint}>
        <div className="flex flex-col gap-2.5">
          {LANG_CODES.map((code) => {
            const active = code === lang;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between rounded-[14px] border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99]",
                  active
                    ? "border-brand bg-brand-tint"
                    : "border-hairline-strong hover:border-ink"
                )}
                style={{ transitionTimingFunction: "var(--ease-standard)" }}
              >
                <span>
                  <span className="block text-body font-medium text-ink">
                    {LANGUAGES[code].native}
                  </span>
                  <span className="mt-0.5 block text-meta text-ink-faint">
                    {LANGUAGES[code].label}
                  </span>
                </span>
                {active ? <Tick /> : null}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ---- 数据来源：证据链在这里也要能点开 ---- */}
      <Section title={t.settings.data} hint={t.settings.dataHint}>
        <dl className="rounded-[14px] border border-hairline bg-surface">
          <Row label="Registry">{BLACKLIST_SOURCE.name}</Row>
          <Row label="Publisher">{BLACKLIST_SOURCE.publisher}</Row>
          <Row label="Records">{BLACKLIST_SOURCE.count}</Row>
          <Row label="Retrieved">{BLACKLIST_SOURCE.retrievedAt}</Row>
          <Row label="Licence">{BLACKLIST_SOURCE.licence}</Row>
        </dl>
        <div className="mt-3 flex flex-col gap-2">
          <ExtLink href={BLACKLIST_SOURCE.cataloguePage}>
            {t.evidence.datasetLink}
          </ExtLink>
          <ExtLink href={BLACKLIST_SOURCE.evidencePage}>
            {t.evidence.npraLink}
          </ExtLink>
        </div>
      </Section>

      {/* ---- 隐私 ---- */}
      <Section title={t.settings.privacy} hint={t.settings.privacyHint} />
    </>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="sihat-rise mt-9 border-t border-hairline pt-7">
      <h2 className="text-eyebrow font-semibold uppercase text-ink-soft">
        {title}
      </h2>
      <p className="mt-2.5 max-w-[62ch] text-body text-ink-soft">{hint}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-hairline px-5 py-3 last:border-b-0">
      <dt className="shrink-0 text-meta text-ink-faint">{label}</dt>
      <dd className="text-right text-action text-ink">{children}</dd>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-action font-medium text-brand transition-opacity duration-200 hover:opacity-70"
    >
      <span className="underline decoration-brand/30 underline-offset-[3px]">
        {children}
      </span>
      <span aria-hidden className="text-[0.8em]">
        ↗
      </span>
    </a>
  );
}

function Tick() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 10 17.5 19 7"
        stroke="var(--color-brand)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
