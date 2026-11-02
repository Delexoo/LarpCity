/* Injected Stripe settings — official hub + editable subpages with local save.
   Placeholders: __LC_SETTINGS_FN__ replaced into home.html by patch script. */

function settings() {
  var S = window.__LC_LOAD_SETTINGS ? window.__LC_LOAD_SETTINGS() : {};
  var groups = [
    ["Personal settings", [
      ["Personal details", "user", "Contact info, password, auth methods, active sessions."],
      ["Communication preferences", "email", "Customize email, SMS, and push notifications."],
      ["Developers", "developers", "API keys, Workbench, and more."]
    ]],
    ["Account settings", [
      ["Business", "bank", "Account details, public info, legal entity, custom domains."],
      ["Linked accounts and payouts", "balances", "Bank accounts, debit cards, settlement currencies."],
      ["Team and security", "lock", "Team members, roles, account security, authorized apps."],
      ["Team notifications", "email", "Manage who on the team receives emails."],
      ["Plans and fees", "list", "Cost management for Stripe products."],
      ["Approvals", "list", "Manage rules and approvals for highly-sensitive actions."],
      ["Stripe profile", "user", "Manage how you show up to other businesses."],
      ["Compliance and documents", "invoice", "PCI compliance, documents, legacy exports."],
      ["Account features and previews", "info-box", "Manage account features and product previews."],
      ["Perks", "tag", "Discounts on tools to run your startup."]
    ]],
    ["Product settings", [
      ["Billing", "billing", "Subscriptions, invoices, quotes, customer portal."],
      ["Managed Payments", "payments", "Stripe as merchant of record for tax and fraud."],
      ["Sigma", "list", "Manage your Sigma features."],
      ["Financial Connections", "chain", "Appearance, featured institutions, optimizations."],
      ["Payments", "payments", "Checkout, payment methods, currency conversion."],
      ["Tax", "tag", "Head office address, tax code, tax integrations."]
    ]]
  ];
  view.innerHTML = '<div class="pg set">' + pageHead("Settings") +
    (S._banner === false ? "" : '<div class="set-banner">Get access to all your Stripe data right in the Dashboard with Stripe Sigma—no pipelines or warehouses needed. <button class="linkish" data-act="settingsdismissbanner">Dismiss</button></div>') +
    groups.map(function (g) {
      return '<h2 class="h2">' + esc(g[0]) + '</h2><div class="sgrid rich">' + g[1].map(function (s) {
        return '<button class="scard rich" data-act="settingsitem" data-t="' + esc(s[0]) + '">' + ic(s[1]) +
          '<span class="scard-txt"><b>' + esc(s[0]) + '</b><span class="scard-d">' + esc(s[2]) + '</span></span></button>';
      }).join("") + "</div>";
    }).join("") +
    '<div class="acctid">Account ID <span class="mono">' + esc(X.acct) + '</span><button class="ibx" data-act="copy" data-v="' + esc(X.acct) + '" data-tip="Copy">' + ic("copy") + "</button></div></div>";
}

function settingsVal(key, fallback) {
  var S = window.__LC_LOAD_SETTINGS ? window.__LC_LOAD_SETTINGS() : {};
  if (S[key] != null && S[key] !== "") return String(S[key]);
  return fallback;
}

function settingsBackBar(title) {
  return '<div class="set-crumb"><button class="linkish" data-act="settingsback">Settings</button></div>' + pageHead(title);
}

function openSettingsItem(title) {
  var t = title || "";
  if (t === "Personal details") return settingsPersonal();
  if (t === "Communication preferences") return settingsComms();
  if (t === "Business") return settingsBusiness();
  if (t === "Team and security") return settingsSecurity();
  if (t === "Linked accounts and payouts") return settingsPayouts();
  if (t === "Developers") return settingsDevelopers();
  if (t === "Payments" || t === "Billing" || t === "Tax" || t === "Radar" || t === "Connect" || t === "Checkout and Payment Links" || t === "Managed Payments" || t === "Sigma" || t === "Financial Connections") {
    return settingsProductStub(t);
  }
  return settingsGeneric(t);
}

function fieldRow(label, key, value, opts) {
  opts = opts || {};
  var id = "sf_" + key;
  if (opts.type === "select") {
    var optsHtml = (opts.options || []).map(function (o) {
      return '<option value="' + esc(o) + '"' + (o === value ? " selected" : "") + ">" + esc(o) + "</option>";
    }).join("");
    return '<label class="sf"><span>' + esc(label) + '</span><select id="' + id + '" data-key="' + esc(key) + '">' + optsHtml + "</select></label>";
  }
  if (opts.type === "readonly") {
    return '<label class="sf"><span>' + esc(label) + '</span><div class="sf-ro"><input id="' + id + '" data-key="' + esc(key) + '" value="' + esc(value) + '" readonly>' +
      (opts.copy ? '<button class="ibx" data-act="copy" data-v="' + esc(value) + '" type="button">' + ic("copy") + "</button>" : "") + "</div></label>";
  }
  return '<label class="sf"><span>' + esc(label) + '</span><input id="' + id + '" data-key="' + esc(key) + '" value="' + esc(value) + '" placeholder="' + esc(opts.placeholder || "") + '"></label>';
}

function saveBar() {
  return '<div class="sf-actions"><button class="btn pri" data-act="settingssave" type="button">Save</button><button class="btn" data-act="settingsback" type="button">Cancel</button><span class="sf-saved" id="sf_saved" hidden>Saved</span></div>';
}

function collectSettingsFields(root) {
  var out = {};
  (root || document).querySelectorAll("[data-key]").forEach(function (el) {
    out[el.getAttribute("data-key")] = el.value;
  });
  (root || document).querySelectorAll("[data-check]").forEach(function (el) {
    out[el.getAttribute("data-check")] = !!el.checked;
  });
  return out;
}

function settingsPersonal() {
  var name = settingsVal("personName", (typeof biz !== "undefined" ? biz : "DELEXO"));
  var email = settingsVal("email", "guest@larpcity.local");
  var phone = settingsVal("phone", "+1 (700) 678-8878");
  var backup = settingsVal("backupEmail", "");
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar("Personal details") +
    '<span class="pill">Global setting</span>' +
    '<section class="set-card"><div class="set-card-h"><h3>Profile</h3></div>' +
    fieldRow("Name", "personName", name) +
    fieldRow("Password", "password", "••••••••", { placeholder: "••••••••" }) +
    fieldRow("Email", "email", email) +
    fieldRow("Backup email", "backupEmail", backup, { placeholder: "Add backup email" }) +
    fieldRow("Contact phone", "phone", phone) +
    "</section>" +
    '<section class="set-card"><div class="set-card-h"><h3>Google account</h3></div><p class="muted">Sign in to Stripe using your Google account.</p><button class="btn" data-act="noop" type="button">Connect Google account</button></section>' +
    '<section class="set-card"><div class="set-card-h"><h3>Passkeys</h3></div><p class="muted">Sign in securely with biometrics, device PIN, or a hardware security key.</p><button class="btn" data-act="noop" type="button">+ Add passkey</button></section>' +
    '<section class="set-card"><div class="set-card-h"><h3>Two-step authentication</h3><button class="btn" data-act="noop" type="button">+ Add authentication method</button></div>' +
    '<table class="set-table"><thead><tr><th>Method</th><th>Device</th><th>Date added</th></tr></thead><tbody>' +
    '<tr><td>Authenticator app</td><td>—</td><td>March 16, 2025</td></tr>' +
    '<tr><td>Windows Hello (Default)</td><td>My Windows Hello</td><td>March 16, 2025</td></tr>' +
    '<tr><td>Security key</td><td>My security key</td><td>March 16, 2025</td></tr>' +
    "</tbody></table></section>" +
    '<section class="set-card"><div class="set-card-h"><h3>Language</h3></div><p class="muted">Select a preferred language, including date, time, and number formatting.</p>' +
    fieldRow("Language", "language", settingsVal("language", "Auto-detect"), { type: "select", options: ["Auto-detect", "English (United States)", "English (United Kingdom)", "Español", "Français", "Deutsch"] }) +
    '<p class="muted">Your detected language is English (United States).</p></section>' +
    saveBar() + "</div>";
}

function settingsComms() {
  var rows = [
    ["risk_status", "Account status information requests", true, false, true],
    ["risk_balance", "Balance collection notice", true, false, true],
    ["risk_fraud", "Fraud investigations on your account", true, false, true],
    ["risk_payout", "Payout capability issues", true, false, false],
    ["risk_reserve", "Reserve-related information needed", true, false, false],
    ["risk_security", "Security related alerts", true, false, true],
    ["risk_unusual", "Unusual activity on your account", true, false, false],
    ["upd_activity", "Account activity summary", false, false, false],
    ["upd_installs", "App installs or uninstalls", false, false, false],
    ["upd_perf", "Business performance summary", false, false, false],
    ["upd_connect", "Connect integration optimizations and suggestions", true, false, false],
    ["upd_migrate", "Data migrations between accounts", false, false, false]
  ];
  function chk(key, on, disabled) {
    var saved = window.__LC_LOAD_SETTINGS ? window.__LC_LOAD_SETTINGS()[key] : null;
    var checked = saved == null ? on : !!saved;
    return '<label class="chk' + (disabled ? " dis" : "") + '"><input type="checkbox" data-check="' + key + '"' + (checked ? " checked" : "") + (disabled ? " disabled" : "") + "></label>";
  }
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar("Communication preferences") +
    '<p class="muted">Your communication preferences will only apply to ' + esc(biz) + '.</p>' +
    '<div class="tabs-row"><button class="tab on" type="button">Account</button><button class="tab" type="button">Transactions and Balances</button><button class="tab" type="button">API</button><button class="tab" type="button">Connected accounts</button><button class="tab" type="button">Stripe updates</button></div>' +
    '<div class="comms-head"><span></span><span>Email</span><span>SMS</span><span>Push</span></div>' +
    '<h3 class="h3">Account risk and compliance</h3>' +
    rows.slice(0, 7).map(function (r) {
      return '<div class="comms-row"><span>' + esc(r[1]) + '</span>' + chk(r[0] + "_email", r[2]) + chk(r[0] + "_sms", r[3], true) + chk(r[0] + "_push", r[4], r[0].indexOf("risk_payout") === 0 || r[0].indexOf("risk_reserve") === 0 || r[0].indexOf("risk_unusual") === 0) + "</div>";
    }).join("") +
    '<h3 class="h3">Account updates</h3>' +
    rows.slice(7).map(function (r) {
      return '<div class="comms-row"><span>' + esc(r[1]) + '</span>' + chk(r[0] + "_email", r[2]) + chk(r[0] + "_sms", r[3], true) + chk(r[0] + "_push", r[4], true) + "</div>";
    }).join("") +
    saveBar() + "</div>";
}

function settingsBusiness() {
  var acctName = settingsVal("accountName", biz);
  var acctId = settingsVal("accountId", X.acct);
  var city = settingsVal("city", "Murrieta");
  var state = settingsVal("state", "California");
  var zip = settingsVal("zip", "");
  var line1 = settingsVal("address1", "");
  var line2 = settingsVal("address2", "");
  var tz = settingsVal("timezone", "Etc - UTC");
  var legal = settingsVal("legalName", settingsVal("personName", "Kelly Smith"));
  var website = settingsVal("website", "https://trymoonrise.com");
  var supportPhone = settingsVal("supportPhone", settingsVal("phone", "+1 (760) 878-8878"));
  var supportEmail = settingsVal("supportEmail", settingsVal("email", "trymoonrise@gmail.com"));
  var descriptor = settingsVal("statementDescriptor", String(biz || "BUSINESS").toUpperCase().slice(0, 22));
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar("Business") +
    '<div class="tabs-row"><button class="tab on" type="button">Account details</button><button class="tab" type="button">Account status</button><button class="tab" type="button">Business details</button><button class="tab" type="button">Tax details</button><button class="tab" type="button">Branding</button><button class="tab" type="button">Custom domains</button><button class="tab" type="button">Customer emails</button></div>' +
    '<section class="set-card"><h3>Account details</h3>' +
    fieldRow("Account name", "accountName", acctName) +
    fieldRow("Account ID", "accountId", acctId, { type: "readonly", copy: true }) +
    '<p class="muted">Business address — shared with other Stripe accounts. Changes apply to all accounts.</p>' +
    fieldRow("Address line 1", "address1", line1) +
    fieldRow("Address line 2", "address2", line2) +
    fieldRow("City", "city", city) +
    fieldRow("State", "state", state, { type: "select", options: ["California", "New York", "Texas", "Florida", "Washington", "Other"] }) +
    fieldRow("ZIP", "zip", zip, { placeholder: "ZIP (95014)" }) +
    (zip ? "" : '<p class="err">Address ZIP is recommended for a complete profile.</p>') +
    '<p class="ok-pill">Phone verification · Verified</p>' +
    fieldRow("Time zone", "timezone", tz, { type: "select", options: ["Etc - UTC", "America/Los_Angeles", "America/New_York", "America/Chicago", "Europe/London"] }) +
    "</section>" +
    '<section class="set-card"><h3>Business details</h3>' +
    fieldRow("Name", "legalName", legal) +
    fieldRow("Business website", "website", website) +
    fieldRow("Public business name", "publicName", settingsVal("publicName", acctName)) +
    fieldRow("Product description", "productDesc", settingsVal("productDesc", "Software")) +
    fieldRow("Industry", "industry", settingsVal("industry", "Software")) +
    "</section>" +
    '<section class="set-card"><h3>Public details</h3>' +
    fieldRow("Support phone", "supportPhone", supportPhone) +
    fieldRow("Support email", "supportEmail", supportEmail) +
    fieldRow("Support address", "supportAddress", settingsVal("supportAddress", city + " US")) +
    "</section>" +
    '<section class="set-card"><h3>Statement descriptor</h3>' +
    fieldRow("Statement descriptor", "statementDescriptor", descriptor) +
    "</section>" +
    '<section class="set-card"><h3>Management and ownership</h3>' +
    fieldRow("Account representative", "ownerName", settingsVal("ownerName", legal)) +
    fieldRow("Email", "ownerEmail", settingsVal("ownerEmail", supportEmail)) +
    fieldRow("Date of birth", "ownerDob", settingsVal("ownerDob", "December 22, 2005")) +
    fieldRow("Address", "ownerAddress", settingsVal("ownerAddress", "82452 California Ave, Ontario, CA 92833 US")) +
    "</section>" +
    saveBar() + "</div>";
}

function settingsSecurity() {
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar("Team and security") +
    '<p class="note">Check that you have your 24 character <b>backup code</b>. You can <button class="linkish" data-act="noop" type="button">generate a new backup code</button> and invalidate the old one if you no longer have it.</p>' +
    '<section class="set-card"><h3>Sessions</h3><p class="muted">Places where you’re signed in to Stripe.</p>' +
    '<div class="set-card-h"><span></span><button class="btn" data-act="noop" type="button">Sign out all other sessions</button></div>' +
    '<table class="set-table"><thead><tr><th>Location</th><th>Device</th><th>IP address</th><th>Time</th><th></th></tr></thead><tbody>' +
    '<tr><td>United States (CA)</td><td>Chrome - Windows</td><td>187.13.143.231</td><td>1 minute ago</td><td class="muted">Current session</td></tr>' +
    '<tr><td>United States (CA)</td><td>Unknown browser - Unknown OS</td><td>187.13.182.118</td><td>8 minutes ago</td><td><button class="linkish" data-act="noop" type="button">Sign out</button></td></tr>' +
    '<tr><td>United States (CA)</td><td>Chrome - Windows</td><td>187.13.178.104</td><td>last month</td><td class="muted">Expired</td></tr>' +
    '<tr><td>United States (CA)</td><td>Unknown browser - Unknown OS</td><td>76.86.0.242</td><td>last month</td><td class="muted">Expired</td></tr>' +
    "</tbody></table></section>" +
    '<section class="set-card"><h3>Accounts</h3><p class="muted">The list of accounts of which you are a member.</p>' +
    '<table class="set-table"><thead><tr><th>Name</th><th>ID</th><th></th></tr></thead><tbody>' +
    '<tr><td>' + esc(biz) + '</td><td class="mono">' + esc(X.acct) + '</td><td>…</td></tr>' +
    "</tbody></table></section>" +
    saveBar() + "</div>";
}

function settingsPayouts() {
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar("Linked accounts and payouts") +
    '<section class="set-card"><h3>Bank accounts</h3>' +
    fieldRow("Bank name", "bankName", settingsVal("bankName", (bank && bank.name) || "JPMORGAN CHASE BANK, NA")) +
    fieldRow("Last4", "bankLast4", settingsVal("bankLast4", (bank && bank.last4) || "3177")) +
    fieldRow("Currency", "payoutCurrency", settingsVal("payoutCurrency", cur || "USD")) +
    fieldRow("Payout schedule", "payoutSchedule", settingsVal("payoutSchedule", "Daily"), { type: "select", options: ["Daily", "Weekly", "Monthly", "Manual"] }) +
    "</section>" + saveBar() + "</div>";
}

function settingsDevelopers() {
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar("Developers") +
    '<section class="set-card"><h3>API keys</h3><p class="muted">Restricted keys and Workbench for this LARP sandbox.</p>' +
    fieldRow("Publishable key", "pk", settingsVal("pk", "pk_test_" + String(X.acct || "acct").slice(-10)), { type: "readonly", copy: true }) +
    fieldRow("Secret key", "sk", settingsVal("sk", "sk_test_••••••••••••"), { type: "readonly" }) +
    "</section>" + saveBar() + "</div>";
}

function settingsProductStub(title) {
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar(title) +
    '<section class="set-card"><h3>' + esc(title) + ' settings</h3>' +
    fieldRow("Display name", "prod_" + title.replace(/\s+/g, "_") + "_name", settingsVal("prod_" + title.replace(/\s+/g, "_") + "_name", title)) +
    fieldRow("Notes", "prod_" + title.replace(/\s+/g, "_") + "_notes", settingsVal("prod_" + title.replace(/\s+/g, "_") + "_notes", "")) +
    '<label class="sf check"><input type="checkbox" data-check="prod_' + esc(title.replace(/\s+/g, "_")) + '_enabled" ' + (settingsVal("prod_" + title.replace(/\s+/g, "_") + "_enabled", "true") !== "false" ? "checked" : "") + '> Enabled for this account</label>' +
    "</section>" + saveBar() + "</div>";
}

function settingsGeneric(title) {
  view.innerHTML = '<div class="pg set-sub">' + settingsBackBar(title) +
    '<section class="set-card"><h3>' + esc(title) + '</h3>' +
    fieldRow("Value", "generic_" + title.replace(/\s+/g, "_"), settingsVal("generic_" + title.replace(/\s+/g, "_"), "")) +
    '<p class="muted">Changes save to this LARP on this device.</p></section>' + saveBar() + "</div>";
}
