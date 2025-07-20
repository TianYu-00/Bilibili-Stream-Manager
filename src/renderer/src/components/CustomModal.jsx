import React from 'react'

export default function CustomModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded shadow-xl text-center max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div>{children}</div>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          关闭
        </button>
      </div>
    </div>
  )
}
