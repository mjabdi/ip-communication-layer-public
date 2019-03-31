"use strict";

class Message
{
    constructor(payload)
    {
        this.id = null;
        this.payload = payload;
        this.timestamp = new Date();
        this.status = 'new';
    }
}

module.exports = Message;
