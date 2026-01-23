
type Raiting = 1 | 2 | 3 | 4 | 5;

export interface TaskRecord {
    id: string;
    project_id?: string | null;
    freelancer_id: string;
    client_id: string;
    completed: boolean;
    rating: Raiting | null;
    comment: string | null;
    on_chain_tx_hash: string | null;
    created_at: string;
    updated_at?: string;
}

export interface CreateTaskRecordDTO {
  projectId: string;
  freelancerId: string;
  clientId: string;
  completed: boolean;
}

export interface UpdateTaskRatingDTO {
  rating: number;      
  comment?: string;   
}
