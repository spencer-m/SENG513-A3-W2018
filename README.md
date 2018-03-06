# nanoCHAT
A simple chat app that uses JavaScript, Bootstrap, jQuery, Node.js and socket.io.

### Getting Started
Make sure to have Node.js installed on the computer to be used as a server for the application. A browser such as Google Chrome and Mozilla Firefox with JavaScript support should be sufficient enough to run the client side of the application.

### Installing

First, download or clone the repository.
Next, the dependencies have to be satisfied. This can be done by running:

```
npm install express --save
npm install body-parser --save
npm install socket.io --save
npm install socket.io-cookie-parser --save
```
The package.json file included will tell which version for each module is required.

### Running the app

Run the server using the index.js file.
```
node index.js
```
When all goes well, the server will tell it is ready.

Then, open up a browser and point to the localhost address at port 3000.
```
http://localhost:3000
```

### Screenshot

![Screenshot of App](screenshot.png?raw=true)

### Known Quirks

The app only implements a basic cookie. Running multiple instances of the app on the same machine will mess up the cookie.

Also, since there is no authentication, someone can steal the ownership of messages by hijacking another user's nickname.

### Built With

* [JavaScript](https://www.javascript.com/)
* [Bootstrap](https://getbootstrap.com/)
* [jQuery](https://jquery.com/)
* [Node.js](https://nodejs.org/en/)
* [socket.io](https://socket.io/)

### Authors

* Spencer Manzon

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
