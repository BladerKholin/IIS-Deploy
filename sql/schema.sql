CREATE DATABASE IF NOT EXISTS bitacora_infor;
USE bitacora_infor;


-- Departments table 
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('User', 'Admin') NOT null default 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    department_id INT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);


-- Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active BOOL not null default true,
    position INT not null default 0,
    created_by INT NULL,
    department_id INT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET null,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    UNIQUE(name, department_id)  -- Ensures unique category names within the same department
);
-- Receptions Table
-- Receptions Table
CREATE TABLE receptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nro VARCHAR(20) NOT NULL,  -- Supports numbers with letters
    administrative VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    document_date DATE NOT NULL,
    deploy_date DATE NOT NULL,
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    matter TEXT NOT NULL,
    observations TEXT NULL,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(nro)  -- Ensures unique document numbers
);

-- Sended Table
CREATE TABLE sended (   
    id INT AUTO_INCREMENT PRIMARY KEY,
    nro VARCHAR(20) NOT NULL,  -- Supports numbers with letters
    document_type VARCHAR(100) NOT NULL,
    document_date DATE NOT NULL,
    recipient VARCHAR(255) NOT NULL,  -- "To" field
    prepared_by VARCHAR(255) NOT NULL,
    matter TEXT NOT NULL,
    deploy_date DATE NOT NULL,
    observations TEXT NULL,
    administrative VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(nro)  -- Ensures unique document numbers
);


-- Events Table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    responsible VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('abierto', 'cerrado', 'en proceso') DEFAULT 'abierto',
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Actions Table
CREATE TABLE actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    registry_date DATETIME NOT NULL,
    estimated_date DATETIME NOT NULL,
    responsible VARCHAR(100) NOT NULL,
    event_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Attachments Table
CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    table_name ENUM('events', 'actions', 'receptions', 'sended', 'calendar') NOT NULL,
    record_id INT NOT NULL,
    data LONGBLOB, 
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calendarEvents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    all_day BOOL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    department_id INT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Inserting base departments
insert into departments (name) values ('TIC'), ('OOPP');

-- Inserting base categories for OP
insert into categories (name, created_by, department_id) values ('Recibidos', null, 2), ('Enviados', null, 2);
