# Frontend

This folder includes the frontend of Cortado. 

## Getting started

Install [Node.js](https://nodejs.org/en/) and run the following commands afterwards:

```
npm install
npm run start
```

You should now be able to see the frontend of Cortado at http://localhost:4444.


## Managing dependencies

The frontend uses two different frameworks - [Angular](https://angular.io/) and [Electron](https://www.electronjs.org/). Angular is the web application framework. The web application is wrapped into a desktop application using Electron. Both frameworks allow the usage of external dependencies using the Node.js package manager `npm`. These dependencies are stored in a single configuration file - `package.json`.

When building the productive application, we want to ensure that the application bundle only includes required dependencies. As Angular dependencies are bundled via webpack, we do not want to include them. Hence, dependencies that are only used in the Angular codebase should be included under the `devDependencies` keyword in the `package.json`-file. All dependencies that are used in the Electron codebase must be included under the `dependencies` keyword.


