# Rishi backend-Project

## Description
02Project is a backend application designed to handle various functionalities such as user authentication, video management, and subscription handling. It is built using Node.js and follows a modular architecture for scalability and maintainability.

## Features
- User authentication and authorization
- Video upload and management
- Subscription handling
- Middleware for file uploads (Multer)
- Cloudinary integration for media storage
- Validators for email and password
- Error handling with custom `ApiError` and `ApiResponse` utilities

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (local or cloud instance)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Rishi-Rijal/02Project.git
   ```

2. Navigate to the project directory:
 ```bash
   cd 02Project
```

3. Install dependencies:
```bash
    npm install
```


## Configuration
### Create a .env file in the root directory and add the following environment variables:
```bash
PORT=3000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```


## Usage
### Start the development server:
```bash
npm run dev
```

### Access the application at http://localhost:3000
<pre>
   

backend-project/
├── package.json
├── readme.md
├── public/
│   └── temp/
├── src/
│   ├── app.js
│   ├── constants.js
│   ├── index.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── db/
│   │   └── index.js
│   ├── middlewares/
│   │   └── multer.middleware.js
│   ├── models/
│   │   ├── subscription.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   └── validators/
│       ├── emailValidator.js
│       └── passwordValidator.js
└── ...
</pre>


## Scripts
```bash
npm run dev: Start the development server
npm start: Start the production server
```
## Dependencies
Express
Mongoose
Multer
Cloudinary

## Dev Dependencies
Nodemon

## License
This project is licensed under the MIT License.
