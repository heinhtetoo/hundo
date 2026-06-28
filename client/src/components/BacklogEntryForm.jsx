import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StarRating from './StarRating.jsx';

const STATUSES = ['backlog', 'playing', 'completed', 'dropped', 'wishlist'];

const entrySchema = z.object({
  status: z.enum(STATUSES),
  rating: z.preprocess(
    v => (v === '' ? null : Number(v)),
    z.number().int().min(1).max(10).nullable(),
  ),
  hoursPlayed: z.preprocess(
    v => (v === '' ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  notes: z.string().max(2000),
});

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

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

  const inputCls = `w-full bg-gray-700 rounded-lg px-4 py-2.5 text-white
                    outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Field label="Status" error={errors.status?.message}>
        <select {...register('status')} className={inputCls}>
          {STATUSES.map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </Field>

      <Field label="Rating" error={errors.rating?.message}>
        <StarRating
          value={watch('rating')}
          onChange={n => setValue('rating', n, { shouldValidate: true })}
        />
      </Field>

      <Field label="Hours played" error={errors.hoursPlayed?.message}>
        <input
          {...register('hoursPlayed')}
          type="number"
          min="0"
          step="0.5"
          placeholder="—"
          className={inputCls}
        />
      </Field>

      <Field label="Notes" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Your thoughts…"
          className={`${inputCls} resize-none`}
        />
        <p className="text-xs text-gray-500 text-right mt-1">
          {(watch('notes') ?? '').length}/2000
        </p>
      </Field>

      {confirming ? (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm text-gray-400 flex-1">Remove this entry?</span>
          <button
            type="button"
            onClick={() => { onRemove(); setConfirming(false); }}
            className="px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white
                       rounded-lg transition-colors text-sm"
          >
            Yes, remove
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300
                       rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {entry ? 'Save changes' : 'Add to backlog'}
          </button>
          {entry && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-4 py-2.5 bg-gray-700 hover:bg-red-800 text-gray-300
                         hover:text-white rounded-lg transition-colors text-sm"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </form>
  );
}
