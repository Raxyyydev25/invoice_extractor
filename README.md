# Smart Invoice Extractor (Vision AI)

An AI-powered web application that extracts structured data from invoice images and presents the output in both **table** and **JSON** formats using a **Vision Language Model**.

---

## 1. Introduction

The **Smart Invoice Extractor** is a Vision AI-based project built to automatically read invoice images and convert their contents into structured digital data.

Instead of using traditional OCR pipelines that require separate steps like text detection, layout analysis, and rule-based parsing, this project uses a **multimodal Vision Language Model** to directly understand the invoice visually and return meaningful structured output.

This makes invoice processing faster, simpler, and more flexible across different invoice layouts.

---

## 2. Objectives

- Extract structured data from invoice images automatically
- Convert invoice contents into JSON format
- Display invoice data in a readable table format
- Detect invoice metadata such as vendor, customer, invoice number, and date
- Calculate or extract the grand total
- Demonstrate the practical use of Vision AI in document understanding

---

## 3. Key Features

- Upload invoice images in **JPG / PNG** format
- Preview the uploaded image before extraction
- AI-based invoice data extraction
- Dynamic table rendering based on detected invoice columns
- Structured JSON output
- Grand total extraction
- Support for multiple invoice layouts
- Download extracted table
- Download extracted JSON
- Clean and aesthetic frontend interface

---

## 4. Technologies Used

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- XLSX
- File Saver

### Backend
- Node.js
- Express.js
- TypeScript

### AI / Vision Model
- OpenRouter API
- `qwen/qwen-2-vl-7b-instruct`

### Other Tools / Concepts
- Base64 Image Encoding
- REST API Communication
- JSON Parsing
- Dynamic Table Rendering

---

## 5. System Architecture

The project follows a simple:

**Client → Server → AI Model** architecture

### Workflow

1. The user uploads an invoice image using the frontend.
2. The frontend previews the image and converts it into **Base64** format.
3. The Base64 image is sent to the backend using a REST API request.
4. The backend sends the image along with a structured prompt to the **OpenRouter Vision AI model**.
5. The model analyzes the invoice image and extracts structured data.
6. The backend cleans and validates the AI response.
7. The frontend displays:
   - extracted invoice metadata
   - invoice table
   - summary rows
   - grand total
   - JSON output
8. The user can download the extracted table and JSON.

---

## 6. Project Structure

```bash
invoice_extractor/
│
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   └── InvoiceExtractor.jsx
│   ├── package.json
│   └── ...
│
└── README.md