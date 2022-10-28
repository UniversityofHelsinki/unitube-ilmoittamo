const email = require("../service/emailService");

test('dummy test', () => {
    expect(1).toBe(1);
});

test('send mail', async () => {
     const mail = await email.sendMail('joku@jossain.com', 'kumma sarja', 'videon nimi', '12.2.2022');
     expect(mail.status).toBe('create');
})
