import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-xl shadow-sm border border-gray-100 bg-white p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
