const searchInput = document.querySelector('#search');
const container = document.querySelector('#results');
const body = document.querySelector('body');
const API_KEY = 'e48d44bc0bb32c1f12019c3219ef5ad5'; 

let allCountries = [];

const getCountries = async () => {
    try {
        const url = 'https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,latlng,subregion';
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Error al conectar');
        
        const data = await response.json();
        allCountries = data;

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="info-text">Error de conexión. Recarga la página.</p>';
    }
}

getCountries();

searchInput.addEventListener('input', (e) => {
    const busqueda = e.target.value.toLowerCase();

    if (busqueda !== '') {
        body.classList.add('searching');
    } else {
        body.classList.remove('searching');
        container.innerHTML = '';
        return;
    }

    if (!allCountries.length) return; 

    const filtrados = allCountries.filter(pais => 
        pais.name.common.toLowerCase().includes(busqueda)
    );

    renderizar(filtrados);
});

const renderizar = (lista) => {
    container.innerHTML = '';

    if (lista.length > 10) {
        container.classList.remove('single-view');
        container.innerHTML = `
            <div class="info-text">
                 Demasiados países encontrados. Sigue escribiendo...
            </div>`;
        return;
    }

    if (lista.length >= 2 && lista.length <= 10) {
        container.classList.remove('single-view');
        lista.forEach(pais => {
            const div = document.createElement('div');
            div.classList.add('mini-card');
            div.innerHTML = `
                <img src="${pais.flags.svg}" alt="Flag">
                <h3>${pais.name.common}</h3>
            `;
            container.appendChild(div);
        });
        return;
    }

    if (lista.length === 1) {
        const pais = lista[0];
        container.classList.add('single-view'); 

        container.innerHTML = `
            <article class="country-card-big">
                <div class="flag-side">
                    <img src="${pais.flags.svg}" alt="Bandera de ${pais.name.common}">
                    
                    <div class="weather-bar">
                        <div id="weather-data">
                            <span class="weather-temp">Cargando...</span>
                        </div>
                        <div id="weather-desc" class="weather-desc">Conectando satélite...</div>
                    </div>
                </div>

                <div class="info-side">
                    <h2>${pais.name.common}</h2>
                    
                    <div class="data-row">
                        <strong>Capital</strong>
                        <span>${pais.capital ? pais.capital[0] : 'N/A'}</span>
                    </div>
                    <div class="data-row">
                        <strong>Región</strong>
                        <span>${pais.region} (${pais.subregion})</span>
                    </div>
                    <div class="data-row">
                        <strong>Población</strong>
                        <span>${pais.population.toLocaleString()} hab.</span>
                    </div>
                     <div class="data-row">
                        <strong>Latitud</strong>
                        <span>${pais.latlng ? pais.latlng[0].toFixed(2) : 'N/A'}</span>
                    </div>
                </div>
            </article>
        `;

        obtenerClima(pais.latlng[0], pais.latlng[1]);
    }

    if (lista.length === 0) {
        container.innerHTML = '<p class="info-text">No encontramos ningún país con ese nombre.</p>';
    }
};

const obtenerClima = async (lat, lon) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        
        const response = await fetch(url);
        const data = await response.json();

        const temp = Math.round(data.main.temp);
        const desc = data.weather[0].description;
        const iconCode = data.weather[0].icon; 

        const weatherDiv = document.querySelector('#weather-data');
        const descDiv = document.querySelector('#weather-desc');

        if(weatherDiv && descDiv) {
            weatherDiv.innerHTML = `
                <span class="weather-temp" style="font-size: 2rem;">${temp}°C</span>
            `;

            descDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Icono clima" style="width:50px; height:50px;">
                    <span style="text-transform: capitalize; font-size: 1rem;">${desc}</span>
                </div>
            `;
        }

    } catch (error) {
        console.error(error);
    }
}