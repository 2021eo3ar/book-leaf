type SsePayload = {
  type: "new_ticket" | "new_response" | "status_changed" | "ticket_updated";
  ticketId: string;
};

type Client = {
  id: string;
  send: (payload: SsePayload | { type: "heartbeat" }) => void;
};

const authorClients = new Map<string, Map<string, Client>>();
const adminClients = new Map<string, Client>();

function addToGroup(map: Map<string, Map<string, Client>>, key: string, client: Client) {
  const group = map.get(key) ?? new Map<string, Client>();
  group.set(client.id, client);
  map.set(key, group);
}

export function registerSseClient(options: {
  role: "author" | "admin";
  authorId: string | null;
  client: Client;
}) {
  if (options.role === "admin") {
    adminClients.set(options.client.id, options.client);
    return () => adminClients.delete(options.client.id);
  }

  if (!options.authorId) {
    return () => undefined;
  }

  addToGroup(authorClients, options.authorId, options.client);
  return () => {
    const group = authorClients.get(options.authorId!);
    group?.delete(options.client.id);
    if (group?.size === 0) {
      authorClients.delete(options.authorId!);
    }
  };
}

export function emitToAuthor(authorId: string, payload: SsePayload) {
  authorClients.get(authorId)?.forEach((client) => client.send(payload));
}

export function emitToAdmins(payload: SsePayload) {
  adminClients.forEach((client) => client.send(payload));
}
