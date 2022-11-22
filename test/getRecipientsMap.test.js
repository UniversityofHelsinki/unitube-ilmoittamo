const notify = require('../service/notify');
const apiService = require('../service/apiService');


afterAll(async () => {
    jest.clearAllMocks();
});

jest.mock('../service/apiService');


describe('Recipients tests', () => {
    it('getRecipientsMap returns only unique recipients with one video with same contributor assigned directly and by group', async () => {

        const videosToSendNotification = {
            "command": "SELECT",
            "rowCount": 1,
            "oid": null,
            "rows": [
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99",
                    "archived_date": "15.02.2023"
                },
            ]
        };

        apiService.getSeries.mockResolvedValue({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f9507b95',
                title: 'joku sarja',
                contributors: ['grp-mansikanpoimijat', 'mansikka']
            }
        });

        apiService.getEvent.mockResolvedValue({
            status: 200,
            data: {
                identifier: 'cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99',
                title: 'joku video',
            }
        });

        apiService.getRecipients.mockResolvedValue({
            status: 200,
            data: {
                "group": "grp-mansikanpoimijat",
                "members": [
                    "mustikka",
                    "mansikka",
                    "puolukka",
                    "karpalo",
                    "mesimarja",
                    "vadelma",
                    "mustaherukka"
                ]
            }
        });


        const recipientsInMap = await notify.getRecipientsMap(videosToSendNotification);
        expect(recipientsInMap.size).toEqual(7);
        expect(recipientsInMap.has("mansikka@ad.helsinki.fi")).toBe(true);
        expect(recipientsInMap.get("mansikka@ad.helsinki.fi").length).toEqual(1);
        expect(recipientsInMap.get('mansikka@ad.helsinki.fi')[0].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99');
        expect(recipientsInMap.get('mansikka@ad.helsinki.fi')[0].video.title).toEqual('joku video');
    });


    it('getRecipientsMap returns only unique recipients with two videos with same contributor assigned directly and by group', async () => {

        const videosToSendNotification = {
            "command": "SELECT",
            "rowCount": 2,
            "oid": null,
            "rows": [
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99",
                    "archived_date": "15.02.2023"
                },
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b98",
                    "archived_date": "15.02.2022"
                }
            ]
        };


        apiService.getSeries.mockResolvedValue({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f9507b95',
                title: 'joku sarja',
                contributors: ['grp-mansikanpoimijat', 'mansikka']
            }
        });

        apiService.getEvent.mockResolvedValue({
            status: 200,
            data: {
                identifier: 'cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99',
                title: 'joku video',
            }
        });

        apiService.getRecipients.mockResolvedValue({
            status: 200,
            data: {
                "group": "grp-mansikanpoimijat",
                "members": [
                    "mustikka",
                    "mansikka",
                    "puolukka",
                    "karpalo",
                    "mesimarja",
                    "vadelma",
                    "mustaherukka"
                ]
            }
        });


        const recipientsInMap = await notify.getRecipientsMap(videosToSendNotification);
        expect(recipientsInMap.size).toEqual(7);
        expect(recipientsInMap.has("mansikka@ad.helsinki.fi")).toBe(true);
        expect(recipientsInMap.get('mansikka@ad.helsinki.fi')[0].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99');
        expect(recipientsInMap.get('mansikka@ad.helsinki.fi')[0].video.title).toEqual('joku video');
        expect(recipientsInMap.get("mansikka@ad.helsinki.fi").length).toEqual(2);
    });
});
