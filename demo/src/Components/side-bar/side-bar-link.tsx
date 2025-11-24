import type { JSX } from 'react';
import React from 'react';

interface SideBarLinkProps {
  active: boolean;
  icon: any;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  title?: string;
  id?: string;
}

export function SideBarLink({
  active,
  icon,
  onClick,
  title = '',
  id = ''
}: SideBarLinkProps): JSX.Element {
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
