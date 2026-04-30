// Start of the dependency chain

export type EventType = 
'page_view' | 'ride_posted' | 'error' | 'seat_reserved' | 'signup';


// Contract
export interface AppEvent {
    id: string;
    type: EventType;
    page: string;
    ts: number;
}