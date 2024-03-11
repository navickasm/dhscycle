var SpecialSchedule = {
  enable: false,
  dowOverride: 0,
  times: ["7:15", "8:05", "8:10", "9:00", null, null, "9:05", "9:55", "10:00", "10:48", "10:53", "11:42", "11:33", "12:22", "12:27", "13:17", "13:22", "14:12", null, null, "10:18", "10:48", "10:53", "11:28", "11:22", "11:52", "11:47", "12:23"],
  nums: ["EB", "1", null, "2", "5", "6-I", "6-II", "9", "8", null],
  cycleName: "",
  h2: "",
  link: ""
};
window.SpecialSchedule = SpecialSchedule;

var finalSchedule = {
  examDates: [
    "Dec 18 2023",
    "Dec 19 2023",
    "Dec 20 2023"
  ],
  examTimes: [
    "8:10",
    "9:25",
    "10:40",
    "11:55",
    "13:10",
    "14:25"
  ],
  periodSchedule: [1, 2, 3, 4, 5, 6, 7, 8, 9] // 9 == Make up
}

var scheduleData = [
  {
    "startDate": "2023-09-04",
    "endDate": "2023-09-08",
    "weekSchedules": [
      10,
      2,
      3,
      {
        "times": [
          "7:15",
          "8:05",
          "8:10",
          "9:00",
          null,
          null,
          "9:05",
          "9:55",
          "10:00",
          "10:48",
          "10:53",
          "11:42",
          "11:33",
          "12:22",
          "12:27",
          "13:17",
          "13:22",
          "14:12",
          null,
          null,
          "10:18",
          "10:48",
          "10:53",
          "11:28",
          "11:22",
          "11:52",
          "11:47",
          "12:22"
        ],
        "nums": [
          "EB",
          "1",
          null,
          "2",
          "5",
          "6-I",
          "6-II",
          "7",
          "8",
          null
        ],
        "cycleName": "Cycle 34<br/>No HR | Early Release",
        "h2": "Open House",
        "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/September%207%202023%20Open%20House.pdf",
        "base": 4
      },
      {
        "times": [
          "8:10",
          "9:00",
          "9:05",
          "9:56",
          null,
          null,
          "10:01",
          "10:52",
          "10:57",
          "11:47",
          "11:52",
          "12:42",
          "12:32",
          "13:22",
          "13:27",
          "14:18",
          "14:23",
          "15:14",
          null,
          null,
          "10:57",
          "11:27",
          "11:52",
          "12:27",
          "12:20",
          "12:50",
          "12:47",
          "13:22"
        ],
        "nums": [
          "EB",
          "3",
          null,
          "4",
          "5",
          "6-I",
          "6-II",
          "7",
          "8",
          null
        ],
        "cycleName": "Cycle 12<br/>No HR | Late Start",
        "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/September%208%202023%20Late%20Start%20on%20Cycle%2012%20No%20HR.pdf"
      }
    ]
  },
  {
    "startDate": "2023-09-18",
    "endDate": "2023-09-22",
    "weekSchedules": [
      1,
      2,
      3,
      {
        "times": [
          "7:15",
          "8:05",
          "8:10",
          "9:02",
          "9:07",
          "9:52",
          "9:57",
          "10:49",
          "10:54",
          "11:44",
          "11:49",
          "12:40",
          "12:29",
          "13:20",
          "13:25",
          "14:17",
          "14:23",
          "15:14",
          null,
          null,
          "11:14",
          "11:44",
          "11:49",
          "12:24",
          "12:20",
          "12:50",
          "12:45",
          "13:20"
        ],
        "nums": [
          "EB",
          "1",
          "HR",
          "2",
          "5",
          "6-I",
          "6-II",
          "7",
          "8",
          null
        ],
        "cycleName": "Cycle 34<br/>Extended HR",
        "h2": "Suicide Prevention Programs",
        "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/September%2021%202023%20Extended%20HR%20Suicide%20Prevention%20Programming.pdf"
      },
      5
    ]
  },
  {
    "startDate": "2023-10-02",
    "endDate": "2023-10-06",
    "weekSchedules": [1, 2, 3, 4,
      { "times": ["7:15", "8:05", "8:10", "8:58", "9:03", "10:08", "10:13", "11:01", "11:06", "11:54", "11:59", "12:47", "12:39", "13:27", "13:32", "14:20", "14:25", "15:14", null, null, "11:06", "11:36", "11:59", "12:34", "12:25", "12:55", "12:52", "13:27"], "nums": ["EB", "3", "HR", "4", "5", "6-I", "6-II", "7", "8", null], "cycleName": "Cycle 12<br>Extended HR", "h2": "Pep Rally", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/October%206%20Extended%20HR%20Pep%20Rally.pdf", "base": 0 }
    ]
  },
  {
    "startDate": "2023-10-23",
    "endDate": "2023-10-27",
    "weekSchedules": [1, 2, 3,
      { "times": ["7:15", "8:05", "8:10", "9:03", "9:08", "9:28", "9:33", "10:26", "10:31", "11:25", "11:30", "12:30", "12:18", "13:18", "13:23", "14:16", "14:21", "15:14", null, null, "10:50", "11:25", "11:30", "12:10", "12:10", "12:45", "12:38", "13:18"], "nums": ["EB", "1", "HR", "2", "5", "6-I", "6-II", "7", "8", null], "cycleName": "Cycle 34<br>Extended HR + Lunch", "h2": "School Chest Kick-Off", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/October%2026%202023%20School%20Chest%20Assembly.pdf", "base": 0 },
      5
    ]
  },
  {
    "startDate": "2023-11-06",
    "endDate": "2023-11-10",
    "weekSchedules": [2,3,4,5,10]
  },
  {
    "startDate": "2023-11-13",
    "endDate": "2023-11-15",
    "weekSchedules": [1,2,
      { "times": ["7:15", "8:05", "8:10", "9:02", "9:07", "9:52", "9:57", "10:49", "10:54", "11:44", "11:49", "12:40", "12:29", "13:20", "13:25", "14:17","14:22","15:14",null, null, "11:14","11:44","11:49","12:24","12:20","12:50","12:45","13:20"], "nums": ["EB", "1", "HR", "2", "3", "4-I", "4-II", "7", "8", null], "cycleName": "Cycle 56<br>Extended HR", "h2": "SO Class Career\nFR SOS Screening", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/November%2015%202023%20Extended%20HR%20Soph%20Career%20Program%20and%20FR%20SOS%20Screener%20SOS.pdf", "base": 0 }
      ,4,5]
  },
  {
    "startDate": "2023-11-20",
    "endDate": "2023-11-24",
    "weekSchedules": [1,
      {"times": ["9:00","9:09","9:14","9:49","9:54","10:29","10:34","11:09","11:14","11:49","11:54","12:29","12:34","13:09","13:14","13:49","13:54","14:34","14:39","15:14","11:14","11:44","11:54","12:24","12:15","12:45","12:34","13:09"],"nums":["EB","1","2","3","4","5-I","5-II","6","7","8"],"cycleName":"Cycle LS<br>+5 mins 7th","h2":"School Chest Final Announcement – 7th per.","link":"https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/November%2021%202023%20School%20Chest%20Ends.pdf","base":0}, 10, 10, 10]
  },
  {
    "startDate": "2023-11-27",
    "endDate": "2023-12-01",
    "weekSchedules": [1,2,
      { "times": ["7:15", "8:05", "8:10", "9:02", "9:07", "9:52", "9:57", "10:49", "10:54", "11:44", "11:49", "12:40", "12:29", "13:20", "13:25", "14:17","14:22","15:14",null, null, "11:14","11:44","11:49","12:24","12:20","12:50","12:45","13:20"], "nums": ["EB", "1", "HR", "2", "3", "4-I", "4-II", "7", "8", null], "cycleName": "Cycle 56<br>Extended HR", "h2": "Junior Post-Secondary Meeting", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/November%2029%202023%20Extended%20HR%20Jr%20Class%20Postsecondary.pdf", "base": 0 }
      ,4,5]
  },
  {
    "startDate": "2024-01-08",
    "endDate": "2024-01-12",
    "weekSchedules": [1,2,
      { "times": ["7:15", "8:05", "8:10", "9:02", "9:07", "9:52", "9:57", "10:49", "10:54", "11:44", "11:49", "12:40", "12:29", "13:20", "13:25", "14:17","14:22","15:14",null, null, "11:14","11:44","11:49","12:24","12:20","12:50","12:45","13:20"], "nums": ["EB", "1", "HR", "2", "3", "4-I", "4-II", "7", "8", null], "cycleName": "Cycle 56<br>Extended HR", "h2": "JR Pre-Registration &\nSR Post-Secondary Meetings", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/January%2010%202024%20Extended%20HR%20Junior%20Pre%20Registration%20and%20Sr%20Class%20Postsecondary.pdf", "base": 0 },
      { "times": ["7:15", "8:05", "8:10", "9:02", "9:07", "9:52", "9:57", "10:49", "10:54", "11:44", "11:49", "12:40", "12:29", "13:20", "13:25", "14:17","14:22","15:14",null, null, "11:14","11:44","11:49","12:24","12:20","12:50","12:45","13:20"], "nums": ["EB", "1", "HR", "2", "5", "6-I", "6-II", "7", "8", null], "cycleName": "Cycle 34<br>Extended HR", "h2": "SO Pre-Registration Meeting", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/January%2011%202024%20Extended%20HR%20Soph%20Pre-registration%20meetings.pdf", "base": 0 }
      ,5]
  },
  {
    "startDate": "2024-01-15",
    "endDate": "2024-01-19",
    "weekSchedules": [10,2,3,
      { "times": ["7:15", "8:05",null, null, "8:10", "9:00", "9:05", "9:55", "10:00", "10:50", "10:55", "11:45", "11:34", "12:24", "12:29", "13:19", "13:29", "14:19","14:24","15:14", "10:20","10:50","10:55","11:29","11:26","11:56","11:50","12:24"], "nums": ["EB", null, "1", "2", "5", "6-I", "6-II", "7A", "7B", "8"], "cycleName": "Cycle 34<br>p.7 Split Assembly", "h2": "Fine Arts Assembly", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/January%2018%202024%20Fine%20Arts%20Assembly.pdf", "base": 0 }
      ,5]
  },
  {
    "startDate": "2024-02-12",
    "endDate": "2024-02-16",
    "weekSchedules": [2,3,4,5,10]
  },
  {
    "startDate": "2024-03-03",
    "endDate": "2024-03-07",
    "weekSchedules": [1,
      { "times": ["7:15", "8:05", "8:10", "9:02", "9:07", "9:52", "9:57", "10:49", "10:54", "11:44", "11:49", "12:40", "12:29", "13:20", "13:25", "14:17","14:22","15:14",null, null, "11:14","11:44","11:49","12:24","12:20","12:50","12:45","13:20"], "nums": ["EB", "1", "HR", "2", "3", "4-I", "4-II", "5", "6", null], "cycleName": "Cycle 78<br>Extended HR", "h2": "Illinois Youth Survey", "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/March%205%202024%20Extended%20HR%20Illinois%20Youth%20Survey.pdf", "base": 0 },
    3, 4, 5]
  },
  {
    "startDate": "2024-03-10",
    "endDate": "2024-03-14",
    "weekSchedules": [
      {
        "times": ["12:00", "13:00", "13:05","14:07", "14:12", "15:14", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        "nums": ["EB", "1", "2", null, null, null, null, null, null, null],
        "cycleName": "Cycle 78<br>Half Day A", "h2": "Illinois Science Assessment - Juniors",
        "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/March%2011%20%202024%20School%20Day%20ISA%20Testing%20Juniors%20and%20Half%20Day%20pm%20schedule.pdf",
        "base": 1
      },
      {
        "times": [null, null, null, null, "8:00", "9:55", "10:00", "10:26", "10:31", "11:28", "11:37", "12:34", "12:13", "13:10", "13:15", "14:12", "14:17", "15:14", null, null, "11:02", "11:32", "11:33", "12:08", "12:07", "12:37", "12:39", "1:10"],
        "nums": [null, null, "Test", "HR", "3", "4-I", "4-II", "5", "6", null],
        "cycleName": "Cycle 78<br>Half Day B + Ex. HR", "h2": "Illinois Science Assessment - Juniors",
        "link": "https://www.dist113.org/cms/lib/IL01904711/Centricity/Domain/217/March%2012%202024%20School%20Day%20ISA%20Testing%20Juniors%20cont%20and%20revised%20Cycle%2078.pdf",
        "base": 1
      },
      3,4,5
    ]
  }
];
