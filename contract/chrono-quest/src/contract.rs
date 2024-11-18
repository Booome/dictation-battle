use crate::challenge_ops::ChallengeOps;
use chrono_quest_io::{
    Challenge, ChallengeFilter, ChallengeStatus, Command, Error, Event, StateQuery, StateReply,
};
use gstd::{collections::BTreeMap, msg, prelude::*, ActorId};

struct ChronoQuest {
    challenges: Vec<Challenge>,
    created_map: BTreeMap<ActorId, Vec<u64>>,
    joined_map: BTreeMap<ActorId, Vec<u64>>,
    sponsored_map: BTreeMap<ActorId, Vec<u64>>,
}

static mut CHRONO_QUEST_INSTANCE: Option<ChronoQuest> = None;

impl ChronoQuest {
    fn new() -> Self {
        Self {
            challenges: vec![],
            created_map: BTreeMap::new(),
            joined_map: BTreeMap::new(),
            sponsored_map: BTreeMap::new(),
        }
    }

    pub fn mut_inst() -> &'static mut Self {
        #[allow(static_mut_refs)]
        unsafe {
            CHRONO_QUEST_INSTANCE.get_or_insert(Self::new())
        }
    }

    pub fn inst() -> &'static Self {
        #[allow(static_mut_refs)]
        unsafe {
            CHRONO_QUEST_INSTANCE.as_ref().unwrap()
        }
    }

    pub fn create_challenge(
        &mut self,
        name: String,
        entry_fee: u128,
        timezone: i8,
        start_time: u64,
        end_time: u64,
    ) -> Result<Event, Error> {
        let id = self.challenges.len() as u64;
        let challenge = Challenge::new(id, name, entry_fee, timezone, start_time, end_time)?;
        self.challenges.push(challenge);
        self.created_map.entry(msg::source()).or_default().push(id);
        Ok(Event::ChallengeCreated { id })
    }

    pub fn total_challenge_count(&self) -> StateReply {
        StateReply::TotalChallengeCount {
            count: self.challenges.len() as u64,
        }
    }

    pub fn query_challenge(&self, id: u64) -> StateReply {
        StateReply::QueryChallenge {
            challenge: self.challenges[id as usize].clone(),
        }
    }

    pub fn query_challenges(
        &self,
        filter: ChallengeFilter,
        include_recruiting: bool,
        include_recruit_failed: bool,
        include_executing: bool,
        include_completed: bool,
        offset: u64,
        count: u64,
    ) -> StateReply {
        let challenge_ids: Vec<u64> = match filter {
            ChallengeFilter::All => (0..self.challenges.len() as u64).collect(),
            ChallengeFilter::Created(account) => {
                self.created_map.get(&account).cloned().unwrap_or_default()
            }
            ChallengeFilter::Joined(account) => {
                self.joined_map.get(&account).cloned().unwrap_or_default()
            }
            ChallengeFilter::Sponsored(account) => self
                .sponsored_map
                .get(&account)
                .cloned()
                .unwrap_or_default(),
        };

        let challenges: Vec<Challenge> = challenge_ids
            .into_iter()
            .filter_map(|id| {
                let challenge = &self.challenges[id as usize];
                match challenge.status {
                    ChallengeStatus::Recruiting if include_recruiting => Some(challenge),
                    ChallengeStatus::RecruitFailed if include_recruit_failed => Some(challenge),
                    ChallengeStatus::Executing if include_executing => Some(challenge),
                    ChallengeStatus::Completed if include_completed => Some(challenge),
                    _ => None,
                }
            })
            .skip(offset as usize)
            .take(count as usize)
            .map(|challenge| challenge.clone())
            .collect();

        StateReply::QueryChallenges { challenges }
    }

    pub fn join_challenge(&mut self, id: u64) -> Result<Event, Error> {
        self.challenges.get_mut(id as usize).unwrap().join()?;
        self.joined_map.entry(msg::source()).or_default().push(id);
        Ok(Event::ChallengeJoined { id })
    }

    pub fn sponsor_challenge(&mut self, id: u64) -> Result<Event, Error> {
        self.challenges.get_mut(id as usize).unwrap().sponsor()?;
        self.sponsored_map
            .entry(msg::source())
            .or_default()
            .push(id);
        Ok(Event::ChallengeSponsored { id })
    }

    pub fn recruitment_ended(&mut self, id: u64) -> Result<Event, Error> {
        self.challenges
            .get_mut(id as usize)
            .unwrap()
            .recruitment_ended()?;
        Ok(Event::ChallengeRecruitmentEnded {
            id,
            status: self.challenges[id as usize].status,
        })
    }

    pub fn excution_ended(&mut self, id: u64) -> Result<Event, Error> {
        self.challenges
            .get_mut(id as usize)
            .unwrap()
            .execution_ended()?;
        Ok(Event::ChallengeExecutionEnded { id })
    }

    pub fn complete_daily(&mut self, id: u64) -> Result<Event, Error> {
        self.challenges
            .get_mut(id as usize)
            .unwrap()
            .complete_daily()?;
        Ok(Event::ChallengeDailyCompleted { id })
    }
}

#[no_mangle]
pub extern "C" fn init() {
    ChronoQuest::mut_inst();
}

#[no_mangle]
pub extern "C" fn handle() {
    let command = msg::load::<Command>().unwrap();
    let inst = ChronoQuest::mut_inst();

    let result = match command {
        Command::CreateChallenge {
            name,
            entry_fee,
            timezone,
            start_time,
            end_time,
        } => inst.create_challenge(name, entry_fee, timezone, start_time, end_time),

        Command::JoinChallenge { id } => inst.join_challenge(id),

        Command::SponsorChallenge { id } => inst.sponsor_challenge(id),

        Command::ChallengeRecruitmentEnded { id } => inst.recruitment_ended(id),

        Command::ChallengeExecutionEnded { id } => inst.excution_ended(id),

        Command::CompleteDaily { id } => inst.complete_daily(id),
    };

    if result.is_err() {
        msg::reply(result, msg::value()).unwrap();
    } else {
        msg::reply(result, 0).unwrap();
    }
}

#[no_mangle]
pub extern "C" fn state() {
    let query = msg::load::<StateQuery>().unwrap();
    let inst = ChronoQuest::inst();

    let result = match query {
        StateQuery::TotalChallengeCount => inst.total_challenge_count(),

        StateQuery::QueryChallenge { id } => inst.query_challenge(id),

        StateQuery::QueryChallenges {
            filter,
            include_recruiting,
            include_recruit_failed,
            include_executing,
            include_completed,
            offset,
            count,
        } => inst.query_challenges(
            filter,
            include_recruiting,
            include_recruit_failed,
            include_executing,
            include_completed,
            offset,
            count,
        ),
    };

    msg::reply(result, msg::value()).unwrap();
}

#[no_mangle]
pub extern "C" fn handle_reply() {}
