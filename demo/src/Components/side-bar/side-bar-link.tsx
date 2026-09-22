import type { JSX } from 'react';
import React from 'react';

interface SideBarLinkProps {
  active?: boolean;
  icon: any;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  href?: string;
  title?: string;
  id?: string;
  iconOnly?: boolean;
}

export function SideBarLink({
  active = false,
  icon,
  onClick,
  href,
  title = '',
  id = '',
  iconOnly = false
}: SideBarLinkProps): JSX.Element {
  const className = iconOnly
    ? 'sidebar-icon-link flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/8'
    : `sidebar-link ${active ? 'sidebar-link--active' : ''}`;
  if (href) {
    return (
      <a
        className={className}
        title={title}
        id={id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {React.createElement(icon, { fontSize: 'small' })}
        {!iconOnly && <span>{title}</span>}
      </a>
    );
  }
  return (
    <div className={className} title={title} id={id} onClick={onClick}>
      {React.createElement(icon, { fontSize: 'small' })}
      {!iconOnly && <span>{title}</span>}
    </div>
  );
}
