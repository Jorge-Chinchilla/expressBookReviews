const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username && password){
        if (!isValid(username)){
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    } else {
        return res.status(404).json({message: "Unable to register user."});
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const booksPromise = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(books);
            }, 100);
        });
        res.status(200).send(booksPromise);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:error.message});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const bookData = await new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject("Book not found.");
                }
            }, 100);
        });

        res.status(200).send(bookData);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const reqAuthor = req.params.author;
    try {
        const booksByAuthor = await new Promise((resolve, reject) => {
            setTimeout(() => {
                const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === reqAuthor.toLowerCase());
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found by this author.");
                }
            }, 100);
        });

        res.status(200).send(booksByAuthor);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const reqTitle = req.params.title;

    try {
        const booksByTitle = await new Promise((resolve, reject) => {
            setTimeout(() => {
                const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === reqTitle.toLowerCase());
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found with this title.");
                }
            }, 100);
        });

        res.status(200).send(booksByTitle);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const reqISBN = req.params.isbn;
    const filteredBook = books[reqISBN];

    if (filteredBook) {
        if (filteredBook.reviews) {
            res.send(filteredBook.reviews);
        } else {
            res.send("No reviews for the book: " + filteredBook.title)
        }
    } else {
        res.send(404).json({message: "Not Found"});
    }

});

module.exports.general = public_users;
