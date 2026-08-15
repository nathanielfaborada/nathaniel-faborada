import React, { useState, useEffect, useRef } from 'react';
import './DeleteConfirmModal.css';

export default function DeleteConfirmModal({
  isOpen,
  type, // 'creation' | 'organization' | 'workExperience'
  item,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !item) return null;

  const title =
    item.title ||
    item.name ||
    item.company_name ||
    item.company ||
    (item.role_title ? `${item.role_title} at ${item.company_name || item.company}` : 'Item');

  const typeLabel =
    type === 'creation'
      ? 'Project Creation'
      : type === 'organization'
      ? 'Organization'
      : 'Work Experience';

  const isMatched = inputText.trim() === 'DELETE';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMatched && !isDeleting) {
      onConfirm(type, item);
    }
  };

  return (
    <div
      className="delete-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="delete-modal-card" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="delete-modal-header">
          <div className="delete-header-left">
            <div className="delete-warning-icon-wrap">
              ⚠️
            </div>
            <h2 className="delete-modal-title">Confirm Deletion</h2>
          </div>
          <button
            type="button"
            className="delete-modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="delete-modal-body">
            <div className="delete-item-preview-box">
              <span className="delete-item-type-badge">{typeLabel}</span>
              <span className="delete-item-title-text">{title}</span>
            </div>

            <p className="delete-warning-text">
              This action cannot be undone. This will permanently remove the record from your database.
            </p>

            <p className="delete-safeguard-prompt">
              To confirm, type <span className="delete-keyword-tag">DELETE</span> below:
            </p>

            <input
              ref={inputRef}
              type="text"
              className={`delete-safeguard-input ${isMatched ? 'is-matched' : ''}`}
              placeholder='Type "DELETE" to confirm'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isDeleting}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Footer */}
          <div className="delete-modal-footer">
            <button
              type="button"
              className="delete-cancel-btn"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="delete-confirm-btn"
              disabled={!isMatched || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
