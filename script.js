const cityInput = document.querySelector("input");
const search = document.getElementById("search-btn");
const forecastContainer = document.getElementById("forecast-container");
const Appi_key = "3f3a9ec87f18b0c1136f4da517785b1a";
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error-message");
const currentDateEl = document.getElementById("current-date");
const currentTimeEl = document.getElementById("current-time");
const pressureEl = document.getElementById("pressure-value");
const uvEl = document.getElementById("uv-value");

// Initialize with a default city
const defaultCity = "New York";

// Update time function
function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
    };
    currentTimeEl.textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Initial call and set interval
updateTime();
setInterval(updateTime, 1000);

window.addEventListener('load', () => {
    const lastSearchedCity = localStorage.getItem('lastSearchedCity') || defaultCity;
    cityInput.value = lastSearchedCity;
    search_name_Api();
});

const search_name_Api = () => {
    const City_name = cityInput.value.trim();
    if (City_name) {
        loadingEl.style.display = "block";
        errorEl.style.display = "none";
        
        localStorage.setItem('lastSearchedCity', City_name);
        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${City_name}&limit=1&appid=${Appi_key}`;

        fetch(API_URL)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    const { lon, lat, name } = data[0];
                    data_api(lon, lat, name);
                } else {
                    showError("City not found. Please try again.");
                }
            })
            .catch((error) => {
                showError("Error fetching data. Please check your connection.");
                console.error("Error fetching data:", error);
            });
    } else {
        showError("Please enter a city name.");
    }
}

const data_api = (lon, lat, name) => {
    const Api_Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${Appi_key}&units=metric`;

    fetch(Api_Url)
        .then((response) => response.json())
        .then((data) => {
            loadingEl.style.display = "none";
            const dailyData = [];
            const todayData = data.list[0];
            
            // Add pressure and UV index
            pressureEl.textContent = todayData.main.pressure;
            uvEl.textContent = (Math.random() * 10).toFixed(1); // Mock UV data

            for (let i = 0; i < data.list.length; i += 8) {
                dailyData.push(data.list[i]);
            }

            updateTodayForecast(todayData, name);
            updateDOM(dailyData);
        })
        .catch((error) => {
            showError("Error fetching weather data. Please try again later.");
            console.error("Error fetching weather data:", error);
            loadingEl.style.display = "none";
        });
}

const updateTodayForecast = (todayData, name) => {
    const temp = todayData.main.temp;
    const wind = todayData.wind.speed;
    const humidity = todayData.main.humidity;
    const iconCode = todayData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.querySelector('#today-weather-icon').src = iconUrl;
    document.querySelector('[data-value="temperature"]').textContent = Math.round(temp);
    document.querySelector('[data-value="wind-speed"]').textContent = wind.toFixed(1);
    document.querySelector('[data-value="humidity-level"]').textContent = humidity;
    document.querySelector('#city').textContent = name;
}

const updateDOM = (dailyData) => {
    forecastContainer.innerHTML = '';
    dailyData.forEach((day) => {
        const date = new Date(day.dt * 1000);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = Math.round(day.main.temp);
        const wind = day.wind.speed.toFixed(1);
        const description = day.weather[0].description;
        const iconCode = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-card');

        dayElement.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">
                <img src="${iconUrl}" alt="${description}">
            </div>
            <div class="forecast-desc">${description}</div>
            <div class="forecast-temp">${temp}</div>
            <div class="forecast-wind">
                <i class="fas fa-wind"></i>
                ${wind} km/h
            </div>
        `;

        forecastContainer.appendChild(dayElement);
    });
}

function showError(message) {
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
    document.getElementById("error-text").textContent = message;
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorEl.style.display = "none";
    }, 5000);
}

search.addEventListener("click", search_name_Api);
cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        search_name_Api();
    }
});

// Initialize with default data
updateTodayForecast({
    main: { temp: 24, humidity: 65, pressure: 1015 },
    wind: { speed: 5.2 },
    weather: [{ icon: "01d", description: "Clear sky" }]
}, "New York");

// Create mock forecast data for initial display
// const mockForecast = [];
// for (let i = 1; i <= 5; i++) {
//     const date = new Date();
//     date.setDate(date.getDate() + i);
    
//     mockForecast.push({
//         dt: date.getTime() / 1000,
//         main: { temp: 22 + i },
//         wind: { speed: (4 + i * 0.5).toFixed(1) },
//         weather: [{ 
//             icon: i % 2 === 0 ? "02d" : "10d", 
//             description: i % 2 === 0 ? "Partly cloudy" : "Light rain" 
//         }]
//     });
// }

// updateDOM(mockForecast);