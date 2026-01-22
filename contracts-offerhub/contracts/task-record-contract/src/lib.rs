#![no_std]
use soroban_sdk::{Address, Env, String,  Vec, contract, contractimpl, contracttype,};
use crate::errors::Errors;
use crate::events::{_emit_initialized,_emit_task_record};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TaskRecord {
    pub task_id: u64,
    pub project_id: String,
    pub freelancer_id: String,
    pub client_id: String,
    pub completed: bool,
    pub timestamp: u64,

}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TaskCounter,
    Task(u64), 
    FreelancerTasks(String), 
    ClientTasks(String), 
}

#[contract]
pub struct TaskRecordContract;

#[contractimpl]
impl TaskRecordContract {

    pub fn initialize(env: Env, admin: Address) -> Result<(),Errors> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Errors::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TaskCounter, &0u64);

        _emit_initialized(&env, admin);
        Ok(())
    }

    pub fn record_task_outcome(
        env: Env,
        project_id: String,
        freelancer_id: String,
        client_id: String,
        completed: bool,
    ) -> Result<u64, Errors> {
    
        let admin: Address = match env.storage().instance().get(&DataKey::Admin){
              Some(x) => x , 
              None => return Err(Errors::Unauthorized)
        };
            
        
            admin.require_auth();


        let mut task_counter: u64 = env.storage().instance()
            .get(&DataKey::TaskCounter)
            .unwrap_or(0);
        task_counter += 1;

        let task_record = TaskRecord {
            task_id: task_counter,
            project_id,
            freelancer_id: freelancer_id.clone(),
            client_id: client_id.clone(),
            completed,
            timestamp: env.ledger().timestamp(),
         };

        env.storage().persistent().set(&DataKey::Task(task_counter), &task_record);

        let mut freelancer_tasks: Vec<u64> = env.storage().persistent()
            .get(&DataKey::FreelancerTasks(freelancer_id.clone()))
            .unwrap_or(Vec::new(&env));
        freelancer_tasks.push_back(task_counter);
        env.storage().persistent().set(&DataKey::FreelancerTasks(freelancer_id), &freelancer_tasks);

        let mut client_tasks: Vec<u64> = env.storage().persistent()
            .get(&DataKey::ClientTasks(client_id.clone()))
            .unwrap_or(Vec::new(&env));
        client_tasks.push_back(task_counter);
        env.storage().persistent().set(&DataKey::ClientTasks(client_id), &client_tasks);

        env.storage().instance().set(&DataKey::TaskCounter, &task_counter);

        _emit_task_record(&env, task_counter);

       Ok(task_counter)
    }

    pub fn get_tasks_for_freelancer(env: Env, freelancer_id: String) -> Vec<TaskRecord> {
        let task_ids: Vec<u64> = env.storage().persistent()
            .get(&DataKey::FreelancerTasks(freelancer_id))
            .unwrap_or(Vec::new(&env));

        let mut tasks = Vec::new(&env);
        for i in 0..task_ids.len() {
            if let Some(task_id) = task_ids.get(i) {
                if let Some(task) = env.storage().persistent().get(&DataKey::Task(task_id)) {
                    tasks.push_back(task);
                }
            }
        }
        tasks
    }

    pub fn get_tasks_for_client(env: Env, client_id: String) -> Vec<TaskRecord> {
        let task_ids: Vec<u64> = env.storage().persistent()
            .get(&DataKey::ClientTasks(client_id))
            .unwrap_or(Vec::new(&env));

        let mut tasks = Vec::new(&env);
        for i in 0..task_ids.len() {
            if let Some(task_id) = task_ids.get(i) {
                if let Some(task) = env.storage().persistent().get(&DataKey::Task(task_id)) {
                    tasks.push_back(task);
                }
            }
        }
        tasks
    }

}


mod test;
mod errors;
mod events;