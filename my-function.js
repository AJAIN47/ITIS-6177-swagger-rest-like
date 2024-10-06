export const handler = async (event) => {

    const keyword = event.queryStringParameters?.keyword || "World"; // Use optional chaining
    const name = "Alish Jain"

    if (!keyword) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Keyword is required" }),
        };
    }

    const responseMessage = `${name} says ${keyword}`;

    return {
        statusCode: 200,
        body: JSON.stringify(responseMessage),
    };
};