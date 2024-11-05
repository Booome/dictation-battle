#![no_std]

use collections::btree_map::BTreeMap;
use sails_rs::{
    gstd::{exec, msg},
    prelude::*,
};

struct DictationBattleData {
    battles: Vec<DictationBattle>,
    joined_battles: BTreeMap<ActorId, Vec<u64>>,
}

static mut DICTATION_BATTLE_DATA: Option<DictationBattleData> = None;

impl DictationBattleData {
    fn new() -> Self {
        Self {
            battles: Vec::new(),
            joined_battles: BTreeMap::new(),
        }
    }

    pub fn instance() -> &'static mut Self {
        #[allow(static_mut_refs)]
        unsafe {
            DICTATION_BATTLE_DATA.get_or_insert(Self::new())
        }
    }
}

struct DictationBattleService(());

#[sails_rs::service]
impl DictationBattleService {
    pub fn new() -> Self {
        Self(())
    }

    pub fn create_battle(&mut self, entry_fee: u128, timezone: i8, start_time: u64, end_time: u64) {
        let data = DictationBattleData::instance();
        let id = data.battles.len() as u64;

        let mut battle = DictationBattle::new(id, entry_fee, timezone, start_time, end_time);

        battle.join();

        data.battles.push(battle);

        data.joined_battles
            .entry(msg::source())
            .or_insert_with(Vec::new)
            .push(id);
    }

    pub fn get_battle(&self, battle_id: i64) -> DictationBattle {
        let battles = &DictationBattleData::instance().battles;
        let len = battles.len() as i64;

        let index = if battle_id < 0 {
            len + battle_id
        } else {
            battle_id
        };

        if index < 0 || index >= len {
            panic!("battle_id {} is out of range", battle_id);
        }

        battles[index as usize].clone()
    }

    pub fn get_battles(&self, start: i32, stop: i32) -> Vec<DictationBattle> {
        let battles = &DictationBattleData::instance().battles;
        let len = battles.len() as i32;

        let start = if start < 0 { len + start } else { start };
        let stop = if stop < 0 { len + stop } else { stop };

        let start = start.clamp(0, len) as usize;
        let stop = stop.clamp(0, len) as usize;

        if start <= stop {
            battles[start..stop].to_vec()
        } else {
            let mut result = battles[stop..start].to_vec();
            result.reverse();
            result
        }
    }

    pub fn get_battle_by_user(&self, user_id: ActorId, index: i32) -> DictationBattle {
        let data = DictationBattleData::instance();

        let joined = data
            .joined_battles
            .get(&user_id)
            .expect("user has not joined any battles");

        let len = joined.len() as i32;

        let actual_index = if index < 0 { len + index } else { index };

        if actual_index < 0 || actual_index >= len {
            panic!("index {} is out of range", index);
        }

        let battle_id = joined[actual_index as usize];
        data.battles[battle_id as usize].clone()
    }

    pub fn get_battles_by_user(
        &self,
        user_id: ActorId,
        start: i32,
        stop: i32,
    ) -> Vec<DictationBattle> {
        let data = DictationBattleData::instance();

        let joined = data
            .joined_battles
            .get(&user_id)
            .expect("user has not joined any battles");

        let len = joined.len() as i32;

        let start = if start < 0 { len + start } else { start };
        let stop = if stop < 0 { len + stop } else { stop };

        let start = start.clamp(0, len) as usize;
        let stop = stop.clamp(0, len) as usize;

        if start <= stop {
            joined[start..stop]
                .iter()
                .map(|&battle_id| data.battles[battle_id as usize].clone())
                .collect()
        } else {
            let mut result: Vec<DictationBattle> = joined[stop..start]
                .iter()
                .map(|&battle_id| data.battles[battle_id as usize].clone())
                .collect();
            result.reverse();
            result
        }
    }

    pub fn join_battle(&mut self, battle_id: u64) {
        let data = DictationBattleData::instance();
        if battle_id >= data.battles.len() as u64 {
            panic!("battle_id {} does not exist", battle_id);
        }

        data.battles[battle_id as usize].join();

        data.joined_battles
            .entry(msg::source())
            .or_insert_with(Vec::new)
            .push(battle_id);
    }
}

pub struct DictationBattleProgram(());

#[sails_rs::program]
impl DictationBattleProgram {
    pub fn new() -> Self {
        Self(())
    }

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

        self.participants.push(Participant {
            user_id: user,
            daily_completions: Vec::new(),
            joined_at: exec::block_timestamp(),
        });

        if value > self.entry_fee {
            msg::send(user, "", value - self.entry_fee).expect("failed to refund excess payment");
        }
    }
}
