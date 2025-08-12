export type TimeBlock = {
    period: Period;
    start: string;
    end: string;
};

export type LunchBlock = {
    lunchBlock: true;
    type: "normal" | "friday";
    periods: Array<TimeBlock>;
    lunches: Array<TimeBlock>;
}

// These codes are the standard codes for each period, to be used when coding periods and creating a schedule.
export enum Period {
    EB = "EB",
    ONE = "1",
    TWO = "2",
    THREE = "3",
    FOUR_A = "4A",
    FOUR_B = "4B",
    FIVE_A = "5A",
    FIVE_B = "5B",
    SIX = "6",
    SIX_A = "6A",
    SIX_B = "6B",
    SEVEN = "7",
    EIGHT = "8",
    HR = "HR",
    SC = "SC",
    L1 = "L1",
    L2 = "L2",
    L3 = "L3",
    LA = "LA",
    LB = "LB",
    LC = "LC",
    PEP = "PEP",
}

export type Schedule = {
    name: string | null;
    h2: string | null;
    times: Array< TimeBlock | LunchBlock>;
    noSchool?: true;
    reason?: string;
};