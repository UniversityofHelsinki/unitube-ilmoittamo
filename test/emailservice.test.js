const email = require("../service/emailService");
const axios = require('axios');

jest.mock('axios');

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
