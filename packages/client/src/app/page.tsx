'use client';

import styles from "./page.module.css";
import Heading from "../components/Heading.tsx";
import {Suspense, useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Schedule} from "../schedule.ts";
import Table from "../components/schedule/Table.tsx";
import ThisWeek, {ThisWeekSchedule} from "../components/thisweek/ThisWeek.tsx";
import NotifBox from "../components/NotifBox.tsx";
import Calendar from "../components/calendar/Calendar.tsx";
import {CalendarCellProps} from "../components/calendar/CalendarCell.tsx";

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://api.dhscycle.com';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [today, setToday] = useState<Date>(new Date());
    const [h2, setH2] = useState<string | null>(null);

    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [thisWeek, setThisWeek] = useState<ThisWeekSchedule[] | null>(null);
    const [calendar, setCalendar] = useState<CalendarCellProps[]>([]);

    const [isVisible, setIsVisible] = useState(true);

    const handleCloseNotif = () => {
        setIsVisible(false);
    };

    const todayStr = toDateStr(today);

    const dateParam = searchParams.get('date');
    const viewedDateStr = dateParam && DATE_REGEX.test(dateParam) && !isNaN(Date.parse(dateParam))
        ? dateParam
        : todayStr;

    const isViewingToday = viewedDateStr === todayStr;

    // Review for timezones
    const viewedDate = useMemo(() => new Date(`${viewedDateStr}T12:00:00`), [viewedDateStr]);

    const viewedMonth = parseInt(viewedDateStr.split('-')[1], 10);

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
        const updateDateToCurrent = () => {
            setToday(new Date());
        };

        const setMidnightUpdate = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setDate(now.getDate() + 1);
            midnight.setHours(0, 0, 0, 0);

            const timeUntilMidnight = midnight.getTime() - now.getTime();

            const timeout = setTimeout(() => {
                updateDateToCurrent();
                const interval = setInterval(updateDateToCurrent, 1000 * 60 * 60 * 24);
                return () => clearInterval(interval);
            }, timeUntilMidnight);

            return () => clearTimeout(timeout);
        };

        const cleanup = setMidnightUpdate();
        return cleanup;
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
            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        fetchSchedule();
    }, [viewedDateStr]);

    useEffect(() => {
        const fetchThisWeek = async () => {
            try {
                const thisWeekResponse = await fetch(
                    isViewingToday ? `${API_BASE}/thisWeek` : `${API_BASE}/thisWeek/${viewedDateStr}`
                );
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
    }, [viewedDateStr, isViewingToday]);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const calendarResponse = await fetch(`${API_BASE}/calendar/${viewedMonth}`);
                if (!calendarResponse.ok) {
                    throw new Error(`HTTP error! status: ${calendarResponse.status}`);
                }

                const calendarData: CalendarCellProps[] = (await calendarResponse.json()).map((item: any) => {
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
    }, [viewedMonth]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {/*{isVisible && <NotifBox title={"Welcome back!"} message={"This site, DHS Cycle, was rewritten over the summer to better support students with the new bell schedule. As such, some features (like the color editor) may be temporarily disabled. They will return soon alongside more advanced features!"} onClose={handleCloseNotif}/>}*/}
                <Heading
                    date={viewedDate}
                    h2={h2}
                    isToday={isViewingToday}
                    onBackToToday={() => handleSelectDate(todayStr)}
                ></Heading>
                <div style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {schedule && !schedule.noSchool && <Table schedule={schedule} showTimer={isViewingToday} />}
                    <ThisWeek
                        schedule={thisWeek || []}
                        weekDates={weekDates}
                        todayDate={todayStr}
                        selectedDate={viewedDateStr}
                        onSelectDate={handleSelectDate}
                    />
                </div>
                <div style={{overflowX: "auto", width: "100%"}}>
                    <Calendar
                        cells={calendar.map(cell => ({
                            ...cell,
                            isToday: toDateStr(cell.date) === todayStr,
                            isSelected: toDateStr(cell.date) === viewedDateStr,
                        }))}
                        onSelectDate={handleSelectDate}
                    />
                </div>
            </main>
            <footer style={{textAlign: "center", padding: "10px", marginTop: "20px", backgroundColor: "#f0f0f0" }}>
                <p>&copy; {new Date().getFullYear()} Mack Navickas/<a href={"https://greatlakes.software"} style={{color: "#29abe2"}}>GLS</a>. Work in Progress &mdash; <a href={"https://github.com/navickasm/dhscycle/issues"}>Issue Tracker</a></p>
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
