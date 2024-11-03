#![no_std]

use sails_rs::prelude::*;

struct DictationBattleService(());

#[sails_rs::service]
impl DictationBattleService {
    pub fn new() -> Self {
        Self(())
    }

    // Service's method (command)
    pub fn do_something(&mut self) -> String {
        "Hello from DictationBattle!".to_string()
    }

    // Service's query
    pub fn get_something(&self) -> String {
        "Hello from DictationBattle!".to_string()
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
