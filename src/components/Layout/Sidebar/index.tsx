import Badge from '@app/components/Common/Badge';
import UserWarnings from '@app/components/Layout/UserWarnings';
import VersionStatus from '@app/components/Layout/VersionStatus';
import useClickOutside from '@app/hooks/useClickOutside';
import { Permission, useUser } from '@app/hooks/useUser';
import { Transition } from '@headlessui/react';
import {
  ClockIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FilmIcon,
  HomeIcon,
  SparklesIcon,
  TvIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { menuMessages } from '../sidebar-messages';
export { menuMessages } from '../sidebar-messages';

interface SidebarProps {
  open?: boolean;
  setClosed: () => void;
  pendingRequestsCount: number;
  openIssuesCount: number;
  revalidateIssueCount: () => void;
  revalidateRequestsCount: () => void;
}

interface SidebarLink {
  href: string;
  icon: React.ReactNode;
  messagesKey: keyof typeof menuMessages;
  activeRegExp: RegExp;
  external?: boolean;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
  dataTestId?: string;
}

const sidebarLinks: SidebarLink[] = [
  {
    href: '/',
    external: true,
    messagesKey: 'home',
    icon: <HomeIcon className="h-5 w-5" />,
    activeRegExp: /$^/,
  },
  {
    href: '/',
    messagesKey: 'dashboard',
    icon: <SparklesIcon className="h-5 w-5" />,
    activeRegExp: /^\/(discover\/?)?$/,
  },
  {
    href: '/discover/movies',
    messagesKey: 'browsemovies',
    icon: <FilmIcon className="h-5 w-5" />,
    activeRegExp: /^\/discover\/movies$/,
  },
  {
    href: '/discover/tv',
    messagesKey: 'browsetv',
    icon: <TvIcon className="h-5 w-5" />,
    activeRegExp: /^\/discover\/tv$/,
  },
  {
    href: '/requests',
    messagesKey: 'requests',
    icon: <ClockIcon className="h-5 w-5" />,
    activeRegExp: /^\/requests/,
  },
  {
    href: '/blocklist',
    messagesKey: 'blocklist',
    icon: <EyeSlashIcon className="h-5 w-5" />,
    activeRegExp: /^\/blocklist/,
    requiredPermission: [
      Permission.MANAGE_BLOCKLIST,
      Permission.VIEW_BLOCKLIST,
    ],
    permissionType: 'or',
  },
  {
    href: '/issues',
    messagesKey: 'issues',
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    activeRegExp: /^\/issues/,
    requiredPermission: [
      Permission.MANAGE_ISSUES,
      Permission.CREATE_ISSUES,
      Permission.VIEW_ISSUES,
    ],
    permissionType: 'or',
  },
  {
    href: '/users',
    messagesKey: 'users',
    icon: <UsersIcon className="h-5 w-5" />,
    activeRegExp: /^\/users/,
    requiredPermission: Permission.MANAGE_USERS,
    dataTestId: 'sidebar-menu-users',
  },
  {
    href: '/settings',
    messagesKey: 'settings',
    icon: <CogIcon className="h-5 w-5" />,
    activeRegExp: /^\/settings/,
    requiredPermission: Permission.ADMIN,
    dataTestId: 'sidebar-menu-settings',
  },
];

function NativeSidebarMenu({
  mobile = false,
  pendingRequestsCount,
  openIssuesCount,
  onNavigate,
}: {
  mobile?: boolean;
  pendingRequestsCount: number;
  openIssuesCount: number;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useUser();

  return (
    <nav className="seerr-sidebar-menu seerr-sidebar-nav flex-1 space-y-1 overflow-y-auto">
      {sidebarLinks
        .filter((link) =>
          link.requiredPermission
            ? hasPermission(link.requiredPermission, {
                type: link.permissionType ?? 'and',
              })
            : true
        )
        .map((link) => {
          const active = Boolean(router.pathname.match(link.activeRegExp));
          const count =
            link.messagesKey === 'requests' &&
            hasPermission(Permission.MANAGE_REQUESTS)
              ? pendingRequestsCount
              : link.messagesKey === 'issues' &&
                  hasPermission(Permission.MANAGE_ISSUES)
                ? openIssuesCount
                : 0;

          const content = (
            <>
              {link.icon}
              <span>{intl.formatMessage(menuMessages[link.messagesKey])}</span>
              {count > 0 ? (
                <Badge className="ml-auto rounded-md border-primary bg-primary">
                  {count}
                </Badge>
              ) : null}
            </>
          );
          const className =
            'seerr-sidebar-nav-link flex items-center gap-3 px-3 py-2.5 text-sm font-medium';
          const testId = link.dataTestId
            ? `${link.dataTestId}${mobile ? '-mobile' : ''}`
            : undefined;

          return link.external ? (
            <a
              key={`${mobile ? 'mobile' : 'desktop'}-${link.messagesKey}`}
              href={link.href}
              onClick={onNavigate}
              className={className}
              data-testid={testId}
            >
              {content}
            </a>
          ) : (
            <Link
              key={`${mobile ? 'mobile' : 'desktop'}-${link.messagesKey}`}
              href={link.href}
              onClick={onNavigate}
              className={className}
              aria-current={active ? 'page' : undefined}
              data-testid={testId}
            >
              {content}
            </Link>
          );
        })}
    </nav>
  );
}

const Sidebar = ({
  open,
  setClosed,
  pendingRequestsCount,
  openIssuesCount,
  revalidateIssueCount,
  revalidateRequestsCount,
}: SidebarProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useUser();
  useClickOutside(navRef, () => setClosed());

  useEffect(() => {
    if (openIssuesCount) {
      revalidateIssueCount();
    }

    if (pendingRequestsCount) {
      revalidateRequestsCount();
    }
  }, [
    revalidateIssueCount,
    revalidateRequestsCount,
    pendingRequestsCount,
    openIssuesCount,
  ]);

  return (
    <>
      <div className="lg:hidden">
        <Transition as={Fragment} show={open}>
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as="div"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-zinc-950 opacity-90"></div>
              </div>
            </Transition.Child>
            <Transition.Child
              as="div"
              enter="transition-transform ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <>
                <div className="sidebar seerr-sidebar-mobile-panel relative flex h-full w-full max-w-[var(--sidebar-width)] flex-1 flex-col">
                  <div className="sidebar-close-button absolute right-0 -mr-14 p-1">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6"
                  >
                    <div className="seerr-sidebar-brand flex flex-shrink-0">
                      <Link
                        href="/"
                        className="relative block h-[22px] w-40 shrink-0"
                        aria-label={intl.formatMessage(menuMessages.home)}
                      >
                        <img
                          src={`${router.basePath}/logo_full.svg`}
                          alt=""
                          className="h-[22px] w-full object-contain object-left"
                        />
                      </Link>
                    </div>
                    <NativeSidebarMenu
                      mobile
                      pendingRequestsCount={pendingRequestsCount}
                      openIssuesCount={openIssuesCount}
                      onNavigate={setClosed}
                    />
                    <div className="mt-auto px-5 pt-2">
                      <UserWarnings onClick={() => setClosed()} />
                    </div>

                    {hasPermission(Permission.ADMIN) && (
                      <div className="px-5 pb-2">
                        <VersionStatus onClick={() => setClosed()} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-14 flex-shrink-0">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition.Child>
          </div>
        </Transition>
      </div>

      <div className="fixed bottom-0 left-0 top-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div className="sidebar seerr-sidebar-desktop flex flex-col">
          <div className="flex h-0 min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4">
              <div className="seerr-sidebar-brand flex flex-shrink-0">
                <Link
                  href="/"
                  className="relative block h-[22px] w-40 shrink-0"
                  aria-label={intl.formatMessage(menuMessages.home)}
                >
                  <img
                    src={`${router.basePath}/logo_full.svg`}
                    alt=""
                    className="h-[22px] w-full object-contain object-left"
                  />
                </Link>
              </div>
              <NativeSidebarMenu
                pendingRequestsCount={pendingRequestsCount}
                openIssuesCount={openIssuesCount}
              />
              <div className="mt-auto px-5 pt-2">
                <UserWarnings />
              </div>
              {hasPermission(Permission.ADMIN) && (
                <div className="px-5 pb-2">
                  <VersionStatus />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
