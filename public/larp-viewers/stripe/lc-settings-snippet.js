/* Injected Stripe settings — official hub + editable subpages with local save.
   Keep in sync with settings() in home.html. */

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
      ["Managed Payments", "payments", "Stripe’s merchant of record handles global tax/fraud."],
      ["Sigma", "list", "Manage your Sigma features."],
      ["Financial Connections", "chain", "Appearance, featured institutions, usage details."],
      ["Payments", "payments", "Checkout, payment methods, currency conversion."],
      ["Tax", "tag", "Head office address, tax code, tax integrations."],
      ["Identity", "user", "Verification sessions, government IDs, and more."],
      ["Radar", "radar", "Rules, lists, and risk controls."]
    ]]
  ];
  view.innerHTML = '<div class="pg set">' + pageHead("Settings") +
    (S._banner === false ? "" : '<div class="set-banner"><span class="set-banner-ic" aria-hidden="true">💡</span><span class="set-banner-txt">Get access to all your Stripe data right in the Dashboard with Stripe Sigma—no pipelines or warehouses needed.</span><button class="set-banner-cta" data-act="noop" type="button">Try free for 30 days</button><button class="set-banner-x" data-act="settingsdismissbanner" type="button" aria-label="Dismiss">✕</button></div>') +
    groups.map(function (g) {
      var cards = g[1].map(function (s) {
        return '<button class="set-item" data-act="settingsitem" data-t="' + esc(s[0]) + '" type="button"><span class="sico">' + ic(s[1]) + '</span>' +
          '<span class="set-item-txt"><span class="set-item-t">' + esc(s[0]) + '</span><span class="set-item-d">' + esc(s[2]) + '</span></span></button>';
      }).join("");
      if (g[0] === "Product settings") {
        cards += '<button class="set-discover" data-act="noop" type="button"><span class="sico">+</span><span class="set-item-txt"><span class="set-item-t">Discover more features</span><span class="set-item-d">Boost revenue, manage finances, and more.</span></span></button>';
      }
      return '<h2 class="h2">' + esc(g[0]) + '</h2><div class="set-grid">' + cards + "</div>";
    }).join("") +
    '<div class="set-foot"><button type="button" data-act="noop">Share feedback</button><button type="button" data-act="noop">Keyboard shortcuts</button></div>' +
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
  if (t === "Payments" || t === "Billing" || t === "Tax" || t === "Radar" || t === "Identity" || t === "Connect" || t === "Checkout and Payment Links" || t === "Managed Payments" || t === "Sigma" || t === "Financial Connections") {
    return settingsProductStub(t);
  }
  return settingsGeneric(t);
}
