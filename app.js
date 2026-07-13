"use strict";

/*
==========================================
 PromoHub v2
 Part 1/7
==========================================
*/

const API_BASE_URL = "https://promohub-backend-fkvo.onrender.com";

const tg =
window.Telegram &&
window.Telegram.WebApp
? window.Telegram.WebApp
: null;

if (tg) {

tg.ready();

tg.expand();

tg.enableClosingConfirmation();

}

/* ==========================
   Helpers
========================== */

const $ = id => document.getElementById(id);

const $$ = selector =>
document.querySelectorAll(selector);

const wait = ms =>
new Promise(resolve =>
setTimeout(resolve, ms)
);

/* ==========================
 Loader
========================== */

const loader = $("loader");

const loadingText = $("loadingText");

const actionLoader = $("actionLoader");

const actionLoaderText = $("actionLoaderText");

const successModal = $("successModal");

const closeModal = $("closeModal");

const toastContainer = $("toastContainer");

/* ==========================
 Login
========================== */

const loginPage = $("loginPage");

const loginButton = $("loginButton");

const logoutButton = $("logoutButton");

/* ==========================
 Main App
========================== */

const app = $("app");

const userName = $("userName");

const profileName = $("profileName");

const profileUsername = $("profileUsername");

const profileCredits = $("profileCredits");

const profileCreditsText =
$("profileCreditsText");

const profileCampaigns =
$("profileCampaigns");

const creditBalance =
$("creditBalance");

/* ==========================
 Dashboard
========================== */

const campaignCount =
$("campaignCount");

const totalReach =
$("totalReach");

const recentCampaigns =
$("recentCampaigns");

const campaignList =
$("campaignList");

/* ==========================
 Promotion
========================== */

const startPromotionButton =
$("startPromotionButton");

const quickPromoteButton =
$("quickPromoteButton");

const viewCampaignsButton =
$("viewCampaignsButton");

const createCampaignButton =
$("createCampaignButton");

const promotionLink =
$("promotionLink");

const promotionAmount =
$("promotionAmount");

const campaignCost =
$("campaignCost");

const usersTargetBox =
$("usersTargetBox");

const groupTargetBox =
$("groupTargetBox");

const formMessage =
$("formMessage");

/* ==========================
 State
========================== */

let currentUser = null;

let campaigns = [];

let credits = 100;

let promotionType = "users";

const DAILY_CREDITS = 100;

const GROUP_COST = 10;

/* ==========================
 Telegram User
========================== */

function getTelegramUser(){

try{

const user =
tg?.initDataUnsafe?.user;

if(!user){

return null;

}

return{

id:String(user.id),

firstName:user.first_name || "",

lastName:user.last_name || "",

username:user.username || "",

photo:user.photo_url || ""

};

}

catch(e){

console.error(e);

return null;

}

}

/* ==========================
 Storage Keys
========================== */

function campaignKey(){

return `campaigns_${currentUser.id}`;

}

function creditKey(){

return `credits_${currentUser.id}`;

}

function dailyKey(){

return `daily_${currentUser.id}`;

}
/*
==========================================
 PromoHub v2
 Part 2/7
==========================================
*/

/* ==========================
 Daily Credits
========================== */

function resetDailyCredits(){

const today = new Date().toDateString();

const savedDay = localStorage.getItem(dailyKey());

if(savedDay !== today){

credits = DAILY_CREDITS;

localStorage.setItem(creditKey(), credits);

localStorage.setItem(dailyKey(), today);

}else{

credits = Number(

localStorage.getItem(creditKey())

|| DAILY_CREDITS

);

}

}

/* ==========================
 Campaign Storage
========================== */

function loadCampaigns(){

campaigns = JSON.parse(

localStorage.getItem(

campaignKey()

) || "[]"

);

}

function saveCampaigns(){

localStorage.setItem(

campaignKey(),

JSON.stringify(campaigns)

);

localStorage.setItem(

creditKey(),

credits

);

}

/* ==========================
 Profile
========================== */

function loadProfile(){

currentUser = getTelegramUser();

if(!currentUser){

loginPage.classList.remove("hidden");

app.classList.add("hidden");

return;

}

loginPage.classList.add("hidden");

app.classList.remove("hidden");

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

: "No Username";

}

/* ==========================
 Dashboard
========================== */

function updateDashboard(){

creditBalance.textContent = credits;

profileCredits.textContent = credits;

if(profileCreditsText){

profileCreditsText.textContent =

`${credits} Credits`;

}

campaignCount.textContent =

campaigns.length;

profileCampaigns.textContent =

`${campaigns.length} Campaigns`;

let reach = 0;

campaigns.forEach(c=>{

if(c.type==="users"){

reach += Number(c.amount);

}

});

totalReach.textContent = reach;

renderRecentCampaigns();

renderCampaignHistory();

}

/* ==========================
 Navigation
========================== */

const pages = [

"dashboardPage",

"promotePage",

"campaignsPage",

"premiumPage",

"profilePage"

];

function showPage(id){

pages.forEach(page=>{

const el = document.getElementById(page);

if(el){

el.classList.add("hidden");

}

});

document.getElementById(id)

.classList.remove("hidden");

$$(".nav-button").forEach(btn=>{

btn.classList.remove("active");

if(btn.dataset.page===id){

btn.classList.add("active");

}

});

}

$$(".nav-button").forEach(btn=>{

btn.onclick=()=>{

showPage(btn.dataset.page);

};

});

startPromotionButton.onclick=()=>{

showPage("promotePage");

};

if(quickPromoteButton){

quickPromoteButton.onclick=()=>{

showPage("promotePage");

};

}

viewCampaignsButton.onclick=()=>{

showPage("campaignsPage");

};

/* ==========================
 Loading
========================== */

async function hideLoader(){

await wait(1600);

loader.classList.add("hidden");

}

/* ==========================
 Action Loader
========================== */

function showLoader(text){

actionLoader.classList.remove("hidden");

actionLoaderText.textContent =

text || "Loading...";

}

function hideActionLoader(){

actionLoader.classList.add("hidden");

}

/* ==========================
 Success Popup
========================== */

function showSuccess(){

successModal.classList.remove("hidden");

}

if(closeModal){

closeModal.onclick=()=>{

successModal.classList.add("hidden");

};

}
/*
==========================================
 PromoHub v2
 Part 3/7
==========================================
*/

/* ==========================
 Toast Notifications
========================== */

function showToast(message, type = "success") {

    if (!toastContainer) return;

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <strong>${type === "success" ? "✅" : "❌"}</strong>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
    }, 2500);

    setTimeout(() => {
        toast.remove();
    }, 3000);

}

/* ==========================
 Form Messages
========================== */

function showMessage(message, type = "success") {

    formMessage.textContent = message;

    formMessage.className = `form-message ${type}`;

}

function clearMessage() {

    formMessage.textContent = "";

    formMessage.className = "form-message";

}

/* ==========================
 Promotion Type
========================== */

document.querySelectorAll(".promotion-option").forEach(button => {

    button.onclick = () => {

        document.querySelectorAll(".promotion-option")
            .forEach(item => item.classList.remove("selected"));

        button.classList.add("selected");

        promotionType = button.dataset.type;

        updatePromotionBoxes();

    };

});

function updatePromotionBoxes() {

    const users = promotionType === "users";

    usersTargetBox.classList.toggle("hidden", !users);

    groupTargetBox.classList.toggle("hidden", users);

    updateCampaignCost();

}

/* ==========================
 Campaign Cost
========================== */

function updateCampaignCost() {

    if (promotionType === "groups") {

        campaignCost.textContent = GROUP_COST;

        return;

    }

    campaignCost.textContent = Number(
        promotionAmount.value
    );

}

promotionAmount.onchange = updateCampaignCost;

/* ==========================
 Link Validation
========================== */

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

/* ==========================
 Recent Campaigns
========================== */

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

/* ==========================
 Campaign History
========================== */

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
/*
==========================================
 PromoHub v2
 Part 4/7
==========================================
*/

/* ==========================
 Create Campaign
========================== */

createCampaignButton.onclick = async () => {

    clearMessage();

    const link = promotionLink.value.trim();

    if (!link) {
        showMessage("Please enter a Telegram link.", "error");
        return;
    }

    if (!validTelegramLink(link)) {
        showMessage("Please enter a valid Telegram link.", "error");
        return;
    }

    const cost =
        promotionType === "groups"
            ? GROUP_COST
            : Number(promotionAmount.value);

    if (credits < cost) {
        showToast("Not enough credits.", "error");
        showMessage("Not enough credits.", "error");
        return;
    }

    showLoader("Creating campaign...");

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
                    data.error || "Server error"
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
                    : Number(promotionAmount.value),

            credits: cost,

            status: "Running",

            created:
                new Date().toLocaleString()

        };

        campaigns.unshift(campaign);

        saveCampaigns();

        updateDashboard();

        promotionLink.value = "";

        showSuccess();

        showToast(
            "Campaign created successfully!"
        );

        showPage("campaignsPage");

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

        showMessage(
            error.message,
            "error"
        );

    }

    finally {

        hideActionLoader();

    }

};

/* ==========================
 Campaign Card
========================== */

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

        <p>

            ${campaign.link}

        </p>

        <div class="campaign-bottom">

            <small>

                ${campaign.created}

            </small>

            <strong>

                ${campaign.credits} Credits

            </strong>

        </div>

    `;

    return card;

}
/*
==========================================
 PromoHub v2
Part 5/7
==========================================
*/

/* ==========================
 Campaign Status
========================== */

function updateCampaignStatuses() {

    let changed = false;

    campaigns.forEach(campaign => {

        if (campaign.status !== "Running") return;

        const created = new Date(campaign.created).getTime();

        const now = Date.now();

        if (now - created > 300000) {

            campaign.status = "Completed";

            changed = true;

        }

    });

    if (changed) {

        saveCampaigns();

        renderCampaignHistory();

        renderRecentCampaigns();

    }

}

/* ==========================
 Statistics
========================== */

function refreshStats() {

    campaignCount.textContent = campaigns.length;

    let reach = 0;

    campaigns.forEach(c => {

        if (c.type === "users") {

            reach += Number(c.amount);

        }

    });

    totalReach.textContent = reach;

    creditBalance.textContent = credits;

    if (profileCreditsText) {

        profileCreditsText.textContent = `${credits} Credits`;

    }

}

/* ==========================
 Premium Button
========================== */

const upgradeButton = document.getElementById("upgradeButton");

if (upgradeButton) {

    upgradeButton.onclick = () => {

        showToast(
            "Premium is coming soon 🚀"
        );

    };

}

/* ==========================
 Logout
========================== */

if (logoutButton) {

    logoutButton.onclick = () => {

        if (
            confirm("Logout from PromoHub?")
        ) {

            currentUser = null;

            loginPage.classList.remove("hidden");

            app.classList.add("hidden");

            showToast("Logged out");

        }

    };

}

/* ==========================
 Login Button
========================== */

if (loginButton) {

    loginButton.onclick = () => {

        if (tg) {

            tg.expand();

            tg.ready();

            location.reload();

            return;

        }

        showToast(
            "Please open PromoHub from Telegram.",
            "error"
        );

    };

}

/* ==========================
 Auto Refresh
========================== */

setInterval(() => {

    updateCampaignStatuses();

}, 30000);

/* ==========================
 Campaign Cost
========================== */

updateCampaignCost();

updatePromotionBoxes();
/*
==========================================
 PromoHub v2
Part 6/7
==========================================
*/

/* ==========================
 Startup
========================== */

async function initializeApp() {

    try {

        await hideLoader();

        currentUser = getTelegramUser();

        if (!currentUser) {

            loginPage.classList.remove("hidden");

            app.classList.add("hidden");

            return;

        }

        loadProfile();

        resetDailyCredits();

        loadCampaigns();

        refreshStats();

        updateDashboard();

        showPage("dashboardPage");

        showToast(
            `Welcome ${currentUser.firstName || "User"}!`
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Failed to initialize app.",
            "error"
        );

    }

}

/* ==========================
 Window Events
========================== */

window.addEventListener("load", () => {

    initializeApp();

});

window.addEventListener("focus", () => {

    updateCampaignStatuses();

    refreshStats();

});

/* ==========================
 Telegram Theme
========================== */

if (tg) {

    document.body.style.background =
        tg.themeParams.bg_color || "#0b1220";

    tg.onEvent("themeChanged", () => {

        document.body.style.background =
            tg.themeParams.bg_color || "#0b1220";

    });

}

/* ==========================
 Offline Detection
========================== */

window.addEventListener("offline", () => {

    showToast(
        "You're offline.",
        "error"
    );

});

window.addEventListener("online", () => {

    showToast(
        "Connection restored."
    );

});

/* ==========================
 Keyboard Enter
========================== */

if (promotionLink) {

    promotionLink.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            createCampaignButton.click();

        }

    });

}

/* ==========================
 Auto Save
========================== */

setInterval(() => {

    saveCampaigns();

}, 10000);

/* ==========================
 Safety
========================== */

window.addEventListener("beforeunload", () => {

    saveCampaigns();

});
/*
==========================================
 PromoHub v2
 Part 7/7
==========================================
*/

/* ==========================
 Error Handler
========================== */

window.addEventListener("error", (event) => {

    console.error("App Error:", event.error);

    showToast(
        "Something went wrong.",
        "error"
    );

});

/* ==========================
 Promise Error Handler
========================== */

window.addEventListener("unhandledrejection", (event) => {

    console.error(event.reason);

});

/* ==========================
 Campaign Sync
========================== */

function syncDashboard() {

    refreshStats();

    renderRecentCampaigns();

    renderCampaignHistory();

}

/* ==========================
 Demo Status Animation
========================== */

setInterval(() => {

    let changed = false;

    campaigns.forEach(campaign => {

        if (campaign.status === "Running") {

            if (Math.random() > 0.8) {

                campaign.status = "Completed";

                changed = true;

            }

        }

    });

    if (changed) {

        saveCampaigns();

        syncDashboard();

    }

}, 60000);

/* ==========================
 Navigation Shortcuts
========================== */

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        if (!successModal.classList.contains("hidden")) {

            successModal.classList.add("hidden");

        }

    }

});

/* ==========================
 Credits Animation
========================== */

function animateCredits(newCredits) {

    let current = Number(creditBalance.textContent);

    const timer = setInterval(() => {

        if (current === newCredits) {

            clearInterval(timer);

            return;

        }

        current += current < newCredits ? 1 : -1;

        creditBalance.textContent = current;

    }, 15);

}

/* ==========================
 Refresh Dashboard
========================== */

function fullRefresh() {

    loadCampaigns();

    refreshStats();

    renderRecentCampaigns();

    renderCampaignHistory();

}

/* ==========================
 Start App
========================== */

(async () => {

    try {

        await initializeApp();

        fullRefresh();

        console.log("PromoHub v2 Loaded Successfully");

    }

    catch (error) {

        console.error(error);

        showToast(
            "Initialization failed.",
            "error"
        );

    }

})();
