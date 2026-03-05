# invoice_extractor

# 📄 Smart Invoice Extractor (Vision AI)

An AI-powered web application that extracts structured data from invoice images using multimodal **Vision AI models**.
The system analyzes invoice images and converts them into **clean JSON data and a readable table format**.

This project demonstrates how modern **Vision Language Models (VLMs)** can replace traditional OCR pipelines.

---

# 🚀 Features

* Upload invoice images (JPG / PNG)
* Preview uploaded invoice
* AI extracts invoice line items automatically
* Displays extracted data in a **structured table**
* Shows **JSON output**
* Calculates **Grand Total**
* Handles multiple invoice formats
* Clean and aesthetic UI

---

# 🧠 Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express
* TypeScript

### AI Model

* OpenRouter API
* Vision Model: `qwen/qwen-2-vl-7b-instruct`

### Other Tools

* Base64 Image Encoding
* REST API
* JSON Parsing

---

# 🏗 System Architecture

The system follows a **Client → Server → AI Model architecture**.

```
                ┌─────────────────────┐
                │      User Browser    │
                │  (HTML / CSS / JS)  │
                └──────────┬──────────┘
                           │
                           │ Upload Invoice Image
                           │
                           ▼
                ┌─────────────────────┐
                │      Frontend UI     │
                │  - Image Preview     │
                │  - Extract Button    │
                └──────────┬──────────┘
                           │
                           │ Base64 Image
                           │ API Request
                           ▼
                ┌─────────────────────┐
                │  Node.js Backend     │
                │  Express + TypeScript│
                │  /extract-invoice API│
                └──────────┬──────────┘
                           │
                           │ Image + Prompt
                           │
                           ▼
                ┌─────────────────────┐
                │     OpenRouter AI    │
                │ Vision Model (VLM)   │
                │ qwen-2-vl-7b         │
                └──────────┬──────────┘
                           │
                           │ Structured JSON
                           ▼
                ┌─────────────────────┐
                │ Backend Processing   │
                │ JSON Validation      │
                │ Table Generation     │
                └──────────┬──────────┘
                           │
                           │ Response
                           ▼
                ┌─────────────────────┐
                │ Frontend Display     │
                │ - Table View         │
                │ - JSON Output        │
                │ - Grand Total        │
                └─────────────────────┘
```

---

# 📂 Project Structure

```
invoice_extractor
│
├── backend
│   ├── src
│   │   └── server.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend
    └── index.html
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```
git clone https://github.com/Raxyyydev25/invoice_extractor.git
```

```
cd invoice_extractor
```

---

# 2️⃣ Backend Setup

Navigate to backend:

```
cd backend
```

Install dependencies:

```
npm install
```

Create `.env` file:

```
OPENROUTER_API_KEY=your_api_key_here
```

Run the backend server:

```
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

# 3️⃣ Run Frontend

Open:

```
frontend/index.html
```

in your browser.

---

# 📊 Example Output

### Extracted Table

| Description | Quantity | Unit Price | Total |
| ----------- | -------- | ---------- | ----- |
| Notebook    | 2        | 120        | 240   |
| Pen         | 3        | 20         | 60    |

Grand Total:

```
300
```

### JSON Output

```json
{
 "items":[
  {
   "description":"Notebook",
   "quantity":2,
   "unit_price":120,
   "total":240
  },
  {
   "description":"Pen",
   "quantity":3,
   "unit_price":20,
   "total":60
  }
 ]
}
```

---

# 🧪 Future Improvements

* Support **PDF invoices**
* Batch processing for **multiple invoices**
* Vendor detection
* Tax calculation verification
* Export results to **CSV / Excel**
* Cloud deployment

---

# 👩‍💻 Author

**Raksha Devadiga**

GitHub:
https://github.com/Raxyyydev25

---

# ⭐ If you like this project

Give the repository a **star ⭐ on GitHub**.
