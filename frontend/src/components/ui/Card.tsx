import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

const Card = ({ children, className = '', padding = true }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
        padding ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
