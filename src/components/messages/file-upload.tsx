"use client";

import React from 'react';
import { FileUpload as BaseFileUpload } from '@/components/file-sharing';

export default function FileUpload(props: React.ComponentProps<typeof BaseFileUpload>) {
  return <BaseFileUpload {...props} />;
}


