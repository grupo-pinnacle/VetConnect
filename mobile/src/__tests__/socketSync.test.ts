import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { MobileSocketManager } from '../lib/socket';
import api from '../lib/api';
import { ApiResponse, Message } from '../types';

/**
 * These tests drive the REAL MobileSocketManager. Only the boundaries are
 * stubbed: the HTTP client (`api.get`) and the native modules the manager
 * touches (`react-native` AppState, `socket.io-client`).
 */

jest.mock('react-native', () => ({
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
  SECURE_STORE_REFRESH_KEY: 'vetconnect_refresh_token',
}));

const getMock = api.get as unknown as jest.Mock<Promise<AxiosResponse<ApiResponse<Message[]>>>, [string]>;

const CONSULTATION_ID = 'consultation-1';
const WATERMARK = '2026-01-01T10:00:00.000Z';
const NEWER = '2026-01-01T10:05:00.000Z';

const buildMessage = (id: string, createdAt: string): Message => ({
  id,
  consultationId: CONSULTATION_ID,
  senderId: 'user-1',
  content: `Mensaje ${id}`,
  clientMsgId: `client-${id}`,
  createdAt,
});

const okResponse = (messages: Message[]): AxiosResponse<ApiResponse<Message[]>> => ({
  data: { success: true, data: messages },
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
});

const windowUrl = (after: string): string =>
  `/api/consultations/${CONSULTATION_ID}/messages?after=${encodeURIComponent(after)}`;

describe('Mobile chat incremental sync (debt D-05)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('leaves the watermark unchanged when the incremental fetch fails', async () => {
    const manager = new MobileSocketManager();
    manager.trackConsultation(CONSULTATION_ID, WATERMARK);
    getMock.mockRejectedValueOnce(new Error('network unreachable'));

    const synced = await manager.syncIncrementalMessages();

    expect(synced.size).toBe(0);
    expect(getMock).toHaveBeenNthCalledWith(1, windowUrl(WATERMARK));

    // The failed window must be re-read verbatim on the next attempt.
    getMock.mockResolvedValueOnce(okResponse([buildMessage('m-2', NEWER)]));
    manager.onSyncedMessages(() => undefined);
    await manager.syncIncrementalMessages();

    expect(getMock).toHaveBeenNthCalledWith(2, windowUrl(WATERMARK));
  });

  it('leaves the watermark unchanged when the response is not a successful envelope', async () => {
    const manager = new MobileSocketManager();
    manager.trackConsultation(CONSULTATION_ID, WATERMARK);
    getMock.mockResolvedValueOnce({
      data: { success: false, error: { code: 'NOT_FOUND', message: 'no', timestamp: new Date(0).toISOString() } },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
    });

    const synced = await manager.syncIncrementalMessages();

    expect(synced.size).toBe(0);

    getMock.mockResolvedValueOnce(okResponse([]));
    manager.onSyncedMessages(() => undefined);
    await manager.syncIncrementalMessages();

    expect(getMock).toHaveBeenNthCalledWith(2, windowUrl(WATERMARK));
  });

  it('delivers the synced messages and advances the watermark when the fetch succeeds', async () => {
    const manager = new MobileSocketManager();
    manager.trackConsultation(CONSULTATION_ID, WATERMARK);

    const received: Array<{ consultationId: string; messages: Message[] }> = [];
    manager.onSyncedMessages((consultationId, messages) => {
      received.push({ consultationId, messages });
    });

    const batch = [buildMessage('m-2', NEWER)];
    getMock.mockResolvedValueOnce(okResponse(batch));

    const synced = await manager.syncIncrementalMessages();

    expect(received).toHaveLength(1);
    expect(received[0]?.consultationId).toBe(CONSULTATION_ID);
    expect(received[0]?.messages).toHaveLength(1);
    expect(synced.get(CONSULTATION_ID)).toHaveLength(1);

    // The next window must start from the timestamp of the delivered message.
    getMock.mockResolvedValueOnce(okResponse([]));
    await manager.syncIncrementalMessages();

    expect(getMock).toHaveBeenNthCalledWith(2, windowUrl(NEWER));
  });

  it('does not advance the watermark when no consumer is registered to receive the messages', async () => {
    const manager = new MobileSocketManager();
    manager.trackConsultation(CONSULTATION_ID, WATERMARK);
    getMock.mockResolvedValueOnce(okResponse([buildMessage('m-2', NEWER)]));

    const synced = await manager.syncIncrementalMessages();

    expect(synced.size).toBe(0);

    getMock.mockResolvedValueOnce(okResponse([]));
    await manager.syncIncrementalMessages();

    expect(getMock).toHaveBeenNthCalledWith(2, windowUrl(WATERMARK));
  });
});

describe('Mobile chat socket teardown (debt D-06)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('releases the tracked consultations and the sync subscribers on disconnect', async () => {
    const manager = new MobileSocketManager();
    const received: Message[][] = [];
    manager.onSyncedMessages((_consultationId, messages) => {
      received.push(messages);
    });
    manager.trackConsultation(CONSULTATION_ID, WATERMARK);

    manager.disconnect();

    getMock.mockResolvedValueOnce(okResponse([buildMessage('m-2', NEWER)]));
    const synced = await manager.syncIncrementalMessages();

    expect(getMock).not.toHaveBeenCalled();
    expect(synced.size).toBe(0);
    expect(received).toHaveLength(0);
  });

  it('stops delivering to a screen that unsubscribed from the sync', async () => {
    const manager = new MobileSocketManager();
    const received: Message[][] = [];
    const unsubscribe = manager.onSyncedMessages((_consultationId, messages) => {
      received.push(messages);
    });
    manager.trackConsultation(CONSULTATION_ID, WATERMARK);

    unsubscribe();

    getMock.mockResolvedValueOnce(okResponse([buildMessage('m-2', NEWER)]));
    const synced = await manager.syncIncrementalMessages();

    expect(received).toHaveLength(0);
    expect(synced.size).toBe(0);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(windowUrl(WATERMARK));
  });
});
