let d = new Date();
let dow = 0;
const searchParams = new URLSearchParams(window.location.search);
let selectedCycle;

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

if (localStorage.getItem("renpower") == "true") {
    //renpower();
}

/**
 * finalSchedule
 * examDates
 * examTimes
 * periodSchedule
 */

setTable(d);
cycleTimes(finalSchedule.examTimes);
cycleNums(finalSchedule.periodSchedule);

if (getFinalDay(finalSchedule.examDates) != -1) {
    if (settings.showScroll == "true") {
        updateLoadingBar(finalSchedule.examTimes, new Date(), finalSchedule.examDates);
        setInterval(() => updateLoadingBar(finalSchedule.examTimes, new Date(), finalSchedule.examDates), 5000);
    } else {
        highlightCurrentPeriod(finalSchedule.examTimes, false, new Date(), finalSchedule.examDates);
        setInterval(() => highlightCurrentPeriod(finalSchedule.examTimes, false, new Date(), finalSchedule.examDates), 5000);
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
        if (arr[i] == 9) {
            document.getElementById("n" + i).innerHTML = "Make-up (E114)*";
        } else {
            document.getElementById("n" + i).innerHTML = "Period " + arr[i];
        }
    }
}

function highlightCurrentPeriod(scheduleTimes, isBlue, d, datesArray) {
    const currentTime = d;
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentMinutesTotal = currentHour * 60 + currentMinutes;

    let seAdder = getFinalDay(datesArray) * 3;

    let cssClass = "current-period-full";
    if (isBlue) cssClass = "current-period-lb";

    for (let i = 0; i < scheduleTimes.length; i += 2) {
        const startTime = convertToMinutes(scheduleTimes[i]);
        const endTime = convertToMinutes(scheduleTimes[i + 1]);

        const se = document.getElementById(`se-${(i / 2) + seAdder}`);

        let workingTitle = " mins";

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
}

function updateLoadingBar(scheduleTimes, d, datesArray) {
    const currentTime = d;
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentMinutesTotal = currentHour * 60 + currentMinutes;

    let seAdder = getFinalDay(datesArray) * 3;

    for (let i = 0; i < scheduleTimes.length; i += 2) {
        const startTime = convertToMinutes(scheduleTimes[i]);
        const endTime = convertToMinutes(scheduleTimes[i + 1]);

        const loadingBar = document.getElementById(`lb${(i / 2) + seAdder}`);

        if (currentMinutesTotal >= startTime && currentMinutesTotal <= endTime) {
            const progress = ((currentMinutesTotal - startTime) / (endTime - startTime)) * 100;
            loadingBar.classList.add("loading-bar");
            loadingBar.style.height = `${progress}%`;
        } else {
            loadingBar.classList.remove("loading-bar");
        }
    }

    highlightCurrentPeriod(scheduleTimes, true, new Date(), datesArray);
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

function getFinalDay(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (d.toDateString() == new Date(arr[i]).toDateString()) { return i; }
    }
    return -1;
}