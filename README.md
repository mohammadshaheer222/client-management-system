# UpReels CRM

A mobile-first client management system for photographers and videographers on the **UpReels** platform.

Built with **Next.js 14 (App Router) + MongoDB + Mongoose**.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **OR** a MongoDB Atlas connection string

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Edit `.env.local`:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/upreels-crm

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/upreels-crm
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (or on your phone via the **Network** URL shown in terminal).

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats overview, overdue alerts, status breakdown, recent leads |
| **Lead List** | Search by name/phone/ID, filter by status |
| **Add Lead** | Full form with all required fields |
| **Lead Detail** | Status pipeline, quick call/WhatsApp, all info |
| **Edit Lead** | Update any field, change status |
| **Delete Lead** | Two-step confirmation |
| **Bottom Nav** | Mobile-friendly navigation |

## 📋 Lead Fields

- Lead ID (auto-generated: `UPR-2026-0001`)
- Date, Client Name, Phone Number
- Requirement, Location, Budget
- Source (default: UpReels)
- Assigned To, Creator Assigned
- Status: New Lead → Contacted → Quotation Sent → Follow-up → Confirmed → Completed / Lost
- Last Follow-up Date, Next Follow-up Date
- Closure Date, Remarks

## 🎨 Design

- Dark glassmorphism UI
- Electric blue + gold accent colors
- Mobile-first (390px optimized)
- Color-coded status badges
- Overdue follow-up alerts in red

## 📁 Project Structure

```
upreels-crm/
├── app/
│   ├── api/leads/         # REST API endpoints
│   ├── leads/             # Lead list, add, detail, edit pages
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout + Bottom Nav
│   ├── page.tsx           # Dashboard
│   └── globals.css        # Design system
├── components/
│   ├── BottomNav.tsx
│   ├── LeadCard.tsx
│   ├── LeadForm.tsx
│   └── StatusBadge.tsx
├── lib/mongodb.ts         # DB connection helper
└── models/Lead.ts         # Mongoose schema
```
