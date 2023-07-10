//IMPORTS
import axios from "axios";
import "../assets/CSS/style.scss";

//js IMPORTS
import {
  loadingCity,
  clearSearchField,
  highlight,
  displayErrorAllert,
  enterCity,
} from "./utilities";
import {
  getAllUrbanAreas,
  getLifeDetails,
  getCategoriesScore,
  showPexelCityImage,
  getLanguage,
  getClimateZone,
  getWeatherInfos,
} from "./api.js";

//images assets IMPORTS
import logoHero from "../assets/images/logo/light-LOGO.png";
import bgHero from "../assets/images/find_your_place-bg.jpg";

//VARIABLES
const heroBg = document.querySelector(".search_hero");
const searchInput = document.querySelector("#query");
const formField = document.querySelector("#form");
const escIcon = document.querySelector(".esc-icon");
const searchResults = document.querySelector("#result");
const cityPhotoDiv = document.querySelector(".city-photo");
const countryContinent = document.querySelector(".country-continent");
const cityScore = document.querySelector(".city-score");
const cityDescription = document.querySelector(".descr");
const population = document.querySelector(".pop-data");

//////////////////////////////////////////
//HERO SECTION
//////////////////////////////////////////
//LOGO
document.querySelector(".logo").src = logoHero;

//HERO BG
heroBg.style.backgroundImage = `url('${bgHero}')`;
heroBg.classList.add("set-background");

//GET all cities from Teleport API
let searchTerms = [];
getAllUrbanAreas(searchTerms);

//SEARCH
//If typing show results for autocomplete
function autocomplete() {
  let result = [];
  let input = searchInput.value;

  if (input.length) {
    searchResults.classList.add("results-dropdown");
    result = searchTerms.filter((term) =>
      term.toLowerCase().startsWith(input.toLowerCase())
    );
  } else {
    result = searchTerms;
  }

  const content = result.map((list) => `<li class='selectCity'>${list}</li>`);
  searchResults.innerHTML = `<ul>${content.join("")}</ul>`;

  //Navigate with keyboard arrows
  highlight(document.querySelectorAll("li"));
}

//Search enetering a city selected navigating with arrows
document.addEventListener("keydown", function (e) {
  if (e.code == "Enter") {
    e.preventDefault();

    try {
      //Selected city name
      let listItems = Array.from(document.querySelectorAll("li"));
      let list = listItems.map((obj) => obj.className);
      const indexSelectedLi = list.findIndex((li) => li.includes(`highlight`));
      const selectCityName = listItems[indexSelectedLi].innerHTML;
      getTeleportData(selectCityName);
    } catch (err) {
      displayErrorAllert(err);
    }
  }
});

formField.addEventListener("input", (e) => {
  escIcon.style.display = "block";
  autocomplete();
});

//Click to autocomplete your research
searchResults.addEventListener("click", function (e) {
  let selectedCity = e.target.innerHTML;
  searchInput.value = selectedCity;
  getTeleportData(selectedCity);
});

//////////////////////////////////////////
//CITY'S INFOS
//////////////////////////////////////////
let selectedCityDetails = null;
let cityInfo = {};
function getTeleportData(city) {
  clearSearchField();
  axios
    .get(`https://api.teleport.org/api/cities/?search=${city}`)
    .then((res) => {
      loadingCity();
      let cityUrl =
        res.data._embedded["city:search-results"][0]["_links"]["city:item"]
          .href;

      let geonameId = cityUrl.slice(cityUrl.indexOf("geonameid"), -1);

      return axios.get(`https://api.teleport.org/api/cities/${geonameId}/`);
    })
    .then((res) => {
      selectedCityDetails = res.data;

      //Selected city data
      cityInfo = {
        city: selectedCityDetails.name,
        country: selectedCityDetails._links["city:country"].name,
        population: selectedCityDetails.population,
        timezone: selectedCityDetails._links["city:timezone"],
        latitude: selectedCityDetails.location.latlon.latitude,
        longitude: selectedCityDetails.location.latlon.longitude,
      };

      //City slug
      let cityUrl = selectedCityDetails._links["city:urban_area"].href;
      cityInfo.citySlug = cityUrl.slice(cityUrl.indexOf("slug:"), -1);

      //Use the citySlug to get urban area details and scores
      return axios.get(
        `https://api.teleport.org/api/urban_areas/${cityInfo.citySlug}/`
      );
    })
    .then((res) => {
      const details = res.data;
      cityInfo.continent = details.continent;

      // Use the /urban_areas/{cityInfo.citySlug}/details/ endpoint to get the summary
      return axios.get(
        `https://api.teleport.org/api/urban_areas/${cityInfo.citySlug}/scores`
      );
    })
    .then((res) => {
      const details = res.data;
      //city description
      cityInfo.description = details.summary
        ? details.summary
        : "No description available";

      //city score
      cityInfo.score = details.teleport_city_score
        ? details.teleport_city_score.toFixed(1)
        : "No score available";

      //Extract scores for categories
      const scores = res.data.categories.map((category) => {
        return {
          name: category.name,
          score_out_of_10: category.score_out_of_10.toFixed(1),
        };
      });

      cityInfo.scores = scores;

      //DISPLAY general infs
      createInfosSection(cityInfo);
      //DISPLAY details
      createDetailsSection(cityInfo);
    })
    .catch((err) => displayErrorAllert(err));
}

//STEP: CREATE the city information section
async function createInfosSection(city) {
  // ADD city's image as bg
  showPexelCityImage(city.city, city.country);
  // ADD city's name
  cityPhotoDiv.insertAdjacentHTML("afterbegin", `<h2>${city.city}</h2>`);
  // ADD country's and continent's name
  countryContinent.insertAdjacentHTML(
    "beforeend",
    `<span>${city.country}, ${city.continent}</span>`
  );
  // ADD city's score
  cityScore.insertAdjacentHTML("beforeend", `<h3>${city.score}</h3>`);
  // ADD city's description
  cityDescription.insertAdjacentHTML("beforeend", `<p>${city.description}</p>`);
}

//STEP: CREATE the city details section
function createDetailsSection(city) {
  //ADD weather
  getWeatherInfos(city.latitude, city.longitude);
  //ADD population
  population.insertAdjacentHTML(
    "beforeend",
    `<p>${city.population.toLocaleString("en-GB")} people</p>`
  );
  //ADD languages
  getLanguage(city.country);
  //ADD cost of living/life-quality DETAILS
  getLifeDetails(city.citySlug);
  //ADD cost of living/life-quality SCORES
  getCategoriesScore(city.scores);
}
