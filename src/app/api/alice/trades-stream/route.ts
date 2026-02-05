import { NextRequest } from 'next/server';
import fs from 'fs';

const INCOMING_FILE = process.env.QUANTUM_ALPHA_INCOMING_FILE || '.alice.incoming.json';

// Global set of response objects for broadcasting
export const clients = new Set<{
  write: (data: string) => void;
  abort: () => void;
}>();

function readIncoming(): Record<string, any> {
  try {
    if (fs.existsSync(INCOMING_FILE)) {
      return JSON.parse(fs.readFileSync(INCOMING_FILE, 'utf-8') || '{}');
    }
  } catch (e) {
    console.error('Failed reading incoming file', e);
  }
  return {};
}

// Broadcast to all connected SSE clients
export function broadcastTrade(trade: any) {
  const msg = `data: ${JSON.stringify(trade)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(msg);
    } catch (e) {
      try {
        client.abort();
      } catch {}
      clients.delete(client);
    }
  });
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  
  // Create a custom writable interface
  let closed = false;
  const response = new ReadableStream({
    start(controller) {
      const write = (data: string) => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (e) {
            closed = true;
          }
        }
      };

      const abort = () => {
        closed = true;
        try {
          controller.close();
        } catch {}
      };

      const client = { write, abort };
      clients.add(client);

      // Send initial data
      const incoming = readIncoming();
      const flattened: any[] = [];
      Object.keys(incoming).forEach((accountId) => {
        const arr = Array.isArray(incoming[accountId]) ? incoming[accountId] : [];
        arr.forEach((t: any) => flattened.push({ ...t, account: accountId }));
      });

      const initial = `data: ${JSON.stringify({ type: 'initial', trades: flattened })}\n\n`;
      write(initial);

      // Clean up on client disconnect
      req.signal.addEventListener('abort', () => {
        closed = true;
        clients.delete(client);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(response, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
