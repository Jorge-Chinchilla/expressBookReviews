const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userExists = users.filter(user => user.username === username);

    if (userExists > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter(user =>{
        return (user.username === username && user.password === password);
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message:"Error logging in"});
    }

    if(authenticatedUser(username, password)){
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60*5 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message:"Invalid username or password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.body.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({message:"Book not found"});
    }
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    if (!reviewText) {
        return res.status(400).json({ message: "Review content is required" });
    }
    books[isbn].reviews[username] = reviewText;
    console.log(books[isbn]);
    return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
