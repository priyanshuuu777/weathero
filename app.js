const $=s=>document.querySelector(s);
const cityInput=$("#cityInput"),searchBtn=$("#searchBtn"),messageEl=$("#message"),loadingEl=$("#loading"),currentWeatherEl=$("#currentWeather"),cityListEl=$("#cityList"),filterSelect=$("#filterSelect"),sortSelect=$("#sortSelect"),themeToggle=$("#themeToggle");
const STORAGE_KEY="weather_saved_cities",THEME_KEY="weather_theme";
let savedCities=[];
const weatherCodes=[ {
  codes:[0],label:"Clear"
}
, {
  codes:[1,2,3],label:"Cloudy"
}
, {
  codes:[45,48],label:"Fog"
}
, {
  codes:[51,53,55,56,57],label:"Drizzle"
}
, {
  codes:[61,63,65,66,67],label:"Rain"
}
, {
  codes:[71,73,75,77],label:"Snow"
}
, {
  codes:[80,81,82],label:"Showers"
}
, {
  codes:[95,96,99],label:"Thunderstorm"
}
];
const getWeatherLabel=code=>(weatherCodes.find(w=>w.codes.includes(code))|| {
  label:"Unknown"
}
).label;
const setMessage=(t,e)=> {
  messageEl.textContent=t;
  messageEl.style.color=e?"#ff6b6b":""
}
;
const showLoading=show=>loadingEl.toggleAttribute("hidden",!show);
const updateTheme=()=> {
  const t=localStorage.getItem(THEME_KEY)||"dark";
  document.body.dataset.theme=t
}
;
const toggleTheme=()=> {
  const t=localStorage.getItem(THEME_KEY)||"dark";
  localStorage.setItem(THEME_KEY,t==="dark"?"light":"dark");
  updateTheme()
}
;
const saveCities=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(savedCities));
const loadCities=()=> {
  const d=localStorage.getItem(STORAGE_KEY);
  savedCities=d?JSON.parse(d):[]
}
;
const addOrUpdateCity=city=> {
  const exists=savedCities.find(c=>c.id===city.id);
  savedCities=exists?savedCities.map(c=>c.id===city.id?city:c):[...savedCities,city];
  saveCities();
  renderCities()
}
;
const toggleFavorite=id=> {
  savedCities=savedCities.map(c=>c.id===id? {
    ...c,favorite:!c.favorite
  }
  :c);
  saveCities();
  renderCities()
}
;
const removeCity=id=> {
  savedCities=savedCities.filter(c=>c.id!==id);
  saveCities();
  renderCities()
}
;
const buildFilterOptions=()=> {
  const conditions=savedCities.map(c=>c.condition).filter((v,i,a)=>a.indexOf(v)===i);
  filterSelect.innerHTML=["all",...conditions].map(v=>`<option value="${v}">${v}</option>`).join("")
}
;
const getFilteredAndSortedCities=()=> {
  const f=filterSelect.value,s=sortSelect.value;
  const filtered=f==="all"?savedCities:savedCities.filter(c=>c.condition===f);
  return s==="none"?filtered:[...filtered].sort((a,b)=>s==="asc"?a.temp-b.temp:b.temp-a.temp)
}
;
const renderCities=()=> {
  buildFilterOptions();
  const list=getFilteredAndSortedCities();
  cityListEl.innerHTML=list.length?list.map(c=>`<article class="city"><h4 class="city__title">${c.name}, ${c.country}</h4><div class="city__meta">${c.condition} • ${c.temp}°C • Feels ${c.feelsLike}°C</div><div class="city__meta">Humidity ${c.humidity}% • Wind ${c.wind} km/h</div><div class="form__row"><button class="btn" data-fav="${c.id}">${c.favorite?"Unfavorite":"Favorite"}</button><button class="btn" data-remove="${c.id}">Remove</button></div></article>`).join(""):`<p class="city__meta">No saved cities yet.</p>`
}
;
const showCurrentWeather=city=> {
  currentWeatherEl.innerHTML=`<article class="city"><h4 class="city__title">${city.name}, ${city.country}</h4><div class="city__meta">${city.condition}</div><div class="city__meta">Temp ${city.temp}°C • Feels ${city.feelsLike}°C</div><div class="city__meta">Humidity ${city.humidity}% • Wind ${city.wind} km/h</div></article>`
}
;
const buildCityData=(p,w)=>( {
  id:p.id,name:p.name,country:p.country,lat:p.latitude,lon:p.longitude,temp:Math.round(w.temperature),feelsLike:Math.round(w.apparent_temperature),humidity:w.relative_humidity,wind:Math.round(w.wind_speed),condition:getWeatherLabel(w.weathercode),favorite:false
}
);
async function fetchCityWeather(cityName) {
  showLoading(true);
  setMessage("");
  try {
    const geoUrl=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes=await fetch(geoUrl);
    if(!geoRes.ok)throw new Error();
    const geoData=await geoRes.json();
    const place=geoData.results&&geoData.results[0];
    if(!place) {
      setMessage("City not found. Try another.",true);
      showLoading(false);
      return
    }
    const weatherUrl=`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
    const weatherRes=await fetch(weatherUrl);
    if(!weatherRes.ok)throw new Error();
    const data=await weatherRes.json();
    const cur=data.current;
    const city=buildCityData(place, {
      temperature:cur.temperature_2m,apparent_temperature:cur.apparent_temperature,relative_humidity:cur.relative_humidity_2m,wind_speed:cur.wind_speed_10m,weathercode:cur.weathercode
    }
    );
    const saved=savedCities.find(c=>c.id===city.id);
    if(saved&&saved.favorite)city.favorite=true;
    addOrUpdateCity(city);
    showCurrentWeather(city);
    cityInput.value=""
  }
  catch {
    setMessage("Network issue. Please try again.",true)
  }
  finally {
    showLoading(false)
  }
  
}
const handleSearch=()=> {
  const name=cityInput.value.trim();
  if(!name)return setMessage("Please enter a city name.",true);
  fetchCityWeather(name)
}
;
const handleCardClick=e=> {
  const f=e.target.getAttribute("data-fav"),r=e.target.getAttribute("data-remove");
  if(f)toggleFavorite(Number(f));
  if(r)removeCity(Number(r))
}
;
searchBtn.addEventListener("click",handleSearch);
cityInput.addEventListener("keydown",e=>e.key==="Enter"&&handleSearch());
filterSelect.addEventListener("change",renderCities);
sortSelect.addEventListener("change",renderCities);
cityListEl.addEventListener("click",handleCardClick);
themeToggle.addEventListener("click",toggleTheme);
const cursorDot=$("#cursorDot");
window.addEventListener("mousemove",e=> {
  cursorDot.style.left=e.clientX+"px";cursorDot.style.top=e.clientY+"px"
}
, {
  passive:true
}
);
const confetti=$("#confetti");
window.addEventListener("scroll",()=> {
  const pieces=Array.from( {
    length:10
  }
  ).map((_,i)=> {
    const s=document.createElement("span");s.className="confetti__piece";s.style.left=(Math.random()*100)+"%";s.style.setProperty("--x",(Math.random()*200-100)+"px");s.style.animationDelay=(i*0.05)+"s";return s
  }
  );pieces.map(p=>confetti.appendChild(p));setTimeout(()=>pieces.map(p=>p.remove()),1800)
}
, {
  passive:true
}
);
Array.from(document.querySelectorAll(".btn")).map(btn=> {
  btn.addEventListener("mousemove",e=> {
    const r=btn.getBoundingClientRect(); const x=((e.clientX-r.left)/r.width-.5)*10; const y=((e.clientY-r.top)/r.height-.5)*10; btn.style.transform=`translate(${x}px,${y}px)`
  }
  ); btn.addEventListener("mouseleave",()=>btn.style.transform="")
}
);
loadCities();
updateTheme();
renderCities();
