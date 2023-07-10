//VARIABLES
const generalCityInfos = document.querySelector(".city_general_info");
const moreInfo = document.querySelector(".more-info");
const loader = document.querySelector(".loader");
const footer = document.querySelector("footer");
const heroBg = document.querySelector(".search_hero");

const searchShortcut = document.querySelector(".search-shortcut");
const shortcutSearchClose = document.querySelector(".shortcutSearchClose");
const searchShortcutIcon = document.querySelector(".search-shortcut-icon");

//FUNCTION to call actions when element is visible
export function onVisible(element, callback) {
  new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        callback(element);
        observer.disconnect();
      }
    });
  }).observe(element);
}
////////////////////////////////////
//LOADING
////////////////////////////////////
//Show loading until image is ready
export function loadingCity() {
  heroBg.style.display = "none";
  loader.style.display = "flex";
}

//When image is loaded show city details
export function showCity() {
  loader.style.display = "none";
  generalCityInfos.style.display = "flex";
  moreInfo.style.display = "flex";
  footer.classList.add("cityFooter");
  searchShortcut.style.opacity = "1";
  onVisible(generalCityInfos, () => {
    generalCityInfos.classList.add("display-section");
  });
}

////////////////////////////////////
//SEARCH BAR
////////////////////////////////////
//VARIABLES
const searchInput = document.querySelector("#query");
const escIcon = document.querySelector(".esc-icon");
const searchResults = document.querySelector("#result");

//CLEAR search field
export function clearSearchField() {
  searchInput.value = "";
  escIcon.style.display = "none";
  searchResults.innerHTML = "";
  searchResults.classList.remove("results-dropdown");
}

//CLEAR search field
escIcon.addEventListener("click", clearSearchField);

//NAVIGATE dropdown results with arrows
//scroll to the selected item and highlight it
function scrolltoselected(item) {
  item.scrollIntoView({
    behavior: "smooth",
    block: "end",
  });
  item.classList.add("highlight");
}

export function highlight(list) {
  let currentLi = 0;

  document.addEventListener("keydown", function (e) {
    //Scroll down
    if (e.code == "ArrowDown") {
      list[currentLi].classList.remove("highlight");

      currentLi = currentLi < list.length - 1 ? ++currentLi : list.length - 1;
      scrolltoselected(list[currentLi]);
    }
    //Scroll up
    else if (e.code == "ArrowUp") {
      list[currentLi].classList.remove("highlight");
      currentLi = currentLi > 0 ? --currentLi : 0;
      scrolltoselected(list[currentLi]);
    }
  });
}

////////////////////////////////////
//BACK TO SEARCHBAR
////////////////////////////////////
async function clickSearchShortcut() {
  shortcutSearchClose.classList.add("shortcutSearchOpen");
  searchShortcut.style.backgroundColor = "transparent";
  searchShortcutIcon.style.display = "none";

  await new Promise((resolve) => setTimeout(resolve, 1200)); // Awaits for 1 second before executing the next line

  location.reload();
}

searchShortcut.addEventListener("click", clickSearchShortcut);

////////////////////////////////////
//ERROR POPUP
////////////////////////////////////
export function displayErrorAllert(err) {
  const errModal = document.querySelector(".allertError");
  const errMessage = document.querySelector(".errMessage");
  errModal.style.display = "flex";
  errMessage.innerHTML = `${
    err.message.toLowerCase().includes("network")
      ? err
      : "Maybe the selected city are not in our database. Retry in future."
  }`;
}
