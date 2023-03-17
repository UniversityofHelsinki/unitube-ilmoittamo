const email = require("../service/emailService");
const axios = require('axios');
const Pool = require("pg-pool");
const client = require("../service/database");
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

//const payloadStr =
//'[{"video":{"identifier":"3b6c1738-4527-413b-9e31-da67bfcd41a6","title":"sample_mp4_file_small.mp4","archivedDate":"28.02.2023"},"series":{"title":"AnttiUusi"},"groups":["grp-a02700-ohtu","grp-tike-tira"]},{"video":{"identifier":"5b63b31c-3a99-4d34-902d-c9c82bf7e9ad","title":"video.mp4","archivedDate":"27.02.2023"},"series":{"title":"AnttiUusi"},"groups":["grp-a02700-ohtu","grp-tike-tira"]}]';
  //  [{"video":{"identifier":"3b6c1738-4527-413b-9e31-da67bfcd41a6","title":"sample_mp4_file_small.mp4","archivedDate":"28.02.2023"},"series":{"title":"AnttiUusi"},"groups":["grp-a02700-ohtu","grp-tike-tira"]}','{"video":{"identifier":"5b63b31c-3a99-4d34-902d-c9c82bf7e9ad","title":"video.mp4","archivedDate":"27.02.2023"},"series":{"title":"AnttiUusi"},"groups":["grp-a02700-ohtu","grp-tike-tira"]}];

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


xtest('sending mail returns create status', async () => {
    await client.query('CREATE TEMPORARY TABLE email_templates(id SERIAL NOT NULL, name VARCHAR(255) UNIQUE NOT NULL, description VARCHAR(255), subject VARCHAR(255), header_fi TEXT, footer_fi TEXT, header_sv TEXT, footer_sv TEXT, header_en TEXT, footer_en TEXT, modified TIMESTAMP, PRIMARY KEY(id))');
    await wait(100);
    await client.query('INSERT INTO email_templates (id, name, description, subject, header_fi, footer_fi, header_sv, footer_sv, header_en, footer_en, modified) ' +
        'VALUES (\'1\', \'Vanhenemisviesti\', \'Viesti tallenteiden vanhenemisesta\', \'Unitube: sinulla on vanhenevia tallenteita / you have expiring videos / du har videon som går ut\n' +
        '\n' +
        'Scroll down for English / För svenska, se nedan\n\', \'Hei!\n' +
        '\n' +
        'Saat tämän viestin, koska olet Helsingin yliopiston Unitube-palvelussa yhden tai useamman vanhenevan videotallenteen hallinnoija.\n' +
        '\n' +
        'Olet tallenteen hallinnoija silloin, jos olet itse lisännyt ja julkaissut videon jossakin Unitube-videosarjassa. Voit olla hallinnoija myös siinä tapauksessa, että joku muu on merkinnyt sinut tai ryhmän, johon kuulut, hallinnoijaksi johonkin tallennesarjaan Unitube-lataamopalvelussa.\n' +
        '\n' +
        'Seuraavan tai seuraavien Unitube-tallenteiden voimassaolo on päättymässä pian:\n\', \'Kaikilla Unitube-tallenteilla on voimassaoloaika, jonka jälkeen ne poistuvat palvelusta. Voimassaoloaika on aina korkeintaan kolme vuotta kerrallaan. Jos haluat, voit jatkaa itse hallinnoimiesi tallenteiden voimassaoloa Unitube-lataamossa osoitteessa https://lataamo.helsinki.fi.\n' +
        '\n' +
        'Voit lajitella hallinnoimasi tallenteet Unitube-lataamon voimassaolon mukaan. Klikkaamalla tallennetta pääset muokkaamaan sen asetuksia kuten voimassaolopäivää. Voit myös asettaa kerralla saman voimassaolopäivän kaikille yhden hallinnoimasi videosarjasi tallenteille sarjavälilehdeltä.\n' +
        '\n' +
        'Lisää ohjeita ja yhteystietoja:\n' +
        'https://helpdesk.it.helsinki.fi/help/10654\', \'header_sv\', \'footer_sv\', \'header_en\', \'footer_en\',  \'2008-01-01\'::date)');

    axios.post.mockResolvedValue({
        data: {
            status: 'create',
            message: 'message sent <asdf-ölkj-asdf-ölkj>'
        }
    });

    const mail = await email.sendMail('joku@jossain.com', [{video : {identifier : "12312312312", title: "testivideo", archivedDate: "01.01.2021" }, series : {title : "koesarja"}}]);

    await client.query('DROP TABLE pg_temp.email_templates');
})

afterAll( done => {
    client.end().then(done());
});

