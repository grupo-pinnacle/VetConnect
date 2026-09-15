import app from './app';
import { initializeSocketServer } from './realtime/socket.server';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 VetConnect Backend Server running on port ${PORT}`);
});

initializeSocketServer(server);

export default server;
