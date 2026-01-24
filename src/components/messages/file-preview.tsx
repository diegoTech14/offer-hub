"use client";

import React from 'react';
import { FilePreview as BaseFilePreview } from '@/components/file-sharing';

export default function FilePreview(props: React.ComponentProps<typeof BaseFilePreview>) {
  return <BaseFilePreview {...props} />;
}


