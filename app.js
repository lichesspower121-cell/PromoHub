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

const API_BASE_URL =
"https://promohub-backend-fkvo.onrender.com";


/* ==========================================
   TELEGRAM
========================================== */

const tg =
window.Telegram?.WebApp || null;


if (tg) {

    tg.ready();

    tg.expand();

}


/* ==========================================
   HELPERS
========================================== */

const $ = id =>
document.getElementById(id);


const $$ = selector =>
document.querySelectorAll(selector);


const sleep = ms =>
new Promise(resolve => setTimeout(resolve, ms));



/* ==========================================
   STORAGE
========================================== */


let user =
JSON.parse(
localStorage.getItem("promohub_user")
)
||
null;


let campaigns =
JSON.parse(
localStorage.getItem("promohub_campaigns")
)
||
[];


let credits =
Number(
localStorage.getItem("promohub_credits")
)
||
100;



function saveData(){

    localStorage.setItem(
        "promohub_campaigns",
        JSON.stringify(campaigns)
    );


    localStorage.setItem(
        "promohub_credits",
        credits
    );

}



/* ==========================================
   ELEMENTS
========================================== */


const loader =
$("loader");


const loginPage =
$("loginPage");


const app =
$("app");


const loginButton =
$("loginButton");



/* ==========================================
   LOADER
========================================== */


function hideLoader(){

    if(loader){

        loader.classList.add(
            "hidden"
        );

    }

}



function showActionLoader(text="Processing..."){

    const box =
    $("actionLoader");


    const label =
    $("actionLoaderText");


    if(label)
    label.innerText = text;


    if(box)
    box.classList.remove(
        "hidden"
    );

}



function hideActionLoader(){

    const box =
    $("actionLoader");


    if(box)
    box.classList.add(
        "hidden"
    );

}



/* ==========================================
   PAGE SYSTEM
========================================== */


function showPage(pageId){


    $$(".page")
    .forEach(page=>{

        page.classList.add(
            "hidden"
        );

    });



    const page =
    $(pageId);


    if(page){

        page.classList.remove(
            "hidden"
        );

    }



    $$(".nav-button")
    .forEach(btn=>{


        btn.classList.remove(
            "active"
        );


        if(btn.dataset.page === pageId){

            btn.classList.add(
                "active"
            );

        }


    });


}



/* ==========================================
   NAVIGATION BUTTONS
========================================== */


$$(".nav-button")
.forEach(button=>{


    button.onclick = ()=>{


        showPage(
            button.dataset.page
        );


    };


});



/* ==========================================
   TELEGRAM LOGIN
========================================== */


function loadTelegramUser(){


    if(tg && tg.initDataUnsafe?.user){


        const tgUser =
        tg.initDataUnsafe.user;



        user = {

            id:
            tgUser.id,

            first_name:
            tgUser.first_name
            ||
            "Telegram User",


            username:
            tgUser.username
            ||
            ""

        };


    }


    else {


        user = {

            id:
            Date.now(),


            first_name:
            "Guest",


            username:
            "guest"


        };


    }



    localStorage.setItem(
        "promohub_user",
        JSON.stringify(user)
    );

}



/* ==========================================
   UPDATE USER UI
========================================== */


function updateUserUI(){


    if(!user)
    return;



    if($("userName"))

    $("userName").innerText =
    user.first_name;



    if($("profileName"))

    $("profileName").innerText =
    user.first_name;



    if($("profileUsername"))

    $("profileUsername").innerText =
    user.username
    ?
    "@"+user.username
    :
    "@guest";



    if($("creditBalance"))

    $("creditBalance").innerText =
    credits;



    if($("profileCredits"))

    $("profileCredits").innerText =
    credits;



    if($("profileCreditsText"))

    $("profileCreditsText").innerText =
    credits+" Credits";


}



/* ==========================================
   LOGIN BUTTON
========================================== */


if(loginButton){


loginButton.onclick = async ()=>{


    showActionLoader(
        "Logging in..."
    );


    await sleep(500);



    loadTelegramUser();


    updateUserUI();



    loginPage.classList.add(
        "hidden"
    );


    app.classList.remove(
        "hidden"
    );



    refreshDashboard();



    hideActionLoader();



};


}



/* ==========================================
   START PROMOTION BUTTONS
========================================== */


const startPromotionButton =
$("startPromotionButton");


const quickPromoteButton =
$("quickPromoteButton");



if(startPromotionButton){

startPromotionButton.onclick = ()=>{

    showPage(
        "promotePage"
    );

};

}



if(quickPromoteButton){

quickPromoteButton.onclick = ()=>{

    showPage(
        "promotePage"
    );

};

}
/*
==========================================
 PromoHub v3
 Part 2/4
==========================================
*/


/* ==========================================
   DASHBOARD
========================================== */


function refreshDashboard(){


    const campaignCount =
    $("campaignCount");


    const totalReach =
    $("totalReach");


    const profileCampaigns =
    $("profileCampaigns");


    if(campaignCount){

        campaignCount.innerText =
        campaigns.length;

    }



    let reach = 0;


    campaigns.forEach(c=>{

        reach +=
        Number(c.amount || 0);

    });



    if(totalReach){

        totalReach.innerText =
        reach;

    }



    if(profileCampaigns){

        profileCampaigns.innerText =
        campaigns.length +
        " Campaigns";

    }



    if($("profileCredits")){

        $("profileCredits").innerText =
        credits;

    }



    if($("creditBalance")){

        $("creditBalance").innerText =
        credits;

    }



}



/* ==========================================
   CREATE CAMPAIGN
========================================== */


const createCampaignButton =
$("createCampaignButton");


const promotionLink =
$("promotionLink");


const promotionAmount =
$("promotionAmount");



if(createCampaignButton){


createCampaignButton.onclick =
async ()=>{


showActionLoader(
"Creating campaign..."
);



try{


let link =
promotionLink.value.trim();



if(!link){

throw new Error(
"Please enter a Telegram link."
);

}



if(!link.includes("t.me")){

throw new Error(
"Invalid Telegram link."
);

}




let selected =
document.querySelector(
".promotion-option.selected"
);



let type =
selected
?
selected.dataset.type
:
"users";




let amount =
type === "users"
?
Number(
promotionAmount.value
)
:
0;




if(credits < amount){

throw new Error(
"Not enough credits."
);

}




let campaign = {


id:
Date.now(),


link:
link,


type:
type,


amount:
amount,


status:
"Pending",


created:
new Date()
.toLocaleString(),


reached:
0


};





campaigns.unshift(
campaign
);



credits -= amount;



saveData();



refreshDashboard();


renderRecentCampaigns();


renderCampaignHistory();



promotionLink.value = "";



showSuccess();



showToast(
"Campaign created!"
);



showPage(
"campaignsPage"
);



}



catch(error){


console.error(error);



showToast(
error.message,
"error"
);



}



finally{


hideActionLoader();


}



};


}



/* ==========================================
   PROMOTION TYPE SWITCH
========================================== */


$$(".promotion-option")
.forEach(button=>{


button.onclick = ()=>{


$$(".promotion-option")
.forEach(btn=>{


btn.classList.remove(
"selected"
);


});



button.classList.add(
"selected"
);



if(button.dataset.type === "users"){


$("usersTargetBox")
?.classList.remove(
"hidden"
);



$("groupTargetBox")
?.classList.add(
"hidden"
);



}



else {



$("usersTargetBox")
?.classList.add(
"hidden"
);



$("groupTargetBox")
?.classList.remove(
"hidden"
);



}



};


});



/* ==========================================
   COST UPDATE
========================================== */


if(promotionAmount){


promotionAmount.onchange = ()=>{


let cost =
Number(
promotionAmount.value
);



if($("campaignCost")){


$("campaignCost")
.innerText =
cost;


}



};



}



/* ==========================================
   RECENT CAMPAIGNS
========================================== */


function renderRecentCampaigns(){


const box =
$("recentCampaigns");


if(!box)
return;



if(campaigns.length === 0){


box.innerHTML = `

<div class="empty-card">

🚀

<p>
No campaigns yet.
</p>

</div>

`;

return;


}




box.innerHTML =
campaigns
.slice(0,3)
.map(c=>{


return `

<div class="campaign-card">


<div>

<strong>
${c.type.toUpperCase()}
</strong>


<p>
${c.link}
</p>


</div>


<span>

${c.status}

</span>


</div>

`;

})
.join("");



}



/* ==========================================
   CAMPAIGN HISTORY
========================================== */


function renderCampaignHistory(){


const box =
$("campaignList");


if(!box)
return;



if(campaigns.length === 0){


box.innerHTML = `

<div class="empty-card">

📊

<p>
No campaigns yet.
</p>

</div>

`;

return;

}




box.innerHTML =
campaigns.map(c=>{


return `

<div class="campaign-card">


<h3>
${c.type === "users"
?
"👥 Users Promotion"
:
"📢 Group Promotion"
}
</h3>



<p>
🔗 ${c.link}
</p>


<p>
🎯 Target:
${c.amount}
</p>



<small>
${c.created}
</small>


<span>
${c.status}
</span>


</div>


`;

})
.join("");



}
/*
==========================================
 PromoHub v3
 Part 3/4
==========================================
*/


/* ==========================================
   PREMIUM
========================================== */


const upgradeButton =
$("upgradeButton");


if(upgradeButton){


upgradeButton.onclick = ()=>{


showToast(
"Premium upgrade coming soon!"
);


};



}



/* ==========================================
   PROFILE
========================================== */


function loadProfile(){


if(!user)
return;



if($("profileName")){


$("profileName").innerText =
user.first_name;


}



if($("profileUsername")){


$("profileUsername").innerText =
user.username
?
"@" + user.username
:
"@guest";


}



if($("profileCreditsText")){


$("profileCreditsText").innerText =
credits + " Credits";


}



if($("profileCampaigns")){


$("profileCampaigns").innerText =
campaigns.length +
" Campaigns";


}



}



/* ==========================================
   LOGOUT
========================================== */


const logoutButton =
$("logoutButton");



if(logoutButton){


logoutButton.onclick = ()=>{


localStorage.removeItem(
"promohub_user"
);



localStorage.removeItem(
"promohub_campaigns"
);



localStorage.removeItem(
"promohub_credits"
);



user = null;


campaigns = [];


credits = 100;



app.classList.add(
"hidden"
);



loginPage.classList.remove(
"hidden"
);



showToast(
"Logged out"
);



};



}



/* ==========================================
   VIEW ALL CAMPAIGNS
========================================== */


const viewCampaignsButton =
$("viewCampaignsButton");



if(viewCampaignsButton){


viewCampaignsButton.onclick = ()=>{


renderCampaignHistory();


showPage(
"campaignsPage"
);



};


}



/* ==========================================
   HISTORY SHORTCUT
========================================== */


const historyShortcut =
$("historyShortcut");



if(historyShortcut){


historyShortcut.onclick = ()=>{


renderCampaignHistory();


showPage(
"campaignsPage"
);



};



}



/* ==========================================
   CLOSE SUCCESS MODAL
========================================== */


const closeModal =
$("closeModal");



if(closeModal){


closeModal.onclick = ()=>{


$("successModal")
.classList.add(
"hidden"
);



};



}



/* ==========================================
   CAMPAIGN API PLACEHOLDER
========================================== */


async function sendCampaignToServer(campaign){


try{


const response =
await fetch(
API_BASE_URL + "/campaign",
{


method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:
JSON.stringify(
campaign
)


}

);



return await response.json();



}


catch(error){


console.error(
"API Error:",
error
);


return null;


}



}



/* ==========================================
   CREDIT SYSTEM
========================================== */


function addCredits(amount){


credits += Number(amount);


saveData();


updateUserUI();


refreshDashboard();



}



function removeCredits(amount){


credits -= Number(amount);


if(credits < 0){

credits = 0;

}



saveData();


updateUserUI();


refreshDashboard();



}



/* ==========================================
   CAMPAIGN STATUS
========================================== */


function updateCampaignStatus(
id,
status
){



let campaign =
campaigns.find(
c=>c.id === id
);



if(campaign){


campaign.status =
status;



saveData();



renderRecentCampaigns();


renderCampaignHistory();



}



}



/* ==========================================
   INITIAL PAGE LOAD DATA
========================================== */


function loadAppData(){



if(user){


updateUserUI();


loadProfile();


refreshDashboard();


renderRecentCampaigns();


renderCampaignHistory();


}



}
/*
==========================================
 PromoHub v3
 Part 4/4
==========================================
*/


/* ==========================================
   TOAST SYSTEM
========================================== */


function showToast(
message,
type="success"
){


const container =
$("toastContainer");



if(!container)
return;



const toast =
document.createElement(
"div"
);



toast.className =
"toast " + type;



toast.innerText =
message;



container.appendChild(
toast
);



setTimeout(()=>{


toast.classList.add(
"show"
);



},50);



setTimeout(()=>{


toast.classList.remove(
"show"
);



setTimeout(()=>{


toast.remove();



},300);



},3000);



}



/* ==========================================
   SUCCESS MODAL
========================================== */


function showSuccess(){


const modal =
$("successModal");



if(modal){


modal.classList.remove(
"hidden"
);



}



}



/* ==========================================
   LOGIN CHECK
========================================== */


function checkLogin(){



if(user){



loginPage.classList.add(
"hidden"
);



app.classList.remove(
"hidden"
);



updateUserUI();


loadProfile();


refreshDashboard();


renderRecentCampaigns();


renderCampaignHistory();



}


else {



loginPage.classList.remove(
"hidden"
);



app.classList.add(
"hidden"
);



}



}



/* ==========================================
   LOADING SCREEN
========================================== */


async function startApp(){



await sleep(
1500
);



hideLoader();



checkLogin();



}



/* ==========================================
   TELEGRAM CLOSE HANDLER
========================================== */


if(tg){


tg.onEvent(
"viewportChanged",
()=>{


tg.expand();



}

);



}



/* ==========================================
   UPDATE CAMPAIGN COST
========================================== */


const campaignAmount =
$("promotionAmount");



if(campaignAmount){



campaignAmount.addEventListener(
"change",
()=>{


if($("campaignCost")){


$("campaignCost")
.innerText =
campaignAmount.value;


}



}

);



}



/* ==========================================
   AUTO VALIDATE LINK
========================================== */


if(promotionLink){



promotionLink.addEventListener(
"input",
()=>{


const message =
$("formMessage");



if(!message)
return;



if(
promotionLink.value &&
!promotionLink.value.includes("t.me")
){


message.innerText =
"⚠️ Enter a valid Telegram link";


message.style.color =
"red";



}



else {



message.innerText =
"";


}



}

);



}



/* ==========================================
   SAVE BEFORE CLOSE
========================================== */


window.addEventListener(
"beforeunload",
()=>{


saveData();



});



/* ==========================================
   START APPLICATION
========================================== */


startApp();
