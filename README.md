# Donation-Based Crowdfunding System

A full-stack web application designed to facilitate secure, transparent, and efficient crowdfunding for NGOs. 

## 🚀 Project Overview
This system allows Non-Governmental Organizations (NGOs) to create and manage donation campaigns, allocate funds to specific sub-goals, and track disbursements. Donors can view active campaigns, make secure donations, and track their personal donation history.

### Core Features
* **Role-Based Access Control:** Distinct dashboards for System Admins, NGO Admins, and Donors.
* **Campaign Management:** NGOs can create campaigns requiring System Admin approval.
* **Transparent Allocation:** Funds can be strictly allocated to specific campaign sub-goals.
* **Donation Tracking:** Secure donation processing and history tracking.
* **AI Support:** Integrated Chatbot for user FAQs.
* **Notifications:** Real-time system alerts (Upcoming).

## 🛠️ Technology Stack
* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend:** Laravel 11 (REST API), Sanctum (Authentication)
* **Database:** MySQL

## ⚙️ Local Setup Instructions

### Backend (Laravel)
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `composer install`
3. Copy the environment file: `cp .env.example .env`
4. Set up the database in `.env` (Database name: `crowdfunding_fyp`)
5. Run migrations: `php artisan migrate`
6. Start the server: `php artisan serve`

### Frontend (React)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---
*Developed by Chan Wen Kang for Universiti Teknologi Malaysia (UTM).*