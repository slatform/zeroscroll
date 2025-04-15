// 🚨 Redirect first-time users to setup.html if no widgets saved
if (!localStorage.getItem('zeroscroll-widgets')) {
  window.location.replace("setup.html");
}
// 🛑 Redirect if widgets haven't been selected
if (!localStorage.getItem('zeroscroll-widgets')) {
  window.location.href = "setup.html";
}
// ---- 1. GET SELECTED WIDGETS ----
const defaultWidgets = ["weather", "news", "quote", "todo"];
const savedWidgets = JSON.parse(localStorage.getItem("zeroscroll-widgets")) || defaultWidgets;
const dashboard = document.getElementById("dashboard");

// ---- 2. BUILD TILES BASED ON SELECTION ----
savedWidgets.forEach(widget => {
  const tile = document.createElement("div");
  tile.classList.add("tile");
  tile.id = widget;

  let title = widget.charAt(0).toUpperCase() + widget.slice(1).replace("-", " ");
  let contentId = widget + "-content";

  tile.innerHTML = `
    <h2>${title}</h2>
    <div ${widget === "todo" ? 'contenteditable="true"' : ''} id="${contentId}">
      ${widget === "todo" ? "Add your tasks here..." : "Loading..."}
    </div>
  `;

  dashboard.appendChild(tile);
});

// ---- 3. QUOTE ROTATION ----
if (savedWidgets.includes("quote")) {
  const quoteTile = document.getElementById("quote-content");
  const quotes = [
    "Stay curious.",
    "Minimal is powerful.",
    "Information, not distraction.",
    "No scroll. Just flow.",
    "You control the noise."
  ];
  let index = 0;
  setInterval(() => {
    quoteTile.textContent = quotes[index];
    index = (index + 1) % quotes.length;
  }, 3000);
}

// ---- 4. WEATHER ----
if (savedWidgets.includes("weather")) {
  const weatherTile = document.getElementById("weather-content");
  fetch("https://api.open-meteo.com/v1/forecast?latitude=32.7157&longitude=-117.1611&current_weather=true")
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.current_weather.temperature);
      const condition = data.current_weather.weathercode;
      const map = {
        0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Fog", 51: "Drizzle", 61: "Rain", 71: "Snow",
        80: "Rain Showers", 95: "Thunderstorm"
      };
      weatherTile.innerHTML = `<div>San Diego</div><div>${temp}°F | ${map[condition] || "Weather"}</div>`;
    }).catch(() => {
      weatherTile.textContent = "Unable to load weather.";
    });
}

// ---- 5. NEWS ----
if (savedWidgets.includes("news")) {
  const newsTile = document.getElementById("news-content");
  const gnewsKey = "c6ceda0193709c0f213fa7ee39d8f354";

  fetch(`https://gnews.io/api/v4/search?q=world&lang=en&max=3&apikey=${gnewsKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.articles?.length) {
        const list = data.articles.map(a => `<li style="margin: 5px 0;">• ${a.title}</li>`).join("");
        newsTile.innerHTML = `<ul style="list-style:none; padding-left: 0;">${list}</ul>`;
      } else {
        newsTile.textContent = "No news found.";
      }
    }).catch(() => {
      newsTile.textContent = "Unable to load news.";
    });
}

// ---- 6. TO-DO ----
if (savedWidgets.includes("todo")) {
  const todo = document.getElementById("todo-content");
  const saved = localStorage.getItem("zeroscroll-todo");
  if (saved) todo.innerHTML = saved;
  todo.addEventListener("keyup", () => {
    localStorage.setItem("zeroscroll-todo", todo.innerHTML);
  });
}

// ---- 7. NEW WIDGET PLACEHOLDERS ----
const placeholderWidgets = [
  "calendar", "music", "notes", "crypto", "affirmation",
  "finances", "shopping", "meals", "email", "custom"
];

placeholderWidgets.forEach(widget => {
  if (savedWidgets.includes(widget)) {
    const tile = document.getElementById(`${widget}-content`);
    if (tile) {
      tile.innerHTML = "Coming soon...";
    }
  }
});

// ---- 8. THEME TOGGLE ----
const themeToggle = document.getElementById("theme-toggle");
const storedTheme = localStorage.getItem("zeroscroll-theme");
if (storedTheme === "light") document.body.classList.add("light");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("zeroscroll-theme", document.body.classList.contains("light") ? "light" : "dark");
});

// ---- 9. TILE ZOOM/EXPAND ----
const closeBtn = document.getElementById("close-expanded");
document.addEventListener("click", e => {
  const tile = e.target.closest(".tile");
  if (!tile || tile.classList.contains("expanded")) return;

  document.body.classList.add("expanding");
  tile.classList.add("expanded");
  closeBtn.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  const expanded = document.querySelector(".tile.expanded");
  if (expanded) expanded.classList.remove("expanded");
  document.body.classList.remove("expanding");
  closeBtn.style.display = "none";
});
