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
      className={`mausam-page w-full mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-5 lg:py-6 flex-1 min-w-0 overflow-x-hidden safe-area-bottom ${
        fluid ? 'max-w-full' : 'max-w-[1440px]'
      } ${className}`}
    >
      {children}
    </Component>
  );
};

