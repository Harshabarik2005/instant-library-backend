const { docClient } = require("../aws");
const { PutCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

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

async function updateRequestStatus(id, status) {
    await docClient.send(new UpdateCommand({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "set #s = :s",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":s": status },
    }));
}

module.exports = { addRequest, getRequests, updateRequestStatus };