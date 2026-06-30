import { NavLink } from 'react-router-dom';

const TABS = [
  {
    to: '/backlog',
    label: 'Backlog',
    icon: (
      <>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </>
    ),
  },
  {
    to: '/discover',
    label: 'Discover',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-2.5 6.5L7 17l2.5-6.5L16 8z" />
      </>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 20c0-4.2 3.6-7.5 8-7.5s8 3.3 8 7.5" />
      </>
    ),
  },
];

export default function MobileTabBar() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex h-[72px] pt-2.5
                 border-t border-edge-subtle bg-surface-raised"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            [
              'flex-1 flex flex-col items-center gap-1 transition-opacity',
              isActive ? 'text-brand' : 'text-content-muted opacity-70',
            ].join(' ')
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            {tab.icon}
          </svg>
          <span className="text-[9px] font-medium tracking-wider uppercase">
            {tab.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
