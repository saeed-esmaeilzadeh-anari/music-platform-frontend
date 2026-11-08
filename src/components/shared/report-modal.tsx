'use client';

import { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { useCreateReport } from '@/hooks/use-social';
import { useLocale } from '@/providers/locale-provider';
import type { ReportReason } from '@/types';

const REASONS: Array<{ value: ReportReason; labelKey: string }> = [
  { value: 'COPYRIGHT', labelKey: 'report.reason.copyright' },
  { value: 'EXPLICIT_CONTENT', labelKey: 'report.reason.explicit' },
  { value: 'SPAM', labelKey: 'report.reason.spam' },
  { value: 'HARASSMENT', labelKey: 'report.reason.harassment' },
  { value: 'MISINFORMATION', labelKey: 'report.reason.misinformation' },
  { value: 'OTHER', labelKey: 'report.reason.other' },
];

interface ReportModalProps {
  targetType: 'TRACK' | 'ALBUM' | 'PLAYLIST' | 'COMMENT' | 'USER' | 'ARTIST';
  targetId: string;
  targetLabel?: string;
  onClose: () => void;
}

/**
 * "Report content" dialog — files a moderation report (one per user per
 * target; the backend answers 409 for duplicates which we surface inline).
 */
export function ReportModal({ targetType, targetId, targetLabel, onClose }: ReportModalProps) {
  const { t } = useLocale();
  const createReport = useCreateReport();
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicate(false);
    createReport.mutate(
      { targetType, targetId, reason, details: details.trim() || undefined },
      {
        onSuccess: onClose,
        onError: (err) => {
          const status = (err as { response?: { status?: number } } | null)?.response?.status;
          if (status === 409) setDuplicate(true);
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('report.title')}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Flag className="h-4 w-4 text-primary" />
            {t('report.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {targetLabel && (
          <p className="text-sm text-muted-foreground mb-4 truncate">
            {t('report.targetLabel', { title: targetLabel })}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-1">{t('report.reasonLabel')}</legend>
            {REASONS.map(r => (
              <label
                key={r.value}
                className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-secondary transition-colors has-checked:border-primary/50"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-primary"
                />
                {t(r.labelKey as never)}
              </label>
            ))}
          </fieldset>

          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={t('report.detailsPlaceholder')}
            className="w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
          />

          {duplicate && (
            <p className="text-xs text-destructive">{t('report.duplicate')}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createReport.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createReport.isPending ? t('report.submitting') : t('report.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
