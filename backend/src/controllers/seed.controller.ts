import { Request, Response } from 'express';
import { supabase } from '@/lib/supabase/supabase';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';
import * as fs from 'fs';
import * as path from 'path';

export const seedProjects = async (req: Request, res: Response) => {
  try {
    // Check if running in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json(
        buildErrorResponse('Seeding is not allowed in production')
      );
    }

    // Get or create a test user
    let userId: string;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      console.log('Using existing user:', userId);
    } else {
      // Create a default test user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          email: 'test@example.com',
          password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz',
          name: 'Test User',
          role: 'client',
          username: 'testuser'
        }])
        .select()
        .single();

      if (userError || !newUser) {
        return res.status(500).json(
          buildErrorResponse('Failed to create test user')
        );
      }

      userId = newUser.id;
      console.log('Created new test user:', userId);
    }

    // Check if projects already exist
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return res.json(
        buildSuccessResponse({ 
          projectsCount: count,
          message: 'Projects already seeded' 
        }, 'Database already has projects')
      );
    }

    // Insert 15 mock projects
    const projects = [
      { title: 'E-commerce Website Development', description: 'Build a modern e-commerce platform with payment integration and user authentication', category: 'development', budget: 5000, status: 'active' },
      { title: 'Mobile App UI/UX Design', description: 'Design a beautiful and intuitive mobile app interface for iOS and Android', category: 'design', budget: 2500, status: 'active' },
      { title: 'Social Media Marketing Campaign', description: 'Create and manage a 3-month social media marketing campaign across platforms', category: 'marketing', budget: 3500, status: 'active' },
      { title: 'Logo and Brand Identity', description: 'Design a unique logo and complete brand identity package', category: 'design', budget: 1500, status: 'completed' },
      { title: 'React Native Mobile App', description: 'Develop a cross-platform mobile application using React Native', category: 'development', budget: 8000, status: 'active' },
      { title: 'SEO Optimization Service', description: 'Improve website SEO and search engine rankings', category: 'marketing', budget: 2000, status: 'completed' },
      { title: 'WordPress Website Setup', description: 'Set up and customize a WordPress website with theme and plugins', category: 'development', budget: 1200, status: 'completed' },
      { title: 'Product Photography', description: 'Professional photography for 50 products with editing', category: 'design', budget: 1800, status: 'active' },
      { title: 'Content Writing Service', description: 'Write 20 blog posts for website content marketing', category: 'marketing', budget: 1000, status: 'pending' },
      { title: 'REST API Development', description: 'Build a RESTful API with Node.js and Express', category: 'development', budget: 4500, status: 'active' },
      { title: 'Video Editing Service', description: 'Edit promotional videos for social media marketing', category: 'design', budget: 2200, status: 'completed' },
      { title: 'Database Migration', description: 'Migrate existing database to PostgreSQL with optimization', category: 'development', budget: 3000, status: 'pending' },
      { title: 'Landing Page Design', description: 'Create a high-converting landing page design', category: 'design', budget: 1500, status: 'active' },
      { title: 'Email Marketing Campaign', description: 'Design and implement an automated email marketing funnel', category: 'marketing', budget: 2800, status: 'completed' },
      { title: 'Dashboard Analytics Tool', description: 'Build a custom analytics dashboard with charts and reports', category: 'development', budget: 6500, status: 'active' }
    ];

    const projectsToInsert = projects.map(p => ({
      client_id: userId,
      title: p.title,
      description: p.description,
      category: p.category,
      budget: p.budget,
      status: p.status
    }));

    const { data: insertedProjects, error: insertError } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();

    if (insertError) {
      return res.status(500).json(
        buildErrorResponse(`Failed to insert projects: ${insertError.message}`)
      );
    }

    return res.json(
      buildSuccessResponse({
        projectsCreated: insertedProjects?.length || 0,
        userId: userId,
        projects: insertedProjects
      }, 'Projects seeded successfully')
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return res.status(500).json(
      buildErrorResponse(error instanceof Error ? error.message : 'Seeding failed')
    );
  }
};

export const createWaitlistTable = async (req: Request, res: Response) => {
  try {
    // Check if running in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json(
        buildErrorResponse('Migration is not allowed in production')
      );
    }

    // Check if table already exists
    const { error: checkError } = await supabase
      .from('waitlist')
      .select('id')
      .limit(1);

    if (!checkError) {
      return res.json(
        buildSuccessResponse(
          { tableExists: true },
          'Waitlist table already exists'
        )
      );
    }

    // Create table using raw SQL via insert (workaround)
    // Note: This requires enabling raw SQL access in Supabase or running migration manually
    console.log('Table does not exist. Creating manually...');

    // Manual creation attempt - if this fails, table must be created via Supabase dashboard
    try {
      await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS waitlist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            comments TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
          CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
        `
      });

      return res.json(
        buildSuccessResponse(
          { tableCreated: true },
          'Waitlist table created successfully'
        )
      );
    } catch (rpcError: any) {
      // If RPC method doesn't exist, provide instructions
      return res.json(
        buildSuccessResponse(
          {
            tableCreated: false,
            instructions: 'Run migration manually via Supabase SQL Editor',
            migrationFile: 'backend/supabase/migrations/20250111000001_create_waitlist.sql'
          },
          'Please create table manually - RPC not available'
        )
      );
    }

  } catch (error) {
    console.error('Table creation error:', error);
    return res.status(500).json(
      buildErrorResponse(error instanceof Error ? error.message : 'Creation failed')
    );
  }
};

