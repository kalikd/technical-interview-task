# MP3 File Analysis App

## Description

This application provides an API endpoint to upload MP3 files and returns the number of frames within the file. It's built using Node.js and TypeScript, specifically designed to handle MPEG Version 1 Audio Layer 3 files.

## Setup

To get started, clone the repository and install the dependencies.

```bash
git clone https://github.com/kalikd/technical-task.git
cd technical-task
npm install
```


## Building the Application

The application uses TypeScript, which needs to be compiled to JavaScript before it can be run. Use the following npm script to compile the TypeScript code:

```bash
npm run build
```
This command compiles the TypeScript files in the src directory and outputs the JavaScript files to the dist directory, as configured in `tsconfig.json`.

## Running the Application

After building the application, you can start it with:

```bash
npm start
```

For development purposes, you can also use the dev script to run the application with nodemon, which will automatically restart the server on code changes:
```bash
npm run dev
```

