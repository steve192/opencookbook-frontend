import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LiveChannel} from './liveChannel';

class FakeSocket {
  static readonly OPEN = 1;
  static last: FakeSocket;
  readyState = 0;
  sent: unknown[] = [];
  onopen?: () => void;
  onmessage?: (event: {data: string}) => void;
  onclose?: (event: {code: number}) => void;

  constructor(public url: string, public protocols: string[]) {
    FakeSocket.last = this;
  }

  send(data: string) {
    this.sent.push(JSON.parse(data));
  }

  close() {
    this.readyState = 3;
  }

  open() {
    this.readyState = FakeSocket.OPEN;
    this.onopen?.();
  }
}

const flush = () => new Promise<void>((resolve) => setImmediate(() => resolve()));

describe('LiveChannel', () => {
  const changed = vi.fn();
  const renewToken = vi.fn(async () => undefined);
  let channel: LiveChannel;

  beforeEach(() => {
    vi.stubGlobal('WebSocket', FakeSocket);
    renewToken.mockClear();
    channel = new LiveChannel({
      url: async () => 'ws://server/api/v1/shopping/live',
      token: async () => 'token',
      renewToken,
      onChanged: changed,
      onConnected: () => undefined,
    });
  });

  afterEach(() => {
    channel.stop();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('offers its token with the upgrade, then says which lists it shows', async () => {
    channel.listenTo([{listId: 1, householdId: null}]);
    channel.start();
    await flush();
    FakeSocket.last.open();

    expect(FakeSocket.last.protocols).toEqual(['cookpal-live', 'bearer.token']);
    expect(FakeSocket.last.sent).toEqual([{type: 'subscribe', lists: [{listId: 1, householdId: null}]}]);
  });

  it('passes on which list changed', async () => {
    channel.start();
    await flush();
    FakeSocket.last.onmessage?.({data: '{"type":"changed","listId":7,"version":12}'});

    expect(changed).toHaveBeenCalledWith(7, 12);
  });

  it('renews the token and connects again when the server asks for it', async () => {
    vi.useFakeTimers();
    channel.start();
    await vi.runOnlyPendingTimersAsync();
    const first = FakeSocket.last;
    first.open();
    first.onclose?.({code: 4001});
    await vi.advanceTimersByTimeAsync(1_000);

    expect(renewToken).toHaveBeenCalled();
    expect(FakeSocket.last).not.toBe(first);
  });

  it('renews the token when the upgrade was refused', async () => {
    vi.useFakeTimers();
    channel.start();
    await vi.runOnlyPendingTimersAsync();
    FakeSocket.last.onclose?.({code: 1006});
    await vi.advanceTimersByTimeAsync(1_000);

    expect(renewToken).toHaveBeenCalled();
  });
});
