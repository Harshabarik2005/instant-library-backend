const { docClient } = require("../aws");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE = "Books";

async function addBook(book) {
    await docClient.send(
        new PutCommand({
            TableName: TABLE,
            Item: book,
        })
    );
}

async function getBooks() {
    const data = await docClient.send(
        new ScanCommand({
            TableName: TABLE,
        })
    );
    return data.Items || [];
}

module.exports = { addBook, getBooks };