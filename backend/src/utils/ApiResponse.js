class ApiResponse {
    constructor(
        statusCode,
        data,
        message = "success",
        source = 'db',
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message
        this.source = source;
        this.success = this.statusCode < 400
    }
}

export default ApiResponse