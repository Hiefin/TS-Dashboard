import { AppEvent, EventType } from './types.js';

let events: AppEvent[] = [];
let bucketCounts: number[] = new Array(20).fill(0);
let currentBucket: number = 0;

// base 36 randomizer then cut off 0 and .
export function collectEvent(
    type: EventType,
    page: string            
    ): void {
    const event: AppEvent = {
        id: Math.random().toString(36).slice(2,9),
        type: type,
        page: page,
        ts: Date.now()
    };

    // Ring buffer for events and buckets
    events.push(event);
    if (events.length > 500) events.shift();
    currentBucket++;
}

// Getters 
// spread operator on events to get a shallow copy to prevent changes to the array

export function getEvents(): AppEvent[] {
    return [...events];
}

export function getBuckets(): number[] {
    return [...bucketCounts];
}

// Push current bucket and if max size remove 1st element and set back to 0
export function tickBucket(): void {
    bucketCounts.push(currentBucket);
    if (bucketCounts.length > 20) {
        bucketCounts.shift();
    }
    currentBucket = 0;
}

