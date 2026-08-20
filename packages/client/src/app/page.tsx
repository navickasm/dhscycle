'use client';

import styles from "./page.module.css";
import Heading from "../components/Heading.tsx";
import {Suspense, useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Schedule} from "../schedule.ts";
import Table from "../components/schedule/Table.tsx";
import ThisWeek, {ThisWeekSchedule} from "../components/thisweek/ThisWeek.tsx";
import NotifBox from "../components/NotifBox.tsx";
import Calendar, {YearMonth} from "../components/calendar/Calendar.tsx";
import {CalendarCellData} from "../components/calendar/CalendarCell.tsx";
import MessageBox from "../components/MessageBox.tsx";
import {displayDateStr} from "../centralTime.ts";

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://api.dhscycle.com';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function formatDateStr(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

function schoolYearMonths(todayStr: string): YearMonth[] {
    const [year, month] = todayStr.split('-').map(Number);
    const startYear = month >= 7 ? year : year - 1;
    const months: YearMonth[] = [];
    for (let m = 8; m <= 12; m++) months.push({year: startYear, month: m});
    for (let m = 1; m <= 6; m++) months.push({year: startYear + 1, month: m});
    return months;
}

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [todayStr, setTodayStr] = useState<string>(() => displayDateStr());
    const [h2, setH2] = useState<string | null>(null);

    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [thisWeek, setThisWeek] = useState<ThisWeekSchedule[] | null>(null);
    const [calendar, setCalendar] = useState<CalendarCellData[] | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const [isVisible, setIsVisible] = useState(true);

    const handleCloseNotif = () => {
        setIsVisible(false);
    };

    const dateParam = searchParams.get('date');
    const viewedDateStr = dateParam && DATE_REGEX.test(dateParam) && !isNaN(Date.parse(dateParam))
        ? dateParam
        : todayStr;

    const isViewingToday = viewedDateStr === todayStr;

    const viewedDate = useMemo(() => formatDateStr(viewedDateStr), [viewedDateStr]);

    const viewedMonth = parseInt(viewedDateStr.split('-')[1], 10);

    const months = useMemo(() => schoolYearMonths(todayStr), [todayStr]);

    const [calendarMonthIndex, setCalendarMonthIndex] = useState<number>(() => {
        const idx = schoolYearMonths(displayDateStr()).findIndex(ym => ym.month === viewedMonth);
        return idx >= 0 ? idx : 0;
    });

    useEffect(() => {
        const idx = months.findIndex(ym => ym.month === viewedMonth);
        if (idx >= 0) setCalendarMonthIndex(idx);
    }, [viewedMonth, months]);

    const calendarMonth = months[calendarMonthIndex]?.month ?? viewedMonth;

    const weekDates = useMemo(() => {
        const base = new Date(`${viewedDateStr}T00:00:00Z`);
        base.setUTCDate(base.getUTCDate() + 2);
        const isoWeekday = base.getUTCDay() === 0 ? 7 : base.getUTCDay();
        base.setUTCDate(base.getUTCDate() - (isoWeekday - 1)); // Monday of that week
        return Array.from({length: 5}, (_, i) => {
            const d = new Date(base);
            d.setUTCDate(base.getUTCDate() + i);
            return toDateStr(d);
        });
    }, [viewedDateStr]);

    const handleSelectDate = (dateStr: string) => {
        if (dateStr === todayStr) {
            router.push('/', {scroll: false});
        } else {
            router.push(`/?date=${dateStr}`, {scroll: false});
        }
    };

    useEffect(() => {
        const update = () => setTodayStr(prev => {
            const next = displayDateStr();
            return next === prev ? prev : next;
        });

        const intervalId = setInterval(update, 30 * 1000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") update();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const scheduleResponse = await fetch(`${API_BASE}/schedule/${viewedDateStr}`);
                if (!scheduleResponse.ok) {
                    throw new Error(`HTTP error! status: ${scheduleResponse.status}`);
                }

                const scheduleData: Schedule = await scheduleResponse.json();

                if (scheduleData.noSchool) {
                    setH2(scheduleData.reason && scheduleData.reason !== 'NO_SCHEDULE_DATA' ? `No School: ${scheduleData.reason}` : "No School");
                    setSchedule(scheduleData);
                } else {
                    setH2(scheduleData.h2 ?? null);
                    setSchedule(scheduleData);
                }
                setServerError(null);
            } catch (error) {
                console.error("Error fetching schedule:", error);
                setServerError(
                    error instanceof TypeError
                        ? "Can't reach the DHS Cycle server. It may be down, or you may be offline."
                        : "The DHS Cycle server returned an error while loading the schedule."
                );
            }
        };

        fetchSchedule();
    }, [viewedDateStr]);

    useEffect(() => {
        const fetchThisWeek = async () => {
            try {
                const thisWeekResponse = await fetch(`${API_BASE}/thisWeek/${viewedDateStr}`);
                if (!thisWeekResponse.ok) {
                    throw new Error(`HTTP error! status: ${thisWeekResponse.status}`);
                }

                const thisWeekData: ThisWeekSchedule[] = await thisWeekResponse.json();
                setThisWeek(thisWeekData);
            } catch (error) {
                console.error("Error fetching this week schedule:", error);
            }
        };

        fetchThisWeek();
    }, [viewedDateStr]);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const calendarResponse = await fetch(`${API_BASE}/calendar/${calendarMonth}`);
                if (!calendarResponse.ok) {
                    throw new Error(`HTTP error! status: ${calendarResponse.status}`);
                }

                const calendarData: CalendarCellData[] = (await calendarResponse.json()).map((item: any) => {
                    return {
                        ...item,
                        date: new Date(Date.UTC(
                            parseInt(item.date.split("-")[0], 10), //Y
                            parseInt(item.date.split("-")[1], 10) - 1, //M
                            parseInt(item.date.split("-")[2], 10) //D
                        )),
                    };
                });

                setCalendar(calendarData);
            } catch (error) {
                console.error("Error fetching calendar:", error);
            }
        };

        fetchCalendar();
    }, [calendarMonth]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {/* isVisible && <NotifBox title={"New functionality"} message={"You can now select dates on the calendar or the \"This Week's Schedule\" table to view schedules in the future."} onClose={handleCloseNotif}/> */}
                <Heading
                    date={viewedDate}
                    h2={h2}
                    isToday={isViewingToday}
                    onBackToToday={() => handleSelectDate(todayStr)}
                ></Heading>
                {serverError && <NotifBox title={"Schedule Unavailable"} message={serverError}/>}
                <MessageBox apiBase={API_BASE}/>
                <div style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {schedule && !schedule.noSchool && <Table schedule={schedule} showTimer={isViewingToday} />}
                    {!serverError && thisWeek && <ThisWeek
                        schedule={thisWeek}
                        weekDates={weekDates}
                        todayDate={todayStr}
                        selectedDate={viewedDateStr}
                        onSelectDate={handleSelectDate}
                    />}
                </div>
                {!serverError && calendar && <div style={{overflowX: "auto", width: "100%"}}>
                    <Calendar
                        cells={calendar}
                        todayDate={todayStr}
                        selectedDate={viewedDateStr}
                        onCellClick={(date) => handleSelectDate(toDateStr(date))}
                        months={months}
                        monthIndex={calendarMonthIndex}
                        onMonthChange={setCalendarMonthIndex}
                    />
                </div>}
            </main>
            <footer style={{textAlign: "center", padding: "10px", marginTop: "20px", backgroundColor: "var(--dhsCycleBorder)" }}>
                <p>&copy; {new Date().getFullYear()} Mack Navickas/<a href={"https://greatlakes.software"} style={{color: "#29abe2"}}>GLS</a> | <a href={"https://github.com/navickasm/dhscycle/issues"}>Issue Tracker</a> | <a href={"/colorEditor"}>Color Editor</a> | <a href={"/privacy"}>Privacy</a></p>
            </footer>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense>
            <HomeContent/>
        </Suspense>
    );
}
