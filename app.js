
"use strict";


// =========================
// TELEGRAM
// =========================

const tg =
    window.Telegram &&
    window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;


if (tg) {

    tg.ready();

    tg.expand();

}


// =========================
// ELEMENT HELPER
// =========================

function getElement(id) {

    return document.getElementById(id);

}


const loader =
    getElement("loader");

const loadingText =
    getElement("loadingText");

const loginPage =
    getElement("loginPage");

const app =
    getElement("app");

const loginButton =
    getElement("loginButton");

const logoutButton =
    getElement("logoutButton");

const actionLoader =
    getElement("actionLoader");

const actionLoaderText =
    getElement("actionLoaderText");

const userName =
    getElement("userName");

const profileName =
    getElement("profileName");

const profileUsername =
    getElement("profileUsername");

const profileButton =
    getElement("profileButton");

const startPromotionButton =
    getElement("startPromotionButton");

const quickPromoteButton =
    getElement("quickPromoteButton");

const viewCampaignsButton =
    getElement("viewCampaignsButton");

const createCampaignButton =
    getElement("createCampaignButton");

const promotionLink =
    getElement("promotionLink");

const promotionAmount =
    getElement("promotionAmount");

const campaignCount =
    getElement("campaignCount");

const totalReach =
    getElement("totalReach");

const campaignList =
    getElement("campaignList");

const recentCampaigns =
    getElement("recentCampaigns");

const creditBalance =
    getElement("creditBalance");

const profileCredits =
    getElement("profileCredits");


// =========================
// DATA
// =========================

let currentUser = null;

let campaigns = [];

let promotionType = "reach";

let credits = 100;


// =========================
// WAIT
// =========================

function wait(ms) {

    return new Promise(function(resolve) {

        setTimeout(resolve, ms);

    });

}


// =========================
// SAFE TELEGRAM USER
// =========================

function getTelegramUser() {

    try {

        if (
            tg &&
            tg.initDataUnsafe &&
            tg.initDataUnsafe.user
        ) {

            const user =
                tg.initDataUnsafe.user;


            return {

                id: String(user.id),

                firstName:
                    user.first_name ||
                    "Telegram User",

                lastName:
                    user.last_name ||
                    "",

                username:
                    user.username ||
                    ""

            };

        }

    }

    catch (error) {

        console.error(
            "Telegram user error:",
            error
        );

    }


    return null;

}


// =========================
// STORAGE KEYS
// =========================

function campaignKey() {

    return (
        "promohub_campaigns_" +
        currentUser.id
    );

}


function creditKey() {

    return (
        "promohub_credits_" +
        currentUser.id
    );

}


// =========================
// START APP
// =========================

async function startApp() {

    loadingText.textContent =
        "Connecting to Telegram...";


    await wait(700);


    loadingText.textContent =
        "Loading PromoHub...";


    await wait(700);


    currentUser =
        getTelegramUser();


    loadingText.textContent =
        "Ready";


    await wait(400);


    loader.classList.add(
        "hide-loader"
    );


    await wait(500);


    loader.classList.add(
        "hidden"
    );


    if (currentUser) {

        saveSession();

        openApp();

    }

    else {

        showLogin();

    }

}


// =========================
// SESSION
// =========================

function saveSession() {

    if (!currentUser) {

        return;

    }


    localStorage.setItem(

        "promohub_user",

        JSON.stringify(currentUser)

    );

}


function showLogin() {

    app.classList.add("hidden");

    loginPage.classList.remove(
        "hidden"
    );

}


function openApp() {

    if (!currentUser) {

        showLogin();

        return;

    }


    loginPage.classList.add(
        "hidden"
    );


    app.classList.remove(
        "hidden"
    );


    loadUserData();

    updateUserUI();

    updateCampaignUI();

    openPage("dashboardPage");

}


// =========================
// LOGIN
// =========================

loginButton.addEventListener(
    "click",
    async function() {

        showActionLoader(
            "Connecting Telegram..."
        );


        await wait(700);


        currentUser =
            getTelegramUser();


        if (!currentUser) {

            hideActionLoader();


            alert(
                "Open this website from your Telegram Mini App."
            );


            return;

        }


        saveSession();


        hideActionLoader();


        openApp();

    }
);


// =========================
// LOGOUT
// =========================

logoutButton.addEventListener(
    "click",
    async function() {

        showActionLoader(
            "Logging out..."
        );


        await wait(600);


        localStorage.removeItem(
            "promohub_user"
        );


        currentUser = null;


        hideActionLoader();


        showLogin();

    }
);


// =========================
// USER DATA
// =========================

function loadUserData() {

    if (!currentUser) {

        return;

    }


    const savedCampaigns =
        localStorage.getItem(
            campaignKey()
        );


    if (savedCampaigns) {

        try {

            campaigns =
                JSON.parse(
                    savedCampaigns
                );

        }

        catch (error) {

            campaigns = [];

        }

    }

    else {

        campaigns = [];

    }


    const savedCredits =
        localStorage.getItem(
            creditKey()
        );


    if (savedCredits !== null) {

        credits =
            Number(savedCredits);

    }

    else {

        credits = 100;

        saveCredits();

    }

}


// =========================
// SAVE DATA
// =========================

function saveCampaigns() {

    localStorage.setItem(

        campaignKey(),

        JSON.stringify(campaigns)

    );

}


function saveCredits() {

    localStorage.setItem(

        creditKey(),

        String(credits)

    );

}


// =========================
// USER UI
// =========================

function updateUserUI() {

    if (!currentUser) {

        return;

    }


    const fullName = (

        currentUser.firstName +
        " " +
        currentUser.lastName

    ).trim();


    userName.textContent =
        fullName;


    profileName.textContent =
        fullName;


    if (currentUser.username) {

        profileUsername.textContent =
            "@" +
            currentUser.username;

    }

    else {

        profileUsername.textContent =
            "Telegram ID: " +
            currentUser.id;

    }


    creditBalance.textContent =
        credits;


    profileCredits.textContent =
        credits +
        " credits";

}


// =========================
// NAVIGATION
// =========================

function openPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(function(page) {

            page.classList.add(
                "hidden"
            );

        });


    const selectedPage =
        getElement(pageId);


    if (selectedPage) {

        selectedPage.classList.remove(
            "hidden"
        );

    }


    document
        .querySelectorAll(".nav-button")
        .forEach(function(button) {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.page ===
                pageId
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    window.scrollTo(0, 0);

}


document
    .querySelectorAll(".nav-button")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                openPage(
                    button.dataset.page
                );

            }
        );

    });


// =========================
// QUICK BUTTONS
// =========================

profileButton.addEventListener(
    "click",
    function() {

        openPage("profilePage");

    }
);


startPromotionButton.addEventListener(
    "click",
    function() {

        openPage("promotePage");

    }
);


quickPromoteButton.addEventListener(
    "click",
    function() {

        openPage("promotePage");

    }
);


viewCampaignsButton.addEventListener(
    "click",
    function() {

        openPage("campaignsPage");

    }
);


// =========================
// PROMOTION TYPE
// =========================

document
    .querySelectorAll(".promotion-option")
    .forEach(function(option) {

        option.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(
                        ".promotion-option"
                    )
                    .forEach(
                        function(item) {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                option.classList.add(
                    "selected"
                );


                promotionType =
                    option.dataset.type;

            }
        );

    });


// =========================
// VALIDATE LINK
// =========================

function isTelegramLink(link) {

    try {

        const url =
            new URL(link);


        return (
            url.protocol === "https:" &&
            (
                url.hostname === "t.me" ||
                url.hostname === "telegram.me"
            )
        );

    }

    catch (error) {

        return false;

    }

}


// =========================
// CREATE CAMPAIGN
// =========================

createCampaignButton.addEventListener(
    "click",
    async function() {

        const link =
            promotionLink.value.trim();


        const amount =
            Number(
                promotionAmount.value
            );


        if (!isTelegramLink(link)) {

            alert(
                "Enter a valid Telegram link."
            );

            return;

        }


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Select a valid target amount."
            );

            return;

        }


        if (credits < amount) {

            alert(
                "You do not have enough promotion credits."
            );

            return;

        }


        showActionLoader(
            "Creating campaign..."
        );


        await wait(900);


        credits -= amount;


        const campaign = {

            id:
                Date.now(),

            link:
                link,

            type:
                promotionType,

            amount:
                amount,

            delivered:
                0,

            status:
                "Active",

            created:
                new Date().toISOString()

        };


        campaigns.unshift(
            campaign
        );


        saveCampaigns();

        saveCredits();


        promotionLink.value = "";


        updateUserUI();

        updateCampaignUI();


        hideActionLoader();


        openPage(
            "campaignsPage"
        );

    }
);


// =========================
// CAMPAIGN UI
// =========================

function updateCampaignUI() {

    campaignCount.textContent =
        campaigns.length;


    const reach =
        campaigns.reduce(
            function(total, campaign) {

                return (
                    total +
                    Number(
                        campaign.delivered || 0
                    )
                );

            },
            0
        );


    totalReach.textContent =
        reach;


    campaignList.innerHTML = "";

    recentCampaigns.innerHTML = "";


    campaigns.forEach(
        function(campaign) {

            campaignList.appendChild(
                createCampaignCard(
                    campaign
                )
            );

        }
    );


    campaigns
        .slice(0, 2)
        .forEach(
            function(campaign) {

                recentCampaigns.appendChild(
                    createCampaignCard(
                        campaign
                    )
                );

            }
        );

}


// =========================
// CAMPAIGN CARD
// =========================

function createCampaignCard(
    campaign
) {

    const card =
        document.createElement("div");


    card.className =
        "campaign-card";


    const amount =
        Number(campaign.amount) || 1;


    const delivered =
        Number(campaign.delivered) || 0;


    const progress =
        Math.min(
            100,
            Math.round(
                (
                    delivered /
                    amount
                ) * 100
            )
        );


    const title =
        campaign.type === "joins"
            ? "👥 Group Promotion"
            : "📢 Link Reach";


    card.innerHTML =

        '<div class="campaign-top">' +

            "<div>" +

                "<strong>" +
                    title +
                "</strong>" +

                "<span>" +
                    escapeHTML(
                        campaign.link
                    ) +
                "</span>" +

            "</div>" +

            "<b>" +
                escapeHTML(
                    campaign.status
                ) +
            "</b>" +

        "</div>" +

        '<div class="campaign-progress">' +

            '<div class="progress-info">' +

                "<span>Progress</span>" +

                "<strong>" +
                    delivered +
                    " / " +
                    amount +
                "</strong>" +

            "</div>" +

            '<div class="progress-bar">' +

                '<div class="progress-fill" ' +

                    'style="width:' +
                    progress +
                    '%">' +

                "</div>" +

            "</div>" +

        "</div>";


    return card;

}


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {

    const element =
        document.createElement("div");


    element.textContent =
        String(value);


    return element.innerHTML;

}


// =========================
// ACTION LOADER
// =========================

function showActionLoader(text) {

    actionLoaderText.textContent =
        text || "Processing...";


    actionLoader.classList.remove(
        "hidden"
    );

}


function hideActionLoader() {

    actionLoader.classList.add(
        "hidden"
    );

}


// =========================
// START
// =========================

startApp();

