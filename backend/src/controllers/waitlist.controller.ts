import { Request, Response } from 'express';
import { supabase } from '@/lib/supabase/supabase';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';

// In-memory storage for waitlist (fallback if table doesn't exist)
const inMemoryWaitlist: Array<{
  id: string;
  name: string;
  email: string;
  comments?: string;
  created_at: string;
}> = [];

export const addToWaitlist = async (req: Request, res: Response) => {
  try {
    const { name, email, comments } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json(
        buildErrorResponse('Name and email are required')
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(
        buildErrorResponse('Invalid email format')
      );
    }

    // Try to insert into Supabase table
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return res.status(409).json(
          buildErrorResponse('This email is already on the waitlist')
        );
      }

      // Insert into waitlist
      const { data, error } = await supabase
        .from('waitlist')
        .insert([{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          comments: comments?.trim() || null,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Added to Supabase waitlist:', email);

      return res.status(201).json(
        buildSuccessResponse(
          {
            id: data.id,
            name: data.name,
            email: data.email,
            created_at: data.created_at
          },
          'Successfully added to waitlist! We\'ll contact you soon.'
        )
      );

    } catch (supabaseError: any) {
      // If table doesn't exist, use in-memory storage
      console.warn('Supabase waitlist table not found, using in-memory storage');
      
      // Check if email already exists in memory
      const existingInMemory = inMemoryWaitlist.find(
        entry => entry.email.toLowerCase() === email.toLowerCase()
      );

      if (existingInMemory) {
        return res.status(409).json(
          buildErrorResponse('This email is already on the waitlist')
        );
      }

      // Add to in-memory storage
      const newEntry = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        comments: comments?.trim(),
        created_at: new Date().toISOString()
      };

      inMemoryWaitlist.push(newEntry);
      
      console.log(`✅ Added to in-memory waitlist (${inMemoryWaitlist.length} total):`, email);

      return res.status(201).json(
        buildSuccessResponse(
          {
            id: newEntry.id,
            name: newEntry.name,
            email: newEntry.email,
            created_at: newEntry.created_at,
            note: 'Stored in memory - will be lost on server restart. Create waitlist table for persistence.'
          },
          'Successfully added to waitlist! We\'ll contact you soon.'
        )
      );
    }

  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json(
      buildErrorResponse(error instanceof Error ? error.message : 'Server error')
    );
  }
};

export const getWaitlistCount = async (req: Request, res: Response) => {
  try {
    // Try Supabase first
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      return res.json(
        buildSuccessResponse({ count: count || 0 }, 'Waitlist count retrieved')
      );
    }

    // Fallback to in-memory count
    return res.json(
      buildSuccessResponse(
        { count: inMemoryWaitlist.length, storage: 'in-memory' },
        'Waitlist count retrieved from memory'
      )
    );

  } catch (error) {
    console.error('Waitlist count error:', error);
    return res.json(
      buildSuccessResponse({ count: inMemoryWaitlist.length }, 'Count from memory')
    );
  }
};

