import axios from "axios";

import { createClient } from "pexels";

const pexelKey = process.env.PEXEL_API_KEY;
const client = createClient(pexelKey);
//console.log(pexelKey);

import { showCity, onVisible, displayErrorAllert } from "./utilities";

////////////////////////////////////
//TELEPORT API
////////////////////////////////////
//GET all the cities
export function getAllUrbanAreas(searchTermsArray) {
  axios
    .get("https://api.teleport.org/api/urban_areas/")
    .then((res) => {
      let cities = res.data["_links"]["ua:item"];
      cities.forEach((city) => {
        searchTermsArray.push(city.name);
      });
    })
    .catch((err) => displayErrorAllert(err));
}

//GET life quality details//
//Variables
const currencyField = document.querySelector(".currency");
const rentField = document.querySelector(".rent");
const cinemaField = document.querySelector(".cinema");
const cappucinoField = document.querySelector(".cappuccino");
const transportField = document.querySelector(".transport");
const healthcareField = document.querySelector(".healthcare");
const environmentField = document.querySelector(".environmentalCrieria");
//Class
class DisplayTelportData {
  constructor(lifeCategoryIndex, displayInField) {
    this.lifeCategoryIndex = lifeCategoryIndex;
    this.displayInField = displayInField;
  }
}
//Function
export function getLifeDetails(citySlug) {
  axios
    .get(`https://api.teleport.org/api/urban_areas/${citySlug}/details`)
    .then((res) => {
      const lifeCategories = res.data.categories;

      //Get items label and cost/float value
      class CostOfItems extends DisplayTelportData {
        constructor(lifeCategoryIndex, lifeCategoryItemIndex, displayInField) {
          super(lifeCategoryIndex, displayInField);
          this.lifeCategoryItemIndex = lifeCategoryItemIndex;
          this.selectedCategory =
            lifeCategories[searchedItemIndex(this.lifeCategoryIndex)]?.data[
              this.lifeCategoryItemIndex
            ];
          if (this.selectedCategory?.label.includes(" [Teleport score]")) {
            this.selectedCategory.label = this.selectedCategory?.label.replace(
              " [Teleport score]",
              ""
            );
          }
        }

        item() {
          //check if this.selectedCategory exists (e.g in Andorra doesnt)
          if (!this.selectedCategory) {
            this.displayInField.innerHTML = "N/A";
          } else {
            this.displayInField
              ?.querySelector("div")
              .insertAdjacentHTML(
                "beforeend",
                `<p>${this.selectedCategory?.label}:</p>`
              );
            this.displayInField.insertAdjacentHTML(
              "beforeend",
              `<p class="cost">${
                this.selectedCategory?.currency_dollar_value
                  ? this.selectedCategory?.currency_dollar_value + "$"
                  : (this.selectedCategory?.float_value * 100).toFixed(2) + "%"
              } </p>`
            );
          }
        }

        items() {
          this.displayInField.insertAdjacentHTML(
            "beforeend",
            `<div class="category-detail"><div><p>${
              this.selectedCategory.label
            }:</p></div>
            <p class="cost">${
              (this.selectedCategory.float_value * 100).toFixed(2) + "%"
            }</p></div>
            `
          );
        }
      }

      //Indexes
      function searchedItemIndex(item) {
        return lifeCategories.map((obj) => obj.id).indexOf(`${item}`);
      }

      //Display items cost/%
      const cappucino = new CostOfItems("COST-OF-LIVING", 3, cappucinoField);
      const movieTicket = new CostOfItems("COST-OF-LIVING", 4, cinemaField);
      const transport = new CostOfItems("COST-OF-LIVING", 7, transportField);
      const rent = new CostOfItems("HOUSING", 1, rentField);
      const healthcare = new CostOfItems("HEALTHCARE", 3, healthcareField);

      cappucino.item();
      movieTicket.item();
      transport.item();
      rent.item();
      healthcare.item();

      //Environmental quality
      const environmentalCriteria =
        lifeCategories[searchedItemIndex("POLLUTION")].data;

      environmentalCriteria.forEach((env, i) => {
        const envItem = new CostOfItems("POLLUTION", i, environmentField);
        envItem.items();
      });

      //Display currency
      const currency = lifeCategories[searchedItemIndex("ECONOMY")].data[0];
      currencyField.innerHTML = `currency: <span>${currency.string_value}</span>`;
    })
    .catch((err) => displayErrorAllert(err));
}

//GET scores//
//Variables
const costOfLivingProgress = document.querySelector("#cost-of-living");
const housingProgress = document.querySelector("#housing");
const healthcareProgress = document.querySelector("#healthcare");
const envQualityProgress = document.querySelector("#envQuality");
//Function
export function getCategoriesScore(scoresArray) {
  class categoriesScore extends DisplayTelportData {
    constructor(lifeCategoryIndex, displayInField) {
      super(lifeCategoryIndex, displayInField);
    }

    displaySelectedCategory() {
      const selectedCategory = scoresArray[this.lifeCategoryIndex];

      this.displayInField.insertAdjacentHTML(
        "afterend",
        `<p>${selectedCategory.name}: ${
          selectedCategory.score_out_of_10 * 10
        }%</p>`
      );
      onVisible(this.displayInField, () => {
        this.displayInField.style.width = `${
          selectedCategory.score_out_of_10 * 10
        }%`;
      });
    }
  }
  //progressbar cost of living
  const costOfLivingScore = new categoriesScore(1, costOfLivingProgress);
  costOfLivingScore.displaySelectedCategory();
  //progressbar housing
  const housingScore = new categoriesScore(0, housingProgress);
  housingScore.displaySelectedCategory();
  //healhcare housing
  const healthcareScore = new categoriesScore(8, healthcareProgress);
  healthcareScore.displaySelectedCategory();
  //envQuality housing
  const envQualityScore = new categoriesScore(10, envQualityProgress);
  envQualityScore.displaySelectedCategory();
}

////////////////////////////////////
//REST COUNTRIES API
////////////////////////////////////
const countryLanguages = document.querySelector(".lang-data");
//GET the country languages//
export function getLanguage(country) {
  axios
    .get(`https://restcountries.com/v3.1/name/${country}`)
    .then((res) => {
      const languageObj = res.data[0]["languages"];
      const languages = Object.values(languageObj).join(", ");
      countryLanguages.insertAdjacentHTML("beforeend", `<p>${languages}</p>`);
    })
    .catch((err) => displayErrorAllert(err));
}

////////////////////////////////////
//WEATHER API
////////////////////////////////////
//Variables
const cityTime = document.querySelector(".time");
const cityDate = document.querySelector(".date");
const timeWeatherCard = document.querySelector(".time-wethear");
const cityWeatherDiv = document.querySelector(".weather-forecast");
const weatherKey = process.env.WEATHER_API_KEY;
console.log(weatherKey);
//GET weather infos//
export function getWeatherInfos(latitude, longitude) {
  axios
    .get(
      `https://api.weatherapi.com/v1/forecast.json?key=${weatherKey}&q=${latitude},${longitude}&aqi=yes`
    )
    .then((res) => {
      let weatherIcon = res.data.current.condition.icon;
      let weatherText = res.data.current.condition.text;
      let currentTempC = res.data.current.temp_c;
      let currentTempF = res.data.current.temp_f;
      let localTime = res.data.location.localtime;
      let sunrise = res.data.forecast.forecastday[0].astro.sunrise;
      let sunset = res.data.forecast.forecastday[0].astro.sunset;

      //get the city date and time
      (function timeConverter() {
        let a = new Date(localTime);
        let months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let date = a.getDate();
        let hour = String(a.getHours()).padStart(2, "0");
        let min = String(a.getMinutes()).padStart(2, "0");
        let cityCurrentDate = `${month} ${date}, ${year}`;
        let cityCurrentTime = `${hour}:${min}`;

        //add date and time on the card
        cityTime.innerHTML = cityCurrentTime;
        cityDate.innerHTML = cityCurrentDate;

        //convert time 12 to 24
        function getTwentyFourHourTime(amPmString) {
          const d = new Date("1/1/2013 " + amPmString);
          const convertedD = d.getHours() + ":" + d.getMinutes();
          //convert in a decimal number to compare
          const convertedHours = convertedD.replace(":", ".");
          return Number(convertedHours);
        }
        const currentHourColumn = Number(cityCurrentTime.replace(":", "."));
        const sunriseConverted = getTwentyFourHourTime(sunrise);
        const sunsetConverted = getTwentyFourHourTime(sunset);

        //set bg according to hour (sunrise, day, sunset, night)
        if (
          currentHourColumn == sunriseConverted ||
          (currentHourColumn > sunriseConverted &&
            currentHourColumn < sunriseConverted + 0.3)
        ) {
          timeWeatherCard.classList.add("sunriseTime");
        } else if (
          currentHourColumn == sunsetConverted ||
          (currentHourColumn > sunsetConverted &&
            currentHourColumn < sunsetConverted + 0.3)
        ) {
          timeWeatherCard.classList.add("sunsetTime");
        } else if (
          currentHourColumn > sunriseConverted &&
          currentHourColumn < sunsetConverted
        ) {
          timeWeatherCard.classList.add("dayTime");
        } else if (
          currentHourColumn > sunsetConverted ||
          currentHourColumn < sunriseConverted
        ) {
          timeWeatherCard.classList.add("nightTime");
        }
      })();

      //display current weather icon and temperature inf
      cityWeatherDiv.innerHTML = `<img src="${weatherIcon}" alt="${weatherText} weather icon"><div><h5>${weatherText}</h5><p>${currentTempC} C° | ${currentTempF} °F</p></div>`;
    })
    .catch((err) => displayErrorAllert(err));
}

////////////////////////////////////
//PEXEL API
////////////////////////////////////
const cityPhotoDiv = document.querySelector(".city-photo");
//GET image for the serached city//
export async function showPexelCityImage(city, country) {
  // add image as bg
  let query = `${city} town ${country}`;
  //get image from pexel with query=city
  await client.photos
    .search({ query, page: 1, per_page: 1, size: "large" })
    .then(async (photos) => {
      const img = photos?.photos[0]?.src.large2x || "";
      if (img) {
        await new Promise((resolve, reject) => {
          const imageElement = new Image();
          imageElement.onload = () => {
            cityPhotoDiv.style.backgroundImage = `url('${imageElement.src}')`;
            resolve();
          };
          imageElement.onerror = () => {
            reject(new Error("Failed to load image"));
          };
          imageElement.src = img;
        });
        showCity();
      } else {
        //Set background color if no image was found
        cityPhotoDiv.style.backgroundColor = `#bac9c2`;
        showCity();
      }
    })
    .catch((err) => displayErrorAllert(err));
}
