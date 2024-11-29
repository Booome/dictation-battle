#![no_std]

use gmeta::{InOut, Metadata};
use gstd::{prelude::*, string::String, ActorId};
use scale_info::TypeInfo;

pub struct ChronoQuestMetadata;

impl Metadata for ChronoQuestMetadata {
    type Init = ();
    type Handle = InOut<Command, Result<Event, Error>>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = InOut<StateQuery, StateReply>;
}

#[derive(TypeInfo, Decode, Encode, Debug, Clone)]
pub enum Command {
    CreateChallenge {
        name: String,
        entry_fee: u128,
        timezone: i8,
        start_time: u64,
        end_time: u64,
    },
    JoinChallenge {
        id: u64,
    },
    SponsorChallenge {
        id: u64,
    },
    ChallengeRecruitmentEnded {
        id: u64,
    },
    ChallengeExecutionEnded {
        id: u64,
    },
    CompleteDaily {
        id: u64,
    },
}

#[derive(TypeInfo, Encode, Decode, Debug)]
pub enum Event {
    ChallengeCreated {
        id: u64,
    },
    ChallengeJoined {
        id: u64,
    },
    ChallengeSponsored {
        id: u64,
    },
    ChallengeRecruitmentEnded {
        id: u64,
        status: ChallengeStatus,
    },
    ChallengePrize {
        id: u64,
        account: ActorId,
        prize: u128,
    },
    ChallengeExecutionEnded {
        id: u64,
    },
    ChallengeDailyCompleted {
        id: u64,
    },
}

#[derive(TypeInfo, Decode, Encode, Debug)]
pub enum ChallengeFilter {
    All,
    Created(ActorId),
    Joined(ActorId),
    Sponsored(ActorId),
}

#[derive(TypeInfo, Decode, Encode, Debug, Clone)]
pub struct Participant {
    pub id: ActorId,
    pub payment: u128,
    pub completed_days: Vec<u16>,
}

#[derive(TypeInfo, Decode, Encode, Debug, Clone)]
pub struct Sponsorship {
    pub sponsor: ActorId,
    pub payment: u128,
}

#[derive(TypeInfo, Decode, Encode, Debug, Clone)]
pub struct Challenge {
    pub id: u64,
    pub name: String,
    pub creator: ActorId,
    pub entry_fee: u128,

    pub timezone: i8,
    pub creation_time: u64,
    pub start_time: u64,
    pub end_time: u64,

    pub prize_pool: u128,
    pub status: ChallengeStatus,

    pub participants: Vec<Participant>,
    pub sponsors: Vec<Sponsorship>,
}

#[derive(PartialEq, Debug, Encode, TypeInfo, Decode, Clone, Copy)]
pub enum ChallengeStatus {
    Recruiting,
    RecruitFailed,
    Executing,
    Completed,
}

#[derive(TypeInfo, Decode, Encode, Debug)]
pub enum StateQuery {
    TotalChallengeCount,

    QueryChallenge {
        id: u64,
    },

    QueryChallenges {
        filter: ChallengeFilter,
        include_recruiting: bool,
        include_recruit_failed: bool,
        include_executing: bool,
        include_completed: bool,
        offset: u64,
        count: u64,
    },
}

#[derive(TypeInfo, Encode, Debug, Decode)]
pub enum StateReply {
    TotalChallengeCount { count: u64 },
    QueryChallenge { challenge: Challenge },
    QueryChallenges { challenges: Vec<Challenge> },
}

#[derive(TypeInfo, Encode, Decode, Debug)]
pub enum Error {
    InvalidTimezone { timezone: i8 },
    InvalidStartTime { time: u64, timezone: i8 },
    InvalidEndTime { time: u64, timezone: i8 },
    InvalidTimeRange { start: u64, end: u64 },
    StartTimeNotInFuture { creation: u64, start: u64 },
    FailedToScheduleRecruitmentEnd { id: u64 },
    FailedToScheduleExecutionEnd { id: u64 },
    ChallengeIsNotRecruiting { id: u64, status: ChallengeStatus },
    ChallengeIsNotRecruitingAndNotExecuting { id: u64, status: ChallengeStatus },
    ChallengeIsNotExecuting { id: u64, status: ChallengeStatus },
    NotEnoughFunds { expected: u128, actual: u128 },
    ReplyError,
    SendError,
    RecruitEndedWithNoParticipants { id: u64 },
    InternalMethodCalledExternally,
    ParticipantNotFound { id: u64 },
    ParticipantAlreadyJoined { id: u64 },
}
