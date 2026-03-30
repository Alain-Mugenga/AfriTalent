# AfriTalent

🌍 AfriTalent
African Athlete Talent Platform
Complete Local Setup Guide
Follow these steps in order to run the project on your computer


Prerequisites
Before starting, make sure you have the following installed on your computer:

Tool	Where to Get It	Notes
Node.js 18+	nodejs.org → Download LTS	Required to run JavaScript
pnpm	Run: npm install -g pnpm	Package manager
PostgreSQL 17	postgresql.org/download	The database
pgAdmin 4	Installed with PostgreSQL	Database manager GUI
VS Code	code.visualstudio.com	Code editor

Step 1 — Install Node.js & pnpm
1.	Go to nodejs.org and download the LTS version (18+)
2.	Run the installer — keep all default settings
3.	Open a terminal and verify it worked:

node -v
# Should show: v20.x.x or higher

4.	Install pnpm globally:

npm install -g pnpm
pnpm -v
# Should show a version number like 9.x.x

💡 Tip
If node or pnpm is not recognized after installing, restart VS Code.
This forces VS Code to pick up the new PATH environment variables.


Step 2 — Install & Set Up PostgreSQL
2a. Install PostgreSQL
5.	Go to enterprisedb.com/downloads/postgres-postgresql-downloads
6.	Download PostgreSQL 17 for Windows x86-64
7.	Run the installer — during setup:
•	Remember your password for the postgres user
•	Keep the default port: 5432
•	Install pgAdmin when offered (check the box)
8.	When Stack Builder appears at the end, click Cancel — not needed

⚠️  Important — Password Tip
Choose a simple password with NO special characters (no commas, @, #, etc.)
Example of a good password: postgres123
Special characters break the database connection URL and cause errors.

2b. Create the Database
9.	Open pgAdmin 4 from the Windows Start menu
10.	In the left panel, expand Servers → PostgreSQL 17
11.	Enter your postgres password when prompted
12.	Right-click on Databases → Create → Database...
13.	Type afritalent as the database name
14.	Click Save

2c. Run the Setup SQL
15.	In pgAdmin, expand Databases → click on afritalent
16.	Right-click on afritalent → click Query Tool
17.	Click the folder icon (Open File) in the toolbar
18.	Navigate to your project's api-server folder and open setup.sql
19.	Click the ▶ Run button (or press F5)
20.	You should see: Query returned successfully

This creates all database tables and seeds the admin user and sample athletes.


Step 3 — Configure the .env File
The .env file tells the server how to connect to the database. Without it, the server cannot read the DATABASE_URL and will fail silently.

21.	In VS Code, open your project folder (the one containing server.js)
22.	Create a new file called .env in the root of the project
23.	Add these two lines:

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/afritalent
PORT=3000

24.	Replace YOUR_PASSWORD with your actual postgres password
25.	Save the file

⚠️  Critical — dotenv Package
Your server.js must load the .env file. Make sure the very first line of server.js is:

    import "dotenv/config";

Without this line, Node.js ignores the .env file entirely and DATABASE_URL will be undefined.

Install the dotenv package by running in your terminal:

npm install dotenv


Step 4 — Run the Server
Open a terminal in VS Code (Terminal → New Terminal) and run:

node server.js

You should see:

✅ AfriTalent running at http://localhost:3000
   Admin login: admin@afritalent.com / admin123

✅ Success Signs
Green checkmark message appears
No red error text below it
Visiting http://localhost:3000 shows your website

❌ Common Error: password must be a string
This means the .env file is not being loaded.
Fix 1: Make sure import "dotenv/config" is the first line of server.js
Fix 2: Make sure npm install dotenv was run
Fix 3: Make sure .env is in the same folder as server.js


Step 5 — Open the Website
26.	Make sure the server is running (Step 4)
27.	Open your browser and go to:

http://localhost:3000

28.	You should see the AfriTalent homepage with the green navbar
29.	Navigate to /pages/athletes.html to see the athletes
30.	To log in as admin, go to /pages/login.html and use:

Email:    admin@afritalent.com
Password: admin123


Project Folder Structure

Africa Talent/
├── server.js          ← Main server file
├── setup.sql          ← Database setup (run once in pgAdmin)
├── package.json       ← Project dependencies
├── .env               ← Database password & port (you create this)
├── public/
│   ├── css/
│   │   └── style.css  ← All website styles
│   ├── js/
│   │   └── main.js    ← Shared JavaScript
│   ├── images/        ← Athlete photos
│   └── pages/         ← All HTML pages
│       ├── athletes.html
│       ├── athlete.html
│       ├── register.html
│       ├── login.html
│       ├── stories.html
│       └── admin.html
└── index.html         ← Homepage


Quick Reference — Daily Use
Every time you want to work on the project:

Action	Command / Instructions
Start the server	node server.js
Stop the server	Press Ctrl + C in the terminal
View the website	Open http://localhost:3000 in browser
Admin panel	Go to http://localhost:3000/pages/admin.html
Restart server	Ctrl + C, then node server.js again


Troubleshooting

CSS not loading / site looks unstyled
•	Make sure you are opening the site via http://localhost:3000 not by double-clicking the HTML file
•	The server must be running with node server.js

Registration failed
•	Check that setup.sql was run successfully in pgAdmin
•	Make sure the .env file has the correct password
•	Make sure import "dotenv/config" is the first line of server.js

No athletes showing
•	Run the seed INSERT in pgAdmin Query Tool to add sample athletes
•	Make sure the athletes have status = approved in the database

Password error: client password must be a string
•	Add import "dotenv/config" as the very first line of server.js
•	Run npm install dotenv
•	Restart the server

Port already in use
•	Another process is using port 3000
•	Stop it with Ctrl + C, or change PORT=3001 in your .env file


🌍 AfriTalent — Built with ❤️ for Africa by Alain Mugenga
