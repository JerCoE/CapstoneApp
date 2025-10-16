import RequestForm, { type RequestFormHandle } from './RequestForm.tsx';
import React, { useRef, useState, useEffect } from 'react';

const ButtonRequest: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const requestFormRef = useRef<RequestFormHandle | null>(null);

  useEffect(() => {
    if (showForm) {
      requestFormRef.current?.scrollTo?.();
    }
  }, [showForm]);

  return (
    <>
      {showForm && (
        <RequestForm ref={requestFormRef} onClose={() => setShowForm(false)} />
      )}

      <div className="sidebar-buttons">
        <button
          className="apply-btn"
          onClick={() => {
            if (!showForm) {
              setShowForm(true);
              // you can keep this or remove it — the useEffect above will also call scrollTo
              setTimeout(() => {
                requestFormRef.current?.scrollTo?.();
              }, 40);
            } else {
              requestFormRef.current?.scrollTo?.();
            }
          }}
        >+ Apply Leave </button>
      </div>
    </>
  );
};

export default ButtonRequest;