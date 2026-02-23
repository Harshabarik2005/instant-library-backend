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

async function getBooks(filters = {}) {
    const { search, author, subject, available } = filters;

    // Performance Considerations:
    // DynamoDB Scan operations read the entire table before applying filters. 
    // This can be slow and expensive for large tables.
    // For large-scale applications with frequent filtering, consider using Global Secondary Indexes (GSIs) 
    // or a dedicated search service like OpenSearch for better performance.

    const params = {
        TableName: TABLE,
    };

    const filterExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // FilterExpression: A string that contains conditions that DynamoDB applies after the Scan operation, 
    // but before the data is returned to you. Items that do not satisfy the FilterExpression are discarded.

    // ExpressionAttributeValues: A map that substitutes placeholders (like :search) in the 
    // FilterExpression with actual values. This prevents literal values from being interpreted as syntax 
    // and protects against injection.

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
        // Combine multiple filters using AND operator
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = expressionAttributeValues;

        // title is not a reserved word but sometimes it's good practice to use ExpressionAttributeNames
        // We will just use the values since we didn't specify names, 
        // wait, let's keep it simple unless it complains. 'title', 'authors', 'subjects', 'copiesAvailable' are generally fine.
    }

    const data = await docClient.send(new ScanCommand(params));
    return data.Items || [];
}

module.exports = { addBook, getBooks };