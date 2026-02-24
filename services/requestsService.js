const { docClient } = require("../aws");
const { PutCommand, ScanCommand, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE = "Requests";

async function addRequest(request) {
    await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: request,
    }));
}

async function getRequests() {
    const data = await docClient.send(new ScanCommand({
        TableName: TABLE,
    }));
    return data.Items || [];
}

async function getRequestById(id) {
    const data = await docClient.send(new GetCommand({
        TableName: TABLE,
        Key: { id },
    }));
    return data.Item || null;
}

async function updateRequestStatus(id, status) {
    await docClient.send(new UpdateCommand({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "set #s = :s",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":s": status },
    }));
}

module.exports = { addRequest, getRequests, getRequestById, updateRequestStatus };