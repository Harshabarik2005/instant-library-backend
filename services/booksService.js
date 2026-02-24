const { docClient } = require("../aws");
const { PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE = "Books";

async function addBook(book) {
    await docClient.send(
        new PutCommand({
            TableName: TABLE,
            Item: book,
        })
    );
}

async function deleteBook(id) {
    await docClient.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: { id },
        })
    );
}

async function getBooks(filters = {}) {
    const { search, author, subject, available } = filters;

    const params = {
        TableName: TABLE,
    };

    const filterExpressions = [];
    const expressionAttributeValues = {};

    if (search) {
        filterExpressions.push("contains(title, :search)");
        expressionAttributeValues[":search"] = search;
    }

    if (author) {
        filterExpressions.push("contains(authors, :author)");
        expressionAttributeValues[":author"] = author;
    }

    if (subject) {
        filterExpressions.push("contains(subjects, :subject)");
        expressionAttributeValues[":subject"] = subject;
    }

    if (available === "true" || available === true) {
        filterExpressions.push("copiesAvailable > :zero");
        expressionAttributeValues[":zero"] = 0;
    }

    if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const data = await docClient.send(new ScanCommand(params));
    return data.Items || [];
}

module.exports = { addBook, deleteBook, getBooks };