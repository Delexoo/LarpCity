export type IMessageSide = "sent" | "received" | "you" | "them";

export type IMessageItem = {
  id?: string;
  side: IMessageSide;
  kind?: "text" | "timestamp" | "typing";
  text?: string;
  timestampLabel?: string;
};

export type IMessageContact = {
  name: string;
  avatarLetters?: string;
  avatarHueA?: string;
  avatarHueB?: string;
  avatarUrl?: string;
  subtitle?: string;
  service?: "iMessage" | "SMS";
  statusTime?: string;
  readLabel?: string;
  unreadCount?: number;
  battery?: number | string;
};

export type IMessagePayload = {
  contact: IMessageContact;
  messages: IMessageItem[];
  showTyping?: boolean;
  showRead?: boolean;
  readLabel?: string;
  statusTime?: string;
  unreadCount?: number;
  battery?: number | string;
};

export const DEFAULT_IMESSAGE: IMessagePayload = {
  contact: {
    name: "JJ",
    avatarLetters: "JJ",
    avatarHueA: "#8E8E93",
    avatarHueB: "#48484A",
    service: "iMessage",
    statusTime: "2:30",
    readLabel: "Delivered",
    unreadCount: 271,
    battery: 25,
  },
  messages: [
    {
      id: "m1",
      side: "received",
      kind: "text",
      text: "Are you alive",
      timestampLabel: "Today 2:28 PM",
    },
    {
      id: "m2",
      side: "received",
      kind: "text",
      text: "It's been like four days",
    },
    {
      id: "m3",
      side: "sent",
      kind: "text",
      text: "Just closed our seed round",
    },
    { id: "m4", side: "sent", kind: "text", text: "$4.2M, Sequoia led" },
    { id: "m5", side: "received", kind: "text", text: "Wait what" },
    { id: "m6", side: "received", kind: "text", text: "Call me right now" },
  ],
  showTyping: true,
  showRead: true,
  readLabel: "Delivered",
  statusTime: "2:30",
  unreadCount: 271,
  battery: 25,
};

export function buildIMessagePayload(
  data: Record<string, unknown>,
): IMessagePayload {
  const contactIn = (data.contact as Record<string, unknown>) || {};
  const name = String(
    contactIn.name || data.contactName || data.businessName || "Mom",
  ).trim();
  const letters = String(
    contactIn.avatarLetters ||
      data.avatarLetters ||
      name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2) ||
      "?",
  )
    .slice(0, 2)
    .toUpperCase();

  const messagesRaw = Array.isArray(data.messages)
    ? data.messages
    : DEFAULT_IMESSAGE.messages;

  const messages: IMessageItem[] = messagesRaw.map((m, i) => {
    const row = (m || {}) as Record<string, unknown>;
    const sideRaw = String(row.side || "received");
    const side: IMessageSide =
      sideRaw === "sent" || sideRaw === "you" ? "sent" : "received";
    return {
      id: String(row.id || `m${i + 1}`),
      side,
      kind: (row.kind as IMessageItem["kind"]) || "text",
      text: String(row.text || ""),
      timestampLabel: row.timestampLabel
        ? String(row.timestampLabel)
        : undefined,
    };
  });

  const unreadRaw = contactIn.unreadCount ?? data.unreadCount ?? 271;
  const unreadCount = Math.max(0, Math.round(Number(unreadRaw) || 0));
  const batteryRaw = contactIn.battery ?? data.battery ?? 25;
  const battery: number | string =
    typeof batteryRaw === "number" || typeof batteryRaw === "string"
      ? batteryRaw
      : Math.max(0, Math.min(100, Number(batteryRaw) || 25));

  return {
    contact: {
      name,
      avatarLetters: letters,
      avatarHueA: String(
        contactIn.avatarHueA || data.avatarHueA || "#8E8E93",
      ),
      avatarHueB: String(
        contactIn.avatarHueB || data.avatarHueB || "#48484A",
      ),
      avatarUrl: contactIn.avatarUrl
        ? String(contactIn.avatarUrl)
        : data.avatarUrl
          ? String(data.avatarUrl)
          : undefined,
      subtitle: contactIn.subtitle ? String(contactIn.subtitle) : undefined,
      service:
        String(contactIn.service || data.service || "iMessage") === "SMS"
          ? "SMS"
          : "iMessage",
      statusTime: String(
        contactIn.statusTime || data.statusTime || "2:30",
      ),
      readLabel: String(
        contactIn.readLabel || data.readLabel || "Delivered",
      ),
      unreadCount,
      battery,
    },
    messages: messages.length ? messages : DEFAULT_IMESSAGE.messages,
    showTyping: data.showTyping !== false,
    showRead: data.showRead !== false,
    readLabel: String(data.readLabel || "Delivered"),
    statusTime: String(data.statusTime || "2:30"),
    unreadCount,
    battery,
  };
}

export function injectIMessageHtml(
  template: string,
  payload: IMessagePayload,
): string {
  let html = template;
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${payload.contact.name} – Messages</title>`,
  );
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );
  return html;
}
