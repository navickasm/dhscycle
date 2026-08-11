import React, { useState, useEffect, useRef } from 'react';
import { centralSecondsOfDay } from '../../centralTime.ts';

interface TimerProps {
    start: string;
    end: string;
}

const Timer: React.FC<TimerProps> = ({ start, end }) => {
    const [background, setBackground] = useState<string>('rgb(255, 255, 255)');
    const [remainingTime, setRemainingTime] = useState<string>("");
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const td = overlayRef.current?.closest('td');
        if (td) td.title = remainingTime;
    }, [remainingTime]);

    // TODO make this work for CT, make <title> state-aware for efficiency
    useEffect(() => {
        const updateProgress = () => {
            const nowSecs = centralSecondsOfDay();
            const [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);

            const startSecs = startHours * 3600 + startMinutes * 60;
            const endSecs = endHours * 3600 + endMinutes * 60;

            const totalDuration = endSecs - startSecs;
            const elapsedDuration = nowSecs - startSecs;

            const progressPercentage = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

            const periodTime = Math.ceil(totalDuration / 60)

            if (progressPercentage >= 100 || progressPercentage <= 0) {
                const minutesUntilStart = Math.ceil((startSecs - nowSecs) / 60);
                if (nowSecs < startSecs && minutesUntilStart <= 30) {
                    setRemainingTime(`${periodTime} mins (${minutesUntilStart} mins until start)`);
                } else {
                    setRemainingTime(`${periodTime} mins`);
                }
                setBackground("var(--bg)");
            } else {
                setBackground(`linear-gradient(to bottom, var(--main) ${progressPercentage}%, var(--light) ${progressPercentage}%)`);
                setRemainingTime(`${periodTime} mins (${Math.ceil((endSecs - nowSecs) / 60)} mins left)`);
            }
        };
        
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const stopTimer = () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        const startTimer = () => {
            stopTimer(); // never allow two concurrent intervals
            updateProgress();
            intervalId = setInterval(updateProgress, 1000); // Update every second
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                stopTimer();
                startTimer();
            } else {
                stopTimer();
            }
        };

        startTimer();

        document.addEventListener("visibilitychange", handleVisibilityChange);
       
        return () => {
            stopTimer();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    }, [start, end]);

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: background,
                zIndex: 0,
                transition: 'background 0.5s ease-out',
            }}
        />
    );
};

export default Timer;
