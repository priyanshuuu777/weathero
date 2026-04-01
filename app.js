const $ = (selector, root = document) => root.querySelector(selector);

const elements = {
  cityInput: $("#cityInput"),
  searchBtn: $("#searchBtn"),
  message: $("#message"),
  loading: $("#loading"),
  currentWeather: $("#currentWeather"),
  cityList: $("#cityList"),
  filterSelect: $("#filterSelect"),
  sortSelect: $("#sortSelect"),
  themeToggle: $("#themeToggle"),
  cursorDot: $("#cursorDot"),
  confetti: $("#confetti"),
};

const STORAGE_KEY = "weather_saved_cities";
const THEME_KEY = "weather_theme";

let savedCities = [];

const weatherCodes = [
  { codes: [0], label: "Clear" },
  { codes: [1, 2, 3], label: "Cloudy" },
  { codes: [45, 48], label: "Fog" },
  { codes: [51, 53, 55, 56, 57], label: "Drizzle" },
  { codes: [61, 63, 65, 66, 67], label: "Rain" },
  { codes: [71, 73, 75, 77], label: "Snow" },
  { codes: [80, 81, 82], label: "Showers" },
  { codes: [95, 96, 99], label: "Thunderstorm" },
];

const getWeatherLabel = (code) =>
  (weatherCodes.find((entry) => entry.codes.includes(code)) || { label: "Unknown" })
    .label;

const setMessage = (text, isError = false) => {
  elements.message.textContent = text;
  elements.message.style.color = isError ? "#ff6b6b" : "";
};

const showLoading = (show) => {
  elements.loading.hidden = !show;
};

const updateTheme = () => {
  const theme = localStorage.getItem(THEME_KEY) || "dark";
  document.body.dataset.theme = theme;
};

const toggleTheme = () => {
  const theme = localStorage.getItem(THEME_KEY) || "dark";
  localStorage.setItem(THEME_KEY, theme === "dark" ? "light" : "dark");
  updateTheme();
};

const saveCities = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCities));

const loadCities = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    savedCities = [];
    return;
  }
  try {
    savedCities = JSON.parse(stored);
  } catch {
    savedCities = [];
    localStorage.removeItem(STORAGE_KEY);
  }
};

const addOrUpdateCity = (city) => {
  const exists = savedCities.find((item) => item.id === city.id);
  savedCities = exists
    ? savedCities.map((item) => (item.id === city.id ? city : item))
    : [...savedCities, city];
  saveCities();
  renderCities();
};

const toggleFavorite = (id) => {
  savedCities = savedCities.map((item) =>
    item.id === id ? { ...item, favorite: !item.favorite } : item
  );
  saveCities();
  renderCities();
};

const removeCity = (id) => {
  savedCities = savedCities.filter((item) => item.id !== id);
  saveCities();
  renderCities();
};

const buildFilterOptions = () => {
  const currentValue = elements.filterSelect.value;
  const conditions = [
    ...new Set(savedCities.map((city) => city.condition).filter(Boolean)),
  ];
  const optionValues = ["all", ...conditions];
  elements.filterSelect.innerHTML = optionValues
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");
  if (optionValues.includes(currentValue)) {
    elements.filterSelect.value = currentValue;
  }
};

const getFilteredAndSortedCities = () => {
  const filterValue = elements.filterSelect.value;
  const sortValue = elements.sortSelect.value;
  const filtered =
    filterValue === "all"
      ? savedCities
      : savedCities.filter((city) => city.condition === filterValue);
  if (sortValue === "none") return filtered;
  return [...filtered].sort((a, b) =>
    sortValue === "asc" ? a.temp - b.temp : b.temp - a.temp
  );
};

const renderCities = () => {
  buildFilterOptions();
  const list = getFilteredAndSortedCities();
  elements.cityList.innerHTML = list.length
    ? list
        .map(
          (city) => `<article class="city">
  <h4 class="city__title">${city.name}, ${city.country}</h4>
  <div class="city__meta">${city.condition} • ${city.temp}°C • Feels ${city.feelsLike}°C</div>
  <div class="city__meta">Humidity ${city.humidity}% • Wind ${city.wind} km/h</div>
  <div class="form__row">
    <button class="btn" data-fav="${city.id}">${city.favorite ? "Unfavorite" : "Favorite"}</button>
    <button class="btn" data-remove="${city.id}">Remove</button>
  </div>
</article>`
        )
        .join("")
    : `<p class="city__meta">No saved cities yet.</p>`;
};

const showCurrentWeather = (city) => {
  elements.currentWeather.innerHTML = `<article class="city">
  <h4 class="city__title">${city.name}, ${city.country}</h4>
  <div class="city__meta">${city.condition}</div>
  <div class="city__meta">Temp ${city.temp}°C • Feels ${city.feelsLike}°C</div>
  <div class="city__meta">Humidity ${city.humidity}% • Wind ${city.wind} km/h</div>
</article>`;
};

const buildCityData = (place, weather) => ({
  id: place.id,
  name: place.name,
  country: place.country,
  lat: place.latitude,
  lon: place.longitude,
  temp: Math.round(weather.temperature),
  feelsLike: Math.round(weather.apparent_temperature),
  humidity: weather.relative_humidity,
  wind: Math.round(weather.wind_speed),
  condition: getWeatherLabel(weather.weathercode),
  favorite: false,
});

async function fetchCityWeather(cityName) {
  showLoading(true);
  setMessage("");
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("Geo request failed");
    const geoData = await geoRes.json();
    const place = geoData.results && geoData.results[0];
    if (!place) {
      setMessage("City not found. Try another.", true);
      return;
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("Weather request failed");
    const data = await weatherRes.json();
    const cur = data.current;
    const city = buildCityData(place, {
      temperature: cur.temperature_2m,
      apparent_temperature: cur.apparent_temperature,
      relative_humidity: cur.relative_humidity_2m,
      wind_speed: cur.wind_speed_10m,
      weathercode: cur.weathercode,
    });
    const saved = savedCities.find((item) => item.id === city.id);
    if (saved && saved.favorite) city.favorite = true;
    addOrUpdateCity(city);
    showCurrentWeather(city);
    elements.cityInput.value = "";
  } catch {
    setMessage("Network issue. Please try again.", true);
  } finally {
    showLoading(false);
  }
}

const handleSearch = () => {
  const name = elements.cityInput.value.trim();
  if (!name) {
    setMessage("Please enter a city name.", true);
    return;
  }
  fetchCityWeather(name);
};

const handleCardClick = (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const fav = button.getAttribute("data-fav");
  const remove = button.getAttribute("data-remove");
  if (fav) toggleFavorite(Number(fav));
  if (remove) removeCity(Number(remove));
};

elements.searchBtn.addEventListener("click", handleSearch);
elements.cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});
elements.filterSelect.addEventListener("change", renderCities);
elements.sortSelect.addEventListener("change", renderCities);
elements.cityList.addEventListener("click", handleCardClick);
elements.themeToggle.addEventListener("click", toggleTheme);

if (elements.cursorDot) {
  window.addEventListener(
    "mousemove",
    (event) => {
      elements.cursorDot.style.left = `${event.clientX}px`;
      elements.cursorDot.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );
}

if (elements.confetti) {
  window.addEventListener(
    "scroll",
    () => {
      const pieces = Array.from({ length: 10 }, (_, index) => {
        const span = document.createElement("span");
        span.className = "confetti__piece";
        span.style.left = `${Math.random() * 100}%`;
        span.style.setProperty("--x", `${Math.random() * 200 - 100}px`);
        span.style.animationDelay = `${index * 0.05}s`;
        return span;
      });
      pieces.forEach((piece) => elements.confetti.appendChild(piece));
      setTimeout(() => pieces.forEach((piece) => piece.remove()), 1800);
    },
    { passive: true }
  );
}

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (event) => {
    const rect = btn.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    btn.style.transform = `translate(${x}px,${y}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

loadCities();
updateTheme();
renderCities();
