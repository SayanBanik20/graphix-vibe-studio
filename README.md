# 🎨 Graphix Vibe Studio

<p align="center">
  <img src="public/logo.png" alt="Graphix Vibe Logo" width="150"/>
</p>

<p align="center">
  <strong>A modern full-stack e-commerce platform for personalized gifts and creative products.</strong>
</p>

<p align="center">
  Built with React, TypeScript, TanStack Router, Supabase, and Vite.
</p>

---

## 📖 Overview

Graphix Vibe Studio is a premium e-commerce platform designed for creative businesses selling personalized products such as custom gifts, photo frames, Spotify plaques, keychains, mugs, and more.

The platform provides a seamless shopping experience for customers along with a powerful admin dashboard for managing products, orders, categories, customer uploads, and business operations.

---

# ✨ Features

## Customer Side

- Modern responsive UI
- Product catalog
- Product search
- Category browsing
- Product details
- Wishlist
- Shopping cart
- Secure authentication
- Google Sign-In
- Customer profile
- Personalized product uploads
- Dynamic pricing
- Reviews & ratings
- Order history
- Mobile-friendly interface

---

## Admin Dashboard

- Dashboard analytics
- Product management
- Category management
- Order management
- Customer management
- Inventory management
- Customer upload management
- Review moderation
- Coupon management
- Notifications
- User & Role management
- Website settings

---

# 🚀 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- Shadcn UI
- Lucide React

## Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Row Level Security (RLS)

---

# 📂 Project Structure

```text
graphix-vibe-studio/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── styles/
│   ├── server.ts
│   └── start.ts
│
├── supabase/
│   ├── migrations/
│   └── config
│
├── .env.example
├── package.json
└── README.md
```

---

# 🛠 Installation

Clone the repository

```bash
git clone https://github.com/SayanBanik20/graphix-vibe-studio.git
```

Move into the project

```bash
cd graphix-vibe-studio
```

Install dependencies

```bash
npm install
```

or

```bash
bun install
```

---

# ⚙ Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Important:** Never commit your `.env` file or any secret keys to GitHub.

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
```

Preview Production Build

```bash
npm run preview
```

---

# 🗄 Database

This project uses **Supabase PostgreSQL**.

Main tables include:

- Users
- Products
- Categories
- Orders
- Order Items
- Reviews
- Wishlist
- Addresses
- Product Uploads

Database migrations are stored in:

```text
supabase/migrations/
```

---

# 🔐 Authentication

- Email & Password Authentication
- Google Authentication
- Protected Admin Routes
- Supabase Row Level Security (RLS)

---

# 📦 Storage

Supabase Storage is used for:

- Product Images
- Customer Uploads
- Website Assets

---

# 📱 Responsive Design

Fully optimized for:

- Desktop
- Laptop
- Tablet
- Mobile

---

# 🔒 Security

- Environment variables protected
- Supabase Row Level Security
- Protected Admin Dashboard
- Secure Authentication
- Database Policies
- Storage Policies

---

# 📈 Future Enhancements

- Razorpay Payment Gateway
- Order Tracking
- Invoice Generation
- Email Notifications
- Admin Reports
- Sales Analytics
- Product Recommendations
- Multi-language Support
- Multi-vendor Support

---

# 📄 License

This project is proprietary software developed for **Graphix Vibe Studio**.

Unauthorized copying, distribution, or commercial use without permission is prohibited.

---

# 👨‍💻 Developer

**Sayan Banik**

B.Tech Student • Full Stack Web Developer

GitHub:
https://github.com/SayanBanik20

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

<p align="center">
Made with ❤️ by <strong>Sayan Banik</strong>
</p>
