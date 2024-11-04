#![no_std]

use sails_rs::{
    gstd::{exec, msg},
    prelude::*,
};

struct DictationBattleService {
    battles: Vec<DictationBattle>,
}

#[sails_rs::service]
impl DictationBattleService {
    pub fn new() -> Self {
        Self {
            battles: Vec::new(),
        }
    }

    pub fn create_battle(&mut self, entry_fee: u64, timezone: i8, start_time: u64, end_time: u64) {
        let battle = DictationBattle::new(entry_fee, timezone, start_time, end_time);
        self.battles.push(battle);
    }
}

pub struct DictationBattleProgram(());

#[sails_rs::program]
impl DictationBattleProgram {
    // Program's constructor
    pub fn new() -> Self {
        Self(())
    }

    // Exposed service
    pub fn dictation_battle(&self) -> DictationBattleService {
        DictationBattleService::new()
    }
}

struct Participant {
    user_id: String,
    daily_completions: Vec<DailyCompletion>,
    joined_at: u64,
}

struct DailyCompletion {
    day: u32,
    completed: bool,
    completed_at: Option<u64>,
}

enum BattleStatus {
    Recruiting,
    InProgress,
    Completed,
    Cancelled,
}

struct DictationBattle {
    initiator: ActorId,
    entry_fee: u64,

    timezone: i8,
    created_at: u64,
    start_time: u64,
    end_time: u64,

    participants: Vec<Participant>,

    status: BattleStatus,
}

impl DictationBattle {
    pub fn new(entry_fee: u64, timezone: i8, start_time: u64, end_time: u64) -> Self {
        let start_time_local = start_time as i64 + (timezone as i64 * 3600);
        if start_time_local % 86400 != 0 {
            panic!("start_time must be the 0 point of the specified timezone");
        }
        let end_time_local = end_time as i64 + (timezone as i64 * 3600);
        if end_time_local % 86400 != 0 {
            panic!("end_time must be the 0 point of the specified timezone");
        }

        let start_time = start_time * 1000;
        let end_time = end_time * 1000;
        let created_at = exec::block_timestamp();

        let seconds_to_start = start_time as i64 - created_at as i64 - (timezone as i64 * 3600);
        if seconds_to_start < 0 {
            panic!(
                "start_time must be in the future, start_time: {}, created_at: {}",
                start_time, created_at
            );
        }

        Self {
            initiator: msg::source(),
            entry_fee,
            timezone,
            created_at,
            start_time,
            end_time,
            participants: Vec::new(),
            status: BattleStatus::Recruiting,
        }
    }
}
