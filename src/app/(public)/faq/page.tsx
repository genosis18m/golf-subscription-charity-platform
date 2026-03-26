'use client';

/**
 * FAQ page (/faq) — dark editorial theme with accordion.
 */

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem { question: string; answer: string; }
interface FAQCategory { category: string; items: FAQItem[]; }

const FAQ_DATA: FAQCategory[] = [
  {
    category: 'Subscription',
    items: [
      {
        question: 'Can I cancel my subscription at any time?',
        answer: 'Yes. You can cancel from your dashboard at any time. Your subscription will remain active until the end of the current billing period and you will not be charged again.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Direct debit and bank transfer support is coming soon.',
      },
      {
        question: 'Can I switch between monthly and annual plans?',
        answer: 'Yes. You can upgrade or downgrade via the Subscription page in your dashboard. Changes take effect at the start of your next billing cycle.',
      },
    ],
  },
  {
    category: 'The Draw',
    items: [
      {
        question: 'When does the draw take place?',
        answer: 'The draw runs on the last business day of every calendar month. Results are published within 24 hours and all participants are notified by email.',
      },
      {
        question: 'Do I need to submit scores to enter the draw?',
        answer: 'Yes — you must submit at least one score during the draw month to be eligible. The draw is designed to reward active golfers, so scoring is a core requirement.',
      },
      {
        question: 'What is the algorithmic draw mode?',
        answer: 'In algorithmic mode, members with a lower rolling score average receive slightly better-weighted entry numbers. The difference is subtle — it rewards consistency without excluding casual players.',
      },
      {
        question: 'What happens if nobody wins the jackpot?',
        answer: "If the 5-match tier has no winners, the full jackpot allocation rolls over and is added to the next month's prize pool, growing the jackpot progressively.",
      },
    ],
  },
  {
    category: 'Winnings & Verification',
    items: [
      {
        question: 'How do I claim my winnings?',
        answer: "If you win, you'll receive an email notification. Log in to your dashboard and go to Winnings. Upload the required verification proof (photo ID). Our team reviews within 48 hours and pays via bank transfer.",
      },
      {
        question: 'How long does prize payment take?',
        answer: 'Once your win is verified by our team, payment is processed within 3–5 business days to your registered bank account.',
      },
      {
        question: 'What if my win is rejected?',
        answer: 'If we cannot verify your win for any reason, we will contact you with an explanation and give you the opportunity to provide alternative proof.',
      },
    ],
  },
  {
    category: 'Charities',
    items: [
      {
        question: 'How do I know the charity receives the money?',
        answer: 'We publish quarterly charity contribution reports showing exact amounts transferred to each charity. All partner charities are UK registered with the Charity Commission.',
      },
      {
        question: 'Can I change my charity after signing up?',
        answer: 'Yes. You can change your supported charity from the Charity page in your dashboard. Changes take effect from your next billing cycle.',
      },
      {
        question: 'Can I suggest a charity to add?',
        answer: "Absolutely. Email us at charities@golfcharityclub.co.uk with the charity's registration details. We review all suggestions and aim to respond within 2 weeks.",
      },
    ],
  },
];

function AccordionItem({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '18px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: '16px',
          textAlign: 'left',
        }}
        aria-expanded={isOpen}
      >
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '14px', color: 'var(--cream)', lineHeight: 1.5 }}>
          {question}
        </span>
        <svg
          style={{
            width: '18px',
            height: '18px',
            color: 'var(--muted)',
            flexShrink: 0,
            marginTop: '2px',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={{ paddingBottom: '18px', marginTop: '-6px' }}>
          <p style={{ fontSize: '14px', color: 'var(--cream-dim)', lineHeight: 1.7 }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--cream)' }}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden grain-overlay"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,50,22,0.45) 0%, var(--bg-void) 65%)' }}
      >
        <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-5"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Got questions?
          </p>
          <h1 className="display-heading mb-5" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            Frequently Asked
            <br />
            <span className="serif-accent" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05em' }}>
              Questions
            </span>
          </h1>
          <p style={{ color: 'var(--cream-dim)', fontSize: '15px', lineHeight: 1.6 }}>
            Can&apos;t find your answer?{' '}
            <a
              href="mailto:hello@golfcharityclub.co.uk"
              style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}
            >
              Email us
            </a>
          </p>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── FAQ Accordion ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {FAQ_DATA.map(({ category, items }) => (
            <div key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', paddingBottom: '16px', borderBottom: '1px solid var(--border-mid)' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--green)',
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {category}
                </h2>
              </div>
              <div>
                {items.map((item) => (
                  <AccordionItem key={item.question} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center mt-16">
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
            Still have questions?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:hello@golfcharityclub.co.uk"
              className="btn btn-outline btn-sm"
            >
              Contact Support
            </a>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
