// components/ui/card.js
import React from 'react';

const Card = ({ children, className = "", onClick, ...rest }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded shadow-sm bg-white transition-all ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
