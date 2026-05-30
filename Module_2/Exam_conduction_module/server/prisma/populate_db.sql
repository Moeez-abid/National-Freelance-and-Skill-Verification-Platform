-- Centralized Database Population Script

-- Users
INSERT INTO "users" (id, email, password_hash, first_name, last_name, role, created_at) VALUES
(1, 'admin@skillcertify.com', '$2b$10$awX4kQER.xkoPFK5MyRjReWD2GIdA7yZFa8GG0zkucKBF3FmveaYG', 'System', 'Admin', 'admin', NOW()),
(2, 'user@skillcertify.com', '$2b$10$awX4kQER.xkoPFK5MyRjReWD2GIdA7yZFa8GG0zkucKBF3FmveaYG', 'Test', 'User', 'freelancer', NOW());

-- Skills
INSERT INTO "skills" (id, skill_name, category) VALUES
(1, 'JavaScript', 'General'),
(2, 'React', 'General'),
(3, 'Node.js', 'General'),
(4, 'SQL', 'General');

-- Assessments (ec_skill_assessments)
INSERT INTO "ec_skill_assessments" (id, skill_id, assessment_name, description) VALUES
(1, 1, 'JavaScript Fundamentals', 'Master the core concepts of JS.'),
(2, 2, 'React Performance Tuning', 'Optimize your React apps like a pro.'),
(3, 3, 'Node.js Backend Mastery', 'Build scalable servers with Node.'),
(4, 4, 'SQL Query Optimization', 'Write fast and efficient queries.'),
(5, 1, 'JavaScript AI Challenge - 22/04/2026', 'An AI-generated skill assessment for JavaScript created on 22/04/2026.');

-- Questions (ec_questions)
INSERT INTO "ec_questions" (id, assessment_id, question_text, question_type, options, correct_answer, points) VALUES
(1, 1, 'What is the output of typeof null?', 'MCQ', '["object","null","undefined","number"]'::jsonb, 'object', 10),
(2, 1, 'Which keyword is used to define a constant in ES6?', 'MCQ', '["const","let","var","constant"]'::jsonb, 'const', 10),
(3, 1, 'What does NaN stand for?', 'MCQ', '["Not a Number","New and Nice","Next and Now","No absolute Number"]'::jsonb, 'Not a Number', 10),
(4, 1, 'Which of the following methods is used to add an element to the end of a JavaScript array?', 'MCQ', '["push()","pop()","shift()","unshift()"]'::jsonb, 'push()', 10),
(5, 1, 'Which of the following is a valid way to create a new object in JavaScript?', 'MCQ', '["Using the 'new' keyword with a constructor function","Using the 'Object.create()' method","Using the 'JSON.parse()' method","Using the 'eval()' function"]'::jsonb, 'Using the ''new'' keyword with a constructor function', 10),
(6, 1, 'What is the difference between ''null'' and ''undefined'' in JavaScript?', 'MCQ', '["Null is an object, while undefined is a primitive value","Null is a primitive value, while undefined is an object","Null represents the absence of a value, while undefined represents an uninitialized variable","Null represents an uninitialized variable, while undefined represents the absence of a value"]'::jsonb, 'Null represents the absence of a value, while undefined represents an uninitialized variable', 10),
(7, 1, 'What is the purpose of the ''let'' keyword in JavaScript?', 'MCQ', '["To declare a global variable","To declare a constant variable","To declare a block-scoped variable","To declare a function"]'::jsonb, 'To declare a block-scoped variable', 10),
(8, 1, 'What is the purpose of the ''bind()'' method in JavaScript?', 'MCQ', '["To invoke a function immediately","To change the context of a function","To create a new function with the same behavior as the original","To prevent a function from being invoked"]'::jsonb, 'To change the context of a function', 10),
(9, 1, 'What is the purpose of the ''let'' keyword in JavaScript?', 'MCQ', '["To declare a global variable","To declare a constant variable","To declare a block scopied variable","To declare a function"]'::jsonb, 'To declare a block scopied variable', 10),
(10, 1, 'What is the difference between ''null'' and ''undefined'' in JavaScript?', 'MCQ', '["Null is an object, undefined is not","Null is a number, undefined is a string","Null represents an empty object, undefined represents an uninitialized variable","Null and undefined are the same"]'::jsonb, 'Null represents an empty object, undefined represents an uninitialized variable', 10),
(11, 1, 'What is the purpose of the ''map()'' function in JavaScript?', 'MCQ', '["To filter an array","To transform an array","To sort an array","To reverse an array"]'::jsonb, 'To transform an array', 10),
(12, 1, 'What is the purpose of the ''async/await'' syntax in JavaScript?', 'MCQ', '["To handle synchronous code","To handle asynchronous code","To handle errors","To handle callbacks"]'::jsonb, 'To handle asynchronous code', 10),
(13, 1, 'What is the difference between the ''=='' and ''==='' operators in JavaScript?', 'MCQ', '["'==' checks for equality, '===' checks for identity","'==' checks for identity, '===' checks for equality","'==' checks for type and value, '===' checks for value only","'==' checks for value only, '===' checks for type and value"]'::jsonb, '''=='' checks for value only, ''==='' checks for type and value', 10),
(14, 1, 'What is the purpose of the ''try/catch'' block in JavaScript?', 'MCQ', '["To handle asynchronous code","To handle synchronous code","To handle errors","To handle callbacks"]'::jsonb, 'To handle errors', 10),
(15, 1, 'What is the purpose of the ''JSON.parse()'' function in JavaScript?', 'MCQ', '["To convert a string to a JSON object","To convert a JSON object to a string","To parse a JSON string","To validate a JSON object"]'::jsonb, 'To convert a string to a JSON object', 10),
(16, 2, 'What does React.memo do?', 'MCQ', '["Caches a value","Prevents unnecessary re-renders","Manages state","Handles side effects"]'::jsonb, 'Prevents unnecessary re-renders', 10),
(17, 2, 'Which hook should be used to memoize a function?', 'MCQ', '["useMemo","useRef","useCallback","useEffect"]'::jsonb, 'useCallback', 10),
(18, 2, 'Where should you place calculations in a functional component?', 'MCQ', '["useMemo","useEffect","useState","Inside render"]'::jsonb, 'useMemo', 10),
(19, 3, 'Which core module is used for handling file paths?', 'MCQ', '["fs","path","url","os"]'::jsonb, 'path', 10),
(20, 3, 'What is the default port for an Express server?', 'MCQ', '["3000","5000","8080","None"]'::jsonb, 'None', 10),
(21, 3, 'Which module provides basic cryptographic functionality?', 'MCQ', '["crypto","security","hash","encrypt"]'::jsonb, 'crypto', 10),
(22, 3, 'What is Node.js?', 'MCQ', '["A JavaScript framework","A JavaScript library","A JavaScript runtime environment","A JavaScript compiler"]'::jsonb, 'A JavaScript runtime environment', 10),
(23, 3, 'Which of the following is a popular Node.js framework?', 'MCQ', '["React","Angular","Express.js","Vue.js"]'::jsonb, 'Express.js', 10),
(24, 3, 'What is the purpose of the ''require'' function in Node.js?', 'MCQ', '["To import a module","To export a module","To create a new module","To delete a module"]'::jsonb, 'To import a module', 10),
(25, 3, 'What is the difference between ''let'' and ''const'' in Node.js?', 'MCQ', '["'let' is used for constants, 'const' is used for variables","'let' is used for variables, 'const' is used for constants","'let' is used for functions, 'const' is used for classes","'let' is used for classes, 'const' is used for functions"]'::jsonb, '''let'' is used for variables, ''const'' is used for constants', 10),
(26, 3, 'What is the purpose of the ''package.json'' file in a Node.js project?', 'MCQ', '["To store project dependencies","To store project configuration","To store project code","To store project documentation"]'::jsonb, 'To store project dependencies', 10),
(27, 3, 'What is the command to install a new package in Node.js using npm?', 'MCQ', '["npm install","npm uninstall","npm update","npm remove"]'::jsonb, 'npm install', 10),
(28, 3, 'What is the purpose of the ''async/await'' syntax in Node.js?', 'MCQ', '["To handle synchronous code","To handle asynchronous code","To handle parallel code","To handle concurrent code"]'::jsonb, 'To handle asynchronous code', 10),
(29, 3, 'What is the primary purpose of the ''npm'' command in Node.js?', 'MCQ', '["To create a new Node.js project","To manage dependencies and packages for a Node.js project","To start a Node.js server","To debug a Node.js application"]'::jsonb, 'To manage dependencies and packages for a Node.js project', 10),
(30, 3, 'Which Node.js module is used for file system operations?', 'MCQ', '["HTTP","FS","Path","URL"]'::jsonb, 'FS', 10),
(31, 3, 'What is the event-driven I/O model used by Node.js?', 'MCQ', '["Asynchronous","Synchronous","Multi-threaded","Single-threaded"]'::jsonb, 'Asynchronous', 10),
(32, 3, 'Which of the following is a popular Node.js framework for building web applications?', 'MCQ', '["React","Angular","Express","Vue.js"]'::jsonb, 'Express', 10),
(33, 3, 'What is the purpose of the ''require'' function in Node.js?', 'MCQ', '["To create a new object","To import a module or package","To start a Node.js server","To debug a Node.js application"]'::jsonb, 'To import a module or package', 10),
(34, 4, 'Which keyword is used to sort results in SQL?', 'MCQ', '["SORT BY","ORDER BY","GROUP BY","ARRANGE"]'::jsonb, 'ORDER BY', 10),
(35, 4, 'Which JOIN returns all records from the left table?', 'MCQ', '["INNER JOIN","RIGHT JOIN","LEFT JOIN","FULL JOIN"]'::jsonb, 'LEFT JOIN', 10),
(36, 4, 'What is the primary key typically used for?', 'MCQ', '["Sorting","Indexing","Uniquely identifying a row","Nothing"]'::jsonb, 'Uniquely identifying a row', 10),
(37, 4, 'Which SQL function is used to concatenate two or more strings?', 'MCQ', '["CONCAT","JOIN","UNION","MERGE"]'::jsonb, 'CONCAT', 10),
(38, 4, 'Which SQL statement is used to create a copy of an existing table?', 'MCQ', '["CREATE TABLE","SELECT INTO","INSERT INTO","UPDATE TABLE"]'::jsonb, 'SELECT INTO', 10),
(39, 4, 'Which SQL function is used to calculate the average value of a column?', 'MCQ', '["SUM","AVG","MAX","MIN"]'::jsonb, 'AVG', 10),
(40, 4, 'What is the purpose of the ORDER BY clause in SQL?', 'MCQ', '["To filter data based on a condition","To group data based on one or more columns","To sort data in ascending or descending order","To add a new column to an existing table"]'::jsonb, 'To sort data in ascending or descending order', 10),
(41, 4, 'Which SQL statement is used to delete all rows from a table?', 'MCQ', '["DELETE","TRUNCATE","DROP","INSERT"]'::jsonb, 'TRUNCATE', 10),
(42, 4, 'What is the difference between INNER JOIN and LEFT JOIN in SQL?', 'MCQ', '["INNER JOIN returns all rows, while LEFT JOIN returns only matching rows","INNER JOIN returns only matching rows, while LEFT JOIN returns all rows from the left table","INNER JOIN is used for aggregating data, while LEFT JOIN is used for filtering data","INNER JOIN is used for sorting data, while LEFT JOIN is used for grouping data"]'::jsonb, 'INNER JOIN returns only matching rows, while LEFT JOIN returns all rows from the left table', 10),
(43, 4, 'What is the purpose of the HAVING clause in SQL?', 'MCQ', '["To specify the conditions for selecting data","To group data based on one or more columns","To filter grouped data based on a condition","To sort data in ascending or descending order"]'::jsonb, 'To filter grouped data based on a condition', 10),
(44, 4, 'Which SQL statement is used to add a new column to an existing table?', 'MCQ', '["ALTER TABLE","CREATE TABLE","DROP TABLE","TRUNCATE TABLE"]'::jsonb, 'ALTER TABLE', 10),
(45, 4, 'What is the purpose of the GROUP BY clause in SQL?', 'MCQ', '["To filter data based on a condition","To sort data in ascending or descending order","To group data based on one or more columns","To add a new column to an existing table"]'::jsonb, 'To group data based on one or more columns', 10),
(46, 4, 'What is the difference between WHERE and HAVING clauses in SQL?', 'MCQ', '["WHERE is used for filtering grouped data, while HAVING is used for filtering individual rows","WHERE is used for filtering individual rows, while HAVING is used for filtering grouped data","WHERE is used for sorting data, while HAVING is used for grouping data","WHERE is used for aggregating data, while HAVING is used for filtering data"]'::jsonb, 'WHERE is used for filtering individual rows, while HAVING is used for filtering grouped data', 10),
(47, 5, 'What is the purpose of the ''let'' keyword in JavaScript?', 'MCQ', '["To declare a global variable","To declare a constant variable","To declare a block-scoped variable","To declare a function"]'::jsonb, 'To declare a block-scoped variable', 10),
(48, 5, 'Which of the following is a JavaScript framework used for building user interfaces?', 'MCQ', '["React","Angular","Vue.js","All of the above"]'::jsonb, 'All of the above', 10),
(49, 5, 'What is the difference between ''null'' and ''undefined'' in JavaScript?', 'MCQ', '["'null' represents an empty object, while 'undefined' represents an uninitialized variable","'null' represents an uninitialized variable, while 'undefined' represents an empty object","'null' represents a variable that has been explicitly set to nothing, while 'undefined' represents a variable that has not been declared","'null' and 'undefined' are the same thing"]'::jsonb, '''null'' represents a variable that has been explicitly set to nothing, while ''undefined'' represents a variable that has not been declared', 10),
(50, 5, 'Which of the following JavaScript methods is used to add an event listener to an element?', 'MCQ', '["addEventListener()","attachEvent()","addListener()","addEventHandler()"]'::jsonb, 'addEventListener()', 10),
(51, 5, 'What is the purpose of the ''finally'' block in a JavaScript try-catch statement?', 'MCQ', '["To catch and handle exceptions","To specify code that should run regardless of whether an exception was thrown","To specify code that should only run if an exception was thrown","To skip over code that might throw an exception"]'::jsonb, 'To specify code that should run regardless of whether an exception was thrown', 10);
