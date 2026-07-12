// =========================
// TELEGRAM MINI APP
// =========================

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


// =========================
// ELEMENTS
// =========================

const loader = document.getElementById("loader");
const loadingText = document.getElementById("loadingText");

const loginPage = document.getElementById("loginPage");
const app = document.getElementById("app");

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

const actionLoader = document.getElementById("actionLoader");
const actionLoaderText = document.getElementById("actionLoaderText");

const userName = document.getElementById("userName");
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");

const profileButton = document.getElementById("profileButton");

const startPromotionButton = document.getElementById(
    "startPromotionButton"
);

const quickPromoteButton = document.getElementById(
    "quickPromoteButton"
);

const viewCampaignsButton = document.getElementById(
    "viewCampaignsButton"
);

const createCampaignButton = document.getElementById(
    "createCampaignButton"
);

const promotionLink = document.getElementById("promotionLink");
const promotionAmount = document.getElementById("promotionAmount");


// =========================
// APP DATA
// =========================

let currentUser = null;
let promotionType = "reach";

let campaigns = [];


// =========================
// LOADING SCREEN
// =========================

function wait(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}


async function startApp() {

    loadingText.textContent =
        "Connecting to Telegram...";

    await wait(900);


    loadingText.textContent =
        "Loading account...";

    await wait(800);


    loadTelegramUser();

    loadCampaigns();


    loadingText.textContent =
        "Ready";

    await wait(500);


    loader.classList.add("hide-loader");

    await wait(500);


    loader.classList.add("hidden");


    checkLogin();

}


startApp();


// =========================
// TELEGRAM USER
// =========================

function loadTelegramUser() {

    try {

        if (
            tg &&
            tg.initDataUnsafe &&
            tg.initDataUnsafe.user
        ) {

            const telegramUser =
                tg.initDataUnsafe.user;


            currentUser = {

                id: telegramUser.id,

                firstName:
                    telegramUser.first_name ||
                    "Telegram User",

                lastName:
                    telegramUser.last_name ||
                    "",

                username:
                    telegramUser.username ||
                    ""

            };


            localStorage.setItem(
                "promoUser",
                JSON.stringify(currentUser)
            );

        }

    }

    catch (error) {

        console.log(
            "Telegram user error:",
            error
        );

    }

}


// =========================
// CHECK LOGIN
// =========================

function checkLogin() {

    const savedUser =
        localStorage.getItem("promoUser");


    if (savedUser) {

        try {

            currentUser =
                JSON.parse(savedUser);


            openApp();

        }

        catch (error) {

            localStorage.removeItem(
                "promoUser"
            );


            showLogin();

        }

    }

    else {

        showLogin();

    }

}


// =========================
// SHOW LOGIN
// =========================

function showLogin() {

    app.classList.add("hidden");

    loginPage.classList.remove("hidden");

}


// =========================
// OPEN APP
// =========================

function openApp() {

    loginPage.classList.add("hidden");

    app.classList.remove("hidden");


    updateUserUI();

    updateCampaignUI();

    openPage("dashboardPage");

}


// =========================
// LOGIN
// =========================

loginButton.addEventListener(
    "click",
    async function () {

        showActionLoader(
            "Connecting your account..."
        );


        await wait(1000);


        loadTelegramUser();


        if (!currentUser) {

            hideActionLoader();


            alert(
                "Please open PromoHub inside Telegram."
            );


            return;

        }


        localStorage.setItem(
            "promoUser",
            JSON.stringify(currentUser)
        );


        await wait(500);


        hideActionLoader();

        openApp();

    }
);


// =========================
// LOGOUT
// =========================

logoutButton.addEventListener(
    "click",
    async function () {

        showActionLoader(
            "Logging out..."
        );


        await wait(800);


        localStorage.removeItem(
            "promoUser"
        );


        currentUser = null;


        hideActionLoader();

        showLogin();

    }
);


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
            "@" + currentUser.username;

    }

    else {

        profileUsername.textContent =
            "Telegram ID: " +
            currentUser.id;

    }

}


// =========================
// PAGE NAVIGATION
// =========================

function openPage(pageId) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const selectedPage =
        document.getElementById(pageId);


    if (selectedPage) {

        selectedPage.classList.remove(
            "hidden"
        );

    }


    const navButtons =
        document.querySelectorAll(
            ".nav-button"
        );


    navButtons.forEach(button => {

        button.classList.remove("active");


        if (
            button.dataset.page === pageId
        ) {

            button.classList.add("active");

        }

    });


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                openPage(
                    this.dataset.page
                );

            }
        );

    });


// =========================
// QUICK NAVIGATION
// =========================

profileButton.addEventListener(
    "click",
    function () {

        openPage("profilePage");

    }
);


startPromotionButton.addEventListener(
    "click",
    function () {

        openPage("promotePage");

    }
);


quickPromoteButton.addEventListener(
    "click",
    function () {

        openPage("promotePage");

    }
);


viewCampaignsButton.addEventListener(
    "click",
    function () {

        openPage("campaignsPage");

    }
);


// =========================
// PROMOTION TYPE
// =========================

const promotionOptions =
    document.querySelectorAll(
        ".promotion-option"
    );


promotionOptions.forEach(option => {

    option.addEventListener(
        "click",
        function () {

            promotionOptions.forEach(
                item => {

                    item.classList.remove(
                        "selected"
                    );

                }
            );


            this.classList.add(
                "selected"
            );


            promotionType =
                this.dataset.type;

        }
    );

});


// =========================
// CREATE CAMPAIGN
// =========================

createCampaignButton.addEventListener(
    "click",
    async function () {

        const link =
            promotionLink.value.trim();


        const amount =
            parseInt(
                promotionAmount.value
            );


        if (!link) {

            alert(
                "Please enter your Telegram link."
            );

            return;

        }


        if (
            !link.startsWith(
                "https://t.me/"
            )
        ) {

            alert(
                "Please enter a valid Telegram link."
            );

            return;

        }


        showActionLoader(
            "Creating campaign..."
        );


        await wait(1200);


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


        promotionLink.value = "";


        hideActionLoader();


        updateCampaignUI();


        openPage(
            "campaignsPage"
        );

    }
);


// =========================
// SAVE CAMPAIGNS
// =========================

function saveCampaigns() {

    if (!currentUser) {
        return;
    }


    localStorage.setItem(

        "promoCampaigns_" +
        currentUser.id,

        JSON.stringify(campaigns)

    );

}


// =========================
// LOAD CAMPAIGNS
// =========================

function loadCampaigns() {

    const savedUser =
        localStorage.getItem(
            "promoUser"
        );


    if (!savedUser) {

        campaigns = [];

        return;

    }


    try {

        const user =
            JSON.parse(savedUser);


        const savedCampaigns =
            localStorage.getItem(

                "promoCampaigns_" +
                user.id

            );


        if (savedCampaigns) {

            campaigns =
                JSON.parse(
                    savedCampaigns
                );

        }

        else {

            campaigns = [];

        }

    }

    catch (error) {

        campaigns = [];

    }

}


// =========================
// CAMPAIGN UI
// =========================

function updateCampaignUI() {

    loadCampaigns();


    const campaignCount =
        document.getElementById(
            "campaignCount"
        );


    const totalReach =
        document.getElementById(
            "totalReach"
        );


    const campaignList =
        document.getElementById(
            "campaignList"
        );


    const recentCampaigns =
        document.getElementById(
            "recentCampaigns"
        );


    campaignCount.textContent =
        campaigns.length;


    const reach =
        campaigns.reduce(

            (total, campaign) => {

                return total +
                    Number(
                        campaign.delivered || 0
                    );

            },

            0

        );


    totalReach.textContent =
        reach;


    if (campaigns.length === 0) {

        campaignList.innerHTML = `

            <div class="empty-icon">
                📊
            </div>

            <strong>
                No campaigns
            </strong>

            <span>
                Your campaigns will appear here
            </span>

        `;


        recentCampaigns.innerHTML = `

            <div class="empty-icon">
                📭
            </div>

            <strong>
                No campaigns yet
            </strong>

            <span>
                Start your first promotion campaign
            </span>

        `;


        return;

    }


    campaignList.innerHTML = "";


    campaigns.forEach(campaign => {

        const card =
            createCampaignCard(
                campaign
            );


        campaignList.appendChild(
            card
        );

    });


    recentCampaigns.innerHTML = "";


    campaigns
        .slice(0, 2)
        .forEach(campaign => {

            const card =
                createCampaignCard(
                    campaign
                );


            recentCampaigns.appendChild(
                card
            );

        });

}


// =========================
// CREATE CAMPAIGN CARD
// =========================

function createCampaignCard(campaign) {

    const card =
        document.createElement("div");


    card.className =
        "campaign-card";


    const progress = Math.min(

        100,

        Math.round(

            (
                Number(
                    campaign.delivered
                )
                /

                Number(
                    campaign.amount
                )

            ) * 100

        )

    );


    card.innerHTML = `

        <div class="campaign-top">

            <div>

                <strong>
                    ${
                        campaign.type === "joins"
                        ? "👥 Verified Joins"
                        : "📢 Link Reach"
                    }
                </strong>

                <span>
                    ${campaign.link}
                </span>

            </div>


            <b>
                ${campaign.status}
            </b>

        </div>


        <div class="campaign-progress">

            <div class="progress-info">

                <span>
                    Progress
                </span>

                <strong>
                    ${campaign.delivered}
                    /
                    ${campaign.amount}
                </strong>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width: ${progress}%"
                ></div>

            </div>

        </div>

    `;


    return card;

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