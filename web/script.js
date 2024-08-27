let d = new Date();
let dow = 0;
const searchParams = new URLSearchParams(window.location.search);
let selectedCycle;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const timesLS = ["9:00", "9:09", null, null, "9:14", "9:49", "9:54", "10:29", "10:34", "11:09", "11:14", "11:54", "11:59", "12:39", "12:34", "13:14", "13:19", "13:54", "13:59", "14:34", "14:39", "15:14", "11:24", "11:54", "11:59", "12:29", "12:22", "12:52", "12:44", "13:14"];
const timesTF = ["7:15", "8:05", null, null, "8:10", "9:07", "9:12", "9:24", "9:29", "10:26", "10:31", "11:28", "11:37", "12:34", "12:13", "13:10", "13:15", "14:12", "14:17", "15:14", null, null, "11:02", "11:32", "11:33", "12:08", "12:07", "12:37", "12:39", "13:10"];

const numsLS = ["EB*", null, "1", "2", "3", "4", "5-I", "5-II", "6", "7", "8"];
const nums78 = ["EB", null, "1", "HR", "2", "3", "4-I", "4-II", "5", "6", null];
const nums56 = ["EB", null, "1", "HR", "2", "3", "4-I", "4-II", "7", "8", null];
const nums34 = ["EB", null, "1", "HR", "2", "5", "6-I", "6-II", "7", "8", null];
const nums12 = ["EB", null, "3", "HR", "4", "5", "6-I", "6-II", "7", "8", null];

const cycles = [
  {
    times: timesLS,
    nums: numsLS,
    cycleName: "Cycle LS"
  },
  {
    times: timesTF,
    nums: nums78,
    cycleName: "Cycle 78"
  },
  {
    times: timesTF,
    nums: nums56,
    cycleName: "Cycle 56"
  },
  {
    times: timesTF,
    nums: nums34,
    cycleName: "Cycle 34"
  },
  {
    times: timesTF,
    nums: nums12,
    cycleName: "Cycle 12"
  },
  {
    times: SpecialSchedule.times,
    nums: SpecialSchedule.nums,
    cycleName: SpecialSchedule.cycleName
  }
];

const settings = {
  showScroll: localStorage.getItem("scrollTime")
}

if (searchParams.get("d"))
  d = new Date(searchParams.get("d"));

const scrollTimeCb = document.getElementById("scrollTime");

if (localStorage.getItem("scrollTime") == null) {
  localStorage.setItem("scrollTime", "false");
}

if (settings.showScroll == "true") {
  scrollTimeCb.checked = true;
}

scrollTimeCb.addEventListener("change", function() {
  if (scrollTimeCb.checked) {
    localStorage.setItem("scrollTime", "true");
  } else {
    localStorage.setItem("scrollTime", "false");
  }
  location.reload();
});

document.getElementById("title").textContent = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

dow = processScheduleJSON(d);

if (SpecialSchedule.enable) dow = 8;

if (searchParams.get("dow")) dow = parseInt(searchParams.get("dow"));

if (dow == 8) {
  if (typeof SpecialSchedule.h2 !== 'undefined')
    document.getElementById("subtitle").innerHTML = SpecialSchedule.h2;
  document.getElementById("orviewbs").classList.add("hidden");
  document.getElementById("orviewss").classList.remove("hidden");
  document.getElementById("orviewa").href = SpecialSchedule.link;
} else if (typeof dow === 'object') {
  if (typeof dow.h2 !== 'undefined') document.getElementById("subtitle").innerHTML = dow.h2;
  document.getElementById("orviewbs").classList.add("hidden");
  document.getElementById("orviewss").classList.remove("hidden");
  document.getElementById("orviewa").href = dow.link;
}

if (SpecialSchedule.dowOverride > 0 && SpecialSchedule.dowOverride < 6)
  dow = SpecialSchedule.dowOverride;

if (typeof dow === 'object') {
  selectedCycle = dow;
} else {
  selectedCycle = cycles.find((cycle, index) => {
    if (index < 5) {
      return dow === index + 1;
    } else {
      return dow === 8 || dow === 10;
    }
  });
}

if (localStorage.getItem("renpower") == "true") {
  //renpower();
}

if (!selectedCycle) {
  showPDF(false);
} else if (dow == 10) {
  showPDF(true);
  document.getElementById("title").textContent = "No School";
} else {
  setTable(d);
  cycleTimes(selectedCycle.times);
  cycleNums(selectedCycle.nums);
  if (dow == 1)
    document.getElementById("ebnotif").classList.remove("hidden");
  document.getElementById("cyclename").innerHTML = selectedCycle.cycleName;
  if (settings.showScroll == "true") {
    updateLoadingBar(selectedCycle.times, new Date());
    setInterval(() => updateLoadingBar(selectedCycle.times, new Date()), 5000);
  } else {
    highlightCurrentPeriod(selectedCycle.times, false, new Date());
    setInterval(() => highlightCurrentPeriod(selectedCycle.times, false, new Date()), 5000);
  }
}

hideLoadingScreen();

console.log("%cSuggestions?", "font-weight: bold; font-size: 50px;color: #e98888; text-shadow: 3px 3px 0 #3498db; margin-bottom: 12px;");
console.log("%cReach out @ 261navickasm+dhscycle@student.dist113.org", "color:#3498db;");

function cycleTimes(arr) {
  for (let i = 0; i < arr.length; i += 2) {
    const startTime = convertTo12HourFormat(arr[i]);
    const endTime = convertTo12HourFormat(arr[i + 1]);

    document.getElementById(`t${i}`).textContent = startTime;
    document.getElementById(`t${i + 1}`).textContent = endTime;
  }
}

function cycleNums(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) {
      document.getElementById("se-" + i).classList.add("hidden");
      console.log("se-" + i + " hidden")
    } else {
      console.log("n" + i);
      document.getElementById("n" + i).innerHTML = arr[i];
    }
  }
}

function highlightCurrentPeriod(scheduleTimes, isBlue, d) {
  const currentTime = d;
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentMinutesTotal = currentHour * 60 + currentMinutes;

  let cssClass = "current-period-full";
  if (isBlue) cssClass = "current-period-lb";

  for (let i = 0; i < scheduleTimes.length; i += 2) {
    const startTime = convertToMinutes(scheduleTimes[i]);
    const endTime = convertToMinutes(scheduleTimes[i + 1]);

    const se = document.getElementById(`se-${i / 2}`);
    console.log(se)

    let workingTitle = " mins";
    
    console.log(scheduleTimes[i] + ' ' + endTime + ' ' + startTime);
    
    workingTitle = (endTime - startTime) + workingTitle;
    
    if (currentMinutesTotal >= startTime && currentMinutesTotal <= endTime) {
      se.classList.add(cssClass);
      const timeLeft = endTime - currentMinutesTotal;
      workingTitle = `${workingTitle}, ${timeLeft} mins left`;
    } else {
      se.classList.remove(cssClass);

    }

    se.title = workingTitle;
  }
  console.log(scheduleTimes);
}

function updateLoadingBar(scheduleTimes, d) {
  const currentTime = d;
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentMinutesTotal = currentHour * 60 + currentMinutes;

  for (let i = 0; i < scheduleTimes.length; i += 2) {
    const startTime = convertToMinutes(scheduleTimes[i]);
    const endTime = convertToMinutes(scheduleTimes[i + 1]);

    const loadingBar = document.getElementById(`lb${i / 2}`);

    if (currentMinutesTotal >= startTime && currentMinutesTotal <= endTime) {
      const progress = ((currentMinutesTotal - startTime) / (endTime - startTime)) * 100;
      loadingBar.classList.add("loading-bar");
      loadingBar.style.height = `${progress}%`;
    } else {
      loadingBar.classList.remove("loading-bar");
    }
  }

  highlightCurrentPeriod(scheduleTimes, true, new Date());
}

function processScheduleJSON(date) {
  const scheduleObject = getScheduleData(date);
  if (scheduleObject) {
    const dayIndex = date.getDay() - 1;
    if (dayIndex >= 0 && dayIndex < scheduleObject.weekSchedules.length) {
      return scheduleObject.weekSchedules[dayIndex];
    }
  }

  return date.getDay() >= 1 && date.getDay() <= 5 ? date.getDay() : 0;
}

function setTable(date) {
  const sd = getScheduleData(date);
  if (typeof sd === 'object') {
    for (let i = 0; i < 5; i++) {
      const scheduleElement = sd.weekSchedules[i];
      if (scheduleElement == 10) {
        updateTableElement(i, "No School");
      } else if (scheduleElement > 0 && scheduleElement < 6) {
        updateTableElement(i, cycles[scheduleElement - 1].cycleName);
      } else {
        updateTableElement(i, sd.weekSchedules[i].cycleName);
      }
    }
  }
}

function getScheduleData(date) {
  return scheduleData.find((schedule) => {
    let startDate = new Date(schedule.startDate + "T00:00-0500");
    let endDate = new Date(schedule.endDate + "T00:00-0500");
    startDate = new Date(startDate.valueOf() - 1000 * 3600 * 24 * 2)
    endDate = new Date(endDate.valueOf() + 1000 * 3600 * 24);
    return date >= startDate && date <= endDate;
  });
}

function showPDF(showTitle) {
  document.getElementById("informationbox").classList.add("hidden");
  document.getElementById("footer").classList.add("hidden");
  if (!showTitle) { document.getElementById("header").classList.add("hidden"); }
  else {
    let subtitle = document.getElementById("subtitle");
    subtitle.parentNode.removeChild(subtitle);
  }
  document.getElementById("pdfschedulecontainer").classList.remove("hidden");
  document.getElementById("orview").classList.add("hidden");
  document.getElementById("settings").classList.add("hidden");
  document.getElementById("thisweektable").classList.add("hidden");
  document.getElementsByTagName("body")[0].style.overflowX = "hidden";
}

function updateTableElement(tableNum, text) {
  document.getElementById("tableday" + (tableNum + 1)).innerHTML = text;
}

function convertToMinutes(time) {
  if (time == null) return;
  const [hour, minute] = time.split(":");
  return parseInt(hour) * 60 + parseInt(minute);
}

function convertTo12HourFormat(time) {
  if (time == null) return;
  const [hour, minute] = time.split(":");
  const hour12 = parseInt(hour) % 12 || 12;
  return `${hour12}:${minute}`;
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingscreen");
  loadingScreen.style.display = "none";
}

function setColor(hex, property) {
  document.documentElement.style.setProperty("--" + property, hex);
  localStorage.setItem(property + "color", hex);
}

function renpower() {
  document.body.style.backgroundImage = 'url("assets/rEN.png")';
  localStorage.setItem("renpower", true);
}