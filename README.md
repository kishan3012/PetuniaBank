# PetuniaBank 🌸🏦

![PetuniaBank](https://img.shields.io/badge/PetuniaBank-v1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v14.17.0-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v13.3-orange.svg)

Welcome to **PetuniaBank**, a simple home banking web application designed to make your banking experience seamless and secure. This project showcases our efforts during our internship at Remira S.r.l. It features OAuth2 login, user and roles management, and a comprehensive unit test suite to ensure reliability and performance.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Testing](#testing)
6. [Contributing](#contributing)
7. [License](#license)
8. [Contact](#contact)

## Features

- **OAuth2 Login**: Secure login using industry-standard OAuth2 protocols.
- **User Management**: Create, read, update, and delete user profiles.
- **Role Management**: Assign roles to users for different levels of access.
- **Unit Tests**: Full unit test suite to ensure the application works as intended.
- **Responsive Design**: Built with Bootstrap 5 for a smooth user experience on all devices.
- **Interactive Charts**: Visualize data with Chart.js for better insights.

## Technologies Used

This project leverages a variety of technologies to deliver a robust application:

- **Node.js**: JavaScript runtime for building scalable network applications.
- **Express.js**: Fast web framework for Node.js to build APIs.
- **PostgreSQL**: Powerful, open-source object-relational database system.
- **EJS**: Templating engine for rendering HTML views.
- **Dotenv**: Module to load environment variables from a `.env` file.
- **Jest**: JavaScript testing framework for unit tests.
- **Selenium**: Tool for automating web applications for testing purposes.
- **Bootstrap 5**: CSS framework for responsive design.
- **Chart.js**: JavaScript library for creating dynamic charts.

## Installation

To get started with PetuniaBank, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kishan3012/PetuniaBank.git
   cd PetuniaBank
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your environment variables. You can refer to the `.env.example` file for guidance.

4. **Set up the PostgreSQL database**:
   Ensure you have PostgreSQL installed and create a database for the application. Update the database connection details in your `.env` file.

5. **Run the application**:
   ```bash
   npm start
   ```

6. **Visit the application**:
   Open your browser and navigate to `http://localhost:3000`.

## Usage

Once the application is running, you can:

- Register a new account or log in using OAuth2.
- Manage your user profile and roles.
- View and interact with your banking data using charts.

For detailed usage instructions, please refer to the [documentation](https://github.com/kishan3012/PetuniaBank/releases).

## Testing

To run the test suite, use the following command:

```bash
npm test
```

This command will execute all unit tests defined in the project. Ensure that your test environment is properly configured.

## Contributing

We welcome contributions to PetuniaBank! If you have suggestions for improvements or new features, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your forked repository.
5. Open a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please reach out to us through the issues section of the repository or via email.

You can also check the [Releases](https://github.com/kishan3012/PetuniaBank/releases) section for the latest updates and downloadable files.

Thank you for visiting the PetuniaBank repository! We hope you find it useful and informative.