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

    const mail = await email.sendMail('joku@jossain.com', 'sarjan nimi', 'videon nimi', '12.2.2022');
    expect(mail.status).toBe('create');
})
