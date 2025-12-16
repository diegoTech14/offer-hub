CREATE TABLE nfts_awarded (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nft_type TEXT NOT NULL,
  token_id_on_chain TEXT NOT NULL,
  minted_at TIMESTAMP DEFAULT NOW()
);

