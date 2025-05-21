# Eye Care

An application to help manage screen time and remind users to take breaks.

## Features

- Timer to track screen time.
- Reminders to take breaks at configurable intervals.
- Customizable settings for timer duration and break frequency.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js and npm (or yarn) installed on your system.

### Installing

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd eye-care
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   or if you use yarn:
   ```bash
   yarn install
   ```

### Running the Application (Development)

To start the application in development mode, run:

```bash
npm start
```

This will launch the Electron application.

## Building the Application

To build the application into a distributable executable, run:

```bash
npm run dist
```

This will create the distributable files in the `dist` directory.

## Technologies Used

- [Electron](https://www.electronjs.org/) - Framework for creating native applications with web technologies like JavaScript, HTML, and CSS.
- [Node.js](https://nodejs.org/) - JavaScript runtime environment.
- [electron-builder](https://www.electron.build/) - A complete solution to package and build a ready for distribution Electron app for macOS, Windows and Linux.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details (or check `package.json`).
