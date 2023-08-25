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