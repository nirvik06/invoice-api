# Invoice Management – Backend API (Node.js)

This is the backend API for the Invoice Management System developed as part of the Zen Practical Test.

## Tech Stack
- Node.js
- Express.js
- MySQL
- mysql2 (Promise-based)
- express-validator

## Prerequisites
- Node.js (v18+ recommended)
- MySQL
- npm

## 🗄 Database Setup

# Create database
```sql
CREATE DATABASE invoice_db;

# Import dump file
mysql -u root -p invoice_db < invoice_db.sql


# Clone the repository
git clone <backend-repo-url>
cd invoice-api

# copy env
cp .env.example .env

# Install dependencies
npm install

# Start server
node server.js

# API will run at
http://localhost:5000
