use cosmwasm_schema::cw_serde;
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Entry {
    pub id: u64,
    pub description: String,
    pub status: Status,
    pub priority: Priority,
    pub owner: String,
}
#[cw_serde]
pub enum Status {
    ToDo,
    InProgress,
    Done,
    Cancelled,
}
#[cw_serde]
pub enum Priority {
    None,
    Low,
    Medium,
    High,
}

pub const ENTRY_SEQ: Item<u64> = Item::new("entry_seq");
pub const LIST: Map<u64, Entry> = Map::new("list");
