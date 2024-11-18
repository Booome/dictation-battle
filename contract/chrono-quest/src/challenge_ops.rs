use crate::time::{is_start_of_day, seconds_to_blocks};
use chrono_quest_io::{
    Challenge, ChallengeStatus, Command, Error, Event, Participant, Sponsorship,
};
use gstd::{exec, msg, prelude::*};

pub trait ChallengeOps {
    fn new(
        id: u64,
        name: String,
        entry_fee: u128,
        timezone: i8,
        start_time: u64,
        end_time: u64,
    ) -> Result<Self, Error>
    where
        Self: Sized;

    fn join(&mut self) -> Result<(), Error>;

    fn sponsor(&mut self) -> Result<(), Error>;

    fn recruitment_ended(&mut self) -> Result<(), Error>;

    fn execution_ended(&mut self) -> Result<(), Error>;

    fn complete_daily(&mut self) -> Result<(), Error>;
}

impl ChallengeOps for Challenge {
    fn new(
        id: u64,
        name: String,
        entry_fee: u128,
        timezone: i8,
        start_time: u64,
        end_time: u64,
    ) -> Result<Self, Error> {
        if timezone < -12 || timezone > 12 {
            return Err(Error::InvalidTimezone { timezone });
        }
        if !is_start_of_day(start_time, timezone) {
            return Err(Error::InvalidStartTime {
                time: start_time,
                timezone,
            });
        }
        if !is_start_of_day(end_time, timezone) {
            return Err(Error::InvalidEndTime {
                time: end_time,
                timezone,
            });
        }
        if start_time >= end_time {
            return Err(Error::InvalidTimeRange {
                start: start_time,
                end: end_time,
            });
        }

        let creation_time = exec::block_timestamp() / 1000;
        if creation_time >= start_time {
            return Err(Error::StartTimeNotInFuture {
                creation: creation_time,
                start: start_time,
            });
        }

        msg::send_delayed(
            exec::program_id(),
            Command::ChallengeRecruitmentEnded { id },
            0,
            seconds_to_blocks(start_time - creation_time) as u32,
        )
        .map_err(|_| Error::FailedToScheduleRecruitmentEnd { id })?;

        Ok(Self {
            id,
            name,
            creator: msg::source(),
            entry_fee,
            timezone,
            creation_time,
            start_time,
            end_time,
            prize_pool: 0,
            status: ChallengeStatus::Recruiting,
            participants: Vec::new(),
            sponsors: Vec::new(),
        })
    }

    fn join(&mut self) -> Result<(), Error> {
        if self.status != ChallengeStatus::Recruiting {
            return Err(Error::ChallengeIsNotRecruiting {
                id: self.id,
                status: self.status,
            });
        }
        if msg::value() < self.entry_fee {
            return Err(Error::NotEnoughFunds {
                expected: self.entry_fee,
                actual: msg::value(),
            });
        }
        if self
            .participants
            .iter()
            .any(|participant| participant.id == msg::source())
        {
            return Err(Error::ParticipantAlreadyJoined { id: self.id });
        }

        self.participants.push(Participant {
            id: msg::source(),
            payment: msg::value(),
            completed_days: Vec::new(),
        });
        self.prize_pool += msg::value();

        Ok(())
    }

    fn sponsor(&mut self) -> Result<(), Error> {
        if self.status != ChallengeStatus::Recruiting && self.status != ChallengeStatus::Executing {
            return Err(Error::ChallengeIsNotRecruitingAndNotExecuting {
                id: self.id,
                status: self.status,
            });
        }
        if msg::value() < self.entry_fee {
            return Err(Error::NotEnoughFunds {
                expected: self.entry_fee,
                actual: msg::value(),
            });
        }

        self.sponsors.push(Sponsorship {
            sponsor: msg::source(),
            payment: msg::value(),
        });

        Ok(())
    }

    fn recruitment_ended(&mut self) -> Result<(), Error> {
        if msg::source() != exec::program_id() {
            return Err(Error::InternalMethodCalledExternally);
        }
        if self.status != ChallengeStatus::Recruiting {
            return Err(Error::ChallengeIsNotRecruiting {
                id: self.id,
                status: self.status,
            });
        }
        if self.participants.len() == 0 {
            self.status = ChallengeStatus::RecruitFailed;
            return Err(Error::RecruitEndedWithNoParticipants { id: self.id });
        }

        msg::send_delayed(
            exec::program_id(),
            Command::ChallengeExecutionEnded { id: self.id },
            0,
            seconds_to_blocks(self.end_time - self.start_time) as u32,
        )
        .map_err(|_| Error::FailedToScheduleExecutionEnd { id: self.id })?;

        self.status = ChallengeStatus::Executing;
        Ok(())
    }

    fn execution_ended(&mut self) -> Result<(), Error> {
        if msg::source() != exec::program_id() {
            return Err(Error::InternalMethodCalledExternally);
        }
        if self.status != ChallengeStatus::Executing {
            return Err(Error::ChallengeIsNotExecuting {
                id: self.id,
                status: self.status,
            });
        }

        self.status = ChallengeStatus::Completed;

        let execution_days = (self.end_time - self.start_time) / 86400;

        let succeeded_participants: Vec<_> = self
            .participants
            .iter()
            .filter(|participant| participant.completed_days.len() as u64 == execution_days)
            .collect();

        let total_succeeded_payment = succeeded_participants
            .iter()
            .map(|participant| participant.payment)
            .sum::<u128>();

        for participant in succeeded_participants.iter() {
            let value = self.prize_pool * participant.payment / total_succeeded_payment;
            let payload = Event::ChallengePrize {
                id: self.id,
                account: participant.id,
                prize: value,
            };
            msg::send(participant.id, payload, value).map_err(|_| Error::SendError)?;
        }

        Ok(())
    }

    fn complete_daily(&mut self) -> Result<(), Error> {
        if self.status != ChallengeStatus::Executing {
            return Err(Error::ChallengeIsNotExecuting {
                id: self.id,
                status: self.status,
            });
        }

        let timestamp = exec::block_timestamp() / 1000;
        let day = ((timestamp - self.start_time) / 86400) as u16;

        let participant = self
            .participants
            .iter_mut()
            .find(|participant| participant.id == msg::source())
            .ok_or(Error::ParticipantNotFound { id: self.id })?;

        if !participant.completed_days.contains(&day) {
            participant.completed_days.push(day);
        }

        Ok(())
    }
}
