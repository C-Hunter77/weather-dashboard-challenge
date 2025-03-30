// client/src/main.ts

import './styles/jass.css';

// DOM elements
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.getElementById('today') as HTMLDivElement;
const forecastContainer = document.getElementById('forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

// Render current weather
const renderCurrentWeather = (current: any): void => {
  const { location, date, icon, condition, temperature, windSpeed, humidity } = current;

  heading.textContent = `${location} (${date})`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', condition);
  weatherIcon.className = 'weather-img';
  heading.append(weatherIcon);

  tempEl.textContent = `Temp: ${temperature} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

// Render forecast cards
const renderForecast = (forecast: any[]): void => {
  forecastContainer.innerHTML = '';

  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');
  headingCol.className = 'col-12';
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);
  forecastContainer.append(headingCol);

  forecast.forEach((day) => {
    const col = document.createElement('div');
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardTitle = document.createElement('h5');
    const weatherIcon = document.createElement('img');
    const tempEl = document.createElement('p');
    const windEl = document.createElement('p');
    const humidityEl = document.createElement('p');

    cardTitle.textContent = day.date;
    weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${day.icon}.png`);
    weatherIcon.setAttribute('alt', day.condition);
    tempEl.textContent = `Temp: ${day.temperature} °F`;
    windEl.textContent = `Wind: ${day.windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${day.humidity} %`;

    col.className = 'col-auto';
    card.className = 'forecast-card card text-white bg-primary h-100';
    cardBody.className = 'card-body p-2';
    cardTitle.className = 'card-title';
    tempEl.className = 'card-text';
    windEl.className = 'card-text';
    humidityEl.className = 'card-text';

    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
    card.append(cardBody);
    col.append(card);
    forecastContainer.append(col);
  });
};

// Render search history
const renderSearchHistory = async () => {
  const res = await fetch('/api/weather/history');
  const json = await res.json();
  const history = json.data;

  searchHistoryContainer.innerHTML = '';

  if (!history.length) {
    searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
    return;
  }

  history.reverse().forEach((city: any) => {
    const div = document.createElement('div');
    div.className = 'display-flex gap-2 col-12 m-1';

    const cityBtn = document.createElement('button');
    cityBtn.type = 'button';
    cityBtn.className = 'history-btn btn btn-secondary col-10';
    cityBtn.textContent = city.name;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-city btn btn-danger col-2';
    delBtn.textContent = '🗑';
    delBtn.dataset.city = JSON.stringify(city);

    div.append(cityBtn, delBtn);
    searchHistoryContainer.append(div);
  });
};

// Fetch weather from backend
const fetchWeather = async (cityName: string) => {
  const response = await fetch('/api/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: cityName }),
  });

  const weatherData = await response.json();
  console.log('weatherData:', weatherData);

  if (!weatherData.success) {
    alert(weatherData.message || 'Weather data fetch failed');
    return;
  }

  const { current, forecast } = weatherData.data;
  renderCurrentWeather(current);
  renderForecast(forecast);
  renderSearchHistory();
};

// Handle form submit
const handleSearchFormSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  const search = searchInput.value.trim();
  if (!search) {
    alert('City cannot be blank');
    return;
  }
  fetchWeather(search);
  searchInput.value = '';
};

// Handle history click
const handleSearchHistoryClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.matches('.history-btn')) {
    fetchWeather(target.textContent || '');
  }
};

// Handle delete from history
const handleDeleteHistoryClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.matches('.delete-city')) {
    const city = JSON.parse(target.dataset.city || '{}');
    await fetch(`/api/weather/history/${city.id}`, { method: 'DELETE' });
    renderSearchHistory();
  }
};

// Event listeners
searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', (e) => {
  handleSearchHistoryClick(e);
  handleDeleteHistoryClick(e);
});

// Initial history render
renderSearchHistory();
