const cardContainer = document.getElementById('card-container');
const portfolioContainer = document.getElementById("portfolio-container");
const button = document.getElementById("button");
const buttonHome = document.getElementById("button-home");

function goPortfolio() {
    cardContainer.classList.add("hide");    
    portfolioContainer.classList.remove("hide");    
};

button.addEventListener("click", goPortfolio);

function goHome() {
    cardContainer.classList.remove("hide");    
    portfolioContainer.classList.add("hide");    
};

buttonHome.addEventListener("click", goHome);

// Language Selector

const flagElements = document.getElementById("flags");

const textsToChange = document.querySelectorAll("[data-section]");

const changeLanguage = async language => {
    const requestJson = await fetch(`./languages/${language}.json`);
    const texts = await requestJson.json();

    for (const textToChange of textsToChange) {
        const section = textToChange.dataset.section;
        const value = textToChange.dataset.value;

        textToChange.innerHTML = texts[section][value];
    }
};

flagElements.addEventListener("click", (e) => {
    changeLanguage(e.target.parentElement.dataset.language);
});