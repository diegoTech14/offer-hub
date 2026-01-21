"use client";

import React from 'react';
import { FileManager as BaseFileManager } from '@/components/file-sharing';
import { FileMetadata, FileCategory } from '@/types/file-sharing.types';

export interface FileManagerProps extends React.ComponentProps<typeof BaseFileManager> {}

export default function FileManager(props: FileManagerProps) {
  return <BaseFileManager {...props} />;
}


