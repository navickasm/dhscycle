'use client';

import styles from "./page.module.css";
import Heading from "../components/Heading.tsx";
import {useEffect, useState} from "react";
import {Schedule} from "../schedule.ts";
import Table from "../components/schedule/Table.tsx";
import ThisWeek, {ThisWeekSchedule} from "../components/thisweek/ThisWeek.tsx";
import NotifBox from "../components/NotifBox.tsx";

export default function Home() {
    const [date, setDate] = useState<Date>(new Date());
    const [h2, setH2] = useState<string | null>(null);

    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [thisWeek, setThisWeek] = useState<ThisWeekSchedule[] | null>(null);

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
                const scheduleResponse = await fetch(`https://api.dhscycle.com/schedule/${date.toISOString().split('T')[0]}`); // Format date for URL
                if (!scheduleResponse.ok) {
                    throw new Error(`HTTP error! status: ${scheduleResponse.status}`);
                }

                const scheduleData: Schedule = await scheduleResponse.json();

                console.log(scheduleData)

                if (scheduleData.noSchool) {
                    setH2(scheduleData.reason && scheduleData.reason !== 'NO_SCHEDULE_DATA' ? `No School: ${scheduleData.reason}` : "No School");
                    setSchedule(scheduleData);
                    return;
                }

                if (scheduleData.h2) {
                    setH2(scheduleData.h2);
                }

                setSchedule(scheduleData);

                const thisWeekResponse = await fetch(`https://api.dhscycle.com/thisWeek`);
                if (!thisWeekResponse.ok) {
                    throw new Error(`HTTP error! status: ${thisWeekResponse.status}`);
                }

                const thisWeekData: ThisWeekSchedule[] = await thisWeekResponse.json();

                setThisWeek(thisWeekData);

            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        fetchSchedule();
    }, [date]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {isVisible && <NotifBox title={"Welcome back!"} message={"This site, DHS Cycle, was rewritten over the summer to better support students with the new bell schedule. As such, some features (like the color editor) may be temporarily disabled. They will return soon alongside more advanced features!"} onClose={handleCloseNotif}/>}
                <Heading date={date} h2={h2}></Heading>
                <div style={{display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {schedule && <Table schedule={schedule} />}
                    <ThisWeek schedule={thisWeek || []}/>
                </div>
            </main>
        </div>
    );
}
