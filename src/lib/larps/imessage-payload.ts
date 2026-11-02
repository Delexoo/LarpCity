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
  subtitle?: string;
  service?: "iMessage" | "SMS";
  statusTime?: string;
  readLabel?: string;
};

export type IMessagePayload = {
  contact: IMessageContact;
  messages: IMessageItem[];
  showTyping?: boolean;
  showRead?: boolean;
  readLabel?: string;
  statusTime?: string;
};

export const DEFAULT_IMESSAGE: IMessagePayload = {
  contact: {
    name: "Mom",
    avatarLetters: "M",
    avatarHueA: "#A8A8AE",
    avatarHueB: "#6E6E73",
    service: "iMessage",
    statusTime: "9:41 AM",
    readLabel: "Read 9:41 AM",
  },
  messages: [
    {
      id: "m1",
      side: "received",
      kind: "text",
      text: "Are you alive",
      timestampLabel: "Today 9:38 AM",
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
  readLabel: "Read 9:41 AM",
  statusTime: "9:41 AM",
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

  return {
    contact: {
      name,
      avatarLetters: letters,
      avatarHueA: String(
        contactIn.avatarHueA || data.avatarHueA || "#A8A8AE",
      ),
      avatarHueB: String(
        contactIn.avatarHueB || data.avatarHueB || "#6E6E73",
      ),
      subtitle: contactIn.subtitle ? String(contactIn.subtitle) : undefined,
      service:
        String(contactIn.service || data.service || "iMessage") === "SMS"
          ? "SMS"
          : "iMessage",
      statusTime: String(
        contactIn.statusTime || data.statusTime || "9:41 AM",
      ),
      readLabel: String(
        contactIn.readLabel || data.readLabel || "Read 9:41 AM",
      ),
    },
    messages: messages.length ? messages : DEFAULT_IMESSAGE.messages,
    showTyping: data.showTyping !== false,
    showRead: data.showRead !== false,
    readLabel: String(data.readLabel || "Read 9:41 AM"),
    statusTime: String(data.statusTime || "9:41 AM"),
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
