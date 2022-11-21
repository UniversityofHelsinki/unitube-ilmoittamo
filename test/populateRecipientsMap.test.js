const notify = require('../service/notify');

test('notify.populateRecipientsMap', async () => {

    let recipientsMap =  new Map();
    let recipient = 'mvheikki@ad.helsinki.fi';
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

    const recipientsInMap = notify.populateRecipientsMap(recipientsMap, recipient, videoData, seriesData, video);

    expect(recipientsInMap.size).toEqual(1);
    const arr1 = [...recipientsMap][0];
    expect(arr1[0]).toEqual('mvheikki@ad.helsinki.fi');
    const arr2 = [...arr1][1];
    const arr3 = [...arr2][0];
    const archivedDate = arr3.video.archivedDate;
    expect(archivedDate).toEqual('22.02.2023');
    const title = arr3.series.title;
    expect(title).toEqual('AntinSarja');
})
