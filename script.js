
const days = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday"
];

const storageKey = "myLifeActivities";

// Contoh jadwal awal hari Kamis
const initialActivities = [
  {
    id: 1, day: "Thursday",
    start: "09:30", end: "12:00",
    activity: "Kuliah",
    category: "College", done: false
  },
  {
    id: 2, day: "Thursday",
    start: "12:30", end: "15:30",
    activity: "Kerja",
    category: "Work", done: false
  },
  {
    id: 3, day: "Thursday",
    start: "15:30", end: "17:40",
    activity: "Kuliah",
    category: "College", done: false
  },
  {
    id: 4, day: "Thursday",
    start: "17:40", end: "23:00",
    activity: "Kerja",
    category: "Work", done: false
  }
];

let activities = JSON.parse(
  localStorage.getItem(storageKey)
);

if (!Array.isArray(activities)) {
  activities = initialActivities;
  saveData();
}

const form = document.getElementById("activityForm");
const dayFilter = document.getElementById("dayFilter");
const scheduleList = document.getElementById("scheduleList");

function saveData() {
  localStorage.setItem(
    storageKey,
    JSON.stringify(activities)
  );
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getDuration(start, end) {
  return (toMinutes(end) - toMinutes(start)) / 60;
}

function formatDuration(value) {
  const total = Math.round(value * 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return `${hours} jam ${minutes} menit`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// CHECK JADWAL BERTABRAKAN
function hasConflict(day, start, end) {
  return activities.some(item => {
    if (item.day !== day) return false;

    const newStart = toMinutes(start);
    const newEnd = toMinutes(end);
    const oldStart = toMinutes(item.start);
    const oldEnd = toMinutes(item.end);

    return newStart < oldEnd && newEnd > oldStart;
  });
}

// TAMBAH AKTIVITAS
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const activity = document.getElementById("activity").value.trim();
  const day = document.getElementById("day").value;
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  const category = document.getElementById("category").value;

  if (!activity || !start || !end) return;

  if (toMinutes(end) <= toMinutes(start)) {
    alert("Jam selesai harus lebih besar dari jam mulai.");
    return;
  }

  if (hasConflict(day, start, end)) {
    alert("Jadwal bertabrakan! Cek kembali waktunya.");
    return;
  }

  activities.push({
    id: Date.now(),
    day,
    start,
    end,
    activity,
    category,
    done: false
  });

  saveData();

  dayFilter.value = day;
  form.reset();
  document.getElementById("day").value = day;

  render();
});

// TAMPILKAN JADWAL
function render() {
  const selectedDay = dayFilter.value;

  const dailyActivities = activities
    .filter(item => item.day === selectedDay)
    .sort((a, b) =>
      toMinutes(a.start) - toMinutes(b.start)
    );

  document.getElementById("selectedDay").textContent =
    selectedDay + " Schedule";

  document.getElementById("dailyTotal").textContent =
    dailyActivities.length + " activities";

  scheduleList.innerHTML = "";

  if (dailyActivities.length === 0) {
    scheduleList.innerHTML =
      "<p class='muted'>Belum ada kegiatan hari ini.</p>";
  }

  dailyActivities.forEach(item => {
    const duration = getDuration(item.start, item.end);

    const card = document.createElement("div");

    card.className =
      `activity-card ${item.category}` +
      (item.done ? " completed" : "");

    card.innerHTML = `
      <div class="time">
        ${item.start} – ${item.end}
      </div>

      <div class="activity-info">
        <h4>${escapeHTML(item.activity)}</h4>
        <p>
          ${escapeHTML(item.category)} ·
          ${formatDuration(duration)}
        </p>
      </div>

      <div class="activity-actions">
        <button class="status-button"
          onclick="toggleDone(${item.id})">
          ${item.done ? "Undo" : "Done"}
        </button>

        <button class="delete-button"
          onclick="deleteActivity(${item.id})">
          Delete
        </button>
      </div>
    `;

    scheduleList.appendChild(card);
  });

  updateDashboard();
}

// HITUNG STATISTIK
function updateDashboard() {
  const total = activities.length;
  const completed = activities.filter(x => x.done).length;
  const remaining = total - completed;

  const progress = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("totalActivities").textContent = total;
  document.getElementById("completedActivities").textContent = completed;
  document.getElementById("remainingActivities").textContent = remaining;
  document.getElementById("progress").textContent = progress + "%";
}

// TANDAI SELESAI
function toggleDone(id) {
  activities = activities.map(item =>
    item.id === id
      ? { ...item, done: !item.done }
      : item
  );

  saveData();
  render();
}

// HAPUS AKTIVITAS
function deleteActivity(id) {
  if (!confirm("Yakin ingin menghapus kegiatan ini?")) return;

  activities = activities.filter(item => item.id !== id);

  saveData();
  render();
}

// GANTI HARI
dayFilter.addEventListener("change", render);

// TAMPILKAN DATA AWAL
render();
