# Weather Explorer

A responsive web application that lets users search for real-time weather data across multiple cities, with support for filtering, sorting, and saving favorites.

---

## Purpose

Weather Explorer helps users quickly look up current weather conditions for any city in the world. Users can compare weather across multiple cities, filter by weather condition, sort by temperature, and save their favorite locations for quick access.

---

## API Used

**[Open-Meteo](https://open-meteo.com/)**

- Free to use - no API key required
- Provides real-time weather data including temperature, wind speed, humidity, and weather condition codes
- Also uses the **[Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)** to convert city names into coordinates

---

## Features

| Feature | Description |
|---|---|
| City Search | Search for any city worldwide by name |
| Current Weather | Displays temperature, humidity, wind speed, and condition |
| Filter | Filter results by weather condition (e.g., sunny, rainy, cloudy) |
| Sort | Sort cities by temperature (ascending or descending) |
| Favorites | Save and remove favorite cities using Local Storage |
| Dark / Light Mode | Toggle between dark and light themes |
| Loading Indicators | Visual feedback while weather data is being fetched |
| Responsive Design | Works across mobile, tablet, and desktop screens |

---

## Technologies Used

- **HTML5** - Page structure
- **CSS3** - Styling and responsive layout
- **Vanilla JavaScript (ES6+)** - Logic, API calls, DOM manipulation
- **Fetch API** - For making HTTP requests to Open-Meteo
- **LocalStorage** - For persisting favorites and theme preference
- **Array HOFs** - `filter()`, `sort()`, `map()`, `find()` used for all search/filter/sort operations

---

## Project Structure

```
weather-explorer/
 index.html        # Main HTML file
 style.css         # Stylesheet
 app.js            # Main JavaScript logic
 README.md         # Project documentation
```

---

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-explorer.git
   ```

2. Open the project folder:
   ```bash
   cd weather-explorer
   ```

3. Open `index.html` in your browser - no build tools or installations needed.

> No API key is required. The app works out of the box.

---

## Milestones

| Milestone | Description | Deadline |
|---|---|---|
| 1 | Project Setup & Planning | 23rd March |
| 2 | API Integration & Responsive UI | 1st April |
| 3 | Search, Filter, Sort & Interactivity | 8th April |
| 4 | Documentation, Refactoring & Deployment | 10th April |

---

## Deployment

The project will be deployed using **GitHub Pages**.

Live link will be added here after deployment.

---

## Author

**Priyanshu Shrivastava**  

