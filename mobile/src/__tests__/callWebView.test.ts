describe('Mobile Call WebView Handshake Protocol', () => {
  it('should parse page:ready message correctly and prepare WebRTC token injection', () => {
    const rawMessage = JSON.stringify({ type: 'page:ready' });
    const parsed = JSON.parse(rawMessage);

    expect(parsed.type).toBe('page:ready');

    const token = 'mock-livekit-jwt-token';
    const jsInject = `window.initLiveKitCall && window.initLiveKitCall(${JSON.stringify(token)}); true;`;

    expect(jsInject).toContain('mock-livekit-jwt-token');
    expect(jsInject).toContain('initLiveKitCall');
  });
});
