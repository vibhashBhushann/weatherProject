const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apikey = "6a8c893da766d734f2ceef8a82a30584";
const locationButton = document.getElementById("locationButton");
const geocodingApiKey = "ec13cd6af90341e7ab29a7e8481bc823";

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
    const city = cityInput.value;

    if (city) {
        try{
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
            displayActivityRecommendations(weatherData.weather[0].main);
        }
        catch(error){
            console.error(error);
            displayError(error);
        }
    }
    else {
        displayError("Please enter a city");
    }
});

locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        displayError("Geolocation is not supported by this browser.");
    }
});

async function getWeatherData(city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

    const response = await fetch(apiUrl);

    if (!response.ok){
        throw new Error("could not fetch weather data");
    }
    return await response.json();
}

function displayWeatherInfo(data){
    console.log(data);
    const {name: city, main: {temp, humidity}, weather: [{description, id}]} = data;

    card.style.display = "flex";

    card.innerHTML = `
        <div class="weather-info">
            <h1 class="cityDisplay">${city}</h1>
            <p class="tempDisplay">${(temp - 273.15).toFixed(1)}°C</p>
        </div>
        <p class="humidityDisplay">Humidity: ${humidity}</p>
        <p class="descDisplay">"${description}"</p>
        <p class="weatherEmoji">${getWeatherEmoji(id)}</p>
        <div class="activitiesContainer" style="display: none">
            <h3>Activity Recommendation:</h3>
            <ul class="activitiesList"></ul>
        </div>
    `;
    
}

function getWeatherEmoji(weatherId){
    switch(true) {
        case(weatherId >= 200 && weatherId < 300): return "⛈️";
        case(weatherId >= 300 && weatherId < 600): return "🌧️";
        case(weatherId >= 600 && weatherId < 700): return "🌨️";
        case(weatherId >= 700 && weatherId < 800): return "🌤️";
        case(weatherId == 800): return "☀️";
        case(weatherId > 800 && weatherId < 900): return "☁️";
        default: return "👾";
    }
}

function displayError(message) {
    card.style.display = "flex";
    card.innerHTML = `<p class="errorDisplay">${message}</p>`;
}
function clearCard() {
    card.innerHTML = "";
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    reverseGeocode(latitude, longitude);
}

async function reverseGeocode(latitude, longitude) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${geocodingApiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
        if (city) {
            cityInput.value = city;
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
            displayActivityRecommendations(weatherData.weather[0].main);
        } else {
            displayError("Unable to determine city from coordinates.");
        }
    } catch (error) {
        console.error('Error fetching the reverse geocoding data:', error);
        displayError("Unable to determine city from coordinates.");
    }
}

function displayActivityRecommendations(weatherCondition) {
    const activitiesContainer = document.querySelector(".activitiesContainer");
    const activitiesList = document.querySelector(".activitiesList");

    activitiesContainer.style.display = "block";
    activitiesList.innerHTML = "";

    switch (weatherCondition.toLowerCase()) {
        case "clear":
            activitiesList.innerHTML = `
                <li>☀️ Go for a walk or hike outdoors.</li>
                <li>🏖️ Visit the beach or have a picnic.</li>
                <li>🚴‍♀️ Ride a bike or go for a run.</li>
            `;
            break;
        case "clouds":
            activitiesList.innerHTML = `
                <li>🌥️ Take a scenic drive or walk in a park.</li>
                <li>📚 Read a book at a cozy cafe.</li>
                <li>🎨 Try indoor painting or crafts.</li>
            `;
            break;
        case "rain":
        case "drizzle":
            activitiesList.innerHTML = `
                <li>☔ Stay indoors and enjoy a movie marathon.</li>
                <li>🍲 Cook a comforting meal or bake cookies.</li>
                <li>🎵 Listen to music and relax indoors.</li>
                `;
            break;
        case "thunderstorm":
            activitiesList.innerHTML = `
                <li>⛈️ Stay indoors and stay safe.</li>
                <li>📺 Have a movie marathon.</li>
                <li>🎮 Play indoor games.</li>
            `;
            break;
        case "snow":
            activitiesList.innerHTML = `
                <li>❄️ Build a snowman!</li>
                <li>🛷 Go sledding.</li>
                <li>☕ Enjoy hot cocoa.</li>
            `;
            break;
        default:
            activitiesList.innerHTML = `
                <li>Check back later for activity recommendations!</li>
            `;
            break;
    }
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            displayError("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            displayError("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            displayError("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            displayError("An unknown error occurred.");
            break;
    }
}