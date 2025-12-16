CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type TEXT CHECK (contract_type IN ('project', 'service')),
  project_id UUID,
  service_request_id UUID,
  freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contract_on_chain_id TEXT NOT NULL,
  escrow_status TEXT DEFAULT 'pending',
  amount_locked DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL,
  CONSTRAINT fk_service_request FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL
);
