#![no_std]

use collections::btree_map::BTreeMap;
use sails_rs::{
    gstd::{exec, msg},
    prelude::*,
};

struct DictationBattleService {
    battles: Vec<DictationBattle>,
    user_battles: BTreeMap<ActorId, Vec<u64>>,
}

#[sails_rs::service]
impl DictationBattleService {
    pub fn new() -> Self {
        Self {
            battles: Vec::new(),
            user_battles: BTreeMap::new(),
        }
    }

    pub fn create_battle(&mut self, entry_fee: u128, timezone: i8, start_time: u64, end_time: u64) {
        let id = self.battles.len() as u64;
        let battle = DictationBattle::new(id, entry_fee, timezone, start_time, end_time);

        let creator = msg::source();
        self.user_battles
            .entry(creator)
            .or_insert_with(Vec::new)
            .push(id);

        self.battles.push(battle);
    }

    pub fn get_battle(&self, battle_id: u64) -> DictationBattle {
        self.battles[battle_id as usize].clone()
    }

    pub fn get_created_battles(&self, user: ActorId) -> Vec<u64> {
        self.user_battles.get(&user).unwrap_or(&Vec::new()).clone()
    }

    pub fn join_battle(&mut self, battle_id: u64) {
        if battle_id >= self.battles.len() as u64 {
            panic!("battle_id {} does not exist", battle_id);
        }

        let battle = &mut self.battles[battle_id as usize];
        battle.join();

        self.user_battles
            .entry(msg::source())
            .or_insert_with(Vec::new)
            .push(battle_id);
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

#[derive(TypeInfo, Clone, Encode)]
struct Participant {
    user_id: ActorId,
    daily_completions: Vec<DailyCompletion>,
    joined_at: u64,
}

#[derive(TypeInfo, Clone, Encode)]
struct DailyCompletion {
    day: u32,
    completed_at: Option<u64>,
}

#[derive(TypeInfo, Clone, Encode)]
enum BattleStatus {
    Recruiting,
    InProgress,
    Completed,
    Cancelled,
}

#[derive(TypeInfo, Clone, Encode)]
#[scale_info(crate = scale_info)]
struct DictationBattle {
    id: u64,
    creator: ActorId,
    entry_fee: u128,

    timezone: i8,
    created_at: u64,
    start_time: u64,
    end_time: u64,

    participants: Vec<Participant>,

    status: BattleStatus,
}

impl DictationBattle {
    pub fn new(id: u64, entry_fee: u128, timezone: i8, start_time: u64, end_time: u64) -> Self {
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
            id,
            creator: msg::source(),
            entry_fee,
            timezone,
            created_at,
            start_time,
            end_time,
            participants: Vec::new(),
            status: BattleStatus::Recruiting,
        }
    }

    pub fn join(&mut self) {
        let user = msg::source();
        let value = msg::value();

        if !matches!(self.status, BattleStatus::Recruiting) {
            msg::send(user, "", value).expect("failed to refund payment");
            panic!("battle is not recruiting");
        }

        if self.participants.iter().any(|p| p.user_id == user) {
            msg::send(user, "", value).expect("failed to refund payment");
            panic!("user has already joined this battle");
        }

        if value < self.entry_fee {
            msg::send(user, "", value).expect("failed to refund payment");
            panic!(
                "insufficient payment: required {}, got {}",
                self.entry_fee, value
            );
        }

        if value > self.entry_fee {
            msg::send(user, "", value - self.entry_fee).expect("failed to refund excess payment");
        }

        self.participants.push(Participant {
            user_id: user,
            daily_completions: Vec::new(),
            joined_at: exec::block_timestamp(),
        });
    }
}
