/** What the channel needs from the app; kept out of it so it holds no knowledge of redux or storage. */
export interface LiveChannelHooks {
  url: () => Promise<string>;
  token: () => Promise<string | null>;
  /** The server wants a fresh token; resolves once there is one. */
  renewToken: () => Promise<void>;
  onChanged: (listId: number, version: number) => void;
  onConnected: (connected: boolean) => void;
}

export interface LiveListRef {
  listId: number;
  householdId: string | null;
}

/** What the server answers; the token is offered beside it, as browsers cannot set headers here. */
const PROTOCOL = 'cookpal-live';
const TOKEN_PROTOCOL_PREFIX = 'bearer.';
/** The server's close codes; see LiveListeners on the server. */
const AUTHENTICATE = 4001;
const TOO_MANY_DEVICES = 4008;
const FIRST_RETRY_MILLIS = 1_000;
const LAST_RETRY_MILLIS = 30_000;

/**
 * Hears from the server that a list changed, while the app is open. Only hints travel here; the
 * change itself is fetched like any other, so a hint lost to a dropped connection costs nothing
 * but a moment.
 */
export class LiveChannel {
  private socket: WebSocket | null = null;
  private lists: LiveListRef[] = [];
  private retryMillis = FIRST_RETRY_MILLIS;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor(private readonly hooks: LiveChannelHooks) {
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.connect();
  }

  stop() {
    this.running = false;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.hooks.onConnected(false);
  }

  /**
   * Replaces what the app listens to.
   *
   * @param {LiveListRef[]} lists every list the app shows
   */
  listenTo(lists: LiveListRef[]) {
    this.lists = lists;
    this.subscribe();
  }

  private async connect() {
    const token = await this.hooks.token();
    if (!this.running || !token) {
      return;
    }
    const socket = new WebSocket(await this.hooks.url(), [PROTOCOL, TOKEN_PROTOCOL_PREFIX + token]);
    this.socket = socket;
    let opened = false;
    socket.onopen = () => {
      opened = true;
      this.subscribe();
    };
    socket.onmessage = (event) => this.receive(String(event.data));
    // A refused upgrade shows only as a close before opening, most likely for a token that ran out.
    socket.onclose = (event) => this.closed(socket, opened ? event.code : AUTHENTICATE);
  }

  private subscribe() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({type: 'subscribe', lists: this.lists}));
    }
  }

  private receive(data: string) {
    const message = JSON.parse(data);
    if (message.type === 'subscribed') {
      this.retryMillis = FIRST_RETRY_MILLIS;
      this.hooks.onConnected(true);
    } else if (message.type === 'changed') {
      this.hooks.onChanged(message.listId, message.version);
    }
  }

  private async closed(socket: WebSocket, code: number) {
    if (socket !== this.socket) {
      return;
    }
    this.socket = null;
    this.hooks.onConnected(false);
    if (!this.running || code === TOO_MANY_DEVICES) {
      return;
    }
    if (code === AUTHENTICATE) {
      await this.hooks.renewToken().catch(() => undefined);
    }
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, this.retryMillis);
    this.retryMillis = Math.min(this.retryMillis * 2, LAST_RETRY_MILLIS);
  }
}
