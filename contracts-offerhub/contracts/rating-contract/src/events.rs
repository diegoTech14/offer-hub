use soroban_sdk::{symbol_short, Address, Env, String};

pub fn emit_rating_submitted(
    env: &Env,
    rater: &Address,
    rated_user: &Address,
    contract_id: &String,
    rating: u32,
    rating_id: &String,
    total_ratings: &u64,
) {
    env.events().publish(
        (symbol_short!("rating"), symbol_short!("submit")),
        (
            rater.clone(),
            rated_user.clone(),
            contract_id.clone(),
            rating,
            rating_id.clone(),
            total_ratings.clone(),
        ),
    );
}

pub fn emit_feedback_submitted(
    env: &Env,
    rater: &Address,
    rated_user: &Address,
    feedback_id: &String,
    contract_id: &String,
) {
    env.events().publish(
        (symbol_short!("feedback"), symbol_short!("submit")),
        (
            rater.clone(),
            rated_user.clone(),
            feedback_id.clone(),
            contract_id.clone(),
        ),
    );
}

pub fn emit_rating_stats_updated(env: &Env, user: &Address, new_average: u32, total_ratings: u32) {
    env.events().publish(
        (symbol_short!("stats"), symbol_short!("update")),
        (user, new_average, total_ratings),
    );
}

pub fn emit_feedback_reported(
    env: &Env,
    reporter: &Address,
    feedback_id: &String,
    report_id: &String,
) {
    env.events().publish(
        (symbol_short!("feedback"), symbol_short!("report")),
        (reporter.clone(), feedback_id.clone(), report_id.clone()),
    );
}

pub fn emit_feedback_moderated(
    env: &Env,
    moderator: &Address,
    feedback_id: &String,
    action: &String,
) {
    env.events().publish(
        (symbol_short!("feedback"), symbol_short!("moderate")),
        (moderator.clone(), feedback_id.clone(), action.clone()),
    );
}

pub fn emit_restriction_applied(
    env: &Env,
    user: &Address,
    restriction_type: &String,
    reason: &String,
) {
    env.events().publish(
        (symbol_short!("restrict"), symbol_short!("apply")),
        (user.clone(), restriction_type.clone(), reason.clone()),
    );
}

pub fn emit_privilege_granted(env: &Env, user: &Address, privilege: &String) {
    env.events().publish(
        (symbol_short!("privilege"), symbol_short!("grant")),
        (user.clone(), privilege.clone()),
    );
}

pub fn emit_incentive_claimed(env: &Env, user: &Address, incentive_type: &String, reward: &String) {
    env.events().publish(
        (symbol_short!("incentive"), symbol_short!("claim")),
        (user.clone(), incentive_type.clone(), reward.clone()),
    );
}

pub fn emit_achievement_earned(env: &Env, user: &Address, achievement: &String, threshold: u32) {
    env.events().publish(
        (symbol_short!("achieve"), symbol_short!("earn")),
        (user.clone(), achievement.clone(), threshold),
    );
}

#[allow(dead_code)]
pub fn emit_health_check_performed(env: &Env, is_healthy: bool, issues_count: u32, gas_used: u64) {
    env.events().publish(
        (symbol_short!("health"), symbol_short!("check")),
        (is_healthy, issues_count, gas_used),
    );
}

#[allow(dead_code)]
pub fn emit_admin_health_check_performed(
    env: &Env,
    admin: &Address,
    is_healthy: bool,
    issues_count: u32,
    recommendations_count: u32,
) {
    env.events().publish(
        (symbol_short!("health"), symbol_short!("admin")),
        (
            admin.clone(),
            is_healthy,
            issues_count,
            recommendations_count,
        ),
    );
}

#[allow(dead_code)]
pub fn emit_health_issue_detected(env: &Env, issue: &String, severity: &String) {
    env.events().publish(
        (symbol_short!("health"), symbol_short!("issue")),
        (issue.clone(), severity.clone()),
    );
}
