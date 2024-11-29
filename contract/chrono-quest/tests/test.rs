use chrono_quest::time::{calculate_future_day_start, seconds_to_blocks};
use chrono_quest_io::{ChallengeStatus, Command, Error, Event, StateQuery, StateReply};
use gstd::ActorId;
use gtest::{constants, Program, System};

const USER: u64 = 3;

fn setup_system() -> System {
    let system = System::new();
    system.init_logger();
    system.mint_to(USER, constants::EXISTENTIAL_DEPOSIT * 1000);
    system
}

fn setup_program(system: &System) -> Program {
    let program = Program::current(system);
    let message_id = program.send_bytes(USER, []);
    let block_run_result = system.run_next_block();
    assert!(block_run_result.succeed.contains(&message_id));
    program
}

fn setup_challenge(
    system: &System,
    program: &Program,
    recruit_duration: u32,
    execute_duration: u32,
) {
    let current_timestamp = system.block_timestamp() / 1000;
    let start_time = calculate_future_day_start(current_timestamp, 8, recruit_duration);
    let end_time =
        calculate_future_day_start(current_timestamp, 8, recruit_duration + execute_duration);

    let message_id = program.send(
        USER,
        Command::CreateChallenge {
            name: "test".to_string(),
            entry_fee: 1,
            timezone: 8,
            start_time,
            end_time,
        },
    );
    let block_run_result = system.run_next_block();
    assert!(block_run_result.succeed.contains(&message_id));
}

#[test]
fn test_create_challenge() {
    let system = setup_system();
    let program = setup_program(&system);
    setup_challenge(&system, &program, 1, 1);
}

#[test]
fn test_challenge_recruitment_ended_with_no_participants() {
    let system = setup_system();
    let program = setup_program(&system);
    setup_challenge(&system, &program, 1, 1);

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();

    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };

    let mut i = 0;
    let max_block_count = seconds_to_blocks(60 * 60 * 24);

    while i < max_block_count {
        let time_before_run = system.block_timestamp() / 1000;
        let block_run_result = system.run_next_block();
        let time_after_run = system.block_timestamp() / 1000;
        if block_run_result.succeed.len() != 0
            || block_run_result.failed.len() != 0
            || block_run_result.log.len() != 0
        {
            assert!(
                time_before_run < challenge.start_time && challenge.start_time <= time_after_run
            );
            break;
        }
        i += 1;
    }
    assert!(
        i < max_block_count,
        "Challenge recruitment not ended within 24 hours"
    );

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();
    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };
    assert_eq!(challenge.status, ChallengeStatus::RecruitFailed);
}

#[test]
fn test_challenge() {
    let system = setup_system();
    let program = setup_program(&system);
    setup_challenge(&system, &program, 1, 1);

    // join challenge
    let message_id = program.send_with_value(USER, Command::JoinChallenge { id: 0 }, 1);
    let block_run_result = system.run_next_block();
    assert!(block_run_result.succeed.contains(&message_id));

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();

    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };

    assert_eq!(challenge.status, ChallengeStatus::Recruiting);
    assert!(challenge
        .participants
        .iter()
        .any(|p| p.id == ActorId::from(USER)));

    // advance blocks until challenge starts
    let mut i = 0;
    let max_block_count = seconds_to_blocks(60 * 60 * 24);

    while i < max_block_count {
        let time_before_run = system.block_timestamp() / 1000;
        let block_run_result = system.run_next_block();
        let time_after_run = system.block_timestamp() / 1000;
        if block_run_result.succeed.len() != 0
            || block_run_result.failed.len() != 0
            || block_run_result.log.len() != 0
        {
            assert!(
                time_before_run < challenge.start_time && challenge.start_time <= time_after_run
            );
            break;
        }
        i += 1;
    }
    assert!(
        i < max_block_count,
        "Challenge recruitment not ended within 24 hours"
    );

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();
    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };
    assert_eq!(challenge.status, ChallengeStatus::Executing);

    // complete daily
    let message_id = program.send(USER, Command::CompleteDaily { id: 0 });
    let block_run_result = system.run_next_block();
    assert!(block_run_result.succeed.contains(&message_id));

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();
    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };
    assert!(challenge.participants[0].completed_days[0] == 0);

    let balance_before_complete = system.balance_of(USER);

    // advance blocks until challenge ends
    let mut i = 0;
    let max_block_count = seconds_to_blocks(60 * 60 * 24);

    while i < max_block_count {
        let time_before_run = system.block_timestamp() / 1000;
        let block_run_result = system.run_next_block();
        let time_after_run = system.block_timestamp() / 1000;
        if block_run_result.succeed.len() != 0
            || block_run_result.failed.len() != 0
            || block_run_result.log.len() != 0
        {
            assert!(time_before_run < challenge.end_time && challenge.end_time <= time_after_run);
            break;
        }
        i += 1;
    }
    assert!(
        i < max_block_count,
        "Challenge recruitment not ended within 24 hours"
    );

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();
    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };
    assert!(challenge.status == ChallengeStatus::Completed);

    let balance_after_complete = system.balance_of(USER);
    assert!(balance_after_complete > balance_before_complete);
}

#[test]
fn test_join_challenge_fails_with_insufficient_fee() {
    let system = setup_system();
    let program = setup_program(&system);
    setup_challenge(&system, &program, 1, 1);

    let message_id = program.send(USER, Command::JoinChallenge { id: 0 });
    let block_run_result = system.run_next_block();
    assert!(block_run_result.succeed.contains(&message_id));

    let log = block_run_result.decoded_log::<Result<Event, Error>>();
    assert!(matches!(
        log[0].payload(),
        Err(Error::NotEnoughFunds {
            expected: 1,
            actual: 0
        })
    ));

    let state_reply: StateReply = program
        .read_state(StateQuery::QueryChallenge { id: 0 })
        .unwrap();

    let challenge = match state_reply {
        StateReply::QueryChallenge { challenge } => challenge,
        _ => panic!("Expected QueryChallenge variant"),
    };

    assert!(!challenge
        .participants
        .iter()
        .any(|p| p.id == ActorId::from(USER)));
    assert_eq!(challenge.status, ChallengeStatus::Recruiting);
}
