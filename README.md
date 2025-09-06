# AI Face Swap Web Application

A web application that allows users to upload an image and a style image to perform **AI-powered face swaps**. The project uses **Node.js**, **Express**, **MongoDB**, **EJS**, and integrates with the **LightX AI Face Swap API**.

---

## 🚀 Features

- Upload original and style images to swap faces.
- Real-time AI face swapping using LightX API.
- Display all submissions with thumbnails.
- Pagination support for submissions.
- Download swapped images.
- Form validation with alerts for errors.
- Terms & Conditions modal for user consent.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using native driver, no ORM)
- **Frontend:** EJS templating, Bootstrap 5, Font Awesome
- **File Upload:** Multer
- **Face Swap API:** LightX AI Face Swap API
- **Other:** dotenv for environment variables

---

## 📁 Project Structure
```
aejs/
│
├── controllers/
│ └── submissionController.js
├── middleware/
│ └── errorMiddleware.js
├── models/
│ └── Submission.js
├── services/
│ └── LightXService.js
├── views/
│ ├── index.ejs
│ ├── submissions.ejs
│ └── partials/
├── public/
│ └── css, js, images
├── routes/
│ └── submissionRoutes.js
├── app.js / server.js
├── package.json
└── .env
```


---

## ⚡ Installation

1. Clone the repository:

```bash
git clone https://github.com/adityap5/faceswap.git
cd faceswap
```

Install dependencies:
```
npm install
```
Create a .env file in the root:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
LIGHTX_API_KEY=your_lightx_api_key
```
Start the server:
```
npm run dev
```
The server will run at http://localhost:3000

---
📝 Usage
-
Open the web app in your browser.

Fill out the form with Name, Email, Phone Number.

Upload the Original Image and Style Image.

Accept the Terms & Conditions and click Swap Face.

After processing, view your swapped image and download it.

Navigate to /submissions to see all previous submissions.

⚠️ Notes
Ensure the image size does not exceed 5 MB.

Phone number must be exactly 10 digits.

The LightX API requires images to be uploaded via the ImageUpload API; external URLs are not supported.

API-generated image URLs expire after 24 hours.

---
🛡 Error Handling
-
Validates user input on both frontend and backend.

Displays form errors and API errors with clear messages.

Logs all errors to the console for debugging.

---
🔗 Useful Links
-
LightX AI Face Swap API Documentation

Bootstrap 5 Documentation

Font Awesome

💻 License
This project is MIT Licensed.