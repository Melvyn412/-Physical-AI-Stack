import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail, Send, ShieldCheck, CheckCircle2, AlertTriangle,
  Copy, Download, Globe, Sparkles, Lock, ExternalLink,
  RefreshCw, FileText, AlertOctagon, Check
} from 'lucide-react';

interface OutreachTemplate {
  id: string;
  label: string;
  persona: string;
  standardTag: string;
  defaultRobot: string;
  subject: string;
  body: string;
}

const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'cobot-iso10218',
    label: 'Industrial Cobots (ISO 10218)',
    persona: 'VP Engineering / Robotics Lead',
    standardTag: 'ISO 10218 & ISO/TS 15066',
    defaultRobot: '6-DOF collaborative arm',
    subject: 'Quick question on {{company}} {{standard}} safety files',
    body: `Hi {{firstName}},

I noticed {{company}} is scaling the {{robot}} line. Most robotics teams I speak with hit a bottleneck right before CE / ISO 10218 sign-off because every controller YAML or URDF torque tweak invalidates the static FMEA binder.

We built AIGENESIS.SAFETY so QA and controls engineers can ingest their ROS 2 YAML/URDF directly, run an automated Z3 clause gap check, and export a SHA-256 signed dossier + GitHub PR gatekeeper in minutes rather than waiting months on external consultants.

If you're open to it, would it be useful if I ran a quick sample clause gap check against a generic cobot profile and sent over the PDF binder?

Best,
{{senderName}}
{{senderTitle}}`
  },
  {
    id: 'surgical-fda',
    label: 'Surgical Robotics (FDA 21 CFR 820)',
    persona: 'Head of Regulatory / Quality Systems',
    standardTag: 'FDA 21 CFR 820 & ISO 13485',
    defaultRobot: 'surgical manipulator',
    subject: '{{company}} 21 CFR 820 Design History File traceability',
    body: `Hi {{firstName}},

Putting together FDA 21 CFR 820.30 Design History Files and ISO 14971 FMEA matrices for a {{robot}} usually means burning 12+ engineering weeks keeping Word tables aligned with software commits.

We recently added an automated Bi-Directional Requirements Traceability Matrix and ISO 14971 Pre/Post RPN calculator to AIGENESIS.SAFETY that links controller limits straight to printable audit binders and CI merge gates.

Would you like to see a 2-minute sample DHF output tailored to {{standard}}? No decks—just the generated dossier file.

Best,
{{senderName}}
{{senderTitle}}`
  },
  {
    id: 'amr-iso3691',
    label: 'Warehouse AMRs (ISO 3691-4)',
    persona: 'Director of Fleet Autonomy / Safety',
    standardTag: 'ISO 3691-4 & ANSI/RIA R15.08',
    defaultRobot: 'autonomous mobile robot fleet',
    subject: 'Stopping-distance & PR safety gate for {{company}} AMRs',
    body: `Hi {{firstName}},

Quick note regarding {{company}}'s {{robot}} deployments—whenever navigation or braking parameters get tuned in CI, proving ISO 3691-4 stopping-distance compliance across surfaces usually stalls release velocity.

AIGENESIS.SAFETY now attaches a Z3 barrier check directly to GitHub Actions / GitLab CI pull requests and auto-updates the ISO 3691-4 safety dossier on every clean merge.

Happy to share a sample GitHub workflow YAML and dossier output if that's helpful ahead of your next notified-body review.

Best,
{{senderName}}
{{senderTitle}}`
  },
  {
    id: 'defense-stanag',
    label: 'Defense UAV/UGV (STANAG 4586)',
    persona: 'Chief Systems Architect / Autonomy Lead',
    standardTag: 'STANAG 4586 & MIL-STD-810H',
    defaultRobot: 'unmanned autonomous platform',
    subject: 'Air-gapped STANAG 4586 safety evidence for {{company}}',
    body: `Hi {{firstName}},

Because defense programs can't send proprietary URDF models or kinematics to external SaaS clouds, we packaged AIGENESIS.SAFETY as an air-gapped container deployment that produces deterministic STANAG 4586 / MIL-STD-810H safety dossiers and SHA-256 manifests entirely inside your own VPC or SCIF.

If your team is preparing upcoming airworthiness or autonomy safety cases for {{robot}}, I can send over our offline SIG Lite security brief and sample dossier structure.

Worth a brief look this week?

Best,
{{senderName}}
{{senderTitle}}`
  }
];

const SPAM_TRIGGERS = [
  'guarantee', 'guaranteed', '100% free', 'act now', 'limited time',
  'urgent', 'click here', 'buy now', 'discount', 'save big', 'no obligation',
  'winner', 'congratulations', 'risk-free', 'unsubscribe here'
];

interface DnsCheckResult {
  domain: string;
  score: number;
  mx: { found: boolean; count: number; primary: string | null };
  spf: { found: boolean; record: string | null };
  dmarc: { found: boolean; policy: string; record: string | null };
  dkim: { found: boolean; selectors: { selector: string; record: string }[] };
}

export const OutreachMailerPanel: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('cobot-iso10218');
  const [firstName, setFirstName] = useState<string>('Alex');
  const [recipientEmail, setRecipientEmail] = useState<string>('alex.mercer@robotics-oem.com');
  const [company, setCompany] = useState<string>('Apex Cobotics');
  const [robotName, setRobotName] = useState<string>('6-DOF collaborative arm');
  const [senderName, setSenderName] = useState<string>('Dr. Melvyn Davies');
  const [senderTitle, setSenderTitle] = useState<string>('AIGENESIS.SAFETY — Automated Robotics Compliance');
  const [replyTo, setReplyTo] = useState<string>('');

  const currentTemplate = useMemo(
    () => OUTREACH_TEMPLATES.find(t => t.id === selectedTemplateId) || OUTREACH_TEMPLATES[0],
    [selectedTemplateId]
  );

  const [subject, setSubject] = useState<string>(currentTemplate.subject);
  const [body, setBody] = useState<string>(currentTemplate.body);

  // Sync raw template when switching sequence
  const handleSelectTemplate = (tpl: OutreachTemplate) => {
    setSelectedTemplateId(tpl.id);
    setRobotName(tpl.defaultRobot);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  // Resolved personalized message
  const resolvedSubject = useMemo(() => {
    return subject
      .replace(/\{\{firstName\}\}/g, firstName.trim() || 'there')
      .replace(/\{\{company\}\}/g, company.trim() || 'your team')
      .replace(/\{\{robot\}\}/g, robotName.trim() || currentTemplate.defaultRobot)
      .replace(/\{\{standard\}\}/g, currentTemplate.standardTag);
  }, [subject, firstName, company, robotName, currentTemplate]);

  const resolvedBody = useMemo(() => {
    return body
      .replace(/\{\{firstName\}\}/g, firstName.trim() || 'there')
      .replace(/\{\{company\}\}/g, company.trim() || 'your team')
      .replace(/\{\{robot\}\}/g, robotName.trim() || currentTemplate.defaultRobot)
      .replace(/\{\{standard\}\}/g, currentTemplate.standardTag)
      .replace(/\{\{senderName\}\}/g, senderName.trim() || 'Team')
      .replace(/\{\{senderTitle\}\}/g, senderTitle.trim() || 'AIGENESIS.SAFETY');
  }, [body, firstName, company, robotName, senderName, senderTitle, currentTemplate]);

  // Live Deliverability / Promotions Classifier Analysis
  const deliverabilityAudit = useMemo(() => {
    const combinedLower = `${resolvedSubject}\n${resolvedBody}`.toLowerCase();
    const words = resolvedBody.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const urls = resolvedBody.match(/https?:\/\/[^\s]+/gi) || [];
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(resolvedBody);
    const exclamations = (resolvedSubject + resolvedBody).match(/!/g)?.length || 0;
    const allCapsWords = words.filter(w => w.length >= 4 && /^[A-Z0-9]+$/.test(w) && !['Z3', 'URDF', 'YAML', 'FMEA', 'DHF', 'SCIF', 'VPC', 'STANAG', 'NASA', 'NATO', 'CE'].includes(w));
    const foundTriggers = SPAM_TRIGGERS.filter(t => combinedLower.includes(t));

    const checks = [
      {
        label: 'Plain-Text 1:1 Format (Zero HTML/Images)',
        pass: !hasHtmlTags,
        detail: hasHtmlTags ? 'HTML tags detected — triggers Gmail Promotions tab.' : 'Pure plain text (matches personal inbox mail).'
      },
      {
        label: 'Cold Outreach Word Budget (<= 145 words)',
        pass: wordCount >= 30 && wordCount <= 145,
        detail: `${wordCount} words (${wordCount <= 145 ? 'concise & conversational' : 'trim under 145 words to reduce bulk-mail scoring'}).`
      },
      {
        label: 'Link Density (0–1 URLs max in initial touch)',
        pass: urls.length <= 1,
        detail: urls.length === 0 ? '0 links (lowest spam/promotions risk).' : urls.length === 1 ? '1 link (acceptable).' : `${urls.length} links detected — reduce to 0–1.`
      },
      {
        label: 'Promotional / Spam Keyword Scan',
        pass: foundTriggers.length === 0 && exclamations <= 1 && allCapsWords.length === 0,
        detail:
          foundTriggers.length > 0
            ? `Remove trigger phrases: ${foundTriggers.join(', ')}`
            : exclamations > 1
            ? 'Reduce exclamation marks.'
            : allCapsWords.length > 0
            ? `Avoid ALL CAPS words: ${allCapsWords.slice(0, 3).join(', ')}`
            : 'Clean conversational tone.'
      }
    ];

    const passedCount = checks.filter(c => c.pass).length;
    const score = Math.round((passedCount / checks.length) * 100);
    return { score, checks, wordCount, urlCount: urls.length };
  }, [resolvedSubject, resolvedBody]);

  // Server Mailer Config & Sending State
  const [mailerConfig, setMailerConfig] = useState<{
    configured: boolean;
    provider: 'resend' | 'smtp' | 'draft-only';
    fromAddress: string | null;
  } | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Domain DNS Check State
  const [domainToCheck, setDomainToCheck] = useState<string>('aigenesis.tech');
  const [checkingDns, setCheckingDns] = useState<boolean>(false);
  const [dnsResult, setDnsResult] = useState<DnsCheckResult | null>(null);
  const [dnsError, setDnsError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/email/config')
      .then(r => r.json())
      .then(data => setMailerConfig(data))
      .catch(() => setMailerConfig({ configured: false, provider: 'draft-only', fromAddress: null }));
  }, []);

  const handleCheckDomainDns = async () => {
    setCheckingDns(true);
    setDnsError(null);
    try {
      const resp = await fetch('/api/email/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToCheck })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setDnsError(data.error || 'Could not inspect domain DNS.');
      } else {
        setDnsResult(data);
      }
    } catch (err: any) {
      setDnsError(err?.message || 'DNS check request failed.');
    } finally {
      setCheckingDns(false);
    }
  };

  const handleServerSend = async () => {
    setSending(true);
    setSendFeedback(null);
    try {
      const resp = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          replyTo: replyTo.trim() || undefined
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setSendFeedback({ type: 'error', message: data.error || 'Email dispatch failed.' });
      } else if (data.sent) {
        setSendFeedback({
          type: 'success',
          message: `Dispatched plain-text 1:1 email via ${data.provider.toUpperCase()} (${data.messageId}) to ${data.to}.`
        });
      } else {
        setSendFeedback({
          type: 'info',
          message: data.message || 'Server mail credentials not set yet — use "Open in Mail App" or download the .eml draft below.'
        });
      }
    } catch (err: any) {
      setSendFeedback({ type: 'error', message: err?.message || 'Network error while sending.' });
    } finally {
      setSending(false);
    }
  };

  const handleDownloadEml = () => {
    const eml = [
      `To: ${recipientEmail}`,
      `Subject: ${resolvedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      resolvedBody
    ].join('\r\n');

    const blob = new Blob([eml], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outreach-${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const mailtoHref = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(resolvedSubject)}&body=${encodeURIComponent(resolvedBody)}`;

  return (
    <div className="space-y-6">
      {/* Deliverability Reality Notice + Server Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>1:1 Plain-Text Outreach & Deliverability Guard</span>
          </div>
          <h3 className="text-lg font-extrabold text-white">
            Engineered to Avoid Gmail Promotions & Corporate Spam Triggers
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-3xl leading-relaxed">
            No sender can 100% guarantee Primary Inbox placement—recipient servers decide final sorting. This composer maximizes Primary Inbox odds by enforcing strict plain-text 1:1 formatting (zero promotional HTML, zero tracking pixels, zero bulk unsubscribe headers) and verifying your domain's live SPF/DKIM/DMARC records before sending.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl shrink-0 space-y-1 text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Server Mailer Status</span>
          {mailerConfig?.configured ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Live ({mailerConfig.provider.toUpperCase()})
            </span>
          ) : (
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Direct Mail App / .EML Ready
            </span>
          )}
          <span className="text-[10px] text-slate-500 block font-sans">
            {mailerConfig?.configured
              ? `From: ${mailerConfig.fromAddress || 'Configured Sender'}`
              : 'Add RESEND_API_KEY or SMTP_* in Secrets for server send'}
          </span>
        </div>
      </div>

      {/* Main Two-Column Composer & Deliverability / DNS Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template Picker, Personalization & Live Plain-Text Editor */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          {/* 4 Vertical Outreach Templates */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">
              1. Select Target Robotics Vertical (Showcasing New Dossier Engine Features):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OUTREACH_TEMPLATES.map(tpl => {
                const active = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{tpl.label}</div>
                    <div className="text-[10px] text-cyan-400 mt-0.5 font-sans">{tpl.persona}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient & Sender Personalization */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Recipient First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Recipient Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Company</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Robot / Product Line</label>
              <input
                type="text"
                value={robotName}
                onChange={e => setRobotName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Your Name</label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reply-To (Optional)</label>
              <input
                type="email"
                placeholder="you@yourdomain.com"
                value={replyTo}
                onChange={e => setReplyTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Editable Subject & Body */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Subject Line (Supports {'{{company}}'}, {'{{standard}}'})</label>
                <span className="text-[10px] text-slate-500 font-sans">Lowercase conversational subjects avoid Promotions</span>
              </div>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-sans text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Plain-Text Body ({deliverabilityAudit.wordCount} words)
              </label>
              <textarea
                rows={10}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-sans text-xs leading-relaxed focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dispatch & Export Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <a
              href={mailtoHref}
              className="flex-1 min-w-[200px] py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              Send from Personal Mail App (Highest Primary Odds)
            </a>

            <button
              onClick={handleServerSend}
              disabled={sending}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Sending...' : mailerConfig?.configured ? `Send via ${mailerConfig.provider.toUpperCase()}` : 'Server Send'}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`Subject: ${resolvedSubject}\n\n${resolvedBody}`);
                setCopiedState(true);
                setTimeout(() => setCopiedState(false), 2500);
              }}
              className="py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedState ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleDownloadEml}
              className="py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              .EML
            </button>
          </div>

          {sendFeedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-sans flex items-start gap-2 ${
                sendFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : sendFeedback.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
              }`}
            >
              {sendFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{sendFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Right: Deliverability Classifier Guard & Live Domain DNS Inspector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Live Promotions-Tab & Spam Classifier Audit */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Inbox Placement Hygiene Score
                </h4>
                <span className="text-[10px] text-slate-400 font-sans">Pre-send check against Promotions & Spam classifiers</span>
              </div>
              <span
                className={`text-lg font-black font-mono px-3 py-1 rounded-xl border ${
                  deliverabilityAudit.score >= 75
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}
              >
                {deliverabilityAudit.score}/100
              </span>
            </div>

            <div className="space-y-2.5">
              {deliverabilityAudit.checks.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.label}</span>
                    <span className={`text-[10px] font-bold ${c.pass ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {c.pass ? 'PASS' : 'FIX'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{c.detail}</p>
                </div>
              ))}
            </div>

            {/* Live Resolved Preview */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Rendered Plain-Text Preview</div>
              <div className="text-xs font-bold text-cyan-300 font-sans">Subject: {resolvedSubject}</div>
              <pre className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pt-1 border-t border-slate-800/80">
                {resolvedBody}
              </pre>
            </div>
          </div>

          {/* Card 2: Live Sending Domain DNS Inspector (SPF / DKIM / DMARC) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Live Domain Auth Inspector (SPF / DKIM / DMARC)
              </h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Verify your sending domain's real DNS records before running B2B outreach.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={domainToCheck}
                onChange={e => setDomainToCheck(e.target.value)}
                placeholder="outreach.yourdomain.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleCheckDomainDns}
                disabled={checkingDns}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingDns ? 'animate-spin' : ''}`} />
                {checkingDns ? 'Checking...' : 'Check DNS'}
              </button>
            </div>

            {dnsError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-sans">
                {dnsError}
              </div>
            )}

            {dnsResult && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400">Domain Auth Score ({dnsResult.domain})</span>
                  <span className={`font-extrabold ${dnsResult.score >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {dnsResult.score}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span>SPF Record</span>
                      <span className={dnsResult.spf.found ? 'text-emerald-400' : 'text-rose-400'}>
                        {dnsResult.spf.found ? 'FOUND' : 'MISSING'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                      {dnsResult.spf.record || 'Add TXT: v=spf1 include:_spf.google.com ~all'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span>DMARC Policy</span>
                      <span className={dnsResult.dmarc.found ? 'text-emerald-400' : 'text-rose-400'}>
                        {dnsResult.dmarc.found ? dnsResult.dmarc.policy.toUpperCase() : 'MISSING'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                      {dnsResult.dmarc.record || 'Add _dmarc TXT: v=DMARC1; p=quarantine;'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span>DKIM Selectors</span>
                      <span className={dnsResult.dkim.found ? 'text-emerald-400' : 'text-amber-400'}>
                        {dnsResult.dkim.found ? `${dnsResult.dkim.selectors.length} ACTIVE` : 'NOT DETECTED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                      {dnsResult.dkim.found
                        ? dnsResult.dkim.selectors.map(s => s.selector).join(', ')
                        : 'Checked google, resend, selector1, k1'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span>MX Routing</span>
                      <span className={dnsResult.mx.found ? 'text-emerald-400' : 'text-amber-400'}>
                        {dnsResult.mx.found ? `${dnsResult.mx.count} MX` : 'NONE'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                      {dnsResult.mx.primary || 'Required for replies to bounce/land cleanly'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
