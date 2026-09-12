import type {
  CoursesMap,
  CourseListItem,
  CourseSection,
  Forum,
  CalendarEvents,
  MessageThread,
  Notification,
  ForumActivity,
  ForumPostData,
  ForumReplyData,
  OverviewEvent
} from '@/lib/types'

import { Reply, MessageSquare, Book } from 'lucide-react'

// ── Raw mock data defined inline ─────────────────────────────────────────────

const coursesJson = [
  {
    "id": 1,
    "title": "Digital Design og Kommunikation",
    "titleEn": "Digital Design and Communication",
    "code": "DD101",
    "label": "Modul 4",
    "labelEn": "Module 4",
    "professor": "Morten Jensen",
    "email": "mj@example.edu",
    "img": "/assets/img/grafik/billeder/Undervisning/_2WB0207.jpg",
    "semester": "Forår 2024",
    "campus": "Campus Aalborg",
    "nextAssignment": {
      "title": "Designskitse v1",
      "titleEn": "Design Sketch v1",
      "deadline": "Om 4 dage (Fredag kl. 12:00)",
      "deadlineEn": "In 4 days (Friday at 12:00)",
      "submissionId": "105"
    },
    "sections": [
      {
        "id": "s1",
        "title": "Kursusgang 1: Introduktion til Digital Design",
        "titleEn": "Session 1: Introduction to Digital Design",
        "date": "12. Feb 2026",
        "dateEn": "Feb 12, 2026",
        "description": "Denne gang skal vi introducere modulet, gennemgå pensum og se hinanden an. Du skal se velkomstvideoen og hente kursusbeskrivelsen.",
        "descriptionEn": "This session we will introduce the module, review the syllabus, and get started. You should watch the welcome video and download the course description.",
        "themes": ["Introduktion til faget", "Gennemgang af pensum og rammer", "Introduktion til digital design og dets historie"],
        "themesEn": ["Introduction to the course", "Syllabus and framework walkthrough", "Introduction to digital design and its history"],
        "goals": ["Forstå kursets opbygning og eksamensform", "Kende forskellen på digitalt design og traditionelt design", "Etablere projektgrupper"],
        "goalsEn": ["Understand course structure and exam format", "Know the difference between digital design and traditional design", "Establish project groups"],
        "items": [
          { "id": 101, "type": "pdf", "title": "Kursusbeskrivelse og pensum", "titleEn": "Course Description and Syllabus", "size": "1.2 MB", "litType": "primary" },
          { "id": 102, "type": "video", "title": "Velkomstvideo fra underviser", "titleEn": "Welcome Video from Instructor", "duration": "5:30" },
          { "id": 103, "type": "link", "title": "Link til ekstern læringsressource", "titleEn": "Link to external learning resource", "litType": "secondary" }
        ]
      },
      {
        "id": "s2",
        "title": "Kursusgang 2: Brugercentreret Design",
        "titleEn": "Session 2: User-Centered Design",
        "date": "19. Feb 2026",
        "dateEn": "Feb 19, 2026",
        "description": "I denne uge fokuserer vi på brugercentrerede metoder. Vi gennemgår slides om designprocesser og du skal aflevere din første designskitse.",
        "descriptionEn": "This week we focus on user-centered methods. We will review slides on design processes and you need to submit your first design sketch.",
        "themes": ["Brugercentreret designproces (UCD)", "Double Diamond-modellen", "Prototyping og skitsering"],
        "themesEn": ["User-Centered Design (UCD) process", "Double Diamond model", "Prototyping and sketching"],
        "goals": ["Kunne anvende Double Diamond til designudfordringer", "Udføre simple brugertests af skitser", "Aflevere den første designskitse"],
        "goalsEn": ["Be able to apply Double Diamond to design challenges", "Perform simple user tests of sketches", "Submit the first design sketch"],
        "items": [
          { "id": 104, "type": "pdf", "title": "Slides: Designprocesser", "titleEn": "Slides: Design Processes", "size": "4.5 MB", "litType": "secondary" },
          { "id": 105, "type": "assignment", "title": "Aflevering: Designskitse", "titleEn": "Assignment: Design Sketch", "deadline": "Fredag kl. 12:00" }
        ]
      }
    ]
  },
  {
    "id": 2,
    "title": "Webudvikling og CMS",
    "titleEn": "Web Development and CMS",
    "code": "WEB202",
    "label": "Modul 2",
    "labelEn": "Module 2",
    "professor": "Lise Sørensen",
    "email": "ls@example.edu",
    "img": "/assets/img/grafik/billeder/Forskning/_DSC0400.jpg",
    "semester": "Forår 2024",
    "campus": "Campus Aalborg",
    "nextAssignment": {
      "title": "To-Do App",
      "titleEn": "To-Do App",
      "deadline": "Om 2 dage (Mandag kl. 09:00)",
      "deadlineEn": "In 2 days (Monday at 09:00)",
      "submissionId": "204"
    },
    "sections": [
      {
        "id": "w1",
        "title": "Kursusgang 1: HTML & CSS Fundamentals",
        "titleEn": "Session 1: HTML & CSS Fundamentals",
        "date": "15. Mar 2026",
        "dateEn": "Mar 15, 2026",
        "description": "Denne forelæsning dækker grundlæggende semantisk HTML. Vi ser på hvorfor semantik er vigtigt for SEO og webtilgængelighed (a11y), samt ser en introduktion til Flexbox.",
        "descriptionEn": "This lecture covers basic semantic HTML. We look at why semantics are important for SEO and web accessibility (a11y), and view an introduction to Flexbox.",
        "themes": ["Semantisk HTML5", "CSS Flexbox og CSS Grid", "Responsive designprincipper"],
        "themesEn": ["Semantic HTML5", "CSS Flexbox and CSS Grid", "Responsive design principles"],
        "goals": ["Strukturere websider semantisk", "Opbygge komplekse layouts uden frameworks", "Sikre mobilvenlighed"],
        "goalsEn": ["Structure web pages semantically", "Build complex layouts without frameworks", "Ensure mobile responsiveness"],
        "items": [
          { "id": 201, "type": "pdf", "title": "Guide: Semantisk HTML", "titleEn": "Guide: Semantic HTML", "size": "0.8 MB", "litType": "primary" },
          { "id": 202, "type": "video", "title": "CSS Flexbox & Grid Masterclass", "titleEn": "CSS Flexbox & Grid Masterclass", "duration": "45:00" }
        ]
      },
      {
        "id": "w2",
        "title": "Kursusgang 2: React & State Management",
        "titleEn": "Session 2: React & State Management",
        "date": "22. Mar 2026",
        "dateEn": "Mar 22, 2026",
        "description": "Vi tager fat på React, komponenter, props og lokal state. Du skal bygge en To-Do app som din ugentlige afleveringsopgave.",
        "descriptionEn": "We tackle React, components, props, and local state. You will build a To-Do app as your weekly assignment.",
        "themes": ["React komponenter og props", "State og hooks (useState, useEffect)", "Komponentdrevet udvikling"],
        "themesEn": ["React components and props", "State and hooks (useState, useEffect)", "Component-driven development"],
        "goals": ["Oprette funktionelle React-komponenter", "Styre applikationens tilstand", "Bygge en interaktiv To-Do App"],
        "goalsEn": ["Create functional React components", "Manage application state", "Build an interactive To-Do App"],
        "items": [
          { "id": 203, "type": "link", "title": "React Documentation (Official)", "titleEn": "React Documentation (Official)", "litType": "primary" },
          { "id": 204, "type": "assignment", "title": "Projekt: Byg en To-Do App", "titleEn": "Project: Build a To-Do App", "deadline": "Mandag kl. 09:00" }
        ]
      }
    ]
  },
  {
    "id": 3,
    "title": "Videnskabsteori",
    "titleEn": "Philosophy of Science",
    "code": "VT303",
    "label": "Modul 1",
    "labelEn": "Module 1",
    "professor": "Anders Nielsen",
    "email": "an@hum.aau.dk",
    "img": "/assets/img/grafik/billeder/Bygninger og campus/_2WB3689.jpg",
    "semester": "Forår 2024",
    "campus": "Campus Aalborg",
    "nextAssignment": {
      "title": "Analyseopgave",
      "titleEn": "Analysis Assignment",
      "deadline": "Om 7 dage (Onsdag kl. 12:00)",
      "deadlineEn": "In 7 days (Wednesday at 12:00)",
      "submissionId": "303"
    },
    "sections": [
      {
        "id": "v1",
        "title": "Kursusgang 1: Introduktion til Videnskabsteori",
        "titleEn": "Session 1: Introduction to Philosophy of Science",
        "date": "05. Apr 2026",
        "dateEn": "Apr 05, 2026",
        "description": "Introduktion til de videnskabsteoretiske retninger. Vi diskuterer Thomas Kuhns paradigmeteorier og Karl Poppers falsifikationsbegreb.",
        "descriptionEn": "Introduction to philosophical directions. We discuss Thomas Kuhn's paradigm theories and Karl Popper's concept of falsification.",
        "themes": ["Kuhns paradigmeteori og videnskabelige revolutioner", "Poppers falsifikationskriterium og kritisk rationalisme"],
        "themesEn": ["Kuhn's paradigm theory and scientific revolutions", "Popper's falsification criterion and critical rationalism"],
        "goals": ["Skelne mellem Poppers og Kuhns videnskabsforståelse", "Reflektere over videnskabelig sandhed og fremskridt"],
        "goalsEn": ["Distinguish between Popper's and Kuhn's understanding of science", "Reflect on scientific truth and progress"],
        "items": [
          { "id": 301, "type": "pdf", "title": "Kuhn: Videnskabelige revolutioner", "titleEn": "Kuhn: Scientific Revolutions", "size": "3.2 MB", "litType": "primary" },
          { "id": 302, "type": "pdf", "title": "Popper: Falsifikationisme", "titleEn": "Popper: Falsificationism", "size": "2.8 MB", "litType": "secondary" }
        ]
      },
      {
        "id": "v2",
        "title": "Kursusgang 2: Videnskabelige Metoder",
        "titleEn": "Session 2: Scientific Methods",
        "date": "12. Apr 2026",
        "dateEn": "Apr 12, 2026",
        "description": "Kvalitativ vs kvantitativ metode. Gennemgang af dataindsamlingsmetoder og forelæsning om videnskabelig praksis.",
        "descriptionEn": "Qualitative vs quantitative method. Review of data collection methods and lecture on scientific practice.",
        "themes": ["Kvalitative vs. kvantitative metoder", "Dataindsamlingsteknikker (interviews, spørgeskemaer)", "Metodetriangulering"],
        "themesEn": ["Qualitative vs. quantitative methods", "Data collection techniques (interviews, surveys)", "Method triangulation"],
        "goals": ["Vælge den rette videnskabelige metode til et givet problem", "Kende fordele og ulemper ved kvalitative interviews"],
        "goalsEn": ["Choose the right scientific method for a given problem", "Know the pros and cons of qualitative interviews"],
        "items": [
          { "id": 303, "type": "video", "title": "Forelæsning: Kvalitativ vs Kvantitativ", "titleEn": "Lecture: Qualitative vs Quantitative", "duration": "1:15:00" }
        ]
      }
    ]
  },
  {
    "id": 5,
    "title": "Bachelorprojekt",
    "titleEn": "Bachelor Project",
    "code": "BP505",
    "label": "Kommende (Efterår)",
    "labelEn": "Upcoming (Autumn)",
    "professor": "Klaus Marius Hansen",
    "email": "kmh@cs.aau.dk",
    "img": "/assets/img/grafik/billeder/Studerende og studieliv/_2WB5786.jpg",
    "semester": "Efterår 2024",
    "campus": "Campus Aalborg",
    "color": "var(--color-warning-dark)",
    "tab": "upcoming",
    "nextAssignment": null,
    "sections": []
  }
];

const defaultEventsJson = {
  "2026-4-5": { "id": 101, "titleDa": "Studiegruppe", "titleEn": "Study Group", "color": "var(--aau-light-blue)", "location": "Fibigerstræde 16, 1.108", "time": "08:15 - 12:00", "host": "Jacob Andersen", "courseTitleDa": "Digital Design og Kommunikation", "courseTitleEn": "Digital Design and Communication", "courseCode": "DD101", "typeDa": "Studiegruppe", "typeEn": "Study Group" },
  "2026-4-12": { "id": 102, "titleDa": "Forelæsning", "titleEn": "Lecture", "color": "var(--color-primary)", "location": "Auditorium A", "time": "10:15 - 14:00", "host": "Morten Jensen", "courseTitleDa": "Digital Design og Kommunikation", "courseTitleEn": "Digital Design and Communication", "courseCode": "DD101", "typeDa": "Forelæsning", "typeEn": "Lecture" },
  "2026-4-20": { "id": 103, "title": "Deadline", "titleDa": "Aflevering", "titleEn": "Deadline", "color": "var(--color-danger-dark)", "location": "Online Submission", "time": "23:59", "host": "AAU Moodle", "courseTitleDa": "Webudvikling og CMS", "courseTitleEn": "Web Development and CMS", "courseCode": "WEB202", "typeDa": "Aflevering", "typeEn": "Deadline" }
};

const forumsJson = [
  { "id": 10, "title": "Studienævn for DDK", "titleEn": "Study Board for DDK", "label": "Information", "labelEn": "Information", "img": "/assets/img/grafik/billeder/Studerende og studieliv/_2WB0351.jpg", "color": "var(--color-success)" },
  { "id": 11, "title": "Semesterforum (4. Semester)", "titleEn": "Semester Forum (4th Semester)", "label": "Fælles", "labelEn": "Shared", "img": "/assets/img/grafik/billeder/Bygninger og campus/_2WB3689.jpg", "color": "var(--color-primary)" }
];

const messagesJson = [
  {
    "id": 1,
    "name": "Mette Jensen",
    "roleDa": "Studerende",
    "roleEn": "Student",
    "msgDa": "Har du slides fra i gør?",
    "msgEn": "Did you see the slides from yesterday?",
    "timeDa": "10:45",
    "timeEn": "10:45 AM",
    "unread": true,
    "messages": [
      { "id": 1, "type": "in", "textDa": "Hej Jacob! Har du set de slides Mogens lagde op i går aftes? De virker lidt anderledes end dem han viste til forelæsningen.", "textEn": "Hi Jacob! Have you seen the slides Mogens uploaded last night? They seem a bit different from the ones he showed at the lecture." },
      { "id": 2, "type": "out", "textDa": "Hej Mette. Nej, det har jeg ikke endnu. Jeg kigger på det nu!", "textEn": "Hi Mette. No, I haven't yet. I'm looking at it now!" }
    ]
  },
  {
    "id": 2,
    "nameDa": "Studievejledningen",
    "nameEn": "Student Guidance",
    "roleDa": "Administrativ",
    "roleEn": "Administrative",
    "msgDa": "Din tid er bekræftet.",
    "msgEn": "Your appointment is confirmed.",
    "timeDa": "I går",
    "timeEn": "Yesterday",
    "unread": false,
    "messages": [
      { "id": 1, "type": "in", "textDa": "Hej Jacob. Vi bekræfter hermed din tid til studievejledning d. 15. maj kl. 13:00.", "textEn": "Hi Jacob. We hereby confirm your appointment for student guidance on May 15th at 1:00 PM." },
      { "id": 2, "type": "in", "textDa": "Husk at medbringe din studieplan.", "textEn": "Remember to bring your study plan." }
    ]
  }
];

const notificationsJson = [
  {
    "id": 1, "type": "AFLEVERING",
    "textDa": "Modul 4: Projektrapport v1", "textEn": "Module 4: Project Report v1",
    "dateDa": "10. maj", "dateEn": "May 10", "isRead": false,
    "courseDa": "Interaktionsdesign", "courseEn": "Interaction Design",
    "contentDa": "Din aflevering \"Modul 4: Projektrapport v1\" er nu uploadet korrekt. Du kan se din kvittering og ændre filen indtil deadline d. 12. maj.",
    "contentEn": "Your submission \"Module 4: Project Report v1\" has been uploaded correctly.",
    "link": "/course"
  },
  {
    "id": 2, "type": "FORUM",
    "textDa": "Nyt svar i Interaktionsdesign", "textEn": "New reply in Interaction Design",
    "dateDa": "9. maj", "dateEn": "May 9", "isRead": false,
    "courseDa": "Interaktionsdesign", "courseEn": "Interaction Design",
    "contentDa": "Mogens har svaret på dit spørgsmål i forummet.",
    "contentEn": "Mogens has replied to your question in the forum.",
    "link": "/course"
  },
  {
    "id": 3, "type": "SYSTEM",
    "textDa": "Moodle vedligeholdelse i nat", "textEn": "Moodle maintenance tonight",
    "dateDa": "8. maj", "dateEn": "May 8", "isRead": true,
    "courseDa": "System", "courseEn": "System",
    "contentDa": "Systemet vil være utilgængeligt mellem kl. 02:00 og 04:00 i nat.",
    "contentEn": "The system will be unavailable between 2:00 AM and 4:00 AM tonight.",
    "link": "/"
  },
  {
    "id": 4, "type": "DEADLINE",
    "textDa": "Husk tilmelding til eksamen", "textEn": "Remember exam registration",
    "dateDa": "7. maj", "dateEn": "May 7", "isRead": true,
    "courseDa": "Administration", "courseEn": "Administration",
    "contentDa": "Deadline for tilmelding til sommereksamen er d. 15. maj.",
    "contentEn": "The deadline for summer exam registration is May 15th.",
    "link": "/"
  },
  {
    "id": 5, "type": "FEEDBACK",
    "textDa": "Ny feedback på Portfolio", "textEn": "New feedback on Portfolio",
    "dateDa": "5. maj", "dateEn": "May 5", "isRead": true,
    "courseDa": "Webudvikling", "courseEn": "Web Development",
    "contentDa": "Din underviser har givet feedback på din seneste portfolio-opgave.",
    "contentEn": "Your teacher has provided feedback on your latest portfolio assignment.",
    "link": "/course"
  }
];

const participantsJson = [
  { "name": "Mette Jensen", "role": "student", "email": "mjensen24@example.edu" },
  { "name": "Anders Nielsen", "role": "student", "email": "aniels24@example.edu" },
  { "name": "Sofie Pedersen", "role": "student", "email": "speders24@example.edu" },
  { "name": "Emil Hansen", "role": "student", "email": "ehansen24@example.edu" },
  { "name": "Laura Madsen", "role": "student", "email": "lmadsen24@example.edu" },
  { "name": "Oliver Christensen", "role": "student", "email": "ochrist24@example.edu" },
  { "name": "Emma Rasmussen", "role": "student", "email": "erasmus24@example.edu" },
  { "name": "Morten Jensen", "role": "teacher", "email": "mj@example.edu" }
];

const supportLocationsJson = [
  { "city": "Aalborg Øst", "address": "Kroghstræde 3, lokale 2.106", "zip": "9220 Aalborg Ø", "phone": "+45 9940 2020", "mapUrl": "https://maps.google.com/?q=Kroghstr%C3%A6de+3+Aalborg" },
  { "city": "Aalborg City", "address": "Rendsburggade 14, lokale 2.145", "zip": "9000 Aalborg", "phone": "+45 9940 2020", "mapUrl": "https://maps.google.com/?q=Rendsburggade+14+Aalborg" },
  { "city": "København", "address": "A.C. Meyers Vænge 15, 5. sal", "zip": "2450 København", "phone": "+45 9940 2020", "mapUrl": "https://maps.google.com/?q=A.C.+Meyers+V%C3%A6nge+15+K%C3%B8benhavn" },
  { "city": "Esbjerg", "address": "Niels Bohrs Vej 8, rum F110", "zip": "6700 Esbjerg", "phone": "+45 9940 2020", "mapUrl": "https://maps.google.com/?q=Niels+Bohrs+Vej+8+Esbjerg" }
];

const supportDeskHoursJson = [
  { "days": "Mandag - Torsdag", "daysEn": "Monday - Thursday", "hours": "8.00 - 15.30" },
  { "days": "Fredag", "daysEn": "Friday", "hours": "8.00 - 15.00" }
];

const supportNotesJson = {
  "specialDays": {
    "da": "Lokale servicedeske holder lukket. Telefonsupporten er åben 8.00-15.30 (fredag til 15.00).",
    "en": "Local service desks are closed. Phone support is open 8.00-15.30 (Friday until 15.00)."
  },
  "july": {
    "da": "Skærpede åbningstider (8.00-15.30, fredag til 15.00). Rendsburggade holder lukket uge 29-30.",
    "en": "Reduced opening hours (8.00-15.30, Friday until 15.00). Rendsburggade closed weeks 29-30."
  },
  "christmas": {
    "da": "Fysiske deske har lukket (27. og 30. dec). Begrænset telefonsupport.",
    "en": "Physical desks closed (Dec 27 & 30). Limited phone support."
  }
};

const courseTabItemsJson = [
  { "key": "modules", "label": "tab_modules" },
  { "key": "forum", "label": "tab_forums" },
  { "key": "info", "label": "tab_info" },
  { "key": "participants", "label": "tab_participants" }
];

const toolsJson = [
  {
    "id": 1,
    "nameDa": "Digital Eksamen",
    "nameEn": "Digital Exam",
    "titleKey": "digital_exam",
    "shortTitleDa": "Digital Eksamen",
    "shortTitleEn": "Digital Exam",
    "descDa": "Aflevering af skriftlige eksamensopgaver.",
    "descEn": "Submission of written exam papers.",
    "iconName": "PenSquare",
    "bg": "rgba(14, 165, 233, 0.1)",
    "color": "var(--color-info)",
    "url": "https://digitalservices.aau.dk/dse/exam",
    "sso": true,
    "helpDa": "Digital Eksamen er AAUs platform for aflevering af skriftlige eksamener. Du uploader din besvarelse og får karakter via systemet.",
    "helpEn": "Digital Exam is AAU's platform for submitting written exams. You upload your answers and receive grades through the system.",
    "category": "tools",
    "popular": true,
    "keywords": ["eksamen", "aflevering", "opgave", "prøve", "exam", "submission"]
  },
  {
    "id": 2,
    "nameDa": "STADS eksamens-tilmelding",
    "nameEn": "STADS exam registration",
    "titleKey": "stads",
    "shortTitleDa": "STADS",
    "shortTitleEn": "STADS",
    "descDa": "Eksamens-tilmelding og karakterer.",
    "descEn": "Exam registration and grades.",
    "iconName": "FileText",
    "bg": "rgba(249, 115, 22, 0.1)",
    "color": "var(--aau-light-orange)",
    "url": "https://stads.aau.dk",
    "sso": true,
    "helpDa": "STADS er AAUs system for eksamenstilmelding, karakterudskrift og studieadministration.",
    "helpEn": "STADS is AAU's system for exam registration, grade transcripts, and study administration.",
    "category": "tools",
    "popular": true,
    "keywords": ["karakterer", "tilmelding", "eksamenstilmelding", "studieadministration", "grades", "registration"]
  },
  {
    "id": 3,
    "nameDa": "Aalborg Universitetsbibliotek (AUB)",
    "nameEn": "Aalborg University Library (AUB)",
    "titleKey": "aub",
    "shortTitleDa": "Biblioteket",
    "shortTitleEn": "Library",
    "descDa": "Aalborg Universitetsbibliotek.",
    "descEn": "Aalborg University Library.",
    "iconName": "BookOpen",
    "bg": "rgba(236, 72, 153, 0.1)",
    "color": "var(--aau-light-pink)",
    "url": "https://www.aub.aau.dk",
    "sso": false,
    "helpDa": "AU Belysning giver dig adgang til videnskabelige artikler, e-bøger og databaser.",
    "helpEn": "AUB gives you access to scientific articles, e-books, and databases.",
    "category": "tools",
    "keywords": ["bibliotek", "artikler", "bøger", "database", "library", "articles", "books"]
  },
  {
    "id": 4,
    "nameDa": "IT systemer & software",
    "nameEn": "IT systems & software",
    "titleKey": "it_software",
    "shortTitleDa": "IT & software",
    "shortTitleEn": "IT & Software",
    "descDa": "Licenser, software og VPN.",
    "descEn": "Licenses, software, and VPN.",
    "iconName": "Wifi",
    "bg": "rgba(16, 185, 129, 0.1)",
    "color": "var(--aau-light-green)",
    "url": "https://www.its.aau.dk",
    "sso": false,
    "category": "tools",
    "keywords": ["software", "licens", "vpn", "it", "download", "license"]
  },
  {
    "id": 5,
    "nameDa": "Outlook Mail",
    "nameEn": "Outlook Mail",
    "titleDa": "Outlook Mail",
    "titleEn": "Outlook Mail",
    "shortTitleDa": "Outlook",
    "shortTitleEn": "Outlook",
    "descDa": "Din AAU-studentermail.",
    "descEn": "Your AAU student email.",
    "iconName": "Mail",
    "bg": "rgba(59, 130, 246, 0.1)",
    "color": "#3b82f6",
    "url": "https://outlook.com/aau.dk",
    "sso": true,
    "category": "essentials",
    "popular": true,
    "keywords": ["mail", "email", "e-mail", "post", "besked", "calendar", "kalender", "message"]
  },
  {
    "id": 6,
    "nameDa": "Microsoft Teams",
    "nameEn": "Microsoft Teams",
    "titleDa": "Microsoft Teams",
    "titleEn": "Microsoft Teams",
    "shortTitleDa": "Teams",
    "shortTitleEn": "Teams",
    "descDa": "Video-møder og chat.",
    "descEn": "Video meetings and chat.",
    "iconName": "Users",
    "bg": "rgba(79, 70, 229, 0.1)",
    "color": "#4f46e5",
    "url": "https://teams.microsoft.com",
    "sso": true,
    "category": "essentials",
    "popular": true,
    "keywords": ["teams", "chat", "møde", "video", "samarbejde", "meeting", "collaboration"]
  },
  {
    "id": 7,
    "nameDa": "OneDrive",
    "nameEn": "OneDrive",
    "titleDa": "OneDrive",
    "titleEn": "OneDrive",
    "shortTitleDa": "OneDrive",
    "shortTitleEn": "OneDrive",
    "descDa": "Cloud-lager til dine filer.",
    "descEn": "Cloud storage for your files.",
    "iconName": "Cloud",
    "bg": "rgba(14, 165, 233, 0.1)",
    "color": "#0ea5e9",
    "url": "https://aau-my.sharepoint.com",
    "sso": true,
    "category": "essentials",
    "popular": true,
    "keywords": ["filer", "dokumenter", "cloud", "storage", "gemme", "dele", "files", "documents", "share"]
  },
  {
    "id": 8,
    "nameDa": "Word & Office",
    "nameEn": "Word & Office",
    "titleDa": "Word & Office",
    "titleEn": "Word & Office",
    "shortTitleDa": "Word & Office",
    "shortTitleEn": "Word & Office",
    "descDa": "Office-pakken online.",
    "descEn": "Office suite online.",
    "iconName": "FileText",
    "bg": "rgba(234, 67, 53, 0.1)",
    "color": "#ea4335",
    "url": "https://office.com",
    "sso": true,
    "category": "essentials",
    "keywords": ["word", "office", "dokument", "skrive", "document", "write", "excel", "powerpoint"]
  },
  {
    "id": 9,
    "nameDa": "OneNote",
    "nameEn": "OneNote",
    "titleDa": "OneNote",
    "titleEn": "OneNote",
    "shortTitleDa": "OneNote",
    "shortTitleEn": "OneNote",
    "descDa": "Digitale noter og idéer.",
    "descEn": "Digital notes and ideas.",
    "iconName": "Book",
    "bg": "rgba(236, 72, 153, 0.1)",
    "color": "var(--aau-light-pink)",
    "url": "https://onenote.com",
    "sso": true,
    "category": "essentials",
    "keywords": ["noter", "notes", "ideer", "ideas"]
  },
  {
    "id": 10,
    "nameDa": "Forms",
    "nameEn": "Forms",
    "titleDa": "Forms",
    "titleEn": "Forms",
    "shortTitleDa": "Forms",
    "shortTitleEn": "Forms",
    "descDa": "Spørgeskemaer og quizzer.",
    "descEn": "Surveys and quizzes.",
    "iconName": "ClipboardList",
    "bg": "rgba(16, 185, 129, 0.1)",
    "color": "var(--aau-light-green)",
    "url": "https://forms.office.com",
    "sso": true,
    "category": "essentials",
    "keywords": ["spørgeskema", "quiz", "survey", "formular", "evaluering"]
  },
  {
    "id": 11,
    "nameDa": "Panopto",
    "nameEn": "Panopto",
    "titleDa": "Panopto",
    "titleEn": "Panopto",
    "shortTitleDa": "Panopto",
    "shortTitleEn": "Panopto",
    "descDa": "Videooptagelse og streaming.",
    "descEn": "Video recording and streaming.",
    "iconName": "Video",
    "bg": "rgba(236, 72, 153, 0.1)",
    "color": "var(--aau-light-pink)",
    "url": "https://aau.cloud.panopto.eu",
    "sso": true,
    "helpDa": "Panopto er AAUs platform for videooptagelse og streaming of forelæsninger.",
    "helpEn": "Panopto is AAU's platform for video recording and streaming of lectures.",
    "category": "essentials",
    "keywords": ["video", "optagelse", "forelæsning", "streaming", "recording", "lecture"]
  },
  {
    "id": 12,
    "nameDa": "Zoom",
    "nameEn": "Zoom",
    "titleDa": "Zoom",
    "titleEn": "Zoom",
    "shortTitleDa": "Zoom",
    "shortTitleEn": "Zoom",
    "descDa": "Video-konferenceværktøj.",
    "descEn": "Video conferencing tool.",
    "iconName": "Video",
    "bg": "rgba(14, 165, 233, 0.1)",
    "color": "#0ea5e9",
    "url": "https://aau.zoom.us",
    "sso": false,
    "category": "essentials",
    "popular": true,
    "keywords": ["video", "møde", "konference", "meeting", "conference"]
  }
];

// ── Mock forum data ──────────────────────────────────────────────────────────

export const mockForumActivities: ForumActivity[] = [
  {
    id: 1,
    titleDa: 'Spørgsmål til teksten',
    titleEn: 'Questions regarding the text',
    subtitle: 'Morten Jensen',
    snippetDa: 'Jeg har lagt de nye slides op nu...',
    snippetEn: 'I have uploaded the new slides now...',
    icon: Reply,
    color: 'var(--color-reply-icon, var(--color-primary))'
  },
  {
    id: 2,
    titleDa: 'Gruppesøgning',
    titleEn: 'Group Search',
    subtitle: 'Lærke Nielsen',
    snippetDa: 'Er der nogen der mangler en gruppe?',
    snippetEn: 'Is anyone missing a group?',
    icon: MessageSquare,
    color: 'var(--color-accent)'
  },
  {
    id: 3,
    titleDa: 'Pensumliste',
    titleEn: 'Syllabus',
    subtitle: 'Anders Nielsen',
    snippetDa: 'Husk at tjekke den opdaterede liste.',
    snippetEn: 'Remember to check the updated list.',
    icon: Book,
    color: 'var(--color-success)'
  },
];

export const mockForumPosts: ForumPostData[] = [
  { id: 1, titleDa: 'Spørgsmål til litteraturen i uge 2', titleEn: 'Questions regarding literature week 2', author: 'Mads Mikkelsen', timeDa: 'For 2 timer siden', timeEn: '2 hours ago', replies: 4, contentDa: 'Hej alle sammen. Jeg sidder og læser pensum for uge 2 og har et par spørgsmål til teksten. Kan nogen hjælpe mig med at forstå afsnittet om brugercentreret design?', contentEn: 'Hi everyone. I am reading the curriculum for week 2 and have a few questions about the text. Can anyone help me understand the section on user-centered design?' },
  { id: 2, titleDa: 'Søger gruppe til projekt 1', titleEn: 'Looking for group for project 1', author: 'Lærke Poulsen', timeDa: 'I går kl. 14:30', timeEn: 'Yesterday at 14:30', replies: 12, contentDa: 'Jeg søger 2-3 personer til projekt 1. Jeg har erfaring med HTML/CSS og lidt JavaScript. Skriv endelig hvis I mangler en gruppe.', contentEn: 'I am looking for 2-3 people for project 1. I have experience with HTML/CSS and some JavaScript. Please write if you are looking for a group.' },
  { id: 3, titleDa: 'Ændring af lokale til næste forelæsning', titleEn: 'Room change for next lecture', author: 'Morten Jensen', timeDa: 'I mandags', timeEn: 'Last Monday', replies: 0, contentDa: 'Kære studerende. Næste forelæsning er flyttet to lokale 4.109 på grund af tekniske problemer i det oprindelige lokale.', contentEn: 'Dear students. The next lecture has been moved to room 4.109 due to technical issues in the original room.', important: true },
];

export const mockForumReplies: ForumReplyData[] = [
  { id: 1, author: 'Anders Nielsen', roleDa: 'Studerende', roleEn: 'Student', timeDa: 'For 1 time siden', timeEn: '1 hour ago', contentDa: 'Godt spørgsmål! Jeg har også tænkt over det samme. Prøv at kigge på side 42 i pensumbogen.', contentEn: 'Great question! I have been thinking about the same thing. Try looking at page 42 in the textbook.' },
  { id: 2, author: 'Mette Jensen', roleDa: 'Studerende', roleEn: 'Student', timeDa: 'For 45 minutter siden', timeEn: '45 minutes ago', contentDa: 'Jeg kan også anbefale at se videoen fra uge 1 - den forklarer konceptet rigtig godt.', contentEn: 'I also recommend watching the video from week 1 - it explains the concept really well.' },
];

export const mockDashboardDeadlines = [
  { id: 204, category: 'deadlines', titleDa: 'To-Do App', titleEn: 'To-Do App', iconName: 'FileText', dateKey: 'deadline_monday', courseId: 2, deadlineHoursFromNow: 48 },
  { id: 105, category: 'deadlines', titleDa: 'Designskitse', titleEn: 'Design Sketch', iconName: 'PenTool', dateKey: 'deadline_friday', courseId: 1, deadlineHoursFromNow: 96 },
  { id: 303, category: 'deadlines', titleDa: 'Analyseopgave', titleEn: 'Analysis Assignment', iconName: 'FileText', dateKey: 'course_deadline_in_7_days', courseId: 3, deadlineHoursFromNow: 168 }
];

// ── Registry exports ─────────────────────────────────────────────────────────

export const courses: CoursesMap = coursesJson.reduce((acc, course) => {
  acc[course.id] = {
    title: course.title,
    titleEn: course.titleEn,
    code: course.code,
    professor: course.professor,
    email: course.email,
    img: course.img,
    semester: course.semester,
    campus: course.campus,
    nextAssignment: course.nextAssignment || undefined,
    sections: course.sections as CourseSection[],
  };
  return acc;
}, {} as CoursesMap);

export const courseList: CourseListItem[] = coursesJson.map(course => ({
  id: course.id,
  title: course.title,
  titleEn: course.titleEn,
  label: course.label,
  labelEn: course.labelEn,
  code: course.code,
  img: course.img,
  color: course.color,
  tab: course.tab
}));

export const forums: Forum[] = forumsJson as Forum[];
export const defaultEvents: CalendarEvents = defaultEventsJson as CalendarEvents;
export const messagesData: MessageThread[] = messagesJson as MessageThread[];
export const notificationsData: Notification[] = notificationsJson as Notification[];
export const participantsData = participantsJson as { name: string; role: 'student' | 'teacher'; email: string }[];
export const courseTabItems = courseTabItemsJson as { key: string; label: string }[];

export const supportLocations = supportLocationsJson;
export const supportDeskHours = supportDeskHoursJson;
export const supportNotes = supportNotesJson;

export const registryTools = toolsJson;

export const todayEvents: OverviewEvent[] = [
  { time: '08:15', titleKey: 'lecture', moduleKey: 'course_1_title', location: 'Fibigerstræde 15' },
  { time: '13:00', titleKey: 'study_group', moduleKey: 'course_2_title', location: 'Kroghstræde 3' },
  { time: '23:59', titleKey: 'project_report', moduleKey: 'course_4_title' },
];
