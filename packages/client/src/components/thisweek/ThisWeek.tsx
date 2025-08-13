import styles from "../schedule.module.css";

export interface ThisWeekSchedule { day: string; scheduleName: string }

interface ThisWeekProps {
    schedule: ThisWeekSchedule[];
}

export default function ThisWeek(p: ThisWeekProps) {
    return (
        <>
            <table>
                <thead>
                <tr>
                    <td colSpan={2}>This Week's Schedule</td>
                </tr>
                </thead>
                <tbody>
                {p.schedule.map((entry, index) => (
                    <tr key={index}>
                        <td>{entry.day}</td>
                        <td>{entry.scheduleName}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
}