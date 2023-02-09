# MongoDB BaseAPI NodeJS

## Description

It is an example of a simple API using NodeJS, Express and MongoDB. Mongoose, nodemon, and dotenv packages are also used. It contains basic used functions for a new project.

## Installation

NodeJS must be installed for the project to work.

- Download and install **node** (and **npm**): https://nodejs.org/en/
- Postman can be downloaded for API control:
https://www.postman.com/downloads/
You can also use the collection set in the `public/Postman_collection.json` file.
- Make sure you have an editor (I used VSCode: https://code.visualstudio.com/)


### Install dependencies

Open a terminal or command prompt inside the project folder, then install the dependencies.

```Bash
# Follow this command to add the node_modules folder.
$ npm install
```

### Start the API

```Bash
# Follow this command to run the API.
$ npm start
```

### Sending request

Try the following url with Postman.
```bash
http://localhost:5000/api/login

Parameters:
{
    "email":"halil-kaplan@windowslive.com",
    "password":"123456"
}
```
![Postman Screen](./public/postmanScreen.jpg)


### MongoDB collections
`users`
![Postman Screen](./public/dbCollection.jpg)