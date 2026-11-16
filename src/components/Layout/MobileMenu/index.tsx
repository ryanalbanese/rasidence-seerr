import Badge from '@app/components/Common/Badge';
import { menuMessages } from '@app/components/Layout/sidebar-messages';
import useClickOutside from '@app/hooks/useClickOutside';
import { Permission, useUser } from '@app/hooks/useUser';
import { Transition } from '@headlessui/react';
import {
  ClockIcon,
  CogIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FilmIcon,
  HomeIcon,
  SparklesIcon,
  TvIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  ClockIcon as FilledClockIcon,
  CogIcon as FilledCogIcon,
  ExclamationTriangleIcon as FilledExclamationTriangleIcon,
  EyeSlashIcon as FilledEyeSlashIcon,
  FilmIcon as FilledFilmIcon,
  HomeIcon as FilledHomeIcon,
  SparklesIcon as FilledSparklesIcon,
  TvIcon as FilledTvIcon,
  UsersIcon as FilledUsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cloneElement, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

interface MobileMenuProps {
  pendingRequestsCount: number;
  openIssuesCount: number;
  revalidateIssueCount: () => void;
  revalidateRequestsCount: () => void;
}

interface MenuLink {
  href: string;
  svgIcon: JSX.Element;
  svgIconSelected: JSX.Element;
  content: React.ReactNode;
  activeRegExp: RegExp;
  as?: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
  dataTestId?: string;
  external?: boolean;
  externalHref?: string;
}

const MobileMenu = ({
  pendingRequestsCount,
  openIssuesCount,
  revalidateIssueCount,
  revalidateRequestsCount,
}: MobileMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = useUser();
  const router = useRouter();
  useClickOutside(ref, () => {
    setTimeout(() => {
      if (isOpen) {
        setIsOpen(false);
      }
    }, 150);
  });

  const toggle = () => setIsOpen(!isOpen);

  const menuLinks: MenuLink[] = [
    {
      href: '#',
      external: true,
      externalHref: '/',
      content: intl.formatMessage(menuMessages.home),
      svgIcon: <HomeIcon className="h-6 w-6" />,
      svgIconSelected: <FilledHomeIcon className="h-6 w-6" />,
      activeRegExp: /^$/,
    },
    {
      href: '/',
      content: intl.formatMessage(menuMessages.dashboard),
      svgIcon: <SparklesIcon className="h-6 w-6" />,
      svgIconSelected: <FilledSparklesIcon className="h-6 w-6" />,
      activeRegExp: /^\/(discover\/?)?$/,
    },
    {
      href: '/discover/movies',
      content: intl.formatMessage(menuMessages.browsemovies),
      svgIcon: <FilmIcon className="h-6 w-6" />,
      svgIconSelected: <FilledFilmIcon className="h-6 w-6" />,
      activeRegExp: /^\/discover\/movies$/,
    },
    {
      href: '/discover/tv',
      content: intl.formatMessage(menuMessages.browsetv),
      svgIcon: <TvIcon className="h-6 w-6" />,
      svgIconSelected: <FilledTvIcon className="h-6 w-6" />,
      activeRegExp: /^\/discover\/tv$/,
    },
    {
      href: '/requests',
      content: intl.formatMessage(menuMessages.requests),
      svgIcon: <ClockIcon className="h-6 w-6" />,
      svgIconSelected: <FilledClockIcon className="h-6 w-6" />,
      activeRegExp: /^\/requests/,
    },
    {
      href: '/blocklist',
      content: intl.formatMessage(menuMessages.blocklist),
      svgIcon: <EyeSlashIcon className="h-6 w-6" />,
      svgIconSelected: <FilledEyeSlashIcon className="h-6 w-6" />,
      activeRegExp: /^\/blocklist/,
      requiredPermission: [
        Permission.MANAGE_BLOCKLIST,
        Permission.VIEW_BLOCKLIST,
      ],
      permissionType: 'or',
    },
    {
      href: '/issues',
      content: intl.formatMessage(menuMessages.issues),
      svgIcon: <ExclamationTriangleIcon className="h-6 w-6" />,
      svgIconSelected: <FilledExclamationTriangleIcon className="h-6 w-6" />,
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
      content: intl.formatMessage(menuMessages.users),
      svgIcon: <UsersIcon className="mr-3 h-6 w-6" />,
      svgIconSelected: <FilledUsersIcon className="mr-3 h-6 w-6" />,
      activeRegExp: /^\/users/,
      requiredPermission: Permission.MANAGE_USERS,
      dataTestId: 'sidebar-menu-users',
    },
    {
      href: '/settings',
      content: intl.formatMessage(menuMessages.settings),
      svgIcon: <CogIcon className="mr-3 h-6 w-6" />,
      svgIconSelected: <FilledCogIcon className="mr-3 h-6 w-6" />,
      activeRegExp: /^\/settings/,
      requiredPermission: Permission.ADMIN,
      dataTestId: 'sidebar-menu-settings',
    },
  ];

  const filteredLinks = menuLinks.filter(
    (link) =>
      !link.requiredPermission ||
      hasPermission(link.requiredPermission, {
        type: link.permissionType ?? 'and',
      })
  );

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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Transition
        show={isOpen}
        as="div"
        ref={ref}
        enter="transition duration-500"
        enterFrom="opacity-0 translate-y-0"
        enterTo="opacity-100 -translate-y-full"
        leave="transition duration-500"
        leaveFrom="opacity-100 -translate-y-full"
        leaveTo="opacity-0 translate-y-0"
        className="absolute left-0 right-0 top-0 flex w-full -translate-y-full flex-col space-y-6 border-t border-zinc-700 bg-zinc-950 bg-opacity-90 px-6 py-6 font-semibold text-zinc-100 backdrop-blur"
      >
        {filteredLinks.map((link) => {
          const isActive = router.pathname.match(link.activeRegExp);
          const linkContent = (
            <>
              {cloneElement(isActive ? link.svgIconSelected : link.svgIcon, {
                className: 'h-5 w-5',
              })}
              <span className="ml-2">{link.content}</span>
              {link.href === '/requests' &&
                pendingRequestsCount > 0 &&
                hasPermission(Permission.MANAGE_REQUESTS) && (
                  <div className="ml-auto flex">
                    <Badge className="rounded-md border border-zinc-600 bg-zinc-700">
                      {pendingRequestsCount}
                    </Badge>
                  </div>
                )}
              {link.href === '/issues' &&
                openIssuesCount > 0 &&
                hasPermission(Permission.MANAGE_ISSUES) && (
                  <div className="ml-auto flex">
                    <Badge className="rounded-md border border-zinc-600 bg-zinc-700">
                      {openIssuesCount}
                    </Badge>
                  </div>
                )}
            </>
          );
          const linkClassName = `flex items-center rounded-lg px-2 py-2 transition ${
            isActive ? 'bg-zinc-950/5 text-white dark:bg-white/5' : 'text-zinc-400 hover:bg-zinc-950/5 hover:text-white dark:hover:bg-white/5 dark:hover:text-white'
          }`;
          const linkProps = {
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                setIsOpen(false);
              }
            },
            onClick: () => setIsOpen(false),
            role: 'button' as const,
            tabIndex: 0,
          };
          if (link.external && link.externalHref) {
            return (
              <a
                key={`mobile-menu-link-${link.href}`}
                href={link.externalHref}
                className={linkClassName}
                {...linkProps}
              >
                {linkContent}
              </a>
            );
          }
          return (
            <Link
              key={`mobile-menu-link-${link.href}`}
              href={link.href}
              className={linkClassName}
              {...linkProps}
            >
              {linkContent}
            </Link>
          );
        })}
      </Transition>
      <div className="padding-bottom-safe border-t border-zinc-700 bg-zinc-900 bg-opacity-90 backdrop-blur">
        <div className="flex h-full items-center justify-between px-6 py-4 text-zinc-100">
          {filteredLinks
            .slice(0, filteredLinks.length === 5 ? 5 : 4)
            .map((link) => {
              const isActive =
                router.pathname.match(link.activeRegExp) && !isOpen;
              const linkClassName = `relative flex flex-col items-center space-y-1 ${
                isActive ? 'text-zinc-400' : ''
              }`;
              const linkContent = (
                <>
                  {cloneElement(
                    isActive ? link.svgIconSelected : link.svgIcon,
                    {
                      className: 'h-6 w-6',
                    }
                  )}
                  {link.href === '/requests' &&
                    pendingRequestsCount > 0 &&
                    hasPermission(Permission.MANAGE_REQUESTS) && (
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          className={`border border-zinc-600 ${
                            router.pathname.match(link.activeRegExp)
                              ? 'bg-zinc-700'
                              : 'bg-zinc-600'
                          } flex ${
                            pendingRequestsCount > 99 ? 'w-6' : 'w-4'
                          } h-4 items-center justify-center !px-[5px] !py-[7px] text-[8px]`}
                        >
                          {pendingRequestsCount > 99
                            ? '99+'
                            : pendingRequestsCount}
                        </Badge>
                      </div>
                    )}
                </>
              );
              if (link.external && link.externalHref) {
                return (
                  <a
                    key={`mobile-menu-link-${link.href}`}
                    href={link.externalHref}
                    className={linkClassName}
                  >
                    {linkContent}
                  </a>
                );
              }
              return (
                <Link
                  key={`mobile-menu-link-${link.href}`}
                  href={link.href}
                  className={linkClassName}
                >
                  {linkContent}
                </Link>
              );
            })}
          {filteredLinks.length > 4 && filteredLinks.length !== 5 && (
            <button
              className={`flex flex-col items-center space-y-1 ${
                isOpen ? 'text-zinc-400' : ''
              }`}
              onClick={() => toggle()}
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <EllipsisHorizontalIcon className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
