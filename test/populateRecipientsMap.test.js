const notify = require('../service/notify');

let recipientsMap =  new Map();
let recipient = ['mvheikki@ad.helsinki.fi', []];
let videoData =
    {
        "identifier": "9a00aa43-8526-4fe1-8fbb-2c7927581306",
        "creator": "Opencast Project Administrator",
        "presenter": [],
        "created": "2022-10-31T11:38:00Z",
        "is_part_of": "4584c7c9-eb9a-43ed-9f75-5c73f6a0159b",
        "subjects": [],
        "start": "2022-10-31T11:38:00Z",
        "description": "kuvaus",
        "language": "",
        "source": "",
        "title": "video.mp4",
        "processing_state": "SUCCEEDED",
        "duration": 0,
        "license": "CC-BY",
        "archive_version": 8,
        "contributor": [],
        "series": "AntinSarja",
        "has_previews": true,
        "location": "",
        "rightsholder": "",
        "publication_status": [
            "internal",
            "api",
            "oaipmh-default",
            "engage-player"
        ],
        "status": "EVENTS.EVENTS.STATUS.PROCESSED"
    };
let seriesData = {
    "identifier": "4584c7c9-eb9a-43ed-9f75-5c73f6a0159b",
    "creator": "Opencast Project Administrator",
    "opt_out": false,
    "created": "2022-06-10T09:25:10Z",
    "subjects": [],
    "description": "Mun oma",
    "language": "",
    "title": "AntinSarja",
    "license": "",
    "organization": "mh_default_org",
    "organizers": [],
    "publishers": [],
    "contributors": [
        "grp-a02700-ohtu",
        "grp-tike-tiha",
        "baabenom",
        "anttilan",
        "tiinasil"
    ],
    "rightsholder": ""
};
let video = {
    "video_id": "9a00aa43-8526-4fe1-8fbb-2c7927581306",
    "archived_date": "22.02.2023"
};

test('populateRecipientsMap creates new recipient if it does not exist', async () => {

    const recipientsInMap = notify.populateRecipientsMap(recipientsMap, recipient, videoData, seriesData, video);

    expect(recipientsInMap.size).toEqual(1);
    const arr1 = [...recipientsInMap][0];
    expect(arr1[0]).toEqual('mvheikki@ad.helsinki.fi');
    const archivedDate = arr1[1][0].video.archivedDate;
    expect(archivedDate).toEqual('22.02.2023');
    const title = arr1[1][0].series.title;
    expect(title).toEqual('AntinSarja');
})

test('populateRecipientsMap adds data if recipient exists', async () => {
    recipientsMap.set('mvheikki@ad.helsinki.fi', [{hip: 'hop', pim: 'pom'}]);
    const recipientsInMap = notify.populateRecipientsMap(recipientsMap, recipient, videoData, seriesData, video);

    expect(recipientsInMap.size).toEqual(1);
    const arr1 = [...recipientsInMap][0];
    expect(arr1[0]).toEqual('mvheikki@ad.helsinki.fi');
    const pim = arr1[1][0].pim;
    expect(pim).toEqual('pom');
    const archivedDate = arr1[1][1].video.archivedDate;
    expect(archivedDate).toEqual('22.02.2023');
})
