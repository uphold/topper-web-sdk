import { EventPayload } from '../interfaces/event-payload';

export type EventHandler = (event: EventPayload) => void;
