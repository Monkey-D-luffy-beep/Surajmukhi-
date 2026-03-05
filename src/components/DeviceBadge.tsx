// src/components/DeviceBadge.tsx
import React from 'react';

interface DeviceBadgeProps {
  deviceName: string;
}

export default function DeviceBadge({ deviceName }: DeviceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      {deviceName}
    </span>
  );
}
