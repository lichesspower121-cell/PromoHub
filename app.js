"use strict";

/*
==========================================
 PromoHub v3
 Part 1/4
==========================================
*/

/* ==========================================
   CONFIG
========================================== */

const API_BASE_URL = "https://promohub-backend-fkvo.onrender.com";

/* ==========================================
   TELEGRAM
========================================== */

const tg = window.Telegram?.WebApp || null;

if (tg) {
    tg.ready();
    tg.expand();
}

/* ==========================================
   HELPERS
========================================== */

const $ = id => document.getElementById(id);

const $$ = selector => document.querySelectorAll(selector);

const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

/* ==========================================
   DOM ELEMENTS
========================================== */

const loader = $("loader");
const loginPage = $("loginPage");
const app = $("app");

const loadingText = $("loadingText");

const loginButton = $("loginButton");
const logoutButton = $("logoutButton");

const userName = $("userName");
const profileName = $("profileName");
const profileUsername = $("profileUsername");

const creditBalance = $("creditBalance");
const profileCredits = $("profileCredits");
const profileCreditsText = $("profileCreditsText");
const profileCampaigns = $("profileCampaigns");

const campaignCount = $("campaignCount");
const totalReach = $("totalReach");

const recentCampaigns = $("recentCampaigns");
const campaignList = $("campaignList");

const promotionLink = $("promotionLink");
const promotionAmount = $("promotionAmount");

const createCampaignButton = $("createCampaignButton");

const startPromotionButton = $("startPromotionButton");
const quickPromoteButton = $("quickPromoteButton");
const viewCampaignsButton = $("viewCampaignsButton");

const usersTargetBox = $("usersTargetBox");
const groupTargetBox = $("groupTargetBox");

const campaignCost = $("campaignCost");

const formMessage = $("formMessage");

const toastContainer = $("toastContainer");

const successModal = $("successModal");
const closeModal = $("closeModal");

const actionLoader = $("actionLoader");
const actionLoaderText = $("actionLoaderText");

/* ==========================================
   STATE
========================================== */

let currentUser = null;

let credits = 100;

let campaigns = [];

let promotionType = "users";

const DAILY_CREDITS = 100;

const GROUP_COST = 10;

/* ==========================================
   STORAGE
========================================== */

function campaignKey() {

    return `campaigns_${currentUser.id}`;

}

function creditKey() {

    return `credits_${currentUser.id}`;

}

function dayKey() {

    return `day_${currentUser.id}`;

}

/* ==========================================
   TELEGRAM USER
========================================== */

function getTelegramUser() {

    const user = tg?.initDataUnsafe?.user;

    if (user) {

        return {

            id: String(user.id),

            firstName: user.first_name || "",

            lastName: user.last_name || "",

            username: user.username || "",

            photo: user.photo_url || ""

        };

    }

    // Development mode
    return {

        id: "demo",

        firstName: "Demo",

        lastName: "User",

        username: "demo",

        photo: ""

    };

}

/* ==========================================
   LOADER
========================================== */

async function hideLoader() {

    await sleep(1500);

    loader.classList.add("hidden");

}

function showActionLoader(text = "Loading...") {

    actionLoader.classList.remove("hidden");

    actionLoaderText.textContent = text;

}

function hideActionLoader() {

    actionLoader.classList.add("hidden");

}

/* ==========================================
   TOAST
========================================== */

function showToast(message, type = "success") {

    if (!toastContainer) return;

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

/* ==========================================
   SUCCESS MODAL
========================================== */

function showSuccess() {

    successModal.classList.remove("hidden");

}

if (closeModal) {

    closeModal.onclick = () => {

        successModal.classList.add("hidden");

    };

}
/*
==========================================
 PromoHub v3
 Part 2/4
==========================================
*/

/* ==========================================
   LOCAL STORAGE
========================================== */

function loadCredits() {

    const today = new Date().toDateString();

    const savedDay = localStorage.getItem(dayKey());

    if (savedDay !== today) {

        credits = DAILY_CREDITS;

        localStorage.setItem(dayKey(), today);

        localStorage.setItem(
            creditKey(),
            credits
        );

    } else {

        credits = Number(

            localStorage.getItem(
                creditKey()
            ) || DAILY_CREDITS

        );

    }

}

function saveCredits() {

    localStorage.setItem(

        creditKey(),

        credits

    );

}

function loadCampaigns() {

    campaigns = JSON.parse(

        localStorage.getItem(

            campaignKey()

        ) || "[]"

    );

}

function saveCampaigns() {

    localStorage.setItem(

        campaignKey(),

        JSON.stringify(campaigns)

    );

    saveCredits();

}

/* ==========================================
   PROFILE
========================================== */

function loadProfile() {

    currentUser = getTelegramUser();

    const fullName =

        `${currentUser.firstName} ${currentUser.lastName}`

        .trim();

    userName.textContent =

        fullName || "Telegram User";

    profileName.textContent =

        fullName || "Telegram User";

    profileUsername.textContent =

        currentUser.username

        ? `@${currentUser.username}`

        : "@demo";

}

/* ==========================================
   DASHBOARD
========================================== */

function refreshDashboard() {

    creditBalance.textContent = credits;

    profileCredits.textContent = credits;

    profileCreditsText.textContent =

        `${credits} Credits`;

    campaignCount.textContent =

        campaigns.length;

    profileCampaigns.textContent =

        `${campaigns.length} Campaigns`;

    let reach = 0;

    campaigns.forEach(campaign => {

        if (campaign.type === "users") {

            reach += Number(campaign.amount);

        }

    });

    totalReach.textContent = reach;

}

/* ==========================================
   NAVIGATION
========================================== */

const pages = [

    "dashboardPage",

    "promotePage",

    "campaignsPage",

    "premiumPage",

    "profilePage"

];

function showPage(pageId) {

    pages.forEach(page => {

        const section = document.getElementById(page);

        if (section) {

            section.classList.add("hidden");

        }

    });

    document

        .getElementById(pageId)

        .classList.remove("hidden");

    $$(".nav-button").forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageId) {

            button.classList.add("active");

        }

    });

}

/* ==========================================
   BUTTON EVENTS
========================================== */

$$(".nav-button").forEach(button => {

    button.onclick = () => {

        showPage(

            button.dataset.page

        );

    };

});

if (startPromotionButton) {

    startPromotionButton.onclick = () => {

        showPage("promotePage");

    };

}

if (quickPromoteButton) {

    quickPromoteButton.onclick = () => {

        showPage("promotePage");

    };

}

if (viewCampaignsButton) {

    viewCampaignsButton.onclick = () => {

        showPage("campaignsPage");

    };

}

/* ==========================================
   LOGIN
========================================== */

if (loginButton) {

    loginButton.onclick = () => {

        loginPage.classList.add("hidden");

        app.classList.remove("hidden");

        showToast(

            "Welcome to PromoHub!"

        );

    };

}

/* ==========================================
   LOGOUT
========================================== */

if (logoutButton) {

    logoutButton.onclick = () => {

        if (

            confirm(

                "Logout?"

            )

        ) {

            loginPage.classList.remove(

                "hidden"

            );

            app.classList.add(

                "hidden"

            );

        }

    };

}
/*
==========================================
 PromoHub v3
 Part 3/4
==========================================
*/

/* ==========================================
   PROMOTION TYPE
========================================== */

$$(".promotion-option").forEach(button => {

    button.onclick = () => {

        $$(".promotion-option").forEach(item => {

            item.classList.remove("selected");

        });

        button.classList.add("selected");

        promotionType = button.dataset.type;

        usersTargetBox.classList.toggle(
            "hidden",
            promotionType !== "users"
        );

        groupTargetBox.classList.toggle(
            "hidden",
            promotionType !== "groups"
        );

        updateCampaignCost();

    };

});

function updateCampaignCost() {

    if (promotionType === "groups") {

        campaignCost.textContent = GROUP_COST;

        return;

    }

    campaignCost.textContent =
        Number(promotionAmount.value);

}

promotionAmount.onchange = updateCampaignCost;

/* ==========================================
   VALIDATION
========================================== */

function validTelegramLink(link) {

    try {

        const url = new URL(link);

        return (

            url.protocol === "https:" &&

            (

                url.hostname === "t.me" ||

                url.hostname === "telegram.me"

            )

        );

    }

    catch {

        return false;

    }

}

/* ==========================================
   CAMPAIGN CARD
========================================== */

function createCampaignCard(campaign) {

    const card = document.createElement("div");

    card.className = "campaign-card";

    card.innerHTML = `

        <div class="campaign-top">

            <strong>

                ${campaign.type === "groups"
                    ? "📢 Group Promotion"
                    : "👥 User Promotion"}

            </strong>

            <span>

                ${campaign.status}

            </span>

        </div>

        <p>${campaign.link}</p>

        <div class="campaign-bottom">

            <small>${campaign.created}</small>

            <strong>${campaign.credits} Credits</strong>

        </div>

    `;

    return card;

}

/* ==========================================
   RENDER CAMPAIGNS
========================================== */

function renderRecentCampaigns() {

    recentCampaigns.innerHTML = "";

    if (!campaigns.length) {

        recentCampaigns.innerHTML = `

            <div class="empty-card">

                🚀

                <p>No campaigns yet.</p>

            </div>

        `;

        return;

    }

    campaigns

        .slice(0, 3)

        .forEach(campaign => {

            recentCampaigns.appendChild(

                createCampaignCard(campaign)

            );

        });

}

function renderCampaignHistory() {

    campaignList.innerHTML = "";

    if (!campaigns.length) {

        campaignList.innerHTML = `

            <div class="empty-card">

                📊

                <p>No campaigns yet.</p>

            </div>

        `;

        return;

    }

    campaigns.forEach(campaign => {

        campaignList.appendChild(

            createCampaignCard(campaign)

        );

    });

}

/* ==========================================
   CREATE CAMPAIGN
========================================== */

createCampaignButton.onclick = async () => {

    const link = promotionLink.value.trim();

    if (!validTelegramLink(link)) {

        showToast(
            "Enter a valid Telegram link.",
            "error"
        );

        return;

    }

    const cost =

        promotionType === "groups"

            ? GROUP_COST

            : Number(promotionAmount.value);

    if (credits < cost) {

        showToast(
            "Not enough credits.",
            "error"
        );

        return;

    }

    showActionLoader(
        "Creating campaign..."
    );

    try {

        if (promotionType === "groups") {

            const response = await fetch(

                `${API_BASE_URL}/api/promote/group`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        "X-Telegram-Init-Data":

                            tg?.initData || ""

                    },

                    body: JSON.stringify({

                        link

                    })

                }

            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(

                    data.error ||

                    "Promotion failed."

                );

            }

        }

        credits -= cost;

        const campaign = {

            id: Date.now(),

            link,

            type: promotionType,

            amount:

                promotionType === "groups"

                    ? 1

                    : Number(

                        promotionAmount.value

                    ),

            credits: cost,

            status: "Running",

            created:

                new Date()

                .toLocaleString()

        };

        campaigns.unshift(campaign);

        saveCampaigns();

        refreshDashboard();

        renderRecentCampaigns();

        renderCampaignHistory();

        promotionLink.value = "";

        showSuccess();

        showToast(

            "Campaign created!"

        );

        showPage("campaignsPage");

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally {

        hideActionLoader();

    }

};
