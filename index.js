const searchInput = document.querySelector('#search');
const container = document.querySelector('#results');
const body = document.querySelector('body');
const API_KEY = 'e48d44bc0bb32c1f12019c3219ef5ad5'; 

let allCountries = [];

const getCountries = async () => {
    try {
        const url = 'https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,latlng,subregion,timezones';
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
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span id="w-icon">☁️</span>
                            <span id="w-desc" class="weather-desc">Cargando...</span>
                        </div>
                        
                        <div style="font-size: 1.5rem; opacity: 0.5; margin: 0 20px;">|</div>
                        
                        <div id="w-temp" class="weather-temp" style="font-size: 1.2rem;">-- Celsius</div>
                    </div>
                </div>

                <div class="info-side">
                    <h2>${pais.name.common}</h2>
                    
                    <div class="data-row">
                        <strong>Capital</strong>
                        <span>${pais.capital ? pais.capital[0] : 'N/A'}</span>
                    </div>
                    <div class="data-row">
                        <strong>Población</strong>
                        <span>${pais.population.toLocaleString('es-ES')} habitantes</span>
                    </div>
                    <div class="data-row">
                        <strong>Región</strong>
                        <span>${pais.region}</span>
                    </div>
                     <div class="data-row">
                        <strong>Sub Región</strong>
                        <span>${pais.subregion}</span>
                    </div>
                     <div class="data-row">
                        <strong>Zona Horaria</strong>
                        <span>${pais.timezones ? pais.timezones[0] : 'N/A'}</span>
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

        const temp = data.main.temp.toFixed(2);
        const desc = data.weather[0].description;
        const iconCode = data.weather[0].icon; 

        const iconSpan = document.querySelector('#w-icon');
        const descSpan = document.querySelector('#w-desc');
        const tempDiv = document.querySelector('#w-temp');

        if(iconSpan && descSpan) {
            iconSpan.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="icon" style="width:40px">`;
            descSpan.textContent = desc;
            tempDiv.textContent = `${temp} Celsius`;
        }

    } catch (error) {
        console.error(error);
    }
}