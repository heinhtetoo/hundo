import { Fragment } from 'react';

const STEP_LABELS = ['Register', 'Verify email', 'Sign in'];

function Check() {
  return (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
      <path
        d="M1.5 5L5 8.5L11.5 1.5"
        stroke="oklch(12% 0.03 55)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function connectorBg(left, right) {
  if (left === 'done' && right === 'done') return 'oklch(76% 0.19 55)';
  if (left === 'done' && right === 'active')
    return 'linear-gradient(90deg, oklch(76% 0.19 55), oklch(34% 0.013 265))';
  return 'oklch(18% 0.022 265)';
}

const CIRCLE = {
  done: 'bg-brand',
  active:
    'border-2 border-brand bg-brand/10 shadow-[0_0_14px_oklch(76%_0.19_55_/_0.35)]',
  pending: 'border-2 border-[oklch(20%_0.022_265)]',
};

const NUM = {
  active: 'text-[12px] font-bold text-brand',
  pending: 'text-[12px] font-medium text-[oklch(34%_0.013_265)]',
};

const LABEL = {
  done: 'text-brand font-medium',
  active: 'text-brand font-semibold',
  pending: 'text-[oklch(34%_0.013_265)] font-medium',
};

export default function StepIndicator({ states }) {
  return (
    <div className="flex items-center">
      {STEP_LABELS.map((label, i) => {
        const state = states[i];
        return (
          <Fragment key={label}>
            {i > 0 && (
              <div
                className="w-[60px] h-px mb-4"
                style={{ background: connectorBg(states[i - 1], state) }}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center ${CIRCLE[state]}`}
              >
                {state === 'done' ? (
                  <Check />
                ) : (
                  <span className={NUM[state]}>{i + 1}</span>
                )}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${LABEL[state]}`}>
                {label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
