import type { JSX } from 'react';
import React from 'react';

interface SideBarLinkProps {
  active?: boolean;
  icon: any;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  href?: string;
  title?: string;
  id?: string;
}

export function SideBarLink({
  active = false,
  icon,
  onClick,
  href,
  title = '',
  id = ''
}: SideBarLinkProps): JSX.Element {
  if (href) {
    return (
      <a
        className={`flex items-center justify-center p-1 ${active ? 'cursor-pointer bg-[#D49511] rounded-full' : 'cursor-pointer'}`}
        title={title}
        id={id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {React.createElement(icon, { className: 'text-white', fontSize: 'large' })}
      </a>
    );
  }
  return (
    <div
      className={`flex items-center justify-center p-1 ${active ? 'cursor-pointer bg-[#D49511] rounded-full' : 'cursor-pointer'}`}
      title={title}
      id={id}
      onClick={onClick}
    >
      {React.createElement(icon, { className: 'text-white', fontSize: 'large' })}
    </div>
  );
}
