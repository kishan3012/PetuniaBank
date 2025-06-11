# 📊 Petunia Bank

## 🧱 Frameworks

| Framework   | Description                                                        |
|-------------|--------------------------------------------------------------------|
| [Node.js](https://nodejs.org/) | JavaScript runtime environment for executing server-side code |
| [Express](https://expressjs.com/) | Fast and minimalist Node.js web framework for APIs            |

---

## 📚 Libraries

| Library   | Description                                                        |
|-----------|--------------------------------------------------------------------|
| [Bootstrap](https://getbootstrap.com/) | Frontend CSS framework for responsive design                  |
| [Chart.js](https://www.chartjs.org/) | JavaScript library for building beautiful charts              |
| [express-openid-connect](https://www.npmjs.com/package/express-openid-connect) | Middleware for integrating OAuth2 authentication with Auth0   |

---

## 🔐 Authentication

| Method              | Description                                                                                      |
|---------------------|--------------------------------------------------------------------------------------------------|
| **OAuth2 with Auth0** | Secure user authentication is implemented using the `express-openid-connect` library, which integrates OAuth2 with the [Auth0](https://auth0.com/) identity platform. Users can log in using Auth0’s hosted login page, providing robust security and ease of integration. |

---

## 🧾 Templating

| Engine | Description                                                           |
|--------|-----------------------------------------------------------------------|
| [EJS](https://ejs.co/) | Embedded JavaScript templates for rendering HTML on the server |

---

## 🌐 Environment Management

| Tool | Description                                                           |
|------|-----------------------------------------------------------------------|
| [dotenv](https://www.npmjs.com/package/dotenv) | Loads environment variables from a `.env` file into `process.env` |

---

## 🧪 Testing

| Tool | Description                                                           |
|------|-----------------------------------------------------------------------|
| [Jest](https://jestjs.io/) | JavaScript testing framework for unit and integration tests   |
| [Selenium](https://www.selenium.dev/) | Front-end testing framework for various languages             |

---

## 🗄️ Database

| Database | Description                                                           |
|----------|-----------------------------------------------------------------------|
| [PostgreSQL](https://www.postgresql.org/) | Powerful, open-source relational database system              |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install pg
npm install express
npm install express-openid-connect    
npm install dotenv
npm install path

# Run tests
npx jest