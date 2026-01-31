/**
 * @fileoverview Type guard utilities for runtime type checking and validation
 * @author Offer Hub Team
 */

import { AxiosError } from 'axios';
import { DisputeResponse, EscrowUpdateResponse, TransactionResponse } from '../types/escrow.types';

// Common response status values
const VALID_STATUSES = ['SUCCESS', 'ERROR'] as const;
type ValidStatus = typeof VALID_STATUSES[number];

/**
 * Generic type guard for API responses with status and message
 */
const isApiResponse = (data: unknown): data is { status: string; message: string } => {
  return (
    typeof data === 'object' && 
    data !== null && 
    'status' in data && 
    'message' in data &&
    typeof (data as { status: unknown }).status === 'string' &&
    typeof (data as { message: unknown }).message === 'string' &&
    VALID_STATUSES.includes((data as { status: string }).status as ValidStatus)
  );
};

/**
 * Type guard for DisputeResponse
 */
export const isDisputeResponse = (data: unknown): data is DisputeResponse => {
  return isApiResponse(data);
};

/**
 * Type guard for EscrowUpdateResponse
 */
export const isEscrowUpdateResponse = (data: unknown): data is EscrowUpdateResponse => {
  return isApiResponse(data);
};

/**
 * Type guard for TransactionResponse
 */
export const isTransactionResponse = (data: unknown): data is TransactionResponse => {
  return isApiResponse(data);
};

/**
 * Type guard for AxiosError
 */
export const isApiError = (error: unknown): error is AxiosError => {
  return error instanceof Error && 'response' in error;
};

/**
 * Type guard for error objects with message property
 */
export const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' && 
    error !== null && 
    'message' in error && 
    typeof (error as { message: unknown }).message === 'string'
  );
};

/**
 * Type guard for project attachment objects
 */
export const isProjectAttachment = (attachment: unknown): attachment is { 
  id: string; 
  name: string; 
  url: string; 
  size: number; 
  type: string 
} => {
  if (typeof attachment !== 'object' || attachment === null) return false;
  
  const obj = attachment as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.size === 'number' &&
    typeof obj.type === 'string'
  );
};

/**
 * Type guard for project milestone objects
 */
export const isProjectMilestone = (milestone: unknown): milestone is { 
  id: string; 
  title: string; 
  description: string; 
  amount: number; 
  dueDate: string; 
  status: string 
} => {
  if (typeof milestone !== 'object' || milestone === null) return false;
  
  const obj = milestone as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.dueDate === 'string' &&
    typeof obj.status === 'string'
  );
};
