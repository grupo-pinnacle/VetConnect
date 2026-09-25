import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbsProps } from '../../types';
import { cn } from '../../lib/utils';

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  'data-testid': testId = 'breadcrumbs',
}) => {
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate();
  } catch {
    // Fallback for isolated unit tests or Storybook without MemoryRouter
    navigate = null;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      data-testid={testId}
      className={cn(
        'flex items-center text-sm font-sans overflow-x-auto py-1.5 scrollbar-none',
        className
      )}
    >
      <ol className="flex items-center space-x-1.5 sm:space-x-2 text-slate-500 flex-nowrap min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center flex-shrink-0"
            >
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  data-testid="breadcrumb-current"
                  className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-sm"
                >
                  {item.label}
                </span>
              ) : item.path ? (
                <a
                  href={item.path}
                  data-testid={`breadcrumb-link-${index}`}
                  onClick={(e) => {
                    if (navigate && item.path && item.path.startsWith('/')) {
                      e.preventDefault();
                      navigate(item.path);
                    }
                  }}
                  className="text-slate-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded px-1 py-0.5 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-600 hover:text-slate-900 transition-colors px-1 py-0.5">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
