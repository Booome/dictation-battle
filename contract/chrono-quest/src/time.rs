fn timestamp_to_local_time(timestamp: u64, timezone: i8) -> i64 {
    timestamp as i64 + timezone as i64 * 3600
}

pub fn is_start_of_day(timestamp: u64, timezone: i8) -> bool {
    timestamp_to_local_time(timestamp, timezone) % 86400 == 0
}

pub fn seconds_to_blocks(seconds: u64) -> u64 {
    (seconds + 2) / 3
}

pub fn calculate_future_day_start(start_timestamp: u64, timezone: i8, days: u32) -> u64 {
    let local_timestamp = (start_timestamp as i64) + (timezone as i64 * 3600);
    let current_day_start = local_timestamp - (local_timestamp % 86400);
    let future_day_start = current_day_start + (days as i64 * 86400);
    (future_day_start - (timezone as i64 * 3600)) as u64
}
