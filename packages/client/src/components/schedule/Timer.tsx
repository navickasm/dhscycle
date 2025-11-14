import React, { useState, useEffect } from 'react';

interface TimerProps {
    start: string;
    end: string;
}

const Timer: React.FC<TimerProps> = ({ start, end }) => {
    const [background, setBackground] = useState<string>('rgb(255, 255, 255)');
    const [remainingTime, setRemainingTime] = useState<string>("");

    // TODO make this work for CT, make <title> state-aware for efficiency
    useEffect(() => {
        const updateProgress = () => {
            const now = new Date();
            const [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);

            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes, 0);
            const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes, 0);

            const totalDuration = endTime.getTime() - startTime.getTime();
            const elapsedDuration = now.getTime() - startTime.getTime();

            const progressPercentage = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

            const periodTime = Math.ceil(totalDuration / (1000 * 60))

            if (progressPercentage >= 100 || progressPercentage <= 0) {
                const minutesUntilStart = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60));
                if (now < startTime && minutesUntilStart <= 30) {
                    setRemainingTime(`${periodTime} mins (${minutesUntilStart} mins until start)`);
                } else {
                    setRemainingTime(`${periodTime} mins`);
                }
                setBackground("--var(bg)");
            } else {
                setBackground(`linear-gradient(to bottom, var(--main) ${progressPercentage}%, var(--light) ${progressPercentage}%)`);
                setRemainingTime(`${periodTime} mins (${Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60))} mins left)`);
            }
        };
        
        const intervalId = setInterval(updateProgress, 1000);;
        
        const startTimer = () => {
            updateProgress();
            intervalId = setInterval(updateProgress, 1000); // Update every second
        };

        const stopTimer = () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

        const handleVisbilityChange = () => {
            if (document.visibilityState === "visible") {
                stopTimer();
                startTimer();
            } else {
                stopTimer();
            }
        };

        startTimer();

        document.addEventListener("visibilitychange", handeVisibilityChange);
       
        return () => {
            stopTimer();
            document.removeEventListener("visiblitychange", handleVisibilityChange);
        }
    }, [start, end]);

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: background,
                zIndex: 0,
                transition: 'background 0.5s ease-out',
            }} title={ remainingTime }
        />
    );
};

export default Timer;
