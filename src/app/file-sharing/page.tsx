"use client";

import React from 'react';
import { FileSharingPanel } from '@/components/file-sharing';

export default function FileSharingPage() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <h1 className="text-lg font-bold text-neutral-800">File & Media Sharing</h1>
      <p className="mt-1 text-sm text-neutral-600">Upload, preview, organize, and share files securely.</p>
      <div className="mt-4">
        <FileSharingPanel />
      </div>
    </main>
  );
}


