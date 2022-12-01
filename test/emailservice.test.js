const email = require("../service/emailService");
const axios = require('axios');
const Pool = require("pg-pool");
const client = require("../service/database");

jest.mock('axios');

beforeAll(async () => {
    const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.HOST,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
        port: process.env.PORT,
        ssl: process.env.SSL ? true : false,
        max: 1, // Reuse the connection to make sure we always hit the same temporal schema
        idleTimeoutMillis: 0 // Disable auto-disconnection of idle clients to make sure we always hit the same temporal schema
    });

    client.end = () => {
        return pool.end();
    };

    client.query = (text, values) => {
        return pool.query(text, values);
    };
});

test('sending mail returns create status', async () => {
    axios.post.mockResolvedValue({
        data: {
            status: 'create',
            message: 'message sent <asdf-ölkj-asdf-ölkj>'
        }
    });

    const mail = await email.sendMail('joku@jossain.com', [{video : {identifier : "12312312312", title: "testivideo", archivedDate: "01.01.2021" }, series : {title : "koesarja"}}]);
    expect(mail.status).toBe('create');
})

afterAll( done => {
    client.end().then(done());
});

