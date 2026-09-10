import React from 'react';

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}

export default Toast;
