'use client';

import styles from "./page.module.css";
import Heading from "../components/Heading.tsx";
import {useEffect, useState} from "react";
import {Schedule} from "../schedule.ts";
import Table from "../components/schedule/Table.tsx";
import ThisWeek, {ThisWeekSchedule} from "../components/thisweek/ThisWeek.tsx";
import NotifBox from "../components/NotifBox.tsx";
import Calendar from "../components/calendar/Calendar.tsx";
import {CalendarCellProps} from "../components/calendar/CalendarCell.tsx";

export default function Home() {
    const [date, setDate] = useState<Date>(new Date());
    const [h2, setH2] = useState<string | null>(null);

    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [thisWeek, setThisWeek] = useState<ThisWeekSchedule[] | null>(null);
    const [calendar, setCalendar] = useState<CalendarCellProps[]>([]);

    const [isVisible, setIsVisible] = useState(true);

    const handleCloseNotif = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        const updateDateToCurrent = () => {
            setDate(new Date());
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
                const scheduleResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://api.dhscycle.com'}/schedule/${date.toISOString().split('T')[0]}`);
                if (!scheduleResponse.ok) {
                    throw new Error(`HTTP error! status: ${scheduleResponse.status}`);
                }

                const scheduleData: Schedule = await scheduleResponse.json();

                if (scheduleData.noSchool) {
                    setH2(scheduleData.reason && scheduleData.reason !== 'NO_SCHEDULE_DATA' ? `No School: ${scheduleData.reason}` : "No School");
                    setSchedule(scheduleData);
                } else {
                    if (scheduleData.h2) {
                        setH2(scheduleData.h2);
                    }

                    setSchedule(scheduleData);
                }
            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        const fetchThisWeek = async () => {
            try {
                const thisWeekResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://api.dhscycle.com'}/thisWeek`);
                if (!thisWeekResponse.ok) {
                    throw new Error(`HTTP error! status: ${thisWeekResponse.status}`);
                }

                const thisWeekData: ThisWeekSchedule[] = await thisWeekResponse.json();
                setThisWeek(thisWeekData);
            } catch (error) {
                console.error("Error fetching this week schedule:", error);
            }
        };

        const fetchCalendar = async () => {
            try {
                const calendarResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://api.dhscycle.com'}/calendar/${date.getMonth() + 1}`);
                if (!calendarResponse.ok) {
                    throw new Error(`HTTP error! status: ${calendarResponse.status}`);
                }

                const calendarData: CalendarCellProps[] = (await calendarResponse.json()).map((item: any) => {
                    const isHighlighted = item.date === date.toISOString().split('T')[0];
                    return {
                        ...item,
                        date: new Date(Date.UTC(
                            parseInt(item.date.split("-")[0], 10), //Y
                            parseInt(item.date.split("-")[1], 10) - 1, //M
                            parseInt(item.date.split("-")[2], 10) //D
                        )),
                        highlighted: isHighlighted,
                    };
                });

                setCalendar(calendarData);
            } catch (error) {
                console.error("Error fetching calendar:", error);
            }
        };

        fetchSchedule();
        fetchThisWeek();
        fetchCalendar();
    }, [date]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {/*{isVisible && <NotifBox title={"Welcome back!"} message={"This site, DHS Cycle, was rewritten over the summer to better support students with the new bell schedule. As such, some features (like the color editor) may be temporarily disabled. They will return soon alongside more advanced features!"} onClose={handleCloseNotif}/>}*/}
                <Heading date={date} h2={h2}></Heading>
                <div style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {schedule && !schedule.noSchool && <Table schedule={schedule} />}
                    <ThisWeek schedule={thisWeek || []}/>
                </div>
                <div style={{overflowX: "auto", width: "100%"}}>
                    <Calendar cells={calendar}/>
                </div>
            </main>
            <footer style={{textAlign: "center", padding: "10px", marginTop: "20px", backgroundColor: "#f0f0f0" }}>
                <p>&copy; {new Date().getFullYear()} Mack Navickas/<a href={"https://greatlakes.software"} style={{color: "#29abe2"}}>GLS</a>. Work in Progress &mdash; <a href={"https://github.com/navickasm/dhscycle/issues"}>Issue Tracker</a></p>
            </footer>
        </div>
    );
}
