export class BroadcastManager {
  constructor(config?: any, container?: any);
  driver(name?: string | null): any;
  extend(name: string, factory: Function): this;
  use(name: string): this;
  channel(pattern: string, callback: Function): this;
  private(name: string): PrivateChannel;
  presence(name: string): PresenceChannel;
  to(channels: any): { emit(event: string, payload?: any, metadata?: any): Promise<any> };
  broadcast(channel: any, event: string, payload?: any, metadata?: any): Promise<any>;
  authorize(channelName: string, user: any, socketId?: string | null): Promise<any>;
  middleware(middlewares: any): this;
  fake(): BroadcastFake;
}

export class BroadcastFacade {
  static channel(pattern: string, callback: Function): BroadcastManager;
  static private(name: string): PrivateChannel;
  static presence(name: string): PresenceChannel;
  static to(channels: any): { emit(event: string, payload?: any, metadata?: any): Promise<any> };
  static broadcast(channel: any, event: string, payload?: any, metadata?: any): Promise<any>;
  static extend(name: string, factory: Function): BroadcastManager;
  static use(name: string): BroadcastManager;
  static middleware(middlewares: any): BroadcastManager;
  static fake(): BroadcastFake;
}

export const Broadcast: typeof BroadcastFacade;

export class Channel {
  constructor(name: string);
  name: string;
  isPrivate(): boolean;
  isPresence(): boolean;
}

export class PrivateChannel extends Channel {}
export class PresenceChannel extends PrivateChannel {}

export class BroadcastFake {
  assertSent(eventFilter: any, callback?: Function | null): boolean;
  assertNothingSent(): boolean;
  assertSentOn(channel: any, eventFilter: any, callback?: Function | null): boolean;
  assertBroadcasted(eventFilter: any): boolean;
  assertBroadcastedOn(channel: any, eventFilter: any): boolean;
  assertBroadcastedTimes(eventFilter: any, times?: number): boolean;
  assertQueued(eventFilter: any): boolean;
  assertNotQueued(eventFilter: any): boolean;
  assertChannel(channelName: string): boolean;
  assertEvent(eventName: string): boolean;
  assertPrivate(channelName: string): boolean;
  assertPresence(channelName: string): boolean;
  assertPayload(eventFilter: any, expectedPayload: any): boolean;
  assertDriver(expectedDriver: string): boolean;
  reset(): void;
}

export class ShouldBroadcast {}
export class ShouldBroadcastNow extends ShouldBroadcast {}
