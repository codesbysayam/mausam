import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: 'div' | 'main' | 'section' | 'article';
  fluid?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  id = 'mausam-page-container',
  as: Component = 'div',
  fluid = false,
}) => {
  return (
    <Component
      id={id}
      className={`mausam-page w-full ${
        fluid ? 'w-full px-4' : 'container'
      } py-4 sm:py-6 flex-1 min-w-0 overflow-x-hidden safe-area-bottom ${className}`}
    >
      {children}
    </Component>
  );
};

