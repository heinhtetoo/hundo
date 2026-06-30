import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Field from './ui/Field.jsx';
import Input from './ui/Input.jsx';
import Button from './ui/Button.jsx';
import RatingBar from './ui/RatingBar.jsx';

const STATUSES = ['backlog', 'playing', 'completed', 'dropped', 'wishlist'];

const entrySchema = z.object({
  status: z.enum(STATUSES),
  rating: z.preprocess(
    (v) => (v === '' ? null : Number(v)),
    z.number().int().min(1).max(10).nullable(),
  ),
  hoursPlayed: z.preprocess(
    (v) => (v === '' ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  notes: z.string().max(2000),
});

export default function BacklogEntryForm({ entry, onSave, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      status: entry?.status ?? 'backlog',
      rating: entry?.rating ?? '',
      hoursPlayed: entry?.hours_played ?? '',
      notes: entry?.notes ?? '',
    },
  });

  useEffect(() => {
    if (entry) {
      reset({
        status: entry.status,
        rating: entry.rating ?? '',
        hoursPlayed: entry.hours_played ?? '',
        notes: entry.notes ?? '',
      });
    }
  }, [entry, reset]);

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5">
      <Field label="Status">
        <div className="grid grid-cols-2 gap-1.5">
          {STATUSES.map((s) => {
            const selected = status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setValue('status', s, { shouldValidate: true })}
                className={[
                  'px-2 py-2 rounded-lg text-xs font-medium capitalize border transition-colors',
                  selected
                    ? 'border-[oklch(76%_0.19_55_/_0.35)] bg-[oklch(76%_0.19_55_/_0.12)] text-brand'
                    : 'border-edge bg-surface-input text-content-muted hover:text-content',
                ].join(' ')}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      <RatingBar
        label="Rating"
        value={watch('rating')}
        onChange={(n) => setValue('rating', n, { shouldValidate: true })}
      />

      <Field label="Hours played" error={errors.hoursPlayed?.message}>
        <Input
          {...register('hoursPlayed')}
          type="number"
          min="0"
          step="0.5"
          placeholder="—"
        />
      </Field>

      <Field label="Notes" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Your thoughts…"
          className="w-full box-border px-4 py-3 rounded-lg bg-surface-input
                     text-content border border-edge transition-colors resize-none"
        />
        <p className="text-xs text-content-subtle text-right mt-1">
          {(watch('notes') ?? '').length}/2000
        </p>
      </Field>

      {confirming ? (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm text-content-muted flex-1">
            Remove this entry?
          </span>
          <button
            type="button"
            onClick={() => {
              onRemove();
              setConfirming(false);
            }}
            className="px-4 py-2.5 rounded-lg text-sm text-white
                       bg-[oklch(45%_0.18_18)] hover:bg-[oklch(52%_0.18_18)]
                       transition-colors"
          >
            Yes, remove
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="px-4 py-2.5 rounded-lg text-sm text-content-muted
                       bg-surface-input hover:text-content transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {entry ? 'Save changes' : 'Add to backlog'}
          </Button>
          {entry && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-4 py-2.5 rounded-lg text-sm text-content-muted
                         bg-surface-input hover:text-white
                         hover:bg-[oklch(40%_0.16_18)] transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </form>
  );
}
