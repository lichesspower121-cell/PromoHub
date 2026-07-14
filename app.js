"use strict";

// IMPORTANT: replace this after deploying server.py.
// Example: https://your-promohub-api.onrender.com
const API_BASE_URL = "https://YOUR-BACKEND-URL";

const tg = window.Telegram && window.Telegram.WebApp
  ? window.Telegram.WebApp
  : null;

if (tg) {
  tg.ready();
  tg.expand();
}

const $ = (id) => document.getElementById(id);

const loader = $("loader");
const loadingText = $("loadingText");
const loginPage = $("loginPage");
const app = $("app");
const loginButton = $("loginButton");
const logoutButton = $("logoutButton");
const actionLoader = $("actionLoader");
const actionLoaderText = $("actionLoaderText");
const userName = $("userName");
const profileName = $("profileName");
const profileUsername = $("profileUsername");
const profileButton = $("profileButton");
const startPromotionButton = $("startPromotionButton");
const quickPromoteButton = $("quickPromoteButton");
const viewCampaignsButton = $("viewCampaignsButton");
const createCampaignButton = $("createCampaignButton");
const promotionLink = $("promotionLink");
const promotionAmount = $("promotionAmount");
const usersTargetBox = $("usersTargetBox");
const groupTargetBox = $("groupTargetBox");
const campaignCost = $("campaignCost");
const formMessage = $("formMessage");
const campaignCount = $("campaignCount");
const totalReach = $("totalReach");
const campaignList = $("campaignList");
const recentCampaigns = $("recentCampaigns");
const creditBalance = $("creditBalance");
const profileCredits = $("profileCredits");

let currentUser = null;
let campaigns = [];
let promotionType = "users";
let credits = 100;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getTelegramUser() {
  try {
    const user = tg?.initDataUnsafe?.user;
    if (!user) return null;

    return {
      id: String(user.id),
      firstName: user.first_name || "Telegram User",
      lastName: user.last_name || "",
      username: user.username || ""
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function campaignKey() {
  return `promohub_campaigns_${currentUser.id}`;
}

function creditKey() {
  return `promohub_credits_${currentUser.id}`;
}

async function startApp() {
  loadingText.textContent = "Connecting to Telegram...";
  await wait(500);

  currentUser = getTelegramUser();

  loadingText.textContent = "Loading PromoHub...";
  await wait(500);

  loader.classList.add("hidden");

  if (currentUser) {
    openApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

function openApp() {
  loginPage.classList.add("hidden");
  app.classList.remove("hidden");
  loadUserData();
  updateUserUI();
  updateCampaignUI();
  updatePromotionUI();
  openPage("dashboardPage");
}

loginButton.addEventListener("click", () => {
  currentUser = getTelegramUser();

  if (!currentUser) {
    alert("Open this website from the Telegram Mini App button.");
    return;
  }

  openApp();
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  showLogin();
});

function loadUserData() {
  try {
    campaigns = JSON.parse(localStorage.getItem(campaignKey()) || "[]");
  } catch {
    campaigns = [];
  }

  const savedCredits = localStorage.getItem(creditKey());
  credits = savedCredits === null ? 100 : Number(savedCredits);

  if (!Number.isFinite(credits)) credits = 100;
  saveCredits();
}

function saveCampaigns() {
  localStorage.setItem(campaignKey(), JSON.stringify(campaigns));
}

function saveCredits() {
  localStorage.setItem(creditKey(), String(credits));
}

function updateUserUI() {
  if (!currentUser) return;

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

  userName.textContent = fullName;
  profileName.textContent = fullName;
  profileUsername.textContent = currentUser.username
    ? `@${currentUser.username}`
    : `Telegram ID: ${currentUser.id}`;

  creditBalance.textContent = credits;
  profileCredits.textContent = `${credits} credits`;
}

function openPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.add("hidden"));
  $(pageId)?.classList.remove("hidden");

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});

profileButton.addEventListener("click", () => openPage("profilePage"));
startPromotionButton.addEventListener("click", () => openPage("promotePage"));
quickPromoteButton.addEventListener("click", () => openPage("promotePage"));
viewCampaignsButton.addEventListener("click", () => openPage("campaignsPage"));

document.querySelectorAll(".promotion-option").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".promotion-option")
      .forEach((item) => item.classList.remove("selected"));

    option.classList.add("selected");
    promotionType = option.dataset.type;
    updatePromotionUI();
  });
});

promotionAmount.addEventListener("change", updatePromotionUI);

function updatePromotionUI() {
  const isUsers = promotionType === "users";

  usersTargetBox.classList.toggle("hidden", !isUsers);
  groupTargetBox.classList.toggle("hidden", isUsers);

  campaignCost.textContent = isUsers
    ? String(Number(promotionAmount.value))
    : "10";
}

function isTelegramLink(link) {
  try {
    const url = new URL(link);
    return url.protocol === "https:" &&
      (url.hostname === "t.me" || url.hostname === "telegram.me");
  } catch {
    return false;
  }
}

createCampaignButton.addEventListener("click", async () => {
  clearMessage();

  const link = promotionLink.value.trim();

  if (!isTelegramLink(link)) {
    showMessage("Enter a valid https://t.me/... link.", "error");
    promotionLink.focus();
    return;
  }

  if (API_BASE_URL.includes("YOUR-BACKEND-URL")) {
    showMessage("Set API_BASE_URL in app.js after deploying server.py.", "error");
    return;
  }

  const amount = promotionType === "users"
    ? Number(promotionAmount.value)
    : 1;

  const cost = promotionType === "users"
    ? amount
    : 10;

  if (credits < cost) {
    showMessage(`You need ${cost} credits for this campaign.`, "error");
    return;
  }

  showActionLoader("Creating campaign...");

  try {
    let result;

    if (promotionType === "groups") {
      result = await postGroupPromotion(link);
    } else {
      // Users mode creates a campaign target only.
      // It does not mass-message Telegram users.
      result = {
        success: true,
        message: `User campaign created for ${amount} users`
      };
    }

    if (!result.success) {
      throw new Error(result.error || "Campaign failed");
    }

    credits -= cost;

    campaigns.unshift({
      id: Date.now(),
      link,
      type: promotionType,
      amount,
      cost,
      destination: promotionType === "groups"
        ? "@giveawayforall2"
        : `${amount} users`,
      status: promotionType === "groups" ? "Posted" : "Created",
      created: new Date().toISOString()
    });

    saveCampaigns();
    saveCredits();
    promotionLink.value = "";
    updateUserUI();
    updateCampaignUI();

    hideActionLoader();
    showMessage(result.message || "Campaign created.", "success");
    openPage("campaignsPage");
  } catch (error) {
    hideActionLoader();
    showMessage(error.message || "Campaign failed.", "error");
  }
});

async function postGroupPromotion(link) {
  if (!tg?.initData) {
    return {
      success: false,
      error: "Open PromoHub inside Telegram before posting."
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/promote/group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": tg.initData
    },
    body: JSON.stringify({ link })
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: "Invalid server response"
  }));

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Server rejected the campaign"
    };
  }

  return data;
}

function updateCampaignUI() {
  campaignCount.textContent = campaigns.length;

  totalReach.textContent = campaigns.reduce((total, campaign) => {
    return total + Number(campaign.amount || 0);
  }, 0);

  campaignList.innerHTML = "";
  recentCampaigns.innerHTML = "";

  campaigns.forEach((campaign) => {
    campaignList.appendChild(createCampaignCard(campaign));
  });

  campaigns.slice(0, 2).forEach((campaign) => {
    recentCampaigns.appendChild(createCampaignCard(campaign));
  });
}

function createCampaignCard(campaign) {
  const card = document.createElement("article");
  card.className = "campaign-card";

  const title = campaign.type === "groups"
    ? "📢 Group Promotion"
    : "👥 User Campaign";

  card.innerHTML = `
    <div class="campaign-top">
      <div>
        <strong>${title}</strong>
        <span>${escapeHTML(campaign.link)}</span>
      </div>
      <b>${escapeHTML(campaign.status || "Created")}</b>
    </div>
    <div class="campaign-meta">
      Destination: ${escapeHTML(campaign.destination || "Unknown")}
      · Cost: ${Number(campaign.cost || 0)} credits
    </div>
  `;

  return card;
}

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}

function showActionLoader(text) {
  actionLoaderText.textContent = text || "Processing...";
  actionLoader.classList.remove("hidden");
}

function hideActionLoader() {
  actionLoader.classList.add("hidden");
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type || ""}`;
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

startApp();
