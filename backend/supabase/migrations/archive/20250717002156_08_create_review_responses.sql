-- Migration: Create Review Responses System
-- Description: Implements database schema for review responses and analytics
-- Date: 2025-01-12

-- Create review_responses table
CREATE TABLE review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,
  moderator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  
  CONSTRAINT one_response_per_review UNIQUE (review_id, responder_id)
);

-- Create response_analytics table
CREATE TABLE response_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES review_responses(id) ON DELETE CASCADE,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX idx_review_responses_responder_id ON review_responses(responder_id);
CREATE INDEX idx_review_responses_status ON review_responses(status);
CREATE INDEX idx_review_responses_created_at ON review_responses(created_at);
CREATE INDEX idx_response_analytics_response_id ON response_analytics(response_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_review_responses_updated_at 
    BEFORE UPDATE ON review_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_analytics_updated_at 
    BEFORE UPDATE ON response_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for review_responses
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view responses for reviews they're involved in
CREATE POLICY "Users can view responses for their reviews" ON review_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reviews 
            WHERE reviews.id = review_responses.review_id 
            AND (reviews.from_user_id = auth.uid() OR reviews.to_user_id = auth.uid())
        )
    );

-- Policy: Users can create responses for reviews they received
CREATE POLICY "Users can respond to reviews they received" ON review_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reviews 
            WHERE reviews.id = review_responses.review_id 
            AND reviews.to_user_id = auth.uid()
        )
    );

-- Policy: Users can update their own pending responses
CREATE POLICY "Users can update their own pending responses" ON review_responses
    FOR UPDATE USING (
        responder_id = auth.uid() AND status = 'pending'
    );

-- Policy: Users can delete their own pending responses
CREATE POLICY "Users can delete their own pending responses" ON review_responses
    FOR DELETE USING (
        responder_id = auth.uid() AND status = 'pending'
    );

-- Policy: Moderators can moderate responses
CREATE POLICY "Moderators can moderate responses" ON review_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'moderator'
        )
    );

-- Add RLS policies for response_analytics
ALTER TABLE response_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view analytics for responses they can see
CREATE POLICY "Users can view response analytics" ON response_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM review_responses 
            JOIN reviews ON review_responses.review_id = reviews.id
            WHERE review_responses.id = response_analytics.response_id
            AND (reviews.from_user_id = auth.uid() OR reviews.to_user_id = auth.uid())
        )
    );

-- Policy: System can update analytics
CREATE POLICY "System can update analytics" ON response_analytics
    FOR ALL USING (true);

-- Create function to automatically create analytics record
CREATE OR REPLACE FUNCTION create_response_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO response_analytics (response_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-create analytics record
CREATE TRIGGER create_response_analytics_trigger
    AFTER INSERT ON review_responses
    FOR EACH ROW EXECUTE FUNCTION create_response_analytics();

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
    helpful_votes INTEGER,
    unhelpful_votes INTEGER,
    views_count INTEGER
) RETURNS DECIMAL(3,2) AS $$
BEGIN
    IF views_count = 0 THEN
        RETURN 0.00;
    END IF;
    
    RETURN LEAST(5.00, GREATEST(0.00, 
        (helpful_votes::DECIMAL / GREATEST(views_count, 1)) * 5.00
    ));
END;
$$ LANGUAGE plpgsql;

-- Create function to update engagement score
CREATE OR REPLACE FUNCTION update_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_score = calculate_engagement_score(
        NEW.helpful_votes, 
        NEW.unhelpful_votes, 
        NEW.views_count
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update engagement score
CREATE TRIGGER update_engagement_score_trigger
    BEFORE UPDATE ON response_analytics
    FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

-- Add comments for documentation
COMMENT ON TABLE review_responses IS 'Stores responses to reviews with moderation support';
COMMENT ON TABLE response_analytics IS 'Tracks analytics and engagement metrics for review responses';
COMMENT ON COLUMN review_responses.status IS 'Moderation status: pending, approved, rejected, flagged';
COMMENT ON COLUMN response_analytics.engagement_score IS 'Calculated engagement score based on votes and views (0.00-5.00)';
